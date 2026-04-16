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

export default function ArchiveAdminSection() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    axiosInstance
      .get("/users/clients")
      .then((r) => setClients(r.data))
      .finally(() => setLoading(false));
  }, []);

  const filtered = clients.filter(
    (c) =>
      c.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const actifs = filtered.filter((c) => c.isActive);
  const inactifs = filtered.filter((c) => !c.isActive);

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Archive clients</h1>
        <p className="text-gray-500 text-sm mt-1">
          {clients.filter((c) => c.isActive).length} actif(s) ·{" "}
          {clients.filter((c) => !c.isActive).length} inactif(s) · {clients.length} total
        </p>
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
      ) : (
        <div className="space-y-8">
          {actifs.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-700 mb-4">Clients actifs</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {actifs.map((c) => (
                  <div key={c.id} className="bg-white rounded-2xl border border-gray-200 p-5">
                    <p className="font-semibold text-gray-900">{c.username}</p>
                    <p className="text-xs text-gray-400">{c.email}</p>
                    {c.phoneNumber && (
                      <p className="text-xs text-gray-400 mt-1">{c.phoneNumber}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {inactifs.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-700 mb-4">Clients inactifs</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {inactifs.map((c) => (
                  <div key={c.id} className="bg-white rounded-2xl border border-gray-200 p-5 opacity-60">
                    <p className="font-semibold text-gray-900">{c.username}</p>
                    <p className="text-xs text-gray-400">{c.email}</p>
                    {c.phoneNumber && (
                      <p className="text-xs text-gray-400 mt-1">{c.phoneNumber}</p>
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
