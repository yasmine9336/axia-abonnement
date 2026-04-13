import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

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
export function exportToPDF<T>(
  data: T[],
  columns: ExportColumn<T>[],
  filename: string,
  title: string = "Export"
): void {
  // Orientation paysage si beaucoup de colonnes
  const orientation = columns.length > 5 ? "landscape" : "portrait";
  const doc = new jsPDF({ orientation, unit: "mm", format: "a4" });

  // Titre
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text(title, 14, 15);

  // Date d'export
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100);
  const today = new Date().toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  doc.text(`Exporté le ${today}`, 14, 22);

  // En-têtes
  const headers = columns.map((c) => c.label);

  // Lignes
  const rows = data.map((row) =>
    columns.map((col) => {
      const rawValue = (row as Record<string, unknown>)[col.key as string];
      const value = col.format ? col.format(rawValue, row) : rawValue;
      return value == null ? "" : String(value);
    })
  );

  // Tableau
  autoTable(doc, {
    head: [headers],
    body: rows,
    startY: 28,
    styles: {
      fontSize: 9,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: [79, 70, 229], // #4F46E5 (indigo)
      textColor: 255,
      fontStyle: "bold",
    },
    alternateRowStyles: {
      fillColor: [249, 250, 251], // gris très clair
    },
    margin: { top: 28, left: 14, right: 14 },
  });

  // Nom du fichier
  const finalFilename = `${filename}_${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(finalFilename);
}
