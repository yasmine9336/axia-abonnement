using AxiaAbonnement.Data;
using AxiaAbonnement.Models.DTOs.Offres;
using AxiaAbonnement.Models.Entities;
using AxiaAbonnement.Models.Enums;
using AxiaAbonnement.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace AxiaAbonnement.Services.Implementations
{
    public class OffreService : IOffreService
    {
        private readonly AppDbContext _ctx;
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly string _mlUrl;
        private readonly string _mlKey;

        public OffreService(AppDbContext ctx, IHttpClientFactory httpClientFactory, IConfiguration config)
        {
            _ctx = ctx;
            _httpClientFactory = httpClientFactory;
            _mlUrl = config["ML:Url"] ?? "http://localhost:8000";
            _mlKey = config["ML:ApiKey"] ?? "axia-ml-secret-2025";
        }

        private static OffreDto MapToDto(Offre o) => new()
        {
            Id = o.Id,
            IntituleOffre = o.IntituleOffre,
            Description = o.Description,
            DureeEnMois = o.DureeEnMois,
            Prix = o.Prix,
            NbAbonnes = 0,
            IsActive = o.IsActive,
            CreatedAt = o.CreatedAt,
            CreePar = o.CreePar,
            // ✅ Nommage corrigé
            ModifieLe = o.ModifieLe,
            ModifiePar = o.ModifiePar,
            Services = o.ServiceOffres.Select(so => so.Service.IntituleService).ToList()
        };

        public async Task<List<OffreDto>> GetAllOffresAsync(Guid currentUserId, UserRole role)
        {
            var query = _ctx.Offres
                .Include(o => o.ServiceOffres)
                    .ThenInclude(so => so.Service)
                    .ThenInclude(s => s.Responsable)
                .AsQueryable();

            if (role == UserRole.Responsable)
            {
                query = query.Where(o =>
                    o.ServiceOffres.Any(so => so.Service.ResponsableId == currentUserId));
            }
            else if (role == UserRole.Client)
            {
                query = query.Where(o => o.IsActive);
            }

            return await query
                .Select(o => new OffreDto
                {
                    Id = o.Id,
                    IntituleOffre = o.IntituleOffre,
                    Description = o.Description,
                    DureeEnMois = o.DureeEnMois,
                    Prix = o.Prix,
                    NbAbonnes = _ctx.Abonnements
                        .Count(a => a.OffreId == o.Id && a.IsActive),
                    IsActive = o.IsActive,
                    CreatedAt = o.CreatedAt,
                    CreePar = o.CreePar,
                    ModifieLe = o.ModifieLe,
                    ModifiePar = o.ModifiePar,
                    SecteurActivite = o.ServiceOffres
                    .Select(so => so.Service.Responsable != null ? so.Service.Responsable.SecteurActivite : null)
                    .FirstOrDefault(),
                    Services = o.ServiceOffres
                        .Select(so => so.Service.IntituleService).ToList(),
                    NombreAvis = _ctx.Feedbacks.Count(f => f.Abonnement.OffreId == o.Id),
                    MoyenneNote = _ctx.Feedbacks
                    .Where(f => f.Abonnement.OffreId == o.Id)
                    .Select(f => (double?)f.Note)
                    .Average(),
                })
                .ToListAsync();
        }

        public async Task<List<PublicOffreDto>> GetPublicOffresAsync()
        {
            var offres = await _ctx.Offres
                .Include(o => o.ServiceOffres)
                    .ThenInclude(so => so.Service)
                .Where(o => o.IsActive)
                .Select(o => new PublicOffreDto
                {
                    Id = o.Id,
                    IntituleOffre = o.IntituleOffre,
                    Description = o.Description,
                    DureeEnMois = o.DureeEnMois,
                    Prix = o.Prix,
                    Services = o.ServiceOffres
                        .Select(so => so.Service.IntituleService).ToList(),
                    NombreAvis = _ctx.Feedbacks.Count(f => f.Abonnement.OffreId == o.Id),
                    MoyenneNote = _ctx.Feedbacks
                        .Where(f => f.Abonnement.OffreId == o.Id)
                        .Select(f => (double?)f.Note)
                        .Average()
                })
                .ToListAsync();

            return offres
                .OrderByDescending(o => o.MoyenneNote ?? 0)
                .Take(3)
                .ToList();
        }

        public async Task<OffreDto?> GetOffreByIdAsync(Guid id)
        {
            var offre = await _ctx.Offres
                .Include(o => o.ServiceOffres)
                    .ThenInclude(so => so.Service)
                .FirstOrDefaultAsync(o => o.Id == id);

            return offre is null ? null : MapToDto(offre);
        }

        public async Task<OffreDto> CreateOffreAsync(Guid responsableId, CreateOffreDto dto)
        {
            if (dto.ServiceIds == null || dto.ServiceIds.Count == 0)
                throw new ArgumentException("Une offre doit contenir au moins un service.");

            var user = await _ctx.Users.FindAsync(responsableId);
            if (user == null) throw new Exception("Utilisateur introuvable.");

            // ✅ UserRole.Responsable
            if (user.Role == UserRole.Responsable)
            {
                var ownedCount = await _ctx.Services
                    .CountAsync(s => dto.ServiceIds.Contains(s.Id)
                                  && s.ResponsableId == responsableId);

                if (ownedCount != dto.ServiceIds.Count)
                    throw new UnauthorizedAccessException(
                        "Un ou plusieurs services ne vous appartiennent pas.");
            }

            var offre = new Offre
            {
                Id = Guid.NewGuid(),
                IntituleOffre = dto.IntituleOffre,
                Description = dto.Description,
                DureeEnMois = dto.DureeEnMois,
                Prix = dto.Prix,
                CreatedAt = DateTime.UtcNow,
                CreePar = user.Username
            };

            foreach (var serviceId in dto.ServiceIds)
            {
                offre.ServiceOffres.Add(new ServiceOffre
                {
                    OffreId = offre.Id,
                    ServiceId = serviceId
                });
            }

            _ctx.Offres.Add(offre);
            await _ctx.SaveChangesAsync();

            NotifierRecommendAsync();

            await _ctx.Entry(offre)
                .Collection(o => o.ServiceOffres)
                .Query()
                .Include(so => so.Service)
                .LoadAsync();

            return MapToDto(offre);
        }

        public async Task<bool> UpdateOffreAsync(
            Guid id, Guid responsableId, UpdateOffreDto dto)
        {
            var offre = await _ctx.Offres
                .Include(o => o.ServiceOffres)
                .FirstOrDefaultAsync(o => o.Id == id);
            if (offre is null) return false;

            var user = await _ctx.Users.FindAsync(responsableId);
            if (user == null) return false;

            if (!string.IsNullOrWhiteSpace(dto.IntituleOffre))
                offre.IntituleOffre = dto.IntituleOffre;

            if (!string.IsNullOrWhiteSpace(dto.Description))
                offre.Description = dto.Description;

            if (dto.DureeEnMois.HasValue)
                offre.DureeEnMois = dto.DureeEnMois.Value;

            if (dto.Prix.HasValue)
                offre.Prix = dto.Prix.Value;

            if (dto.ServiceIds != null)
            {
                // ✅ UserRole.Responsable
                if (user.Role == UserRole.Responsable)
                {
                    var ownedCount = await _ctx.Services
                        .CountAsync(s => dto.ServiceIds.Contains(s.Id)
                                      && s.ResponsableId == responsableId);

                    if (ownedCount != dto.ServiceIds.Count) return false;
                }

                offre.ServiceOffres.Clear();

                foreach (var serviceId in dto.ServiceIds)
                {
                    offre.ServiceOffres.Add(new ServiceOffre
                    {
                        ServiceId = serviceId,
                        OffreId = offre.Id
                    });
                }
            }

            // ✅ Nommage corrigé
            offre.ModifieLe = DateTime.UtcNow;
            offre.ModifiePar = user.Username;

            await _ctx.SaveChangesAsync();

            NotifierRecommendAsync();

            return true;
        }

        public async Task<bool> DeleteOffreAsync(Guid id, Guid responsableId)
        {
            var offre = await _ctx.Offres
                .Include(o => o.ServiceOffres)
                    .ThenInclude(so => so.Service)
                .FirstOrDefaultAsync(o => o.Id == id);

            if (offre == null) return false;

            // Vérifier que au moins un des services de l'offre appartient au responsable
            var owns = offre.ServiceOffres.Any(so => so.Service.ResponsableId == responsableId);
            if (!owns) return false;

            _ctx.Offres.Remove(offre);
            await _ctx.SaveChangesAsync();
            return true;
        }


        public async Task<bool?> ToggleOffreAsync(Guid id, Guid responsableId)
        {
            var offre = await _ctx.Offres
                .Include(o => o.ServiceOffres)
                    .ThenInclude(so => so.Service)
                .FirstOrDefaultAsync(o => o.Id == id);

            if (offre == null) return null;

            // Vérifier que le responsable possède l'offre
            var owns = offre.ServiceOffres.Any(so => so.Service?.ResponsableId == responsableId);
            if (!owns) return null;

            var responsable = await _ctx.Users.FindAsync(responsableId);

            offre.IsActive = !offre.IsActive;
            offre.ModifieLe = DateTime.UtcNow;
            offre.ModifiePar = responsable?.Username ?? "";

            await _ctx.SaveChangesAsync();
            return offre.IsActive;
        }

        private void NotifierRecommendAsync()
        {
            _ = Task.Run(async () =>
            {
                try
                {
                    var client = _httpClientFactory.CreateClient();
                    var request = new HttpRequestMessage(
                        HttpMethod.Post, $"{_mlUrl}/train-recommend");
                    request.Headers.Add("x-api-key", _mlKey);
                    await client.SendAsync(request);
                }
                catch
                {
                    // Silencieux — le refit ML ne bloque jamais une opération C#
                }
            });
        }

    }
}