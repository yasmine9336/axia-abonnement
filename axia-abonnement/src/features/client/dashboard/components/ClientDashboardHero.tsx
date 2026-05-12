interface ClientDashboardHeroProps {
  username?: string;
  abonnementsActifs: number;
  totalDepense: number;
  totalCeMois: number;
}

export default function ClientDashboardHero({
  username,
  abonnementsActifs,
  totalDepense,
  totalCeMois,
}: ClientDashboardHeroProps) {
  const now = new Date();
  const period = now.toLocaleDateString("fr-FR", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="mb-6 rounded-2xl overflow-hidden border border-blue-200 shadow-md">
      <div
        className="p-8"
        style={{
          background: "linear-gradient(135deg, #2979ff 0%, #1565c0 100%)",
        }}
      >
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div>
            <p className="text-xs font-semibold text-blue-200 tracking-widest uppercase">
              Bienvenue, {String(username ?? "").toUpperCase()}
            </p>
            <h2 className="text-3xl font-extrabold text-white mt-1">
              Tableau de bord
            </h2>
            <p className="text-blue-200 text-sm mt-1">
              {period} · Aperçu de vos abonnements
            </p>
          </div>

          <div className="flex items-center gap-4">
            {[
              { value: abonnementsActifs, label: "Abonnements actifs" },
              { value: `${totalDepense.toFixed(2)} TND`, label: "Total payé" },
              ...(totalCeMois > 0
                ? [
                    {
                      value: `${totalCeMois.toFixed(2)} TND`,
                      label: "Ce mois-ci",
                    },
                  ]
                : []),
            ].map(({ value, label }) => (
              <div
                key={label}
                className="text-center bg-white/10 backdrop-blur-sm rounded-xl px-5 py-3 border border-white/20"
              >
                <div className="text-xl font-bold text-white">{value}</div>
                <div className="text-xs text-blue-200 mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
