import type { BillingType, Selection, Service } from "../types";
import { getPrice } from "../utils";
import SubscriptionOptionCard from "./SubscriptionOptionCard";

interface ServicesListProps {
  services: Service[];
  selection: Selection | null;
  type: BillingType;
  onSelect: (service: Service) => void;
}

export default function ServicesList({
  services,
  selection,
  type,
  onSelect,
}: ServicesListProps) {
  return (
    <div>
      <h2 className="text-xs font-bold tracking-widest text-gray-400 mb-4">
        SERVICES
      </h2>

      <div className="grid sm:grid-cols-2 gap-4">
        {services.map((service) => {
          const isSelected =
            selection?.kind === "service" && selection.item.id === service.id;

          return (
            <SubscriptionOptionCard
              key={service.id}
              title={service.intituleService}
              description={service.description}
              price={getPrice(service, type)}
              type={type}
              isSelected={isSelected}
              moyenneNote={service.moyenneNote}
              nombreAvis={service.nombreAvis}
              onClick={() => onSelect(service)}
            />
          );
        })}
      </div>
    </div>
  );
}