namespace AxiaAbonnement.Models.DTOs.Abonnements
{
    public class StatsDto
    {
        public int TotalAbonnes { get; set; }
        public decimal RevenuMensuel { get; set; }
        public int ServicesActifs { get; set; }
        public int DemandesEnAttente { get; set; }
        public List<AbonnementDto> AbonnementsRecents { get; set; } = new();
        public List<RevenuMoisDto> RevenuParMois { get; set; } = new();
        public int AbonnementsActifs { get; set; }
        public int AbonnementsExpires { get; set; }
        public int AbonnementsEnAttente { get; set; } 
    }
}