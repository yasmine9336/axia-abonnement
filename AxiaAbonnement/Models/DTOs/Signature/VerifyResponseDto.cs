namespace AxiaAbonnement.Models.DTOs.Signature
{
    public class VerifyResponseDto
    {
        public bool Valid { get; set; }
        public string Message { get; set; } = string.Empty;
    }
}
