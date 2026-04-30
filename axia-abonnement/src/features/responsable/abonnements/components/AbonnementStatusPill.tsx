interface AbonnementStatusPillProps {
  statut: string;
}

export default function AbonnementStatusPill({
  statut,
}: AbonnementStatusPillProps) {
  const className =
    statut === "actif"
      ? "bg-green-100 text-green-700"
      : statut === "expiré"
        ? "bg-red-100 text-red-700"
        : "bg-gray-100 text-gray-600";

  return (
    <span
      className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${className}`}
    >
      {statut}
    </span>
  );
}