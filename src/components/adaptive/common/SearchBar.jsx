import React from "react";
import { IoSearchOutline } from "react-icons/io5"; // 아이콘 사용 (react-icons)

const SearchBar = ({ value, onChange, placeholder }) => {
  return (
    <div className="w-full">
      {/* 검색 입력줄 */}
      <div className="relative flex items-center">
        <input
          type="text"
          value={value}
          onChange={onChange}
          placeholder={placeholder || ""}
          className="w-full pr-10 outline-none bg-transparent text-gray-700"
        />

        {/* 검색 아이콘 */}
        <IoSearchOutline
          size={22}
          className="text-blue-500 absolute right-0 cursor-pointer"
        />
      </div>

      {/* 아래 선 */}
      <div className="border-b border-gray-300 mt-2" />
    </div>
  );
};

export default SearchBar;
