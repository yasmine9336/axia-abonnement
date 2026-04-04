import { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosInstance";

interface ServiceItem {
  id: string;
  intituleService: string;
  description: string;
  isActive: boolean;
  creePar: string;
  nbOffres: number;
}

interface OffreItem {
  id: string;
  intituleOffre: string;
  description: string;
  parMois: number;
  parAnnee: number;
  isActive: boolean;
  creePar: string;
  services: string[];
}

export default function CatalogueAdminSection() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [offres, setOffres] = useState<OffreItem[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [s, o] = await Promise.all([
          axiosInstance.get<ServiceItem[]>("/services"),
          axiosInstance.get<OffreItem[]>("/offres"),
        ]);
        setServices(s.data ?? []);
        setOffres(o.data ?? []);
      } catch {
        setError("Erreur lors du chargement du catalogue.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-40">
        <div className="w-8 h-8 border-4 border-[#4F46E5] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      <h1 className="text-2xl font-bold text-gray-900">Catalogue</h1>
      <p className="text-sm text-gray-500 mt-1">
        {services.length} service(s) · {offres.length} offre(s)
      </p>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      {/* Tableau Services */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Services</h2>
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left text-gray-500 text-xs uppercase">
                <th className="px-5 py-3 font-medium">Intitulé</th>
                <th className="px-5 py-3 font-medium">Description</th>
                <th className="px-5 py-3 font-medium text-center">Offres</th>
                <th className="px-5 py-3 font-medium">Créé par</th>
                <th className="px-5 py-3 font-medium text-center">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {services.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3 font-medium text-gray-900">{s.intituleService}</td>
                  <td className="px-5 py-3 text-gray-500 max-w-xs truncate">{s.description}</td>
                  <td className="px-5 py-3 text-center text-gray-700">{s.nbOffres}</td>
                  <td className="px-5 py-3 text-gray-500">{s.creePar}</td>
                  <td className="px-5 py-3 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                      s.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                    }`}>
                      {s.isActive ? "Actif" : "Inactif"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tableau Offres */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Offres</h2>
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left text-gray-500 text-xs uppercase">
                <th className="px-5 py-3 font-medium">Intitulé</th>
                <th className="px-5 py-3 font-medium">Prix/mois</th>
                <th className="px-5 py-3 font-medium">Prix/an</th>
                <th className="px-5 py-3 font-medium">Services inclus</th>
                <th className="px-5 py-3 font-medium">Créé par</th>
                <th className="px-5 py-3 font-medium text-center">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {offres.map((o) => (
                <tr key={o.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3 font-medium text-gray-900">{o.intituleOffre}</td>
                  <td className="px-5 py-3 text-gray-700">{o.parMois} TND</td>
                  <td className="px-5 py-3 text-gray-700">{o.parAnnee} TND</td>
                  <td className="px-5 py-3 text-gray-500 max-w-xs truncate">
                    {o.services.length > 0 ? o.services.join(", ") : "—"}
                  </td>
                  <td className="px-5 py-3 text-gray-500">{o.creePar}</td>
                  <td className="px-5 py-3 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                      o.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                    }`}>
                      {o.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
