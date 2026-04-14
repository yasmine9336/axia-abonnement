using AxiaAbonnement.Models.DTOs.Profile;

namespace AxiaAbonnement.Services.Interfaces
{
    public interface IProfileService
    {
        Task<ProfileDto?> GetProfileAsync(Guid userId);
        Task<bool> UpdateProfileAsync(Guid userId, UpdateProfileDto dto);
        Task<bool> ChangePasswordAsync(Guid userId, ChangePasswordDto dto);
        Task<string?> UpdateProfilePhotoAsync(Guid userId, IFormFile photo);
    }
}
