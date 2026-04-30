interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems?: number;
  pageSize?: number;
  itemLabel?: string;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  itemLabel = "élément(s)",
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const start =
    totalItems !== undefined && pageSize !== undefined
      ? (currentPage - 1) * pageSize + 1
      : null;

  const end =
    totalItems !== undefined && pageSize !== undefined
      ? Math.min(currentPage * pageSize, totalItems)
      : null;

  return (
    <div className="flex items-center justify-between pt-5 mt-6 border-t border-gray-100">
      <p className="text-xs text-gray-500">
        {start !== null && end !== null && totalItems !== undefined
          ? `Affichage de ${start} à ${end} sur ${totalItems} ${itemLabel}`
          : `Page ${currentPage} sur ${totalPages}`}
      </p>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="ui-btn-secondary text-xs disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Précédent
        </button>

        <span className="text-xs text-gray-500">
          {currentPage} / {totalPages}
        </span>

        <button
          type="button"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="ui-btn-secondary text-xs disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Suivant
        </button>
      </div>
    </div>
  );
}