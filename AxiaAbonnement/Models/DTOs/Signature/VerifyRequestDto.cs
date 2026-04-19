namespace AxiaAbonnement.Models.DTOs.Signature
{
    public class VerifyRequestDto
    {
        public string Hash { get; set; } = string.Empty;
        public string Signature { get; set; } = string.Empty;
        public string AdminId { get; set; } = string.Empty;
        public string Timestamp { get; set; } = string.Empty;
        public string DocumentTitle { get; set; } = string.Empty;
    }
}
