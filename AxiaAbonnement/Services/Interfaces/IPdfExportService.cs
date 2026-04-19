using AxiaAbonnement.Models.DTOs.Pdf;

namespace AxiaAbonnement.Services.Interfaces
{
    public interface IPdfExportService
    {
        byte[] GenerateSignedPdf(PdfExportRequestDto dto,
            string adminName, string adminEmail);
    }
}
