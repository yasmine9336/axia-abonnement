import type { ReactNode } from "react";
import { getOptionSelectedClass } from "../utils";
import StarRating from "./StarRating";

interface SubscriptionOptionCardProps {
  title: string;
  description: string;
  price: number;
  dureeEnMois?: number;
  isSelected: boolean;
  moyenneNote?: number | null;
  nombreAvis?: number | null;
  children?: ReactNode;
  onClick: () => void;
}

export default function SubscriptionOptionCard({
  title,
  description,
  price,
  dureeEnMois,
  isSelected,
  moyenneNote,
  nombreAvis,
  children,
  onClick,
}: SubscriptionOptionCardProps) {
  const prixLabel = dureeEnMois ? `${dureeEnMois} mois` : "mois";

  return (
    <button
      type="button"
      onClick={onClick}
      className={getOptionSelectedClass(isSelected)}
    >
      <div className="min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="font-bold text-gray-900">{title}</p>
          {moyenneNote != null && moyenneNote >= 4.0 && (
            <span className="shrink-0 text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-semibold">
              Populaire
            </span>
          )}
        </div>
        <p className="text-sm text-gray-500 mt-1 line-clamp-2">{description}</p>
        <StarRating moyenne={moyenneNote} nombreAvis={nombreAvis} />
      </div>

      <div className="mt-4">
        <p className="text-2xl font-extrabold text-(--color-primary)">
          {price}{" "}
          <span className="text-sm font-semibold text-gray-400">
            TND/{prixLabel}
          </span>
        </p>
      </div>

      {children}
    </button>
  );
}
