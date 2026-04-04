using AxiaAbonnement.Data;
using AxiaAbonnement.Models.DTOs.Abonnements;
using AxiaAbonnement.Models.Entities;
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

            // Vérifier qu'il n'y a pas déjà une demande en attente
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

            // Notifier tous les responsables
            var responsables = await _db.Users
                .Where(u => u.Role == "Responsable" && u.IsActive)
                .ToListAsync();

            foreach (var resp in responsables)
            {
                await _notifService.SendAsync(
                    resp.Id,
                    $"Nouvelle demande de renouvellement d'abonnement en attente.",
                    "info"
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
                    IntituleOffre = d.Abonnement.Offre != null ? d.Abonnement.Offre.IntituleOffre : d.Abonnement.Service != null ? d.Abonnement.Service.IntituleService : "",
                    Type = d.Abonnement.Type,
                    Montant = d.Abonnement.Montant,
                    Statut = d.Statut,
                    CreatedAt = d.CreatedAt
                })
                .ToListAsync();
        }

        public async Task<bool> AccepterAsync(Guid demandeId)
        {
            var demande = await _db.DemandesRenouvellement
                .Include(d => d.Abonnement)
                .FirstOrDefaultAsync(d => d.Id == demandeId);
            if (demande == null || demande.Statut != "en_attente") return false;

            demande.Statut = "acceptée";
            demande.TraiteeAt = DateTime.UtcNow;

            demande.Abonnement.IsActive = true;
            demande.Abonnement.DateDebut = DateTime.UtcNow;
            demande.Abonnement.DateFin = demande.Abonnement.Type == "annuel"
                ? DateTime.UtcNow.AddYears(1)
                : DateTime.UtcNow.AddMonths(1);

            await _db.SaveChangesAsync();

            await _notifService.SendAsync(
                demande.Abonnement.UserId,
                "Votre demande de renouvellement a été acceptée. Votre abonnement est maintenant actif.",
                "success"
            );

            return true;
        }

        public async Task<bool> RefuserAsync(Guid demandeId)
        {
            var demande = await _db.DemandesRenouvellement
                .FirstOrDefaultAsync(d => d.Id == demandeId);
            if (demande == null || demande.Statut != "en_attente") return false;

            demande.Statut = "refusée";
            demande.TraiteeAt = DateTime.UtcNow;

            await _db.SaveChangesAsync();

            await _notifService.SendAsync(
                demande.ClientId,
                "Votre demande de renouvellement a été refusée.",
                "warning"
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