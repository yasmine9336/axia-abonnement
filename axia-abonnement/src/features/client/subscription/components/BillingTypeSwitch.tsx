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
              ? "bg-(--color-primary) text-white"
              : "text-gray-600 hover:bg-gray-50"
          }`}
        >
          Mensuel
        </button>

        <button
          type="button"
          onClick={() => onChange("annuel")}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
            type === "annuel"
              ? "bg-(--color-primary) text-white"
              : "text-gray-600 hover:bg-gray-50"
          }`}
        >
          Annuel
        </button>
      </div>
    </div>
  );
}