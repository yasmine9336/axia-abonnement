import { Check } from "lucide-react";
import { offreCardClass } from "../constants";
import type { Offre } from "../types";
import StarRating from "./StarRating";
import SubscribeButton from "./SubscribeButton";

interface OffreCardProps {
  offre: Offre;
  buttonLabel?: string;
  showRating?: boolean;
  onSubscribe: (offreId: string) => void;
}

export default function OffreCard({
  offre,
  buttonLabel = "Choisir cette offre",
  showRating = true,
  onSubscribe,
}: OffreCardProps) {
  return (
    <div className={offreCardClass}>
      <h3 className="text-xl font-bold text-gray-900 mb-1">
        {offre.intituleOffre}
      </h3>

      <p className="text-gray-500 text-sm mb-4">{offre.description}</p>

      {offre.services.length > 0 && (
        <div className="bg-gray-50 rounded-xl p-4 mb-4 overflow-y-auto scrollbar-hide max-h-38">
          <p className="text-xs text-gray-500 mb-2">Inclut :</p>

          <ul className="flex flex-col gap-1.5">
            {offre.services.map((service) => (
              <li
                key={service}
                className="flex items-center gap-2 text-sm text-gray-700"
              >
                <Check className="w-4 h-4 shrink-0 text-(--color-primary)" />
                {service}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex items-baseline gap-2 mb-1">
        <span className="text-3xl font-bold text-(--color-primary)">
          {offre.prix}
        </span>
        <span className="text-sm font-medium text-(--color-primary)">
          TND
        </span>
        <span className="text-gray-400 text-sm">
          / {offre.dureeEnMois} mois
        </span>
      </div>

      {showRating && (
        <StarRating moyenne={offre.moyenneNote} nombreAvis={offre.nombreAvis} />
      )}

      <SubscribeButton
        label={buttonLabel}
        onClick={() => onSubscribe(offre.id)}
      />
    </div>
  );
}