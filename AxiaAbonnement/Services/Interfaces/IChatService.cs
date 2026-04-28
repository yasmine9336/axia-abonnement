using AxiaAbonnement.Models.Common;
using AxiaAbonnement.Models.DTOs.Chat;

namespace AxiaAbonnement.Services.Interfaces;

public interface IChatService
{
    // ── Client ──────────────────────────────────────────────
    Task<List<ResponsableInfoDto>> GetMyResponsablesAsync(Guid clientId);
    Task<ServiceResult<ConversationDto>> GetOrCreateConversationWithResponsableAsync(Guid clientId, Guid responsableId);
    Task<ServiceResult<List<ChatMessageDto>>> GetConversationMessagesForClientAsync(Guid conversationId, Guid clientId);
    Task<ServiceResult<SentMessageDto>> SendClientMessageToConversationAsync(Guid conversationId, Guid clientId, string content);
    Task<ServiceResult<int>> GetClientUnreadCountAsync(Guid conversationId, Guid clientId);

    // ── Responsable ──────────────────────────────────────────
    Task<List<ConversationSummaryDto>> GetConversationsAsync(Guid responsableId);
    Task<ServiceResult<List<ChatMessageDto>>> GetConversationMessagesAsync(Guid conversationId, Guid responsableId);
    Task<ServiceResult<SentMessageDto>> SendStaffMessageAsync(Guid conversationId, Guid senderId, string content);
    Task<ServiceResult<bool>> CloseConversationAsync(Guid conversationId, Guid responsableId);
    Task<ServiceResult<ConversationSummaryDto>> GetOrCreateConversationForClientAsync(Guid clientId, Guid responsableId);
}