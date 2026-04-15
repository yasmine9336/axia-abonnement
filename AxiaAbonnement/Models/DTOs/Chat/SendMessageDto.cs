namespace AxiaAbonnement.Models.DTOs.Chat;

public class SentMessageDto
{
    public Guid Id { get; set; }
    public string Content { get; set; } = "";
    public DateTime CreatedAt { get; set; }
}
