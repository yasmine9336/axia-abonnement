using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
namespace AxiaAbonnement.Models.Entities
{
    public class Feedback
    {
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        public Guid ClientId { get; set; }

        [ForeignKey(nameof(ClientId))]
        public User Client { get; set; } = null!;

        [Required]
        public Guid AbonnementId { get; set; }

        [ForeignKey(nameof(AbonnementId))]
        public Abonnement Abonnement { get; set; } = null!;

        [Range(1, 5)]
        public int Note { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
