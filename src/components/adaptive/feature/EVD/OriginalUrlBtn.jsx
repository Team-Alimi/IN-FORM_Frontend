import React from "react";

// 초안

const OriginalUrlBtn = ({ vendor_name, original_url }) => {
	const handleClick = () => {
		if (original_url) {
			window.open(original_url, "_blank", "noopener,noreferrer");
		}
	};

	return (
		<button
			type="button"
			className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-gray-100 text-gray-700 text-sm font-normal hover:bg-gray-200 transition w-auto min-w-0 max-w-fit"
			onClick={handleClick}
			disabled={!original_url}
			style={{ width: "auto", minWidth: 0, maxWidth: 'fit-content' }}
		>
			<span>{vendor_name}</span>
			<svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 3h7m0 0v7m0-7L10 14m-4 0h4v4" />
			</svg>
		</button>
	);
};

export default OriginalUrlBtn;
