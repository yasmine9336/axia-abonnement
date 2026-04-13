using System.ComponentModel.DataAnnotations;

namespace AxiaAbonnement.Models.DTOs.Auth
{
    public class RegisterDto
    {
        [Required][MinLength(3)] public string Username { get; set; } = string.Empty;
        [Required][EmailAddress] public string Email { get; set; } = string.Empty;
        [Required][MinLength(6)] public string Password { get; set; } = string.Empty;

        // Optionnel - défaut "Client"
        public string Role { get; set; } = "Client";

        // Champs responsable - requis uniquement si Role == "Responsable"
        public string? PhoneNumber { get; set; }
        public string? NomEntreprise { get; set; }
        public string? MatriculeFiscal { get; set; }
        public string? SecteurActivite { get; set; }
        public string? AdresseProfessionnelle { get; set; }
    }
}