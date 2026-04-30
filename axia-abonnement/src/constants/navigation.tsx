import type { ReactNode } from "react";
import {
  LayoutDashboard,
  CreditCard,
  Package,
  History,
  User,
  BarChart3,
  MessageCircle,
  Users,
  Settings,
  Tags,
  Building2,
  ClipboardList,
  Archive,
} from "lucide-react";

export interface NavItem {
  label: string;
  path: string;
  icon: ReactNode;
}

const iconClass = "w-5 h-5 shrink-0";

export const clientNav: NavItem[] = [
  {
    label: "Tableau de bord",
    path: "/dashboard/client",
    icon: <LayoutDashboard className={iconClass} />,
  },
  {
    label: "Souscrire",
    path: "/dashboard/client/subscribe",
    icon: <CreditCard className={iconClass} />,
  },
  {
    label: "Mes abonnements",
    path: "/dashboard/client/subscriptions",
    icon: <Package className={iconClass} />,
  },
  {
    label: "Mes paiements",
    path: "/dashboard/client/payments",
    icon: <History className={iconClass} />,
  },
  {
    label: "Mon profil",
    path: "/dashboard/client/profile",
    icon: <User className={iconClass} />,
  },
];

export const responsableNav: NavItem[] = [
  {
    label: "Tableau de bord",
    path: "/dashboard/responsable",
    icon: <LayoutDashboard className={iconClass} />,
  },
  {
    label: "Suivi abonnements",
    path: "/dashboard/responsable/suivi-abonnements",
    icon: <BarChart3 className={iconClass} />,
  },
  {
    label: "Transactions",
    path: "/dashboard/responsable/transactions",
    icon: <CreditCard className={iconClass} />,
  },
  {
    label: "Messages",
    path: "/dashboard/responsable/messages",
    icon: <MessageCircle className={iconClass} />,
  },
  {
    label: "Clients",
    path: "/dashboard/responsable/clients",
    icon: <Users className={iconClass} />,
  },
  {
    label: "Services",
    path: "/dashboard/responsable/services",
    icon: <Settings className={iconClass} />,
  },
  {
    label: "Offres",
    path: "/dashboard/responsable/offres",
    icon: <Tags className={iconClass} />,
  },
  {
    label: "Profil",
    path: "/dashboard/responsable/profile",
    icon: <User className={iconClass} />,
  },
];

export const adminNav: NavItem[] = [
  {
    label: "Tableau de bord",
    path: "/dashboard/admin",
    icon: <LayoutDashboard className={iconClass} />,
  },
  {
    label: "Responsables",
    path: "/dashboard/admin/responsables",
    icon: <Building2 className={iconClass} />,
  },
  {
    label: "Abonnements",
    path: "/dashboard/admin/abonnements",
    icon: <ClipboardList className={iconClass} />,
  },
  {
    label: "Transactions",
    path: "/dashboard/admin/transactions",
    icon: <CreditCard className={iconClass} />,
  },
  {
    label: "Catalogue",
    path: "/dashboard/admin/catalogue",
    icon: <Settings className={iconClass} />,
  },
  {
    label: "Archive",
    path: "/dashboard/admin/archive",
    icon: <Archive className={iconClass} />,
  },
  {
    label: "Profil",
    path: "/dashboard/admin/profile",
    icon: <User className={iconClass} />,
  },
];

export const getNavItemsByRole = (role?: string): NavItem[] => {
  if (role === "Admin") return adminNav;
  if (role === "Responsable") return responsableNav;
  return clientNav;
};
