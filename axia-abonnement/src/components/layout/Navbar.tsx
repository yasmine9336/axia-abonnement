import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import LogoAxia from "../../assets/logo-axia.svg";

export default function Navbar() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLinks = [
    { label: "Accueil", href: "#" },
    { label: "Services", href: "#services" },
    { label: "Offres", href: "#offres" },
  ];

  const handleDashboard = () => {
    if (user?.role === "Responsable") {
      navigate("/dashboard/responsable");
    } else if (user?.role === "Admin") {
      navigate("/dashboard/admin");
    } else {
      navigate("/dashboard/client");
    }
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-white/95 backdrop-blur-md shadow-sm" : "bg-transparent"
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <button type="button" className="cursor-pointer" onClick={() => navigate("/")}>
          <img src={LogoAxia} alt="AxiaAbonnement" className="h-10" />
        </button>

        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm text-gray-600 transition-colors font-medium hover:text-(--color-primary)"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <button
              onClick={handleDashboard}
              className="text-sm font-semibold text-white px-5 py-2 rounded-lg transition-colors flex items-center gap-2 bg-(--color-primary)"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
              Dashboard
            </button>
          ) : (
            <>
              <button
                onClick={() => navigate("/login")}
                className="text-sm font-medium text-gray-700 transition-colors px-4 py-2 hover:text-(--color-primary)"
              >
                Connexion
              </button>
              <button
                onClick={() => navigate("/register")}
                className="text-sm font-semibold text-white px-5 py-2 rounded-lg transition-colors bg-(--color-primary)"
              >
                S'inscrire
              </button>
            </>
          )}
        </div>

        <button
          type="button"
          className="md:hidden p-2 text-gray-700"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Ouvrir le menu"
        >
          {menuOpen ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-6 py-4 flex flex-col gap-4">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm text-gray-700 font-medium hover:text-(--color-primary)"
            >
              {link.label}
            </a>
          ))}

          {user ? (
            <button
              onClick={handleDashboard}
              className="text-sm font-semibold text-white px-5 py-2 rounded-lg text-left bg-(--color-primary)"
            >
              Dashboard
            </button>
          ) : (
            <>
              <button
                onClick={() => navigate("/login")}
                className="text-sm font-medium text-gray-700 text-left"
              >
                Connexion
              </button>
              <button
                onClick={() => navigate("/register")}
                className="text-sm font-semibold text-white px-5 py-2 rounded-lg bg-(--color-primary)"
              >
                S'inscrire
              </button>
            </>
          )}
        </div>
      )}
    </nav>
  );
}