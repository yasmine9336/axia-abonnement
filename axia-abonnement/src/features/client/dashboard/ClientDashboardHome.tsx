import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";
import axiosInstance from "../../../services/api/axiosInstance";
import { useNotifications } from "../../../hooks/useNotifications";
import ClientDashboardHero from "./components/ClientDashboardHero";

import RenewalBanner from "./components/RenewalBanner";
import ExpensesChart from "./components/ExpensesChart";
import ActiveSubscriptionsCard from "./components/ActiveSubscriptionsCard";
import RecommendationsCard from "./components/RecommendationsCard";

import type { AbonnementItem, PaiementItem } from "./types";
import { buildDepensesParMois, getChartLabel, joursRestants } from "./utils";

export default function ClientDashboardHome() {
  const { user } = useAuth();
  const navigate = useNavigate();
  useNotifications();

  const [abonnements, setAbonnements] = useState<AbonnementItem[]>([]);
  const [paiements, setPaiements] = useState<PaiementItem[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [now] = useState(() => Date.now());

  useEffect(() => {
    let cancelled = false;

    Promise.all([
      axiosInstance.get<AbonnementItem[]>("/abonnements"),
      axiosInstance.get<PaiementItem[]>("/payment/history"),
    ])
      .then(([abonnementsResponse, paiementsResponse]) => {
        if (cancelled) return;

        setAbonnements(abonnementsResponse.data ?? []);
        setPaiements(paiementsResponse.data ?? []);
      })
      .catch(() => {
        if (!cancelled) {
          setAbonnements([]);
          setPaiements([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingData(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const abonnementsActifs = useMemo(
    () => abonnements.filter((abonnement) => abonnement.statut === "actif"),
    [abonnements],
  );

  const totalDepense = useMemo(
    () => paiements.reduce((sum, paiement) => sum + paiement.montant, 0),
    [paiements],
  );

  const totalCeMois = useMemo(() => {
    const currentDate = new Date();

    return paiements
      .filter((paiement) => {
        const date = new Date(paiement.createdAt);

        return (
          date.getMonth() === currentDate.getMonth() &&
          date.getFullYear() === currentDate.getFullYear()
        );
      })
      .reduce((sum, paiement) => sum + paiement.montant, 0);
  }, [paiements]);

  const depensesParMois = useMemo(
    () => buildDepensesParMois(paiements),
    [paiements],
  );

  const prochainRenouvellement = abonnementsActifs
    .slice()
    .sort(
      (a, b) => new Date(a.dateFin).getTime() - new Date(b.dateFin).getTime(),
    )[0];

  const joursAvantRenouvellement = prochainRenouvellement
    ? joursRestants(prochainRenouvellement.dateFin, now)
    : null;

  const chartLabel = getChartLabel(depensesParMois[0]?.mois);

  return (
    <div className="ui-page">

      <RenewalBanner
        abonnement={prochainRenouvellement}
        joursAvantRenouvellement={joursAvantRenouvellement}
        onManage={() => navigate("/dashboard/client/subscriptions")}
      />

      <ClientDashboardHero
        username={user?.username}
        abonnementsActifs={abonnementsActifs.length}
        totalDepense={totalDepense}
        totalCeMois={totalCeMois}
      />

      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        <ExpensesChart
          loading={loadingData}
          data={depensesParMois}
          chartLabel={chartLabel}
        />

        <ActiveSubscriptionsCard
          loading={loadingData}
          abonnementsActifs={abonnementsActifs}
          now={now}
          onExplore={() => navigate("/")}
        />
      </div>

      <RecommendationsCard />
    </div>
  );
}
