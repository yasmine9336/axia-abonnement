using AxiaAbonnement.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using System.Security.Claims;

namespace AxiaAbonnement.Controllers
{
    [ApiController]
    [Route("api/demandes")]
    public class DemandeController : ControllerBase
    {
        private readonly IDemandeService _demandeService;
        public DemandeController(IDemandeService demandeService) => _demandeService = demandeService;

        private Guid GetUserId()
        {
            var raw = User.FindFirstValue(ClaimTypes.NameIdentifier);
            return Guid.TryParse(raw, out var id) ? id : Guid.Empty;
        }

        [HttpPost("{abonnementId}/renouveler")]
        [Authorize(Policy = "ClientOnly")]
        [EnableRateLimiting("AuthPolicy")]
        public async Task<IActionResult> Demander(Guid abonnementId)
        {
            var ok = await _demandeService.DemanderRenouvellementAsync(abonnementId, GetUserId());
            if (!ok) return BadRequest("Demande impossible ou déjà en attente.");
            return Ok(new { Message = "Demande envoyée avec succès." });
        }

        [HttpGet("{abonnementId}/statut")]
        [Authorize(Policy = "ClientOnly")]
        public async Task<IActionResult> GetStatut(Guid abonnementId)
        {
            var statut = await _demandeService.GetStatutDemandeAsync(abonnementId, GetUserId());
            return Ok(new { statut });
        }

        [HttpGet]
        [Authorize(Policy = "StaffOnly")]
        public async Task<IActionResult> GetDemandes()
        {
            var role = User.FindFirstValue(ClaimTypes.Role);
            if (role == "Responsable")
                return Ok(await _demandeService.GetDemandesByResponsableAsync(GetUserId()));

            return Ok(await _demandeService.GetDemandesAsync());
        }

        [HttpPatch("{id}/accepter")]
        [Authorize(Policy = "ResponsableOnly")]
        public async Task<IActionResult> Accepter(Guid id)
        {
            var ok = await _demandeService.AccepterAsync(id, GetUserId());
            if (!ok) return BadRequest("Impossible d'accepter.");
            return Ok(new { Message = "Demande acceptée." });
        }

        [HttpPatch("{id}/refuser")]
        [Authorize(Policy = "ResponsableOnly")]
        public async Task<IActionResult> Refuser(Guid id)
        {
            var ok = await _demandeService.RefuserAsync(id, GetUserId());
            if (!ok) return BadRequest("Impossible de refuser.");
            return Ok(new { Message = "Demande refusée." });
        }
    }
}