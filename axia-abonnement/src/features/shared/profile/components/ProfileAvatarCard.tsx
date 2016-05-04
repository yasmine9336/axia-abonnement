import type { ProfileData } from "../types";
import { getInitial, getPhotoUrl, getRoleLabel } from "../utils";

interface ProfileAvatarCardProps {
  profile: ProfileData | null;
  photoLoading: boolean;
  photoError: string;
  onPhotoUpload: (file: File) => void;
}

export default function ProfileAvatarCard({
  profile,
  photoLoading,
  photoError,
  onPhotoUpload,
}: ProfileAvatarCardProps) {
  const photoUrl = getPhotoUrl(profile?.profileImageUrl);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 text-center">
      <div className="mb-4 flex justify-center">
        {photoUrl ? (
          <img
            src={photoUrl}
            alt="Photo"
            className="w-20 h-20 rounded-full object-cover border border-gray-200"
          />
        ) : (
          <div className="w-20 h-20 rounded-full flex items-center justify-center text-white text-3xl font-bold bg-(--color-primary)">
            {getInitial(profile)}
          </div>
        )}
      </div>

      <label className="inline-flex items-center justify-center text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors cursor-pointer mb-3 border border-(--color-primary) text-(--color-primary)">
        {photoLoading ? "Upload..." : "Changer la photo"}

        <input
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) onPhotoUpload(file);
            event.currentTarget.value = "";
          }}
        />
      </label>

      {photoError && <p className="text-xs text-red-600 mb-2">{photoError}</p>}

      <h3 className="font-bold text-gray-900 text-base mt-2">
        {profile?.username}
      </h3>

      <p className="text-xs text-gray-500 mt-0.5">{profile?.email}</p>

      <span className="inline-block mt-3 text-xs font-semibold px-3 py-1 rounded-full bg-(--color-primary-soft) text-(--color-primary)">
        {getRoleLabel(profile?.role)}
      </span>
    </div>
  );
}