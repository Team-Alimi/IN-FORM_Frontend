import { Link } from "react-router-dom";

const MobileFooter = () => {
  return (
    <footer className="w-full bg-gray-100 border-t border-gray-200 pt-6 pb-24 mt-auto">
      <div className="px-4">
        <div className="flex flex-col gap-2 text-[11px] text-gray-400">
          <div className="flex flex-row gap-3">
            <Link to="/privacy-policy" className="hover:text-gray-600 transition underline">개인정보처리방침</Link>
            <Link to="/terms-of-service" className="hover:text-gray-600 transition underline">이용약관</Link>
          </div>
          <div className="flex flex-row">
            <p>© 2026 Team Alimi. All rights reserved.</p>
            <p className="ml-auto">
              <a
                href="https://forms.gle/hTPpZsoi41kbyBC27"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-gray-600 transition underline"
              >
                불편사항 접수
              </a>
            </p>
          </div>

        </div>
      </div>
    </footer>
  );
};

export default MobileFooter;
