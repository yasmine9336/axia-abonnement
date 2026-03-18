using AxiaAbonnement.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace AxiaAbonnement.Controllers
{
    [ApiController]
    [Route("api/demandes")]
    public class DemandeController : ControllerBase
    {
        private readonly IDemandeService _demandeService;
        public DemandeController(IDemandeService demandeService) => _demandeService = demandeService;

        private Guid GetUserId() =>
            Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        // Client — envoyer une demande
        [HttpPost("{abonnementId}/renouveler")]
        [Authorize(Policy = "ClientOnly")]
        public async Task<IActionResult> Demander(Guid abonnementId)
        {
            var ok = await _demandeService.DemanderRenouvellementAsync(abonnementId, GetUserId());
            if (!ok) return BadRequest("Demande impossible ou déjà en attente.");
            return Ok(new { Message = "Demande envoyée avec succès." });
        }

        // Client — voir le statut de sa demande
        [HttpGet("{abonnementId}/statut")]
        [Authorize(Policy = "ClientOnly")]
        public async Task<IActionResult> GetStatut(Guid abonnementId)
        {
            var statut = await _demandeService.GetStatutDemandeAsync(abonnementId, GetUserId());
            return Ok(new { statut });
        }

        // Responsable — voir toutes les demandes
        [HttpGet]
        [Authorize(Policy = "ResponsableOnly")]
        public async Task<IActionResult> GetDemandes()
        {
            var demandes = await _demandeService.GetDemandesAsync();
            return Ok(demandes);
        }

        // Responsable — accepter
        [HttpPatch("{id}/accepter")]
        [Authorize(Policy = "ResponsableOnly")]
        public async Task<IActionResult> Accepter(Guid id)
        {
            var ok = await _demandeService.AccepterAsync(id);
            if (!ok) return BadRequest("Impossible d'accepter.");
            return Ok(new { Message = "Demande acceptée." });
        }

        // Responsable — refuser
        [HttpPatch("{id}/refuser")]
        [Authorize(Policy = "ResponsableOnly")]
        public async Task<IActionResult> Refuser(Guid id)
        {
            var ok = await _demandeService.RefuserAsync(id);
            if (!ok) return BadRequest("Impossible de refuser.");
            return Ok(new { Message = "Demande refusée." });
        }
    }
}