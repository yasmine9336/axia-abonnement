using AxiaAbonnement.Data;
using AxiaAbonnement.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace AxiaAbonnement.Services.BackgroundServices
{
    public class RenewalPaymentExpiryService : BackgroundService
    {
        private readonly IServiceScopeFactory _scopeFactory;

        public RenewalPaymentExpiryService(IServiceScopeFactory scopeFactory)
        {
            _scopeFactory = scopeFactory;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                await ExpireOldPendingPayments();
                await Task.Delay(TimeSpan.FromHours(1), stoppingToken);
            }
        }

        private async Task ExpireOldPendingPayments()
        {
            using var scope = _scopeFactory.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            var notifService = scope.ServiceProvider.GetRequiredService<INotificationService>();

            var limite = DateTime.UtcNow.AddDays(-7);

            var paiements = await db.Paiements
                .Include(p => p.Abonnement).ThenInclude(a => a!.Service)
                .Include(p => p.Abonnement).ThenInclude(a => a!.Offre)
                .Where(p => p.Statut == "pending" && p.PaymentType == "renewal")
                .ToListAsync();

            foreach (var paiement in paiements)
            {
                var delaiDepasse = paiement.CreatedAt < limite;

                var serviceInactif =
                    (paiement.Abonnement?.ServiceId != null && !(paiement.Abonnement.Service?.IsActive ?? true)) ||
                    (paiement.Abonnement?.OffreId != null && !(paiement.Abonnement.Offre?.IsActive ?? true));

                if (!delaiDepasse && !serviceInactif) continue;

                paiement.Statut = "expiré";

                var demande = await db.DemandesRenouvellement
                    .Where(d => d.AbonnementId == paiement.AbonnementId && d.Statut == "acceptée")
                    .OrderByDescending(d => d.CreatedAt)
                    .FirstOrDefaultAsync();
                if (demande != null)
                    demande.Statut = "expirée";

                var message = serviceInactif
                    ? "Le renouvellement de votre abonnement n'est plus possible car ce service n'est plus disponible."
                    : "Le délai de paiement pour votre renouvellement a expiré. Veuillez soumettre une nouvelle demande.";

                await notifService.SendAsync(
                    paiement.UserId,
                    message,
                    "warning",
                    "/dashboard/client/subscriptions"
                );
            }

            await db.SaveChangesAsync();
        }
    }
}