interface AuthIllustrationPanelProps {
  illustration: string;
  alt: string;
  imageClassName?: string;
}

export default function AuthIllustrationPanel({
  illustration,
  alt,
  imageClassName = "w-72",
}: AuthIllustrationPanelProps) {
  return (
    <div
      className="hidden lg:flex lg:w-[45%] flex-col items-center justify-center relative overflow-hidden"
      style={{ background: "var(--color-primary)" }}
    >
      <div
        className="absolute w-96 h-96 rounded-full opacity-10"
        style={{ background: "white", top: "-80px", right: "-80px" }}
      />

      <div
        className="absolute w-64 h-64 rounded-full opacity-10"
        style={{ background: "white", bottom: "-40px", left: "-40px" }}
      />

      <img
        src={illustration}
        alt={alt}
        className={`${imageClassName} relative z-10`}
      />
    </div>
  );
}