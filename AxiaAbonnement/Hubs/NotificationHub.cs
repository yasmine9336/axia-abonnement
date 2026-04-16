using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace AxiaAbonnement.Hubs;

[Authorize]
public class NotificationHub(ILogger<NotificationHub> logger) : Hub
{
    private readonly ILogger<NotificationHub> _logger = logger;

    public override async Task OnConnectedAsync()
    {
        var userId = Context.UserIdentifier;
        _logger.LogInformation("Hub connected: userId={UserId}", userId);

        if (userId != null)
            await Groups.AddToGroupAsync(Context.ConnectionId, userId);

        await base.OnConnectedAsync();
    }

    public async Task JoinConversation(string conversationId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, $"chat_{conversationId}");
    }

    public async Task LeaveConversation(string conversationId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"chat_{conversationId}");
    }
}