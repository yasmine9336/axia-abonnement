import ConfirmModal from "../../../../components/common/ConfirmModal";

interface DeleteServiceModalProps {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function DeleteServiceModal({
  open,
  onCancel,
  onConfirm,
}: DeleteServiceModalProps) {
  return (
    <ConfirmModal
      open={open}
      title="Supprimer le service ?"
      description="Cette action est irréversible."
      confirmText="Supprimer"
      cancelText="Annuler"
      danger
      onCancel={onCancel}
      onConfirm={onConfirm}
    />
  );
}