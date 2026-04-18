import { useState, useEffect, useMemo } from "react";
import axiosInstance from "../../api/axiosInstance";
import { Search } from "lucide-react";
import ExportButton from "../common/ExportButton";
import { useTheme } from "../../context/ThemeContext";

interface Client {
  id: string;
  username: string;
  email: string;
  phoneNumber: string | null;
  isActive: boolean;
}

export default function ArchiveAdminSection() {
  const { accent } = useTheme();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    axiosInstance
      .get("/users/clients")
      .then((r) => setClients(r.data))
      .catch(() => setError("Erreur lors du chargement des clients."))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(
    () =>
      clients.filter(
        (c) =>
          c.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.email.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    [clients, searchTerm],
  );

  const actifs = useMemo(() => filtered.filter((c) => c.isActive), [filtered]);
  const inactifs = useMemo(
    () => filtered.filter((c) => !c.isActive),
    [filtered],
  );

  const statCards = [
    {
      label: "Total clients",
      value: clients.length,
      sub: "inscrits",
      useAccent: true,
    },
    {
      label: "Actifs",
      value: actifs.length,
      sub: "comptes actifs",
      color: "bg-green-100 text-green-700",
      textColor: "text-green-600",
    },
    {
      label: "Inactifs",
      value: inactifs.length,
      sub: "comptes inactifs",
      color: "bg-red-100 text-red-700",
      textColor: "text-red-600",
    },
    {
      label: "Résultats filtrés",
      value: filtered.length,
      sub: "correspondent à la recherche",
      color: "bg-gray-100 text-gray-600",
      textColor: "text-gray-500",
    },
  ];

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Archive clients</h1>
        <p className="text-gray-500 text-sm mt-1">
          {actifs.length} actif(s) · {inactifs.length} inactif(s) ·{" "}
          {clients.length} total
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="bg-white rounded-2xl border border-gray-200 p-5"
          >
            <p className="text-xs text-gray-500 mb-1">{card.label}</p>
            <p className="text-2xl font-bold text-gray-900">{card.value}</p>
            <p
              className={`text-xs mt-1 ${!card.useAccent ? (card.textColor ?? "") : ""}`}
              style={card.useAccent ? { color: accent } : undefined}
            >
              {card.sub}
            </p>
          </div>
        ))}
      </div>

      <div className="flex justify-end mb-4">
        <ExportButton
          data={filtered}
          columns={[
            { key: "username", label: "Nom d'utilisateur" },
            { key: "email", label: "Email" },
            { key: "phoneNumber", label: "Téléphone" },
            {
              key: "isActive",
              label: "Statut",
              format: (v) => (v ? "Actif" : "Inactif"),
            },
          ]}
          filename="clients"
          label="Exporter clients"
          sheetName="Clients"
          pdfTitle="Liste des clients"
        />
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-6">
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={16}
          />
          <input
            type="text"
            placeholder="Rechercher par nom ou email..."
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = accent;
              e.currentTarget.style.boxShadow = `0 0 0 3px ${accent}30`;
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "";
              e.currentTarget.style.boxShadow = "";
            }}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-40">
          <div
            className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin"
            style={{ borderColor: accent, borderTopColor: "transparent" }}
          />
        </div>
      ) : error ? (
        <div className="text-center py-16 text-red-500 text-sm">{error}</div>
      ) : (
        <div className="space-y-8">
          {actifs.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <h2 className="text-lg font-semibold text-gray-700">
                  Clients actifs
                </h2>
                <span className="bg-green-100 text-green-700 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                  {actifs.length}
                </span>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {actifs.map((c) => (
                  <div
                    key={c.id}
                    className="bg-white rounded-2xl border border-gray-200 p-5 flex items-center gap-3"
                  >
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
                      style={{ backgroundColor: accent }}
                    >
                      {c.username.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 truncate">
                        {c.username}
                      </p>
                      <p className="text-xs text-gray-400 truncate">
                        {c.email}
                      </p>
                      {c.phoneNumber && (
                        <p className="text-xs text-gray-400">{c.phoneNumber}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {inactifs.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <h2 className="text-lg font-semibold text-gray-700">
                  Clients inactifs
                </h2>
                <span className="bg-red-100 text-red-700 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                  {inactifs.length}
                </span>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {inactifs.map((c) => (
                  <div
                    key={c.id}
                    className="bg-white rounded-2xl border border-gray-200 p-5 flex items-center gap-3 opacity-60"
                  >
                    <div className="w-9 h-9 rounded-full bg-gray-300 flex items-center justify-center text-white text-sm font-bold shrink-0">
                      {c.username.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 truncate">
                        {c.username}
                      </p>
                      <p className="text-xs text-gray-400 truncate">
                        {c.email}
                      </p>
                      {c.phoneNumber && (
                        <p className="text-xs text-gray-400">{c.phoneNumber}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {filtered.length === 0 && (
            <div className="text-center py-16 text-gray-400 text-sm">
              Aucun client trouvé
            </div>
          )}
        </div>
      )}
    </div>
  );
}
