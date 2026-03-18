using AxiaAbonnement.Models.DTOs.Offres;

namespace AxiaAbonnement.Services.Interfaces
{
    public interface IOffreService
    {
        Task<List<OffreDto>> GetAllOffresAsync();
        Task<List<PublicOffreDto>> GetPublicOffresAsync();
        Task<OffreDto?> GetOffreByIdAsync(Guid id);
        Task<OffreDto> CreateOffreAsync(Guid responsableId, CreateOffreDto dto);
        Task<bool> UpdateOffreAsync(Guid id, Guid responsableId, UpdateOffreDto dto);
        Task<bool> DeleteOffreAsync(Guid id);
        Task<bool?> ToggleOffreAsync(Guid id, Guid responsableId);
    }
}
