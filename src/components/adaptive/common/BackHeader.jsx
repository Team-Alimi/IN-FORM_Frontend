import React from "react";

const BackHeader = ({ icon, title }) => {
  return (
    <header className="w-full h-12 flex items-center px-4 bg-white shadow fixed top-0 left-0 z-20">
      <button className="mr-2 text-xl" onClick={() => window.history.back()} aria-label="뒤로가기">
        {icon || "←"}
      </button>
      <h1 className="text-base font-semibold truncate">{title}</h1>
    </header>
  );
};

export default BackHeader;
