using AxiaAbonnement.Models.DTOs.Services;

namespace AxiaAbonnement.Services.Interfaces
{
    public interface IServiceManager
    {
        // role + currentUserId pour filtrer si Responsable
        Task<List<ServiceResponsableDto>> GetAllServicesAsync(Guid currentUserId, string role);

        // optionnel: contrôle ownership dans l'implémentation
        Task<ServiceResponsableDto?> GetServiceByIdAsync(Guid id);

        Task<ServiceResponsableDto> CreateServiceAsync(Guid responsableId, CreateServiceDto dto);
        Task<bool> UpdateServiceAsync(Guid id, Guid responsableId, UpdateServiceDto dto);
        Task<bool> DeleteServiceAsync(Guid id, Guid responsableId);
        Task<bool?> ToggleServiceAsync(Guid id, Guid responsableId);

        // public (clients): pas de cloisonnement
        Task<List<PublicServiceDto>> GetPublicServicesAsync();
    }
}