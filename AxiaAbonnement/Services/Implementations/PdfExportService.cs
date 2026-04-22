using AxiaAbonnement.Models.DTOs.Payment;
using AxiaAbonnement.Models.DTOs.Pdf;
using AxiaAbonnement.Services.Interfaces;
using iText.Bouncycastle.Cert;
using iText.Bouncycastle.Crypto;
using iText.Bouncycastle.X509;
using iText.Forms.Fields.Properties;
using iText.Forms.Form.Element;
using iText.Kernel.Colors;
using iText.Kernel.Crypto;
using iText.Kernel.Font;
using iText.Kernel.Geom;
using iText.Kernel.Pdf;
using iText.Layout;
using iText.Layout.Borders;
using iText.Layout.Element;
using iText.Layout.Properties;
using iText.Signatures;
using Org.BouncyCastle.Pkcs;
using System.Security.Cryptography;
using System.Security.Cryptography.X509Certificates;

namespace AxiaAbonnement.Services.Implementations;

public class PdfExportService : IPdfExportService
{
    private readonly string _pfxPath;
    private readonly string _pfxPassword = "AxiaSign2025!";

    public PdfExportService(IWebHostEnvironment env)
    {
        _pfxPath = System.IO.Path.Combine(env.ContentRootPath, "axia_signature.pfx");
        EnsureCertificate();
    }

    private void EnsureCertificate()
    {
        if (File.Exists(_pfxPath)) return;

        using var rsa = RSA.Create(2048);
        var req = new CertificateRequest(
            "CN=Axia Signature, O=Axia, C=TN",
            rsa,
            HashAlgorithmName.SHA256,
            RSASignaturePadding.Pkcs1);

        req.CertificateExtensions.Add(
            new X509BasicConstraintsExtension(false, false, 0, false));
        req.CertificateExtensions.Add(
            new X509KeyUsageExtension(X509KeyUsageFlags.DigitalSignature, true));

        var cert = req.CreateSelfSigned(
            DateTimeOffset.UtcNow.AddDays(-1),
            DateTimeOffset.UtcNow.AddYears(10));

        File.WriteAllBytes(_pfxPath, cert.Export(X509ContentType.Pfx, _pfxPassword));
    }

    public byte[] GenerateSignedPdf(PdfExportRequestDto dto, string adminName, string adminEmail)
    {
        var unsigned = BuildPdf(dto, adminName, adminEmail);
        return SignPdf(unsigned, dto.Title, adminEmail);
    }

    public byte[] GeneratePaymentReceiptPdf(PaiementDto dto, string clientName, string clientEmail)
    {
        var unsigned = BuildPaymentReceiptPdf(dto, clientName, clientEmail);
        return SignPdf(unsigned, "Reçu de paiement", clientEmail);
    }

    private byte[] BuildPdf(PdfExportRequestDto dto, string adminName, string adminEmail)
    {
        using var ms = new MemoryStream();
        var writer = new PdfWriter(ms);
        var pdfDoc = new PdfDocument(writer);
        var document = new Document(pdfDoc, PageSize.A4.Rotate());
        document.SetMargins(20, 20, 20, 20);

        var boldFont = PdfFontFactory.CreateFont(iText.IO.Font.Constants.StandardFonts.HELVETICA_BOLD);
        var normalFont = PdfFontFactory.CreateFont(iText.IO.Font.Constants.StandardFonts.HELVETICA);
        var headerColor = new DeviceRgb(79, 70, 229);
        var white = ColorConstants.WHITE;
        var lightGray = new DeviceRgb(249, 250, 251);

        document.Add(new Paragraph(dto.Title)
            .SetFont(boldFont)
            .SetFontSize(16)
            .SetFontColor(new DeviceRgb(17, 24, 39))
            .SetMarginBottom(4));

        var now = DateTime.Now.ToString("dd/MM/yyyy HH:mm");
        document.Add(new Paragraph($"Exporté le {now} par {adminName} ({adminEmail})")
            .SetFont(normalFont)
            .SetFontSize(9)
            .SetFontColor(new DeviceRgb(107, 114, 128))
            .SetMarginBottom(12));

        var table = new Table(UnitValue.CreatePercentArray(
            Enumerable.Repeat(1f, dto.Columns.Count).ToArray()))
            .UseAllAvailableWidth();

        foreach (var col in dto.Columns)
        {
            table.AddHeaderCell(new Cell()
                .SetBackgroundColor(headerColor)
                .Add(new Paragraph(col)
                    .SetFont(boldFont)
                    .SetFontSize(9)
                    .SetFontColor(white)));
        }

        for (int i = 0; i < dto.Rows.Count; i++)
        {
            var bg = i % 2 == 0 ? white : lightGray;
            foreach (var cell in dto.Rows[i])
            {
                table.AddCell(new Cell()
                    .SetBackgroundColor(bg)
                    .Add(new Paragraph(cell ?? "")
                        .SetFont(normalFont)
                        .SetFontSize(8)));
            }
        }

        document.Add(table);
        document.Close();
        return ms.ToArray();
    }

