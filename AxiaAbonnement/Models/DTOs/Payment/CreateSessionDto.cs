namespace AxiaAbonnement.Models.DTOs.Payment
{
    public class CreateSessionDto
    {
        public Guid? OffreId { get; set; }
        public Guid? ServiceId { get; set; }

        [System.ComponentModel.DataAnnotations.RegularExpression("^(mensuel|annuel)$", ErrorMessage = "Le type doit être 'mensuel' ou 'annuel'.")]
        public string Type { get; set; } = "mensuel";
    }
}
