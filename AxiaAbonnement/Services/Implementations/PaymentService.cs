using AxiaAbonnement.Data;
using AxiaAbonnement.Models.DTOs.Payment;
using AxiaAbonnement.Models.Entities;
using AxiaAbonnement.Models.Enums;
using AxiaAbonnement.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using Stripe;
using Stripe.Checkout;

namespace AxiaAbonnement.Services.Implementations
{
    public class PaymentService : IPaymentService
    {
        private const decimal ResponsableAccountFee = 500m;

        private readonly AppDbContext _ctx;
        private readonly IConfiguration _config;
        private readonly IEmailSender _emailSender;
        private readonly StripeClient _stripeClient;
        private readonly INotificationService _notifService;

        public PaymentService(
            AppDbContext ctx,
            IConfiguration config,
            IEmailSender emailSender,
            INotificationService notifService)
        {
            _ctx = ctx;
            _config = config;
            _emailSender = emailSender;
            _notifService = notifService;
            _stripeClient = new StripeClient(_config["Stripe:SecretKey"]);
        }

        public async Task<string?> CreateCheckoutSessionAsync(Guid userId, CreateSessionDto dto)
        {
            if (dto.OffreId == null && dto.ServiceId == null) return null;
            if (dto.OffreId != null && dto.ServiceId != null) return null;

            var user = await _ctx.Users.FindAsync(userId);
            if (user == null) return null;

            string productName;
            string productDescription;
            decimal montant;

            if (dto.OffreId != null)
            {
                var offre = await _ctx.Offres.FindAsync(dto.OffreId.Value);
                if (offre == null || !offre.IsActive) return null;

                productName = offre.IntituleOffre;
                productDescription = offre.Description;
                montant = dto.Type == "annuel" ? offre.ParAnnee : offre.ParMois;
            }
            else
            {
                var service = await _ctx.Services.FindAsync(dto.ServiceId!.Value);
                if (service == null || !service.IsActive) return null;

                productName = service.IntituleService;
                productDescription = service.Description;
                montant = dto.Type == "annuel" ? service.ParAnnee : service.ParMois;
            }

            var metadata = new Dictionary<string, string>
            {
                { "userId", userId.ToString() },
                { "type", dto.Type },
                { "paymentType", "subscription" }
            };

            if (dto.OffreId != null)
                metadata.Add("offreId", dto.OffreId.Value.ToString());
            else
                metadata.Add("serviceId", dto.ServiceId!.Value.ToString());

            var options = new SessionCreateOptions
            {
                PaymentMethodTypes = ["card"],
                LineItems =
                [
                    new SessionLineItemOptions
                    {
                        PriceData = new SessionLineItemPriceDataOptions
                        {
                            Currency = "eur",
                            UnitAmount = (long)(montant * 100),
                            ProductData = new SessionLineItemPriceDataProductDataOptions
                            {
                                Name = productName,
                                Description = productDescription
                            }
                        },
                        Quantity = 1
                    }
                ],
                Mode = "payment",
                SuccessUrl = $"{_config["Frontend:Url"]}/payment/success?session_id={{CHECKOUT_SESSION_ID}}",
                CancelUrl = $"{_config["Frontend:Url"]}/payment/cancel",
                Metadata = metadata
            };

            var sessionService = new SessionService(_stripeClient);
            var session = await sessionService.CreateAsync(options);
            return session.Url;
        }

        public async Task<string?> CreateResponsableAccountSessionAsync(CreateResponsableAccountSessionDto dto)
        {
            var user = await _ctx.Users.FindAsync(dto.UserId);

            if (user == null || user.Role != UserRole.Responsable) return null;

            var metadata = new Dictionary<string, string>
            {
                { "userId", user.Id.ToString() },
                { "paymentType", "responsable-account" }
            };

            var options = new SessionCreateOptions
            {
                PaymentMethodTypes = ["card"],
                LineItems =
                [
                    new SessionLineItemOptions
                    {
                        PriceData = new SessionLineItemPriceDataOptions
                        {
                            Currency = "eur",
                            UnitAmount = (long)(ResponsableAccountFee * 100),
                            ProductData = new SessionLineItemPriceDataProductDataOptions
                            {
                                Name = "Activation compte Responsable",
                                Description = "Paiement one-shot pour activer le compte responsable"
                            }
                        },
                        Quantity = 1
                    }
                ],
                Mode = "payment",
                SuccessUrl = $"{_config["Frontend:Url"]}/payment/responsable-account/success?session_id={{CHECKOUT_SESSION_ID}}",
                CancelUrl = $"{_config["Frontend:Url"]}/payment/responsable-account/cancel",
                Metadata = metadata
            };

            var sessionService = new SessionService(_stripeClient);
            var session = await sessionService.CreateAsync(options);
            return session.Url;
        }

