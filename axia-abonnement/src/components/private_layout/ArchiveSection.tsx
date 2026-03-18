import { useState, useEffect } from "react";
import axiosInstance from "../../api/axiosInstance";
import { Search } from "lucide-react";

interface Client {
  id: string;
  username: string;
  email: string;
  phoneNumber: string | null;
  isActive: boolean;
}

export default function ArchiveSection() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    axiosInstance.get("/users/clients")
      .then(r => setClients(r.data))
      .finally(() => setLoading(false));
  }, []);

  const filtered = clients.filter(c =>
    c.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const actifs = filtered.filter(c => c.isActive);
  const inactifs = filtered.filter(c => !c.isActive);

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Archive clients</h1>
        <p className="text-gray-500 text-sm mt-1">
          {clients.filter(c => c.isActive).length} actif(s) · {clients.filter(c => !c.isActive).length} inactif(s) · {clients.length} total
        </p>
      </div>

      {/* Search */}
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
      ) : clients.length === 0 ? (
        <div className="text-center py-16 text-gray-400 text-sm">
          Aucun client trouvé
        </div>
      ) : (
        <div className="space-y-8">
          {/* Clients actifs */}
          {actifs.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <h2 className="text-lg font-semibold text-gray-700">Clients actifs</h2>
                <span className="bg-green-100 text-green-700 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                  {actifs.length}
                </span>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {actifs.map(c => (
                  <div key={c.id} className="bg-white rounded-2xl border border-gray-200 p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-[#4F46E5] rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">
                        {c.username.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900 truncate">{c.username}</p>
                        <p className="text-xs text-gray-400 truncate">{c.email}</p>
                      </div>
                      <span className="ml-auto bg-green-100 text-green-700 text-xs font-semibold px-2.5 py-0.5 rounded-full shrink-0">
                        Actif
                      </span>
                    </div>
                    {c.phoneNumber && (
                      <p className="text-xs text-gray-500">{c.phoneNumber}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Clients inactifs */}
          {inactifs.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <h2 className="text-lg font-semibold text-gray-700">Clients inactifs</h2>
                <span className="bg-gray-100 text-gray-600 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                  {inactifs.length}
                </span>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {inactifs.map(c => (
                  <div key={c.id} className="bg-white rounded-2xl border border-gray-200 p-5 opacity-60">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-gray-400 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">
                        {c.username.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900 truncate">{c.username}</p>
                        <p className="text-xs text-gray-400 truncate">{c.email}</p>
                      </div>
                      <span className="ml-auto bg-gray-100 text-gray-600 text-xs font-semibold px-2.5 py-0.5 rounded-full shrink-0">
                        Inactif
                      </span>
                    </div>
                    {c.phoneNumber && (
                      <p className="text-xs text-gray-500">{c.phoneNumber}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}