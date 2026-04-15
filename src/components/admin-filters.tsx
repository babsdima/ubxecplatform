"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useTransition, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Props {
  statusOptions?: { value: string; label: string }[];
  searchPlaceholder?: string;
}

export function AdminFilters({ statusOptions, searchPlaceholder = "Поиск по email..." }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  const currentStatus = searchParams.get("status") ?? "";
  const currentQ = searchParams.get("q") ?? "";

  function push(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  }

  function handleSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    push("q", inputRef.current?.value ?? "");
  }

  return (
    <div className="flex flex-wrap gap-3 mb-6">
      {statusOptions && (
        <div className="flex gap-1">
          <Button
            size="sm"
            variant={!currentStatus ? "default" : "outline"}
            onClick={() => push("status", "")}
          >
            Все
          </Button>
          {statusOptions.map((opt) => (
            <Button
              key={opt.value}
              size="sm"
              variant={currentStatus === opt.value ? "default" : "outline"}
              onClick={() => push("status", opt.value)}
            >
              {opt.label}
            </Button>
          ))}
        </div>
      )}

      <form onSubmit={handleSearch} className="flex gap-2">
        <Input
          ref={inputRef}
          defaultValue={currentQ}
          placeholder={searchPlaceholder}
          className="h-8 w-56 text-sm"
        />
        <Button size="sm" type="submit" variant="outline">Найти</Button>
        {currentQ && (
          <Button
            size="sm"
            type="button"
            variant="ghost"
            onClick={() => {
              if (inputRef.current) inputRef.current.value = "";
              push("q", "");
            }}
          >
            ✕
          </Button>
        )}
      </form>
    </div>
  );
}
