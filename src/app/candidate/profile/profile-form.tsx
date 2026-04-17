"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { saveCandidateProfile, savePersonalInfo } from "@/lib/actions";
import { useAction } from "@/hooks/use-action";

const ENGAGEMENT_OPTIONS = [
  { value: "full-time", label: "Найм в штат (full-time)" },
  { value: "mentor", label: "Ментор" },
  { value: "consultant", label: "Консультант / Advisor" },
  { value: "board", label: "Advisory Board" },
];

type Profile = {
  currentTitle: string;
  functionalFocus: string;
  industry: string;
  yearsExperience: number;
  achievements: string;
  salaryMin: number;
  salaryMax: number;
  locationPref: string;
  engagementFormats: string;
  firstName: string | null;
  lastName: string | null;
  currentCompany: string | null;
  phone: string | null;
  linkedinUrl: string | null;
};

export function CandidateProfileForm({ profile, userId }: { profile: Profile; userId: string }) {
  const saveProf = useAction(
    (fd: FormData) => saveCandidateProfile(fd, userId, true),
    { successMessage: "Профиль сохранён" }
  );
  const saveContact = useAction(
    (fd: FormData) => savePersonalInfo(fd, userId),
    { successMessage: "Контакты сохранены" }
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Профессиональная информация</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => { e.preventDefault(); saveProf.run(new FormData(e.currentTarget)); }}
            className="space-y-5"
          >
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="currentTitle">Текущая должность</Label>
                <Input id="currentTitle" name="currentTitle" defaultValue={profile.currentTitle} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="functionalFocus">Функциональный фокус</Label>
                <Input id="functionalFocus" name="functionalFocus" defaultValue={profile.functionalFocus} required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="industry">Отрасль</Label>
                <Input id="industry" name="industry" defaultValue={profile.industry} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="yearsExperience">Лет опыта</Label>
                <Input id="yearsExperience" name="yearsExperience" type="number" defaultValue={profile.yearsExperience} required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="achievements">Ключевые достижения</Label>
              <Textarea id="achievements" name="achievements" rows={4} defaultValue={profile.achievements} required />
            </div>
            <div className="space-y-2">
              <Label>Ожидания по компенсации (руб/год)</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="salaryMin" className="text-xs text-muted-foreground">От</Label>
                  <Input id="salaryMin" name="salaryMin" type="number" defaultValue={profile.salaryMin} required />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="salaryMax" className="text-xs text-muted-foreground">До</Label>
                  <Input id="salaryMax" name="salaryMax" type="number" defaultValue={profile.salaryMax} required />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="locationPref">Локация</Label>
              <Input id="locationPref" name="locationPref" defaultValue={profile.locationPref} required />
            </div>

            <div className="space-y-3">
              <Label>Форматы взаимодействия</Label>
              <p className="text-xs text-muted-foreground">Выберите один или несколько форматов, в которых вы готовы работать</p>
              <div className="grid grid-cols-2 gap-2">
                {ENGAGEMENT_OPTIONS.map(({ value, label }) => (
                  <label
                    key={value}
                    className="flex items-center gap-2 p-3 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors"
                  >
                    <input
                      type="checkbox"
                      name="engagementFormats"
                      value={value}
                      defaultChecked={profile.engagementFormats.split(",").includes(value)}
                      className="h-4 w-4"
                    />
                    <span className="text-sm">{label}</span>
                  </label>
                ))}
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={saveProf.isPending}>
              {saveProf.isPending ? "Сохраняем..." : "Сохранить"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Контактные данные</CardTitle>
          <p className="text-sm text-muted-foreground">Видны компаниям только после взаимного мэтча</p>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => { e.preventDefault(); saveContact.run(new FormData(e.currentTarget)); }}
            className="space-y-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Имя</Label>
                <Input id="firstName" name="firstName" defaultValue={profile.firstName ?? ""} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Фамилия</Label>
                <Input id="lastName" name="lastName" defaultValue={profile.lastName ?? ""} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="currentCompany">Текущая компания</Label>
              <Input id="currentCompany" name="currentCompany" defaultValue={profile.currentCompany ?? ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Телефон</Label>
              <Input id="phone" name="phone" type="tel" defaultValue={profile.phone ?? ""} placeholder="+7 900 000-00-00" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="linkedinUrl">LinkedIn</Label>
              <Input id="linkedinUrl" name="linkedinUrl" type="url" defaultValue={profile.linkedinUrl ?? ""} placeholder="https://linkedin.com/in/..." />
            </div>
            <Button type="submit" className="w-full" disabled={saveContact.isPending}>
              {saveContact.isPending ? "Сохраняем..." : "Сохранить контакты"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
