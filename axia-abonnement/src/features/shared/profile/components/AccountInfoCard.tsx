import { Shield } from "lucide-react";
import { GOUVERNORATS, getVillesByGouvernorat } from "../../../../data/villes";
import type { ProfileData, ProfileForm } from "../types";
import { getRoleLabel, inputClass } from "../utils";

interface AccountInfoCardProps {
  profile: ProfileData | null;
  profileForm: ProfileForm;
  isEditing: boolean;
  profileLoading: boolean;
  profileSuccess: string;
  profileError: string;
  onEdit: () => void;
  onCancel: () => void;
  onSave: () => void;
  onProfileFormChange: (form: ProfileForm) => void;
}

export default function AccountInfoCard({
  profile,
  profileForm,
  isEditing,
  profileLoading,
  profileSuccess,
  profileError,
  onEdit,
  onCancel,
  onSave,
  onProfileFormChange,
}: AccountInfoCardProps) {
  const isAdmin = profile?.role === "Admin";
  const villesDisponibles = getVillesByGouvernorat(profileForm.gouvernorat);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-base font-bold text-gray-900">
          Informations du compte
        </h2>

        {!isEditing ? (
          <button
            type="button"
            onClick={onEdit}
            className="text-sm font-semibold px-4 py-2 rounded-xl transition-colors border border-(--color-primary) text-(--color-primary)"
          >
            Modifier
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="border border-gray-300 text-gray-600 hover:bg-gray-50 text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
            >
              Annuler
            </button>

            <button
              type="button"
              onClick={onSave}
              disabled={profileLoading}
              className="text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors disabled:opacity-50 bg-(--color-primary)"
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
            onChange={(event) =>
              onProfileFormChange({
                ...profileForm,
                username: event.target.value,
              })
            }
            disabled={!isEditing}
            className={inputClass(isEditing)}
          />
        </div>

        <div>
          <label className="block text-xs text-gray-500 mb-1">EMAIL</label>

          <input
            type="email"
            value={profileForm.email}
            onChange={(event) =>
              onProfileFormChange({
                ...profileForm,
                email: event.target.value,
              })
            }
            disabled={!isEditing}
            className={inputClass(isEditing)}
          />
        </div>

        <div>
          <label className="block text-xs text-gray-500 mb-1">TÉLÉPHONE</label>

          <input
            type="tel"
            value={profileForm.phoneNumber}
            onChange={(event) =>
              onProfileFormChange({
                ...profileForm,
                phoneNumber: event.target.value,
              })
            }
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
              {getRoleLabel(profile?.role)}
            </div>
          </div>
        )}

        {!isAdmin && (
          <>
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                GOUVERNORAT
              </label>

              {isEditing ? (
                <select
                  value={profileForm.gouvernorat}
                  onChange={(event) =>
                    onProfileFormChange({
                      ...profileForm,
                      gouvernorat: event.target.value,
                      ville: "",
                    })
                  }
                  className="w-full rounded-xl px-4 py-3 text-sm text-gray-700 bg-gray-100 focus:ring-2 focus:ring-(--color-primary) outline-none"
                >
                  <option value="">Sélectionner...</option>

                  {GOUVERNORATS.map((gouvernorat) => (
                    <option key={gouvernorat} value={gouvernorat}>
                      {gouvernorat}
                    </option>
                  ))}
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
                  onChange={(event) =>
                    onProfileFormChange({
                      ...profileForm,
                      ville: event.target.value,
                    })
                  }
                  disabled={!profileForm.gouvernorat}
                  className="w-full rounded-xl px-4 py-3 text-sm text-gray-700 bg-gray-100 focus:ring-2 focus:ring-(--color-primary) outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">
                    {profileForm.gouvernorat
                      ? "Sélectionner..."
                      : "Choisir un gouvernorat"}
                  </option>

                  {villesDisponibles.map((ville) => (
                    <option key={ville} value={ville}>
                      {ville}
                    </option>
                  ))}
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

            <ReadOnlyField
              label="NOM DE L'ENTREPRISE"
              value={profile.nomEntreprise}
            />

            <ReadOnlyField
              label="MATRICULE FISCAL"
              value={profile.matriculeFiscal}
            />

            <ReadOnlyField
              label="SECTEUR D'ACTIVITÉ"
              value={profile.secteurActivite}
            />

            <ReadOnlyField
              label="ADRESSE PROFESSIONNELLE"
              value={profile.adresseProfessionnelle}
            />
          </>
        )}
      </div>

      {profileSuccess && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-xl">
          <p className="text-sm text-blue-700">{profileSuccess}</p>
        </div>
      )}

      {profileError && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-xl">
          <p className="text-sm text-blue-700">{profileError}</p>
        </div>
      )}
    </div>
  );
}

function ReadOnlyField({
  label,
  value,
}: {
  label: string;
  value?: string | null;
}) {
  return (
    <div>
      <label className="block text-xs text-gray-500 mb-1">{label}</label>

      <div className="w-full rounded-xl px-4 py-3 text-sm text-gray-700 bg-gray-50">
        {value ?? "Non renseigné"}
      </div>
    </div>
  );
}
