using AxiaAbonnement.Models.DTOs.Pdf;
using AxiaAbonnement.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace AxiaAbonnement.Controllers;

[ApiController]
[Route("api/pdf")]
[Authorize]
public class PdfExportController : ControllerBase
{
    private readonly IPdfExportService _pdfService;

    public PdfExportController(IPdfExportService pdfService)
    {
        _pdfService = pdfService;
    }

    [HttpPost("export")]
    public IActionResult Export([FromBody] PdfExportRequestDto dto)
    {
        var adminName = User.FindFirst(ClaimTypes.Name)?.Value ?? "Admin";
        var adminEmail = User.FindFirst(ClaimTypes.Email)?.Value ?? "";

        var bytes = _pdfService.GenerateSignedPdf(dto, adminName, adminEmail);
        var filename = $"{dto.Filename}_{DateTime.Now:yyyy-MM-dd}.pdf";
        return File(bytes, "application/pdf", filename);
    }
}
