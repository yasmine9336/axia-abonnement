import KpiCard from "../../../../components/common/KpiCard";

interface ServicesKpiCardsProps {
  totalServices: number;
  activeCount: number;
  inactiveCount: number;
  totalAbonnes: number;
  totalOffres: number;
}

export default function ServicesKpiCards({
  totalServices,
  activeCount,
  inactiveCount,
  totalAbonnes,
  totalOffres,
}: ServicesKpiCardsProps) {
  const kpiCards = [
    {
      label: "TOTAL SERVICES",
      value: totalServices,
      sub: `${activeCount} actif${activeCount !== 1 ? "s" : ""}`,
      border: "border-t-blue-500",
      iconColor: "text-blue-600",
    },
    {
      label: "SERVICES ACTIFS",
      value: activeCount,
      sub: `${inactiveCount} inactif${inactiveCount !== 1 ? "s" : ""}`,
      border: "border-t-green-400",
      iconColor: "text-green-500",
    },
    {
      label: "TOTAL ABONNÉS",
      value: totalAbonnes,
      sub: "tous services confondus",
      border: "border-t-orange-400",
      iconColor: "text-orange-500",
    },
    {
      label: "OFFRES LIÉES",
      value: totalOffres,
      sub: "offres utilisant ces services",
      border: "border-t-indigo-400",
      iconColor: "text-indigo-500",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {kpiCards.map((card) => (
        <KpiCard
          key={card.label}
          label={card.label}
          value={card.value}
          sub={card.sub}
          borderColorClass={card.border}
          icon={
            <svg
              className={`w-5 h-5 ${card.iconColor}`}
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.5L19 9.5V19a2 2 0 01-2 2z"
              />
            </svg>
          }
        />
      ))}
    </div>
  );
}
