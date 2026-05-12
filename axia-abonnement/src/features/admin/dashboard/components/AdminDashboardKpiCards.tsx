import {
  ClipboardList,
  Clock,
  Shield,
  TrendingUp,
  Users,
} from "lucide-react";
import KpiCard from "../../../../components/common/KpiCard";
import type { ResponsableItem, Stats } from "../types";
import { formatMoney } from "../utils";

interface AdminDashboardKpiCardsProps {
  stats: Stats;
  responsables: ResponsableItem[];
  loading: boolean;
}

export default function AdminDashboardKpiCards({
  stats,
  responsables,
  loading,
}: AdminDashboardKpiCardsProps) {
  const responsablesActifs = responsables.filter(
    (responsable) => responsable.isActive,
  ).length;

  const kpiCards = [
    {
      label: "REVENU PLATEFORME",
      value: formatMoney(stats.revenuMensuel),
      sub: "total mensuel consolidé",
      icon: <TrendingUp className="w-5 h-5 text-blue-500" />,
      border: "border-t-blue-500",
    },
    {
      label: "CLIENTS ACTIFS GLOBAUX",
      value: stats.totalAbonnes,
      sub: "tous responsables confondus",
      icon: <Users className="w-5 h-5 text-blue-500" />,
      border: "border-t-blue-500",
    },
    {
      label: "RESPONSABLES ACTIFS",
      value: responsablesActifs,
      sub: `sur ${responsables.length} total`,
      icon: <Shield className="w-5 h-5 text-blue-500" />,
      border: "border-t-blue-400",
    },
    {
      label: "ABONNEMENTS ACTIFS",
      value: stats.abonnementsActifs,
      sub: "en cours",
      icon: (
        <ClipboardList className="w-5 h-5 text-(--color-primary)" />
      ),
      border: "border-t-blue-500",
    },
    {
      label: "EN ATTENTE",
      value: stats.demandesEnAttente,
      sub: "nécessitent validation",
      icon: <Clock className="w-5 h-5 text-blue-400" />,
      border:
        stats.demandesEnAttente > 0
          ? "border-t-yellow-400"
          : "border-t-gray-400",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      {loading
        ? [1, 2, 3, 4, 5].map((item) => (
            <div
              key={item}
              className="bg-white rounded-2xl border border-gray-200 overflow-hidden animate-pulse"
            >
              <div className="h-1 bg-gray-200" />
              <div className="p-5 space-y-3">
                <div className="h-3 bg-gray-200 rounded w-3/4" />
                <div className="h-8 bg-gray-200 rounded w-1/2" />
                <div className="h-3 bg-gray-200 rounded w-full" />
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