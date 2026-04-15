using AxiaAbonnement.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace AxiaAbonnement.Controllers
{
    [ApiController]
    [Route("api/abonnements")]
    [Authorize]
    public class AbonnementController : ControllerBase
    {
        private readonly IAbonnementService _abonnementService;

        public AbonnementController(IAbonnementService abonnementService)
        {
            _abonnementService = abonnementService;
        }

        private Guid GetUserId() =>
            Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        // Client → ses abonnements
        [HttpGet]
        [Authorize(Policy = "ClientOnly")]
        public async Task<IActionResult> GetMesAbonnements()
        {
            var result = await _abonnementService.GetMyAbonnementsAsync(GetUserId());
            return Ok(result);
        }

        // Staff → tous les abonnements
        [HttpGet("all")]
        [Authorize(Policy = "StaffOnly")]
        public async Task<IActionResult> GetAll()
        {
            var result = await _abonnementService.GetAllAbonnementsAsync();
            return Ok(result);
        }

        // Staff → statistiques
        [HttpGet("stats")]
        [Authorize(Policy = "StaffOnly")]
        public async Task<IActionResult> GetStats()
        {
            var result = await _abonnementService.GetStatsAsync();
            return Ok(result);
        }

        [HttpPatch("{id}/activer")]
        [Authorize(Policy = "ResponsableOnly")]
        public async Task<IActionResult> Activer(Guid id)
        {
            var ok = await _abonnementService.ActiverAsync(id, GetUserId());
            if (!ok) return BadRequest("Impossible d'activer.");
            return Ok(new { Message = "Abonnement activé." });
        }

        [HttpPatch("{id}/desactiver")]
        [Authorize(Policy = "ResponsableOnly")]
        public async Task<IActionResult> Desactiver(Guid id)
        {
            var ok = await _abonnementService.DesactiverAsync(id, GetUserId());
            if (!ok) return BadRequest("Impossible de désactiver.");
            return Ok(new { Message = "Abonnement désactivé." });
        }

    }
}