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
            var culture = new System.Globalization.CultureInfo("fr-FR");

            var totalAbonnes = await _db.Abonnements
                .Where(a => a.IsActive && a.DateFin > now)
                .Select(a => a.UserId)
                .Distinct()
                .CountAsync();

            var revenuMensuel = await _db.Abonnements
                .Where(a => a.IsActive && a.DateFin > now && a.Type == "mensuel")
                .SumAsync(a => (decimal?)a.Montant) ?? 0;

            var servicesActifs = await _db.Services.CountAsync(s => s.IsActive);

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
                revenuParMois.Add(new RevenuMoisDto
                {
                    Mois = mois.ToString("MMM", culture),
                    Revenu = revenu
                });
            }

            // Répartition statuts
            var abonnementsActifs = await _db.Abonnements.CountAsync(a => a.IsActive && a.DateFin > now);
            var abonnementsExpires = await _db.Abonnements.CountAsync(a => a.DateFin <= now);
            var abonnementsDesactives = await _db.Abonnements.CountAsync(a => !a.IsActive && a.DateFin > now);

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
                AbonnementsDesactives = abonnementsDesactives
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
                AbonnementsRecents = abonnementsRecents,
                RevenuParMois = revenuParMois,
                AbonnementsActifs = mesAbonnements.Count(a => a.IsActive && a.DateFin > now),
                AbonnementsExpires = mesAbonnements.Count(a => a.DateFin <= now),
                AbonnementsDesactives = mesAbonnements.Count(a => !a.IsActive && a.DateFin > now)
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