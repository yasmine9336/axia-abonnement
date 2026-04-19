import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import axiosInstance from "../api/axiosInstance";

export interface DigitalSignature {
  hash: string;
  signature: string;
  algorithm: string;
  timestamp: string;
  adminId: string;
  adminName: string;
  adminEmail: string;
  documentTitle: string;
}

async function computeHash(data: unknown): Promise<string> {
  const json = JSON.stringify(data);
  const bytes = new TextEncoder().encode(json);
  const hash = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function requestSignature(
  hash: string,
  documentTitle: string
): Promise<DigitalSignature | null> {
  try {
    const res = await axiosInstance.post<DigitalSignature>(
      "/signature/sign",
      { hash, documentTitle }
    );
    return res.data;
  } catch {
    return null;
  }
}

// Types
export interface ExportColumn<T> {
  key: keyof T | string;
  label: string;
  // Optionnel : transformation personnalisée pour une cellule
  format?: (value: unknown, row: T) => string;
}

// Formater une date au format français : JJ/MM/AAAA HH:mm
export function formatDateFR(value: unknown): string {
  if (value === null || value === undefined || value === "") return "";
  if (typeof value !== "string" && !(value instanceof Date)) return "";
  const d = typeof value === "string" ? new Date(value) : value;
  if (isNaN(d.getTime())) return "";
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${dd}/${mm}/${yyyy} ${hh}:${min}`;
}


// Échapper une valeur pour CSV
function escapeCSV(value: unknown): string {
  if (value === null || value === undefined) return "";
  const str = String(value);
  // Si la valeur contient une virgule, un point-virgule, un guillemet ou un saut de ligne → entourer de guillemets
  if (/[",;\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

// Exporter en CSV
export function exportToCSV<T>(
  data: T[],
  columns: ExportColumn<T>[],
  filename: string
): void {
  // En-têtes
  const headers = columns.map((c) => escapeCSV(c.label)).join(";");

  // Lignes
  const rows = data.map((row) =>
    columns
      .map((col) => {
        const rawValue = (row as Record<string, unknown>)[col.key as string];
        const value = col.format ? col.format(rawValue, row) : rawValue;
        return escapeCSV(value);
      })
      .join(";")
  );

  // BOM UTF-8 pour que Excel reconnaisse les accents
  const bom = "\uFEFF";
  const csv = bom + [headers, ...rows].join("\n");

  // Télécharger
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename}_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Exporter en Excel (.xlsx)
export function exportToExcel<T>(
  data: T[],
  columns: ExportColumn<T>[],
  filename: string,
  sheetName: string = "Données"
): void {
  // Transformer les données selon les colonnes
  const rows = data.map((row) => {
    const obj: Record<string, unknown> = {};
    columns.forEach((col) => {
      const rawValue = (row as Record<string, unknown>)[col.key as string];
      const value = col.format ? col.format(rawValue, row) : rawValue;
      obj[col.label] = value ?? "";
    });
    return obj;
  });

  // Créer la feuille
  const worksheet = XLSX.utils.json_to_sheet(rows);

  // Ajuster la largeur des colonnes automatiquement
  const columnWidths = columns.map((col) => {
    const headerLength = col.label.length;
    const maxDataLength = Math.max(
      ...rows.map((r) => String(r[col.label] ?? "").length),
      0
    );
    return { wch: Math.min(Math.max(headerLength, maxDataLength) + 2, 50) };
  });
  worksheet["!cols"] = columnWidths;

  // Créer le classeur
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  // Télécharger
  const finalFilename = `${filename}_${new Date().toISOString().slice(0, 10)}.xlsx`;
  XLSX.writeFile(workbook, finalFilename);
}

// Exporter en PDF (.pdf)
export async function exportToPDF<T>(
  data: T[],
  columns: ExportColumn<T>[],
  filename: string,
  title: string = "Export",
  options?: { sign?: boolean }
): Promise<void> {
  const orientation = columns.length > 5 ? "landscape" : "portrait";
  const doc = new jsPDF({ orientation, unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();

  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text(title, 14, 15);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100);
  const today = new Date().toLocaleDateString("fr-FR", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
  doc.text(`Exporté le ${today}`, 14, 22);

  const headers = columns.map((c) => c.label);
  const rows = data.map((row) =>
    columns.map((col) => {
      const rawValue = (row as Record<string, unknown>)[col.key as string];
      const value = col.format ? col.format(rawValue, row) : rawValue;
      return value == null ? "" : String(value);
    })
  );

  autoTable(doc, {
    head: [headers],
    body: rows,
    startY: 28,
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: [79, 70, 229], textColor: 255, fontStyle: "bold" },
    alternateRowStyles: { fillColor: [249, 250, 251] },
    margin: { top: 28, left: 14, right: 14 },
  });

  // Signature numérique RSA-SHA256
  if (options?.sign) {
    const hash = await computeHash({ title, headers, rows });
    const sig = await requestSignature(hash, title);

    if (sig) {
      const tableEnd = (doc as unknown as { lastAutoTable: { finalY: number } })
        .lastAutoTable?.finalY ?? 100;
      const pageH = doc.internal.pageSize.getHeight();
      let y = tableEnd + 10;
      if (y + 55 > pageH - 10) {
        doc.addPage();
        y = 20;
      }

      // Encadré
      doc.setDrawColor(124, 58, 237);
      doc.setLineWidth(0.4);
      doc.rect(14, y, pageW - 28, 55);

      // Bandeau titre
      doc.setFillColor(124, 58, 237);
      doc.rect(14, y, pageW - 28, 6, "F");
      doc.setFontSize(8);
      doc.setTextColor(255);
      doc.setFont("helvetica", "bold");
      doc.text("SIGNATURE NUMERIQUE CERTIFIEE (RSA-SHA256)", 16, y + 4.3);

      // Corps
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(30);
      const lineH = 4.2;
      let ly = y + 11;

      const row = (label: string, value: string) => {
        doc.setFont("helvetica", "bold");
        doc.text(label, 16, ly);
        doc.setFont("helvetica", "normal");
        doc.text(value, 45, ly);
        ly += lineH;
      };

      row("Emetteur :", sig.adminName);
      row("Email :", sig.adminEmail);
      row("Emis le :", new Date(sig.timestamp).toLocaleString("fr-FR"));
      row("Algorithme :", sig.algorithm);

      // Hash (monospace, tronqué pour lisibilité)
      doc.setFont("helvetica", "bold");
      doc.text("Hash SHA-256 :", 16, ly);
      doc.setFont("courier", "normal");
      doc.setFontSize(7);
      doc.text(sig.hash.slice(0, 48) + "…" + sig.hash.slice(-16), 45, ly);
      ly += lineH;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.text("Signature :", 16, ly);
      doc.setFont("courier", "normal");
      doc.setFontSize(7);
      doc.text(sig.signature.slice(0, 48) + "…" + sig.signature.slice(-16), 45, ly);
      ly += lineH;

      doc.setFont("helvetica", "italic");
      doc.setFontSize(7);
      doc.setTextColor(100);
      doc.text(
        "Pour verifier : POST /api/signature/verify avec hash, signature, adminId, timestamp, documentTitle.",
        16, y + 52
      );

      // Metadata PDF — signature complète stockée
      doc.setDocumentProperties({
        title,
        author: sig.adminName,
        subject: `Signed document — ${sig.documentTitle}`,
        keywords: `signature=${sig.signature};hash=${sig.hash};adminId=${sig.adminId};timestamp=${sig.timestamp}`,
      });
    }
  }

  doc.save(`${filename}_${new Date().toISOString().slice(0, 10)}.pdf`);
}
