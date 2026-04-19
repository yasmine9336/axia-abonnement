namespace AxiaAbonnement.Models.DTOs.Pdf
{
    public class PdfExportRequestDto
    {
        public string Title { get; set; } = string.Empty;
        public string Filename { get; set; } = string.Empty;
        public List<string> Columns { get; set; } = [];
        public List<List<string>> Rows { get; set; } = [];
    }
}