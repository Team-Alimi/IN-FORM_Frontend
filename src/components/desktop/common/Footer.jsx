import React from "react";

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
            <p>© 2025 Team Alimi. All rights reserved.</p>
            <p>
              문의 :{" "}
              <a
                href="mailto:team.alimi.inform@gmail.com"
                className="hover:text-gray-600 transition"
              >
                team.alimi.inform@gmail.com
              </a>
            </p>
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