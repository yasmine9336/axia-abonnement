import { BarChart3, Receipt, Wallet } from "lucide-react";
import KpiCard from "../../../../components/common/KpiCard";

interface PaiementsKpiCardsProps {
  totalDepense: number;
  totalPaiements: number;
  completedCount: number;
  ceMois: number;
}

export default function PaiementsKpiCards({
  totalDepense,
  totalPaiements,
  completedCount,
  ceMois,
}: PaiementsKpiCardsProps) {
  const kpiCards = [
    {
      label: "TOTAL PAYÉ",
      value: `${totalDepense.toFixed(2)} TND`,
      sub: "paiements complétés",
      icon: <Wallet className="w-5 h-5 text-blue-500" />,
      border: "border-t-blue-500",
    },
    {
      label: "PAIEMENTS",
      value: totalPaiements,
      sub: `${completedCount} complétée${completedCount !== 1 ? "s" : ""}`,
      icon: <Receipt className="w-5 h-5 text-blue-600" />,
      border: "border-t-blue-500",
    },
    {
      label: "CE MOIS-CI",
      value: `${ceMois.toFixed(2)} TND`,
      sub: "payé",
      icon: <BarChart3 className="w-5 h-5 text-blue-500" />,
      border: "border-t-blue-400",
    },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
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