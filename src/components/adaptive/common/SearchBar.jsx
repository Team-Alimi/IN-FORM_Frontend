import React from "react";
import { IoSearchOutline } from "react-icons/io5";

const SearchBar = ({ value, onChange, placeholder }) => {
  return (
    <div className="w-full">
      <div className="relative flex items-center bg-[#F7FAFC] rounded-[18px] shadow-[0_4px_24px_rgba(0,72,152,0.06)] px-5 py-2">
        <IoSearchOutline size={24} className="text-gray-400 mr-2" />
        <input
          type="text"
          value={value}
          onChange={onChange}
          placeholder={placeholder || ""}
          className="w-full bg-transparent outline-none text-gray-700 placeholder-gray-400 text-[14px]"
          style={{ minHeight: 28 }}
        />
      </div>
    </div>
  );
};

export default SearchBar;
