using AxiaAbonnement.Models.DTOs.Feedbacks;
using AxiaAbonnement.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace AxiaAbonnement.Controllers
{
    [ApiController]
    [Route("api/feedbacks")]
    public class FeedbackController : ControllerBase
    {
        private readonly IFeedbackService _feedbackService;

        public FeedbackController(IFeedbackService feedbackService)
        {
            _feedbackService = feedbackService;
        }

        private Guid GetUserId() =>
            Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        [HttpPost]
        [Authorize(Policy = "ClientOnly")]
        public async Task<IActionResult> Create([FromBody] CreateFeedbackDto dto)
        {
            var result = await _feedbackService.AddFeedbackAsync(GetUserId(), dto);
            if (!result.Ok) return BadRequest(result.Error);

            return Ok(new { Message = "Feedback envoyé avec succès." });
        }

        [HttpGet]
        [Authorize(Policy = "StaffOnly")]
        public async Task<IActionResult> GetAll()
        {
            var feedbacks = await _feedbackService.GetAllFeedbacksAsync();
            return Ok(feedbacks);
        }

        [HttpGet("{abonnementId}/exists")]
        [Authorize(Policy = "ClientOnly")]
        public async Task<IActionResult> Exists(Guid abonnementId)
        {
            var clientId = GetUserId();
            var exists = await _feedbackService.ExistsAsync(clientId, abonnementId);
            return Ok(new { exists });
        }

    }
}