import type { Offre } from "../types";
import OffreCard from "./OffreCard";

interface OffresSectionProps {
  offres: Offre[];
  loading: boolean;
  onSubscribe: (offreId: string) => void;
  onVoirPlus: () => void;
}

export default function OffresSection({
  offres,
  loading,
  onSubscribe,
  onVoirPlus,
}: OffresSectionProps) {
  return (
    <section id="offres" className="py-20">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-4">
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3">
            Nos Offres
          </h2>
          <p className="text-gray-500">
            Économisez avec nos packs combinés les mieux notés
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="ui-spinner" />
        </div>
      ) : offres.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-400 text-sm">
            Aucune offre disponible pour le moment.
          </p>
        </div>
      ) : (
        <div className="flex flex-wrap justify-center gap-6 max-w-6xl mx-auto px-6">
          {offres.map((offre, index) => (
            <div key={offre.id} className="relative pt-3">
              {index === 1 && offres.length >= 2 && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full z-10 whitespace-nowrap">
                  Populaire
                </span>
              )}
              <OffreCard
                offre={offre}
                buttonLabel="S'abonner"
                onSubscribe={onSubscribe}
              />
            </div>
          ))}
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