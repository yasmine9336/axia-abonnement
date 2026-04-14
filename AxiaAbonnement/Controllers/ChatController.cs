using AxiaAbonnement.Data;
using AxiaAbonnement.Hubs;
using AxiaAbonnement.Models.Entities;
using AxiaAbonnement.Models.Enums;
using AxiaAbonnement.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace AxiaAbonnement.Controllers
{
    [ApiController]
    [Route("api/chat")]
    [Authorize]
    public class ChatController : ControllerBase
    {
        private readonly AppDbContext _ctx;
        private readonly IHubContext<NotificationHub> _hub;
        private readonly INotificationService _notifService;

        public ChatController(AppDbContext ctx, IHubContext<NotificationHub> hub, INotificationService notifService)
        {
            _ctx = ctx;
            _hub = hub;
            _notifService = notifService;
        }

        private Guid GetUserId() =>
            Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        public class SendMessageDto
        {
            public string Content { get; set; } = string.Empty;
        }

        // ✅ Helper — notifier un responsable (temps réel + persistant)
        private async Task NotifierResponsable(Guid respId, ChatConversation conv, ChatMessage msg)
        {
            await _hub.Clients
                .Group(respId.ToString())
                .SendAsync("NewConversationMessage", new
                {
                    conversationId = conv.Id,
                    clientId = conv.ClientId,
                    content = msg.Content,
                    createdAt = msg.CreatedAt
                });

            await _notifService.SendAsync(
                respId,
                $"Nouveau message : \"{msg.Content[..Math.Min(msg.Content.Length, 60)]}\"",
                "info"
            );
        }

        // ===========================
        // CLIENT
        // ===========================

        [HttpGet("me")]
        [Authorize(Policy = "ClientOnly")]
        public async Task<IActionResult> GetOrCreateMyConversation()
        {
            var userId = GetUserId();

            var convo = await _ctx.ChatConversations
                .FirstOrDefaultAsync(c => c.ClientId == userId && c.Statut == "Open");

            if (convo == null)
            {
                convo = new ChatConversation
                {
                    ClientId = userId,
                    Statut = "Open",
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };
                _ctx.ChatConversations.Add(convo);
                await _ctx.SaveChangesAsync();
            }

            return Ok(new
            {
                convo.Id,
                convo.ClientId,
                convo.AssignedResponsableId,
                convo.Statut,
                convo.CreatedAt,
                convo.UpdatedAt
            });
        }

        [HttpGet("me/messages")]
        [Authorize(Policy = "ClientOnly")]
        public async Task<IActionResult> GetMyMessages()
        {
            var userId = GetUserId();

            var convo = await _ctx.ChatConversations
                .Include(c => c.Messages.OrderBy(m => m.CreatedAt))
                .FirstOrDefaultAsync(c => c.ClientId == userId && c.Statut == "Open");

            if (convo == null) return Ok(new List<object>());

            return Ok(convo.Messages.Select(m => new
            {
                m.Id,
                m.Content,
                m.SenderType,
                m.SenderUserId,
                m.IsRead,
                m.CreatedAt
            }));
        }

        [HttpPost("me/messages")]
        [Authorize(Policy = "ClientOnly")]
        public async Task<IActionResult> SendMyMessage([FromBody] SendMessageDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Content))
                return BadRequest("Message vide.");

            var userId = GetUserId();

            var convo = await _ctx.ChatConversations
                .FirstOrDefaultAsync(c => c.ClientId == userId && c.Statut == "Open");

            if (convo == null)
            {
                convo = new ChatConversation
                {
                    ClientId = userId,
                    Statut = "Open",
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };
                _ctx.ChatConversations.Add(convo);
                await _ctx.SaveChangesAsync();
            }

            var msg = new ChatMessage
            {
                ConversationId = convo.Id,
                SenderType = "Client",
                SenderUserId = userId,
                Content = dto.Content.Trim(),
                IsRead = false,
                CreatedAt = DateTime.UtcNow
            };

            convo.UpdatedAt = DateTime.UtcNow;
            _ctx.ChatMessages.Add(msg);
            await _ctx.SaveChangesAsync();

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

            // ── Routing intelligent ──────────────────────────────────────
            if (convo.AssignedResponsableId.HasValue)
            {
                await NotifierResponsable(convo.AssignedResponsableId.Value, convo, msg);
                return Ok(new { msg.Id, msg.Content, msg.CreatedAt });
            }

            var abonnements = await _ctx.Abonnements
                .Include(a => a.Service)
                .Include(a => a.Offre)
                    .ThenInclude(o => o!.ServiceOffres)
                        .ThenInclude(so => so.Service)
                .Where(a => a.UserId == userId && a.IsActive)
                .ToListAsync();

            var serviceResponsableMap = new Dictionary<string, Guid>(StringComparer.OrdinalIgnoreCase);

            foreach (var ab in abonnements)
            {
                if (ab.Service?.ResponsableId != null)
                    serviceResponsableMap.TryAdd(ab.Service.IntituleService.ToLower(), ab.Service.ResponsableId.Value);

                if (ab.Offre != null)
                    foreach (var so in ab.Offre.ServiceOffres)
                        if (so.Service?.ResponsableId != null)
                            serviceResponsableMap.TryAdd(so.Service.IntituleService.ToLower(), so.Service.ResponsableId.Value);
            }

            var contentLower = dto.Content.ToLower();
            var matchedEntry = serviceResponsableMap.FirstOrDefault(kv => contentLower.Contains(kv.Key));

            if (matchedEntry.Key != null)
            {
                convo.AssignedResponsableId = matchedEntry.Value;
                await _ctx.SaveChangesAsync();
                await NotifierResponsable(matchedEntry.Value, convo, msg);
            }
            else
            {
                var responsableIds = serviceResponsableMap.Values.Distinct().ToList();

                // ✅ Si aucun responsable trouvé → notifier tous les responsables actifs
                if (!responsableIds.Any())
                {
                    responsableIds = await _ctx.Users
                        .Where(u => u.Role == UserRole.Responsable && u.IsActive)
                        .Select(u => u.Id)
                        .ToListAsync();
                }

                foreach (var respId in responsableIds)
                    await NotifierResponsable(respId, convo, msg);
            }

            return Ok(new { msg.Id, msg.Content, msg.CreatedAt });
        }

        // ===========================
        // RESPONSABLE UNIQUEMENT
        // ===========================

        [HttpGet("conversations")]
        [Authorize(Policy = "ResponsableOnly")]
        public async Task<IActionResult> GetConversations()
        {
            var responsableId = GetUserId();

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

            var convos = await _ctx.ChatConversations
                .Include(c => c.Client)
                .Include(c => c.Messages)
                .Where(c =>
                    c.AssignedResponsableId == responsableId ||
                    (c.AssignedResponsableId == null && mesClientIds.Contains(c.ClientId))
                )
                .OrderByDescending(c => c.UpdatedAt)
                .Select(c => new
                {
                    c.Id,
                    c.ClientId,
                    ClientName = c.Client.Username,
                    ClientEmail = c.Client.Email,
                    c.AssignedResponsableId,
                    c.Statut,
                    c.UpdatedAt,
                    UnreadCount = c.Messages.Count(m => !m.IsRead && m.SenderType == "Client"),
                    LastMessage = c.Messages
                        .OrderByDescending(m => m.CreatedAt)
                        .Select(m => new { m.Content, m.SenderType, m.CreatedAt })
                        .FirstOrDefault()
                })
                .ToListAsync();

            return Ok(convos);
        }

        [HttpGet("conversations/{conversationId:guid}/messages")]
        [Authorize(Policy = "ResponsableOnly")]
        public async Task<IActionResult> GetConversationMessages(Guid conversationId)
        {
            var responsableId = GetUserId();

            var convo = await _ctx.ChatConversations
                .Include(c => c.Messages.OrderBy(m => m.CreatedAt))
                .FirstOrDefaultAsync(c => c.Id == conversationId);

            if (convo == null) return NotFound("Conversation introuvable.");

            if (convo.AssignedResponsableId.HasValue && convo.AssignedResponsableId != responsableId)
                return Forbid();

            var messages = convo.Messages.Select(m => new
            {
                m.Id,
                m.Content,
                m.SenderType,
                m.SenderUserId,
                m.IsRead,
                m.CreatedAt
            }).ToList();

            foreach (var m in convo.Messages.Where(m => m.SenderType == "Client" && !m.IsRead))
                m.IsRead = true;

            await _ctx.SaveChangesAsync();

            return Ok(messages);
        }

        [HttpPost("conversations/{conversationId:guid}/messages")]
        [Authorize(Policy = "ResponsableOnly")]
        public async Task<IActionResult> SendStaffMessage(Guid conversationId, [FromBody] SendMessageDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Content))
                return BadRequest("Message vide.");

            var convo = await _ctx.ChatConversations
                .FirstOrDefaultAsync(c => c.Id == conversationId);

            if (convo == null) return NotFound("Conversation introuvable.");
            if (convo.Statut != "Open") return BadRequest("Conversation fermée.");

            var senderId = GetUserId();

            if (convo.AssignedResponsableId == null)
                convo.AssignedResponsableId = senderId;
            else if (convo.AssignedResponsableId != senderId)
                return Forbid();

            var msg = new ChatMessage
            {
                ConversationId = convo.Id,
                SenderType = "Responsable",
                SenderUserId = senderId,
                Content = dto.Content.Trim(),
                IsRead = false,
                CreatedAt = DateTime.UtcNow
            };

            convo.UpdatedAt = DateTime.UtcNow;
            _ctx.ChatMessages.Add(msg);
            await _ctx.SaveChangesAsync();

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

            // ✅ Notifier le client — temps réel + persistant
            await _hub.Clients.Group(convo.ClientId.ToString())
                .SendAsync("StaffReplied", new
                {
                    conversationId = convo.Id,
                    content = msg.Content,
                    createdAt = msg.CreatedAt
                });

            await _notifService.SendAsync(
                convo.ClientId,
                $"Nouveau message du support : \"{msg.Content[..Math.Min(msg.Content.Length, 60)]}\"",
                "info"
            );

            return Ok(new { msg.Id, msg.Content, msg.CreatedAt });
        }

        [HttpPost("conversations/{conversationId:guid}/close")]
        [Authorize(Policy = "ResponsableOnly")]
        public async Task<IActionResult> CloseConversation(Guid conversationId)
        {
            var responsableId = GetUserId();

            var convo = await _ctx.ChatConversations
                .FirstOrDefaultAsync(c => c.Id == conversationId);

            if (convo == null) return NotFound("Conversation introuvable.");

            if (convo.AssignedResponsableId.HasValue && convo.AssignedResponsableId != responsableId)
                return Forbid();

            convo.Statut = "Closed";
            convo.UpdatedAt = DateTime.UtcNow;
            await _ctx.SaveChangesAsync();

            return Ok(new { message = "Conversation fermée." });
        }
    }
}