import React from "react";
import backIcon from "../../../assets/icons/back.svg";

const BackHeader = ({ title }) => {
  return (
    <header className="w-full h-13 flex items-center px-4 bg-white fixed top-0 left-0 z-20">
      <button className="mr-2" onClick={() => window.history.back()} aria-label="뒤로가기">
        <img src={backIcon} alt="뒤로가기" className="w-6 h-6" />
      </button>
      <h1 className="text-base font-medium truncate">{title}</h1>
    </header>
  );
};

export default BackHeader;
