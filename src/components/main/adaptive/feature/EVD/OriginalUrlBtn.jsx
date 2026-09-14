import React from "react";
import urlIcon from "@/assets/icons/url.svg";

const OriginalUrlBtn = ({ name, source_url }) => {
  const handleClick = () => {
    if (source_url) {
      window.open(source_url, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={!source_url}
      className="
        inline-flex items-center gap-1.5
        px-3 h-8
        bg-gray-200
        rounded-[10px]
        shadow-[0px_4px_6px_0px_rgba(0,0,0,0.03)]
        backdrop-blur-[2.5px]
        text-gray-700 text-xs font-normal
        hover:bg-gray-200
        transition
        disabled:opacity-50 disabled:cursor-not-allowed
        w-auto max-w-fit
      "
    >
      <span className="leading-5">
        {name}
      </span>

      <img
        src={urlIcon}
        alt="external link"
        className="w-3.5 h-3.5"
      />
    </button>
  );
};

export default OriginalUrlBtn;