        public async Task<string?> CreateRenewalCheckoutSessionAsync(Guid userId, Guid abonnementId)
        {
            var user = await _ctx.Users.FindAsync(userId);
            if (user == null) return null;

            var abonnement = await _ctx.Abonnements
                .Include(a => a.Offre)
                .Include(a => a.Service)
                .FirstOrDefaultAsync(a => a.Id == abonnementId && a.UserId == userId);
            if (abonnement == null) return null;

            var demandeAcceptee = await _ctx.DemandesRenouvellement
                .AnyAsync(d => d.AbonnementId == abonnementId && d.Statut == "acceptée");
            if (!demandeAcceptee) return null;

            var productName = abonnement.Offre?.IntituleOffre
                ?? abonnement.Service?.IntituleService
                ?? "Renouvellement abonnement";

            var options = new SessionCreateOptions
            {
                PaymentMethodTypes = ["card"],
                LineItems =
                [
                    new SessionLineItemOptions
            {
                PriceData = new SessionLineItemPriceDataOptions
                {
                    Currency = "eur",
                    UnitAmount = (long)(abonnement.Montant * 100),
                    ProductData = new SessionLineItemPriceDataProductDataOptions
                    {
                        Name = $"Renouvellement - {productName}",
                        Description = $"Renouvellement abonnement {abonnement.Type}"
                    }
                },
                Quantity = 1
            }
                ],
                Mode = "payment",
                SuccessUrl = $"{_config["Frontend:Url"]}/payment/success?session_id={{CHECKOUT_SESSION_ID}}",
                CancelUrl = $"{_config["Frontend:Url"]}/payment/cancel",
                Metadata = new Dictionary<string, string>
        {
            { "userId", userId.ToString() },
            { "abonnementId", abonnementId.ToString() },
            { "paymentType", "renewal" }
        }
            };

            var sessionService = new SessionService(_stripeClient);
            var session = await sessionService.CreateAsync(options);
            return session.Url;
        }

        public async Task HandleWebhookAsync(string json, string stripeSignature, string webhookSecret)
        {
            var stripeEvent = EventUtility.ConstructEvent(json, stripeSignature, webhookSecret);

            if (stripeEvent.Type != EventTypes.CheckoutSessionCompleted) return;
            if (stripeEvent.Data.Object is not Session session) return;

            var paymentType = session.Metadata.TryGetValue("paymentType", out var pType)
                ? pType
                : "subscription";

            if (paymentType == "responsable-account")
                await HandleResponsableAccountPaymentAsync(session);
            else if (paymentType == "renewal")
                await HandleRenewalPaymentAsync(session);
            else
                await HandleSubscriptionPaymentAsync(session);
        }

