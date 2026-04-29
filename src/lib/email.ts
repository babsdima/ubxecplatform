import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

interface MutualMatchEmailParams {
  candidateEmail: string;
  companyEmail: string;
  mandateTitle: string;
  companyName: string;
  candidateName: string;
}

export async function sendMutualMatchEmail(params: MutualMatchEmailParams) {
  if (!resend) {
    // В dev без ключа просто логируем
    console.log("[Email] Mutual match:", params);
    return;
  }

  const { candidateEmail, companyEmail, mandateTitle, companyName, candidateName } = params;

  await Promise.allSettled([
    // Письмо кандидату
    resend.emails.send({
      from: "GradeUp <noreply@gradeup.ru>",
      to: candidateEmail,
      subject: `Взаимный интерес — позиция ${mandateTitle}`,
      html: `
        <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 24px;">
          <h1 style="font-size: 24px; font-weight: 700; margin-bottom: 8px;">GradeUp</h1>
          <h2 style="font-size: 18px; font-weight: 600; margin-bottom: 16px;">Взаимный интерес!</h2>
          <p style="color: #555; line-height: 1.6;">
            Компания <strong>${companyName}</strong> отметила интерес к вашему профилю
            по позиции <strong>${mandateTitle}</strong>.
          </p>
          <p style="color: #555; line-height: 1.6; margin-top: 12px;">
            Ваши контактные данные теперь видны компании. Войдите в платформу, чтобы увидеть детали.
          </p>
          <a href="${process.env.NEXTAUTH_URL}/candidate/matches"
             style="display: inline-block; margin-top: 24px; padding: 12px 24px;
                    background: #0f172a; color: #fff; text-decoration: none;
                    border-radius: 8px; font-weight: 600;">
            Открыть мэтчи
          </a>
          <p style="margin-top: 32px; color: #999; font-size: 12px;">
            GradeUp · Анонимный executive search
          </p>
        </div>
      `,
    }),

    // Письмо компании
    resend.emails.send({
      from: "GradeUp <noreply@gradeup.ru>",
      to: companyEmail,
      subject: `Взаимный интерес — кандидат на позицию ${mandateTitle}`,
      html: `
        <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 24px;">
          <h1 style="font-size: 24px; font-weight: 700; margin-bottom: 8px;">GradeUp</h1>
          <h2 style="font-size: 18px; font-weight: 600; margin-bottom: 16px;">Взаимный интерес!</h2>
          <p style="color: #555; line-height: 1.6;">
            Кандидат <strong>${candidateName}</strong> также отметил интерес к позиции
            <strong>${mandateTitle}</strong>.
          </p>
          <p style="color: #555; line-height: 1.6; margin-top: 12px;">
            Контактные данные кандидата теперь доступны на платформе.
          </p>
          <a href="${process.env.NEXTAUTH_URL}/company/mandates"
             style="display: inline-block; margin-top: 24px; padding: 12px 24px;
                    background: #0f172a; color: #fff; text-decoration: none;
                    border-radius: 8px; font-weight: 600;">
            Открыть позицию
          </a>
          <p style="margin-top: 32px; color: #999; font-size: 12px;">
            GradeUp · Анонимный executive search
          </p>
        </div>
      `,
    }),
  ]);
}
