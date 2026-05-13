import type { BillingType, Selection, Service } from "../types";
import StarRating from "./StarRating";

interface ServicesListProps {
  services: Service[];
  selection: Selection | null;
  type: BillingType;
  onSelect: (service: Service) => void;
}

export default function ServicesList({
  services,
  selection,
  type,
  onSelect,
}: ServicesListProps) {
  return (
    <div>
      <h2 className="text-xs font-bold tracking-widest text-gray-400 mb-4">
        SERVICES
      </h2>

      <div className="grid sm:grid-cols-2 gap-4 max-h-105 overflow-y-auto pr-1 scrollbar-hide">
        {services.map((service) => {
          const isSelected =
            selection?.kind === "service" && selection.item.id === service.id;

          const price =
            type === "annuel"
              ? (service.parAnnee ?? 0)
              : (service.parMois ?? 0);

          return (
            <div
              key={service.id}
              className={`text-left rounded-2xl border p-5 bg-white shadow-sm transition-all cursor-pointer ${
                isSelected
                  ? "ring-4"
                  : "border-gray-200 hover:border-blue-300 hover:shadow-md hover:bg-blue-50/20"
              }`}
              style={
                isSelected
                  ? {
                      borderColor: "var(--color-primary)",
                      boxShadow:
                        "0 0 0 4px color-mix(in srgb, var(--color-primary) 10%, transparent)",
                    }
                  : undefined
              }
              onClick={() => onSelect(service)}
            >
              <div className="flex items-start justify-between gap-2 mb-1">
                <p className="font-semibold text-gray-900">
                  {service.intituleService}
                </p>
                {service.moyenneNote != null && service.moyenneNote >= 4.0 && (
                  <span className="shrink-0 text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-semibold">
                    Populaire
                  </span>
                )}
              </div>

              {service.description && (
                <p className="text-xs text-gray-400 mb-3">
                  {service.description}
                </p>
              )}

              <p
                className="text-base font-bold mt-2"
                style={{ color: "var(--color-primary)" }}
              >
                {price.toFixed(2)} TND
                <span className="text-xs font-normal text-gray-400 ml-1">
                  /{type === "annuel" ? "an" : "mois"}
                </span>
              </p>

              <StarRating
                moyenne={service.moyenneNote}
                nombreAvis={service.nombreAvis}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
