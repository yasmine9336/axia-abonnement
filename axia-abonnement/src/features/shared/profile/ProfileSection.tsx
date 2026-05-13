import { useEffect, useMemo, useState, type FormEvent } from "react";
import axiosInstance from "../../../services/api/axiosInstance";
import LoadingState from "../../../components/common/LoadingState";

import ProfileAvatarCard from "./components/ProfileAvatarCard";
import ProfileStatsCard from "./components/ProfileStatsCard";
import AccountInfoCard from "./components/AccountInfoCard";
import SecurityCard from "./components/SecurityCard";

import type {
  PasswordForm,
  ProfileData,
  ProfileForm,
  ProfileStats,
} from "./types";
import { buildStatCards, getRoleLabel } from "./utils";

const EMPTY_PROFILE_FORM: ProfileForm = {
  username: "",
  email: "",
  phoneNumber: "",
  gouvernorat: "",
  ville: "",
};

const EMPTY_PASSWORD_FORM: PasswordForm = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

export default function ProfileSection() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [stats, setStats] = useState<ProfileStats | null>(null);

  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  const [profileForm, setProfileForm] =
    useState<ProfileForm>(EMPTY_PROFILE_FORM);

  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState("");
  const [profileError, setProfileError] = useState("");

  const [passwordForm, setPasswordForm] =
    useState<PasswordForm>(EMPTY_PASSWORD_FORM);

  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const [photoLoading, setPhotoLoading] = useState(false);
  const [photoError, setPhotoError] = useState("");

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [profileResponse, statsResponse] = await Promise.all([
          axiosInstance.get<ProfileData>("/profile"),
          axiosInstance.get<ProfileStats>("/profile/stats"),
        ]);

        setProfile(profileResponse.data);

        setProfileForm({
          username: profileResponse.data.username,
          email: profileResponse.data.email,
          phoneNumber: profileResponse.data.phoneNumber || "",
          gouvernorat: profileResponse.data.gouvernorat || "",
          ville: profileResponse.data.ville || "",
        });

        setStats(statsResponse.data);
      } catch {
        setProfileError("Erreur lors du chargement du profil.");
      } finally {
        setLoading(false);
      }
    };

    void fetchAll();
  }, []);

  const resetProfileForm = () => {
    if (!profile) return;

    setProfileForm({
      username: profile.username,
      email: profile.email,
      phoneNumber: profile.phoneNumber || "",
      gouvernorat: profile.gouvernorat || "",
      ville: profile.ville || "",
    });
  };

  const handleProfileSubmit = async () => {
    setProfileLoading(true);
    setProfileSuccess("");
    setProfileError("");

    try {
      await axiosInstance.patch("/profile", profileForm);

      setProfileSuccess("Profil mis à jour avec succès.");
      setProfile((previous) =>
        previous ? { ...previous, ...profileForm } : previous,
      );

      setIsEditing(false);
    } catch (err) {
      const error = err as { response?: { data?: string } };
      setProfileError(error.response?.data || "Erreur lors de la mise à jour.");
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

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
      setPasswordForm(EMPTY_PASSWORD_FORM);
      setShowPasswordForm(false);
    } catch (err) {
      const error = err as { response?: { data?: string } };
      setPasswordError(error.response?.data || "Mot de passe actuel incorrect.");
    } finally {
      setPasswordLoading(false);
    }
  };

  const handlePhotoUpload = async (file: File) => {
    setPhotoError("");

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      setPhotoError("Format invalide. Utilisez JPG, PNG ou WEBP.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setPhotoError("Image trop volumineuse (max 2MB).");
      return;
    }

    const formData = new FormData();
    formData.append("photo", file);

    setPhotoLoading(true);

    try {
      const response = await axiosInstance.patch<{
        profileImageUrl?: string;
      }>("/profile/photo", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setProfile((previous) =>
        previous
          ? {
              ...previous,
              profileImageUrl: response.data?.profileImageUrl,
            }
          : previous,
      );
      window.dispatchEvent(new Event("profile-photo-updated"));
    } catch {
      setPhotoError("Erreur lors de l'upload de la photo.");
    } finally {
      setPhotoLoading(false);
    }
  };

  const statCards = useMemo(
    () => buildStatCards(profile, stats),
    [profile, stats],
  );

  if (loading) return <LoadingState />;

  return (
    <div className="ui-page w-full">
      <div className="mb-6">
        <h1 className="ui-title">
          Profil {getRoleLabel(profile?.role)}
        </h1>

        <p className="ui-subtitle">
          Gérez vos informations et paramètres de sécurité.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="space-y-4">
          <ProfileAvatarCard
            profile={profile}
            photoLoading={photoLoading}
            photoError={photoError}
            onPhotoUpload={(file) => void handlePhotoUpload(file)}
          />

          <ProfileStatsCard statCards={statCards} />
        </div>

        <div className="lg:col-span-2 space-y-6">
          <AccountInfoCard
            profile={profile}
            profileForm={profileForm}
            isEditing={isEditing}
            profileLoading={profileLoading}
            profileSuccess={profileSuccess}
            profileError={profileError}
            onEdit={() => setIsEditing(true)}
            onCancel={() => {
              setIsEditing(false);
              setProfileSuccess("");
              setProfileError("");
              resetProfileForm();
            }}
            onSave={() => void handleProfileSubmit()}
            onProfileFormChange={setProfileForm}
          />

          <SecurityCard
            showPasswordForm={showPasswordForm}
            passwordForm={passwordForm}
            passwordLoading={passwordLoading}
            passwordSuccess={passwordSuccess}
            passwordError={passwordError}
            onTogglePasswordForm={() => {
              setShowPasswordForm((previous) => !previous);
              setPasswordSuccess("");
              setPasswordError("");
            }}
            onPasswordFormChange={setPasswordForm}
            onPasswordSubmit={handlePasswordSubmit}
          />
        </div>
      </div>
    </div>
  );
}