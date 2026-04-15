"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { saveCompanyProfile } from "@/lib/actions";
import { useAction } from "@/hooks/use-action";

type Company = {
  companyName: string;
  industry: string;
  size: string;
  description: string;
  website: string | null;
};

export function CompanyProfileForm({ company, userId }: { company: Company; userId: string }) {
  const { run, isPending } = useAction(
    (fd: FormData) => saveCompanyProfile(fd, userId, true),
    { successMessage: "Профиль сохранён" }
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Редактировать данные</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={(e) => { e.preventDefault(); run(new FormData(e.currentTarget)); }}
          className="space-y-5"
        >
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="companyName">Название</Label>
              <Input id="companyName" name="companyName" defaultValue={company.companyName} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="industry">Отрасль</Label>
              <Input id="industry" name="industry" defaultValue={company.industry} required />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="size">Размер</Label>
            <select
              id="size"
              name="size"
              defaultValue={company.size}
              required
              className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="STARTUP">Стартап (до 50 чел)</option>
              <option value="SMALL">Малый бизнес (50–200)</option>
              <option value="MEDIUM">Средний бизнес (200–1000)</option>
              <option value="LARGE">Крупный (1000+)</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Описание</Label>
            <Textarea id="description" name="description" rows={4} defaultValue={company.description} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="website">Сайт</Label>
            <Input id="website" name="website" type="url" defaultValue={company.website ?? ""} placeholder="https://example.ru" />
          </div>

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "Сохраняем..." : "Сохранить изменения"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
