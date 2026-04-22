import { useState, useRef, useEffect } from "react";
import {
  Download,
  FileText,
  FileSpreadsheet,
  FileDown,
  ChevronDown,
  Loader2,
} from "lucide-react";
import {
  exportToCSV,
  exportToExcel,
  exportToPDFSigned,
  type ExportColumn,
} from "../../utils/exportUtils";
import { useAuth } from "../../hooks/useAuth";

interface ExportButtonProps<T> {
  data: T[];
  columns: ExportColumn<T>[];
  filename: string;
  label?: string;
  sheetName?: string;
  pdfTitle?: string;
}

export default function ExportButton<T>({
  data,
  columns,
  filename,
  label = "Exporter",
  sheetName,
  pdfTitle,
}: ExportButtonProps<T>) {
  const [open, setOpen] = useState(false);
  const [signing, setSigning] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const isAdmin = user?.role === "Admin";

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleExport = async (type: "csv" | "excel" | "pdf") => {
    if (data.length === 0) {
      alert("Aucune donnée à exporter");
      return;
    }

    setOpen(false);

    if (type === "csv") {
      exportToCSV(data, columns, filename);
    } else if (type === "excel") {
      exportToExcel(data, columns, filename, sheetName);
    } else {
      setSigning(true);
      try {
        await exportToPDFSigned(
          data,
          columns,
          filename,
          pdfTitle ?? sheetName ?? "Export",
        );
      } finally {
        setSigning(false);
      }
    }
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        disabled={signing}
        className="inline-flex items-center gap-2 px-4 py-2 bg-[#0F6CBD] text-white text-sm font-medium rounded-xl hover:bg-[#0B5CAD] transition-colors disabled:opacity-60"
      >
        {signing ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <Download size={16} />
        )}

        {signing ? "Signature en cours..." : label}

        {!signing && (
          <ChevronDown
            size={14}
            className={`transition-transform ${open ? "rotate-180" : ""}`}
          />
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-52 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden z-10">
          <button
            onClick={() => handleExport("csv")}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <FileText size={16} className="text-gray-500" />
            Exporter en CSV
          </button>

          <button
            onClick={() => handleExport("excel")}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors border-t border-gray-100"
          >
            <FileSpreadsheet size={16} className="text-green-600" />
            Exporter en Excel
          </button>

          <button
            onClick={() => handleExport("pdf")}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors border-t border-gray-100"
          >
            <FileDown size={16} className="text-blue-600" />
            Exporter en PDF

            {isAdmin && (
              <span className="ml-auto text-xs bg-[#EAF4FF] text-[#0F6CBD] px-1.5 py-0.5 rounded-full font-medium">
                Signé
              </span>
            )}
          </button>
        </div>
      )}
    </div>
  );
}