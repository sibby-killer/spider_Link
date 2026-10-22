import { cn } from "@/lib/utils";

const REQUEST_STYLES: Record<string, string> = {
  new: "bg-brand-50 text-brand-700",
  contacted: "bg-blue-50 text-blue-700",
  survey_scheduled: "bg-amber-50 text-amber-700",
  survey_done: "bg-indigo-50 text-indigo-700",
  installed: "bg-violet-50 text-violet-700",
  activated: "bg-emerald-50 text-emerald-700",
  rejected: "bg-ink/8 text-ink-soft",
  open: "bg-brand-50 text-brand-700",
  in_progress: "bg-amber-50 text-amber-700",
  resolved: "bg-emerald-50 text-emerald-700",
  closed: "bg-ink/8 text-ink-soft",
  active: "bg-emerald-50 text-emerald-700",
  suspended: "bg-amber-50 text-amber-700",
  churned: "bg-ink/8 text-ink-soft",
  pending: "bg-ink/8 text-ink-soft",
  pending_payment: "bg-amber-50 text-amber-700",
  paid: "bg-emerald-50 text-emerald-700",
  accepted: "bg-blue-50 text-blue-700",
  refunded: "bg-ink/8 text-ink-soft",
};

export default function StatusPill({ status, className }: { status: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-[0.7rem] font-semibold capitalize",
        REQUEST_STYLES[status] ?? "bg-ink/8 text-ink-soft",
        className,
      )}
    >
      {status.replace(/_/g, " ")}
    </span>
  );
}
