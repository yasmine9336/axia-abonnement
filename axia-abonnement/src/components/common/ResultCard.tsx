import type { ReactNode } from "react";

interface ResultCardProps {
  icon: ReactNode;
  title: string;
  message: string;
  buttonLabel: string;
  onButtonClick: () => void | Promise<void>;
}

export default function ResultCard({
  icon,
  title,
  message,
  buttonLabel,
  onButtonClick,
}: ResultCardProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-2xl border border-gray-200 p-8 text-center">
        {icon}

        <h1 className="text-2xl font-bold text-gray-900 mb-2">{title}</h1>

        <p className="text-gray-500 text-sm mb-6">{message}</p>

        <button
          type="button"
          onClick={onButtonClick}
          className="w-full py-3 text-white rounded-xl font-semibold text-sm transition-colors"
          style={{ background: "var(--color-primary)" }}
        >
          {buttonLabel}
        </button>
      </div>
    </div>
  );
}