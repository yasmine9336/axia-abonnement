import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import ProfileSection from "../../components/private_layout/ProfileSection";
import PaymentSection from "../../components/private_layout/PaymentSection";
import SubscriptionsSection from "../../components/private_layout/MesAbonnementsSection";

type Section = "dashboard" | "payment" | "subscriptions" | "history" | "chat" | "profile";

interface Props {
  section?: Section;
}

export default function ClientDashboard({ section = "dashboard" }: Props) {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (section === "profile") return <ProfileSection />;
  if (section === "payment") return <PaymentSection />;
  if (section === "subscriptions") return <SubscriptionsSection />;

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
        <p className="text-gray-500 text-sm mt-1">Bienvenue {user?.username} ! Voici un aperçu de vos abonnements.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Abonnements actifs", value: "1", icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          )},
          { label: "Total dépensé", value: "295TND", icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )},
          { label: "Notifications", value: "1", icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          )},
          { label: "Ce mois-ci", value: "125TND", icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          )},
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl border border-gray-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 mb-1">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className="w-11 h-11 bg-[#4F46E5]/10 text-[#4F46E5] rounded-xl flex items-center justify-center">
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Abonnements actifs */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Abonnements actifs</h2>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div>
              <p className="font-semibold text-gray-900 text-sm">Pack Entrepreneur</p>
              <p className="text-xs text-gray-500 mt-1">Renouvellement : 15/07/2026</p>
            </div>
            <div className="text-right">
              <p className="font-semibold text-gray-900 text-sm">125TND/mois</p>
              <span className="inline-block mt-1 bg-green-100 text-green-700 text-xs font-semibold px-2 py-0.5 rounded-full">Actif</span>
            </div>
          </div>
        </div>

        {/* Notifications récentes */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Notifications récentes</h2>
          <div className="space-y-3">
            {[
              { msg: "Votre abonnement Pack Entrepreneur sera renouvelé le 15 mars 2026", date: "20/02/2026", type: "info" },
              { msg: "Paiement réussi pour Pack Entrepreneur", date: "15/02/2026", type: "success" },
              { msg: "Votre abonnement Sport & Fitness a expiré", date: "01/01/2026", type: "warning" },
            ].map((n, i) => (
              <div key={i} className="flex items-start justify-between p-3 border border-gray-100 rounded-xl gap-3">
                <p className="text-xs text-gray-700 flex-1">{n.msg}</p>
                <div className="text-right shrink-0">
                  <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full ${
                    n.type === "success" ? "bg-green-100 text-green-700" :
                    n.type === "warning" ? "bg-yellow-100 text-yellow-700" :
                    "bg-blue-100 text-blue-700"
                  }`}>{n.type}</span>
                  <p className="text-xs text-gray-400 mt-1">{n.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Paiements récents */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Paiements récents</h2>
          <div className="space-y-3">
            {[
              { service: "Pack Entrepreneur", date: "15/02/2026", amount: "125TND", status: "completed" },
              { service: "Pack Entrepreneur", date: "15/01/2026", amount: "125TND", status: "completed" },
              { service: "Sport & Fitness", date: "15/12/2025", amount: "45TND", status: "completed" },
              { service: "Sport & Fitness", date: "15/11/2025", amount: "45TND", status: "failed" },
            ].map((p, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div>
                  <p className="text-sm font-medium text-gray-900">{p.service}</p>
                  <p className="text-xs text-gray-500">{p.date}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">{p.amount}</p>
                  <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full ${
                    p.status === "completed" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                  }`}>{p.status === "completed" ? "Complété" : "Échoué"}</span>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-4 text-sm text-[#4F46E5] hover:underline font-medium">
            Voir tous les paiements
          </button>
        </div>

        {/* Actions rapides */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Actions rapides</h2>
          <div className="space-y-3">
            {[
              { label: "Effectuer un paiement", path: "/dashboard/client/payment", icon: "💳" },
              { label: "Gérer les abonnements", path: "/dashboard/client/subscriptions", icon: "📦" },
              { label: "Contacter le support", path: "/dashboard/client/chat", icon: "💬" },
              { label: "Explorer les offres", path: "/", icon: "🔍" },
            ].map((action) => (
              <button
                key={action.label}
                onClick={() => navigate(action.path)}
                className="w-full flex items-center gap-3 px-4 py-3 border border-[#4F46E5] text-[#4F46E5] hover:bg-[#4F46E5] hover:text-white rounded-xl transition-colors text-sm font-medium"
              >
                <span>{action.icon}</span>
                {action.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}