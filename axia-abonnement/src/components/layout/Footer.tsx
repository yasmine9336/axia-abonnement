export default function Footer() {
  return (
    <footer id="footer" className="bg-gray-50 border-t border-gray-200 py-12 px-6">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <p className="font-bold text-xl text-(--color-primary)">AxiaAbonnement</p>
          <p className="text-gray-400 text-sm mt-1">
            © 2026 AxiaAbonnement. Tous droits réservés.
          </p>
        </div>

        <div className="flex gap-6 text-sm text-gray-500">
          <a href="/privacy" className="hover:text-(--color-primary) transition-colors">
            Politique de confidentialité
          </a>
          <a href="/terms" className="hover:text-(--color-primary) transition-colors">
            Conditions d'utilisation
          </a>
          <a href="/contact" className="hover:text-(--color-primary) transition-colors">
            Contact
          </a>
        </div>
      </div>
    </footer>
  );
}