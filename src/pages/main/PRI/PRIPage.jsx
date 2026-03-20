import React from "react";

const PRIPage = () => {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12 md:py-20 text-gray-800 bg-white">
      <h1 className="text-2xl md:text-3xl font-bold mb-6 border-b pb-4">
        개인정보처리방침
      </h1>
      <p className="mb-8 text-sm text-gray-500">
        시행일: 2026년 3월 2일
      </p>

      <div className="space-y-6 text-sm leading-relaxed text-gray-700">
        <p>
          <strong>Team-Alimi</strong>(이하 '팀')는 이용자의 개인정보를 중요시하며, 「개인정보 보호법」 등 관련 법령을 준수하고 있습니다. 본 개인정보처리방침을 통하여 이용자가 제공하는 개인정보가 어떠한 용도와 방식으로 이용되고 있으며, 개인정보 보호를 위해 어떠한 조치가 취해지고 있는지 알려드립니다.
        </p>

        <section>
          <h2 className="text-lg font-semibold mb-2 text-gray-900">1. 수집하는 개인정보 항목 및 수집 방법</h2>
          <p>팀은 회원가입(구글 소셜 로그인 연동), 서비스 이용 과정에서 아래와 같은 개인정보를 수집하고 있습니다.</p>
          <ul className="list-disc list-inside mt-2 space-y-1 ml-2">
            <li><strong>필수 수집 항목 (구글 계정 정보 연동 시)</strong>: 이메일 주소, 이름, 프로필 사진</li>
            <li><strong>서비스 이용 과정에서 자동 수집되는 정보</strong>: 서비스 이용 기록, 접속 로그, 쿠키(Cookie), 접속 IP 주소, 기기 정보</li>
            <li><strong>수집 방법</strong>: 소셜 로그인(Google OAuth)을 통한 정보 수집, 서비스 내 동아리/이벤트 기능 이용 시 수집</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2 text-gray-900">2. 개인정보의 수집 및 이용 목적</h2>
          <p>수집한 개인정보는 다음의 목적을 위해 활용됩니다.</p>
          <ul className="list-disc list-inside mt-2 space-y-1 ml-2">
            <li><strong>회원 관리</strong>: 회원제 서비스 이용에 따른 본인 확인, 개인 식별, 불량 회원의 부정 이용 방지, 가입 의사 확인</li>
            <li><strong>서비스 제공</strong>: 맞춤형 동아리 및 이벤트 정보 제공, 캘린더 연동, 서비스 이용에 관한 통계 작성</li>
            <li><strong>공지사항 전달</strong>: 서비스 업데이트, 원활한 의사소통 경로 확보 및 고객 문의 응대</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2 text-gray-900">3. 개인정보의 보유 및 이용 기간</h2>
          <p>원칙적으로 이용자의 개인정보는 <strong>회원 탈퇴 시(혹은 서비스 종료 시) 지체 없이 파기</strong>합니다. 단, 관련 법령의 규정에 의하여 보존할 필요가 있는 경우 다음과 같이 관계 법령에서 정한 일정한 기간 동안 회원정보를 보관합니다.</p>
          <ul className="list-disc list-inside mt-2 space-y-1 ml-2">
            <li>소비자의 불만 또는 분쟁처리에 관한 기록: 3년 (전자상거래 등에서의 소비자보호에 관한 법률)</li>
            <li>방문(로그)에 관한 기록: 3개월 (통신비밀보호법)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2 text-gray-900">4. 개인정보의 파기절차 및 방법</h2>
          <p>이용자의 개인정보는 원칙적으로 보유 및 이용 기간이 경과하거나 목적이 달성된 후 지체 없이 파기합니다.</p>
          <ul className="list-disc list-inside mt-2 space-y-1 ml-2">
            <li><strong>파기 절차</strong>: 목적 달성 후 내부 방침 및 기타 관련 법령에 의한 정보보호 사유에 따라 지체 없이 파기합니다.</li>
            <li><strong>파기 방법</strong>: 전자적 파일 형태로 저장된 개인정보는 기록을 재생할 수 없는 기술적 방법을 사용하여 삭제합니다.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2 text-gray-900">5. 개인정보의 제3자 제공 및 위탁</h2>
          <p>팀은 원칙적으로 이용자의 개인정보를 명시한 범위 내에서만 처리하며, 이용자의 사전 동의 없이는 본래의 범위를 초과하여 처리하거나 제3자에게 제공하지 않습니다. (단, 법령의 규정에 의거하거나 수사 목적으로 요구하는 경우 제외)</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2 text-gray-900">6. 이용자의 권리와 그 행사 방법</h2>
          <p>이용자는 언제든지 등록되어 있는 자신의 개인정보를 조회하거나 수정할 수 있으며, 가입 해지(회원 탈퇴)를 요청할 수 있습니다. 개인정보 조회/수정 및 탈퇴는 서비스 내 설정 메뉴를 통하거나, 아래의 연락처로 이메일을 보내시면 지체 없이 조치하겠습니다.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2 text-gray-900">7. 개인정보 보호책임자 및 문의처</h2>
          <p>팀은 개인정보 처리에 관한 업무를 총괄해서 책임지고, 이용자의 불만 처리 및 피해 구제를 위하여 아래와 같이 연락처를 지정하고 있습니다.</p>
          <ul className="list-disc list-inside mt-2 space-y-1 ml-2">
            <li><strong>팀명</strong>: Team-Alimi</li>
            <li><strong>운영담당 이메일</strong>: team.alimi.inform@gmail.com</li>
          </ul>
        </section>
      </div>
    </div>
  );
};

export default PRIPage;
