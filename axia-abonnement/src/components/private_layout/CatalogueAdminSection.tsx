import { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosInstance";

interface ServiceItem {
  id: string;
  intituleService: string;
  description: string;
  isActive: boolean;
}

interface OffreItem {
  id: string;
  intituleOffre: string;
  description: string;
  parMois: number;
  parAnnee: number;
  isActive: boolean;
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

  return (
    <div className="p-6 lg:p-8">
      <h1 className="text-2xl font-bold text-gray-900">Catalogue</h1>
      <p className="text-sm text-gray-500 mt-1">Services & offres</p>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
      {loading ? (
        <p className="mt-4 text-sm text-gray-500">Chargement...</p>
      ) : (
        <div className="mt-6 grid sm:grid-cols-2 gap-4">
          <div className="bg-white border rounded-xl p-4">Services: {services.length}</div>
          <div className="bg-white border rounded-xl p-4">Offres: {offres.length}</div>
        </div>
      )}
    </div>
  );
}