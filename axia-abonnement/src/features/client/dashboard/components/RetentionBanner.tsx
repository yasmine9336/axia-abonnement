import { useNavigate } from "react-router-dom";
import { Heart, MessageCircle, Sparkles } from "lucide-react";
import type { RiskLevel } from "../../../../hooks/useMyChurnRisk";

interface RetentionBannerProps {
  riskLevel: RiskLevel;
  onDismiss: () => void;
}

export default function RetentionBanner({
  riskLevel,
  onDismiss,
}: RetentionBannerProps) {
  const navigate = useNavigate();

  if (riskLevel !== "eleve" && riskLevel !== "moyen") return null;

  const isHigh = riskLevel === "eleve";

  return (
    <div
      className={`mb-6 rounded-2xl border p-5 flex items-start gap-4 ${
        isHigh ? "bg-blue-50 border-blue-200" : "bg-blue-50/60 border-blue-100"
      }`}
    >
      <div className="shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
        <Heart size={18} className="text-blue-600" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-bold text-gray-900 text-sm">
          {isHigh
            ? "Votre satisfaction nous tient à cœur"
            : "Comment améliorer votre expérience ?"}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          {isHigh
            ? "Nous avons remarqué une baisse d'activité. Nous sommes là pour vous aider à tirer le meilleur de vos abonnements."
            : "Explorez de nouvelles offres adaptées à vos besoins ou contactez votre responsable."}
        </p>

        <div className="flex flex-wrap gap-2 mt-3">
          <button
            type="button"
            onClick={() => navigate("/dashboard/client/subscribe")}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
          >
            <Sparkles size={12} />
            Découvrir des offres
          </button>
          <button
            type="button"
            onClick={() => {
              const chatBtn = document.querySelector<HTMLButtonElement>(
                '[aria-label="Ouvrir le chat"]',
              );
              chatBtn?.click();
            }}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-blue-300 text-blue-700 hover:bg-blue-100 transition"
          >
            <MessageCircle size={12} />
            Contacter mon responsable
          </button>
        </div>
      </div>

      <button
        type="button"
        onClick={onDismiss}
        className="shrink-0 text-gray-400 hover:text-gray-600 text-lg leading-none"
      >
        ×
      </button>
    </div>
  );
}
