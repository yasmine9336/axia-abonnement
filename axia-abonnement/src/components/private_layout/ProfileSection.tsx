import { useState, useEffect } from "react";
import axiosInstance from "../../api/axiosInstance";

interface ProfileData {
  id: string;
  username: string;
  email: string;
  phoneNumber: string | null;
  role: string;
  profileImageUrl?: string | null;
}

export default function ProfileSection() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  // Formulaire profil
  const [profileForm, setProfileForm] = useState({
    username: "",
    email: "",
    phoneNumber: "",
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState("");
  const [profileError, setProfileError] = useState("");

  // Formulaire mot de passe
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const [photoLoading, setPhotoLoading] = useState(false);
  const [photoError, setPhotoError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axiosInstance.get("/profile");
        setProfile(response.data);
        setProfileForm({
          username: response.data.username,
          email: response.data.email,
          phoneNumber: response.data.phoneNumber || "",
        });
      } catch {
        setProfileError("Erreur lors du chargement du profil.");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleProfileSubmit = async (e: React.BaseSyntheticEvent) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileSuccess("");
    setProfileError("");
    try {
      await axiosInstance.patch("/profile", profileForm);
      setProfileSuccess("Profil mis à jour avec succès.");
      setProfile((prev) => (prev ? { ...prev, ...profileForm } : prev));
      setIsEditing(false);
    } catch (err) {
      const error = err as { response?: { data?: string } };
      setProfileError(error.response?.data || "Erreur lors de la mise à jour.");
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.BaseSyntheticEvent) => {
    e.preventDefault();
    setPasswordSuccess("");
    setPasswordError("");
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("Les mots de passe ne correspondent pas.");
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      setPasswordError("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }
    setPasswordLoading(true);
    try {
      await axiosInstance.patch("/profile/change-password", passwordForm);
      setPasswordSuccess("Mot de passe modifié avec succès.");
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setShowPasswordForm(false);
    } catch (err) {
      const error = err as { response?: { data?: string } };
      setPasswordError(
        error.response?.data || "Mot de passe actuel incorrect.",
      );
    } finally {
      setPasswordLoading(false);
    }
  };

  const getInitial = () => profile?.username?.charAt(0).toUpperCase() || "U";

  const getPhotoUrl = (photoPath?: string | null) => {
    if (!photoPath) return null;
    if (photoPath.startsWith("http")) return photoPath;
    return `https://localhost:7000${photoPath}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-[#4F46E5] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const handlePhotoUpload = async (file: File) => {
    setPhotoError("");

    // Validation type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setPhotoError("Format invalide. Utilisez JPG, PNG ou WEBP.");
      return;
    }

    // Validation taille (2 MB)
    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
      setPhotoError("Image trop volumineuse (max 2MB).");
      return;
    }

    const formData = new FormData();
    formData.append("photo", file);

    setPhotoLoading(true);
    try {
      const response = await axiosInstance.patch("/profile/photo", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const newPhotoUrl = response.data?.profileImageUrl;
      setProfile((prev) =>
        prev ? { ...prev, profileImageUrl: newPhotoUrl } : prev,
      );
    } catch {
      setPhotoError("Erreur lors de l'upload de la photo.");
    } finally {
      setPhotoLoading(false);
    }
  };

  return (
    <div className="p-6 lg:p-8 w-full">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Paramètres du profil
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Gérez les informations de votre compte
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 max-w-5xl w-full mx-auto">
        {/* Carte avatar */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 text-center md:col-span-1 h-fit">
          <div className="mb-4 flex justify-center">
            {getPhotoUrl(profile?.profileImageUrl) ? (
              <img
                src={getPhotoUrl(profile?.profileImageUrl)!}
                alt="Photo de profil"
                className="w-24 h-24 rounded-full object-cover border border-gray-200"
              />
            ) : (
              <div className="w-24 h-24 bg-[#4F46E5] rounded-full flex items-center justify-center text-white text-3xl font-bold">
                {getInitial()}
              </div>
            )}
          </div>
          <div className="mb-4">
            <label className="inline-flex items-center justify-center border border-[#4F46E5] text-[#4F46E5] hover:bg-[#4F46E5] hover:text-white text-xs font-semibold px-3 py-2 rounded-lg transition-colors cursor-pointer">
              {photoLoading ? "Upload..." : "Changer la photo"}
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handlePhotoUpload(file);
                  e.currentTarget.value = "";
                }}
              />
            </label>
          </div>

          {photoError && (
            <p className="text-xs text-red-600 mb-3">{photoError}</p>
          )}
          <h3 className="font-bold text-gray-900 text-lg mb-1">
            {profile?.username}
          </h3>
          <p className="text-sm text-gray-500 mb-6">{profile?.email}</p>
          <span className="inline-block bg-[#4F46E5]/10 text-[#4F46E5] text-xs font-semibold px-3 py-1 rounded-full">
            {profile?.role}
          </span>
        </div>

        {/* Informations du compte */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 md:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900">
              Informations du compte
            </h2>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="border border-[#4F46E5] text-[#4F46E5] hover:bg-[#4F46E5] hover:text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
              >
                Modifier
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setProfileSuccess("");
                    setProfileError("");
                  }}
                  className="border border-gray-300 text-gray-600 hover:bg-gray-50 text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleProfileSubmit}
                  disabled={profileLoading}
                  className="bg-[#4F46E5] hover:bg-[#3730A3] text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors disabled:opacity-50"
                >
                  {profileLoading ? "Enregistrement..." : "Enregistrer"}
                </button>
              </div>
            )}
          </div>

          <form onSubmit={handleProfileSubmit} className="space-y-4">
            {/* Nom complet */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                <svg
                  className="w-4 h-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <label className="block text-xs text-gray-500 mb-1">
                  Nom complet
                </label>
                <input
                  type="text"
                  value={profileForm.username}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, username: e.target.value })
                  }
                  disabled={!isEditing}
                  className={`w-full rounded-xl px-4 py-3 text-sm text-gray-700 outline-none transition-colors ${
                    isEditing
                      ? "bg-gray-100 focus:ring-2 focus:ring-[#4F46E5]"
                      : "bg-gray-50 cursor-default"
                  }`}
                />
              </div>
            </div>

            {/* Email */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                <svg
                  className="w-4 h-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <label className="block text-xs text-gray-500 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={profileForm.email}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, email: e.target.value })
                  }
                  disabled={!isEditing}
                  className={`w-full rounded-xl px-4 py-3 text-sm text-gray-700 outline-none transition-colors ${
                    isEditing
                      ? "bg-gray-100 focus:ring-2 focus:ring-[#4F46E5]"
                      : "bg-gray-50 cursor-default"
                  }`}
                />
              </div>
            </div>

            {/* Téléphone */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                <svg
                  className="w-4 h-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.25 6.338c0-1.01.559-1.887 1.406-2.312l2.47-1.235a1.125 1.125 0 011.394.38l1.91 2.865a1.125 1.125 0 01-.26 1.48l-1.154.866a8.992 8.992 0 003.957 3.956l.866-1.154a1.125 1.125 0 011.48-.26l2.864 1.91a1.125 1.125 0 01.38 1.394l-1.235 2.47a2.625 2.625 0 01-2.312 1.406C7.5 21 3 16.5 3 11.25a9 9 0 01-.75-4.912z"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <label className="block text-xs text-gray-500 mb-1">
                  Téléphone
                </label>
                <input
                  type="tel"
                  value={profileForm.phoneNumber}
                  onChange={(e) =>
                    setProfileForm({
                      ...profileForm,
                      phoneNumber: e.target.value,
                    })
                  }
                  disabled={!isEditing}
                  placeholder={isEditing ? "Ex: 0612345678" : "Non renseigné"}
                  className={`w-full rounded-xl px-4 py-3 text-sm text-gray-700 placeholder-gray-400 outline-none transition-colors ${
                    isEditing
                      ? "bg-gray-100 focus:ring-2 focus:ring-[#4F46E5]"
                      : "bg-gray-50 cursor-default"
                  }`}
                />
              </div>
            </div>

            {profileSuccess && (
              <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-100 rounded-xl">
                <svg
                  className="w-5 h-5 text-green-500 shrink-0"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="text-sm text-green-700">{profileSuccess}</p>
              </div>
            )}
            {profileError && (
              <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-100 rounded-xl">
                <svg
                  className="w-5 h-5 text-red-500 shrink-0"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
                  />
                </svg>
                <p className="text-sm text-red-700">{profileError}</p>
              </div>
            )}
          </form>
        </div>

        {/* Paramètres de sécurité */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 md:col-span-3">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Paramètres de sécurité
          </h2>
          <div className="space-y-3">
            {/* Mot de passe */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                  <svg
                    className="w-4 h-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    Mot de passe
                  </p>
                  <p className="text-xs text-gray-500">
                    Modifiez votre mot de passe
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowPasswordForm(!showPasswordForm);
                  setPasswordSuccess("");
                  setPasswordError("");
                }}
                className="border border-[#4F46E5] text-[#4F46E5] hover:bg-[#4F46E5] hover:text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
              >
                {showPasswordForm ? "Annuler" : "Changer le mot de passe"}
              </button>
            </div>

            {/* Formulaire changement mot de passe */}
            {showPasswordForm && (
              <form
                onSubmit={handlePasswordSubmit}
                className="border border-gray-100 rounded-xl p-5 space-y-4"
              >
                <input
                  type="text"
                  autoComplete="username"
                  style={{ display: "none" }}
                  readOnly
                />
                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-1">
                    Mot de passe actuel
                  </label>
                  <input
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) =>
                      setPasswordForm({
                        ...passwordForm,
                        currentPassword: e.target.value,
                      })
                    }
                    placeholder="Entrez votre mot de passe actuel"
                    className="w-full bg-gray-100 rounded-xl px-4 py-3 text-sm text-gray-700 placeholder-gray-400 outline-none focus:ring-2 focus:ring-[#4F46E5]"
                    autoComplete="current-password"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-1">
                    Nouveau mot de passe
                  </label>
                  <input
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) =>
                      setPasswordForm({
                        ...passwordForm,
                        newPassword: e.target.value,
                      })
                    }
                    placeholder="Entrez votre nouveau mot de passe"
                    className="w-full bg-gray-100 rounded-xl px-4 py-3 text-sm text-gray-700 placeholder-gray-400 outline-none focus:ring-2 focus:ring-[#4F46E5]"
                    autoComplete="new-password"
                    minLength={8}
                  />
                </div>

                {/* Password strength */}
                {passwordForm.newPassword.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-xs text-gray-400">
                      Force du mot de passe :
                    </p>
                    <div className="flex gap-2">
                      <div
                        className={`h-1.5 flex-1 rounded-full transition-colors ${passwordForm.newPassword.length > 0 ? "bg-[#C7C5F7]" : "bg-gray-200"}`}
                      />
                      <div
                        className={`h-1.5 flex-1 rounded-full transition-colors ${/[A-Z]/.test(passwordForm.newPassword) ? "bg-[#9B97F0]" : "bg-gray-200"}`}
                      />
                      <div
                        className={`h-1.5 flex-1 rounded-full transition-colors ${/[A-Z]/.test(passwordForm.newPassword) && /[0-9]/.test(passwordForm.newPassword) ? "bg-[#6F6AE9]" : "bg-gray-200"}`}
                      />
                      <div
                        className={`h-1.5 flex-1 rounded-full transition-colors ${/[A-Z]/.test(passwordForm.newPassword) && /[0-9]/.test(passwordForm.newPassword) && /[^a-zA-Z0-9]/.test(passwordForm.newPassword) && passwordForm.newPassword.length >= 8 ? "bg-[#4F46E5]" : "bg-gray-200"}`}
                      />
                    </div>
                    <p className="text-xs text-gray-400">
                      {!/[A-Z]/.test(passwordForm.newPassword) &&
                        "Faible — ajoutez une majuscule"}
                      {/[A-Z]/.test(passwordForm.newPassword) &&
                        !/[0-9]/.test(passwordForm.newPassword) &&
                        "Moyen — ajoutez un chiffre"}
                      {/[A-Z]/.test(passwordForm.newPassword) &&
                        /[0-9]/.test(passwordForm.newPassword) &&
                        !/[^a-zA-Z0-9]/.test(passwordForm.newPassword) &&
                        "Bon — ajoutez un symbole (!@#$...)"}
                      {/[A-Z]/.test(passwordForm.newPassword) &&
                        /[0-9]/.test(passwordForm.newPassword) &&
                        /[^a-zA-Z0-9]/.test(passwordForm.newPassword) &&
                        passwordForm.newPassword.length < 8 &&
                        "Presque — minimum 8 caractères"}
                      {/[A-Z]/.test(passwordForm.newPassword) &&
                        /[0-9]/.test(passwordForm.newPassword) &&
                        /[^a-zA-Z0-9]/.test(passwordForm.newPassword) &&
                        passwordForm.newPassword.length >= 8 &&
                        "Excellent !"}
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-1">
                    Confirmer le mot de passe
                  </label>
                  <input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) =>
                      setPasswordForm({
                        ...passwordForm,
                        confirmPassword: e.target.value,
                      })
                    }
                    placeholder="Confirmez votre nouveau mot de passe"
                    className="w-full bg-gray-100 rounded-xl px-4 py-3 text-sm text-gray-700 placeholder-gray-400 outline-none focus:ring-2 focus:ring-[#4F46E5]"
                    autoComplete="new-password"
                    minLength={8}
                  />
                </div>

                {passwordSuccess && (
                  <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-100 rounded-xl">
                    <svg
                      className="w-5 h-5 text-green-500 shrink-0"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <p className="text-sm text-green-700">{passwordSuccess}</p>
                  </div>
                )}
                {passwordError && (
                  <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-100 rounded-xl">
                    <svg
                      className="w-5 h-5 text-red-500 shrink-0"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
                      />
                    </svg>
                    <p className="text-sm text-red-700">{passwordError}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="w-full bg-[#4F46E5] hover:bg-[#3730A3] text-white font-semibold py-3.5 rounded-xl transition-colors disabled:opacity-50"
                >
                  {passwordLoading
                    ? "Modification..."
                    : "Modifier le mot de passe"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
