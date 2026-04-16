using AxiaAbonnement.Models.DTOs.Users;
using AxiaAbonnement.Models.Entities;

namespace AxiaAbonnement.Services.Interfaces
{
    public interface IUserService
    {
        Task<List<UserDto>> GetResponsablesAsync();
        Task<User?> CreateResponsableAsync(CreateResponsableDto dto);
        Task<bool> UpdateResponsableAsync(Guid id, UpdateResponsableDto dto);
        Task<bool?> ToggleResponsableAsync(Guid id);
        Task<bool> DeleteResponsableAsync(Guid id);
        Task<List<UserDto>> GetClientsAsync();
        Task<List<UserDto>> GetClientsByResponsableAsync(Guid responsableId);

    }
}
