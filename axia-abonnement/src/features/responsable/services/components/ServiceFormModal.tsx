import type { FormEvent } from "react";
import type { Service, ServiceForm } from "../types";

interface ServiceFormModalProps {
  open: boolean;
  editingService: Service | null;
  form: ServiceForm;
  formLoading: boolean;
  formError: string;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onFormChange: (form: ServiceForm) => void;
}

export default function ServiceFormModal({
  open,
  editingService,
  form,
  formLoading,
  formError,
  onClose,
  onSubmit,
  onFormChange,
}: ServiceFormModalProps) {
  if (!open) return null;

  const handleParMoisChange = (rawValue: string) => {
    const parMois = rawValue === "" ? "" : parseFloat(rawValue);
    const parAnnee =
      parMois === "" ? "" : parseFloat((Number(parMois) * 12 * 0.8).toFixed(2));

    onFormChange({ ...form, parMois, parAnnee });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl w-full max-w-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-gray-900">
            {editingService ? "Modifier le service" : "Ajouter un service"}
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            aria-label="Fermer la fenêtre"
          >
            ✕
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1">
              Intitulé du service
            </label>

            <input
              type="text"
              value={form.intituleService}
              onChange={(e) =>
                onFormChange({ ...form, intituleService: e.target.value })
              }
              placeholder="Ex: Salle de sport"
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
              placeholder="Décrivez le service..."
              rows={3}
              className="ui-input resize-none"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1">
                Prix / mois <span className="text-gray-400">(TND)</span>
              </label>

              <input
                type="number"
                value={form.parMois}
                onChange={(e) => handleParMoisChange(e.target.value)}
                placeholder="0.00"
                min="0.01"
                step="0.01"
                className="ui-input"
                required
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-800 mb-1">
                Prix annuel <span className="text-gray-400">(TND)</span>
                <span
                  className="px-2 py-0.5 text-xs rounded-full bg-(--color-primary-soft) text-(--color-primary)"
                >
                  -20%
                </span>
              </label>

              <input
                type="number"
                value={form.parAnnee}
                onChange={(e) =>
                  onFormChange({
                    ...form,
                    parAnnee:
                      e.target.value === "" ? "" : parseFloat(e.target.value),
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
            <div className="p-3 bg-blue-50 border border-red-100 rounded-xl">
              <p className="text-sm text-blue-700">{formError}</p>
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
              disabled={formLoading}
              className="flex-1 ui-btn-primary py-3 disabled:opacity-50"
            >
              {formLoading
                ? "Enregistrement..."
                : editingService
                  ? "Modifier"
                  : "Créer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}