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

    [HttpGet("conversations/by-client/{clientId:guid}")]
    [Authorize(Policy = "ResponsableOnly")]
    public async Task<IActionResult> GetOrCreateConversationByClient(Guid clientId)
    {
        var result = await _chatService.GetOrCreateConversationForClientAsync(clientId, GetUserId());
        return FromResult(result, Ok);
    }

    // ── Client ──────────────────────────────────────────────

    [HttpGet("my-responsables")]
    [Authorize(Policy = "ClientOnly")]
    public async Task<IActionResult> GetMyResponsables()
        => Ok(await _chatService.GetMyResponsablesAsync(GetUserId()));

    [HttpGet("with-responsable/{responsableId:guid}")]
    [Authorize(Policy = "ClientOnly")]
    public async Task<IActionResult> GetOrCreateWithResponsable(Guid responsableId)
    {
        var result = await _chatService.GetOrCreateConversationWithResponsableAsync(GetUserId(), responsableId);
        return FromResult(result, Ok);
    }

    [HttpGet("conversations/{conversationId:guid}/client-messages")]
    [Authorize(Policy = "ClientOnly")]
    public async Task<IActionResult> GetClientConversationMessages(Guid conversationId)
    {
        var result = await _chatService.GetConversationMessagesForClientAsync(conversationId, GetUserId());
        return FromResult(result, Ok);
    }

    [HttpPost("conversations/{conversationId:guid}/client-messages")]
    [Authorize(Policy = "ClientOnly")]
    public async Task<IActionResult> SendClientMessageToConversation(Guid conversationId, [FromBody] SendMessageDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Content))
            return BadRequest("Message vide.");

        var result = await _chatService.SendClientMessageToConversationAsync(conversationId, GetUserId(), dto.Content);
        return FromResult(result, Ok);
    }

    [HttpGet("conversations/{conversationId:guid}/client-unread-count")]
    [Authorize(Policy = "ClientOnly")]
    public async Task<IActionResult> GetClientUnreadCount(Guid conversationId)
    {
        var result = await _chatService.GetClientUnreadCountAsync(
            conversationId,
            GetUserId()
        );

        return FromResult(result, count => Ok(new { unreadCount = count }));
    }
}
