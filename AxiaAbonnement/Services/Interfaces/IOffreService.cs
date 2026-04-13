using AxiaAbonnement.Models.DTOs.Offres;

namespace AxiaAbonnement.Services.Interfaces
{
    public interface IOffreService
    {
        // back-office: si Responsable => offres liées à ses services
        Task<List<OffreDto>> GetAllOffresAsync(Guid currentUserId, string role);

        // public client: toutes les offres actives
        Task<List<PublicOffreDto>> GetPublicOffresAsync();

        Task<OffreDto?> GetOffreByIdAsync(Guid id);
        Task<OffreDto> CreateOffreAsync(Guid responsableId, CreateOffreDto dto);
        Task<bool> UpdateOffreAsync(Guid id, Guid responsableId, UpdateOffreDto dto);
        Task<bool> DeleteOffreAsync(Guid id);
        Task<bool?> ToggleOffreAsync(Guid id, Guid responsableId);
    }
}