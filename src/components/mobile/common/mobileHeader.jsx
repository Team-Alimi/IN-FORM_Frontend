import React from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../../../stores/useAuthStore";
import logoIcon from "../../../assets/icons/logo.svg";
import bellIcon from "../../../assets/icons/notification.svg";
import userIcon from "../../../assets/icons/user.svg";

export default function MobileHeader() {
	const userName = useAuthStore((state) => state.userInfo?.name) || "게스트";
	const navigate = useNavigate();
	const handleLogoClick = () => navigate("/");
	return (
	       <header className="w-full flex items-center justify-between px-2 py-1.5 bg-[#ECF0FF]">
	       <div className="flex items-center">
		       <img src={logoIcon} alt="INFORM Logo" className="h-6 mr-1" />
		       <span
			       className="text-lg font-bold tracking-tight text-black cursor-pointer"
			       onClick={handleLogoClick}
		       >
			       INFORM
		       </span>
	        </div>
	        <div className="flex items-center gap-2">
                <button className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-300 bg-[#ECF0FF] cursor-pointer">
                    <img src={bellIcon} alt="알림" className="w-4 h-4" />
                </button>
				<button
					className="flex items-center h-9 px-2.5 rounded-full border border-gray-300 bg-[#ECF0FF] cursor-pointer"
					onClick={() => navigate("/mypage")} 
				>
					<img src={userIcon} alt="프로필" className="w-4 h-4 mr-1" />
					<span className="font-semibold text-sm">{userName}</span>
				</button>
	        </div>
	        </header>
	);
}