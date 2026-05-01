using static AxiaAbonnement.Models.Enums.ConversationStatut;
namespace AxiaAbonnement.Models.Entities
{
    public class ChatConversation
    {
        public Guid Id { get; set; } = Guid.NewGuid();

        public Guid ClientId { get; set; }
        public User Client { get; set; } = null!;

        public Guid? AssignedResponsableId { get; set; } // nullable en V1
        public User? AssignedResponsable { get; set; }

        public string Statut { get; set; } = nameof(Open);
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        public ICollection<ChatMessage> Messages { get; set; } = new List<ChatMessage>();
    }
}