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

        // ─── Helper ───────────────────────────────────────────────────────────
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

        // ─── Client ───────────────────────────────────────────────────────────
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
                Statut = StatutToString(a.Statut, a.DateFin)
            }).ToList();
        }

        // ─── Admin — liste complète ───────────────────────────────────────────
        public async Task<List<AbonnementDto>> GetAllAbonnementsAsync()
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
                ResponsableUsername = a.Service?.Responsable?.Username
                    ?? a.Offre?.ServiceOffres.FirstOrDefault()?.Service?.Responsable?.Username
            }).ToList();
        }

        // ─── Admin — stats globales ───────────────────────────────────────────
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
            var demandesEnAttente = await _db.DemandesRenouvellement.CountAsync(d => d.Statut == "en_attente");

            // Abonnements récents
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
                ClientEmail = a.User.Email
            }).ToList();

            // Revenus 6 derniers mois
            var revenuParMois = new List<RevenuMoisDto>();
            for (int i = 5; i >= 0; i--)
            {
                var mois = now.AddMonths(-i);
                var debut = new DateTime(mois.Year, mois.Month, 1, 0, 0, 0, DateTimeKind.Utc);
                var fin = debut.AddMonths(1);
                var revenu = await _db.Paiements
                    .Where(p => p.Statut == "completed"
                             && p.PaymentType == "subscription"
                             && p.CreatedAt >= debut
                             && p.CreatedAt < fin)
                    .SumAsync(p => (decimal?)p.Montant) ?? 0;
                revenuParMois.Add(new RevenuMoisDto { Mois = mois.ToString("MMM", culture), Revenu = revenu });
            }

            var tousLesAbos = await _db.Abonnements
                .Select(a => new { a.Statut, a.DateFin })
                .ToListAsync();
            var abonnementsActifs = tousLesAbos.Count(a => a.DateFin >= now && a.Statut == StatutAbonnement.Actif);
            var abonnementsExpires = tousLesAbos.Count(a => a.DateFin < now);
            var abonnementsEnAttente = tousLesAbos.Count(a => a.DateFin >= now && a.Statut == StatutAbonnement.EnAttente);

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

        // ─── Responsable — liste filtrée ─────────────────────────────────────
        public async Task<List<AbonnementDto>> GetAbonnementsByResponsableAsync(Guid responsableId)
        {
            var mesServiceIds = await _db.Services
                .Where(s => s.ResponsableId == responsableId)
                .Select(s => s.Id)
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
                    (a.OffreId.HasValue && a.Offre!.ServiceOffres.Any(so => mesServiceIds.Contains(so.ServiceId)))
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
                ResponsableUsername = a.Service?.Responsable?.Username
                    ?? a.Offre?.ServiceOffres.FirstOrDefault()?.Service?.Responsable?.Username,
            }).ToList();
        }

        // ─── Responsable — stats filtrées ────────────────────────────────────
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

            var mesAbonnementIds = mesAbonnements.Select(a => a.Id).ToList();

            // Revenus 6 derniers mois
            var culture = new System.Globalization.CultureInfo("fr-FR");
            var revenuParMois = new List<RevenuMoisDto>();
            for (int i = 5; i >= 0; i--)
            {
                var mois = now.AddMonths(-i);
                var debut = new DateTime(mois.Year, mois.Month, 1, 0, 0, 0, DateTimeKind.Utc);
                var fin = debut.AddMonths(1);
                var revenu = await _db.Paiements
                    .Where(p => p.Statut == "completed"
                             && p.PaymentType == "subscription"
                             && p.AbonnementId.HasValue
                             && mesAbonnementIds.Contains(p.AbonnementId.Value)
                             && p.CreatedAt >= debut
                             && p.CreatedAt < fin)
                    .SumAsync(p => (decimal?)p.Montant) ?? 0;
                revenuParMois.Add(new RevenuMoisDto { Mois = mois.ToString("MMM", culture), Revenu = revenu });
            }

            // Abonnements récents
            var rawRecents = await _db.Abonnements
                .Include(a => a.Offre)
                .Include(a => a.Service)
                .Include(a => a.User)
                .Where(a =>
                    (a.ServiceId.HasValue && mesServiceIds.Contains(a.ServiceId.Value)) ||
                    (a.OffreId.HasValue && a.Offre!.ServiceOffres.Any(so => mesServiceIds.Contains(so.ServiceId)))
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
                ClientEmail = a.User.Email
            }).ToList();

            return new StatsDto
            {
                TotalAbonnes = mesAbonnements.Count(a => a.Statut == StatutAbonnement.Actif && a.DateFin >= now),
                RevenuMensuel = mesAbonnements.Where(a => a.Statut == StatutAbonnement.Actif && a.Type == "mensuel" && a.DateFin >= now).Sum(a => a.Montant),
                ServicesActifs = await _db.Services.CountAsync(s => s.ResponsableId == responsableId && s.IsActive),
                DemandesEnAttente = await _db.DemandesRenouvellement
                    .CountAsync(d => d.Statut == "en_attente" && mesAbonnementIds.Contains(d.AbonnementId)),
                AbonnementsRecents = abonnementsRecents,
                RevenuParMois = revenuParMois,
                AbonnementsActifs = mesAbonnements.Count(a => a.DateFin >= now && a.Statut == StatutAbonnement.Actif),
                AbonnementsExpires = mesAbonnements.Count(a => a.DateFin < now),
                AbonnementsEnAttente = mesAbonnements.Count(a => a.DateFin >= now && a.Statut == StatutAbonnement.EnAttente),
            };
        }
    }
}