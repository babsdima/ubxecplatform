"use client";

import { useTransition } from "react";
import { toast } from "sonner";

type ActionResult = { error?: string; success?: string } | void;

export function useAction<T extends unknown[]>(
  action: (...args: T) => Promise<ActionResult>,
  options?: {
    onSuccess?: () => void;
    successMessage?: string;
  }
) {
  const [isPending, startTransition] = useTransition();

  function run(...args: T) {
    startTransition(async () => {
      const result = await action(...args);
      if (result?.error) {
        toast.error(result.error);
      } else {
        if (options?.successMessage ?? result?.success) {
          toast.success(options?.successMessage ?? result?.success);
        }
        options?.onSuccess?.();
      }
    });
  }

  return { run, isPending };
}
