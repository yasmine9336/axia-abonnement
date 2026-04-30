import { Boxes, Hourglass, TrendingUp, Users } from "lucide-react";
import KpiCard from "../../../../components/common/KpiCard";
import type { Stats } from "../types";
import { formatMoney } from "../utils";

interface ResponsableDashboardKpiCardsProps {
  stats: Stats;
  loading: boolean;
}

export default function ResponsableDashboardKpiCards({
  stats,
  loading,
}: ResponsableDashboardKpiCardsProps) {
  const kpiCards = [
    {
      label: "TOTAL ABONNÉS",
      value: Number(stats.totalAbonnes) || 0,
      sub: "abonnés actifs",
      icon: <Users className="w-5 h-5 text-blue-600" />,
      border: "border-t-blue-500",
    },
    {
      label: "REVENU MENSUEL",
      value: formatMoney(stats.revenuMensuel),
      sub: "abonnements mensuels",
      icon: <TrendingUp className="w-5 h-5 text-green-500" />,
      border: "border-t-green-400",
    },
    {
      label: "SERVICES ACTIFS",
      value: Number(stats.servicesActifs) || 0,
      sub: "services disponibles",
      icon: <Boxes className="w-5 h-5 text-blue-500" />,
      border: "border-t-blue-400",
    },
    {
      label: "DEMANDES EN ATTENTE",
      value: Number(stats.demandesEnAttente) || 0,
      sub: "à traiter",
      icon: <Hourglass className="w-5 h-5 text-orange-500" />,
      border: "border-t-orange-400",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {loading
        ? [1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="bg-white rounded-2xl border border-gray-200 p-5 animate-pulse"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-24" />
                  <div className="h-8 bg-gray-200 rounded w-20" />
                  <div className="h-3 bg-gray-200 rounded w-32" />
                </div>

                <div className="h-6 w-6 bg-gray-200 rounded" />
              </div>
            </div>
          ))
        : kpiCards.map((card) => (
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