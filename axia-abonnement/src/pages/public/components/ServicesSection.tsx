import type { Service } from "../types";
import ServiceCard from "./ServiceCard";

interface ServicesSectionProps {
  services: Service[];
  loading: boolean;
  selectedService: string | null;
  onSelectService: (intituleService: string) => void;
  onSubscribeService: (serviceId: string) => void;
}

export default function ServicesSection({
  services,
  loading,
  selectedService,
  onSelectService,
  onSubscribeService,
}: ServicesSectionProps) {
  const loopServices = [...services, ...services];

  return (
    <section id="services" className="py-20 bg-gray-50">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3">
            Nos Services
          </h2>

          <p className="text-gray-500">
            Cliquez sur un service pour voir les offres disponibles
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="ui-spinner" />
        </div>
      ) : services.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-400 text-sm">
            Aucun service disponible pour le moment.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden">
          <div className="flex gap-4 animate-scroll-loop w-max pb-2">
            {loopServices.map((service, index) => (
              <ServiceCard
                key={`${service.id}-${index}`}
                service={service}
                selectedService={selectedService}
                onSelect={onSelectService}
                onSubscribe={onSubscribeService}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}