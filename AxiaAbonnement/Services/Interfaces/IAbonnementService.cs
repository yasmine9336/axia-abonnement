using AxiaAbonnement.Models.DTOs.Abonnements;

namespace AxiaAbonnement.Services.Interfaces
{
    public interface IAbonnementService
    {
        Task<List<AbonnementDto>> GetMyAbonnementsAsync(Guid userId);
        Task<StatsDto> GetStatsAsync();
        Task<List<AbonnementDto>> GetAllAbonnementsAsync();
        Task<bool> DesactiverAsync(Guid abonnementId, Guid responsableId);
        Task<bool> ActiverAsync(Guid abonnementId, Guid responsableId);
        Task<List<AbonnementDto>> GetAbonnementsByResponsableAsync(Guid responsableId);
        Task<StatsDto> GetStatsByResponsableAsync(Guid responsableId);

    }
}
