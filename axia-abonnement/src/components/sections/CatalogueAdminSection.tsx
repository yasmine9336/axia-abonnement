import { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosInstance";
import ExportButton from "../common/ExportButton";
import { ClipboardList, CheckCircle, Tag, Zap } from "lucide-react";

interface ServiceItem {
  id: string;
  intituleService: string;
  description: string;
  parMois: number;
  parAnnee: number;
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

  const pageSize = 5;
  const [currentServicesPage, setCurrentServicesPage] = useState(1);
  const [currentOffresPage, setCurrentOffresPage] = useState(1);

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

  const activeServices = services.filter((s) => s.isActive).length;
  const activeOffres = offres.filter((o) => o.isActive).length;

  const totalServicesPages = Math.ceil(services.length / pageSize);
  const paginatedServices = services.slice(
    (currentServicesPage - 1) * pageSize,
    currentServicesPage * pageSize
  );

  const totalOffresPages = Math.ceil(offres.length / pageSize);
  const paginatedOffres = offres.slice(
    (currentOffresPage - 1) * pageSize,
    currentOffresPage * pageSize
  );

  const kpiCards = [
    {
      label: "TOTAL SERVICES",
      value: services.length,
      sub: `${activeServices} actifs`,
      icon: <ClipboardList className="w-5 h-5 text-blue-600" />,
      border: "border-t-blue-500",
    },
    {
      label: "SERVICES ACTIFS",
      value: activeServices,
      sub: `${services.length - activeServices} inactifs`,
      icon: <CheckCircle className="w-5 h-5 text-green-500" />,
      border: "border-t-green-400",
    },
    {
      label: "TOTAL OFFRES",
      value: offres.length,
      sub: `${activeOffres} actives`,
      icon: <Tag className="w-5 h-5 text-blue-500" />,
      border: "border-t-blue-400",
    },
    {
      label: "OFFRES ACTIVES",
      value: activeOffres,
      sub: `${offres.length - activeOffres} inactives`,
      icon: <Zap className="w-5 h-5 text-orange-500" />,
      border: "border-t-orange-400",
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-40">
        <div className="w-8 h-8 border-4 border-[#0F6CBD] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Catalogue</h1>
        <p className="text-sm text-gray-500 mt-1">
          {services.length} service(s) · {offres.length} offre(s)
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {kpiCards.map((card) => (
          <div
            key={card.label}
            className={`bg-white rounded-2xl border border-gray-200 border-t-4 ${card.border} p-5`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-gray-400 font-medium tracking-wide mb-2">
                  {card.label}
                </p>
                <p className="text-3xl font-bold text-gray-900">{card.value}</p>
                <p className="text-xs text-gray-400 mt-1">{card.sub}</p>
              </div>
              <div className="mt-1">{card.icon}</div>
            </div>
          </div>
        ))}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* ── Services ── */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Services</h2>
          <ExportButton
            data={services}
            columns={[
              { key: "intituleService", label: "Intitulé" },
              { key: "description", label: "Description" },
              { key: "parMois", label: "Prix/mois (TND)" },
              { key: "parAnnee", label: "Prix/an (TND)" },
              { key: "nbOffres", label: "Nombre d'offres" },
              { key: "creePar", label: "Créé par" },
              { key: "isActive", label: "Statut", format: (v) => (v ? "Actif" : "Inactif") },
            ]}
            filename="services"
            label="Exporter services"
            sheetName="Services"
            pdfTitle="Catalogue des services"
          />
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                {["Intitulé", "Description", "Prix/mois", "Prix/an", "Nombre d'offres", "Créé par", "Statut"].map((h) => (
                  <th
                    key={h}
                    className="text-left py-3 px-5 text-xs text-gray-400 font-medium uppercase tracking-wide"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paginatedServices.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-5 font-semibold text-gray-900">
                    {s.intituleService}
                  </td>
                  <td className="py-4 px-5 text-gray-500 max-w-xs truncate">
                    {s.description}
                  </td>
                  <td className="py-4 px-5 font-semibold text-[#0F6CBD]">
                    {s.parMois} TND
                  </td>
                  <td className="py-4 px-5 text-gray-600">{s.parAnnee} TND</td>
                  <td className="py-4 px-5 text-center">
                    <span className="bg-[#EAF4FF] text-[#0F6CBD] text-xs font-semibold px-2.5 py-1 rounded-lg">
                      {s.nbOffres} offre{s.nbOffres !== 1 ? "s" : ""}
                    </span>
                  </td>
                  <td className="py-4 px-5 text-gray-500">{s.creePar}</td>
                  <td className="py-4 px-5">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        s.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {s.isActive ? "Actif" : "Inactif"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {totalServicesPages > 1 && (
            <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 bg-gray-50">
              <p className="text-xs text-gray-500">
                {(currentServicesPage - 1) * pageSize + 1}–
                {Math.min(currentServicesPage * pageSize, services.length)} sur {services.length}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentServicesPage((p) => p - 1)}
                  disabled={currentServicesPage === 1}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 text-gray-600 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Précédent
                </button>
                <span className="text-xs text-gray-500">
                  {currentServicesPage} / {totalServicesPages}
                </span>
                <button
                  onClick={() => setCurrentServicesPage((p) => p + 1)}
                  disabled={currentServicesPage === totalServicesPages}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 text-gray-600 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Suivant
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Offres ── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Offres</h2>
          <ExportButton
            data={offres}
            columns={[
              { key: "intituleOffre", label: "Intitulé" },
              { key: "parMois", label: "Prix/mois (TND)" },
              { key: "parAnnee", label: "Prix/an (TND)" },
              { key: "services", label: "Services inclus", format: (v) => (Array.isArray(v) ? v.join(", ") : "") },
              { key: "creePar", label: "Créé par" },
              { key: "isActive", label: "Statut", format: (v) => (v ? "Active" : "Inactive") },
            ]}
            filename="offres"
            label="Exporter offres"
            sheetName="Offres"
            pdfTitle="Catalogue des offres"
          />
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                {["Intitulé", "Prix/mois", "Prix/an", "Services inclus", "Créé par", "Statut"].map((h) => (
                  <th
                    key={h}
                    className="text-left py-3 px-5 text-xs text-gray-400 font-medium uppercase tracking-wide"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paginatedOffres.map((o) => (
                <tr key={o.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-5 font-semibold text-gray-900">
                    {o.intituleOffre}
                  </td>
                  <td className="py-4 px-5 font-semibold text-[#0F6CBD]">
                    {o.parMois} TND
                  </td>
                  <td className="py-4 px-5 text-gray-600">{o.parAnnee} TND</td>
                  <td className="py-4 px-5">
                    {o.services.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {o.services.map((s, i) => (
                          <span
                            key={i}
                            className="bg-[#EAF4FF] text-[#0F6CBD] text-xs px-2 py-0.5 rounded-full"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="py-4 px-5 text-gray-500">{o.creePar}</td>
                  <td className="py-4 px-5">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        o.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {o.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {totalOffresPages > 1 && (
            <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 bg-gray-50">
              <p className="text-xs text-gray-500">
                {(currentOffresPage - 1) * pageSize + 1}–
                {Math.min(currentOffresPage * pageSize, offres.length)} sur {offres.length}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentOffresPage((p) => p - 1)}
                  disabled={currentOffresPage === 1}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 text-gray-600 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Précédent
                </button>
                <span className="text-xs text-gray-500">
                  {currentOffresPage} / {totalOffresPages}
                </span>
                <button
                  onClick={() => setCurrentOffresPage((p) => p + 1)}
                  disabled={currentOffresPage === totalOffresPages}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 text-gray-600 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Suivant
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}