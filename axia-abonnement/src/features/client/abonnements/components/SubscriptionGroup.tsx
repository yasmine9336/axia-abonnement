import type { ReactNode } from "react";
import type { Abonnement } from "../types";
import SubscriptionCard from "./SubscriptionCard";

interface SubscriptionGroupProps {
  title: string;
  abonnements: Abonnement[];
  emptyContent: ReactNode;
  onRenouveler: (id: string) => void;
  onPayer: (id: string) => void;
}

export default function SubscriptionGroup({
  title,
  abonnements,
  emptyContent,
  onRenouveler,
  onPayer,
}: SubscriptionGroupProps) {
  return (
    <section>
      <h2 className="text-xs uppercase tracking-wide text-gray-400 mb-3">
        {title}
      </h2>

      {abonnements.length === 0 ? (
        emptyContent
      ) : (
        <div className="space-y-4">
          {abonnements.map((abonnement) => (
            <SubscriptionCard
              key={abonnement.id}
              abonnement={abonnement}
              onRenouveler={onRenouveler}
              onPayer={onPayer}
            />
          ))}
        </div>
      )}
    </section>
  );
}