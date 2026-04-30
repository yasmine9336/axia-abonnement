import { CheckCircle, CircleSlash, Users } from "lucide-react";
import KpiCard from "../../../../components/common/KpiCard";

interface ResponsableClientsKpiCardsProps {
  totalClients: number;
  actifs: number;
  inactifs: number;
}

export default function ResponsableClientsKpiCards({
  totalClients,
  actifs,
  inactifs,
}: ResponsableClientsKpiCardsProps) {
  const kpiCards = [
    {
      label: "TOTAL CLIENTS",
      value: totalClients,
      sub: "tous statuts confondus",
      border: "border-t-blue-500",
      icon: <Users className="w-5 h-5 text-blue-600" />,
    },
    {
      label: "ACTIFS",
      value: actifs,
      sub: "comptes actifs",
      border: "border-t-green-400",
      icon: <CheckCircle className="w-5 h-5 text-green-500" />,
    },
    {
      label: "INACTIFS",
      value: inactifs,
      sub: "comptes inactifs",
      border: "border-t-red-400",
      icon: <CircleSlash className="w-5 h-5 text-red-500" />,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
      {kpiCards.map((card) => (
        <KpiCard
          key={card.label}
          label={card.label}
          value={card.value}
          sub={card.sub}
          icon={
            <div className="mt-1 w-10 h-10 rounded-xl flex items-center justify-center bg-gray-50">
              {card.icon}
            </div>
          }
          borderColorClass={card.border}
        />
      ))}
    </div>
  );
}