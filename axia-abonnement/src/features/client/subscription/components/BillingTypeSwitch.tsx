import type { BillingType } from "../types";

interface BillingTypeSwitchProps {
  type: BillingType;
  onChange: (type: BillingType) => void;
}

export default function BillingTypeSwitch({
  type,
  onChange,
}: BillingTypeSwitchProps) {
  return (
    <div className="mb-6">
      <div className="inline-flex p-1 rounded-2xl border border-gray-200 bg-white shadow-sm">
        <button
          type="button"
          onClick={() => onChange("mensuel")}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
            type === "mensuel"
              ? "text-white"
              : "text-gray-600 hover:bg-gray-50"
          }`}
          style={
            type === "mensuel"
              ? { background: "var(--color-primary)" }
              : undefined
          }
        >
          Mensuel
        </button>

        <button
          type="button"
          onClick={() => onChange("annuel")}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
            type === "annuel"
              ? "text-white"
              : "text-gray-600 hover:bg-gray-50"
          }`}
          style={
            type === "annuel"
              ? { background: "var(--color-primary)" }
              : undefined
          }
        >
          Annuel
        </button>
      </div>
    </div>
  );
}