interface PasswordStrengthIndicatorProps {
  password: string;
}

export default function PasswordStrengthIndicator({
  password,
}: PasswordStrengthIndicatorProps) {
  if (password.length === 0) return null;

  const hasUppercase = /[A-Z]/.test(password);
  const hasDigit = /[0-9]/.test(password);
  const hasSpecial = /[^a-zA-Z0-9]/.test(password);
  const isStrong = hasUppercase && hasDigit && hasSpecial && password.length >= 8;

  return (
    <div className="flex gap-2">
      <div
        className={`h-1.5 flex-1 rounded-full ${
          password.length > 0 ? "bg-blue-200" : "bg-gray-200"
        }`}
      />

      <div
        className={`h-1.5 flex-1 rounded-full ${
          hasUppercase ? "bg-blue-300" : "bg-gray-200"
        }`}
      />

      <div
        className={`h-1.5 flex-1 rounded-full ${
          hasUppercase && hasDigit ? "bg-blue-500" : "bg-gray-200"
        }`}
      />

      <div
        className={`h-1.5 flex-1 rounded-full ${
          isStrong ? "bg-(--color-primary)" : "bg-gray-200"
        }`}
      />
    </div>
  );
}