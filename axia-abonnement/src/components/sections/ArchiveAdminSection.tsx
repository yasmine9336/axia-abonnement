import { useState, useEffect, useMemo } from "react";
import axiosInstance from "../../api/axiosInstance";
import { Search } from "lucide-react";
import ExportButton from "./../common/ExportButton";

interface Client {
  id: string;
  username: string;
  email: string;
  phoneNumber: string | null;
  isActive: boolean;
}

export default function ArchiveAdminSection() {
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
    () => clients.filter(
      (c) =>
        c.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email.toLowerCase().includes(searchTerm.toLowerCase())
    ),
    [clients, searchTerm]
  );

  const actifs = useMemo(() => filtered.filter((c) => c.isActive), [filtered]);
  const inactifs = useMemo(() => filtered.filter((c) => !c.isActive), [filtered]);
  const totalActifs = useMemo(() => clients.filter((c) => c.isActive).length, [clients]);
  const totalInactifs = useMemo(() => clients.filter((c) => !c.isActive).length, [clients]);

  const statCards = [
    {
      label: "Total clients",
      value: clients.length,
      sub: "tous statuts confondus",
      color: "text-[#4F46E5]",
      bg: "bg-[#4F46E5]/10 text-[#4F46E5]",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
    {
      label: "Actifs",
      value: totalActifs,
      sub: "comptes actifs",
      color: "text-green-600",
      bg: "bg-green-100 text-green-700",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      label: "Inactifs",
      value: totalInactifs,
      sub: "comptes désactivés",
      color: totalInactifs > 0 ? "text-red-500" : "text-gray-400",
      bg: totalInactifs > 0 ? "bg-red-100 text-red-500" : "bg-gray-100 text-gray-400",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
        </svg>
      ),
    },
    {
      label: "Résultats filtrés",
      value: filtered.length,
      sub: "correspondant à la recherche",
      color: "text-gray-500",
      bg: "bg-gray-100 text-gray-500",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Archive clients</h1>
        <p className="text-gray-500 text-sm mt-1">
          {totalActifs} actif(s) · {totalInactifs} inactif(s) · {clients.length} total
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statCards.map((card) => (
          <div key={card.label} className="bg-white rounded-2xl border border-gray-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 mb-1">{card.label}</p>
                <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                <p className={`text-xs mt-1 ${card.color}`}>{card.sub}</p>
              </div>
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${card.bg}`}>
                {card.icon}
              </div>
            </div>
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
            { key: "isActive", label: "Statut", format: (v) => (v ? "Actif" : "Inactif") },
          ]}
          filename="clients"
          label="Exporter clients"
          sheetName="Clients"
          pdfTitle="Liste des clients"
        />
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Rechercher par nom ou email..."
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#4F46E5]/30 focus:border-[#4F46E5] transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-40">
          <div className="w-8 h-8 border-4 border-[#4F46E5] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : error ? (
        <div className="text-center py-16 text-red-500 text-sm">{error}</div>
      ) : (
        <div className="space-y-8">
          {actifs.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <h2 className="text-lg font-semibold text-gray-700">Clients actifs</h2>
                <span className="bg-green-100 text-green-700 text-xs font-semibold px-2.5 py-0.5 rounded-full">{actifs.length}</span>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {actifs.map((c) => (
                  <div key={c.id} className="bg-white rounded-2xl border border-gray-200 p-5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-[#4F46E5] rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">
                        {c.username.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900 truncate">{c.username}</p>
                        <p className="text-xs text-gray-400 truncate">{c.email}</p>
                        {c.phoneNumber && <p className="text-xs text-gray-400">{c.phoneNumber}</p>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {inactifs.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <h2 className="text-lg font-semibold text-gray-700">Clients inactifs</h2>
                <span className="bg-gray-100 text-gray-600 text-xs font-semibold px-2.5 py-0.5 rounded-full">{inactifs.length}</span>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {inactifs.map((c) => (
                  <div key={c.id} className="bg-white rounded-2xl border border-gray-200 p-5 opacity-60">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-gray-400 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">
                        {c.username.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900 truncate">{c.username}</p>
                        <p className="text-xs text-gray-400 truncate">{c.email}</p>
                        {c.phoneNumber && <p className="text-xs text-gray-400">{c.phoneNumber}</p>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {filtered.length === 0 && (
            <div className="text-center py-16 text-gray-400 text-sm">Aucun client trouvé</div>
          )}
        </div>
      )}
    </div>
  );
}
