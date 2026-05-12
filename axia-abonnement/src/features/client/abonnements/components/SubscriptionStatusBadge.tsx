import type { AbonnementStatut } from "../types";

interface SubscriptionStatusBadgeProps {
  statut: AbonnementStatut;
}

export default function SubscriptionStatusBadge({
  statut,
}: SubscriptionStatusBadgeProps) {
  const className =
    statut === "actif"
      ? "bg-blue-100 text-blue-700"
      : statut === "en_attente"
        ? "bg-blue-50 text-yellow-700"
        : "bg-blue-100 text-blue-700";

  const label = statut === "en_attente" ? "En attente" : statut;

  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${className}`}>
      {label}
    </span>
  );
}