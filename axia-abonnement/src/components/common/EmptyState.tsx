import type { ReactNode } from "react";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
}

export default function EmptyState({
  icon,
  title,
  description,
}: EmptyStateProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
      {icon && <div className="text-gray-400 mb-3 flex justify-center">{icon}</div>}

      <p className="text-gray-700 font-semibold text-sm">{title}</p>

      {description && (
        <p className="text-gray-400 text-sm mt-1">{description}</p>
      )}
    </div>
  );
}