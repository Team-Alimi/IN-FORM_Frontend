import React from "react";
import { useNavigate } from "react-router-dom";
import homeIcon from "../../../assets/icons/home.svg";
import eventIcon from "../../../assets/icons/event.svg";
import clubIcon from "../../../assets/icons/club.svg";
import mypageIcon from "../../../assets/icons/mypage.svg";
import homePressedIcon from "../../../assets/icons/home_pressed.svg";
import eventPressedIcon from "../../../assets/icons/event_pressed.svg";
import clubPressedIcon from "../../../assets/icons/club_pressed.svg";
import mypagePressedIcon from "../../../assets/icons/mypage_pressed.svg";

const navItems = [
	{ icon: homeIcon, pressedIcon: homePressedIcon, label: "홈", path: "/" },
	{ icon: eventIcon, pressedIcon: eventPressedIcon, label: "공지사항", path: "/events" },
	{ icon: clubIcon, pressedIcon: clubPressedIcon, label: "동아리", path: "/clubs" },
	{ icon: mypageIcon, pressedIcon: mypagePressedIcon, label: "마이페이지", path: "/mypage" },
];

export default function MobileTabBar({ activeIndex = 0 }) {
	const navigate = useNavigate();
	return (
		<footer className="fixed bottom-0 left-0 w-full z-50">
			<div className="mx-auto max-w-md rounded-t-2xl bg-white/30 backdrop-blur-md border-t border-gray-200 flex justify-between px-2 py-1 shadow-lg">
				{navItems.map((item, idx) => (
					   <button
						   key={item.label}
						   className={
							   "flex flex-col items-center cursor-pointer flex-1 py-1 " +
							   (activeIndex === idx
								   ? "text-[#004898] font-bold"
								   : "text-gray-400")
						   }
						   onClick={() => navigate(item.path)}
					   >
						   <img
							   src={activeIndex === idx ? item.pressedIcon : item.icon}
							   alt={item.label}
							   className={
								   "w-7 h-7 mb-1 " +
								   (activeIndex === idx ? "" : "opacity-70")
							   }
						   />
						<span className="text-xs tracking-tight">
							{item.label}
						</span>
						{activeIndex === idx && (
							<div className="w-6 h-1 mt-1 rounded-full bg-[#004898]" />
						)}
					</button>
				))}
			</div>
		</footer>
	);
}