namespace AxiaAbonnement.Models.DTOs.Offres
{
    public class OffreDto
    {
        public Guid Id { get; set; }
        public string IntituleOffre { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public decimal ParMois { get; set; }
        public decimal ParAnnee { get; set; }
        public int NbAbonnes { get; set; }
        public bool IsActive {  get; set; }
        public DateTime CreatedAt { get; set; }
        public string CreePar { get; set; } = string.Empty;
        public DateTime? CbModification { get; set; }
        public string? CbModificateur { get; set; }
        public List<string> Services { get; set; } = new();
    }
}
