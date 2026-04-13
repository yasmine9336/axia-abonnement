using AxiaAbonnement.Models.DTOs.Auth;
using AxiaAbonnement.Models.Entities;

namespace AxiaAbonnement.Services.Interfaces
{
    public interface IAuthService
    {
        Task<User?> RegisterAsync(RegisterDto dto);
        Task<LoginResultDto> LoginAsync(LoginDto dto);   // ← changé (plus de ?)
        Task<TokenResponseDto?> RefreshTokenAsync(RefreshTokenDto dto);
        Task<bool> ForgotPasswordAsync(ForgotPasswordDto dto);
        Task<bool> ResetPasswordAsync(ResetPasswordDto dto);
    }
}