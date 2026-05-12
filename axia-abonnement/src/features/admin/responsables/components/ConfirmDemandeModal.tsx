import { X } from "lucide-react";
import type { ConfirmAction } from "../types";

interface ConfirmDemandeModalProps {
  confirmAction: ConfirmAction;
  motifRefus: string;
  submitting: boolean;
  onMotifRefusChange: (value: string) => void;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function ConfirmDemandeModal({
  confirmAction,
  motifRefus,
  submitting,
  onMotifRefusChange,
  onCancel,
  onConfirm,
}: ConfirmDemandeModalProps) {
  if (!confirmAction) return null;

  const isAccept = confirmAction.type === "accept";

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md border border-gray-200 shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              {isAccept ? "Accepter la demande" : "Refuser la demande"}
            </h2>

            <p className="text-sm text-gray-400">
              Responsable : {confirmAction.demande.username}
            </p>
          </div>

          <button
            type="button"
            onClick={onCancel}
            className="w-9 h-9 rounded-xl hover:bg-gray-100 flex items-center justify-center"
            aria-label="Fermer la fenêtre"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {isAccept ? (
            <p className="text-sm text-gray-600">
              Voulez-vous accepter cette demande ? Un email avec le lien de
              paiement sera envoyé au responsable.
            </p>
          ) : (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Motif du refus
              </label>

              <textarea
                value={motifRefus}
                onChange={(e) => onMotifRefusChange(e.target.value)}
                className="ui-input min-h-28 resize-none"
                placeholder="Ex : informations incomplètes..."
              />
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="ui-btn-secondary"
            >
              Annuler
            </button>

            <button
              type="button"
              onClick={onConfirm}
              disabled={submitting}
              className={`px-4 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-60 ${
                isAccept ? "bg-blue-600 hover:bg-blue-700" : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {submitting
                ? "Traitement..."
                : isAccept
                  ? "Accepter"
                  : "Refuser"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}