        private async Task HandleSubscriptionPaymentAsync(Session session)
        {
            if (!TryGetMetadataGuid(session, "userId", out var userId))
                return;

            if (!session.Metadata.TryGetValue("type", out var type) || string.IsNullOrWhiteSpace(type))
                return;

            var user = await _ctx.Users.FindAsync(userId);
            if (user == null) return;

            Guid? offreId = session.Metadata.TryGetValue("offreId", out var rawOffre)
                && Guid.TryParse(rawOffre, out var parsedOffreId)
                ? parsedOffreId
                : null;

            Guid? serviceId = session.Metadata.TryGetValue("serviceId", out var rawService)
                && Guid.TryParse(rawService, out var parsedServiceId)
                ? parsedServiceId
                : null;

            string productName;
            decimal montant;

            if (offreId != null)
            {
                var offre = await _ctx.Offres.FindAsync(offreId.Value);
                if (offre == null) return;
                productName = offre.IntituleOffre;
                montant = type == "annuel" ? offre.ParAnnee : offre.ParMois;
            }
            else if (serviceId != null)
            {
                var service = await _ctx.Services.FindAsync(serviceId.Value);
                if (service == null) return;
                productName = service.IntituleService;
                montant = type == "annuel" ? service.ParAnnee : service.ParMois;
            }
            else return;

            var dateDebut = DateTime.UtcNow;
            var dateFin = type == "annuel"
                ? dateDebut.AddYears(1)
                : dateDebut.AddMonths(1);

            var abonnement = new Abonnement
            {
                UserId = userId,
                OffreId = offreId,
                ServiceId = serviceId,
                Type = type,
                Montant = montant,
                DateDebut = dateDebut,
                DateFin = dateFin,
                StripeSessionId = session.Id,
                IsActive = true,
                Statut = StatutAbonnement.Actif
            };
            _ctx.Abonnements.Add(abonnement);

            var paiement = new Paiement
            {
                AbonnementId = abonnement.Id,
                UserId = userId,
                Montant = montant,
                Statut = "completed",
                StripePaymentIntentId = session.PaymentIntentId,
                PaymentType = "subscription"
            };
            _ctx.Paiements.Add(paiement);

            await _ctx.SaveChangesAsync();

            await _emailSender.SendEmailAsync(
                user.Email,
                "Confirmation de votre abonnement - AxiaAbonnement",
                $"<p>Bonjour {user.Username},</p>" +
                $"<p>Votre abonnement <strong>{productName}</strong> est maintenant actif.</p>" +
                $"<p>Type : {type} | Montant : {montant} TND</p>" +
                $"<p>Valable jusqu'au : {dateFin:dd/MM/yyyy}</p>"
            );

            await _notifService.SendAsync(
                user.Id,
                $"Votre abonnement \"{productName}\" est maintenant actif.",
                "success",
                "/dashboard/client/subscriptions");

            var responsableIds = new List<Guid>();

            if (serviceId != null)
            {
                var service = await _ctx.Services.FindAsync(serviceId.Value);
                if (service?.ResponsableId != null)
                    responsableIds.Add(service.ResponsableId.Value);
            }
            else if (offreId != null)
            {
                var serviceIds = await _ctx.ServiceOffres
                    .Where(so => so.OffreId == offreId)
                    .Select(so => so.ServiceId)
                    .ToListAsync();

                var respIds = await _ctx.Services
                    .Where(s => serviceIds.Contains(s.Id) && s.ResponsableId != null)
                    .Select(s => s.ResponsableId!.Value)
                    .Distinct()
                    .ToListAsync();

                responsableIds.AddRange(respIds);
            }

            foreach (var respId in responsableIds)
            {
                await _notifService.SendAsync(
                    respId,
                    $"Nouveau paiement : {user.Username} a souscrit à \"{productName}\"...",
                    "info",
                    "/dashboard/responsable/transactions");
            }
        }

