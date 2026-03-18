using System.ComponentModel.DataAnnotations;
namespace AxiaAbonnement.Models.DTOs.Auth
{
    public class RefreshTokenDto
    {
        [Required] public Guid UserId { get; set; }
        [Required] public string RefreshToken { get; set; } = string.Empty;
    }
}
