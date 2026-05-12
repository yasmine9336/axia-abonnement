import { useState } from "react";
import axiosInstance from "../../../../services/api/axiosInstance";

interface StarFeedbackProps {
  abonnementId: string;
  noteFeedback?: number | null;
}

export default function StarFeedback({
  abonnementId,
  noteFeedback,
}: StarFeedbackProps) {
  const [hover, setHover] = useState(0);
  const [selected, setSelected] = useState(noteFeedback ?? 0);

  const alreadySent = selected > 0;

  const handleClick = async (note: number) => {
    if (alreadySent) return;

    await axiosInstance.post("/feedbacks", {
      abonnementId,
      note,
    });

    setSelected(note);
  };

  const label = alreadySent
    ? noteFeedback
      ? "Déjà noté"
      : "Merci pour votre avis"
    : "Notez ce service";

  return (
    <div className="mt-5 pt-4 border-t border-gray-100">
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500">{label}</span>

        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              disabled={alreadySent}
              onClick={() => void handleClick(star)}
              onMouseEnter={() => !alreadySent && setHover(star)}
              onMouseLeave={() => setHover(0)}
              className="disabled:cursor-default"
              aria-label={`Noter ${star} étoiles`}
            >
              <svg
                className={`w-5 h-5 transition-colors ${
                  star <= (hover || selected)
                    ? "text-blue-400"
                    : "text-gray-200"
                }`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}