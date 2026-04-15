"use client";

import { Button } from "@/components/ui/button";
import { expressInterest } from "@/lib/actions";
import { useAction } from "@/hooks/use-action";

export function InterestButton({
  matchId,
  role,
}: {
  matchId: string;
  role: "candidate" | "company";
}) {
  const { run, isPending } = useAction(
    () => expressInterest(matchId, role),
    { successMessage: role === "candidate" ? "Интерес отмечен" : "Интерес отмечен" }
  );

  return (
    <Button
      size="sm"
      variant={role === "company" ? "outline" : "default"}
      onClick={() => run()}
      disabled={isPending}
    >
      {isPending ? "..." : "Интересует"}
    </Button>
  );
}
