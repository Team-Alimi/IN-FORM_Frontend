import { useNavigate } from "react-router-dom";
import {
  RiHome5Line, RiHome5Fill,
  RiMegaphoneLine, RiMegaphoneFill,
  RiBookmarkLine, RiBookmarkFill,
  RiUser3Line, RiUser3Fill,
} from "react-icons/ri";
import { IoChatbubbleEllipsesOutline, IoChatbubble } from "react-icons/io5";

const NAV_ITEMS = [
  { icon: RiHome5Line, activeIcon: RiHome5Fill, label: "홈", path: "/" },
  { icon: RiMegaphoneLine, activeIcon: RiMegaphoneFill, label: "공지", path: "/events" },
  { icon: IoChatbubbleEllipsesOutline, activeIcon: IoChatbubble, label: "동아리", path: "/clubs" },
  { icon: RiBookmarkLine, activeIcon: RiBookmarkFill, label: "북마크", path: "/bookmarks" },
  { icon: RiUser3Line, activeIcon: RiUser3Fill, label: "마이페이지", path: "/mypage" },
];

const MobileTabBar = ({ activeIndex = 0 }) => {
  const navigate = useNavigate();
  return (
    <>
      {/* 문서 공간과 북마크 편집 액션은 기존 공용 높이를 함께 사용한다. */}
      <div aria-hidden="true" className="h-[var(--mobile-tab-bar-height)] shrink-0" />
      <footer className="pointer-events-none fixed bottom-0 left-0 z-50 flex h-[var(--mobile-tab-bar-height)] w-full justify-center px-4 pb-[calc(12px_+_env(safe-area-inset-bottom,0px))]">
        <nav
          aria-label="모바일 메뉴"
          className="pointer-events-auto grid h-[68px] w-[280px] max-w-full grid-cols-5 items-center rounded-full border border-[#E5E7EB] bg-white px-2 shadow-[0_8px_24px_rgba(0,0,0,0.18)]"
        >
          {NAV_ITEMS.map((item, index) => {
            const active = activeIndex === index;
            const Icon = active ? item.activeIcon : item.icon;
            return (
              <button
                key={item.path}
                type="button"
                aria-current={active ? "page" : undefined}
                onClick={() => navigate(item.path)}
                className={`flex h-[52px] min-w-0 cursor-pointer flex-col items-center justify-center gap-0.5 rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary motion-reduce:transition-none ${active ? "bg-[#F3F4F6] font-bold text-black" : "text-[#99A1AF] hover:bg-gray-50"}`}
              >
                <Icon aria-hidden="true" size={18} className="shrink-0" />
                <span className="whitespace-nowrap text-[10px] leading-[14px] tracking-tight">
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>
      </footer>
    </>
  );
};

export default MobileTabBar;
