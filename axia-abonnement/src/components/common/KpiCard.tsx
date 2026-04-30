import type { ReactNode } from "react";

interface KpiCardProps {
  label: string;
  value: ReactNode;
  sub?: string;
  icon?: ReactNode;
  borderColorClass?: string;
}

export default function KpiCard({
  label,
  value,
  sub,
  icon,
  borderColorClass = "border-t-blue-500",
}: KpiCardProps) {
  return (
    <div
      className={`bg-white rounded-2xl border border-gray-200 border-t-4 ${borderColorClass} p-5`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-gray-400 font-medium tracking-wide mb-2">
            {label}
          </p>

          <p className="text-3xl font-bold text-gray-900">{value}</p>

          {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
        </div>

        {icon && <div className="mt-1">{icon}</div>}
      </div>
    </div>
  );
}