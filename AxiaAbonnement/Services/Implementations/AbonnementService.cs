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

            var stats = await _db.Abonnements
                .GroupBy(_ => 1)
                .Select(g => new
                {
                    TotalAbonnes = g.Where(a => a.IsActive && a.DateFin > now)
                                    .Select(a => a.UserId).Distinct().Count(),
                    RevenuMensuel = g.Where(a => a.IsActive && a.DateFin > now && a.Type == "mensuel")
                                     .Sum(a => (decimal?)a.Montant) ?? 0m,
                    DemandesEnAttente = _db.DemandesRenouvellement
                                            .Count(d => d.Statut == "en_attente"),
                    ServicesActifs = _db.Services.Count(s => s.IsActive),
                })
                .FirstOrDefaultAsync();

            var abonnementsRecents = await _db.Abonnements
                .Include(a => a.Offre)
                .Include(a => a.Service)
                .Include(a => a.User)
                .OrderByDescending(a => a.CreatedAt)
                .Take(5)
                .Select(a => new AbonnementDto
                {
                    Id = a.Id,
                    IntituleOffre = a.Offre != null ? a.Offre.IntituleOffre
                                  : a.Service != null ? a.Service.IntituleService : "",
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
                TotalAbonnes = stats?.TotalAbonnes ?? 0,
                RevenuMensuel = stats?.RevenuMensuel ?? 0m,
                ServicesActifs = stats?.ServicesActifs ?? 0,
                DemandesEnAttente = stats?.DemandesEnAttente ?? 0,
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

        public async Task<List<AbonnementDto>> GetAbonnementsByResponsableAsync(Guid responsableId)
        {
            var now = DateTime.UtcNow;

            var mesServiceIds = await _db.Services
                .Where(s => s.ResponsableId == responsableId)
                .Select(s => s.Id)
                .ToListAsync();

            return await _db.Abonnements
                .Include(a => a.Offre)
                .Include(a => a.Service)
                .Include(a => a.User)
                .Where(a =>
                    (a.ServiceId.HasValue && mesServiceIds.Contains(a.ServiceId.Value)) ||
                    (a.OffreId.HasValue && a.Offre!.ServiceOffres.Any(so => mesServiceIds.Contains(so.ServiceId)))
                )
                .OrderByDescending(a => a.CreatedAt)
                .Select(a => new AbonnementDto
                {
                    Id = a.Id,
                    IntituleOffre = a.Offre != null ? a.Offre.IntituleOffre
                                  : a.Service != null ? a.Service.IntituleService : "",
                    Description = a.Offre != null ? a.Offre.Description
                                : a.Service != null ? a.Service.Description : "",
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

        public async Task<StatsDto> GetStatsByResponsableAsync(Guid responsableId)
        {
            var now = DateTime.UtcNow;

            var mesServiceIds = await _db.Services
                .Where(s => s.ResponsableId == responsableId)
                .Select(s => s.Id)
                .ToListAsync();

            var mesAbonnements = await _db.Abonnements
                .Where(a =>
                    (a.ServiceId.HasValue && mesServiceIds.Contains(a.ServiceId.Value)) ||
                    (a.OffreId.HasValue && a.Offre!.ServiceOffres.Any(so => mesServiceIds.Contains(so.ServiceId)))
                )
                .ToListAsync();

            var mesClientIds = mesAbonnements.Select(a => a.UserId).Distinct().ToList();

            var abonnementsRecents = await _db.Abonnements
                .Include(a => a.Offre)
                .Include(a => a.Service)
                .Include(a => a.User)
                .Where(a =>
                    (a.ServiceId.HasValue && mesServiceIds.Contains(a.ServiceId.Value)) ||
                    (a.OffreId.HasValue && a.Offre!.ServiceOffres.Any(so => mesServiceIds.Contains(so.ServiceId)))
                )
                .OrderByDescending(a => a.CreatedAt)
                .Take(5)
                .Select(a => new AbonnementDto
                {
                    Id = a.Id,
                    IntituleOffre = a.Offre != null ? a.Offre.IntituleOffre
                                  : a.Service != null ? a.Service.IntituleService : "",
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
                TotalAbonnes = mesAbonnements
                    .Where(a => a.IsActive && a.DateFin > now)
                    .Select(a => a.UserId).Distinct().Count(),
                RevenuMensuel = mesAbonnements
                    .Where(a => a.IsActive && a.DateFin > now && a.Type == "mensuel")
                    .Sum(a => a.Montant),
                ServicesActifs = await _db.Services
                    .CountAsync(s => s.ResponsableId == responsableId && s.IsActive),
                DemandesEnAttente = await _db.DemandesRenouvellement
                    .CountAsync(d => d.Statut == "en_attente" && mesClientIds.Contains(d.ClientId)),
                AbonnementsRecents = abonnementsRecents
            };
        }


        public async Task<bool> DesactiverAsync(Guid abonnementId, Guid responsableId)
        {
            var a = await _db.Abonnements
        .Include(a => a.Service)
        .Include(a => a.Offre).ThenInclude(o => o!.ServiceOffres).ThenInclude(so => so.Service!)
        .FirstOrDefaultAsync(a => a.Id == abonnementId);

            if (a == null || !a.IsActive) return false;

            // Vérifier que le responsable possède ce service/offre
            bool owns = false;
            if (a.ServiceId != null)
                owns = a.Service?.ResponsableId == responsableId;
            else if (a.OffreId != null)
                owns = a.Offre?.ServiceOffres.Any(so => so.Service?.ResponsableId == responsableId) ?? false;

            if (!owns) return false;

            a.IsActive = false;
            await _db.SaveChangesAsync();
            await _notifService.SendAsync(a.UserId,
                "Votre abonnement a été désactivé.", "warning",
                "/dashboard/client/subscriptions");
            return true;
        }

        public async Task<bool> ActiverAsync(Guid abonnementId, Guid responsableId)
        {
            var a = await _db.Abonnements
                .Include(a => a.Service)
                .Include(a => a.Offre).ThenInclude(o => o!.ServiceOffres).ThenInclude(so => so.Service!)
                .FirstOrDefaultAsync(a => a.Id == abonnementId);

            if (a == null || a.IsActive) return false;

            bool owns = false;
            if (a.ServiceId != null)
                owns = a.Service?.ResponsableId == responsableId;
            else if (a.OffreId != null)
                owns = a.Offre?.ServiceOffres.Any(so => so.Service?.ResponsableId == responsableId) ?? false;

            if (!owns) return false;

            a.IsActive = true;
            await _db.SaveChangesAsync();
            await _notifService.SendAsync(a.UserId,
                "Votre abonnement a été activé.", "success",
                "/dashboard/client/subscriptions");
            return true;
        }

    }
}