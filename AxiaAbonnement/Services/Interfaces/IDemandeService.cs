using AxiaAbonnement.Models.DTOs.Abonnements;

namespace AxiaAbonnement.Services.Interfaces
{
    public interface IDemandeService
    {
        Task<bool> DemanderRenouvellementAsync(Guid abonnementId, Guid clientId);
        Task<List<DemandeDto>> GetDemandesAsync(); // pour le responsable
        Task<bool> AccepterAsync(Guid demandeId, Guid responsableId);
        Task<bool> RefuserAsync(Guid demandeId, Guid responsableId);
        Task<string?> GetStatutDemandeAsync(Guid abonnementId, Guid clientId);
    }
}