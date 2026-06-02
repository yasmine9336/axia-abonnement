using AxiaAbonnement.Data;
using AxiaAbonnement.Models.DTOs.Services;
using AxiaAbonnement.Models.Entities;
using AxiaAbonnement.Models.Enums;
using AxiaAbonnement.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace AxiaAbonnement.Services.Implementations
{
    public class ServiceManager : IServiceManager
    {
        private readonly AppDbContext _ctx;
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly string _mlUrl;
        private readonly string _mlKey;

        public ServiceManager(AppDbContext ctx, IHttpClientFactory httpClientFactory, IConfiguration config)
        {
            _ctx = ctx;
            _httpClientFactory = httpClientFactory;
            _mlUrl = config["ML:Url"] ?? "http://localhost:8000";
            _mlKey = config["ML:ApiKey"] ?? "";
        }

        private static ServiceResponsableDto MapToDto(Service s) => new()
        {
            Id = s.Id,
            IntituleService = s.IntituleService,
            Description = s.Description,
            ParMois = s.ParMois,
            ParAnnee = s.ParAnnee,
            NbOffres = s.ServiceOffres?.Count ?? 0,
            NbAbonnes = 0,
            IsActive = s.IsActive,
            CreatedAt = s.CreatedAt,
            CreePar = s.CreePar,
            ModifieLe = s.ModifieLe,
            ModifiePar = s.ModifiePar
        };

        public async Task<List<ServiceResponsableDto>> GetAllServicesAsync(
            Guid currentUserId, UserRole role)
        {
            var query = _ctx.Services
                .Include(s => s.ServiceOffres)
                .Include(s => s.Responsable)
                .AsQueryable();

            if (role == UserRole.Responsable)
                query = query.Where(s => s.ResponsableId == currentUserId);
            else if (role == UserRole.Client)
                query = query.Where(s => s.IsActive);

            return await query
                .Select(s => new ServiceResponsableDto
                {
                    Id = s.Id,
                    IntituleService = s.IntituleService,
                    Description = s.Description,
                    ParMois = s.ParMois,
                    ParAnnee = s.ParAnnee,
                    NbAbonnes = _ctx.Abonnements
                        .Count(a => a.ServiceId == s.Id && a.IsActive),
                    NbOffres = s.ServiceOffres.Count,
                    IsActive = s.IsActive,
                    CreatedAt = s.CreatedAt,
                    CreePar = s.CreePar,
                    ModifieLe = s.ModifieLe,
                    ModifiePar = s.ModifiePar,
                    SecteurActivite = s.Responsable != null ? s.Responsable.SecteurActivite : null,
                    NombreAvis = _ctx.Feedbacks.Count(f => f.Abonnement.ServiceId == s.Id),
                    MoyenneNote = _ctx.Feedbacks
                        .Where(f => f.Abonnement.ServiceId == s.Id)
                        .Select(f => (double?)f.Note)
                        .Average(),
                })
                .ToListAsync();
        }

        public async Task<ServiceResponsableDto?> GetServiceByIdAsync(Guid id)
        {
            var service = await _ctx.Services
                .Include(s => s.ServiceOffres)
                .FirstOrDefaultAsync(s => s.Id == id);

            return service == null ? null : MapToDto(service);
        }

        public async Task<ServiceResponsableDto> CreateServiceAsync(
            Guid responsableId, CreateServiceDto dto)
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
                ResponsableId = responsableId
            };

            _ctx.Services.Add(service);
            await _ctx.SaveChangesAsync();
            NotifierRecommendAsync();
            return MapToDto(service);
        }

        public async Task<bool> UpdateServiceAsync(
            Guid id, Guid responsableId, UpdateServiceDto dto)
        {
            var service = await _ctx.Services.FindAsync(id);
            if (service == null) return false;

            var user = await _ctx.Users.FindAsync(responsableId);
            if (user == null) return false;

            if (user.Role == UserRole.Responsable && service.ResponsableId != responsableId)
                return false;

            if (!string.IsNullOrWhiteSpace(dto.IntituleService))
                service.IntituleService = dto.IntituleService;

            if (!string.IsNullOrWhiteSpace(dto.Description))
                service.Description = dto.Description;

            if (dto.ParMois.HasValue)
                service.ParMois = dto.ParMois.Value;

            if (dto.ParAnnee.HasValue)
                service.ParAnnee = dto.ParAnnee.Value;

            service.ModifieLe = DateTime.UtcNow;
            service.ModifiePar = user.Username;

            await _ctx.SaveChangesAsync();
            NotifierRecommendAsync();
            return true;
        }

        public async Task<bool> DeleteServiceAsync(Guid id, Guid responsableId)
        {
            var service = await _ctx.Services.FindAsync(id);
            if (service == null) return false;

            var user = await _ctx.Users.FindAsync(responsableId);
            if (user == null) return false;

            if (user.Role == UserRole.Responsable && service.ResponsableId != responsableId)
                return false;

            _ctx.Services.Remove(service);
            await _ctx.SaveChangesAsync();
            return true;
        }

        public async Task<bool?> ToggleServiceAsync(Guid id, Guid responsableId)
        {
            var service = await _ctx.Services.FindAsync(id);
            if (service == null) return null;

            var user = await _ctx.Users.FindAsync(responsableId);
            if (user == null) return null;

            if (user.Role == UserRole.Responsable && service.ResponsableId != responsableId)
                return null;

            service.IsActive = !service.IsActive;
            service.ModifieLe = DateTime.UtcNow;
            service.ModifiePar = user.Username;

            await _ctx.SaveChangesAsync();
            return service.IsActive;
        }

        public async Task<List<PublicServiceDto>> GetPublicServicesAsync()
        {
            var services = await _ctx.Services
                .Include(s => s.ServiceOffres)
                .Where(s => s.IsActive)
                .Select(s => new PublicServiceDto
                {
                    Id = s.Id,
                    IntituleService = s.IntituleService,
                    Description = s.Description,
                    ParMois = s.ParMois,
                    ParAnnee = s.ParAnnee,
                    NbOffres = s.ServiceOffres.Count,
                    NombreAvis = _ctx.Feedbacks.Count(f => f.Abonnement.ServiceId == s.Id),
                    MoyenneNote = _ctx.Feedbacks
                        .Where(f => f.Abonnement.ServiceId == s.Id)
                        .Select(f => (double?)f.Note)
                        .Average()
                })
                .ToListAsync();

            return services
                .OrderByDescending(s => s.MoyenneNote ?? 0)
                .Take(4)
                .ToList();
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
                catch { }
            });
        }
    }
}