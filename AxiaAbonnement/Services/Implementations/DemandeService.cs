using AxiaAbonnement.Data;
using AxiaAbonnement.Models.DTOs.Abonnements;
using AxiaAbonnement.Models.Entities;
using AxiaAbonnement.Models.Enums;
using AxiaAbonnement.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace AxiaAbonnement.Services.Implementations
{
    public class DemandeService : IDemandeService
    {
        private readonly AppDbContext _db;
        private readonly INotificationService _notifService;

        public DemandeService(AppDbContext db, INotificationService notifService)
        {
            _db = db;
            _notifService = notifService;
        }

        public async Task<bool> DemanderRenouvellementAsync(Guid abonnementId, Guid clientId)
        {
            var abonnement = await _db.Abonnements
                .FirstOrDefaultAsync(a => a.Id == abonnementId && a.UserId == clientId);
            if (abonnement == null) return false;

            if (abonnement.ServiceId != null)
            {
                var service = await _db.Services.FindAsync(abonnement.ServiceId.Value);
                if (service == null || !service.IsActive) return false;
            }
            else if (abonnement.OffreId != null)
            {
                var offre = await _db.Offres.FindAsync(abonnement.OffreId.Value);
                if (offre == null || !offre.IsActive) return false;
            }

            var existante = await _db.DemandesRenouvellement
                .AnyAsync(d => d.AbonnementId == abonnementId && d.Statut == "en_attente");
            if (existante) return false;

            _db.DemandesRenouvellement.Add(new DemandeRenouvellement
            {
                AbonnementId = abonnementId,
                ClientId = clientId,
                Statut = "en_attente"
            });
            await _db.SaveChangesAsync();

            var responsableIds = new List<Guid>();

            if (abonnement.ServiceId != null)
            {
                var service = await _db.Services.FindAsync(abonnement.ServiceId.Value);
                if (service?.ResponsableId != null)
                    responsableIds.Add(service.ResponsableId.Value);
            }
            else if (abonnement.OffreId != null)
            {
                var ids = await _db.ServiceOffres
                    .Where(so => so.OffreId == abonnement.OffreId)
                    .Select(so => so.ServiceId)
                    .ToListAsync();

                var respIds = await _db.Services
                    .Where(s => ids.Contains(s.Id) && s.ResponsableId != null)
                    .Select(s => s.ResponsableId!.Value)
                    .Distinct()
                    .ToListAsync();

                responsableIds.AddRange(respIds);
            }

            foreach (var respId in responsableIds)
            {
                await _notifService.SendAsync(
                    respId,
                    "Nouvelle demande de renouvellement d'abonnement en attente.",
                    "info",
                    "/dashboard/responsable/suivi-abonnements"
                );
            }

            return true;
        }

        public async Task<List<DemandeDto>> GetDemandesAsync()
        {
            return await _db.DemandesRenouvellement
                .Include(d => d.Abonnement).ThenInclude(a => a.Offre)
                .Include(d => d.Abonnement).ThenInclude(a => a.Service)
                .Include(d => d.Client)
                .OrderByDescending(d => d.CreatedAt)
                .Select(d => new DemandeDto
                {
                    Id = d.Id,
                    AbonnementId = d.AbonnementId,
                    ClientUsername = d.Client.Username,
                    ClientEmail = d.Client.Email,
                    IntituleOffre = d.Abonnement.Offre != null
                        ? d.Abonnement.Offre.IntituleOffre
                        : d.Abonnement.Service != null
                            ? d.Abonnement.Service.IntituleService
                            : "",
                    Type = d.Abonnement.Type,
                    Montant = d.Abonnement.Montant,
                    Statut = d.Statut,
                    CreatedAt = d.CreatedAt
                })
                .ToListAsync();
        }

        public async Task<List<DemandeDto>> GetDemandesByResponsableAsync(Guid responsableId)
        {
            var mesServiceIds = await _db.Services
                .Where(s => s.ResponsableId == responsableId)
                .Select(s => s.Id)
                .ToListAsync();

            return await _db.DemandesRenouvellement
                .Include(d => d.Abonnement).ThenInclude(a => a.Offre)
                    .ThenInclude(o => o!.ServiceOffres)
                .Include(d => d.Abonnement).ThenInclude(a => a.Service)
                .Include(d => d.Client)
                .Where(d =>
                    (d.Abonnement.ServiceId.HasValue && mesServiceIds.Contains(d.Abonnement.ServiceId.Value)) ||
                    (d.Abonnement.OffreId.HasValue && d.Abonnement.Offre!.ServiceOffres.Any(so => mesServiceIds.Contains(so.ServiceId)))
                )
                .OrderByDescending(d => d.CreatedAt)
                .Select(d => new DemandeDto
                {
                    Id = d.Id,
                    AbonnementId = d.AbonnementId,
                    ClientUsername = d.Client.Username,
                    ClientEmail = d.Client.Email,
                    IntituleOffre = d.Abonnement.Offre != null
                        ? d.Abonnement.Offre.IntituleOffre
                        : d.Abonnement.Service != null
                            ? d.Abonnement.Service.IntituleService
                            : "",
                    Type = d.Abonnement.Type,
                    Montant = d.Abonnement.Montant,
                    Statut = d.Statut,
                    CreatedAt = d.CreatedAt
                })
                .ToListAsync();
        }

        public async Task<bool> AccepterAsync(Guid demandeId, Guid responsableId)
        {
            var demande = await _db.DemandesRenouvellement
                .Include(d => d.Abonnement)
                    .ThenInclude(a => a.Service)
                .Include(d => d.Abonnement)
                    .ThenInclude(a => a.Offre)
                        .ThenInclude(o => o!.ServiceOffres)
                            .ThenInclude(so => so.Service!)
                .FirstOrDefaultAsync(d => d.Id == demandeId);

            if (demande == null || demande.Statut != "en_attente") return false;

            bool owns = false;
            var a = demande.Abonnement;
            if (a.ServiceId != null)
                owns = a.Service?.ResponsableId == responsableId;
            else if (a.OffreId != null)
                owns = a.Offre?.ServiceOffres.Any(so => so.Service?.ResponsableId == responsableId) ?? false;

            if (!owns) return false;

            demande.Statut = "acceptée";
            demande.TraiteeAt = DateTime.UtcNow;

            _db.Paiements.Add(new Paiement
            {
                AbonnementId = a.Id,
                UserId = a.UserId,
                Montant = a.Montant,
                Statut = "pending",
                PaymentType = "renewal"
            });

            await _db.SaveChangesAsync();
            await _notifService.SendAsync(
                demande.Abonnement.UserId,
                "Votre demande de renouvellement a été acceptée. Veuillez procéder au paiement pour activer votre abonnement.",
                "info",
                "/dashboard/client/subscriptions"
            );
            return true;
        }

        public async Task<bool> RefuserAsync(Guid demandeId, Guid responsableId)
        {
            var demande = await _db.DemandesRenouvellement
                .Include(d => d.Abonnement)
                    .ThenInclude(a => a.Service)
                .Include(d => d.Abonnement)
                    .ThenInclude(a => a.Offre)
                        .ThenInclude(o => o!.ServiceOffres)
                            .ThenInclude(so => so.Service!)
                .FirstOrDefaultAsync(d => d.Id == demandeId);

            if (demande == null || demande.Statut != "en_attente") return false;

            bool owns = false;
            var a = demande.Abonnement;
            if (a.ServiceId != null)
                owns = a.Service?.ResponsableId == responsableId;
            else if (a.OffreId != null)
                owns = a.Offre?.ServiceOffres.Any(so => so.Service?.ResponsableId == responsableId) ?? false;

            if (!owns) return false;

            demande.Statut = "refusée";
            demande.TraiteeAt = DateTime.UtcNow;

            await _db.SaveChangesAsync();
            await _notifService.SendAsync(
                demande.ClientId,
                "Votre demande de renouvellement a été refusée.",
                "warning",
                "/dashboard/client/subscriptions"
            );
            return true;
        }

        public async Task<string?> GetStatutDemandeAsync(Guid abonnementId, Guid clientId)
        {
            var demande = await _db.DemandesRenouvellement
                .Where(d => d.AbonnementId == abonnementId && d.ClientId == clientId)
                .OrderByDescending(d => d.CreatedAt)
                .FirstOrDefaultAsync();
            return demande?.Statut;
        }
    }
}