import KpiCard from "../../../../components/common/KpiCard";

interface OffresKpiCardsProps {
  totalOffres: number;
  activeCount: number;
  inactiveCount: number;
  totalAbonnes: number;
  totalServices: number;
}

export default function OffresKpiCards({
  totalOffres,
  activeCount,
  inactiveCount,
  totalAbonnes,
  totalServices,
}: OffresKpiCardsProps) {
  const kpiCards = [
    {
      label: "TOTAL OFFRES",
      value: totalOffres,
      sub: `${activeCount} active${activeCount !== 1 ? "s" : ""}`,
      border: "border-t-blue-500",
      icon: (
        <svg
          className="w-5 h-5 text-blue-600"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z"
          />
        </svg>
      ),
    },
    {
      label: "OFFRES ACTIVES",
      value: activeCount,
      sub: `${inactiveCount} inactive${inactiveCount !== 1 ? "s" : ""}`,
      border: "border-t-green-400",
      icon: (
        <svg
          className="w-5 h-5 text-green-500"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
    {
      label: "TOTAL ABONNÉS",
      value: totalAbonnes,
      sub: "toutes offres confondues",
      border: "border-t-orange-400",
      icon: (
        <svg
          className="w-5 h-5 text-orange-500"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
          />
        </svg>
      ),
    },
    {
      label: "SERVICES UNIQUES",
      value: totalServices,
      sub: "utilisés dans les offres",
      border: "border-t-indigo-400",
      icon: (
        <svg
          className="w-5 h-5 text-indigo-500"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
          />
        </svg>
      ),
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
          icon={card.icon}
        />
      ))}
    </div>
  );
}
