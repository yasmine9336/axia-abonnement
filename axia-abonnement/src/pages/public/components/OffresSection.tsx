import { useEffect, useRef } from "react";
import { ChevronLeft } from "lucide-react";
import type { Offre } from "../types";
import OffreCard from "./OffreCard";

interface OffresSectionProps {
  offres: Offre[];
  loading: boolean;
  selectedService: string | null;
  onClearSelectedService: () => void;
  onSubscribe: (offreId: string) => void;
}

export default function OffresSection({
  offres,
  loading,
  selectedService,
  onClearSelectedService,
  onSubscribe,
}: OffresSectionProps) {
  const offresRef = useRef<HTMLDivElement>(null);

  const loopOffres = [...offres, ...offres, ...offres];

  useEffect(() => {
    const element = offresRef.current;

    if (!element || offres.length === 0) return;

    if (selectedService) {
      element.scrollLeft = 0;
      return;
    }

    const third = element.scrollWidth / 3;
    element.scrollLeft = third;

    const handleScroll = () => {
      const currentThird = element.scrollWidth / 3;

      if (element.scrollLeft >= currentThird * 2) {
        element.scrollLeft -= currentThird;
      } else if (element.scrollLeft <= 0) {
        element.scrollLeft += currentThird;
      }
    };

    element.addEventListener("scroll", handleScroll);

    return () => element.removeEventListener("scroll", handleScroll);
  }, [offres, selectedService]);

  const multiServiceOffres = offres.filter((offre) => offre.services.length > 1);
  const soloServiceOffres = offres.filter((offre) => offre.services.length === 1);

  return (
    <section id="offres" className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-4">
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3">
            Nos Offres
          </h2>

          <p className="text-gray-500">
            {selectedService
              ? `Offres incluant "${selectedService}"`
              : "Économisez avec nos packs combinés"}
          </p>
        </div>

        {selectedService && (
          <div className="flex justify-center mb-8">
            <button
              type="button"
              onClick={onClearSelectedService}
              className="flex items-center gap-2 text-sm text-gray-500 transition-colors"
              onMouseEnter={(event) => {
                event.currentTarget.style.color = "var(--color-primary)";
              }}
              onMouseLeave={(event) => {
                event.currentTarget.style.color = "#6b7280";
              }}
            >
              <ChevronLeft className="w-4 h-4" />
              Voir toutes les offres
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="ui-spinner" />
        </div>
      ) : offres.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-400 text-sm">
            Aucune offre disponible pour ce service.
          </p>
        </div>
      ) : selectedService ? (
        <div className="flex flex-col gap-6 w-full">
          {multiServiceOffres.length > 0 && (
            <div className="flex justify-center gap-6 overflow-x-auto scrollbar-hide pb-2">
              {multiServiceOffres.map((offre, index) => (
                <OffreCard
                  key={`multi-${offre.id}-${index}`}
                  offre={offre}
                  onSubscribe={onSubscribe}
                />
              ))}
            </div>
          )}

          {soloServiceOffres.length > 0 && (
            <div className="flex justify-center gap-6">
              {soloServiceOffres.map((offre, index) => (
                <OffreCard
                  key={`solo-${offre.id}-${index}`}
                  offre={offre}
                  showRating={false}
                  onSubscribe={onSubscribe}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div
          ref={offresRef}
          className="flex gap-6 overflow-x-auto scrollbar-hide scroll-instant items-stretch pb-4 pt-4"
        >
          {loopOffres.map((offre, index) => (
            <OffreCard
              key={`${offre.id}-${index}`}
              offre={offre}
              buttonLabel="S'abonner"
              onSubscribe={onSubscribe}
            />
          ))}
        </div>
      )}
    </section>
  );
}