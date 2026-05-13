import KpiCard from "../../../../components/common/KpiCard";

interface AbonnementsKpiCardsProps {
  totalAbonnements: number;
  totalActifs: number;
  totalExpires: number;
}

export default function AbonnementsKpiCards({
  totalAbonnements,
  totalActifs,
  totalExpires,
}: AbonnementsKpiCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <KpiCard
        label="TOTAL ABONNEMENTS"
        value={totalAbonnements}
        sub="tous statuts confondus"
        borderColorClass="border-t-blue-400"
        icon={
          <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center">
            <span className="text-blue-500 font-bold">▦</span>
          </div>
        }
      />

      <KpiCard
        label="ACTIFS"
        value={totalActifs}
        sub="abonnements en cours"
        borderColorClass="border-t-blue-500"
        icon={
          <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center">
            <span className="text-blue-600 font-bold">✓</span>
          </div>
        }
      />

      <KpiCard
        label="EXPIRÉS"
        value={totalExpires}
        sub="à renouveler"
        borderColorClass="border-t-blue-400"
        icon={
          <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center">
            <span className="text-blue-600 font-bold">⏱</span>
          </div>
        }
      />
    </div>
  );
}