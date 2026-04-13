using AxiaAbonnement.Models.DTOs.Auth;

namespace AxiaAbonnement.Services.Interfaces
{
    public interface IDemandeResponsableService
    {
        Task<List<DemandeResponsableDto>> GetDemandesAsync(string? statut);
        Task<bool> AccepterAsync(Guid userId);
        Task<bool> RefuserAsync(Guid userId, string? motif);
    }
}