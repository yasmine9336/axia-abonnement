using AxiaAbonnement.Models.DTOs.Offres;
using AxiaAbonnement.Models.Enums;

namespace AxiaAbonnement.Services.Interfaces
{
    public interface IOffreService
    {
        // UserRole au lieu de string
        Task<List<OffreDto>> GetAllOffresAsync(Guid currentUserId, UserRole role);
        Task<List<PublicOffreDto>> GetPublicOffresAsync();
        Task<OffreDto?> GetOffreByIdAsync(Guid id);
        Task<OffreDto> CreateOffreAsync(Guid responsableId, CreateOffreDto dto);
        Task<bool> UpdateOffreAsync(Guid id, Guid responsableId, UpdateOffreDto dto);
        Task<bool> DeleteOffreAsync(Guid id, Guid responsableId);
        Task<bool?> ToggleOffreAsync(Guid id, Guid responsableId);
    }
}