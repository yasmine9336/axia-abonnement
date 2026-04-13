using AxiaAbonnement.Data;
using AxiaAbonnement.Models.DTOs.Offres;
using AxiaAbonnement.Models.Entities;
using AxiaAbonnement.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace AxiaAbonnement.Services.Implementations
{
    public class OffreService : IOffreService
    {
        private readonly AppDbContext _ctx;

        public OffreService(AppDbContext ctx)
        {
            _ctx = ctx;
        }

        private static OffreDto MapToDto(Offre o) => new()
        {
            Id = o.Id,
            IntituleOffre = o.IntituleOffre,
            Description = o.Description,
            ParMois = o.ParMois,
            ParAnnee = o.ParAnnee,
            NbAbonnes = 0,
            IsActive = o.IsActive,
            CreatedAt = o.CreatedAt,
            CreePar = o.CreePar,
            CbModification = o.CbModification,
            CbModificateur = o.CbModificateur,
            Services = o.ServiceOffres.Select(so => so.Service.IntituleService).ToList()
        };

        // IMPORTANT: adapter aussi l'interface IOffreService
        public async Task<List<OffreDto>> GetAllOffresAsync(Guid currentUserId, string role)
        {
            var query = _ctx.Offres
                .Include(o => o.ServiceOffres)
                    .ThenInclude(so => so.Service)
                .AsQueryable();

            // Cloisonnement responsable: offres liées à ses services
            if (role == "Responsable")
            {
                query = query.Where(o =>
                    o.ServiceOffres.Any(so => so.Service.ResponsableId == currentUserId));
            }

            return await query
                .Select(o => new OffreDto
                {
                    Id = o.Id,
                    IntituleOffre = o.IntituleOffre,
                    Description = o.Description,
                    ParMois = o.ParMois,
                    ParAnnee = o.ParAnnee,
                    NbAbonnes = _ctx.Abonnements.Count(a => a.OffreId == o.Id && a.IsActive),
                    IsActive = o.IsActive,
                    CreatedAt = o.CreatedAt,
                    CreePar = o.CreePar,
                    CbModification = o.CbModification,
                    CbModificateur = o.CbModificateur,
                    Services = o.ServiceOffres.Select(so => so.Service.IntituleService).ToList()
                })
                .ToListAsync();
        }

        public async Task<List<PublicOffreDto>> GetPublicOffresAsync()
        {
            return await _ctx.Offres
                .Include(o => o.ServiceOffres)
                    .ThenInclude(so => so.Service)
                .Where(o => o.IsActive)
                .Select(o => new PublicOffreDto
                {
                    Id = o.Id,
                    IntituleOffre = o.IntituleOffre,
                    Description = o.Description,
                    ParMois = o.ParMois,
                    ParAnnee = o.ParAnnee,
                    Services = o.ServiceOffres.Select(so => so.Service.IntituleService).ToList()
                })
                .ToListAsync();
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
            var user = await _ctx.Users.FindAsync(responsableId);
            if (user == null) throw new Exception("Utilisateur introuvable.");

            if (user.Role == "Responsable")
            {
                var ownedCount = await _ctx.Services
                    .CountAsync(s => dto.ServiceIds.Contains(s.Id) && s.ResponsableId == responsableId);

                if (ownedCount != dto.ServiceIds.Count)
                    throw new UnauthorizedAccessException("Un ou plusieurs services ne vous appartiennent pas.");
            }

            var offre = new Offre
            {
                Id = Guid.NewGuid(),
                IntituleOffre = dto.IntituleOffre,
                Description = dto.Description,
                ParMois = dto.ParMois,
                ParAnnee = dto.ParAnnee,
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

            await _ctx.Entry(offre)
                .Collection(o => o.ServiceOffres)
                .Query()
                .Include(so => so.Service)
                .LoadAsync();

            return MapToDto(offre);
        }

        public async Task<bool> UpdateOffreAsync(Guid id, Guid responsableId, UpdateOffreDto dto)
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

            if (dto.ParMois.HasValue)
                offre.ParMois = dto.ParMois.Value;

            if (dto.ParAnnee.HasValue)
                offre.ParAnnee = dto.ParAnnee.Value;

            if (dto.ServiceIds != null)
            {
                if (user.Role == "Responsable")
                {
                    var ownedCount = await _ctx.Services
                        .CountAsync(s => dto.ServiceIds.Contains(s.Id) && s.ResponsableId == responsableId);

                    if (ownedCount != dto.ServiceIds.Count)
                        return false;
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

            offre.CbModification = DateTime.UtcNow;
            offre.CbModificateur = user.Username;

            await _ctx.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteOffreAsync(Guid id)
        {
            var offre = await _ctx.Offres.FindAsync(id);
            if (offre == null) return false;

            _ctx.Offres.Remove(offre);
            await _ctx.SaveChangesAsync();
            return true;
        }

        public async Task<bool?> ToggleOffreAsync(Guid id, Guid responsableId)
        {
            var offre = await _ctx.Offres.FindAsync(id);
            if (offre == null) return null;

            var responsable = await _ctx.Users.FindAsync(responsableId);

            offre.IsActive = !offre.IsActive;
            offre.CbModification = DateTime.UtcNow;
            offre.CbModificateur = responsable?.Username ?? "";

            await _ctx.SaveChangesAsync();
            return offre.IsActive;
        }
    }
}