interface MovePageBtnProps {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}

const getPageNumbers = (page: number, totalPages: number): (number | null)[] => {
  if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
  if (page <= 3) return [1, 2, 3, null, totalPages];
  if (page >= totalPages - 2) return [1, null, totalPages - 2, totalPages - 1, totalPages];
  return [1, null, page - 1, page, page + 1, null, totalPages];
};

const MovePageBtn = ({ page, totalPages, onChange }: MovePageBtnProps) => {
  return (
    <div className="flex justify-center items-center gap-1 py-4">
      <button
        onClick={() => onChange(Math.max(1, page - 1))}
        disabled={page === 1}
        className="px-2 py-1 text-sm text-gray-500 disabled:opacity-30"
      >
        ←
      </button>
      {getPageNumbers(page, totalPages).map((p, i) =>
        p === null ? (
          <span key={`ellipsis-${i}`} className="px-2 text-gray-400 text-sm">
            ...
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onChange(p)}
            className={`w-7 h-7 rounded text-sm ${
              page === p ? 'bg-[#4068f7] text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {p}
          </button>
        ),
      )}
      <button
        onClick={() => onChange(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
        className="px-2 py-1 text-sm text-gray-500 disabled:opacity-30"
      >
        →
      </button>
    </div>
  );
};

export default MovePageBtn;
