import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";
import axiosInstance from "../../../services/api/axiosInstance";

import ResponsableDashboardHero from "./components/ResponsableDashboardHero";
import ResponsableDashboardCharts from "./components/ResponsableDashboardCharts";
import RecentSubscriptionsCard from "./components/RecentSubscriptionsCard";
import ChurnPredictionsCard from "./components/ChurnPredictionsCard";

import type { Stats } from "./types";
import { EMPTY_STATS } from "./types";
import { monthLabelFR, monthShortFR } from "./utils";

export default function ResponsableDashboardHome() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState<Stats>(EMPTY_STATS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    axiosInstance
      .get<Stats>("/abonnements/stats")
      .then((response) => {
        if (!cancelled) setStats(response.data ?? EMPTY_STATS);
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

  const period = useMemo(() => monthLabelFR(new Date()), []);
  const periodShort = useMemo(() => monthShortFR(new Date()), []);

  const pieData = useMemo(
    () =>
      [
        { name: "Actifs", value: Number(stats.abonnementsActifs) || 0 },
        { name: "Expirés", value: Number(stats.abonnementsExpires) || 0 },
        { name: "En attente", value: Number(stats.demandesEnAttente) || 0 },
      ].filter((item) => item.value > 0),
    [
      stats.abonnementsActifs,
      stats.abonnementsExpires,
      stats.demandesEnAttente,
    ],
  );

  const pieTotal = useMemo(
    () =>
      (Number(stats.abonnementsActifs) || 0) +
      (Number(stats.abonnementsExpires) || 0) +
      (Number(stats.demandesEnAttente) || 0),
    [
      stats.abonnementsActifs,
      stats.abonnementsExpires,
      stats.demandesEnAttente,
    ],
  );

  const goToSuiviAbonnements = () =>
    navigate("/dashboard/responsable/suivi-abonnements");

  return (
    <div className="ui-page">
      <ResponsableDashboardHero
        username={user?.username}
        period={period}
        stats={stats}
      />


      <ResponsableDashboardCharts
        stats={stats}
        loading={loading}
        period={period}
        periodShort={periodShort}
        pieData={pieData}
        pieTotal={pieTotal}
      />

      <div className="grid grid-cols-2 gap-4">
        <RecentSubscriptionsCard
          abonnements={stats.abonnementsRecents}
          loading={loading}
          onViewAll={goToSuiviAbonnements}
        />
        <ChurnPredictionsCard />
      </div>
    </div>
  );
}
