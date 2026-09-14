import React from "react";

const TOSPage = () => {
    return (
        <div className="max-w-3xl mx-auto px-4 py-12 md:py-20 text-gray-800 bg-white">
            <h1 className="text-2xl md:text-3xl font-bold mb-6 border-b pb-4">
                서비스 이용약관
            </h1>
            <p className="mb-8 text-sm text-gray-500">
                시행일: 2026년 3월 2일
            </p>

            <div className="space-y-6 text-sm leading-relaxed text-gray-700">
                <section>
                    <h2 className="text-lg font-semibold mb-2 text-gray-900">제1조 (목적)</h2>
                    <p>
                        본 약관은 <strong>Team-Alimi</strong>(이하 '팀')가 제공하는 <strong>IN-FORM(인폼)</strong> 관련 서비스(이하 '서비스')의 이용과 관련하여, 팀과 이용자 간의 권리, 의무, 책임 사항 및 기타 필요한 사항을 규정함을 목적으로 합니다.
                    </p>
                </section>

                <section>
                    <h2 className="text-lg font-semibold mb-2 text-gray-900">제2조 (약관의 효력 및 변경)</h2>
                    <ol className="list-decimal list-inside mt-2 space-y-1 ml-2">
                        <li>본 약관은 서비스를 이용하고자 하는 모든 이용자에게 효력을 발생합니다.</li>
                        <li>팀은 서비스 화면에 본 약관을 게시하거나 기타의 방법으로 이용자에게 공지함으로써 효력을 발생시킵니다.</li>
                        <li>팀은 관련 법령을 위배하지 않는 범위 내에서 본 약관을 변경할 수 있으며, 변경된 약관은 적용일자 7일 전부터 서비스 내 공지사항을 통해 미리 안내합니다.</li>
                    </ol>
                </section>

                <section>
                    <h2 className="text-lg font-semibold mb-2 text-gray-900">제3조 (이용계약의 체결 및 소셜 로그인)</h2>
                    <ol className="list-decimal list-inside mt-2 space-y-1 ml-2">
                        <li>이용계약은 이용자가 본 약관 및 개인정보처리방침에 동의하고, 타사 소셜 계정(Google 등)을 연동하여 로그인을 완료함과 동시에 체결됩니다.</li>
                        <li>팀은 부정한 목적이나 비정상적인 방법으로 서비스를 이용하려는 가입에 대해 서비스 이용을 제한하거나 계정을 정지할 수 있습니다.</li>
                    </ol>
                </section>

                <section>
                    <h2 className="text-lg font-semibold mb-2 text-gray-900">제4조 (서비스의 제공 및 변경)</h2>
                    <ol className="list-decimal list-inside mt-2 space-y-1 ml-2">
                        <li>팀은 이용자에게 캘린더, 동아리/이벤트 정보 탐색 및 상세 정보 열람 등의 서비스를 제공합니다.</li>
                        <li>팀은 원활한 서비스 제공을 위하여 필요에 따라 서비스의 내용(기능, 화면 구성 등)을 추가, 변경, 삭제할 수 있습니다.</li>
                    </ol>
                </section>

                <section>
                    <h2 className="text-lg font-semibold mb-2 text-gray-900">제5조 (이용자의 의무)</h2>
                    <ol className="list-decimal list-inside mt-2 space-y-1 ml-2">
                        <li>
                            이용자는 서비스를 이용함에 있어 다음의 행위를 하여서는 안 됩니다.
                            <ul className="list-disc list-inside mt-1 space-y-1 ml-4 text-gray-600">
                                <li>타인의 정보 도용 및 허위 정보 입력</li>
                                <li>팀이 게시한 정보의 임의 변경 또는 서비스 운영 방해</li>
                                <li>선정적이거나 폭력적인 콘텐츠, 타인에게 혐오감을 주는 내용 게시 및 유포</li>
                                <li>팀 및 제3자의 저작권 등 지적재산권 침해</li>
                            </ul>
                        </li>
                        <li>위 항의 행위를 한 경우 팀은 해당 이용자의 서비스 이용을 제한할 수 있습니다.</li>
                    </ol>
                </section>

                <section>
                    <h2 className="text-lg font-semibold mb-2 text-gray-900">제6조 (계약 해지 및 이용 제한)</h2>
                    <ol className="list-decimal list-inside mt-2 space-y-1 ml-2">
                        <li>이용자는 언제든지 서비스 내 회원 탈퇴를 통해 이용계약을 해지할 수 있습니다.</li>
                        <li>팀은 이용자가 제5조에 명시된 의무를 위반한 경우, 사전 통지 없이 이용계약을 해지하거나 서비스 이용을 중지시킬 수 있습니다.</li>
                    </ol>
                </section>

                <section>
                    <h2 className="text-lg font-semibold mb-2 text-gray-900">제7조 (면책 조항)</h2>
                    <ol className="list-decimal list-inside mt-2 space-y-1 ml-2">
                        <li>팀은 천재지변, 점검, 통신 장애 등 불가항력적인 사유로 인해 서비스를 제공할 수 없는 경우 서비스 제공에 대한 책임을 지지 않습니다.</li>
                        <li>팀은 이용자가 서비스 내에 게시하거나 제공한 정보(동아리/이벤트 상세 정보 등), 자료, 사실의 신뢰도, 정확성 등에 대해서는 원칙적으로 책임을 지지 않으며, 이를 바탕으로 한 상호 간의 분쟁에 개입할 의무가 없습니다.</li>
                        <li>팀은 무료로 제공되는 서비스 이용과 관련하여 이용자에게 발생한 어떠한 손해에 대해서도 책임을 지지 않습니다.</li>
                    </ol>
                </section>

                <section>
                    <h2 className="text-lg font-semibold mb-2 text-gray-900">제8조 (관할 법원)</h2>
                    <p>
                        서비스 이용으로 발생한 분쟁에 대해 소송이 제기될 경우, 대한민국 법령을 적용하며 관할 법원은 팀의 주소지를 관할하는 법원으로 합니다.
                    </p>
                </section>
            </div>
        </div>
    );
};

export default TOSPage;
