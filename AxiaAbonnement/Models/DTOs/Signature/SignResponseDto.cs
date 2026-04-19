namespace AxiaAbonnement.Models.DTOs.Signature
{
    public class SignResponseDto
    {
        public string Hash { get; set; } = string.Empty;
        public string Signature { get; set; } = string.Empty;
        public string Algorithm { get; set; } = "RSA-SHA256";
        public string Timestamp { get; set; } = string.Empty;
        public string AdminId { get; set; } = string.Empty;
        public string AdminName { get; set; } = string.Empty;
        public string AdminEmail { get; set; } = string.Empty;
        public string DocumentTitle { get; set; } = string.Empty;
    }
}
