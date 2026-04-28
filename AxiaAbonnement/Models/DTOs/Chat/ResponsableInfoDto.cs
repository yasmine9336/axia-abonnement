namespace AxiaAbonnement.Models.DTOs.Chat;

public class ResponsableInfoDto
{
    public Guid Id { get; set; }
    public string Username { get; set; } = "";
    public string Email { get; set; } = "";
    public List<string> AbonnementsLies { get; set; } = new();
}