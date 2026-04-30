import type { Service } from "../types";
import StarRating from "./StarRating";

interface ServiceCardProps {
  service: Service;
  selectedService: string | null;
  onSelect: (intituleService: string) => void;
  onSubscribe: (serviceId: string) => void;
}

export default function ServiceCard({
  service,
  selectedService,
  onSelect,
  onSubscribe,
}: ServiceCardProps) {
  const isSelected = selectedService === service.intituleService;

  return (
    <div
      onClick={() => onSelect(service.intituleService)}
      className="bg-white rounded-2xl p-6 flex flex-col cursor-pointer hover:shadow-lg transition-all duration-300 shrink-0 w-64 border-2"
      style={{
        borderColor: isSelected ? "var(--color-primary)" : "#e5e7eb",
      }}
    >
      <h3 className="text-base font-bold text-gray-900 mb-2">
        {service.intituleService}
      </h3>

      <p className="text-gray-500 text-sm mb-3">{service.description}</p>

      <div className="flex items-baseline gap-1 mb-3">
        <span
          className="text-xl font-bold"
          style={{ color: "var(--color-primary)" }}
        >
          {service.parMois}
        </span>

        <span className="text-xs" style={{ color: "var(--color-primary)" }}>
          TND
        </span>

        <span className="text-gray-400 text-xs">/mois</span>
      </div>

      <StarRating
        moyenne={service.moyenneNote}
        nombreAvis={service.nombreAvis}
      />

      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onSubscribe(service.id);
        }}
        className="w-full py-2 rounded-lg text-xs font-semibold border transition-all"
        style={{
          borderColor: "var(--color-primary)",
          color: "var(--color-primary)",
        }}
        onMouseEnter={(event) => {
          event.currentTarget.style.background = "var(--color-primary)";
          event.currentTarget.style.color = "white";
        }}
        onMouseLeave={(event) => {
          event.currentTarget.style.background = "transparent";
          event.currentTarget.style.color = "var(--color-primary)";
        }}
      >
        Choisir ce service
      </button>
    </div>
  );
}