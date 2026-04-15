namespace AxiaAbonnement.Models.DTOs.Chat;

public class ChatMessageDto
{
    public Guid Id { get; set; }
    public string Content { get; set; } = "";
    public string SenderType { get; set; } = "";
    public Guid? SenderUserId { get; set; }
    public bool IsRead { get; set; }
    public DateTime CreatedAt { get; set; }
}
