namespace AxiaAbonnement.Models.DTOs.Payment
{
    public class CreateSessionDto
    {
        public Guid? OffreId { get; set; }
        public Guid? ServiceId { get; set; }
        public string Type { get; set; } = "mensuel";
    }
}
