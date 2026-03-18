namespace AxiaAbonnement.Models.DTOs.Auth
{
    public class TokenResponseDto
    {
        public required string AccessToken { get; set; }
        public string? RefreshToken { get; set; }
        public required string Role { get; set; }
    }

}
