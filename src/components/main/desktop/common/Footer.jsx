import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="w-full bg-gray-100 border-t border-gray-200 pt-10 pb-6 mt-auto">
      <div className="max-w-6xl mx-auto px-4">

        {/* 상단 영역 */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-8">
          <div className="max-w-sm">
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              In:<span className="text-blue-600">Form</span>
            </h2>
            <p className="text-sm text-gray-500 leading-relaxed mb-4">
              흩어져 있는 인하대학교의 행사와 동아리 정보를 <br />
              한눈에 확인하는 학생 자치 정보 서비스입니다.
            </p>
          </div>
        </div>

        {/* 하단 영역 */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-400">
          <div className="space-y-1 text-center md:text-left">
            <p>© 2026 Team Alimi. All rights reserved.</p>
            <div className="flex flex-wrap justify-center md:justify-start gap-4 py-1 font-medium text-gray-500">
              <Link to="/privacy-policy" className="hover:text-gray-800 transition">개인정보처리방침</Link>
              <Link to="/terms-of-service" className="hover:text-gray-800 transition">이용약관</Link>
              <a
                href="https://forms.gle/hTPpZsoi41kbyBC27"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-gray-800 transition"
              >
                불편사항 접수
              </a>
            </div>
          </div>

          <p className="text-center md:text-right">
            본 서비스는 인하대학교 공식 웹사이트가 아니며, 학생 자치로 운영됩니다.
          </p>
        </div>

      </div>
    </footer>
  );
};

export default Footer;