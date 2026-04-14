using AxiaAbonnement.Data;
using AxiaAbonnement.Models.DTOs.Abonnements;
using AxiaAbonnement.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace AxiaAbonnement.Services.Implementations
{
    public class AbonnementService : IAbonnementService
    {
        private readonly AppDbContext _db;
        private readonly INotificationService _notifService;

        public AbonnementService(AppDbContext db, INotificationService notifService)
        {
            _db = db;
            _notifService = notifService;
        }

        public async Task<List<AbonnementDto>> GetMyAbonnementsAsync(Guid userId)
        {
            var abonnements = await _db.Abonnements
                .Include(a => a.Offre)
                .Include(a => a.Service)
                .Where(a => a.UserId == userId)
                .OrderByDescending(a => a.CreatedAt)
                .ToListAsync();

            return abonnements.Select(a => new AbonnementDto
            {
                Id = a.Id,
                IntituleOffre = a.Offre?.IntituleOffre ?? a.Service?.IntituleService ?? "",
                Description = a.Offre?.Description ?? a.Service?.Description ?? "",
                Type = a.Type,
                Montant = a.Montant,
                DateDebut = a.DateDebut,
                DateFin = a.DateFin,
                IsActive = a.IsActive,
                Statut = !a.IsActive ? "suspendu" : a.DateFin < DateTime.UtcNow ? "expiré" : "actif"
            }).ToList();
        }

        public async Task<StatsDto> GetStatsAsync()
        {
            var now = DateTime.UtcNow;

            var totalAbonnes = await _db.Abonnements
                .Where(a => a.IsActive && a.DateFin > now)
                .Select(a => a.UserId)
                .Distinct()
                .CountAsync();

            var revenuMensuel = await _db.Abonnements
                .Where(a => a.IsActive && a.DateFin > now && a.Type == "mensuel")
                .SumAsync(a => a.Montant);

            var servicesActifs = await _db.Services
                .CountAsync(s => s.IsActive);

            var demandesEnAttente = await _db.DemandesRenouvellement
                .CountAsync(d => d.Statut == "en_attente");

            var abonnementsRecents = await _db.Abonnements
                .Include(a => a.Offre)
                .Include(a => a.Service)
                .Include(a => a.User)

                .OrderByDescending(a => a.CreatedAt)
                .Take(5)
                .Select(a => new AbonnementDto
                {
                    Id = a.Id,
                    IntituleOffre = a.Offre != null ? a.Offre.IntituleOffre : a.Service != null ? a.Service.IntituleService : "",
                    Type = a.Type,
                    Montant = a.Montant,
                    DateDebut = a.DateDebut,
                    DateFin = a.DateFin,
                    IsActive = a.IsActive,
                    Statut = !a.IsActive ? "désactivé" : a.DateFin < now ? "expiré" : "actif",
                    ClientUsername = a.User.Username,
                    ClientEmail = a.User.Email
                })
                .ToListAsync();

            return new StatsDto
            {
                TotalAbonnes = totalAbonnes,
                RevenuMensuel = revenuMensuel,
                ServicesActifs = servicesActifs,
                DemandesEnAttente = demandesEnAttente,
                AbonnementsRecents = abonnementsRecents
            };
        }

        public async Task<List<AbonnementDto>> GetAllAbonnementsAsync()
        {
            var now = DateTime.UtcNow;
            return await _db.Abonnements
                .Include(a => a.Offre)
                .Include(a => a.Service)
                .Include(a => a.User)
                .OrderByDescending(a => a.CreatedAt)
                .Select(a => new AbonnementDto
                {
                    Id = a.Id,
                    IntituleOffre = a.Offre != null ? a.Offre.IntituleOffre : a.Service != null ? a.Service.IntituleService : "",
                    Description = a.Offre != null ? a.Offre.Description : a.Service != null ? a.Service.Description : "",
                    Type = a.Type,
                    Montant = a.Montant,
                    DateDebut = a.DateDebut,
                    DateFin = a.DateFin,
                    IsActive = a.IsActive,
                    Statut = !a.IsActive ? "désactivé" : a.DateFin < now ? "expiré" : "actif",
                    ClientUsername = a.User.Username,
                    ClientEmail = a.User.Email
                })

                .ToListAsync();
        }

        public async Task<bool> DesactiverAsync(Guid abonnementId)
        {
            var a = await _db.Abonnements.FindAsync(abonnementId);
            if (a == null || !a.IsActive) return false;
            a.IsActive = false;
            await _db.SaveChangesAsync();

            await _notifService.SendAsync(
                a.UserId,
                "Votre abonnement a été désactivé.",
                "warning"
                );

            return true;

        }

        public async Task<bool> ActiverAsync(Guid abonnementId)
        {
            var a = await _db.Abonnements.FindAsync(abonnementId);
            if (a == null || a.IsActive) return false;
            a.IsActive = true;
            await _db.SaveChangesAsync();

            await _notifService.SendAsync(
                a.UserId,
                $"Votre abonnement a été activé.",
                "success"
                );

            return true;

        }
    }
}