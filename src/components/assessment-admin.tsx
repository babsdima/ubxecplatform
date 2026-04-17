"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { saveAssessmentResults } from "@/lib/actions";
import { useAction } from "@/hooks/use-action";

const ASSESSMENT_TYPES = [
  { value: "HOGAN", label: "Hogan" },
  { value: "DISC", label: "DISC" },
  { value: "MBTI", label: "MBTI" },
];

type AssessmentData = {
  type: string;
  status: string;
  summary: string | null;
  strengths: string | null;
  risks: string | null;
  leadershipStyle: string | null;
};

export function AssessmentAdmin({
  profileId,
  assessments,
}: {
  profileId: string;
  assessments: AssessmentData[];
}) {
  const [open, setOpen] = useState(false);
  const [selectedType, setSelectedType] = useState("HOGAN");

  const existing = assessments.find((a) => a.type === selectedType);

  const save = useAction(
    (fd: FormData) =>
      saveAssessmentResults(profileId, selectedType, {
        summary: fd.get("summary") as string,
        strengths: fd.get("strengths") as string,
        risks: fd.get("risks") as string,
        leadershipStyle: fd.get("leadershipStyle") as string,
      }),
    {
      successMessage: "Результаты сохранены",
      onSuccess: () => setOpen(false),
    }
  );

  const completedTypes = assessments.filter((a) => a.status === "COMPLETED").map((a) => a.type);

  return (
    <div className="border-t pt-3 mt-1">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Assessments</p>
        <div className="flex gap-1">
          {completedTypes.map((t) => (
            <span key={t} className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded">
              {t}
            </span>
          ))}
          <Button
            variant="outline"
            size="sm"
            className="h-6 text-xs px-2 ml-1"
            onClick={() => setOpen(!open)}
          >
            {open ? "Свернуть" : "+ Добавить результат"}
          </Button>
        </div>
      </div>

      {open && (
        <div className="bg-muted/50 rounded-lg p-4 space-y-3">
          <div className="flex gap-2">
            {ASSESSMENT_TYPES.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => setSelectedType(value)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                  selectedType === value
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-input hover:bg-muted"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              save.run(new FormData(e.currentTarget));
            }}
            className="space-y-3"
          >
            <div className="space-y-1">
              <Label className="text-xs">Резюме</Label>
              <Textarea
                name="summary"
                rows={2}
                defaultValue={existing?.summary ?? ""}
                placeholder="Краткое описание результатов..."
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Сильные стороны</Label>
                <Textarea
                  name="strengths"
                  rows={2}
                  defaultValue={existing?.strengths ?? ""}
                  placeholder="Лидерство, аналитика..."
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Зоны развития</Label>
                <Textarea
                  name="risks"
                  rows={2}
                  defaultValue={existing?.risks ?? ""}
                  placeholder="Делегирование, терпение..."
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Стиль лидерства</Label>
              <Input
                name="leadershipStyle"
                defaultValue={existing?.leadershipStyle ?? ""}
                placeholder="Трансформационный, директивный..."
              />
            </div>
            <Button type="submit" size="sm" disabled={save.isPending}>
              {save.isPending ? "Сохраняем..." : "Сохранить результаты"}
            </Button>
          </form>
        </div>
      )}
    </div>
  );
}
