import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../../api/axiosInstance";

import ResponsableClientsKpiCards from "./components/ResponsableClientsKpiCards";
import ResponsableClientsFilters from "./components/ResponsableClientsFilters";
import ResponsableClientsGrid from "./components/ResponsableClientsGrid";
import ClientSubscriptionsModal from "./components/ClientSubscriptionsModal";

import type {
  AbonnementClientDto,
  Client,
  FilterTab,
  MemberSinceFilter,
  PhoneFilter,
} from "./types";
import { PAGE_SIZE } from "./types";
import { isInCurrentYear, isWithinLastDays } from "./utils";

export default function ArchiveSection() {
  const navigate = useNavigate();

  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  const [tab, setTab] = useState<FilterTab>("tous");
  const [searchTerm, setSearchTerm] = useState("");
  const [memberSinceFilter, setMemberSinceFilter] =
    useState<MemberSinceFilter>("all");
  const [phoneFilter, setPhoneFilter] = useState<PhoneFilter>("all");
  const [page, setPage] = useState(1);

  const [openSubs, setOpenSubs] = useState(false);
  const [subsLoading, setSubsLoading] = useState(false);
  const [subs, setSubs] = useState<AbonnementClientDto[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  useEffect(() => {
    let cancelled = false;

    setLoading(true);

    axiosInstance
      .get<Client[]>("/users/clients")
      .then((response) => {
        if (!cancelled) setClients(response.data ?? []);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const actifs = useMemo(
    () => clients.filter((client) => client.isActive).length,
    [clients],
  );

  const inactifs = useMemo(
    () => clients.filter((client) => !client.isActive).length,
    [clients],
  );

  const filtered = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    let result = clients;

    if (tab === "actif") {
      result = result.filter((client) => client.isActive);
    }

    if (tab === "inactif") {
      result = result.filter((client) => !client.isActive);
    }

    if (memberSinceFilter === "30days") {
      result = result.filter((client) =>
        isWithinLastDays(client.createdAt, 30),
      );
    }

    if (memberSinceFilter === "90days") {
      result = result.filter((client) =>
        isWithinLastDays(client.createdAt, 90),
      );
    }

    if (memberSinceFilter === "year") {
      result = result.filter((client) =>
        isInCurrentYear(client.createdAt),
      );
    }

    if (phoneFilter === "withPhone") {
      result = result.filter((client) => Boolean(client.phoneNumber));
    }

    if (phoneFilter === "withoutPhone") {
      result = result.filter((client) => !client.phoneNumber);
    }

    if (!term) return result;

    return result.filter(
      (client) =>
        client.username.toLowerCase().includes(term) ||
        client.email.toLowerCase().includes(term) ||
        client.phoneNumber?.toLowerCase().includes(term),
    );
  }, [clients, tab, searchTerm, memberSinceFilter, phoneFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  const paginatedClients = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  useEffect(() => {
    setPage(1);
  }, [tab, searchTerm, memberSinceFilter, phoneFilter]);

  useEffect(() => {
    setPage((currentPage) => Math.min(currentPage, totalPages));
  }, [totalPages]);

  const totalActifsFiltres = useMemo(
    () => filtered.filter((client) => client.isActive).length,
    [filtered],
  );

  const totalInactifsFiltres = useMemo(
    () => filtered.filter((client) => !client.isActive).length,
    [filtered],
  );

  const hasFilters =
    tab !== "tous" ||
    searchTerm.trim() !== "" ||
    memberSinceFilter !== "all" ||
    phoneFilter !== "all";

  const resetFilters = () => {
    setTab("tous");
    setSearchTerm("");
    setMemberSinceFilter("all");
    setPhoneFilter("all");
  };

  const openConversation = (client: Client) => {
    navigate(
      `/dashboard/responsable/messages?clientId=${encodeURIComponent(
        client.id,
      )}`,
    );
  };

  const openClientSubs = async (client: Client) => {
    setSelectedClient(client);
    setOpenSubs(true);
    setSubs([]);
    setSubsLoading(true);

    try {
      const response = await axiosInstance.get<AbonnementClientDto[]>(
        `/abonnements/by-client/${client.id}`,
      );

      setSubs(response.data ?? []);
    } catch {
      setSubs([]);
    } finally {
      setSubsLoading(false);
    }
  };

  return (
    <div className="ui-page">
      <div className="mb-6">
        <h1 className="ui-title">Archive clients</h1>

        <p className="ui-subtitle">
          {actifs} actif(s) · {inactifs} inactif(s) · {clients.length} total
        </p>
      </div>

      <ResponsableClientsKpiCards
        totalClients={clients.length}
        actifs={actifs}
        inactifs={inactifs}
      />

      <ResponsableClientsFilters
        clients={clients}
        filtered={filtered}
        tab={tab}
        searchTerm={searchTerm}
        memberSinceFilter={memberSinceFilter}
        phoneFilter={phoneFilter}
        totalActifsFiltres={totalActifsFiltres}
        totalInactifsFiltres={totalInactifsFiltres}
        hasFilters={hasFilters}
        onTabChange={setTab}
        onSearchChange={setSearchTerm}
        onMemberSinceFilterChange={setMemberSinceFilter}
        onPhoneFilterChange={setPhoneFilter}
        onResetFilters={resetFilters}
      />

      <ResponsableClientsGrid
        clients={paginatedClients}
        loading={loading}
        totalItems={filtered.length}
        currentPage={page}
        totalPages={totalPages}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
        onOpenSubscriptions={(client) => void openClientSubs(client)}
        onOpenConversation={openConversation}
      />

      <ClientSubscriptionsModal
        open={openSubs}
        selectedClient={selectedClient}
        subscriptions={subs}
        loading={subsLoading}
        onClose={() => setOpenSubs(false)}
      />
    </div>
  );
}