using System.ComponentModel.DataAnnotations;
namespace AxiaAbonnement.Models.DTOs.Feedbacks
{
    public class CreateFeedbackDto
    {
        [Required]
        public Guid AbonnementId { get; set; }

        [Required, MaxLength(1000)]
        public string Message { get; set; } = string.Empty;

        [Range(1, 5)]
        public int Note { get; set; }

    }
}
