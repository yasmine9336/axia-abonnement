import KpiCard from "../../../../components/common/KpiCard";

interface AbonnementsKpiCardsProps {
  actifsCount: number;
  expiresCount: number;
  totalPaye: number;
}

export default function AbonnementsKpiCards({
  actifsCount,
  expiresCount,
  totalPaye,
}: AbonnementsKpiCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <KpiCard
        label="ACTIFS"
        value={actifsCount}
        sub="abonnements en cours"
        borderColorClass="border-t-green-500"
        icon={
          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 block" />
          </div>
        }
      />

      <KpiCard
        label="EXPIRÉS"
        value={expiresCount}
        sub="abonnements terminés"
        borderColorClass="border-t-red-500"
        icon={
          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 block" />
          </div>
        }
      />

      <KpiCard
        label="TOTAL PAYÉ"
        value={`${totalPaye.toFixed(2)} TND`}
        sub="abonnements actifs"
        borderColorClass="border-t-blue-500"
        icon={
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-(--color-primary-soft)">
            <span className="w-2.5 h-2.5 rounded-full block bg-(--color-primary)" />
          </div>
        }
      />
    </div>
  );
}