import { CheckCircle2, Clock, ClipboardList, Users } from "lucide-react";

interface ResponsablesKpiCardsProps {
  totalResponsables: number;
  activeCount: number;
  inactiveCount: number;
  totalDemandes: number;
  pendingCount: number;
}

export default function ResponsablesKpiCards({
  totalResponsables,
  activeCount,
  inactiveCount,
  totalDemandes,
  pendingCount,
}: ResponsablesKpiCardsProps) {
  const kpiCards = [
    {
      label: "TOTAL RESPONSABLES",
      value: totalResponsables,
      sub: `${activeCount} actif(s)`,
      icon: <Users className="w-5 h-5 text-blue-600" />,
      border: "border-t-blue-500",
    },
    {
      label: "ACTIFS",
      value: activeCount,
      sub: `${inactiveCount} inactif(s)`,
      icon: <CheckCircle2 className="w-5 h-5 text-blue-500" />,
      border: "border-t-blue-500",
    },
    {
      label: "TOTAL DEMANDES",
      value: totalDemandes,
      sub: "toutes confondues",
      icon: <ClipboardList className="w-5 h-5 text-blue-500" />,
      border: "border-t-blue-400",
    },
    {
      label: "EN ATTENTE",
      value: pendingCount,
      sub: "demandes à traiter",
      icon: <Clock className="w-5 h-5 text-blue-500" />,
      border: "border-t-blue-400",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {kpiCards.map((card) => (
        <div
          key={card.label}
          className={`bg-white rounded-2xl border border-gray-200 border-t-4 ${card.border} p-5`}
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-gray-400 font-medium tracking-wide mb-2">
                {card.label}
              </p>

              <p className="text-3xl font-bold text-gray-900">
                {card.value}
              </p>

              <p className="text-xs text-gray-400 mt-1">{card.sub}</p>
            </div>

            <div className="mt-1">{card.icon}</div>
          </div>
        </div>
      ))}
    </div>
  );
}