const Imminent = ({ id, title, date, onClick }) => {
  return (
    <div
      className="w-full cursor-pointer hover:bg-gray-50 transition-colors px-1"
      onClick={onClick}
    >
      <div className="flex items-center justify-between py-3">
        <div className="flex items-center gap-3">
          <span className="text-gray-800 text-sm truncate max-w-[160px]">
            {title}
          </span>
        </div>
        <span className="text-gray-500 text-xs">{date}</span>
      </div>
      <div className="border-b border-gray-100 last:border-0" />
    </div>
  );
};

export default Imminent;
