import type { ChangeEvent } from "react";
import { inputClass } from "../constants";
import type { RegisterForm } from "../types";

interface CompanyInfoFieldsProps {
  form: RegisterForm;
  onChange: (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => void;
}

export default function CompanyInfoFields({
  form,
  onChange,
}: CompanyInfoFieldsProps) {
  return (
    <>
      <div>
        <label className="block text-xs text-gray-400 mb-1 uppercase tracking-wide">
          Nom de l'entreprise
        </label>

        <input
          type="text"
          name="nomEntreprise"
          value={form.nomEntreprise}
          onChange={onChange}
          placeholder="Ex: Axia SARL"
          required
          className={inputClass}
        />
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1 uppercase tracking-wide">
          Matricule fiscal
        </label>

        <input
          type="text"
          name="matriculeFiscal"
          value={form.matriculeFiscal}
          onChange={onChange}
          placeholder="Ex: 1234567/A/M/000"
          required
          className={inputClass}
        />
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1 uppercase tracking-wide">
          Secteur d'activité
        </label>

        <input
          type="text"
          name="secteurActivite"
          value={form.secteurActivite}
          onChange={onChange}
          placeholder="Ex: Informatique, Santé..."
          required
          className={inputClass}
        />
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1 uppercase tracking-wide">
          Adresse professionnelle
        </label>

        <textarea
          name="adresseProfessionnelle"
          value={form.adresseProfessionnelle}
          onChange={onChange}
          placeholder="Adresse complète"
          required
          rows={2}
          className={`${inputClass} resize-none`}
        />
      </div>
    </>
  );
}