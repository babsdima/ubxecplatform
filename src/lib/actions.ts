"use server";

import { signIn, signOut } from "./auth";
import { prisma } from "./db";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { AuthError } from "next-auth";
import { sendMutualMatchEmail } from "./email";

export async function loginAction(formData: FormData) {
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo: "/",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Неверный email или пароль" };
    }
    throw error;
  }
}

export async function registerAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const role = formData.get("role") as string;

  if (!email || !password || !role) {
    return { error: "Заполните все поля" };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "Пользователь с таким email уже существует" };
  }

  const hashed = await bcrypt.hash(password, 10);
  await prisma.user.create({ data: { email, password: hashed, role } });

  await signIn("credentials", {
    email,
    password,
    redirectTo: role === "CANDIDATE" ? "/candidate/onboarding" : "/company/onboarding",
  });
}

export async function logoutAction() {
  await signOut({ redirectTo: "/" });
}

export async function saveCandidateProfile(formData: FormData, userId: string, isEdit = false) {
  const formats = formData.getAll("engagementFormats") as string[];
  const data = {
    currentTitle: formData.get("currentTitle") as string,
    industry: formData.get("industry") as string,
    yearsExperience: parseInt(formData.get("yearsExperience") as string),
    achievements: formData.get("achievements") as string,
    salaryMin: parseInt(formData.get("salaryMin") as string),
    salaryMax: parseInt(formData.get("salaryMax") as string),
    locationPref: formData.get("locationPref") as string,
    functionalFocus: formData.get("functionalFocus") as string,
    engagementFormats: formats.length > 0 ? formats.join(",") : "full-time",
  };

  await prisma.candidateProfile.upsert({
    where: { userId },
    update: data,
    create: { userId, ...data },
  });

  if (isEdit) {
    revalidatePath("/candidate/profile");
    revalidatePath("/candidate/dashboard");
    return { success: "Профиль сохранён" };
  } else {
    redirect("/candidate/dashboard");
  }
}

export async function savePersonalInfo(formData: FormData, userId: string) {
  await prisma.candidateProfile.update({
    where: { userId },
    data: {
      firstName: (formData.get("firstName") as string) || null,
      lastName: (formData.get("lastName") as string) || null,
      currentCompany: (formData.get("currentCompany") as string) || null,
      phone: (formData.get("phone") as string) || null,
      linkedinUrl: (formData.get("linkedinUrl") as string) || null,
    },
  });
  revalidatePath("/candidate/profile");
  return { success: "Контакты сохранены" };
}

export async function saveCompanyProfile(formData: FormData, userId: string, isEdit = false) {
  const data = {
    companyName: formData.get("companyName") as string,
    industry: formData.get("industry") as string,
    size: formData.get("size") as string,
    description: formData.get("description") as string,
    website: (formData.get("website") as string) || null,
  };

  await prisma.companyProfile.upsert({
    where: { userId },
    update: data,
    create: { userId, ...data },
  });

  if (isEdit) {
    revalidatePath("/company/profile");
    revalidatePath("/company/dashboard");
    return { success: "Профиль сохранён" };
  } else {
    redirect("/company/dashboard");
  }
}

export async function createMandate(formData: FormData, companyId: string) {
  const mandate = await prisma.mandate.create({
    data: {
      companyId,
      title: formData.get("title") as string,
      industry: formData.get("industry") as string,
      salaryMin: parseInt(formData.get("salaryMin") as string),
      salaryMax: parseInt(formData.get("salaryMax") as string),
      description: formData.get("description") as string,
      requirements: formData.get("requirements") as string,
      isAnonymous: formData.get("isAnonymous") === "on",
      mandateType: (formData.get("mandateType") as string) || "full-time",
      status: "ACTIVE",
    },
  });

  await runMatching(mandate.id);
  redirect("/company/mandates");
}

export async function updateMandateStatus(mandateId: string, status: "ACTIVE" | "CLOSED" | "DRAFT") {
  await prisma.mandate.update({ where: { id: mandateId }, data: { status } });
  revalidatePath("/company/mandates");
  revalidatePath(`/company/mandates/${mandateId}`);
  return {
    success: status === "CLOSED" ? "Позиция закрыта" : "Позиция снова активна",
  };
}

export async function runMatching(mandateId: string) {
  const { computeMatches } = await import("./matching");
  await computeMatches(mandateId);
}

export async function expressInterest(matchId: string, role: "candidate" | "company") {
  if (role === "candidate") {
    await prisma.match.update({ where: { id: matchId }, data: { candidateInterest: true } });
  } else {
    await prisma.match.update({ where: { id: matchId }, data: { companyInterest: true } });
  }

  const match = await prisma.match.findUnique({
    where: { id: matchId },
    include: {
      candidate: { include: { user: true } },
      mandate: { include: { company: { include: { user: true } } } },
    },
  });

  if (match?.candidateInterest && match?.companyInterest) {
    await prisma.match.update({
      where: { id: matchId },
      data: { status: "MUTUAL", revealedAt: new Date() },
    });

    // Email-уведомления обеим сторонам
    if (match.candidate.user.email && match.mandate.company.user.email) {
      await sendMutualMatchEmail({
        candidateEmail: match.candidate.user.email,
        companyEmail: match.mandate.company.user.email,
        mandateTitle: match.mandate.title,
        companyName: match.mandate.isAnonymous
          ? "Компания"
          : match.mandate.company.companyName,
        candidateName: match.candidate.firstName
          ? `${match.candidate.firstName} ${match.candidate.lastName ?? ""}`.trim()
          : match.candidate.currentTitle,
      });
    }

    revalidatePath("/candidate/matches");
    revalidatePath(`/company/mandates/${match.mandateId}`);
    return { success: "Взаимный интерес! Контакты раскрыты." };
  }

  revalidatePath("/candidate/matches");
  revalidatePath(`/company/mandates/${match?.mandateId}`);
  return { success: "Интерес отмечен" };
}

export async function verifyCandidate(profileId: string, status: "VERIFIED" | "REJECTED", note?: string) {
  await prisma.candidateProfile.update({
    where: { id: profileId },
    data: { status, adminNote: note || null },
  });
  revalidatePath("/admin/candidates");
  return {
    success: status === "VERIFIED" ? "Кандидат верифицирован" : "Профиль отклонён",
  };
}
