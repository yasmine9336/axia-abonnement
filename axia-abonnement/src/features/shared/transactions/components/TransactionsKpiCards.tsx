import { Calendar, Clock, Receipt, TrendingUp } from "lucide-react";
import KpiCard from "../../../../components/common/KpiCard";
import type { CountsByStatus } from "../types";

interface TransactionsKpiCardsProps {
  isAdmin: boolean;
  revenuTotal: number;
  revenuMoisCi: number;
  totalPaiements: number;
  countsByStatus: CountsByStatus;
  currentMonthLabel: string;
}

export default function TransactionsKpiCards({
  isAdmin,
  revenuTotal,
  revenuMoisCi,
  totalPaiements,
  countsByStatus,
  currentMonthLabel,
}: TransactionsKpiCardsProps) {
  const kpiCards = [
    {
      label: isAdmin ? "REVENUS TOTAUX" : "TOTAL REÇU",
      value: `${revenuTotal.toFixed(2)} TND`,
      sub: `${countsByStatus.completed} paiement(s) complété(s)`,
      icon: <TrendingUp className="w-5 h-5 text-green-500" />,
      border: "border-t-green-400",
    },
    {
      label: "CE MOIS-CI",
      value: `${revenuMoisCi.toFixed(2)} TND`,
      sub: currentMonthLabel,
      icon: <Calendar className="w-5 h-5 text-blue-600" />,
      border: "border-t-blue-500",
    },
    {
      label: "TOTAL TRANSACTIONS",
      value: totalPaiements,
      sub: "toutes périodes",
      icon: <Receipt className="w-5 h-5 text-orange-500" />,
      border: "border-t-orange-400",
    },
    {
      label: "EN ATTENTE",
      value: countsByStatus.pending,
      sub: "paiements non finalisés",
      icon: <Clock className="w-5 h-5 text-amber-500" />,
      border: "border-t-amber-400",
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