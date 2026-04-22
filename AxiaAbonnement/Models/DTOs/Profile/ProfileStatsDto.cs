namespace AxiaAbonnement.Models.DTOs.Profile
{
    public class ProfileStatsDto
    {
        // Admin
        public int? NombreResponsables { get; set; }
        public int? NombreClients { get; set; }
        public int? AbonnementsActifs { get; set; }
        public decimal? RevenusMois { get; set; }
        public int? NombreServices { get; set; }
        public int? NombreOffres { get; set; }

        // Responsable
        public int? MesServices { get; set; }
        public int? MesClients { get; set; }
        public int? MesOffres { get; set; }

        // Client
        public int? AbonnementsExpires { get; set; }
        public decimal? TotalPaye { get; set; }
    }
}