import { CheckCircle, ClipboardList, Tag, Zap } from "lucide-react";
import KpiCard from "../../../../components/common/KpiCard";

interface CatalogueAdminKpiCardsProps {
  totalServices: number;
  activeServices: number;
  totalOffres: number;
  activeOffres: number;
}

export default function CatalogueAdminKpiCards({
  totalServices,
  activeServices,
  totalOffres,
  activeOffres,
}: CatalogueAdminKpiCardsProps) {
  const kpiCards = [
    {
      label: "TOTAL SERVICES",
      value: totalServices,
      sub: `${activeServices} actifs`,
      icon: <ClipboardList className="w-5 h-5 text-blue-600" />,
      border: "border-t-blue-500",
    },
    {
      label: "SERVICES ACTIFS",
      value: activeServices,
      sub: `${totalServices - activeServices} inactifs`,
      icon: <CheckCircle className="w-5 h-5 text-green-500" />,
      border: "border-t-green-400",
    },
    {
      label: "TOTAL OFFRES",
      value: totalOffres,
      sub: `${activeOffres} actives`,
      icon: <Tag className="w-5 h-5 text-blue-500" />,
      border: "border-t-blue-400",
    },
    {
      label: "OFFRES ACTIVES",
      value: activeOffres,
      sub: `${totalOffres - activeOffres} inactives`,
      icon: <Zap className="w-5 h-5 text-orange-500" />,
      border: "border-t-orange-400",
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
          icon={card.icon}
          borderColorClass={card.border}
        />
      ))}
    </div>
  );
}