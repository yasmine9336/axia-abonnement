export function normalizeResetToken(rawToken: string) {
  return rawToken.replace(/ /g, "+");
}

export function validateResetPassword(
  password: string,
  confirmPassword: string,
): string | null {
  if (password.length < 8) {
    return "Le mot de passe doit contenir au moins 8 caractères.";
  }

  if (password !== confirmPassword) {
    return "Les mots de passe ne correspondent pas.";
  }

  return null;
}

export function getResetPasswordApiError(err: unknown) {
  const error = err as {
    response?: {
      data?: {
        title?: string;
      } | string;
    };
  };

  const apiError = error.response?.data;

  if (typeof apiError === "object" && apiError !== null && "title" in apiError) {
    return apiError.title || "Erreur lors de la réinitialisation.";
  }

  if (typeof apiError === "string") {
    return apiError;
  }

  return "Erreur lors de la réinitialisation.";
}

export function handleInputFocus(event: React.FocusEvent<HTMLInputElement>) {
  event.target.style.borderBottomColor = "var(--color-primary)";
}

export function handleInputBlur(event: React.FocusEvent<HTMLInputElement>) {
  event.target.style.borderBottomColor = "#e5e7eb";
}