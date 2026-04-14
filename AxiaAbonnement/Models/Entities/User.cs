using AxiaAbonnement.Models.Enums;

namespace AxiaAbonnement.Models.Entities
{
    public class User
    {
        public Guid Id { get; set; }
        public string Username { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty;

        // Enum au lieu de string
        public UserRole Role { get; set; } = UserRole.Client;

        public string? PhoneNumber { get; set; }
        public bool IsActive { get; set; } = true;

        // RefreshToken haché (à implémenter dans AuthService)
        public string? RefreshTokenHash { get; set; }
        public DateTime? RefreshTokenExpiryTime { get; set; }

        public string? ResetPasswordToken { get; set; }
        public DateTime? ResetPasswordTokenExpiry { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public string? ProfileImageUrl { get; set; }

        public StatutCompte Statut { get; set; } = StatutCompte.Active;
        public string? MotifRefus { get; set; }

        // Champs responsable
        public string? NomEntreprise { get; set; }
        public string? MatriculeFiscal { get; set; }
        public string? SecteurActivite { get; set; }
        public string? AdresseProfessionnelle { get; set; }
        public DateTime? DateAcceptation { get; set; }
        public DateTime? DatePaiementCompte { get; set; }

        // Navigation
        public ICollection<Abonnement> Abonnements { get; set; } = new List<Abonnement>();
    }
}