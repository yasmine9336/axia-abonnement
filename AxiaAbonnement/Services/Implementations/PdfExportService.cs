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
        _pfxPath = Path.Combine(env.ContentRootPath, "axia_signature.pfx");
        EnsureCertificate();
    }

    private void EnsureCertificate()
    {
        if (File.Exists(_pfxPath)) return;

        using var rsa = RSA.Create(2048);
        var req = new CertificateRequest(
            "CN=Axia Signature, O=Axia, C=TN",
            rsa, HashAlgorithmName.SHA256, RSASignaturePadding.Pkcs1);

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

    private byte[] BuildPdf(PdfExportRequestDto dto, string adminName, string adminEmail)
    {
        using var ms = new MemoryStream();
        var writer = new PdfWriter(ms);
        var pdfDoc = new PdfDocument(writer);
        var document = new Document(pdfDoc, iText.Kernel.Geom.PageSize.A4.Rotate());
        document.SetMargins(20, 20, 20, 20);

        var boldFont = PdfFontFactory.CreateFont(iText.IO.Font.Constants.StandardFonts.HELVETICA_BOLD);
        var normalFont = PdfFontFactory.CreateFont(iText.IO.Font.Constants.StandardFonts.HELVETICA);
        var headerColor = new DeviceRgb(79, 70, 229);
        var white = ColorConstants.WHITE;
        var lightGray = new DeviceRgb(249, 250, 251);

        document.Add(new Paragraph(dto.Title)
            .SetFont(boldFont).SetFontSize(16)
            .SetFontColor(new DeviceRgb(17, 24, 39))
            .SetMarginBottom(4));

        var now = DateTime.Now.ToString("dd/MM/yyyy HH:mm");
        document.Add(new Paragraph($"Exporté le {now} par {adminName} ({adminEmail})")
            .SetFont(normalFont).SetFontSize(9)
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
                    .SetFont(boldFont).SetFontSize(9)
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
                        .SetFont(normalFont).SetFontSize(8)));
            }
        }

        document.Add(table);
        document.Close();
        return ms.ToArray();
    }

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
            .SetPageRect(new iText.Kernel.Geom.Rectangle(36, 20, 260, 70));





        // iText 9.x : SetSignerProperties() d'abord, puis SignDetached sans SignerProperties
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