        private async Task HandleRenewalPaymentAsync(Session session)
        {
            if (!TryGetMetadataGuid(session, "userId", out var userId)) return;
            if (!TryGetMetadataGuid(session, "abonnementId", out var abonnementId)) return;

            var user = await _ctx.Users.FindAsync(userId);
            if (user == null) return;

            var abonnement = await _ctx.Abonnements
                .Include(a => a.Offre)
                .Include(a => a.Service)
                .FirstOrDefaultAsync(a => a.Id == abonnementId);
            if (abonnement == null) return;

            var productName = abonnement.Offre?.IntituleOffre
                ?? abonnement.Service?.IntituleService
                ?? "Abonnement";

            abonnement.IsActive = true;
            abonnement.Statut = StatutAbonnement.Actif;
            abonnement.DateDebut = DateTime.UtcNow;
            abonnement.DateFin = abonnement.Type == "annuel"
                ? DateTime.UtcNow.AddYears(1)
                : DateTime.UtcNow.AddMonths(1);

            // Mettre à jour le paiement pending existant
            var paiementPending = await _ctx.Paiements
                .FirstOrDefaultAsync(p => p.AbonnementId == abonnementId
                                        && p.PaymentType == "renewal"
                                        && p.Statut == "pending");

            if (paiementPending != null)
            {
                paiementPending.Statut = "completed";
                paiementPending.StripePaymentIntentId = session.PaymentIntentId;
            }
            else
            {
                _ctx.Paiements.Add(new Paiement
                {
                    AbonnementId = abonnement.Id,
                    UserId = userId,
                    Montant = abonnement.Montant,
                    Statut = "completed",
                    StripePaymentIntentId = session.PaymentIntentId,
                    PaymentType = "renewal"
                });
            }

            await _ctx.SaveChangesAsync();

            await _notifService.SendAsync(
                userId,
                $"Votre abonnement \"{productName}\" a été renouvelé avec succès.",
                "success",
                "/dashboard/client/subscriptions"
            );

            var responsableIds = new List<Guid>();
            if (abonnement.ServiceId != null)
            {
                var service = await _ctx.Services.FindAsync(abonnement.ServiceId.Value);
                if (service?.ResponsableId != null)
                    responsableIds.Add(service.ResponsableId.Value);
            }
            else if (abonnement.OffreId != null)
            {
                var serviceIds = await _ctx.ServiceOffres
                    .Where(so => so.OffreId == abonnement.OffreId)
                    .Select(so => so.ServiceId)
                    .ToListAsync();
                var respIds = await _ctx.Services
                    .Where(s => serviceIds.Contains(s.Id) && s.ResponsableId != null)
                    .Select(s => s.ResponsableId!.Value)
                    .Distinct()
                    .ToListAsync();
                responsableIds.AddRange(respIds);
            }

            foreach (var respId in responsableIds)
            {
                await _notifService.SendAsync(
                    respId,
                    $"Renouvellement payé : {user.Username} a renouvelé \"{productName}\".",
                    "info",
                    "/dashboard/responsable/transactions"
                );
            }
        }

        private async Task HandleResponsableAccountPaymentAsync(Session session)
        {
            if (!TryGetMetadataGuid(session, "userId", out var userId))
                return;

            var user = await _ctx.Users.FindAsync(userId);

            if (user == null || user.Role != UserRole.Responsable) return;

            user.Statut = StatutCompte.Active;
            user.DatePaiementCompte = DateTime.UtcNow;
            user.IsActive = true;

            var paiement = new Paiement
            {
                UserId = userId,
                Montant = ResponsableAccountFee,
                Statut = "completed",
                StripePaymentIntentId = session.PaymentIntentId,
                PaymentType = "responsable-account"
            };
            _ctx.Paiements.Add(paiement);

            await _ctx.SaveChangesAsync();

            var admins = await _ctx.Users
                .Where(u => u.Role == UserRole.Admin && u.IsActive)
                .ToListAsync();

            foreach (var admin in admins)
            {
                await _notifService.SendAsync(
                    admin.Id,
                    $"Nouveau responsable actif : {user.Username}.",
                    "info",
                    "/dashboard/admin/responsables");
            }
        }

        public async Task<List<PaiementDto>> GetMyPaiementsAsync(Guid userId)
        {
            return await _ctx.Paiements
                .Include(p => p.Abonnement).ThenInclude(a => a!.Offre)
                .Include(p => p.Abonnement).ThenInclude(a => a!.Service)
                .Where(p => p.UserId == userId)
                .OrderByDescending(p => p.CreatedAt)
                .Select(p => new PaiementDto
                {
                    Id = p.Id,
                    Montant = p.Montant,
                    Statut = p.Statut,
                    CreatedAt = p.CreatedAt,
                    IntituleOffre = p.Abonnement != null && p.Abonnement.Offre != null
                        ? p.Abonnement.Offre.IntituleOffre
                        : p.Abonnement != null && p.Abonnement.Service != null
                            ? p.Abonnement.Service.IntituleService
                            : "Activation compte responsable",
                    TypeAbonnement = p.Abonnement != null
                        ? p.Abonnement.Type
                        : "responsable-account"
                })
                .ToListAsync();
        }

