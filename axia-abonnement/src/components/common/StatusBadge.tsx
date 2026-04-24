type Variant = "success" | "warning" | "danger" | "neutral";

interface StatusBadgeProps {
  label: string;
  variant?: Variant;
  className?: string;
}

export default function StatusBadge({
  label,
  variant = "neutral",
  className = "",
}: StatusBadgeProps) {
  const variantClass =
    variant === "success"
      ? "ui-badge-success"
      : variant === "warning"
      ? "ui-badge-warning"
      : variant === "danger"
      ? "ui-badge-danger"
      : "ui-badge-neutral";

  return <span className={`ui-badge ${variantClass} ${className}`}>{label}</span>;
}