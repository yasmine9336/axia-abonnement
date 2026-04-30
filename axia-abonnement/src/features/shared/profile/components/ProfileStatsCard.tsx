import {
  Briefcase,
  Clock,
  CreditCard,
  Package,
  TrendingUp,
  UserCheck,
  Users,
} from "lucide-react";
import type { StatCard, StatIconKey } from "../types";

interface ProfileStatsCardProps {
  statCards: StatCard[];
}

function renderIcon(icon: StatIconKey, className: string) {
  switch (icon) {
    case "userCheck":
      return <UserCheck className={className} />;

    case "users":
      return <Users className={className} />;

    case "creditCard":
      return <CreditCard className={className} />;

    case "trendingUp":
      return <TrendingUp className={className} />;

    case "package":
      return <Package className={className} />;

    case "briefcase":
      return <Briefcase className={className} />;

    case "clock":
      return <Clock className={className} />;

    default:
      return null;
  }
}

export default function ProfileStatsCard({ statCards }: ProfileStatsCardProps) {
  if (statCards.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5">
      <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-4">
        Activité
      </p>

      <div className="space-y-3">
        {statCards.map((stat) => (
          <div key={stat.label} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {renderIcon(stat.icon, stat.iconClassName)}

              <span className="text-sm text-gray-600">{stat.label}</span>
            </div>

            <span className="text-sm font-bold text-gray-900">
              {stat.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}