namespace AxiaAbonnement.Models.Entities
{
    public class ServiceOffre
    {
        public Guid ServiceId { get; set; }
        public Service Service { get; set; } = null!;
        public Guid OffreId { get; set; }
        public Offre Offre { get; set; } = null!;
    }
}
