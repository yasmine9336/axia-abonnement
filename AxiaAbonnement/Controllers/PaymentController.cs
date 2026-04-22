using AxiaAbonnement.Models.DTOs.Payment;
using AxiaAbonnement.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace AxiaAbonnement.Controllers
{
    [ApiController]
    [Route("api/payment")]
    public class PaymentController : ControllerBase
    {
        private readonly IPaymentService _paymentService;
        private readonly IPdfExportService _pdfExportService;

        public PaymentController(IPaymentService paymentService, IPdfExportService pdfExportService)
        {
            _paymentService = paymentService;
            _pdfExportService = pdfExportService;
        }

        private Guid GetUserId() =>
            Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        [Authorize(Policy = "ClientOnly")]
        [HttpPost("create-checkout-session")]
        public async Task<IActionResult> CreateCheckoutSession([FromBody] CreateSessionDto dto)
        {
            var url = await _paymentService.CreateCheckoutSessionAsync(GetUserId(), dto);
            if (url == null) return BadRequest("Offre ou service invalide ou inactif.");
            return Ok(new { url });
        }

        [AllowAnonymous]
        [HttpPost("webhook")]
        public async Task<IActionResult> Webhook()
        {
            var json = await new StreamReader(HttpContext.Request.Body).ReadToEndAsync();
            var signature = Request.Headers["Stripe-Signature"].ToString();
            var webhookSecret = HttpContext.RequestServices
                .GetRequiredService<IConfiguration>()["Stripe:WebhookSecret"]!;

            try
            {
                await _paymentService.HandleWebhookAsync(json, signature, webhookSecret);
                return Ok();
            }
            catch (Exception e)
            {
                return BadRequest(e.Message);
            }
        }

        [HttpGet("history")]
        [Authorize(Policy = "ClientOnly")]
        public async Task<IActionResult> GetMyPaiements()
        {
            var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var paiements = await _paymentService.GetMyPaiementsAsync(userId);
            return Ok(paiements);
        }

        [HttpGet("history/all")]
        [Authorize(Policy = "StaffOnly")]
        public async Task<IActionResult> GetAllPaiements()
        {
            var role = User.FindFirstValue(ClaimTypes.Role);

            if (role == "Responsable")
            {
                var paiements = await _paymentService.GetPaiementsByResponsableAsync(GetUserId());
                return Ok(paiements);
            }

            var all = await _paymentService.GetAllPaiementsAsync();
            return Ok(all);
        }

        [AllowAnonymous]
        [HttpPost("create-responsable-account-session")]
        public async Task<IActionResult> CreateResponsableAccountSession([FromBody] CreateResponsableAccountSessionDto dto)
        {
            if (dto.UserId == Guid.Empty)
                return BadRequest("UserId invalide.");

            var url = await _paymentService.CreateResponsableAccountSessionAsync(dto);
            if (url == null) return BadRequest("Utilisateur responsable introuvable ou non éligible.");
            return Ok(new { url });
        }

        [HttpGet("history/{paymentId:guid}/receipt")]
        [Authorize(Policy = "ClientOnly")]
        public async Task<IActionResult> DownloadReceipt(Guid paymentId)
        {
            var paiement = await _paymentService.GetMyPaiementByIdAsync(GetUserId(), paymentId);
            if (paiement == null)
                return NotFound("Paiement introuvable.");

            if (!string.Equals(paiement.Statut, "completed", StringComparison.OrdinalIgnoreCase))
                return BadRequest("Le reçu est disponible uniquement pour un paiement complété.");

            var clientName = User.FindFirstValue(ClaimTypes.Name) ?? paiement.ClientUsername ?? "Client";
            var clientEmail = User.FindFirstValue(ClaimTypes.Email) ?? paiement.ClientEmail ?? "";

            var bytes = _pdfExportService.GeneratePaymentReceiptPdf(paiement, clientName, clientEmail);

            var safeName = string.IsNullOrWhiteSpace(paiement.IntituleOffre)
                ? "recu_paiement"
                : $"recu_{paiement.IntituleOffre.Replace(" ", "_")}";

            var fileName = $"{safeName}_{paiement.CreatedAt:yyyy-MM-dd}.pdf";

            return File(bytes, "application/pdf", fileName);
        }
    }
}