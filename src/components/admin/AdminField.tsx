export function AdminField({
  label,
  name,
  defaultValue,
  type = "text",
  hint,
  placeholder,
  required,
  rows,
  className = "",
}: {
  label: string;
  name: string;
  defaultValue?: string | number | boolean | null;
  type?: string;
  hint?: string;
  placeholder?: string;
  required?: boolean;
  rows?: number;
  className?: string;
}) {
  const base =
    "mt-1 w-full rounded-lg border border-ink/12 bg-white px-3 py-2 text-sm outline-none focus:border-brand-600";

  return (
    <label className={`block ${className}`}>
      <span className="flex items-baseline gap-2 text-sm font-semibold text-ink">
        {label}
        {hint ? <span className="text-xs font-normal text-ink-soft">{hint}</span> : null}
      </span>

      {type === "textarea" ? (
        <textarea
          name={name}
          rows={rows ?? 4}
          defaultValue={String(defaultValue ?? "")}
          placeholder={placeholder}
          required={required}
          className={base}
        />
      ) : type === "checkbox" ? (
        <span className="mt-2 flex items-center gap-2">
          <input
            type="checkbox"
            name={name}
            defaultChecked={Boolean(defaultValue)}
            className="h-4 w-4 accent-brand-600"
          />
          <span className="text-xs text-ink-soft">Enabled</span>
        </span>
      ) : (
        <input
          type={type}
          name={name}
          defaultValue={defaultValue === null || defaultValue === undefined ? "" : String(defaultValue)}
          placeholder={placeholder}
          required={required}
          className={base}
        />
      )}
    </label>
  );
}

export function AdminSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[var(--radius-card)] border border-ink/8 bg-white p-5">
      <h2 className="text-base font-bold text-ink">{title}</h2>
      {description ? <p className="mt-1 text-sm text-ink-soft">{description}</p> : null}
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  );
}
