import type { RegisterForm } from "./types";

export function validatePersonalStep(
  form: RegisterForm,
  isResponsable: boolean,
): string | null {
  if (!form.fullName.trim()) return "Le nom complet est requis.";
  if (!form.email.trim()) return "L'email est requis.";
  if (!form.gouvernorat) return "Le gouvernorat est requis.";
  if (!form.ville) return "La ville est requise.";

  if (!isResponsable) {
    if (!form.dateNaissance) return "La date de naissance est requise.";
    if (!form.sexe) return "Le sexe est requis.";
  }

  if (form.password !== form.confirmPassword) {
    return "Les mots de passe ne correspondent pas.";
  }

  if (form.password.length < 8) {
    return "Le mot de passe doit contenir au moins 8 caractères.";
  }

  if (!/[A-Z]/.test(form.password)) {
    return "Le mot de passe doit contenir au moins une majuscule.";
  }

  if (!/[0-9]/.test(form.password)) {
    return "Le mot de passe doit contenir au moins un chiffre.";
  }

  return null;
}

export function validateCompanyStep(form: RegisterForm): string | null {
  if (!form.nomEntreprise.trim()) return "Le nom de l'entreprise est requis.";
  if (!form.matriculeFiscal.trim()) return "Le matricule fiscal est requis.";
  if (!form.secteurActivite.trim()) return "Le secteur d'activité est requis.";
  if (!form.adresseProfessionnelle.trim()) {
    return "L'adresse professionnelle est requise.";
  }

  return null;
}