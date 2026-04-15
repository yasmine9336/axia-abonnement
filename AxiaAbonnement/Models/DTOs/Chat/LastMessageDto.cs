namespace AxiaAbonnement.Models.DTOs.Chat;

public class LastMessageDto
{
    public string Content { get; set; } = "";
    public string SenderType { get; set; } = "";
    public DateTime CreatedAt { get; set; }
}
