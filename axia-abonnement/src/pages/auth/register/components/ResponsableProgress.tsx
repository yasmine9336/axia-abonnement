import type { RegisterStep } from "../types";

interface ResponsableProgressProps {
  step: RegisterStep;
}

export default function ResponsableProgress({ step }: ResponsableProgressProps) {
  return (
    <div className="mb-6">
      <div className="flex gap-2 mb-1">
        <div
          className="h-1 flex-1 rounded-full transition-colors"
          style={{
            background: step >= 1 ? "var(--color-primary)" : "#e5e7eb",
          }}
        />

        <div
          className="h-1 flex-1 rounded-full transition-colors"
          style={{
            background: step >= 2 ? "var(--color-primary)" : "#e5e7eb",
          }}
        />
      </div>

      <p className="text-xs text-gray-400">
        Étape {step}/2 ·{" "}
        {step === 1 ? "Informations personnelles" : "Informations entreprise"}
      </p>
    </div>
  );
}