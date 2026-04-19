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

        [HttpGet("all")]
        [Authorize(Policy = "StaffOnly")]
        public async Task<IActionResult> GetAll()
        {
            var role = User.FindFirstValue(ClaimTypes.Role);
            if (role == "Responsable")
                return Ok(await _abonnementService.GetAbonnementsByResponsableAsync(GetUserId()));

            return Ok(await _abonnementService.GetAllAbonnementsAsync());
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

    }
}