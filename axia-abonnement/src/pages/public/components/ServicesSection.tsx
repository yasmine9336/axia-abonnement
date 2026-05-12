import type { Service } from "../types";
import ServiceCard from "./ServiceCard";

interface ServicesSectionProps {
  services: Service[];
  loading: boolean;
  onSubscribeService: (serviceId: string) => void;
  onVoirPlus: () => void;
}

export default function ServicesSection({
  services,
  loading,
  onSubscribeService,
  onVoirPlus,
}: ServicesSectionProps) {
  return (
    <section id="services" className="py-20 bg-gray-50">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3">
            Nos Services
          </h2>
          <p className="text-gray-500">
            Découvrez les services les mieux notés par nos abonnés
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
          <div className="flex flex-wrap justify-center gap-4 max-w-6xl mx-auto px-6">
            {services.map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                selectedService={null}
                onSelect={() => {}}
                onSubscribe={onSubscribeService}
              />
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-center mt-10">
        <button
          type="button"
          onClick={onVoirPlus}
          className="px-8 py-3 rounded-xl font-semibold text-sm text-white bg-(--color-primary) transition-opacity hover:opacity-90"
        >
          Voir plus
        </button>
      </div>
    </section>
  );
}
