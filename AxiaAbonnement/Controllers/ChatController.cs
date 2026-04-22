using AxiaAbonnement.Models.Common;
using AxiaAbonnement.Models.DTOs.Chat;
using AxiaAbonnement.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace AxiaAbonnement.Controllers;

[ApiController]
[Route("api/chat")]
[Authorize]
public class ChatController(IChatService chatService) : ControllerBase
{
    private readonly IChatService _chatService = chatService;

    private Guid GetUserId() =>
        Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    public class SendMessageDto
    {
        public string Content { get; set; } = string.Empty;
    }

    private IActionResult FromResult<T>(ServiceResult<T> result, Func<T, IActionResult> onOk) =>
        result.Status switch
        {
            ServiceResultStatus.Ok => onOk(result.Data!),
            ServiceResultStatus.NotFound => NotFound(result.ErrorMessage),
            ServiceResultStatus.Forbidden => Forbid(),
            ServiceResultStatus.BadRequest => BadRequest(result.ErrorMessage),
            _ => StatusCode(500)
        };

    // ── Client ───────────────────────────────────────────────────

    [HttpGet("me")]
    [Authorize(Policy = "ClientOnly")]
    public async Task<IActionResult> GetOrCreateMyConversation()
        => Ok(await _chatService.GetOrCreateConversationAsync(GetUserId()));

    [HttpGet("me/messages")]
    [Authorize(Policy = "ClientOnly")]
    public async Task<IActionResult> GetMyMessages()
        => Ok(await _chatService.GetClientMessagesAsync(GetUserId()));

    [HttpPost("me/messages")]
    [Authorize(Policy = "ClientOnly")]
    public async Task<IActionResult> SendMyMessage([FromBody] SendMessageDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Content))
            return BadRequest("Message vide.");

        return Ok(await _chatService.SendClientMessageAsync(GetUserId(), dto.Content));
    }

    // ── Responsable ──────────────────────────────────────────────

    [HttpGet("conversations")]
    [Authorize(Policy = "ResponsableOnly")]
    public async Task<IActionResult> GetConversations()
        => Ok(await _chatService.GetConversationsAsync(GetUserId()));

    [HttpGet("conversations/{conversationId:guid}/messages")]
    [Authorize(Policy = "ResponsableOnly")]
    public async Task<IActionResult> GetConversationMessages(Guid conversationId)
    {
        var result = await _chatService.GetConversationMessagesAsync(conversationId, GetUserId());
        return FromResult(result, Ok);
    }

    [HttpPost("conversations/{conversationId:guid}/messages")]
    [Authorize(Policy = "ResponsableOnly")]
    public async Task<IActionResult> SendStaffMessage(Guid conversationId, [FromBody] SendMessageDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Content))
            return BadRequest("Message vide.");

        var result = await _chatService.SendStaffMessageAsync(conversationId, GetUserId(), dto.Content);
        return FromResult(result, Ok);
    }

    [HttpPost("conversations/{conversationId:guid}/close")]
    [Authorize(Policy = "ResponsableOnly")]
    public async Task<IActionResult> CloseConversation(Guid conversationId)
    {
        var result = await _chatService.CloseConversationAsync(conversationId, GetUserId());
        return FromResult(result, _ => Ok(new { message = "Conversation fermée." }));
    }

    // ── Responsable ──────────────────────────────────────────────

    [HttpGet("conversations/by-client/{clientId:guid}")]
    [Authorize(Policy = "ResponsableOnly")]
    public async Task<IActionResult> GetOrCreateConversationByClient(Guid clientId)
    {
        var result = await _chatService.GetOrCreateConversationForClientAsync(clientId, GetUserId());
        return FromResult(result, Ok);
    }
}
