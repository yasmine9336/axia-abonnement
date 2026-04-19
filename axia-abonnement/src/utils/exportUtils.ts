import * as XLSX from "xlsx";
import axiosInstance from "../api/axiosInstance";

export interface ExportColumn<T> {
  key: keyof T | string;
  label: string;
  format?: (value: unknown, row: T) => string;
}

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

function escapeCSV(value: unknown): string {
  if (value === null || value === undefined) return "";
  const str = String(value);
  if (/[",;\n\r]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
  return str;
}

export function exportToCSV<T>(
  data: T[],
  columns: ExportColumn<T>[],
  filename: string
): void {
  const headers = columns.map((c) => escapeCSV(c.label)).join(";");
  const rows = data.map((row) =>
    columns
      .map((col) => {
        const rawValue = (row as Record<string, unknown>)[col.key as string];
        const value = col.format ? col.format(rawValue, row) : rawValue;
        return escapeCSV(value);
      })
      .join(";")
  );
  const bom = "\uFEFF";
  const csv = bom + [headers, ...rows].join("\n");
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

export function exportToExcel<T>(
  data: T[],
  columns: ExportColumn<T>[],
  filename: string,
  sheetName: string = "Données"
): void {
  const rows = data.map((row) => {
    const obj: Record<string, unknown> = {};
    columns.forEach((col) => {
      const rawValue = (row as Record<string, unknown>)[col.key as string];
      const value = col.format ? col.format(rawValue, row) : rawValue;
      obj[col.label] = value ?? "";
    });
    return obj;
  });
  const worksheet = XLSX.utils.json_to_sheet(rows);
  const columnWidths = columns.map((col) => {
    const headerLength = col.label.length;
    const maxDataLength = Math.max(
      ...rows.map((r) => String(r[col.label] ?? "").length),
      0
    );
    return { wch: Math.min(Math.max(headerLength, maxDataLength) + 2, 50) };
  });
  worksheet["!cols"] = columnWidths;
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  XLSX.writeFile(workbook, `${filename}_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

export async function exportToPDFSigned<T>(
  data: T[],
  columns: ExportColumn<T>[],
  filename: string,
  title: string
): Promise<void> {
  const headers = columns.map((c) => c.label);
  const rows = data.map((row) =>
    columns.map((col) => {
      const raw = (row as Record<string, unknown>)[col.key as string];
      const val = col.format ? col.format(raw, row) : raw;
      return val == null ? "" : String(val);
    })
  );
  const res = await axiosInstance.post(
    "/pdf/export",
    { title, filename, columns: headers, rows },
    { responseType: "blob" }
  );
  const url = URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename}_${new Date().toISOString().slice(0, 10)}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
