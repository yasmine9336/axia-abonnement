import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../../services/api/axiosInstance";

import AdminDashboardHero from "./components/AdminDashboardHero";
import AdminDashboardKpiCards from "./components/AdminDashboardKpiCards";
import AdminDashboardCharts from "./components/AdminDashboardCharts";
import TopResponsablesCard from "./components/TopResponsablesCard";
import RecentAbonnementsCard from "./components/RecentAbonnementsCard";
import RecentTransactionsCard from "./components/RecentTransactionsCard";

import type { Paiement, ResponsableItem, Stats } from "./types";
import { EMPTY_STATS } from "./types";
import { getCurrentMonthLabel } from "./utils";

export default function AdminDashboardHome() {
  const navigate = useNavigate();

  const [stats, setStats] = useState<Stats>(EMPTY_STATS);
  const [responsables, setResponsables] = useState<ResponsableItem[]>([]);
  const [paiements, setPaiements] = useState<Paiement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    Promise.all([
      axiosInstance.get<Stats>("/abonnements/stats"),
      axiosInstance.get<ResponsableItem[]>("/users/responsables"),
      axiosInstance.get<Paiement[]>("/payment/history/all"),
    ])
      .then(([statsResponse, responsablesResponse, paiementsResponse]) => {
        if (cancelled) return;

        setStats(statsResponse.data ?? EMPTY_STATS);
        setResponsables(responsablesResponse.data ?? []);
        setPaiements(paiementsResponse.data ?? []);
      })
      .catch(() => {
        if (!cancelled) setStats(EMPTY_STATS);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const currentMonth = getCurrentMonthLabel();

  return (
    <div className="ui-page">
      <AdminDashboardHero
        stats={stats}
        responsables={responsables}
        loading={loading}
        currentMonth={currentMonth}
      />

      <AdminDashboardKpiCards
        stats={stats}
        responsables={responsables}
        loading={loading}
      />

      <AdminDashboardCharts stats={stats} loading={loading} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <TopResponsablesCard
          responsables={responsables}
          loading={loading}
          onViewAll={() => navigate("/dashboard/admin/responsables")}
        />

        <RecentAbonnementsCard
          abonnements={stats.abonnementsRecents}
          loading={loading}
          onViewAll={() => navigate("/dashboard/admin/abonnements")}
        />

        <RecentTransactionsCard
          paiements={paiements}
          loading={loading}
          onViewAll={() => navigate("/dashboard/admin/transactions")}
        />
      </div>
    </div>
  );
}