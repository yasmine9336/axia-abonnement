using AxiaAbonnement.Models.DTOs.Auth;
using AxiaAbonnement.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AxiaAbonnement.Controllers
{
    [ApiController]
    [Route("api/demandes-responsables")]
    [Authorize(Policy = "AdminOnly")]
    public class DemandeResponsableController : ControllerBase
    {
        private readonly IDemandeResponsableService _service;

        public DemandeResponsableController(IDemandeResponsableService service)
        {
            _service = service;
        }

        // GET /api/demandes-responsables
        // GET /api/demandes-responsables?statut=Pending
        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] string? statut)
        {
            var demandes = await _service.GetDemandesAsync(statut);
            return Ok(demandes);
        }

        // PATCH /api/demandes-responsables/{id}/accepter
        [HttpPatch("{id}/accepter")]
        public async Task<IActionResult> Accepter(Guid id)
        {
            var ok = await _service.AccepterAsync(id);
            if (!ok) return NotFound(new { Message = "Demande introuvable ou déjà traitée." });
            return Ok(new { Message = "Demande acceptée. Un email avec le lien de paiement a été envoyé." });
        }

        // PATCH /api/demandes-responsables/{id}/refuser
        [HttpPatch("{id}/refuser")]
        public async Task<IActionResult> Refuser(Guid id, [FromBody] RefuserDemandeDto dto)
        {
            var ok = await _service.RefuserAsync(id, dto?.Motif);
            if (!ok) return NotFound(new { Message = "Demande introuvable ou déjà traitée." });
            return Ok(new { Message = "Demande refusée. Un email a été envoyé au responsable." });
        }
    }
}