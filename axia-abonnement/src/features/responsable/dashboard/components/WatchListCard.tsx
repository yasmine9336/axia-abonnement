interface WatchListCardProps {
  demandes: number;
  expires: number;
  totalAlertes: number;
  onViewDetails: () => void;
}

export default function WatchListCard({
  demandes,
  expires,
  totalAlertes,
  onViewDetails,
}: WatchListCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <h2 className="text-base font-bold text-gray-900 mb-4">À surveiller</h2>

      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3 p-3 rounded-xl bg-gray-50">
          <div>
            <p className="text-sm font-semibold text-gray-900">
              Demandes en attente
            </p>

            <p className="text-xs text-gray-400 mt-0.5">
              Renouvellements à traiter
            </p>
          </div>

          <div className="text-right">
            <p className="text-lg font-bold text-gray-900">{demandes}</p>

            <button
              type="button"
              disabled={demandes === 0}
              onClick={onViewDetails}
              className="text-xs font-semibold mt-1 disabled:text-gray-300 disabled:cursor-not-allowed hover:underline"
              style={demandes > 0 ? { color: "var(--color-primary)" } : undefined}
            >
              Voir →
            </button>
          </div>
        </div>

        <div className="flex items-start justify-between gap-3 p-3 rounded-xl bg-gray-50">
          <div>
            <p className="text-sm font-semibold text-gray-900">
              Abonnements expirés
            </p>

            <p className="text-xs text-gray-400 mt-0.5">À suivre</p>
          </div>

          <div className="text-right">
            <p className="text-lg font-bold text-gray-900">{expires}</p>

            <button
              type="button"
              disabled={expires === 0}
              onClick={onViewDetails}
              className="text-xs font-semibold mt-1 disabled:text-gray-300 disabled:cursor-not-allowed hover:underline"
              style={expires > 0 ? { color: "var(--color-primary)" } : undefined}
            >
              Voir →
            </button>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
        <p className="text-xs text-gray-400">Total alertes</p>
        <p className="text-sm font-bold text-gray-900">{totalAlertes}</p>
      </div>
    </div>
  );
}