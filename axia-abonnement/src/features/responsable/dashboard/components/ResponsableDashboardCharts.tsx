import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Label,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { Stats } from "../types";

const PIE_COLORS = ["#3b82f6", "#1e3a8a", "#bfdbfe"];

interface PieDataItem {
  name: string;
  value: number;
}

interface ResponsableDashboardChartsProps {
  stats: Stats;
  loading: boolean;
  period: string;
  periodShort: string;
  pieData: PieDataItem[];
  pieTotal: number;
}

export default function ResponsableDashboardCharts({
  stats,
  loading,
  period,
  periodShort,
  pieData,
  pieTotal,
}: ResponsableDashboardChartsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
      <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-gray-900">
            Revenus des 6 derniers mois
          </h2>

          <span className="text-xs text-gray-400">
            {periodShort} – {period}
          </span>
        </div>

        {loading ? (
          <div className="h-56 bg-gray-100 rounded-xl animate-pulse" />
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={stats.revenuParMois} barSize={46}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />

              <XAxis
                dataKey="mois"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "#9ca3af" }}
              />

              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "#9ca3af" }}
              />

              <Tooltip
                formatter={(value) => [`${Number(value) || 0} TND`, "Revenu"]}
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid #e5e7eb",
                  fontSize: 12,
                }}
              />

              <Bar
                dataKey="revenu"
                fill="var(--color-primary)"
                radius={[10, 10, 10, 10]}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h2 className="text-base font-bold text-gray-900 mb-4">Répartition</h2>

        {loading ? (
          <div className="h-56 bg-gray-100 rounded-xl animate-pulse" />
        ) : pieTotal === 0 ? (
          <div className="h-56 flex items-center justify-center text-sm text-gray-400">
            Aucune donnée
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    stroke="none"
                  >
                    {pieData.map((_, index) => (
                      <Cell
                        key={index}
                        fill={PIE_COLORS[index % PIE_COLORS.length]}
                      />
                    ))}

                    <Label
                      value={`${pieTotal}\n total`}
                      position="center"
                      style={{
                        fill: "#111827",
                        fontSize: 14,
                        fontWeight: 700,
                        whiteSpace: "pre-line",
                      }}
                    />
                  </Pie>

                  <Tooltip
                    contentStyle={{
                      borderRadius: 12,
                      border: "1px solid #e5e7eb",
                      fontSize: 12,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  Actifs
                </div>
                <span className="font-semibold text-gray-900">
                  {Number(stats.abonnementsActifs) || 0}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-900" />
                  Expirés
                </div>
                <span className="font-semibold text-gray-900">
                  {Number(stats.abonnementsExpires) || 0}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-200" />
                  En attente
                </div>
                <span className="font-semibold text-gray-900">
                  {Number(stats.demandesEnAttente) || 0}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}