import { useState, useEffect } from "react";
import axiosInstance from "../../api/axiosInstance";
import { API_URL } from "../../api/config";
import {
  Users, UserCheck, CreditCard, TrendingUp, Package,
  Briefcase, Clock, Shield,
} from "lucide-react";
import { GOUVERNORATS, getVillesByGouvernorat } from "../../data/villes";

interface ProfileData {
  id: string;
  username: string;
  email: string;
  phoneNumber: string | null;
  role: string;
  profileImageUrl?: string | null;
  gouvernorat?: string | null;
  ville?: string | null;
  nomEntreprise?: string | null;
  matriculeFiscal?: string | null;
  secteurActivite?: string | null;
  adresseProfessionnelle?: string | null;
  createdAt?: string;
}

interface ProfileStats {
  nombreResponsables?: number;
  nombreClients?: number;
  abonnementsActifs?: number;
  revenusMois?: number;
  nombreServices?: number;
  nombreOffres?: number;
  mesServices?: number;
  mesClients?: number;
  mesOffres?: number;
  abonnementsExpires?: number;
  totalPaye?: number;
}

export default function ProfileSection() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [stats, setStats] = useState<ProfileStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  const [profileForm, setProfileForm] = useState({
    username: "",
    email: "",
    phoneNumber: "",
    gouvernorat: "",
    ville: "",
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState("");
  const [profileError, setProfileError] = useState("");

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
    const fetchAll = async () => {
      try {
        const [profileRes, statsRes] = await Promise.all([
          axiosInstance.get("/profile"),
          axiosInstance.get("/profile/stats"),
        ]);
        setProfile(profileRes.data);
        setProfileForm({
          username: profileRes.data.username,
          email: profileRes.data.email,
          phoneNumber: profileRes.data.phoneNumber || "",
          gouvernorat: profileRes.data.gouvernorat || "",
          ville: profileRes.data.ville || "",
        });
        setStats(statsRes.data);
      } catch {
        setProfileError("Erreur lors du chargement du profil.");
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
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
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
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
      const response = await axiosInstance.patch("/profile/photo", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setProfile((prev) =>
        prev ? { ...prev, profileImageUrl: response.data?.profileImageUrl } : prev,
      );
    } catch {
      setPhotoError("Erreur lors de l'upload de la photo.");
    } finally {
      setPhotoLoading(false);
    }
  };

  const getInitial = () => profile?.username?.charAt(0).toUpperCase() || "U";
  const getPhotoUrl = (p?: string | null) =>
    !p ? null : p.startsWith("http") ? p : `${API_URL}${p}`;

  const getRoleLabel = (role: string) => {
    if (role === "Admin") return "Admin";
    if (role === "Responsable") return "Responsable";
    return "Client";
  };

  const formatMemberSince = (d?: string) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("fr-FR", {
      day: "2-digit", month: "long", year: "numeric",
    });
  };

  const getStatCards = () => {
    if (!stats || !profile) return [];
    const role = profile.role;

    if (role === "Admin")
      return [
        { label: "Responsables gérés", value: stats.nombreResponsables ?? 0, icon: <UserCheck className="w-4 h-4 text-blue-600" /> },
        { label: "Clients plateforme", value: stats.nombreClients ?? 0, icon: <Users className="w-4 h-4 text-blue-500" /> },
        { label: "Abonnements actifs", value: stats.abonnementsActifs ?? 0, icon: <CreditCard className="w-4 h-4 text-green-500" /> },
        { label: "Revenus ce mois", value: `${(stats.revenusMois ?? 0).toFixed(2)} TND`, icon: <TrendingUp className="w-4 h-4 text-orange-500" /> },
        { label: "Catalogue", value: `${stats.nombreServices ?? 0} services · ${stats.nombreOffres ?? 0} offres`, icon: <Package className="w-4 h-4 text-pink-500" /> },
        { label: "Membre depuis", value: formatMemberSince(profile.createdAt), icon: <Clock className="w-4 h-4 text-gray-400" /> },
      ];

    if (role === "Responsable")
      return [
        { label: "Mes services", value: stats.mesServices ?? 0, icon: <Briefcase className="w-4 h-4 text-blue-600" /> },
        { label: "Mes offres", value: stats.mesOffres ?? 0, icon: <Package className="w-4 h-4 text-indigo-500" /> },
        { label: "Mes clients", value: stats.mesClients ?? 0, icon: <Users className="w-4 h-4 text-blue-500" /> },
        { label: "Abonnements actifs", value: stats.abonnementsActifs ?? 0, icon: <CreditCard className="w-4 h-4 text-green-500" /> },
        { label: "Revenus ce mois", value: `${(stats.revenusMois ?? 0).toFixed(2)} TND`, icon: <TrendingUp className="w-4 h-4 text-orange-500" /> },
        { label: "Membre depuis", value: formatMemberSince(profile.createdAt), icon: <Clock className="w-4 h-4 text-gray-400" /> },
      ];

    return [
      { label: "Abonnements actifs", value: stats.abonnementsActifs ?? 0, icon: <CreditCard className="w-4 h-4 text-green-500" /> },
      { label: "Abonnements expirés", value: stats.abonnementsExpires ?? 0, icon: <Clock className="w-4 h-4 text-red-400" /> },
      { label: "Total payé", value: `${(stats.totalPaye ?? 0).toFixed(2)} TND`, icon: <TrendingUp className="w-4 h-4 text-orange-500" /> },
      { label: "Membre depuis", value: formatMemberSince(profile.createdAt), icon: <Clock className="w-4 h-4 text-gray-400" /> },
    ];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="ui-spinner" />
      </div>
    );
  }

  const statCards = getStatCards();
  const villesDisponibles = getVillesByGouvernorat(profileForm.gouvernorat);
  const isAdmin = profile?.role === "Admin";

  const inputClass = (editing: boolean) =>
    `w-full rounded-xl px-4 py-3 text-sm text-gray-700 outline-none transition-colors ${
      editing ? "bg-gray-100 focus:ring-2 focus:ring-(--color-primary)" : "bg-gray-50 cursor-default"
    }`;

  return (
    <div className="ui-page w-full">
      <div className="mb-6">
        <h1 className="ui-title">Profil {getRoleLabel(profile?.role ?? "")}</h1>
        <p className="ui-subtitle">Gérez vos informations et paramètres de sécurité.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* ── Colonne gauche : avatar + stats ── */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 text-center">
            <div className="mb-4 flex justify-center">
              {getPhotoUrl(profile?.profileImageUrl) ? (
                <img
                  src={getPhotoUrl(profile?.profileImageUrl)!}
                  alt="Photo"
                  className="w-20 h-20 rounded-full object-cover border border-gray-200"
                />
              ) : (
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center text-white text-3xl font-bold"
                  style={{ background: "var(--color-primary)" }}
                >
                  {getInitial()}
                </div>
              )}
            </div>

            <label
              className="inline-flex items-center justify-center text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors cursor-pointer mb-3 border"
              style={{ borderColor: "var(--color-primary)", color: "var(--color-primary)" }}
            >
              {photoLoading ? "Upload..." : "Changer la photo"}
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handlePhotoUpload(f);
                  e.currentTarget.value = "";
                }}
              />
            </label>

            {photoError && <p className="text-xs text-red-600 mb-2">{photoError}</p>}

            <h3 className="font-bold text-gray-900 text-base mt-2">{profile?.username}</h3>
            <p className="text-xs text-gray-500 mt-0.5">{profile?.email}</p>

            <span
              className="inline-block mt-3 text-xs font-semibold px-3 py-1 rounded-full"
              style={{ background: "var(--color-primary-soft)", color: "var(--color-primary)" }}
            >
              {getRoleLabel(profile?.role ?? "")}
            </span>
          </div>

          {statCards.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-4">Activité</p>
              <div className="space-y-3">
                {statCards.map((s) => (
                  <div key={s.label} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {s.icon}
                      <span className="text-sm text-gray-600">{s.label}</span>
                    </div>
                    <span className="text-sm font-bold text-gray-900">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Colonne droite : infos + sécurité ── */}
        <div className="lg:col-span-2 space-y-6">
          {/* Informations du compte */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-bold text-gray-900">Informations du compte</h2>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-sm font-semibold px-4 py-2 rounded-xl transition-colors border"
                  style={{ borderColor: "var(--color-primary)", color: "var(--color-primary)" }}
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
                      if (profile) {
                        setProfileForm({
                          username: profile.username,
                          email: profile.email,
                          phoneNumber: profile.phoneNumber || "",
                          gouvernorat: profile.gouvernorat || "",
                          ville: profile.ville || "",
                        });
                      }
                    }}
                    className="border border-gray-300 text-gray-600 hover:bg-gray-50 text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleProfileSubmit}
                    disabled={profileLoading}
                    className="text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors disabled:opacity-50"
                    style={{ background: "var(--color-primary)" }}
                  >
                    {profileLoading ? "Enregistrement..." : "Enregistrer"}
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">NOM</label>
                <input
                  type="text"
                  value={profileForm.username}
                  onChange={(e) => setProfileForm({ ...profileForm, username: e.target.value })}
                  disabled={!isEditing}
                  className={inputClass(isEditing)}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">EMAIL</label>
                <input
                  type="email"
                  value={profileForm.email}
                  onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                  disabled={!isEditing}
                  className={inputClass(isEditing)}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">TÉLÉPHONE</label>
                <input
                  type="tel"
                  value={profileForm.phoneNumber}
                  onChange={(e) => setProfileForm({ ...profileForm, phoneNumber: e.target.value })}
                  disabled={!isEditing}
                  placeholder={isEditing ? "Ex: 0612345678" : "Non renseigné"}
                  className={inputClass(isEditing)}
                />
              </div>

              {isAdmin && (
                <div>
                  <label className="block text-xs text-gray-500 mb-1">RÔLE</label>
                  <div className="w-full rounded-xl px-4 py-3 text-sm text-gray-500 bg-gray-50 cursor-default flex items-center gap-2">
                    <Shield className="w-4 h-4 text-gray-400" />
                    {getRoleLabel(profile?.role ?? "")}
                  </div>
                </div>
              )}

              {!isAdmin && (
                <>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">GOUVERNORAT</label>
                    {isEditing ? (
                      <select
                        value={profileForm.gouvernorat}
                        onChange={(e) => setProfileForm({ ...profileForm, gouvernorat: e.target.value, ville: "" })}
                        className="w-full rounded-xl px-4 py-3 text-sm text-gray-700 bg-gray-100 focus:ring-2 focus:ring-(--color-primary) outline-none"
                      >
                        <option value="">Sélectionner...</option>
                        {GOUVERNORATS.map((g) => <option key={g} value={g}>{g}</option>)}
                      </select>
                    ) : (
                      <div className="w-full rounded-xl px-4 py-3 text-sm text-gray-700 bg-gray-50 cursor-default">
                        {profile?.gouvernorat ?? "Non renseigné"}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">VILLE</label>
                    {isEditing ? (
                      <select
                        value={profileForm.ville}
                        onChange={(e) => setProfileForm({ ...profileForm, ville: e.target.value })}
                        disabled={!profileForm.gouvernorat}
                        className="w-full rounded-xl px-4 py-3 text-sm text-gray-700 bg-gray-100 focus:ring-2 focus:ring-(--color-primary) outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <option value="">
                          {profileForm.gouvernorat ? "Sélectionner..." : "Choisir un gouvernorat"}
                        </option>
                        {villesDisponibles.map((v) => <option key={v} value={v}>{v}</option>)}
                      </select>
                    ) : (
                      <div className="w-full rounded-xl px-4 py-3 text-sm text-gray-700 bg-gray-50 cursor-default">
                        {profile?.ville ?? "Non renseigné"}
                      </div>
                    )}
                  </div>
                </>
              )}

              {profile?.role === "Responsable" && (
                <>
                  <div className="col-span-2 border-t border-gray-100 pt-4 mt-2">
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">
                      Informations professionnelles
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">NOM DE L'ENTREPRISE</label>
                    <div className="w-full rounded-xl px-4 py-3 text-sm text-gray-700 bg-gray-50">
                      {profile?.nomEntreprise ?? "Non renseigné"}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">MATRICULE FISCAL</label>
                    <div className="w-full rounded-xl px-4 py-3 text-sm text-gray-700 bg-gray-50">
                      {profile?.matriculeFiscal ?? "Non renseigné"}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">SECTEUR D'ACTIVITÉ</label>
                    <div className="w-full rounded-xl px-4 py-3 text-sm text-gray-700 bg-gray-50">
                      {profile?.secteurActivite ?? "Non renseigné"}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">ADRESSE PROFESSIONNELLE</label>
                    <div className="w-full rounded-xl px-4 py-3 text-sm text-gray-700 bg-gray-50">
                      {profile?.adresseProfessionnelle ?? "Non renseigné"}
                    </div>
                  </div>
                </>
              )}
            </div>

            {profileSuccess && (
              <div className="mt-4 p-3 bg-green-50 border border-green-100 rounded-xl">
                <p className="text-sm text-green-700">{profileSuccess}</p>
              </div>
            )}
            {profileError && (
              <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-xl">
                <p className="text-sm text-red-700">{profileError}</p>
              </div>
            )}
          </div>

          {/* Sécurité & Accès */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-base font-bold text-gray-900 mb-4">Sécurité & Accès</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-white border border-gray-200 rounded-lg flex items-center justify-center shrink-0 text-xl">🔑</div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Mot de passe</p>
                    <p className="text-xs text-gray-500">Modifiez votre mot de passe</p>
                  </div>
                </div>
                <button
                  onClick={() => { setShowPasswordForm(!showPasswordForm); setPasswordSuccess(""); setPasswordError(""); }}
                  className="text-sm font-semibold px-4 py-2 rounded-xl transition-colors border"
                  style={{ borderColor: "var(--color-primary)", color: "var(--color-primary)" }}
                >
                  {showPasswordForm ? "Annuler" : "Changer"}
                </button>
              </div>

              {showPasswordForm && (
                <form onSubmit={handlePasswordSubmit} className="border border-gray-100 rounded-xl p-5 space-y-4">
                  <input type="text" autoComplete="username" style={{ display: "none" }} readOnly />

                  <div>
                    <label className="block text-sm font-medium text-gray-800 mb-1">Mot de passe actuel</label>
                    <input
                      type="password"
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                      placeholder="Entrez votre mot de passe actuel"
                      className="ui-input"
                      autoComplete="current-password"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-800 mb-1">Nouveau mot de passe</label>
                    <input
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      placeholder="Entrez votre nouveau mot de passe"
                      className="ui-input"
                      autoComplete="new-password"
                      minLength={8}
                    />
                  </div>

                  {passwordForm.newPassword.length > 0 && (
                    <div className="flex gap-2">
                      <div className={`h-1.5 flex-1 rounded-full ${passwordForm.newPassword.length > 0 ? "bg-blue-200" : "bg-gray-200"}`} />
                      <div className={`h-1.5 flex-1 rounded-full ${/[A-Z]/.test(passwordForm.newPassword) ? "bg-blue-300" : "bg-gray-200"}`} />
                      <div className={`h-1.5 flex-1 rounded-full ${/[A-Z]/.test(passwordForm.newPassword) && /[0-9]/.test(passwordForm.newPassword) ? "bg-blue-500" : "bg-gray-200"}`} />
                      <div
                        className={`h-1.5 flex-1 rounded-full ${/[A-Z]/.test(passwordForm.newPassword) && /[0-9]/.test(passwordForm.newPassword) && /[^a-zA-Z0-9]/.test(passwordForm.newPassword) && passwordForm.newPassword.length >= 8 ? "" : "bg-gray-200"}`}
                        style={
                          /[A-Z]/.test(passwordForm.newPassword) && /[0-9]/.test(passwordForm.newPassword) && /[^a-zA-Z0-9]/.test(passwordForm.newPassword) && passwordForm.newPassword.length >= 8
                            ? { background: "var(--color-primary)" }
                            : undefined
                        }
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-800 mb-1">Confirmer le mot de passe</label>
                    <input
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                      placeholder="Confirmez votre nouveau mot de passe"
                      className="ui-input"
                      autoComplete="new-password"
                      minLength={8}
                    />
                  </div>

                  {passwordSuccess && (
                    <p className="text-sm text-green-700 bg-green-50 p-3 rounded-xl">{passwordSuccess}</p>
                  )}
                  {passwordError && (
                    <p className="text-sm text-red-700 bg-red-50 p-3 rounded-xl">{passwordError}</p>
                  )}

                  <button
                    type="submit"
                    disabled={passwordLoading}
                    className="w-full text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-50"
                    style={{ background: "var(--color-primary)" }}
                  >
                    {passwordLoading ? "Modification..." : "Modifier le mot de passe"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}