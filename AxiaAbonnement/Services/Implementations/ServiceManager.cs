using AxiaAbonnement.Data;
using AxiaAbonnement.Models.DTOs.Services;
using AxiaAbonnement.Models.Entities;
using AxiaAbonnement.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace AxiaAbonnement.Services.Implementations
{
    public class ServiceManager : IServiceManager
    {
        private readonly AppDbContext _ctx;

        public ServiceManager(AppDbContext ctx)
        {
            _ctx = ctx;
        }
        private static ServiceResponsableDto MapToDto(Service s) => new()
        {
            Id = s.Id,
            IntituleService = s.IntituleService,
            Description = s.Description,
            ParMois = s.ParMois,
            ParAnnee = s.ParAnnee,
            NbOffres = s.ServiceOffres.Count,
            NbAbonnes = 0,
            IsActive = s.IsActive,
            CreatedAt = s.CreatedAt,
            CreePar = s.CreePar,
            CbModification = s.CbModification,
            CbModificateur = s.CbModificateur
            
        };

        public async Task<List<ServiceResponsableDto>> GetAllServicesAsync()
        {
            return await _ctx.Services
                .Include(s => s.ServiceOffres)
                .Select(s => new ServiceResponsableDto
                {
                    Id = s.Id,
                    IntituleService = s.IntituleService,
                    Description = s.Description,
                    ParMois = s.ParMois,
                    ParAnnee = s.ParAnnee,
                    NbAbonnes = _ctx.Abonnements.Count(a => a.ServiceId == s.Id && a.IsActive),
                    NbOffres = s.ServiceOffres.Count,
                    IsActive = s.IsActive,
                    CreatedAt = s.CreatedAt,
                    CreePar = s.CreePar,
                    CbModification = s.CbModification,
                    CbModificateur = s.CbModificateur
                })
                .ToListAsync();
        }


        public async Task<ServiceResponsableDto?> GetServiceByIdAsync(Guid id)
        {
            var s = await _ctx.Services.FindAsync(id);
            return s == null ? null : MapToDto(s);
        }
        public async Task<ServiceResponsableDto> CreateServiceAsync(Guid responsableId, CreateServiceDto dto)
        {
            var responsable = await _ctx.Users.FindAsync(responsableId);
            var service = new Service
            {
                Id = Guid.NewGuid(),
                IntituleService = dto.IntituleService,
                Description = dto.Description,
                ParMois = dto.ParMois,
                ParAnnee = dto.ParAnnee,
                CreatedAt = DateTime.UtcNow,
                CreePar = responsable?.Username ?? "",
            };
            _ctx.Services.Add(service);
            await _ctx.SaveChangesAsync();
            return MapToDto(service);
        }

        public async Task<bool> UpdateServiceAsync(Guid id, Guid responsableId, UpdateServiceDto dto)
        {
            var service = await _ctx.Services.FindAsync(id);
            if (service == null) return false;
            
            var responsable = await _ctx.Users.FindAsync(responsableId);

            if (!string.IsNullOrWhiteSpace(dto.IntituleService))
                service.IntituleService = dto.IntituleService;
            if (!string.IsNullOrWhiteSpace(dto.Description))
                service.Description = dto.Description;
            if (dto.ParMois.HasValue)
                service.ParMois = dto.ParMois.Value;
            if (dto.ParAnnee.HasValue)
                service.ParAnnee = dto.ParAnnee.Value;

            service.CbModification = DateTime.UtcNow;
            service.CbModificateur = responsable?.Username ?? "";

            await _ctx.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteServiceAsync(Guid id, Guid responsableId)
        {
            var service = await _ctx.Services.FindAsync(id);
            if (service == null) return false;
            _ctx.Services.Remove(service);
            await _ctx.SaveChangesAsync();
            return true;
        }

        public async Task<bool?> ToggleServiceAsync(Guid id, Guid responsableId)
        {
            var service = await _ctx.Services.FindAsync(id);
            if (service == null) return false;
            service.IsActive = !service.IsActive;
            service.CbModification = DateTime.UtcNow;
            var responsable = await _ctx.Users.FindAsync(responsableId);
            service.CbModificateur = responsable?.Username ?? "";
            await _ctx.SaveChangesAsync();
            return service.IsActive;
        }

        public async Task<List<PublicServiceDto>> GetPublicServicesAsync()
        {
            return await _ctx.Services
                .Include(s => s.ServiceOffres)
                .Where(s => s.IsActive)
                .Select(s => new PublicServiceDto
                {
                    Id = s.Id,
                    IntituleService = s.IntituleService,
                    Description = s.Description,
                    ParMois = s.ParMois,
                    ParAnnee = s.ParAnnee,
                    NbOffres = s.ServiceOffres.Count
                })
                .ToListAsync();
        }
    }
}
