"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { verifyCandidate } from "@/lib/actions";
import { useAction } from "@/hooks/use-action";

export function VerifyButtons({ profileId }: { profileId: string }) {
  const [note, setNote] = useState("");

  const approve = useAction(
    () => verifyCandidate(profileId, "VERIFIED"),
    { successMessage: "Кандидат верифицирован" }
  );
  const reject = useAction(
    () => verifyCandidate(profileId, "REJECTED", note),
    { successMessage: "Профиль отклонён" }
  );

  return (
    <div className="flex gap-3 pt-2">
      <Button
        size="sm"
        className="flex-1"
        onClick={() => approve.run()}
        disabled={approve.isPending || reject.isPending}
      >
        {approve.isPending ? "Верифицируем..." : "Верифицировать"}
      </Button>
      <div className="flex-1 space-y-2">
        <Textarea
          placeholder="Причина отклонения..."
          rows={2}
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
        <Button
          size="sm"
          variant="destructive"
          className="w-full"
          onClick={() => reject.run()}
          disabled={approve.isPending || reject.isPending}
        >
          {reject.isPending ? "Отклоняем..." : "Отклонить"}
        </Button>
      </div>
    </div>
  );
}
