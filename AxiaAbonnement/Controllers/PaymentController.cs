using AxiaAbonnement.Models.DTOs.Payment;
using AxiaAbonnement.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace AxiaAbonnement.Controllers
{
    [ApiController]
    [Route("api/payment")]
    public class PaymentController(IPaymentService paymentService) : ControllerBase
    {
        private readonly IPaymentService _paymentService = paymentService;

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
            var paiements = await _paymentService.GetAllPaiementsAsync();
            return Ok(paiements);
        }

        [AllowAnonymous]
        [HttpPost("create-responsable-account-session")]
        public async Task<IActionResult> CreateResponsableAccountSession([FromBody] CreateResponsableAccountSessionDto dto)
        {
            var url = await _paymentService.CreateResponsableAccountSessionAsync(dto);
            if (url == null) return BadRequest("Utilisateur responsable introuvable ou non éligible.");
            return Ok(new { url });
        }
    }
}