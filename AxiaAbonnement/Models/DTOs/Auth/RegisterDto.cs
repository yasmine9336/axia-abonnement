using System.ComponentModel.DataAnnotations;

namespace AxiaAbonnement.Models.DTOs.Auth
{
    public class RegisterDto
    {
        [Required][MinLength(3)] public string Username { get; set; } = string.Empty;
        [Required][EmailAddress] public string Email { get; set; } = string.Empty;
        [Required][MinLength(6)] public string Password { get; set; } = string.Empty;

        public string Role { get; set; } = "Client";

        public string? PhoneNumber { get; set; }
        public string? Gouvernorat { get; set; }
        public string? Ville { get; set; }

        // Champs client
        public DateTime? DateNaissance { get; set; }
        public string? Sexe { get; set; }

        // Champs responsable
        public string? NomEntreprise { get; set; }
        public string? MatriculeFiscal { get; set; }
        public string? SecteurActivite { get; set; }
        public string? AdresseProfessionnelle { get; set; }
    }
}