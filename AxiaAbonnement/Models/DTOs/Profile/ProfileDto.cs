namespace AxiaAbonnement.Models.DTOs.Profile
{
    public class ProfileDto
    {
        public Guid Id { get; set; }
        public string Username { get; set; } = "";
        public string Email { get; set; } = "";
        public string? PhoneNumber { get; set; }
        public string Role { get; set; } = "";
    }
}
