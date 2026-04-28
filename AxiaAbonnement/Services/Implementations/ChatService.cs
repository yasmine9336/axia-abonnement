using AxiaAbonnement.Data;
using AxiaAbonnement.Hubs;
using AxiaAbonnement.Models.Common;
using AxiaAbonnement.Models.DTOs.Chat;
using AxiaAbonnement.Models.Entities;
using AxiaAbonnement.Models.Enums;
using AxiaAbonnement.Services.Interfaces;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using static AxiaAbonnement.Models.Enums.SenderType;
using static AxiaAbonnement.Models.Enums.ConversationStatut;

namespace AxiaAbonnement.Services.Implementations;

public class ChatService(
    AppDbContext ctx,
    IHubContext<NotificationHub> hub,
    INotificationService notifService) : IChatService
{
    private readonly AppDbContext _ctx = ctx;
    private readonly IHubContext<NotificationHub> _hub = hub;
    private readonly INotificationService _notifService = notifService;

    // ── Helpers privés ────────────────────────────────────────────

    private async Task NotifierResponsable(Guid respId, ChatConversation conv, ChatMessage msg)
    {
        await _hub.Clients.Group(respId.ToString())
            .SendAsync("NewConversationMessage", new
            {
                conversationId = conv.Id,
                clientId = conv.ClientId,
                content = msg.Content,
                createdAt = msg.CreatedAt
            });

        await _notifService.SendAsync(respId,
            $"Nouveau message : \"{msg.Content[..Math.Min(msg.Content.Length, 60)]}\"", "info",
            "/dashboard/responsable/messages");
    }

    private async Task<bool> ResponsableOwnsClientAsync(Guid responsableId, Guid clientId)
    {

        var mesServiceIds = await _ctx.Services
            .Where(s => s.ResponsableId == responsableId && s.IsActive)
            .Select(s => s.Id)
            .ToListAsync();

        return await _ctx.Abonnements
            .AnyAsync(a => a.UserId == clientId && a.IsActive && (
                (a.ServiceId.HasValue && mesServiceIds.Contains(a.ServiceId.Value)) ||
                (a.OffreId.HasValue && a.Offre!.ServiceOffres.Any(so => mesServiceIds.Contains(so.ServiceId)))
            ));
    }

    // ── Responsable ──────────────────────────────────────────────

    public async Task<List<ConversationSummaryDto>> GetConversationsAsync(Guid responsableId)
    {
        var stale = await _ctx.ChatConversations
            .Include(c => c.Messages)
            .Where(c => c.Statut == nameof(Closed) && c.Messages.Count == 0)
            .ToListAsync();

        if (stale.Count > 0)
        {
            _ctx.ChatConversations.RemoveRange(stale);
            await _ctx.SaveChangesAsync();
        }

        var mesServiceIds = await _ctx.Services
            .Where(s => s.ResponsableId == responsableId && s.IsActive)
            .Select(s => s.Id)
            .ToListAsync();

        var mesClientIds = await _ctx.Abonnements
            .Where(a => a.IsActive && (
                (a.ServiceId.HasValue && mesServiceIds.Contains(a.ServiceId.Value)) ||
                (a.OffreId.HasValue && a.Offre!.ServiceOffres.Any(so => mesServiceIds.Contains(so.ServiceId)))
            ))
            .Select(a => a.UserId)
            .Distinct()
            .ToListAsync();

        return await _ctx.ChatConversations
            .Include(c => c.Client)
            .Include(c => c.Messages)
            .Where(c =>
            c.Statut == nameof(Open) && (
            c.AssignedResponsableId == responsableId ||
            (c.AssignedResponsableId == null && mesClientIds.Contains(c.ClientId))
            )
            )
            .OrderByDescending(c => c.UpdatedAt)
            .Select(c => new ConversationSummaryDto
            {
                Id = c.Id,
                ClientId = c.ClientId,
                ClientName = c.Client.Username,
                ClientEmail = c.Client.Email,
                AssignedResponsableId = c.AssignedResponsableId,
                Statut = c.Statut,
                UpdatedAt = c.UpdatedAt,
                UnreadCount = c.Messages.Count(m => !m.IsRead && m.SenderType == nameof(Client)),
                LastMessage = c.Messages
                    .OrderByDescending(m => m.CreatedAt)
                    .Select(m => new LastMessageDto
                    {
                        Content = m.Content,
                        SenderType = m.SenderType,
                        CreatedAt = m.CreatedAt
                    })
                    .FirstOrDefault()
            })
            .ToListAsync();
    }

    public async Task<ServiceResult<ConversationSummaryDto>> GetOrCreateConversationForClientAsync(Guid clientId, Guid responsableId)
    {
        var client = await _ctx.Users.FirstOrDefaultAsync(u => u.Id == clientId);
        if (client == null)
            return ServiceResult<ConversationSummaryDto>.NotFound("Client introuvable.");

        // chercher conversation Open existante
        var convo = await _ctx.ChatConversations
            .Include(c => c.Messages)
            .FirstOrDefaultAsync(c => c.ClientId == clientId && c.Statut == nameof(Open) && (c.AssignedResponsableId == responsableId || c.AssignedResponsableId == null));

        if (convo == null)
        {
            convo = new ChatConversation
            {
                ClientId = clientId,
                AssignedResponsableId = responsableId,
                Statut = nameof(Open),
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _ctx.ChatConversations.Add(convo);
            await _ctx.SaveChangesAsync();
        }
        else
        {
            // si non assignée, on l’assigne au responsable qui l’ouvre depuis Archive
            if (!convo.AssignedResponsableId.HasValue)
            {
                convo.AssignedResponsableId = responsableId;
                convo.UpdatedAt = DateTime.UtcNow;
                await _ctx.SaveChangesAsync();
            }
        }

        var last = convo.Messages
            .OrderByDescending(m => m.CreatedAt)
            .Select(m => new LastMessageDto
            {
                Content = m.Content,
                SenderType = m.SenderType,
                CreatedAt = m.CreatedAt
            })
            .FirstOrDefault();

        return ServiceResult<ConversationSummaryDto>.Ok(new ConversationSummaryDto
        {
            Id = convo.Id,
            ClientId = convo.ClientId,
            ClientName = client.Username,
            ClientEmail = client.Email,
            AssignedResponsableId = convo.AssignedResponsableId,
            Statut = convo.Statut,
            UpdatedAt = convo.UpdatedAt,
            UnreadCount = convo.Messages.Count(m => !m.IsRead && m.SenderType == nameof(Client)),
            LastMessage = last
        });
    }

    public async Task<ServiceResult<List<ChatMessageDto>>> GetConversationMessagesAsync(
        Guid conversationId, Guid responsableId)
    {
        var convo = await _ctx.ChatConversations
            .Include(c => c.Messages.OrderBy(m => m.CreatedAt))
            .FirstOrDefaultAsync(c => c.Id == conversationId);

        if (convo == null)
            return ServiceResult<List<ChatMessageDto>>.NotFound("Conversation introuvable.");

        if (convo.AssignedResponsableId.HasValue && convo.AssignedResponsableId != responsableId)
            return ServiceResult<List<ChatMessageDto>>.Forbidden();

        if (!convo.AssignedResponsableId.HasValue &&
            !await ResponsableOwnsClientAsync(responsableId, convo.ClientId))
            return ServiceResult<List<ChatMessageDto>>.Forbidden();

        var messages = convo.Messages.Select(m => new ChatMessageDto
        {
            Id = m.Id,
            Content = m.Content,
            SenderType = m.SenderType,
            SenderUserId = m.SenderUserId,
            IsRead = m.IsRead,
            CreatedAt = m.CreatedAt
        }).ToList();

        foreach (var m in convo.Messages.Where(m => m.SenderType == nameof(Client) && !m.IsRead))
            m.IsRead = true;

        await _ctx.SaveChangesAsync();

        return ServiceResult<List<ChatMessageDto>>.Ok(messages);
    }

    public async Task<ServiceResult<SentMessageDto>> SendStaffMessageAsync(
        Guid conversationId, Guid senderId, string content)
    {
        using var tx = await _ctx.Database.BeginTransactionAsync();
        try
        {
            var convo = await _ctx.ChatConversations
                .FirstOrDefaultAsync(c => c.Id == conversationId);

            if (convo == null)
                return ServiceResult<SentMessageDto>.NotFound("Conversation introuvable.");

            if (convo.Statut != nameof(Open))
                return ServiceResult<SentMessageDto>.BadRequest("Conversation fermée.");

            if (convo.AssignedResponsableId == null)
            {
                if (!await ResponsableOwnsClientAsync(senderId, convo.ClientId))
                    return ServiceResult<SentMessageDto>.Forbidden();

                convo.AssignedResponsableId = senderId;
            }
            else if (convo.AssignedResponsableId != senderId)
                return ServiceResult<SentMessageDto>.Forbidden();

            var msg = new ChatMessage
            {
                ConversationId = convo.Id,
                SenderType = nameof(Responsable),
                SenderUserId = senderId,
                Content = content.Trim(),
                IsRead = false,
                CreatedAt = DateTime.UtcNow
            };

            convo.UpdatedAt = DateTime.UtcNow;
            _ctx.ChatMessages.Add(msg);
            await _ctx.SaveChangesAsync();
            await tx.CommitAsync();

            // ── SignalR hors transaction ──────────────────────────
            await _hub.Clients.Group($"chat_{convo.Id}")
                .SendAsync("ReceiveMessage", new
                {
                    id = msg.Id,
                    content = msg.Content,
                    senderType = msg.SenderType,
                    senderUserId = msg.SenderUserId,
                    createdAt = msg.CreatedAt,
                    isRead = msg.IsRead
                });

            await _hub.Clients.Group(convo.ClientId.ToString())
                .SendAsync("StaffReplied", new
                {
                    conversationId = convo.Id,
                    content = msg.Content,
                    createdAt = msg.CreatedAt
                });

            await _notifService.SendAsync(convo.ClientId,
                $"Nouveau message du support : \"{msg.Content[..Math.Min(msg.Content.Length, 60)]}\"", "info",
                "/dashboard/client/chat");

            return ServiceResult<SentMessageDto>.Ok(new SentMessageDto
            {
                Id = msg.Id,
                Content = msg.Content,
                CreatedAt = msg.CreatedAt
            });
        }
        catch
        {
            await tx.RollbackAsync();
            throw;
        }
    }

    public async Task<ServiceResult<bool>> CloseConversationAsync(Guid conversationId, Guid responsableId)
    {
        var convo = await _ctx.ChatConversations
            .Include(c => c.Messages)
            .FirstOrDefaultAsync(c => c.Id == conversationId);

        if (convo == null)
            return ServiceResult<bool>.NotFound("Conversation introuvable.");

        if (convo.AssignedResponsableId.HasValue && convo.AssignedResponsableId != responsableId)
            return ServiceResult<bool>.Forbidden();

        // ✅ si aucun message => supprimer la conversation
        if (convo.Messages.Count == 0)
        {
            _ctx.ChatConversations.Remove(convo);
            await _ctx.SaveChangesAsync();
            return ServiceResult<bool>.Ok(true);
        }

        convo.Statut = nameof(Closed);
        convo.UpdatedAt = DateTime.UtcNow;
        await _ctx.SaveChangesAsync();

        return ServiceResult<bool>.Ok(true);
    }
    public async Task<List<ResponsableInfoDto>> GetMyResponsablesAsync(Guid clientId)
    {
        var abonnements = await _ctx.Abonnements
            .Include(a => a.Service)
            .Include(a => a.Offre)
                .ThenInclude(o => o!.ServiceOffres)
                    .ThenInclude(so => so.Service)
            .Where(a => a.UserId == clientId && a.IsActive)
            .ToListAsync();

        var responsableAbonnements = new Dictionary<Guid, HashSet<string>>();

        foreach (var a in abonnements)
        {
            if (a.Service?.ResponsableId != null)
            {
                var id = a.Service.ResponsableId.Value;
                if (!responsableAbonnements.ContainsKey(id))
                    responsableAbonnements[id] = new HashSet<string>();
                responsableAbonnements[id].Add(a.Service.IntituleService);
            }

            if (a.Offre != null)
                foreach (var so in a.Offre.ServiceOffres)
                    if (so.Service?.ResponsableId != null)
                    {
                        var id = so.Service.ResponsableId.Value;
                        if (!responsableAbonnements.ContainsKey(id))
                            responsableAbonnements[id] = new HashSet<string>();
                        responsableAbonnements[id].Add(a.Offre.IntituleOffre);
                    }
        }

        var users = await _ctx.Users
            .Where(u => responsableAbonnements.Keys.Contains(u.Id) && u.IsActive)
            .ToListAsync();

        return users.Select(u => new ResponsableInfoDto
        {
            Id = u.Id,
            Username = u.Username,
            Email = u.Email,
            AbonnementsLies = responsableAbonnements.TryGetValue(u.Id, out var noms)
                ? noms.ToList()
                : new List<string>()
        }).ToList();
    }

    public async Task<ServiceResult<ConversationDto>> GetOrCreateConversationWithResponsableAsync(
        Guid clientId, Guid responsableId)
    {
        if (!await ResponsableOwnsClientAsync(responsableId, clientId))
            return ServiceResult<ConversationDto>.Forbidden();

        var convo = await _ctx.ChatConversations
            .FirstOrDefaultAsync(c =>
                c.ClientId == clientId &&
                c.AssignedResponsableId == responsableId &&
                c.Statut == nameof(Open));

        if (convo == null)
        {
            convo = new ChatConversation
            {
                ClientId = clientId,
                AssignedResponsableId = responsableId,
                Statut = nameof(Open),
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            _ctx.ChatConversations.Add(convo);
            await _ctx.SaveChangesAsync();
        }

        return ServiceResult<ConversationDto>.Ok(new ConversationDto
        {
            Id = convo.Id,
            ClientId = convo.ClientId,
            AssignedResponsableId = convo.AssignedResponsableId,
            Statut = convo.Statut,
            CreatedAt = convo.CreatedAt,
            UpdatedAt = convo.UpdatedAt
        });
    }

    public async Task<ServiceResult<List<ChatMessageDto>>> GetConversationMessagesForClientAsync(
        Guid conversationId, Guid clientId)
    {
        var convo = await _ctx.ChatConversations
            .Include(c => c.Messages.OrderBy(m => m.CreatedAt))
            .FirstOrDefaultAsync(c => c.Id == conversationId);

        if (convo == null)
            return ServiceResult<List<ChatMessageDto>>.NotFound("Conversation introuvable.");

        if (convo.ClientId != clientId)
            return ServiceResult<List<ChatMessageDto>>.Forbidden();

        var messages = convo.Messages.Select(m => new ChatMessageDto
        {
            Id = m.Id,
            Content = m.Content,
            SenderType = m.SenderType,
            SenderUserId = m.SenderUserId,
            IsRead = m.IsRead,
            CreatedAt = m.CreatedAt
        }).ToList();

        foreach (var m in convo.Messages.Where(m => m.SenderType == nameof(Responsable) && !m.IsRead))
            m.IsRead = true;

        await _ctx.SaveChangesAsync();

        return ServiceResult<List<ChatMessageDto>>.Ok(messages);
    }

    public async Task<ServiceResult<SentMessageDto>> SendClientMessageToConversationAsync(
        Guid conversationId, Guid clientId, string content)
    {
        using var tx = await _ctx.Database.BeginTransactionAsync();
        try
        {
            var convo = await _ctx.ChatConversations
                .FirstOrDefaultAsync(c => c.Id == conversationId);

            if (convo == null)
                return ServiceResult<SentMessageDto>.NotFound("Conversation introuvable.");

            if (convo.ClientId != clientId)
                return ServiceResult<SentMessageDto>.Forbidden();

            if (convo.Statut != nameof(Open))
                return ServiceResult<SentMessageDto>.BadRequest("Conversation fermée.");

            var msg = new ChatMessage
            {
                ConversationId = convo.Id,
                SenderType = nameof(Client),
                SenderUserId = clientId,
                Content = content.Trim(),
                IsRead = false,
                CreatedAt = DateTime.UtcNow
            };

            convo.UpdatedAt = DateTime.UtcNow;
            _ctx.ChatMessages.Add(msg);
            await _ctx.SaveChangesAsync();
            await tx.CommitAsync();

            await _hub.Clients.Group($"chat_{convo.Id}")
                .SendAsync("ReceiveMessage", new
                {
                    id = msg.Id,
                    content = msg.Content,
                    senderType = msg.SenderType,
                    senderUserId = msg.SenderUserId,
                    createdAt = msg.CreatedAt,
                    isRead = msg.IsRead
                });

            if (convo.AssignedResponsableId.HasValue)
                await NotifierResponsable(convo.AssignedResponsableId.Value, convo, msg);

            return ServiceResult<SentMessageDto>.Ok(new SentMessageDto
            {
                Id = msg.Id,
                Content = msg.Content,
                CreatedAt = msg.CreatedAt
            });
        }
        catch
        {
            await tx.RollbackAsync();
            throw;
        }
    }
}