    private byte[] BuildPaymentReceiptPdf(PaiementDto dto, string clientName, string clientEmail)
    {
        using var ms = new MemoryStream();
        var writer = new PdfWriter(ms);
        var pdfDoc = new PdfDocument(writer);
        var document = new Document(pdfDoc, PageSize.A4);
        document.SetMargins(28, 28, 28, 28);

        var boldFont = PdfFontFactory.CreateFont(iText.IO.Font.Constants.StandardFonts.HELVETICA_BOLD);
        var normalFont = PdfFontFactory.CreateFont(iText.IO.Font.Constants.StandardFonts.HELVETICA);

        var primary = new DeviceRgb(79, 70, 229);
        var dark = new DeviceRgb(17, 24, 39);
        var gray = new DeviceRgb(107, 114, 128);
        var light = new DeviceRgb(249, 250, 251);
        var border = new DeviceRgb(229, 231, 235);
        var successBg = new DeviceRgb(220, 252, 231);
        var successText = new DeviceRgb(21, 128, 61);

        var statusText = dto.Statut?.ToLower() switch
        {
            "completed" => "Complété",
            "pending" => "En cours",
            "failed" => "Échoué",
            _ => dto.Statut ?? "-"
        };

        var periodText = dto.TypeAbonnement?.ToLower() switch
        {
            "mensuel" => "Mensuel",
            "annuel" => "Annuel",
            "responsable-account" => "Activation compte",
            _ => dto.TypeAbonnement ?? "-"
        };

        var paymentDate = dto.CreatedAt.ToLocalTime().ToString("dd/MM/yyyy HH:mm");
        var receiptRef = dto.Id.ToString()[..8].ToUpper();

        // Header
        document.Add(new Paragraph("AxiaAbonnement")
            .SetFont(boldFont)
            .SetFontSize(18)
            .SetFontColor(primary)
            .SetMarginBottom(2));

        document.Add(new Paragraph("Reçu de paiement")
            .SetFont(boldFont)
            .SetFontSize(22)
            .SetFontColor(dark)
            .SetMarginBottom(6));

        document.Add(new Paragraph($"Émis le {DateTime.Now:dd/MM/yyyy à HH:mm}")
            .SetFont(normalFont)
            .SetFontSize(10)
            .SetFontColor(gray)
            .SetMarginBottom(14));

        var topStatus = new Table(UnitValue.CreatePercentArray(new float[] { 1, 1 }))
            .UseAllAvailableWidth();

        topStatus.AddCell(new Cell().SetBorder(Border.NO_BORDER));
        topStatus.AddCell(
            new Cell()
                .SetBorder(Border.NO_BORDER)
                .SetTextAlignment(TextAlignment.RIGHT)
                .Add(new Paragraph(statusText)
                    .SetFont(boldFont)
                    .SetFontSize(10)
                    .SetFontColor(successText)
                    .SetBackgroundColor(successBg)
                    .SetPaddingTop(6)
                    .SetPaddingBottom(6)
                    .SetPaddingLeft(12)
                    .SetPaddingRight(12))
        );

        document.Add(topStatus);
        document.Add(new Paragraph("").SetMarginBottom(8));

        // Client + infos reçu
        var infoTable = new Table(UnitValue.CreatePercentArray(new float[] { 1.4f, 1f }))
            .UseAllAvailableWidth();

        infoTable.AddCell(BuildInfoBlock(
            "Client",
            new[]
            {
                string.IsNullOrWhiteSpace(clientName) ? "Client" : clientName,
                string.IsNullOrWhiteSpace(clientEmail) ? "-" : clientEmail
            },
            boldFont, normalFont, dark, gray, border, light));

        infoTable.AddCell(BuildInfoBlock(
            "Informations du reçu",
            new[]
            {
                $"Reçu N° : {receiptRef}",
                $"Date du paiement : {paymentDate}"
            },
            boldFont, normalFont, dark, gray, border, light));

        document.Add(infoTable);
        document.Add(new Paragraph("").SetMarginBottom(12));

        // Détails
        document.Add(new Paragraph("Détails du paiement")
            .SetFont(boldFont)
            .SetFontSize(14)
            .SetFontColor(dark)
            .SetMarginBottom(8));

        var details = new Table(UnitValue.CreatePercentArray(new float[] { 1f, 2f }))
            .UseAllAvailableWidth();

        details.AddCell(DetailLabel("Service / Offre", boldFont, gray, border));
        details.AddCell(DetailValue(dto.IntituleOffre, normalFont, dark, border));

        details.AddCell(DetailLabel("Période", boldFont, gray, border));
        details.AddCell(DetailValue(periodText, normalFont, dark, border));

        details.AddCell(DetailLabel("Montant payé", boldFont, gray, border));
        details.AddCell(DetailValue($"{dto.Montant:0.00} TND", normalFont, dark, border));

        details.AddCell(DetailLabel("Statut", boldFont, gray, border));
        details.AddCell(DetailValue(statusText, normalFont, dark, border));

        details.AddCell(DetailLabel("Référence transaction", boldFont, gray, border));
        details.AddCell(DetailValue(dto.Id.ToString(), normalFont, dark, border));

        document.Add(details);
        document.Add(new Paragraph("").SetMarginBottom(14));

        // Résumé
        var totalBox = new Div()
            .SetBackgroundColor(light)
            .SetBorder(new SolidBorder(border, 1))
            .SetPadding(16);

        totalBox.Add(new Paragraph("Résumé")
            .SetFont(boldFont)
            .SetFontSize(14)
            .SetFontColor(dark)
            .SetMarginBottom(4));

        totalBox.Add(new Paragraph("Votre paiement a bien été enregistré.")
            .SetFont(normalFont)
            .SetFontSize(10)
            .SetFontColor(dark)
            .SetMarginBottom(2));

        totalBox.Add(new Paragraph("Conservez ce document comme justificatif.")
            .SetFont(normalFont)
            .SetFontSize(10)
            .SetFontColor(gray)
            .SetMarginBottom(10));

        totalBox.Add(new Paragraph($"TOTAL PAYÉ : {dto.Montant:0.00} TND")
            .SetFont(boldFont)
            .SetFontSize(20)
            .SetFontColor(primary));

        document.Add(totalBox);

        document.Add(new Paragraph("Ce document est généré automatiquement par AxiaAbonnement et sert de justificatif de paiement.")
            .SetFont(normalFont)
            .SetFontSize(9)
            .SetFontColor(gray)
            .SetMarginTop(16));

        document.Close();
        return ms.ToArray();
    }

