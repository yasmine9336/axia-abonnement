import { useCallback, useEffect, useMemo, useState } from "react";
import { PackageCheck } from "lucide-react";
import axiosInstance from "../../../services/api/axiosInstance";
import EmptyState from "../../../components/common/EmptyState";
import LoadingState from "../../../components/common/LoadingState";

import AbonnementsKpiCards from "./components/AbonnementsKpiCards";
import SubscriptionGroup from "./components/SubscriptionGroup";

import type { Abonnement } from "./types";

export default function MesAbonnementsSection() {
  const [abonnements, setAbonnements] = useState<Abonnement[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAbonnements = useCallback(async () => {
    try {
      const response = await axiosInstance.get<Abonnement[]>("/abonnements");
      const data = response.data ?? [];

      const withStatut = await Promise.all(
        data.map(async (abonnement) => {
          const statutDemandePromise =
            abonnement.statut === "expiré"
              ? axiosInstance
                  .get<{ statut: string | null }>(
                    `/demandes/${abonnement.id}/statut`,
                  )
                  .then((result) => result.data.statut)
                  .catch(() => null)
              : Promise.resolve(null);

          const noteFeedbackPromise = axiosInstance
            .get<{ note: number | null }>(
              `/feedbacks/${abonnement.id}/my-note`,
            )
            .then((result) => result.data.note ?? null)
            .catch(() => null);

          const [statutDemande, noteFeedback] = await Promise.all([
            statutDemandePromise,
            noteFeedbackPromise,
          ]);

          return {
            ...abonnement,
            statutDemande:
              abonnement.statut === "expiré" ? statutDemande : null,
            noteFeedback,
          };
        }),
      );

      withStatut.sort(
        (first, second) =>
          new Date(second.dateFin).getTime() -
          new Date(first.dateFin).getTime(),
      );

      setAbonnements(withStatut);
    } catch {
      setAbonnements([]);
    }
  }, []);

  useEffect(() => {
    let active = true;

    const fetchData = async () => {
      await loadAbonnements();

      if (active) setLoading(false);
    };

    void fetchData();

    return () => {
      active = false;
    };
  }, [loadAbonnements]);

  const renouveler = async (id: string) => {
    await axiosInstance.post(`/demandes/${id}/renouveler`);
    await loadAbonnements();
  };

  const payer = async (id: string) => {
    const response = await axiosInstance.post<{ url: string }>(
      "/payment/create-renewal-session",
      {
        abonnementId: id,
      },
    );

    window.location.href = response.data.url;
  };

  const actifs = useMemo(
    () => abonnements.filter((abonnement) => abonnement.statut === "actif"),
    [abonnements],
  );

  const expires = useMemo(
    () => abonnements.filter((abonnement) => abonnement.statut === "expiré"),
    [abonnements],
  );

  const enAttente = useMemo(
    () =>
      abonnements.filter((abonnement) => abonnement.statut === "en_attente"),
    [abonnements],
  );

  const totalPaye = useMemo(
    () =>
      actifs.reduce(
        (sum, abonnement) => sum + (abonnement.montant || 0),
        0,
      ),
    [actifs],
  );

  if (loading) return <LoadingState heightClassName="min-h-100" />;

  return (
    <div className="ui-page">
      <div className="mb-6">
        <h1 className="ui-title">Mes abonnements</h1>

        <p className="ui-subtitle">
          Gérez et suivez tous vos abonnements.
        </p>
      </div>

      <AbonnementsKpiCards
        actifsCount={actifs.length}
        expiresCount={expires.length}
        totalPaye={totalPaye}
      />

      {abonnements.length === 0 ? (
        <EmptyState title="Aucun abonnement trouvé." />
      ) : (
        <div className="space-y-10">
          <SubscriptionGroup
            title="Abonnements actifs"
            abonnements={actifs}
            onRenouveler={(id) => void renouveler(id)}
            onPayer={(id) => void payer(id)}
            emptyContent={
              <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center text-gray-500">
                Aucun abonnement actif
              </div>
            }
          />

          {enAttente.length > 0 && (
            <SubscriptionGroup
              title="En attente"
              abonnements={enAttente}
              onRenouveler={(id) => void renouveler(id)}
              onPayer={(id) => void payer(id)}
              emptyContent={null}
            />
          )}

          <SubscriptionGroup
            title="Abonnements expirés"
            abonnements={expires}
            onRenouveler={(id) => void renouveler(id)}
            onPayer={(id) => void payer(id)}
            emptyContent={
              <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
                <div
                  className="mx-auto w-12 h-12 rounded-2xl flex items-center justify-center mb-3"
                  style={{ background: "var(--color-primary-soft)" }}
                >
                  <PackageCheck
                    className="w-6 h-6"
                    style={{ color: "var(--color-primary)" }}
                  />
                </div>

                <p className="text-gray-500">Aucun abonnement expiré</p>
              </div>
            }
          />
        </div>
      )}
    </div>
  );
}