export default function Footer() {
  return (
    <footer id="footer" className="bg-gray-900 text-white py-8 px-6">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="font-bold text-lg text-blue-400">AxiaAbonnement</p>
        <div className="flex gap-6 text-sm text-gray-400">
          <a href="#services" className="hover:text-blue-400 transition-colors">Services</a>
          <a href="#offres" className="hover:text-blue-400 transition-colors">Offres</a>
          <a href="/register" className="hover:text-blue-400 transition-colors">S'inscrire</a>
          <a href="/login" className="hover:text-blue-400 transition-colors">Connexion</a>
        </div>
        <p className="text-xs text-gray-500">© 2026 AxiaAbonnement. Tous droits réservés.</p>
      </div>
    </footer>
  );
}