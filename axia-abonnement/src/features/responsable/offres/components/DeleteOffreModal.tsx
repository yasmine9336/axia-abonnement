import ConfirmModal from "../../../../components/common/ConfirmModal";

interface DeleteOffreModalProps {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function DeleteOffreModal({
  open,
  onCancel,
  onConfirm,
}: DeleteOffreModalProps) {
  return (
    <ConfirmModal
      open={open}
      title="Supprimer l'offre ?"
      description="Cette action est irréversible."
      confirmText="Supprimer"
      cancelText="Annuler"
      danger
      onCancel={onCancel}
      onConfirm={onConfirm}
    />
  );
}