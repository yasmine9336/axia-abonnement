using AxiaAbonnement.Models.DTOs.Abonnements;

namespace AxiaAbonnement.Services.Interfaces
{
    public interface IAbonnementService
    {
        Task<List<AbonnementDto>> GetMyAbonnementsAsync(Guid userId);
        Task<StatsDto> GetStatsAsync();
        Task<List<AbonnementDto>> GetAllAbonnementsAsync();
        Task<bool> DesactiverAsync(Guid abonnementId);
        Task<bool> ActiverAsync(Guid abonnementId);
    }
}
