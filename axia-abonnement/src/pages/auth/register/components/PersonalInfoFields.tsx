import type { ChangeEvent } from "react";
import { GOUVERNORATS, getVillesByGouvernorat } from "../../../../data/villes";
import { inputClass } from "../constants";
import type { RegisterForm } from "../types";

interface PersonalInfoFieldsProps {
  form: RegisterForm;
  isResponsable: boolean;
  onChange: (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => void;
  onGouvernoratChange: (event: ChangeEvent<HTMLSelectElement>) => void;
}

export default function PersonalInfoFields({
  form,
  isResponsable,
  onChange,
  onGouvernoratChange,
}: PersonalInfoFieldsProps) {
  const villesDisponibles = getVillesByGouvernorat(form.gouvernorat);

  return (
    <>
      <div>
        <label className="block text-xs text-gray-400 mb-1 uppercase tracking-wide">
          Nom complet
        </label>

        <input
          type="text"
          name="fullName"
          value={form.fullName}
          onChange={onChange}
          placeholder="Jean Dupont"
          required
          className={inputClass}
        />
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1 uppercase tracking-wide">
          Email
        </label>

        <input
          type="email"
          name="email"
          value={form.email}
          onChange={onChange}
          placeholder="votre.email@exemple.com"
          required
          className={inputClass}
        />
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1 uppercase tracking-wide">
          Téléphone optionnel
        </label>

        <input
          type="tel"
          name="phoneNumber"
          value={form.phoneNumber}
          onChange={onChange}
          placeholder="ex: 20123456"
          className={inputClass}
        />
      </div>

      {!isResponsable && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1 uppercase tracking-wide">
              Date de naissance
            </label>

            <input
              type="date"
              name="dateNaissance"
              value={form.dateNaissance}
              onChange={onChange}
              required
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1 uppercase tracking-wide">
              Sexe
            </label>

            <select
              name="sexe"
              value={form.sexe}
              onChange={onChange}
              required
              className={inputClass}
            >
              <option value="">Sélectionner...</option>
              <option value="Homme">Homme</option>
              <option value="Femme">Femme</option>
            </select>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-gray-400 mb-1 uppercase tracking-wide">
            Gouvernorat
          </label>

          <select
            name="gouvernorat"
            value={form.gouvernorat}
            onChange={onGouvernoratChange}
            required
            className={inputClass}
          >
            <option value="">Sélectionner...</option>

            {GOUVERNORATS.map((gouvernorat) => (
              <option key={gouvernorat} value={gouvernorat}>
                {gouvernorat}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs text-gray-400 mb-1 uppercase tracking-wide">
            Ville
          </label>

          <select
            name="ville"
            value={form.ville}
            onChange={onChange}
            required
            disabled={!form.gouvernorat}
            className={`${inputClass} disabled:opacity-50`}
          >
            <option value="">
              {form.gouvernorat ? "Sélectionner..." : "—"}
            </option>

            {villesDisponibles.map((ville) => (
              <option key={ville} value={ville}>
                {ville}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1 uppercase tracking-wide">
          Mot de passe
        </label>

        <input
          type="password"
          name="password"
          value={form.password}
          onChange={onChange}
          placeholder="Start typing..."
          autoComplete="new-password"
          required
          className={inputClass}
        />
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1 uppercase tracking-wide">
          Confirmer le mot de passe
        </label>

        <input
          type="password"
          name="confirmPassword"
          value={form.confirmPassword}
          onChange={onChange}
          placeholder="Start typing..."
          autoComplete="new-password"
          required
          className={inputClass}
        />
      </div>
    </>
  );
}