        public async Task<List<PaiementDto>> GetAllPaiementsAsync()
        {
            return await _ctx.Paiements
                .Include(p => p.Abonnement).ThenInclude(a => a!.Offre)
                .Include(p => p.Abonnement).ThenInclude(a => a!.Service)
                .Include(p => p.User)
                .OrderByDescending(p => p.CreatedAt)
                .Select(p => new PaiementDto
                {
                    Id = p.Id,
                    Montant = p.Montant,
                    Statut = p.Statut,
                    CreatedAt = p.CreatedAt,
                    IntituleOffre = p.Abonnement != null && p.Abonnement.Offre != null
                        ? p.Abonnement.Offre.IntituleOffre
                        : p.Abonnement != null && p.Abonnement.Service != null
                            ? p.Abonnement.Service.IntituleService
                            : "Activation compte responsable",
                    TypeAbonnement = p.Abonnement != null
                        ? p.Abonnement.Type
                        : "responsable-account",
                    ClientUsername = p.User.Username,
                    ClientEmail = p.User.Email
                })
                .ToListAsync();
        }

        public async Task<List<PaiementDto>> GetPaiementsByResponsableAsync(Guid responsableId)
        {
            var mesServiceIds = await _ctx.Services
                .Where(s => s.ResponsableId == responsableId)
                .Select(s => s.Id)
                .ToListAsync();

            var mesAbonnementIds = await _ctx.Abonnements
                .Where(a =>
                    (a.ServiceId.HasValue && mesServiceIds.Contains(a.ServiceId.Value)) ||
                    (a.OffreId.HasValue && a.Offre!.ServiceOffres.Any(so => mesServiceIds.Contains(so.ServiceId)))
                )
                .Select(a => a.Id)
                .ToListAsync();

            return await _ctx.Paiements
                .Include(p => p.Abonnement).ThenInclude(a => a!.Offre)
                .Include(p => p.Abonnement).ThenInclude(a => a!.Service)
                .Include(p => p.User)
                .Where(p => p.AbonnementId.HasValue && mesAbonnementIds.Contains(p.AbonnementId.Value))
                .OrderByDescending(p => p.CreatedAt)
                .Select(p => new PaiementDto
                {
                    Id = p.Id,
                    Montant = p.Montant,
                    Statut = p.Statut,
                    CreatedAt = p.CreatedAt,
                    IntituleOffre = p.Abonnement != null && p.Abonnement.Offre != null
                        ? p.Abonnement.Offre.IntituleOffre
                        : p.Abonnement != null && p.Abonnement.Service != null
                            ? p.Abonnement.Service.IntituleService
                            : "",
                    TypeAbonnement = p.Abonnement != null ? p.Abonnement.Type : "",
                    ClientUsername = p.User.Username,
                    ClientEmail = p.User.Email
                })
                .ToListAsync();
        }

        public async Task<PaiementDto?> GetMyPaiementByIdAsync(Guid userId, Guid paiementId)
        {
            return await _ctx.Paiements
                .Include(p => p.Abonnement).ThenInclude(a => a!.Offre)
                .Include(p => p.Abonnement).ThenInclude(a => a!.Service)
                .Include(p => p.User)
                .Where(p => p.Id == paiementId && p.UserId == userId)
                .Select(p => new PaiementDto
                {
                    Id = p.Id,
                    Montant = p.Montant,
                    Statut = p.Statut,
                    CreatedAt = p.CreatedAt,
                    IntituleOffre = p.Abonnement != null && p.Abonnement.Offre != null
                        ? p.Abonnement.Offre.IntituleOffre
                        : p.Abonnement != null && p.Abonnement.Service != null
                            ? p.Abonnement.Service.IntituleService
                            : "Activation compte responsable",
                    TypeAbonnement = p.Abonnement != null
                        ? p.Abonnement.Type
                        : "responsable-account",
                    ClientUsername = p.User.Username,
                    ClientEmail = p.User.Email
                })
                .FirstOrDefaultAsync();
        }

        private static bool TryGetMetadataGuid(Session session, string key, out Guid value)
        {
            value = Guid.Empty;
            return session.Metadata.TryGetValue(key, out var rawValue)
                && Guid.TryParse(rawValue, out value);
        }
    }
}