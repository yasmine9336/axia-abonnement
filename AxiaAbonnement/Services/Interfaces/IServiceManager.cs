using AxiaAbonnement.Models.DTOs.Services;
namespace AxiaAbonnement.Services.Interfaces
{
    public interface IServiceManager
    {
        Task<List<ServiceResponsableDto>> GetAllServicesAsync();
        Task<ServiceResponsableDto?> GetServiceByIdAsync(Guid id);
        Task<ServiceResponsableDto> CreateServiceAsync(Guid responsableId, CreateServiceDto dto);
        Task<bool> UpdateServiceAsync(Guid id, Guid responsableId, UpdateServiceDto dto);
        Task<bool> DeleteServiceAsync(Guid id, Guid responsableId);
        Task<bool?> ToggleServiceAsync(Guid id, Guid responsableId);
        Task<List<PublicServiceDto>> GetPublicServicesAsync();
    }
}
