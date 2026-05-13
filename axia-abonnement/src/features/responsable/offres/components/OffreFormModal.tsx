import type { FormEvent } from "react";
import type { Offre, OffreForm, Service } from "../types";
import { useAuth } from "../../../../hooks/useAuth";
import { useValidateSector } from "../../../../hooks/useValidateSector";

interface OffreFormModalProps {
  open: boolean;
  editingOffre: Offre | null;
  form: OffreForm;
  services: Service[];
  formLoading: boolean;
  formError: string;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onFormChange: (form: OffreForm) => void;
  onDureeEnMoisChange: (value: number | "") => void;
  onToggleService: (id: string) => void;
}

export default function OffreFormModal({
  open,
  editingOffre,
  form,
  services,
  formLoading,
  formError,
  onClose,
  onSubmit,
  onFormChange,
  onDureeEnMoisChange,
  onToggleService,
}: OffreFormModalProps) {
  const { user } = useAuth();
  const secteur = user?.secteurActivite ?? "";

  const { result, checking } = useValidateSector(
    form.intituleOffre,
    form.description,
    secteur,
  );

  const sectorBlocked = result !== null && !result.valid;

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-gray-900">
            {editingOffre ? "Modifier l'offre" : "Ajouter une offre"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            aria-label="Fermer la fenêtre"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {secteur && (
          <div className="mb-4 flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-100 rounded-xl">
            <span className="text-xs font-semibold text-blue-700">Secteur :</span>
            <span className="text-xs text-blue-600">{secteur}</span>
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1">
              Intitulé de l'offre
            </label>
            <input
              type="text"
              value={form.intituleOffre}
              onChange={(e) =>
                onFormChange({ ...form, intituleOffre: e.target.value })
              }
              placeholder="Ex: Pack Entrepreneur"
              className="ui-input"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) =>
                onFormChange({ ...form, description: e.target.value })
              }
              placeholder="Décrivez l'offre..."
              rows={2}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 placeholder-gray-400 outline-none focus:ring-2 focus:ring-[#0F6CBD]/30 focus:border-[#0F6CBD] resize-none"
              required
            />
            {checking && (
              <p className="mt-1 text-xs text-gray-400 animate-pulse">
                Vérification du secteur…
              </p>
            )}
            {!checking && sectorBlocked && (
              <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2">
                <span className="text-red-500 text-base mt-0.5">⚠</span>
                <div>
                  <p className="text-sm font-semibold text-red-700">
                    Cette offre ne correspond pas à votre secteur
                  </p>
                  <p className="text-xs text-red-600 mt-0.5">{result.message}</p>
                </div>
              </div>
            )}
            {!checking && result?.valid && (
              <p className="mt-1 text-xs text-green-600 flex items-center gap-1">
                <span>✓</span> Contenu cohérent avec votre secteur
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-800 mb-2">
              Services inclus
            </label>
            <div className="space-y-2 max-h-40 overflow-y-auto bg-gray-50 border border-gray-200 rounded-xl p-3">
              {services.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-2">
                  Aucun service disponible
                </p>
              ) : (
                services.map((service) => (
                  <label key={service.id} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.serviceIds.includes(service.id)}
                      onChange={() => onToggleService(service.id)}
                      className="rounded accent-(--color-primary)"
                    />
                    <span className="text-sm text-gray-700">
                      {service.intituleService}
                    </span>
                  </label>
                ))
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1">
                Durée <span className="text-gray-400">(mois)</span>
              </label>
              <input
                type="number"
                value={form.dureeEnMois}
                onChange={(e) =>
                  onDureeEnMoisChange(
                    e.target.value === "" ? "" : parseInt(e.target.value),
                  )
                }
                placeholder="Ex: 3"
                min="1"
                step="1"
                className="ui-input"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1">
                Prix <span className="text-gray-400">(TND)</span>
              </label>
              <input
                type="number"
                value={form.prix}
                onChange={(e) =>
                  onFormChange({
                    ...form,
                    prix: e.target.value === "" ? "" : parseFloat(e.target.value),
                  })
                }
                placeholder="0.00"
                min="0.01"
                step="0.01"
                className="ui-input"
                required
              />
            </div>
          </div>

          {formError && (
            <div className="p-3 bg-red-50 border border-red-100 rounded-xl">
              <p className="text-sm text-red-700">{formError}</p>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-gray-200 text-gray-600 hover:bg-gray-50 font-semibold py-3 rounded-xl transition-colors text-sm"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={formLoading || sectorBlocked || checking}
              className="flex-1 ui-btn-primary py-3 disabled:opacity-50"
            >
              {formLoading
                ? "Enregistrement..."
                : editingOffre
                  ? "Modifier"
                  : "Créer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}