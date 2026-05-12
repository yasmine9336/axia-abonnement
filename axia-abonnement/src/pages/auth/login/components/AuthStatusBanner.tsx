import type { StatusBanner } from "../types";

interface AuthStatusBannerProps {
  banner: StatusBanner;
}

const bannerStyles: Record<NonNullable<StatusBanner>["tone"], string> = {
  info: "bg-blue-50 border-blue-200 text-blue-800",
  warning: "bg-yellow-50 border-yellow-200 text-yellow-800",
  error: "bg-blue-50 border-red-200 text-blue-800",
  success: "bg-blue-50 border-green-200 text-blue-800",
};

export default function AuthStatusBanner({ banner }: AuthStatusBannerProps) {
  if (!banner) return null;

  return (
    <div className={`mb-5 p-4 rounded-xl border ${bannerStyles[banner.tone]}`}>
      <p className="font-semibold text-sm">{banner.title}</p>

      <p className="text-sm mt-1">{banner.message}</p>

      {banner.action && (
        <button
          type="button"
          onClick={banner.action.onClick}
          className="mt-3 w-full py-2 text-white font-semibold rounded-lg text-sm bg-(--color-primary)"
        >
          {banner.action.label}
        </button>
      )}
    </div>
  );
}