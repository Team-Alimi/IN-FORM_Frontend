import React from "react";

const Footer = () => {
  return (
    <footer className="w-full bg-gray-100 border-t border-gray-200 pt-10 pb-6 mt-auto">
      <div className="max-w-6xl mx-auto px-4">
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
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-400">
          <p>© 2025 Team Alimi. All rights reserved.</p>
          <p className="text-center md:text-right">
            본 서비스는 인하대학교 공식 웹사이트가 아니며, 학생 자치 프로젝트(GDGoC GOAT)로 운영됩니다.
          </p>
        </div>

      </div>
    </footer>
  );
};

export default Footer;






/* 
const Footer = () => {
  return (
    <div className="size-full bg-gray-200 mt-5 p-20 flex justify-center items-center">
      <div className="">
        <div className="m-2">인하대학교 GDGoc GOAT project</div>
        <div className="m-2">Team 알리미 Alimi</div>
        <div className="m-2">문의 : 000-0000-0000</div>
      </div>
    </div>
  );
};

export default Footer;
*/

