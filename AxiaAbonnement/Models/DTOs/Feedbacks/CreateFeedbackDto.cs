using System.ComponentModel.DataAnnotations;
namespace AxiaAbonnement.Models.DTOs.Feedbacks
{
    public class CreateFeedbackDto
    {
        [Required]
        public Guid AbonnementId { get; set; }

        [Range(1, 5)]
        public int Note { get; set; }

    }
}
