import { CreditCard, History, Plus, User } from "lucide-react";

interface QuickActionsCardProps {
  onNavigate: (path: string) => void;
}

export default function QuickActionsCard({
  onNavigate,
}: QuickActionsCardProps) {
  const actions = [
    {
      label: "Nouvel abonnement",
      sub: "Parcourir les offres",
      path: "/",
      icon: (
        <Plus className="w-6 h-6 text-(--color-primary)" />
      ),
    },
    {
      label: "Mes abonnements",
      sub: "Gérer et suivre",
      path: "/dashboard/client/subscriptions",
      icon: <CreditCard className="w-6 h-6 text-blue-500" />,
    },
    {
      label: "Mes paiements",
      sub: "Historique et reçus",
      path: "/dashboard/client/payments",
      icon: <History className="w-6 h-6 text-orange-500" />,
    },
    {
      label: "Mon profil",
      sub: "Informations compte",
      path: "/dashboard/client/profile",
      icon: <User className="w-6 h-6 text-gray-500" />,
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <h2 className="text-base font-bold text-gray-900 mb-4">
        Actions rapides
      </h2>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {actions.map((action) => (
          <button
            key={action.label}
            type="button"
            onClick={() => onNavigate(action.path)}
            className="flex flex-col items-center gap-2 p-5 bg-gray-50 hover:bg-gray-100 rounded-2xl border border-gray-200 transition-colors text-center"
          >
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center border border-gray-200 shadow-sm">
              {action.icon}
            </div>

            <div>
              <p className="text-sm font-semibold text-gray-900">
                {action.label}
              </p>

              <p className="text-xs text-gray-400 mt-0.5">{action.sub}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
