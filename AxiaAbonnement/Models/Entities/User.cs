namespace AxiaAbonnement.Models.Entities
{
    public class User
    {
        public Guid Id { get; set; }
        public string Username { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public string? PhoneNumber { get; set; }
        public bool IsActive { get; set; } = true;
        public string? RefreshToken { get; set; }
        public DateTime? RefreshTokenExpiryTime { get; set; }
        public string? ResetPasswordToken { get; set; }
        public DateTime? ResetPasswordTokenExpiry { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public string? ProfileImageUrl { get; set; }

        // Statut du compte (par défaut Active pour ne pas casser les Clients existants)
        public StatutCompte Statut { get; set; } = StatutCompte.Active;

        // Motif du refus (rempli uniquement si Statut = Rejected)
        public string? MotifRefus { get; set; }

        // Champs responsable (nullable — remplis uniquement pour role="Responsable")
        public string? NomEntreprise { get; set; }
        public string? MatriculeFiscal { get; set; }
        public string? SecteurActivite { get; set; }
        public string? AdresseProfessionnelle { get; set; }

        // Date d'acceptation de la demande (pour l'email admin + traçabilité)
        public DateTime? DateAcceptation { get; set; }

        // Date de paiement du compte responsable (pour savoir quand il est devenu actif)
        public DateTime? DatePaiementCompte { get; set; }

    }
}
