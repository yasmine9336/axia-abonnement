namespace AxiaAbonnement.Models.DTOs.Feedbacks
{
    public class FeedbackDto
    {
        public Guid Id { get; set; }
        public Guid ClientId { get; set; }
        public string ClientUsername { get; set; } = string.Empty;
        public string ClientEmail { get; set; } = string.Empty;

        public Guid AbonnementId { get; set; }
        public string OffreIntitule { get; set; } = string.Empty;

        public string Message { get; set; } = string.Empty;
        public int Note { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
