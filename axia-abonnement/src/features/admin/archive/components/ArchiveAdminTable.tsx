import EmptyState from "../../../../components/common/EmptyState";
import LoadingState from "../../../../components/common/LoadingState";
import Pagination from "../../../../components/common/Pagination";
import type { Client } from "../types";
import { avatarColor, formatDate, getInitials } from "../utils";

interface ResponsableAvatarProps {
  name: string;
}

function ResponsableAvatar({ name }: ResponsableAvatarProps) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${avatarColor(
          name,
        )}`}
      >
        {getInitials(name)}
      </div>

      <span className="text-sm text-gray-600">{name}</span>
    </div>
  );
}

interface ArchiveAdminTableProps {
  clients: Client[];
  loading: boolean;
  totalItems: number;
  currentPage: number;
  totalPages: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export default function ArchiveAdminTable({
  clients,
  loading,
  totalItems,
  currentPage,
  totalPages,
  pageSize,
  onPageChange,
}: ArchiveAdminTableProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-0 overflow-hidden">
        <LoadingState heightClassName="h-40" />
      </div>
    );
  }

  if (totalItems === 0) {
    return <EmptyState title="Aucun client trouvé" />;
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-0 overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100">
            {[
              "Client",
              "Email",
              "Responsable",
              "Abonnement actif",
              "Mensuel",
              "Statut",
            ].map((header) => (
              <th
                key={header}
                className="text-left py-3 px-5 text-xs text-gray-400 font-medium uppercase tracking-wide"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-50">
          {clients.map((client) => (
            <tr
              key={client.id}
              className="hover:bg-gray-50 transition-colors"
            >
              <td className="py-4 px-5">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${avatarColor(
                      client.username,
                    )}`}
                  >
                    {getInitials(client.username)}
                  </div>

                  <div>
                    <p className="font-semibold text-gray-900">
                      {client.username}
                    </p>

                    <p className="text-xs text-gray-400">
                      Membre depuis {formatDate(client.createdAt)}
                    </p>
                  </div>
                </div>
              </td>

              <td className="py-4 px-5 text-gray-500 text-xs">
                {client.email}
              </td>

              <td className="py-4 px-5">
                {client.responsableUsername ? (
                  <ResponsableAvatar name={client.responsableUsername} />
                ) : (
                  <span className="text-gray-400">—</span>
                )}
              </td>

              <td className="py-4 px-5">
                {client.abonnementActif ? (
                  <span className="text-(--color-primary) font-medium">
                    {client.abonnementActif}
                  </span>
                ) : (
                  <span className="text-gray-400">—</span>
                )}
              </td>

              <td className="py-4 px-5 font-semibold text-gray-900 whitespace-nowrap">
                {client.montantActif != null
                  ? `${client.montantActif} TND`
                  : "—"}
              </td>

              <td className="py-4 px-5">
                {client.statutAbonnement ? (
                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                      client.statutAbonnement === "actif"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-600"
                    }`}
                  >
                    {client.statutAbonnement}
                  </span>
                ) : (
                  <span className="text-xs text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">
                    aucun
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        pageSize={pageSize}
        itemLabel="client(s)"
        onPageChange={onPageChange}
      />

      <div className="px-5 py-3 border-t border-gray-100 bg-gray-50">
        <p className="text-xs text-gray-500">{totalItems} client(s) filtré(s)</p>
      </div>
    </div>
  );
}