import { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosInstance";
import ExportButton from "../common/ExportButton";

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

  // Pagination services
  const totalServicesPages = Math.ceil(services.length / pageSize);
  const paginatedServices = services.slice(
    (currentServicesPage - 1) * pageSize,
    currentServicesPage * pageSize,
  );

  // Pagination offres
  const totalOffresPages = Math.ceil(offres.length / pageSize);
  const paginatedOffres = offres.slice(
    (currentOffresPage - 1) * pageSize,
    currentOffresPage * pageSize,
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-40">
        <div className="w-8 h-8 border-4 border-[#4F46E5] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const activeServices = services.filter((s) => s.isActive).length;
  const activeOffres = offres.filter((o) => o.isActive).length;

  const statCards = [
    {
      label: "Total services",
      value: services.length,
      sub: `${activeServices} actif${activeServices !== 1 ? "s" : ""}`,
      color: "text-[#4F46E5]",
      bg: "bg-[#4F46E5]/10 text-[#4F46E5]",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z"
          />
        </svg>
      ),
    },
    {
      label: "Services actifs",
      value: activeServices,
      sub: `${services.length - activeServices} inactif${services.length - activeServices !== 1 ? "s" : ""}`,
      color: "text-green-600",
      bg: "bg-green-100 text-green-700",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
    {
      label: "Total offres",
      value: offres.length,
      sub: `${activeOffres} active${activeOffres !== 1 ? "s" : ""}`,
      color: "text-indigo-600",
      bg: "bg-indigo-100 text-indigo-600",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z"
          />
        </svg>
      ),
    },
    {
      label: "Offres actives",
      value: activeOffres,
      sub: `${offres.length - activeOffres} inactive${offres.length - activeOffres !== 1 ? "s" : ""}`,
      color: "text-purple-600",
      bg: "bg-purple-100 text-purple-600",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
          />
        </svg>
      ),
    },
  ];

  return (
    <div className="p-6 lg:p-8">
      <h1 className="text-2xl font-bold text-gray-900">Catalogue</h1>
      <p className="text-sm text-gray-500 mt-1">
        {services.length} service(s) · {offres.length} offre(s)
      </p>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6 mb-2">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="bg-white rounded-2xl border border-gray-200 p-5"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 mb-1">{card.label}</p>
                <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                <p className={`text-xs mt-1 ${card.color}`}>{card.sub}</p>
              </div>
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center ${card.bg}`}
              >
                {card.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      {/* Tableau Services */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Services</h2>
        <div className="flex justify-end mb-4">
          <ExportButton
            data={services}
            columns={[
              { key: "intituleService", label: "Intitulé" },
              { key: "description", label: "Description" },
              {
                key: "parMois",
                label: "Prix/mois (TND)",
              },
              {
                key: "parAnnee",
                label: "Prix/an (TND)",
              },
              { key: "nbOffres", label: "Nombre d'offres" },
              { key: "creePar", label: "Créé par" },
              {
                key: "isActive",
                label: "Statut",
                format: (v) => (v ? "Actif" : "Inactif"),
              },
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
              <tr className="bg-gray-50 text-left text-gray-500 text-xs uppercase">
                <th className="px-5 py-3 font-medium">Intitulé</th>
                <th className="px-5 py-3 font-medium">Description</th>
                <th className="px-5 py-3 font-medium">Prix</th>
                <th className="px-5 py-3 font-medium">Nombre d'offres</th>
                <th className="px-5 py-3 font-medium">Créé par</th>
                <th className="px-5 py-3 font-medium text-center">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedServices.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3 font-medium text-gray-900">
                    {s.intituleService}
                  </td>
                  <td className="px-5 py-3 text-gray-500 max-w-xs truncate">
                    {s.description}
                  </td>
                  <td className="px-5 py-3">
                    <p className="text-sm font-bold text-[#4F46E5]">
                      {s.parMois} TND
                      <span className="text-xs text-gray-400 font-normal">
                        {" "}
                        /mois
                      </span>
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {s.parAnnee} TND
                      <span className="text-gray-400"> /an</span>
                    </p>
                  </td>
                  <td className="px-5 py-3 text-center text-gray-700">
                    {s.nbOffres}
                  </td>
                  <td className="px-5 py-3 text-gray-500">{s.creePar}</td>
                  <td className="px-5 py-3 text-center">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
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
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
              <p className="text-xs text-gray-500">
                {(currentServicesPage - 1) * pageSize + 1}-
                {Math.min(currentServicesPage * pageSize, services.length)} sur{" "}
                {services.length} services
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentServicesPage((p) => p - 1)}
                  disabled={currentServicesPage === 1}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Précédent
                </button>
                <span className="text-xs text-gray-500">
                  {currentServicesPage} / {totalServicesPages}
                </span>
                <button
                  onClick={() => setCurrentServicesPage((p) => p + 1)}
                  disabled={currentServicesPage === totalServicesPages}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Suivant
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tableau Offres */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Offres</h2>
        <div className="flex justify-end mb-4">
          <ExportButton
            data={offres}
            columns={[
              { key: "intituleOffre", label: "Intitulé" },
              {
                key: "parMois",
                label: "Prix/mois (TND)",
              },
              {
                key: "parAnnee",
                label: "Prix/an (TND)",
              },
              {
                key: "services",
                label: "Services inclus",
                format: (v) => (Array.isArray(v) ? v.join(", ") : ""),
              },
              { key: "creePar", label: "Créé par" },
              {
                key: "isActive",
                label: "Statut",
                format: (v) => (v ? "Active" : "Inactive"),
              },
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
              {paginatedOffres.map((o) => (
                <tr key={o.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3 font-medium text-gray-900">
                    {o.intituleOffre}
                  </td>
                  <td className="px-5 py-3 text-gray-700">{o.parMois} TND</td>
                  <td className="px-5 py-3 text-gray-700">{o.parAnnee} TND</td>
                  <td className="px-5 py-3 text-gray-500 max-w-xs truncate">
                    {o.services.length > 0 ? o.services.join(", ") : "—"}
                  </td>
                  <td className="px-5 py-3 text-gray-500">{o.creePar}</td>
                  <td className="px-5 py-3 text-center">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
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
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
              <p className="text-xs text-gray-500">
                {(currentOffresPage - 1) * pageSize + 1}-
                {Math.min(currentOffresPage * pageSize, offres.length)} sur{" "}
                {offres.length} offres
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentOffresPage((p) => p - 1)}
                  disabled={currentOffresPage === 1}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Précédent
                </button>
                <span className="text-xs text-gray-500">
                  {currentOffresPage} / {totalOffresPages}
                </span>
                <button
                  onClick={() => setCurrentOffresPage((p) => p + 1)}
                  disabled={currentOffresPage === totalOffresPages}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
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
