import type { ReactNode } from "react";
import type { BillingType } from "../types";
import { getOptionSelectedClass, getSelectedStyle } from "../utils";
import StarRating from "./StarRating";

interface SubscriptionOptionCardProps {
  title: string;
  description: string;
  price: number;
  type: BillingType;
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
  type,
  isSelected,
  moyenneNote,
  nombreAvis,
  children,
  onClick,
}: SubscriptionOptionCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={getOptionSelectedClass(isSelected)}
      style={getSelectedStyle(isSelected)}
    >
      <div className="min-w-0">
        <p className="font-bold text-gray-900 truncate">{title}</p>

        <p className="text-sm text-gray-500 mt-1 line-clamp-2">
          {description}
        </p>

        <StarRating moyenne={moyenneNote} nombreAvis={nombreAvis} />
      </div>

      <div className="mt-4">
        <p
          className="text-2xl font-extrabold"
          style={{ color: "var(--color-primary)" }}
        >
          {price}{" "}
          <span className="text-sm font-semibold text-gray-400">
            TND/{type === "annuel" ? "an" : "mois"}
          </span>
        </p>
      </div>

      {children}
    </button>
  );
}