    private static Cell BuildInfoBlock(
        string title,
        string[] lines,
        PdfFont boldFont,
        PdfFont normalFont,
        Color dark,
        Color gray,
        Color border,
        Color bg)
    {
        var cell = new Cell()
            .SetBackgroundColor(bg)
            .SetBorder(new SolidBorder(border, 1))
            .SetPadding(14);

        cell.Add(new Paragraph(title)
            .SetFont(boldFont)
            .SetFontSize(11)
            .SetFontColor(gray)
            .SetMarginBottom(6));

        foreach (var line in lines)
        {
            cell.Add(new Paragraph(line)
                .SetFont(normalFont)
                .SetFontSize(11)
                .SetFontColor(dark)
                .SetMargin(0));
        }

        return cell;
    }

    private static Cell DetailLabel(string text, PdfFont boldFont, Color gray, Color border) =>
        new Cell()
            .SetBorderTop(Border.NO_BORDER)
            .SetBorderLeft(Border.NO_BORDER)
            .SetBorderRight(Border.NO_BORDER)
            .SetBorderBottom(new SolidBorder(border, 1))
            .SetPaddingTop(10)
            .SetPaddingBottom(10)
            .Add(new Paragraph(text)
                .SetFont(boldFont)
                .SetFontSize(10)
                .SetFontColor(gray));

