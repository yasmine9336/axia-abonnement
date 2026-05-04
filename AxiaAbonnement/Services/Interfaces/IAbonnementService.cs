using AxiaAbonnement.Models.DTOs.Abonnements;

namespace AxiaAbonnement.Services.Interfaces
{
    public interface IAbonnementService
    {
        Task<List<AbonnementDto>> GetMyAbonnementsAsync(Guid userId);
        Task<StatsDto> GetStatsAsync();
        Task<List<AbonnementDto>> GetAllAbonnementsAsync(int page = 1, int pageSize = 20);
        Task<List<AbonnementDto>> GetAbonnementsByResponsableAsync(Guid responsableId, int page = 1, int pageSize = 20);
        Task<StatsDto> GetStatsByResponsableAsync(Guid responsableId);
        Task<List<AbonnementDto>> GetAbonnementsByClientAsync(Guid clientId);
        Task<List<AbonnementDto>> GetAbonnementsByClientForResponsableAsync(Guid clientId, Guid responsableId);

    }
}
