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

        private Guid GetUserId()
        {
            var raw = User.FindFirstValue(ClaimTypes.NameIdentifier);
            return Guid.TryParse(raw, out var id) ? id : Guid.Empty;
        }

        // Client → ses abonnements
        [HttpGet]
        [Authorize(Policy = "ClientOnly")]
        public async Task<IActionResult> GetMesAbonnements()
        {
            var result = await _abonnementService.GetMyAbonnementsAsync(GetUserId());
            return Ok(result);
        }

        [HttpGet("all")]
        [Authorize(Policy = "StaffOnly")]
        public async Task<IActionResult> GetAll([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
        {
            var role = User.FindFirstValue(ClaimTypes.Role);
            if (role == "Responsable")
                return Ok(await _abonnementService.GetAbonnementsByResponsableAsync(GetUserId(), page, pageSize));

            return Ok(await _abonnementService.GetAllAbonnementsAsync(page, pageSize));
        }

        [HttpGet("stats")]
        [Authorize(Policy = "StaffOnly")]
        public async Task<IActionResult> GetStats()
        {
            var role = User.FindFirstValue(ClaimTypes.Role);
            if (role == "Responsable")
                return Ok(await _abonnementService.GetStatsByResponsableAsync(GetUserId()));

            return Ok(await _abonnementService.GetStatsAsync());
        }

        [HttpGet("by-client/{clientId:guid}")]
        [Authorize(Policy = "StaffOnly")]
        public async Task<IActionResult> GetByClient(Guid clientId)
        {
            var role = User.FindFirstValue(ClaimTypes.Role);
            if (role == "Responsable")
                return Ok(await _abonnementService.GetAbonnementsByClientForResponsableAsync(clientId, GetUserId()));
            return Ok(await _abonnementService.GetAbonnementsByClientAsync(clientId));
        }

    }


}