    private static Cell DetailValue(string text, PdfFont normalFont, Color dark, Color border) =>
        new Cell()
            .SetBorderTop(Border.NO_BORDER)
            .SetBorderLeft(Border.NO_BORDER)
            .SetBorderRight(Border.NO_BORDER)
            .SetBorderBottom(new SolidBorder(border, 1))
            .SetPaddingTop(10)
            .SetPaddingBottom(10)
            .Add(new Paragraph(string.IsNullOrWhiteSpace(text) ? "-" : text)
                .SetFont(normalFont)
                .SetFontSize(10)
                .SetFontColor(dark));

    private byte[] SignPdf(byte[] unsignedPdf, string title, string adminEmail)
    {
        var pfxBytes = File.ReadAllBytes(_pfxPath);

        var store = new Pkcs12StoreBuilder().Build();
        store.Load(new MemoryStream(pfxBytes), _pfxPassword.ToCharArray());

        string alias = store.Aliases.Cast<string>().First(a => store.IsKeyEntry(a));
        var privateKey = store.GetKey(alias).Key;
        var certChain = store.GetCertificateChain(alias)
            .Select(e => (iText.Commons.Bouncycastle.Cert.IX509Certificate)
                new X509CertificateBC(e.Certificate))
            .ToArray();

        using var signedMs = new MemoryStream();
        var reader = new PdfReader(new MemoryStream(unsignedPdf));
        var signer = new PdfSigner(reader, signedMs, new StampingProperties());

        var fieldName = "AxiaSign_" + Guid.NewGuid().ToString("N")[..8];

        var sfAppearance = new SignatureFieldAppearance(fieldName)
            .SetContent(new SignedAppearanceText()
                .SetSignedBy("Axia Abonnement")
                .SetReasonLine($"Motif : Export officiel — {title}")
                .SetLocationLine("Lieu : Tunisie"))
            .SetBackgroundColor(new DeviceRgb(238, 242, 255))
            .SetBorder(new SolidBorder(new DeviceRgb(79, 70, 229), 1));

        var signerProps = new SignerProperties()
            .SetFieldName(fieldName)
            .SetReason($"Export officiel — {title}")
            .SetLocation("Tunisie")
            .SetContact(adminEmail)
            .SetSignatureAppearance(sfAppearance)
            .SetPageNumber(1)
            .SetPageRect(new Rectangle(36, 20, 260, 70));

        signer.SetSignerProperties(signerProps);

        var externalSignature = new PrivateKeySignature(
            new PrivateKeyBC(privateKey),
            DigestAlgorithms.SHA256);

        signer.SignDetached(
            new BouncyCastleDigest(),
            externalSignature,
            certChain,
            null, null, null, 0,
            PdfSigner.CryptoStandard.CMS);

        return signedMs.ToArray();
    }
}