using AxiaAbonnement.Data;
using AxiaAbonnement.Models.DTOs.Payment;
using AxiaAbonnement.Models.Entities;
using AxiaAbonnement.Services.Interfaces;
using Stripe;
using Stripe.Checkout;

namespace AxiaAbonnement.Services.Implementations
{
    public class PaymentService : IPaymentService
    {
        private readonly AppDbContext _ctx;
        private readonly IConfiguration _config;
        private readonly IEmailSender _emailSender;
        private readonly StripeClient _stripeClient;

        public PaymentService(AppDbContext ctx, IConfiguration config, IEmailSender emailSender)
        {
            _ctx = ctx;
            _config = config;
            _emailSender = emailSender;
            _stripeClient = new StripeClient(_config["Stripe:SecretKey"]);
        }

        public async Task<string?> CreateCheckoutSessionAsync(Guid userId, CreateSessionDto dto)
        {
            var user = await _ctx.Users.FindAsync(userId);
            var offre = await _ctx.Offres.FindAsync(dto.OffreId);

            if (offre == null || !offre.IsActive) return null;

            var montant = dto.Type == "annuel" ? offre.ParAnnee : offre.ParMois;

            var options = new SessionCreateOptions
            {
                PaymentMethodTypes = new List<string> { "card" },
                LineItems = new List<SessionLineItemOptions>
                {
                    new SessionLineItemOptions
                    {
                        PriceData = new SessionLineItemPriceDataOptions
                        {
                            Currency = "eur",
                            UnitAmount = (long)(montant * 100),
                            ProductData = new SessionLineItemPriceDataProductDataOptions
                            {
                                Name = offre.IntituleOffre,
                                Description = offre.Description,
                            },
                        },
                        Quantity = 1,
                    }
                },
                Mode = "payment",
                SuccessUrl = $"{_config["Frontend:Url"]}/payment/success?session_id={{CHECKOUT_SESSION_ID}}",
                CancelUrl = $"{_config["Frontend:Url"]}/payment/cancel",
                Metadata = new Dictionary<string, string>
                {
                    { "userId", userId.ToString() },
                    { "offreId", dto.OffreId.ToString() },
                    { "type", dto.Type }
                }
            };

            var service = new SessionService(_stripeClient);
            var session = await service.CreateAsync(options);
            return session.Url;
        }

        public async Task HandleWebhookAsync(string json, string stripeSignature, string webhookSecret)
        {

            var stripeEvent = EventUtility.ConstructEvent(
                json,
                stripeSignature,
                webhookSecret
            );

            if (stripeEvent.Type == EventTypes.CheckoutSessionCompleted)
            {
                var session = stripeEvent.Data.Object as Session;
                if (session == null) return;

                var userId = Guid.Parse(session.Metadata["userId"]);
                var offreId = Guid.Parse(session.Metadata["offreId"]);
                var type = session.Metadata["type"];

                var offre = await _ctx.Offres.FindAsync(offreId);
                var user = await _ctx.Users.FindAsync(userId);
                if (offre == null || user == null) return;

                var montant = type == "annuel" ? offre.ParAnnee : offre.ParMois;
                var dateFin = type == "annuel"
                    ? DateTime.UtcNow.AddYears(1)
                    : DateTime.UtcNow.AddMonths(1);

                var abonnement = new Abonnement
                {
                    UserId = userId,
                    OffreId = offreId,
                    Type = type,
                    Montant = montant,
                    DateFin = dateFin,
                    StripeSessionId = session.Id,
                    IsActive = true
                };
                _ctx.Abonnements.Add(abonnement);

                var paiement = new Paiement
                {
                    AbonnementId = abonnement.Id,
                    Montant = montant,
                    Statut = "completed",
                    StripePaymentIntentId = session.PaymentIntentId
                };
                _ctx.Paiements.Add(paiement);

                await _ctx.SaveChangesAsync();

                await _emailSender.SendEmailAsync(
                    user.Email!,
                    "Confirmation de votre abonnement - AxiaAbonnement",
                    $@"<h2>Bonjour {user.Username},</h2>
                    <p>Votre abonnement <strong>{offre.IntituleOffre}</strong> est maintenant actif.</p>
                    <p>Type : {type} | Montant : {montant} TND</p>
                    <p>Valable jusqu'au : {dateFin:dd/MM/yyyy}</p>
                    <p>Merci de votre confiance !</p>"
                );
            }
        }
    }
}