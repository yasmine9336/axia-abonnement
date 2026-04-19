using System.Security.Claims;
using AxiaAbonnement.Models.DTOs.Signature;
using AxiaAbonnement.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AxiaAbonnement.Controllers
{
    [ApiController]
    [Route("api/signature")]
    public class SignatureController : ControllerBase
    {
        private readonly ISignatureService _signature;

        public SignatureController(ISignatureService signature)
            => _signature = signature;

        [HttpPost("sign")]
        [Authorize(Roles = "Admin")]
        public IActionResult Sign([FromBody] SignRequestDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Hash))
                return BadRequest(new { Message = "Hash requis." });

            var adminId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "";
            var adminName = User.FindFirst(ClaimTypes.Name)?.Value ?? "";
            var adminEmail = User.FindFirst(ClaimTypes.Email)?.Value ?? "";

            var result = _signature.Sign(
                dto.Hash, dto.DocumentTitle ?? "",
                adminId, adminName, adminEmail);

            return Ok(result);
        }

        [HttpPost("verify")]
        [AllowAnonymous]
        public IActionResult Verify([FromBody] VerifyRequestDto dto)
        {
            var valid = _signature.Verify(
                dto.Hash, dto.Signature, dto.AdminId,
                dto.Timestamp, dto.DocumentTitle);

            return Ok(new VerifyResponseDto
            {
                Valid = valid,
                Message = valid
                    ? "Signature valide — document authentique."
                    : "Signature invalide ou document altéré."
            });
        }

        [HttpGet("public-key")]
        [AllowAnonymous]
        public IActionResult PublicKey()
            => Ok(new { publicKey = _signature.GetPublicKeyPem() });
    }
}
