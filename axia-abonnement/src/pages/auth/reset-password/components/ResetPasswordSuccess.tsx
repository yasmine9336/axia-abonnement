interface ResetPasswordSuccessProps {
  onLogin: () => void;
  onHome: () => void;
}

export default function ResetPasswordSuccess({
  onLogin,
  onHome,
}: ResetPasswordSuccessProps) {
  return (
    <div className="space-y-5">
      <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl">
        <p className="text-sm text-blue-700 font-medium">
          ✓ Mot de passe modifié avec succès
        </p>
      </div>

      <div className="p-4 bg-gray-50 rounded-xl">
        <p className="text-sm text-gray-500">
          <span className="font-semibold text-gray-700">Conseil :</span>{" "}
          Utilisez un mot de passe unique que vous n'utilisez nulle part
          ailleurs.
        </p>
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onLogin}
          className="flex-1 py-3 text-white font-semibold rounded-xl text-sm bg-(--color-primary)"
        >
          Se connecter
        </button>

        <button
          type="button"
          onClick={onHome}
          className="flex-1 py-3 font-semibold rounded-xl text-sm border-2 border-(--color-primary) text-(--color-primary)"
        >
          Accueil
        </button>
      </div>
    </div>
  );
}