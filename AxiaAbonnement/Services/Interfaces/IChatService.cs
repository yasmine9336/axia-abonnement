using AxiaAbonnement.Models.Common;
using AxiaAbonnement.Models.DTOs.Chat;

namespace AxiaAbonnement.Services.Interfaces;

public interface IChatService
{
    Task<ConversationDto> GetOrCreateConversationAsync(Guid clientId);
    Task<List<ChatMessageDto>> GetClientMessagesAsync(Guid clientId);
    Task<SentMessageDto> SendClientMessageAsync(Guid clientId, string content);
    Task<List<ConversationSummaryDto>> GetConversationsAsync(Guid responsableId);
    Task<ServiceResult<List<ChatMessageDto>>> GetConversationMessagesAsync(Guid conversationId, Guid responsableId);
    Task<ServiceResult<SentMessageDto>> SendStaffMessageAsync(Guid conversationId, Guid senderId, string content);
    Task<ServiceResult<bool>> CloseConversationAsync(Guid conversationId, Guid responsableId);
    Task<ServiceResult<ConversationSummaryDto>> GetOrCreateConversationForClientAsync(Guid clientId, Guid responsableId);
    Task<List<ResponsableInfoDto>> GetMyResponsablesAsync(Guid clientId);
    Task<ConversationDto> GetOrCreateConversationWithResponsableAsync(Guid clientId, Guid responsableId);
    Task<ServiceResult<List<ChatMessageDto>>> GetConversationMessagesForClientAsync(Guid conversationId, Guid clientId);
    Task<ServiceResult<SentMessageDto>> SendClientMessageToConversationAsync(Guid conversationId, Guid clientId, string content);
}
