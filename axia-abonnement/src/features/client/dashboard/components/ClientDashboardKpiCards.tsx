import { BarChart3, Bell, Package, Wallet } from "lucide-react";
import KpiCard from "../../../../components/common/KpiCard";

interface ClientDashboardKpiCardsProps {
  loading: boolean;
  abonnementsActifsCount: number;
  totalDepense: number;
  unreadCount: number;
  totalCeMois: number;
}

export default function ClientDashboardKpiCards({
  loading,
  abonnementsActifsCount,
  totalDepense,
  unreadCount,
  totalCeMois,
}: ClientDashboardKpiCardsProps) {
  const kpiCards = [
    {
      label: "ABONNEMENTS ACTIFS",
      value: abonnementsActifsCount,
      sub: "en cours",
      icon: <Package className="w-5 h-5 text-blue-600" />,
      border: "border-t-blue-500",
    },
    {
      label: "TOTAL PAYÉ",
      value: `${totalDepense.toFixed(2)} TND`,
      sub: "tous paiements",
      icon: <Wallet className="w-5 h-5 text-blue-500" />,
      border: "border-t-blue-500",
    },
    {
      label: "NOTIFICATIONS",
      value: unreadCount,
      sub: "non lues",
      icon: (
        <Bell
          className={`w-5 h-5 ${
            unreadCount > 0 ? "text-blue-400" : "text-gray-400"
          }`}
        />
      ),
      border: unreadCount > 0 ? "border-t-blue-300" : "border-t-gray-300",
    },
    {
      label: "CE MOIS-CI",
      value: `${totalCeMois.toFixed(2)} TND`,
      sub: "payé ce mois-ci",
      icon: <BarChart3 className="w-5 h-5 text-blue-500" />,
      border: "border-t-blue-400",
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
              <div className="h-3 bg-gray-200 rounded w-3/4 mb-3" />
              <div className="h-8 bg-gray-200 rounded w-1/2 mb-2" />
              <div className="h-2 bg-gray-200 rounded w-2/3" />
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