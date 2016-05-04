using AxiaAbonnement.Data;
using AxiaAbonnement.Models.DTOs.Abonnements;
using AxiaAbonnement.Models.Enums;
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

        private static string StatutToString(StatutAbonnement statut, DateTime dateFin)
        {
            if (dateFin < DateTime.UtcNow) return "expiré";

            return statut switch
            {
                StatutAbonnement.Actif => "actif",
                StatutAbonnement.EnAttente => "en_attente",
                StatutAbonnement.Expiré => "expiré",
                _ => "en_attente"
            };
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
                Statut = StatutToString(a.Statut, a.DateFin),
                PeutRenouveler = a.Service?.IsActive ?? a.Offre?.IsActive ?? false
            }).ToList();
        }

        public async Task<List<AbonnementDto>> GetAllAbonnementsAsync(int page = 1, int pageSize = 20)
        {
            var list = await _db.Abonnements
                .Include(a => a.Offre)
                    .ThenInclude(o => o!.ServiceOffres)
                        .ThenInclude(so => so.Service)
                            .ThenInclude(s => s.Responsable)
                .Include(a => a.Service)
                    .ThenInclude(s => s!.Responsable)
                .Include(a => a.User)
                .OrderByDescending(a => a.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return list.Select(a => new AbonnementDto
            {
                Id = a.Id,
                IntituleOffre = a.Offre?.IntituleOffre ?? a.Service?.IntituleService ?? "",
                Description = a.Offre?.Description ?? a.Service?.Description ?? "",
                Type = a.Type,
                Montant = a.Montant,
                DateDebut = a.DateDebut,
                DateFin = a.DateFin,
                IsActive = a.IsActive,
                Statut = StatutToString(a.Statut, a.DateFin),
                ClientUsername = a.User.Username,
                ClientEmail = a.User.Email,
                ClientId = a.UserId,
                ResponsableUsername = a.Service?.Responsable?.Username
                    ?? a.Offre?.ServiceOffres.FirstOrDefault()?.Service?.Responsable?.Username
            }).ToList();
        }

        public async Task<StatsDto> GetStatsAsync()
        {
            var now = DateTime.UtcNow;
            var culture = new System.Globalization.CultureInfo("fr-FR");

            var totalAbonnes = await _db.Abonnements
                .Where(a => a.Statut == StatutAbonnement.Actif && a.DateFin >= now)
                .Select(a => a.UserId)
                .Distinct()
                .CountAsync();

            var revenuMensuel = await _db.Abonnements
                .Where(a => a.Statut == StatutAbonnement.Actif && a.Type == "mensuel" && a.DateFin >= now)
                .SumAsync(a => (decimal?)a.Montant) ?? 0;

            var servicesActifs = await _db.Services.CountAsync(s => s.IsActive);
            var demandesEnAttente = await _db.DemandesRenouvellement
                .CountAsync(d => d.Statut == StatutDemande.EnAttente);

            var rawRecents = await _db.Abonnements
                .Include(a => a.Offre)
                .Include(a => a.Service)
                .Include(a => a.User)
                .OrderByDescending(a => a.CreatedAt)
                .Take(5)
                .ToListAsync();

            var abonnementsRecents = rawRecents.Select(a => new AbonnementDto
            {
                Id = a.Id,
                IntituleOffre = a.Offre?.IntituleOffre ?? a.Service?.IntituleService ?? "",
                Type = a.Type,
                Montant = a.Montant,
                DateDebut = a.DateDebut,
                DateFin = a.DateFin,
                IsActive = a.IsActive,
                Statut = StatutToString(a.Statut, a.DateFin),
                ClientUsername = a.User.Username,
                ClientEmail = a.User.Email,
                ClientId = a.UserId
            }).ToList();

            var sixMoisDebut = new DateTime(now.Year, now.Month, 1, 0, 0, 0, DateTimeKind.Utc).AddMonths(-5);
            var paiementsParMois = await _db.Paiements
                .Where(p => p.Statut == "completed"
                         && p.PaymentType == "subscription"
                         && p.CreatedAt >= sixMoisDebut)
                .GroupBy(p => new { p.CreatedAt.Year, p.CreatedAt.Month })
                .Select(g => new { g.Key.Year, g.Key.Month, Total = g.Sum(p => (decimal?)p.Montant) ?? 0 })
                .ToListAsync();

            var revenuParMois = new List<RevenuMoisDto>();
            for (int i = 5; i >= 0; i--)
            {
                var mois = now.AddMonths(-i);
                var revenu = paiementsParMois
                    .FirstOrDefault(p => p.Year == mois.Year && p.Month == mois.Month)?.Total ?? 0;
                revenuParMois.Add(new RevenuMoisDto { Mois = mois.ToString("MMM", culture), Revenu = revenu });
            }

            var abonnementsActifs = await _db.Abonnements.CountAsync(a => a.DateFin >= now && a.Statut == StatutAbonnement.Actif);
            var abonnementsExpires = await _db.Abonnements.CountAsync(a => a.DateFin < now);
            var abonnementsEnAttente = await _db.Abonnements.CountAsync(a => a.DateFin >= now && a.Statut == StatutAbonnement.EnAttente);

            return new StatsDto
            {
                TotalAbonnes = totalAbonnes,
                RevenuMensuel = revenuMensuel,
                ServicesActifs = servicesActifs,
                DemandesEnAttente = demandesEnAttente,
                AbonnementsRecents = abonnementsRecents,
                RevenuParMois = revenuParMois,
                AbonnementsActifs = abonnementsActifs,
                AbonnementsExpires = abonnementsExpires,
                AbonnementsEnAttente = abonnementsEnAttente,
            };
        }

        public async Task<List<AbonnementDto>> GetAbonnementsByResponsableAsync(Guid responsableId, int page = 1, int pageSize = 20)
        {
            var mesServiceIds = await _db.Services
                .Where(s => s.ResponsableId == responsableId)
                .Select(s => s.Id)
                .ToListAsync();

            var mesOffresIds = await _db.ServiceOffres
                .Where(so => mesServiceIds.Contains(so.ServiceId))
                .Select(so => so.OffreId)
                .Distinct()
                .ToListAsync();

            var list = await _db.Abonnements
                .Include(a => a.Offre)
                    .ThenInclude(o => o!.ServiceOffres)
                        .ThenInclude(so => so.Service)
                            .ThenInclude(s => s.Responsable)
                .Include(a => a.Service)
                    .ThenInclude(s => s!.Responsable)
                .Include(a => a.User)
                .Where(a =>
                    (a.ServiceId.HasValue && mesServiceIds.Contains(a.ServiceId.Value)) ||
                    (a.OffreId.HasValue && mesOffresIds.Contains(a.OffreId.Value))
                )
                .OrderByDescending(a => a.CreatedAt)
                .ToListAsync();

            return list.Select(a => new AbonnementDto
            {
                Id = a.Id,
                IntituleOffre = a.Offre?.IntituleOffre ?? a.Service?.IntituleService ?? "",
                Description = a.Offre?.Description ?? a.Service?.Description ?? "",
                Type = a.Type,
                Montant = a.Montant,
                DateDebut = a.DateDebut,
                DateFin = a.DateFin,
                IsActive = a.IsActive,
                Statut = StatutToString(a.Statut, a.DateFin),
                ClientUsername = a.User.Username,
                ClientEmail = a.User.Email,
                ClientId = a.UserId,
                ResponsableUsername = a.Service?.Responsable?.Username
                    ?? a.Offre?.ServiceOffres.FirstOrDefault()?.Service?.Responsable?.Username,
            }).ToList();
        }

        public async Task<StatsDto> GetStatsByResponsableAsync(Guid responsableId)
        {
            var now = DateTime.UtcNow;

            var mesServiceIds = await _db.Services
                .Where(s => s.ResponsableId == responsableId)
                .Select(s => s.Id)
                .ToListAsync();

            var mesOffresIds = await _db.ServiceOffres
                .Where(so => mesServiceIds.Contains(so.ServiceId))
                .Select(so => so.OffreId)
                .Distinct()
                .ToListAsync();

            var baseAbos = _db.Abonnements.Where(a =>
                (a.ServiceId.HasValue && mesServiceIds.Contains(a.ServiceId.Value)) ||
                (a.OffreId.HasValue && mesOffresIds.Contains(a.OffreId.Value))
            );

            var culture = new System.Globalization.CultureInfo("fr-FR");
            var sixMoisDebut = new DateTime(now.Year, now.Month, 1, 0, 0, 0, DateTimeKind.Utc).AddMonths(-5);
            var paiementsParMois = await _db.Paiements
                .Where(p => p.Statut == "completed"
                         && p.PaymentType == "subscription"
                         && p.AbonnementId.HasValue
                         && baseAbos.Any(a => a.Id == p.AbonnementId!.Value)
                         && p.CreatedAt >= sixMoisDebut)
                .GroupBy(p => new { p.CreatedAt.Year, p.CreatedAt.Month })
                .Select(g => new { g.Key.Year, g.Key.Month, Total = g.Sum(p => (decimal?)p.Montant) ?? 0 })
                .ToListAsync();

            var revenuParMois = new List<RevenuMoisDto>();
            for (int i = 5; i >= 0; i--)
            {
                var mois = now.AddMonths(-i);
                var revenu = paiementsParMois
                    .FirstOrDefault(p => p.Year == mois.Year && p.Month == mois.Month)?.Total ?? 0;
                revenuParMois.Add(new RevenuMoisDto { Mois = mois.ToString("MMM", culture), Revenu = revenu });
            }

            var rawRecents = await _db.Abonnements
                .Include(a => a.Offre)
                .Include(a => a.Service)
                .Include(a => a.User)
                .Where(a =>
                    (a.ServiceId.HasValue && mesServiceIds.Contains(a.ServiceId.Value)) ||
                    (a.OffreId.HasValue && mesOffresIds.Contains(a.OffreId.Value))
                )
                .OrderByDescending(a => a.CreatedAt)
                .Take(5)
                .ToListAsync();

            var abonnementsRecents = rawRecents.Select(a => new AbonnementDto
            {
                Id = a.Id,
                IntituleOffre = a.Offre?.IntituleOffre ?? a.Service?.IntituleService ?? "",
                Type = a.Type,
                Montant = a.Montant,
                DateDebut = a.DateDebut,
                DateFin = a.DateFin,
                IsActive = a.IsActive,
                Statut = StatutToString(a.Statut, a.DateFin),
                ClientUsername = a.User.Username,
                ClientEmail = a.User.Email,
                ClientId = a.UserId
            }).ToList();

            return new StatsDto
            {
                TotalAbonnes = await baseAbos
                    .Where(a => a.Statut == StatutAbonnement.Actif && a.DateFin >= now)
                    .Select(a => a.UserId).Distinct().CountAsync(),
                RevenuMensuel = await baseAbos
                    .Where(a => a.Statut == StatutAbonnement.Actif && a.Type == "mensuel" && a.DateFin >= now)
                    .SumAsync(a => (decimal?)a.Montant) ?? 0,
                ServicesActifs = await _db.Services.CountAsync(s => s.ResponsableId == responsableId && s.IsActive),
                DemandesEnAttente = await _db.DemandesRenouvellement
                    .CountAsync(d => d.Statut == StatutDemande.EnAttente && baseAbos.Any(a => a.Id == d.AbonnementId)),
                AbonnementsRecents = abonnementsRecents,
                RevenuParMois = revenuParMois,
                AbonnementsActifs = await baseAbos.CountAsync(a => a.DateFin >= now && a.Statut == StatutAbonnement.Actif),
                AbonnementsExpires = await baseAbos.CountAsync(a => a.DateFin < now),
                AbonnementsEnAttente = await baseAbos.CountAsync(a => a.DateFin >= now && a.Statut == StatutAbonnement.EnAttente),
            };
        }

        public async Task<List<AbonnementDto>> GetAbonnementsByClientAsync(Guid clientId)
        {
            var list = await _db.Abonnements
                .Include(a => a.Offre)
                .Include(a => a.Service)
                .Where(a => a.UserId == clientId)
                .OrderByDescending(a => a.CreatedAt)
                .ToListAsync();

            return list.Select(a => new AbonnementDto
            {
                Id = a.Id,
                IntituleOffre = a.Offre?.IntituleOffre ?? a.Service?.IntituleService ?? "",
                Description = a.Offre?.Description ?? a.Service?.Description ?? "",
                Type = a.Type,
                Montant = a.Montant,
                DateDebut = a.DateDebut,
                DateFin = a.DateFin,
                IsActive = a.IsActive,
                Statut = StatutToString(a.Statut, a.DateFin),
            }).ToList();
        }

        public async Task<List<AbonnementDto>> GetAbonnementsByClientForResponsableAsync(Guid clientId, Guid responsableId)
        {
            var mesServiceIds = await _db.Services
                .Where(s => s.ResponsableId == responsableId)
                .Select(s => s.Id)
                .ToListAsync();

            var mesOffresIds = await _db.ServiceOffres
                .Where(so => mesServiceIds.Contains(so.ServiceId))
                .Select(so => so.OffreId)
                .Distinct()
                .ToListAsync();

            var list = await _db.Abonnements
                .Include(a => a.Offre)
                .Include(a => a.Service)
                .Where(a => a.UserId == clientId && (
                    (a.ServiceId.HasValue && mesServiceIds.Contains(a.ServiceId.Value)) ||
                    (a.OffreId.HasValue && mesOffresIds.Contains(a.OffreId.Value))
                ))
                .OrderByDescending(a => a.CreatedAt)
                .ToListAsync();

            return list.Select(a => new AbonnementDto
            {
                Id = a.Id,
                IntituleOffre = a.Offre?.IntituleOffre ?? a.Service?.IntituleService ?? "",
                Description = a.Offre?.Description ?? a.Service?.Description ?? "",
                Type = a.Type,
                Montant = a.Montant,
                DateDebut = a.DateDebut,
                DateFin = a.DateFin,
                IsActive = a.IsActive,
                Statut = StatutToString(a.Statut, a.DateFin),
            }).ToList();
        }
    }
}