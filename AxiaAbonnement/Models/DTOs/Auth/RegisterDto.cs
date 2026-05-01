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

        [CustomValidation(typeof(RegisterDto), nameof(ValidateDateNaissance))]
        public DateTime? DateNaissance { get; set; }
        public string? Sexe { get; set; }

        // Champs responsable
        public string? NomEntreprise { get; set; }
        public string? MatriculeFiscal { get; set; }
        public string? SecteurActivite { get; set; }
        public string? AdresseProfessionnelle { get; set; }

        public static ValidationResult? ValidateDateNaissance(DateTime? date, ValidationContext ctx)
        {
            if (date == null) return ValidationResult.Success;
            if (date > DateTime.UtcNow)
                return new ValidationResult("La date de naissance ne peut pas être dans le futur.");
            if (date < new DateTime(1900, 1, 1))
                return new ValidationResult("Date de naissance invalide.");
            return ValidationResult.Success;
        }
    }

}