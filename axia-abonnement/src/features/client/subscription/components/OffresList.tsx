import type { BillingType, Offre, Selection } from "../types";
import { getPrice } from "../utils";
import SubscriptionOptionCard from "./SubscriptionOptionCard";

interface OffresListProps {
  offres: Offre[];
  relatedOffresCount: number;
  selection: Selection | null;
  type: BillingType;
  onSelect: (offre: Offre) => void;
}

export default function OffresList({
  offres,
  relatedOffresCount,
  selection,
  type,
  onSelect,
}: OffresListProps) {
  const isServiceSelected = selection?.kind === "service";

  return (
    <div>
      <div className="flex items-end justify-between gap-3 mb-4">
        <div>
          <h2 className="text-xs font-bold tracking-widest text-gray-400">
            {isServiceSelected ? "OFFRES LIÉES" : "OFFRES / PACKS"}
          </h2>

          {isServiceSelected && (
            <p className="text-xs text-blue-600 mt-1">
              {relatedOffresCount > 0
                ? "Économisez avec un pack !"
                : "Aucune offre liée à ce service."}
            </p>
          )}
        </div>
      </div>

      {offres.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 text-sm text-gray-400">
          Aucune offre disponible.
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {offres.map((offre) => {
            const isSelected =
              selection?.kind === "offre" && selection.item.id === offre.id;

            return (
              <SubscriptionOptionCard
                key={offre.id}
                title={offre.intituleOffre}
                description={offre.description}
                price={getPrice(offre, type)}
                dureeEnMois={offre.dureeEnMois}
                isSelected={isSelected}
                moyenneNote={offre.moyenneNote}
                nombreAvis={offre.nombreAvis}
                onClick={() => onSelect(offre)}
              >
                {offre.services.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {offre.services.slice(0, 4).map((service) => (
                      <span
                        key={service}
                        className="px-3 py-1 rounded-full text-xs font-semibold bg-(--color-primary-soft) text-(--color-primary)"
                      >
                        {service}
                      </span>
                    ))}

                    {offre.services.length > 4 && (
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
                        +{offre.services.length - 4}
                      </span>
                    )}
                  </div>
                )}
              </SubscriptionOptionCard>
            );
          })}
        </div>
      )}
    </div>
  );
}