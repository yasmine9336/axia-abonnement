using AxiaAbonnement.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using AxiaAbonnement.Models.DTOs.Feedbacks;

namespace AxiaAbonnement.Controllers;

[ApiController]
[Route("api/feedbacks")]
[Authorize]
public class FeedbackController(IFeedbackService feedbackService) : ControllerBase
{
    private readonly IFeedbackService _feedbackService = feedbackService;

    private bool TryGetUserId(out Guid userId) =>
        Guid.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out userId);

    [HttpPost]
    [Authorize(Policy = "ClientOnly")]
    public async Task<IActionResult> Create([FromBody] CreateFeedbackDto dto)
    {
        if (!TryGetUserId(out var userId))
            return Unauthorized("Utilisateur non authentifié");
        var (ok, error) = await _feedbackService.AddFeedbackAsync(userId, dto);
        return ok ? Ok(new { message = "Feedback enregistré." }) : BadRequest(new { message = error });
    }

    [HttpGet]
    [Authorize(Policy = "StaffOnly")]
    public async Task<IActionResult> GetAll()
    {
        var feedbacks = await _feedbackService.GetAllFeedbacksAsync();
        return Ok(feedbacks);
    }

    [HttpGet("{abonnementId}/my-note")]
    [Authorize(Policy = "ClientOnly")]
    public async Task<IActionResult> GetMyNote(Guid abonnementId)
    {
        if (!TryGetUserId(out var userId))
            return Unauthorized("Utilisateur non authentifié");
        var note = await _feedbackService.GetMyNoteAsync(userId, abonnementId);
        return Ok(new { note });
    }
}