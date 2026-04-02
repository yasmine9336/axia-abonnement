namespace AxiaAbonnement.Models.DTOs.Users
{
    public class UserDto
    {
        public Guid Id { get; set; }
        public string Username { get; set; } = "";
        public string Email { get; set; } = "";
        public string? PhoneNumber { get; set; }
        public bool IsActive { get; set; }
        public string? ProfileImageUrl { get; set; }
    }
}