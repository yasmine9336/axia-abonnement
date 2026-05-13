interface ConfirmModalProps {
  open: boolean;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
  loading?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function ConfirmModal({
  open,
  title,
  description,
  confirmText = "Confirmer",
  cancelText = "Annuler",
  danger = false,
  loading = false,
  onCancel,
  onConfirm,
}: ConfirmModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl w-full max-w-sm p-6 text-center">
        <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>

        {description && (
          <p className="text-sm text-gray-500 mb-6">{description}</p>
        )}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="flex-1 border border-gray-200 text-gray-600 hover:bg-gray-50 font-semibold py-3 rounded-xl transition-colors text-sm disabled:opacity-50"
          >
            {cancelText}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 text-white font-semibold py-3 rounded-xl transition-colors text-sm disabled:opacity-50 ${
              danger
                ? "bg-blue-800 hover:bg-blue-900"
                : "bg-(--color-primary) hover:opacity-90"
            }`}
          >
            {loading ? "Traitement..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
