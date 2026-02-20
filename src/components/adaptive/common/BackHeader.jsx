import React from "react";

// 샘플코드

const BackHeader = () => {
  return (
    <header className="w-full h-12 flex items-center px-4 bg-white shadow fixed top-0 left-0 z-20">
      <button className="mr-2 text-xl" onClick={() => window.history.back()} aria-label="뒤로가기">
        ←
      </button>
      <h1 className="text-base font-semibold truncate">{"공지사항"}</h1>
    </header>
  );
};

export default BackHeader;
