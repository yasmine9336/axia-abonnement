namespace AxiaAbonnement.Models.DTOs.Payment;

public class PaiementDto
{
    public Guid Id { get; set; }
    public decimal Montant { get; set; }
    public string Statut { get; set; } = "";
    public DateTime CreatedAt { get; set; }
    public string IntituleOffre { get; set; } = "";
    public string TypeAbonnement { get; set; } = "";
    public string? ClientUsername { get; set; }
    public string? ClientEmail { get; set; }
}
