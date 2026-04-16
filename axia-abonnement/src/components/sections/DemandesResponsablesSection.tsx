import { useState, useEffect } from "react";
import axiosInstance from "../../api/axiosInstance";
import {
  Search, Mail, Phone, Building2, FileText, MapPin, Briefcase,
  CheckCircle2, XCircle, X, Clock,
} from "lucide-react";

interface DemandeResponsable {
  id: string;
  username: string;
  email: string;
  phoneNumber: string | null;
  nomEntreprise: string | null;
  matriculeFiscal: string | null;
  secteurActivite: string | null;
  adresseProfessionnelle: string | null;
  statut: string; // Pending | Accepted | Rejected
  createdAt: string;
  dateAcceptation: string | null;
  motifRefus: string | null;
}

type FilterStatut = 'All' | 'Pending' | 'Accepted' | 'Rejected';

type ConfirmAction =
  | { type: 'accept'; demande: DemandeResponsable }
  | { type: 'reject'; demande: DemandeResponsable }
  | null;

const STATUT_LABEL: Record<string, string> = {
  Pending: 'En attente',
  Accepted: 'Acceptée',
  Rejected: 'Refusée',
};

const STATUT_STYLES: Record<string, string> = {
  Pending: 'bg-yellow-100 text-yellow-700',
  Accepted: 'bg-green-100 text-green-700',
  Rejected: 'bg-red-100 text-red-600',
};

