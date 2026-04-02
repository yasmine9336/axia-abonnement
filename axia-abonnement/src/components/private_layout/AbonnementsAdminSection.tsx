import { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosInstance";

export default function AbonnementsAdminSection() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actifs, setActifs] = useState<any[]>([]);
  const [expires, setExpires] = useState<any[]>([]);
  const [renouveles, setRenouveles] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // adapte ces endpoints selon ton backend réel
        const [a, e, r] = await Promise.all([
          axiosInstance.get("/admin/abonnements/actifs"),
          axiosInstance.get("/admin/abonnements/expires"),
          axiosInstance.get("/admin/abonnements/renouveles"),
        ]);

        setActifs(a.data || []);
        setExpires(e.data || []);
        setRenouveles(r.data || []);
      } catch {
        setError("Erreur lors du chargement des abonnements.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="p-6 lg:p-8">
      <h1 className="text-2xl font-bold text-gray-900">Abonnements</h1>
      <p className="text-sm text-gray-500 mt-1">Actifs, expirés, renouvelés</p>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
      {loading ? (
        <p className="mt-4 text-sm text-gray-500">Chargement...</p>
      ) : (
        <div className="mt-6 grid sm:grid-cols-3 gap-4">
          <div className="bg-white border rounded-xl p-4">Actifs: {actifs.length}</div>
          <div className="bg-white border rounded-xl p-4">Expirés: {expires.length}</div>
          <div className="bg-white border rounded-xl p-4">Renouvelés: {renouveles.length}</div>
        </div>
      )}
    </div>
  );
}