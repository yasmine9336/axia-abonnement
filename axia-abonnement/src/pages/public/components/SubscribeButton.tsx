interface SubscribeButtonProps {
  label?: string;
  onClick: () => void;
}

export default function SubscribeButton({
  label = "Choisir cette offre",
  onClick,
}: SubscribeButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full py-3 rounded-xl font-semibold text-sm transition-all duration-300 mt-auto border border-(--color-primary) text-(--color-primary) hover:bg-(--color-primary) hover:text-white"
    >
      {label}
    </button>
  );
}