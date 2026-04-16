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

        public OffreService(AppDbContext ctx) => _ctx = ctx;

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
                .AsQueryable();

            // ✅ UserRole.Responsable au lieu de "Responsable"
            if (role == UserRole.Responsable)
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
                    NbAbonnes = _ctx.Abonnements
                        .Count(a => a.OffreId == o.Id && a.IsActive),
                    IsActive = o.IsActive,
                    CreatedAt = o.CreatedAt,
                    CreePar = o.CreePar,
                    ModifieLe = o.ModifieLe,
                    ModifiePar = o.ModifiePar,
                    Services = o.ServiceOffres
                        .Select(so => so.Service.IntituleService).ToList()
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
                    Services = o.ServiceOffres
                    .Select(so => so.Service.IntituleService).ToList(),
                    MoyenneNote = _ctx.Feedbacks
                    .Where(f => f.Abonnement.OffreId == o.Id)
                    .Select(f => (double?)f.Note)
                    .Average()
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

            if (dto.ParMois.HasValue)
                offre.ParMois = dto.ParMois.Value;

            if (dto.ParAnnee.HasValue)
                offre.ParAnnee = dto.ParAnnee.Value;

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

    }
}