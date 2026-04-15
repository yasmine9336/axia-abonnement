namespace AxiaAbonnement.Models.DTOs.Chat;

public class ConversationDto
{
    public Guid Id { get; set; }
    public Guid ClientId { get; set; }
    public Guid? AssignedResponsableId { get; set; }
    public string Statut { get; set; } = "";
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
