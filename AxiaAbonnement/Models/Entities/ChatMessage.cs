namespace AxiaAbonnement.Models.Entities
{
    public class ChatMessage
    {
        public Guid Id { get; set; } = Guid.NewGuid();

        public Guid ConversationId { get; set; }
        public ChatConversation Conversation { get; set; } = null!;

        public string SenderType { get; set; } = "Client"; // Client | Responsable | Bot
        public Guid? SenderUserId { get; set; } // null si Bot
        public User? SenderUser { get; set; }

        public string Content { get; set; } = string.Empty;
        public bool IsRead { get; set; } = false;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}