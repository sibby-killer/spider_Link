import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <img
      src="/brand/spider-mark.svg"
      alt=""
      width={40}
      height={40}
      className={cn("h-9 w-9", className)}
      aria-hidden="true"
    />
  );
}

export function LogoLockup({
  className,
  tone = "dark",
}: {
  className?: string;
  tone?: "dark" | "light";
}) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <LogoMark className="h-10 w-10" />
      <span className="flex flex-col leading-none">
        <span
          className={cn(
            "display text-lg tracking-tight",
            tone === "dark" ? "text-ink" : "text-white",
          )}
        >
          Spider Link
        </span>
        <span
          className={cn(
            "text-[0.6rem] font-semibold uppercase tracking-[0.42em]",
            tone === "dark" ? "text-brand-600" : "text-brand-300",
          )}
        >
          Solution
        </span>
      </span>
    </span>
  );
}