export default function DemandesResponsablesSection() {
  const [demandes, setDemandes] = useState<DemandeResponsable[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<FilterStatut>('Pending');
  const [search, setSearch] = useState('');

  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);
  const [motifRefus, setMotifRefus] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<string>('');

  const fetchDemandes = async () => {
    try {
      setLoading(true);
      const params = filter === 'All' ? '' : `?statut=${filter}`;
      const res = await axiosInstance.get(`/demandes-responsables${params}`);
      setDemandes(res.data);
    } catch {
      setError('Erreur lors du chargement des demandes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDemandes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const openAccept = (demande: DemandeResponsable) => {
    setConfirmAction({ type: 'accept', demande });
    setMotifRefus('');
    setError('');
  };

  const openReject = (demande: DemandeResponsable) => {
    setConfirmAction({ type: 'reject', demande });
    setMotifRefus('');
    setError('');
  };

  const closeModal = () => {
    setConfirmAction(null);
    setMotifRefus('');
    setSubmitting(false);
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  const handleConfirm = async () => {
    if (!confirmAction) return;
    setSubmitting(true);
    setError('');
    try {
      if (confirmAction.type === 'accept') {
        await axiosInstance.patch(
          `/demandes-responsables/${confirmAction.demande.id}/accepter`
        );
        showToast(`Demande de ${confirmAction.demande.username} acceptée. Un email avec le lien de paiement a été envoyé.`);
      } else {
        await axiosInstance.patch(
          `/demandes-responsables/${confirmAction.demande.id}/refuser`,
          { motif: motifRefus.trim() || null }
        );
        showToast(`Demande de ${confirmAction.demande.username} refusée. Un email a été envoyé.`);
      }
      closeModal();
      await fetchDemandes();
    } catch {
      setError("Une erreur est survenue. Réessayez.");
      setSubmitting(false);
    }
  };

  const filtered = demandes.filter((d) => {
    const q = search.toLowerCase();
    return (
      d.username.toLowerCase().includes(q) ||
      d.email.toLowerCase().includes(q) ||
      (d.nomEntreprise ?? '').toLowerCase().includes(q)
    );
  });

  const pendingCount = demandes.filter((d) => d.statut === 'Pending').length;

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Demandes de Responsables</h1>
        <p className="text-gray-500 text-sm mt-1">
          {filter === 'Pending'
            ? `${pendingCount} demande(s) en attente de validation`
            : `${demandes.length} demande(s) affichée(s)`}
        </p>
      </div>

      {/* Toast */}
      {toast && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm">
          {toast}
        </div>
      )}

      {error && !confirmAction && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* Filtres */}
      <div className="flex flex-wrap gap-2 mb-4">
        {(['Pending', 'Accepted', 'Rejected', 'All'] as FilterStatut[]).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
              filter === s
                ? 'bg-[#4F46E5] text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-[#4F46E5]'
            }`}
          >
            {s === 'All' ? 'Toutes' : STATUT_LABEL[s]}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Rechercher par nom, email ou entreprise..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#4F46E5]/30 focus:border-[#4F46E5]"
          />
        </div>
      </div>

      {/* Liste */}
      {loading ? (
        <div className="grid md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-200 p-6 animate-pulse">
              <div className="w-40 h-4 bg-gray-200 rounded mb-3" />
              <div className="w-56 h-3 bg-gray-200 rounded mb-2" />
              <div className="w-48 h-3 bg-gray-200 rounded mb-6" />
              <div className="flex gap-2">
                <div className="flex-1 h-9 bg-gray-200 rounded-xl" />
                <div className="flex-1 h-9 bg-gray-200 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Clock className="mx-auto mb-3" size={32} />
          <p className="text-lg font-medium">Aucune demande</p>
          <p className="text-sm mt-1">Les nouvelles demandes apparaîtront ici.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {filtered.map((d) => (
            <div key={d.id} className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-[#4F46E5] rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {d.username.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{d.username}</h3>
                    <p className="text-xs text-gray-400">
                      Demande du {new Date(d.createdAt).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>
                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${STATUT_STYLES[d.statut] ?? 'bg-gray-100 text-gray-500'}`}>
                  {STATUT_LABEL[d.statut] ?? d.statut}
                </span>
              </div>

              <div className="space-y-2 mb-5 text-sm text-gray-600">
                <div className="flex items-center gap-2"><Mail size={14} /><span className="truncate">{d.email}</span></div>
                {d.phoneNumber && <div className="flex items-center gap-2"><Phone size={14} />{d.phoneNumber}</div>}
                {d.nomEntreprise && <div className="flex items-center gap-2"><Building2 size={14} />{d.nomEntreprise}</div>}
                {d.matriculeFiscal && <div className="flex items-center gap-2"><FileText size={14} />{d.matriculeFiscal}</div>}
                {d.secteurActivite && <div className="flex items-center gap-2"><Briefcase size={14} />{d.secteurActivite}</div>}
                {d.adresseProfessionnelle && (
                  <div className="flex items-start gap-2"><MapPin size={14} className="mt-0.5" /><span>{d.adresseProfessionnelle}</span></div>
                )}
              </div>

              {d.statut === 'Rejected' && d.motifRefus && (
                <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg text-xs text-red-700">
                  <strong>Motif du refus : </strong>{d.motifRefus}
                </div>
              )}
              {d.statut === 'Accepted' && d.dateAcceptation && (
                <div className="mb-4 p-3 bg-green-50 border border-green-100 rounded-lg text-xs text-green-700">
                  Acceptée le {new Date(d.dateAcceptation).toLocaleDateString('fr-FR')} — en attente de paiement.
                </div>
              )}

              {d.statut === 'Pending' && (
                <div className="flex gap-2">
                  <button
                    onClick={() => openAccept(d)}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium py-2 rounded-xl transition-colors"
                  >
                    <CheckCircle2 size={15} />
                    Accepter
                  </button>
                  <button
                    onClick={() => openReject(d)}
                    className="flex-1 flex items-center justify-center gap-1.5 border border-red-200 text-red-600 hover:bg-red-50 text-sm font-medium py-2 rounded-xl transition-colors"
                  >
                    <XCircle size={15} />
                    Refuser
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal confirmation */}
      {confirmAction && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">
                {confirmAction.type === 'accept' ? 'Accepter la demande ?' : 'Refuser la demande ?'}
              </h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
                  {error}
                </div>
              )}

              <p className="text-sm text-gray-600">
                {confirmAction.type === 'accept' ? (
                  <>
                    Vous allez accepter la demande de <strong>{confirmAction.demande.username}</strong> ({confirmAction.demande.email}).
                    Un email automatique lui sera envoyé avec le <strong>lien de paiement de 500 TND</strong> pour activer son compte.
                  </>
                ) : (
                  <>
                    Vous allez refuser la demande de <strong>{confirmAction.demande.username}</strong> ({confirmAction.demande.email}).
                    Un email lui sera envoyé pour l'informer.
                  </>
                )}
              </p>

              {confirmAction.type === 'reject' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Motif du refus <span className="text-gray-400 font-normal">(optionnel)</span>
                  </label>
                  <textarea
                    rows={3}
                    value={motifRefus}
                    onChange={(e) => setMotifRefus(e.target.value)}
                    placeholder="Ex: Informations professionnelles incomplètes..."
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#4F46E5]/30 focus:border-[#4F46E5] resize-none"
                  />
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleConfirm}
                  disabled={submitting}
                  className={`flex-1 text-white py-2.5 rounded-xl font-medium text-sm transition-colors disabled:opacity-60 ${
                    confirmAction.type === 'accept'
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {submitting ? 'En cours...' : confirmAction.type === 'accept' ? 'Confirmer l\'acceptation' : 'Confirmer le refus'}
                </button>
                <button
                  onClick={closeModal}
                  className="flex-1 border border-gray-200 hover:bg-gray-50 text-gray-700 py-2.5 rounded-xl font-medium text-sm"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}