namespace AxiaAbonnement.Models.Enums
{
    public enum StatutCompte
    {
        Active,     // Client normal OU Responsable validé et payé (accès dashboard OK)
        Pending,    // Responsable en attente de validation admin
        Accepted,   // Responsable accepté mais n'a pas encore payé les 500 TND
        Rejected    // Responsable refusé par l'admin
    }
}