import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import ExportButton from "../../../../components/common/ExportButton";
import type { Stats } from "../types";

const PIE_COLORS = ["#22c55e", "#f59e0b", "#ef4444"];

interface AdminDashboardChartsProps {
  stats: Stats;
  loading: boolean;
}

export default function AdminDashboardCharts({
  stats,
  loading,
}: AdminDashboardChartsProps) {
  const pieData = [
    { name: "Actifs", value: stats.abonnementsActifs },
    { name: "En attente", value: stats.demandesEnAttente },
    { name: "Expirés", value: stats.abonnementsExpires },
  ];

  const total = pieData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
      <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-gray-900">
            Évolution des revenus
          </h2>

          <ExportButton
            data={stats.revenuParMois}
            columns={[
              { key: "mois", label: "Mois" },
              { key: "revenu", label: "Revenu (TND)" },
            ]}
            filename="revenus-mensuels"
            label="Exporter"
            sheetName="Revenus"
            pdfTitle="Évolution des revenus mensuels"
          />
        </div>

        {loading ? (
          <div className="h-48 bg-gray-100 rounded-xl animate-pulse" />
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={stats.revenuParMois} barSize={32}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />

              <XAxis
                dataKey="mois"
                tick={{ fontSize: 12, fill: "#9ca3af" }}
                axisLine={false}
                tickLine={false}
              />

              <YAxis
                tick={{ fontSize: 12, fill: "#9ca3af" }}
                axisLine={false}
                tickLine={false}
              />

              <Tooltip
                formatter={(value) => [`${Number(value) || 0} TND`, "Revenu"]}
                contentStyle={{
                  borderRadius: "12px",
                  border: "1px solid #e5e7eb",
                  fontSize: 12,
                }}
              />

              <Bar
                dataKey="revenu"
                fill="var(--color-primary)"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h2 className="text-base font-bold text-gray-900 mb-4">
          Répartition abonnements
        </h2>

        {loading ? (
          <div className="h-48 bg-gray-100 rounded-xl animate-pulse" />
        ) : (
          <div className="flex items-center gap-6">
            <div
              className="relative shrink-0"
              style={{ width: 150, height: 150 }}
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((_, index) => (
                      <Cell
                        key={index}
                        fill={PIE_COLORS[index % PIE_COLORS.length]}
                      />
                    ))}
                  </Pie>

                  <Tooltip
                    contentStyle={{
                      borderRadius: "12px",
                      border: "1px solid #e5e7eb",
                      fontSize: 12,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>

              <div
                className="absolute pointer-events-none text-center"
                style={{
                  left: "50%",
                  top: "50%",
                  transform: "translate(-50%, -50%)",
                }}
              >
                <p className="text-2xl font-bold text-gray-900 leading-none">
                  {total}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">total</p>
              </div>
            </div>

            <div className="space-y-3 flex-1">
              {pieData.map((item, index) => {
                const percentage =
                  total > 0 ? Math.round((item.value / total) * 100) : 0;

                return (
                  <div key={item.name} className="flex items-center gap-2">
                    <div
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: PIE_COLORS[index] }}
                    />

                    <span className="text-xs text-gray-600 flex-1">
                      {item.name}
                    </span>

                    <span className="text-xs text-gray-400 w-8 text-right">
                      {percentage}%
                    </span>

                    <span className="text-xs font-bold text-gray-900 w-4 text-right">
                      {item.value}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}