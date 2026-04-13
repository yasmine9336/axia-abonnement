namespace AxiaAbonnement.Models.DTOs.Auth
{
    public class DemandeResponsableDto
    {
        public Guid Id { get; set; }
        public string Username { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? PhoneNumber { get; set; }
        public string? NomEntreprise { get; set; }
        public string? MatriculeFiscal { get; set; }
        public string? SecteurActivite { get; set; }
        public string? AdresseProfessionnelle { get; set; }
        public string Statut { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime? DateAcceptation { get; set; }
        public string? MotifRefus { get; set; }
    }
}