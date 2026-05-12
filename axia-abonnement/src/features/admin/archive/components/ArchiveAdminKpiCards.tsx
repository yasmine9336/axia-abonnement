import { CheckCircle, Clock, Users } from "lucide-react";
import KpiCard from "../../../../components/common/KpiCard";

interface ArchiveAdminKpiCardsProps {
  totalClients: number;
  totalActifs: number;
  totalInactifs: number;
}

export default function ArchiveAdminKpiCards({
  totalClients,
  totalActifs,
  totalInactifs,
}: ArchiveAdminKpiCardsProps) {
  const kpiCards = [
    {
      label: "TOTAL CLIENTS",
      value: totalClients,
      sub: "tous responsables confondus",
      icon: <Users className="w-5 h-5 text-blue-600" />,
      border: "border-t-blue-500",
    },
    {
      label: "CLIENTS ACTIFS",
      value: totalActifs,
      sub: "abonnements en cours",
      icon: <CheckCircle className="w-5 h-5 text-blue-500" />,
      border: "border-t-blue-500",
    },
    {
      label: "CLIENTS INACTIFS",
      value: totalInactifs,
      sub: "expirés ou sans abonnement",
      icon: <Clock className="w-5 h-5 text-blue-400" />,
      border: "border-t-red-400",
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
          icon={card.icon}
          borderColorClass={card.border}
        />
      ))}
    </div>
  );
}