namespace AxiaAbonnement.Models.DTOs.Profile
{
    public class ProfileDto
    {
        public Guid Id { get; set; }
        public string Username { get; set; } = "";
        public string Email { get; set; } = "";
        public string? PhoneNumber { get; set; }
        public string Role { get; set; } = "";
        public string? ProfileImageUrl { get; set; }

        // Responsable uniquement
        public string? NomEntreprise { get; set; }
        public string? MatriculeFiscal { get; set; }
        public string? SecteurActivite { get; set; }
        public string? AdresseProfessionnelle { get; set; }
        public DateTime CreatedAt { get; set; }
        public string? Gouvernorat { get; set; }
        public string? Ville { get; set; }
        public DateTime? DateNaissance { get; set; }
        public string? Sexe { get; set; }
    }
}