import {
  CheckCircle,
  ClipboardList,
  Clock,
  Hourglass,
  TrendingUp,
} from "lucide-react";
import KpiCard from "../../../../components/common/KpiCard";

interface AbonnementsAdminKpiCardsProps {
  totalAbonnements: number;
  totalActifs: number;
  totalExpires: number;
  totalEnAttente: number;
  revenusActifs: number;
}

export default function AbonnementsAdminKpiCards({
  totalAbonnements,
  totalActifs,
  totalExpires,
  totalEnAttente,
  revenusActifs,
}: AbonnementsAdminKpiCardsProps) {
  const kpiCards = [
    {
      label: "TOTAL ABONNEMENTS",
      value: totalAbonnements,
      sub: "tous statuts",
      icon: <ClipboardList className="w-6 h-6 text-blue-600" />,
      border: "border-t-blue-500",
    },
    {
      label: "ACTIFS",
      value: totalActifs,
      sub: "en cours",
      icon: <CheckCircle className="w-6 h-6 text-blue-500" />,
      border: "border-t-blue-500",
    },
    {
      label: "EXPIRÉS",
      value: totalExpires,
      sub: "non renouvelés",
      icon: <Clock className="w-6 h-6 text-blue-400" />,
      border: "border-t-blue-400",
    },
    {
      label: "EN ATTENTE",
      value: totalEnAttente,
      sub: "en cours de traitement",
      icon: <Hourglass className="w-6 h-6 text-blue-400" />,
      border: "border-t-indigo-400",
    },
    {
      label: "REVENUS GÉNÉRÉS",
      value: `${revenusActifs.toFixed(2)} TND`,
      sub: "ce mois",
      icon: <TrendingUp className="w-6 h-6 text-blue-500" />,
      border: "border-t-blue-400",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
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