namespace AxiaAbonnement.Models.DTOs.Chat;

public class ConversationSummaryDto
{
    public Guid Id { get; set; }
    public Guid ClientId { get; set; }
    public string ClientName { get; set; } = string.Empty;
    public string ClientEmail { get; set; } = string.Empty;
    public Guid? AssignedResponsableId { get; set; }
    public string Statut { get; set; } = string.Empty;
    public DateTime UpdatedAt { get; set; }
    public int UnreadCount { get; set; }
    public LastMessageDto? LastMessage { get; set; }
}
