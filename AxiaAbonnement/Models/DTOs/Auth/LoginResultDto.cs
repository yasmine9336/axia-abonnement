namespace AxiaAbonnement.Models.DTOs.Auth
{
    public class LoginResultDto
    {
        // Rempli uniquement si login réussi (Active)
        public TokenResponseDto? Token { get; set; }

        // Codes : "INVALID", "PENDING", "PAYMENT_REQUIRED", "REJECTED"
        public string? ErrorCode { get; set; }
        public string? Message { get; set; }

        // Pour PAYMENT_REQUIRED : le frontend lancera le Stripe Checkout avec cet Id
        public Guid? UserId { get; set; }
    }
}