import { useState, useRef } from "react";
import { IoSearchOutline, IoCloseOutline } from "react-icons/io5";

// rightSlot: 검색창 우측에 삽입할 커스텀 버튼/아이콘 (예: 필터 아이콘)
const SearchBar = ({
  value,
  onChange,
  onSubmit,
  placeholder,
  searchHistory = [],
  onSelectHistory,
  onRemoveHistory,
  rightSlot,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const blurTimer = useRef(null);

  const showDropdown = isFocused && searchHistory.length > 0 && value.trim() === "";

  const handleFocus = () => {
    clearTimeout(blurTimer.current);
    setIsFocused(true);
  };

  const handleBlur = () => {
    blurTimer.current = setTimeout(() => setIsFocused(false), 150);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && value.trim()) {
      onSubmit?.(value.trim());
      setIsFocused(false);
    }
  };

  const handleSelectHistory = (keyword) => {
    onSelectHistory?.(keyword);
    setIsFocused(false);
  };

  return (
    <div className="w-full relative">
      <div className={`relative flex items-center bg-[#F7FAFC] rounded-[18px] shadow-[0_4px_24px_rgba(0,72,152,0.06)] px-5 py-2 transition-all ${isFocused ? "ring-1 ring-blue-300" : ""}`}>
        <IoSearchOutline size={24} className="text-gray-400 mr-2 shrink-0" />
        <input
          type="text"
          value={value}
          onChange={onChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || ""}
          className="w-full bg-transparent outline-none text-gray-700 placeholder-gray-400 text-[14px]"
          style={{ minHeight: 28 }}
        />
        {value && (
          <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => onChange({ target: { value: "" } })}
            className="ml-1 text-gray-400 hover:text-gray-600"
          >
            <IoCloseOutline size={18} />
          </button>
        )}
        {rightSlot && (
          <div className="ml-2 shrink-0 flex items-center">{rightSlot}</div>
        )}
      </div>

      {showDropdown && (
        <div className="absolute top-full mt-1 w-full bg-white rounded-[14px] shadow-[0_4px_20px_rgba(0,0,0,0.10)] z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 pt-3 pb-1">
            <span className="text-[11px] text-gray-400 font-medium">최근 검색어</span>
            <button
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => onRemoveHistory?.("__all__")}
              className="text-[11px] text-gray-400 hover:text-gray-600"
            >
              전체 삭제
            </button>
          </div>
          {searchHistory.map((keyword) => (
            <div
              key={keyword}
              className="flex items-center justify-between px-4 py-2 hover:bg-gray-50 cursor-pointer"
            >
              <button
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleSelectHistory(keyword)}
                className="flex items-center gap-2 flex-1 text-left"
              >
                <IoSearchOutline size={14} className="text-gray-300 shrink-0" />
                <span className="text-[13px] text-gray-700">{keyword}</span>
              </button>
              <button
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => onRemoveHistory?.(keyword)}
                className="text-gray-300 hover:text-gray-500 ml-2"
              >
                <IoCloseOutline size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
