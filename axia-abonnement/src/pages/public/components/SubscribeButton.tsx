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
      className="w-full py-3 rounded-xl font-semibold text-sm transition-all duration-300 mt-auto border"
      style={{
        borderColor: "var(--color-primary)",
        color: "var(--color-primary)",
      }}
      onMouseEnter={(event) => {
        event.currentTarget.style.background = "var(--color-primary)";
        event.currentTarget.style.color = "white";
      }}
      onMouseLeave={(event) => {
        event.currentTarget.style.background = "transparent";
        event.currentTarget.style.color = "var(--color-primary)";
      }}
    >
      {label}
    </button>
  );
}