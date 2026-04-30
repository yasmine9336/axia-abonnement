import type { ResponsableItem } from "../types";

interface TopResponsablesCardProps {
  responsables: ResponsableItem[];
  loading: boolean;
  onViewAll: () => void;
}

export default function TopResponsablesCard({
  responsables,
  loading,
  onViewAll,
}: TopResponsablesCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-bold text-gray-900">Top Responsables</h2>

        <button
          type="button"
          onClick={onViewAll}
          className="text-xs font-semibold hover:underline"
          style={{ color: "var(--color-primary)" }}
        >
          Voir tous →
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-12 bg-gray-100 rounded-xl animate-pulse"
            />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {responsables.slice(0, 5).map((responsable) => (
            <div
              key={responsable.id}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{
                    background: "var(--color-primary-soft)",
                    color: "var(--color-primary)",
                  }}
                >
                  {responsable.username.slice(0, 2).toUpperCase()}
                </div>

                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {responsable.username}
                  </p>

                  <p className="text-xs text-gray-400">
                    {responsable.nombreAbonnes} client
                    {responsable.nombreAbonnes !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {responsables.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-4">
              Aucun responsable
            </p>
          )}
        </div>
      )}
    </div>
  );
}