import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useAuthStore from "@/stores/useAuthStore";
import { useDeviceStore } from "@/stores/deviceStore";
import {
  fetchMyInterestCategories,
  putMyInterestCategories,
  fetchMyClubTypes,
  putMyClubTypes,
} from "@/api/main/user";
import TabBar from "@/components/main/desktop/common/TabBar";
import DepartmentEditSheet from "@/components/main/adaptive/feature/MYP/DepartmentEditSheet";
import DepartmentEditModal from "@/components/main/adaptive/feature/MYP/DepartmentEditModal";

// ─── 관심 공지 분야 마스터 목록 ──────────────────────────────────────────────────
const INTEREST_CATEGORY_LIST = [
  { id: 1, name: "학사" },
  { id: 2, name: "장학금" },
  { id: 3, name: "공모전·대회" },
  { id: 4, name: "특강·세미나" },
  { id: 5, name: "취업·인턴십" },
  { id: 6, name: "행사·축제" },
  { id: 7, name: "봉사활동" },
  { id: 8, name: "어학시험" },
  { id: 9, name: "자격증" },
  { id: 10, name: "학술·연구" },
];

// ─── 관심 동아리 유형 마스터 목록 ────────────────────────────────────────────────
const INTEREST_CLUB_TYPE_LIST = [
  { id: 1, name: "학술/IT" },
  { id: 2, name: "체육/스포츠" },
  { id: 3, name: "음악/공연" },
  { id: 4, name: "봉사" },
  { id: 5, name: "문화·예술" },
  { id: 6, name: "창업" },
  { id: 7, name: "댄스" },
  { id: 8, name: "종교" },
];

// ─── 선택 칩 컴포넌트 ────────────────────────────────────────────────────────────
const Chip = ({ label, selected, onClick }) => (
  <button
    onClick={onClick}
    className={`px-3.5 py-2 rounded-full text-[13px] font-medium transition-colors border ${
      selected
        ? "bg-[#4068f7] text-white border-[#4068f7]"
        : "bg-white text-gray-500 border-gray-200"
    }`}
  >
    {label}
  </button>
);

// ─── 섹션 제목 컴포넌트 ──────────────────────────────────────────────────────────
const SectionTitle = ({ title, subtitle, count }) => (
  <div className="px-4 pt-6 pb-3">
    <div className="flex items-center justify-between">
      <h2 className="text-[15px] font-bold text-gray-900">{title}</h2>
      <span className="text-[13px] text-[#4068f7] font-medium">{count}개 선택됨</span>
    </div>
    <p className="text-[13px] text-gray-400 mt-1">{subtitle}</p>
  </div>
);

// ─── 뒤로가기 버튼 공통 SVG ──────────────────────────────────────────────────────
const BackIcon = () => (
  <svg
    className="w-5 h-5 text-gray-700"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2.5}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
  </svg>
);

const MYPEditPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isMobile = useDeviceStore((state) => state.isMobile);
  const userInfo = useAuthStore((state) => state.userInfo);

  const [isEditMajorOpen, setIsEditMajorOpen] = useState(false);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState(new Set());
  const [selectedClubTypeIds, setSelectedClubTypeIds] = useState(new Set());

  // ─── 관심 공지 분야 조회 ───────────────────────────────────────────────────────
  const { data: categoryData, isLoading: isCategoryLoading, isError: isCategoryError } = useQuery({
    queryKey: ["myInterestCategories"],
    queryFn: fetchMyInterestCategories,
  });

  // ─── 관심 동아리 유형 조회 ─────────────────────────────────────────────────────
  const { data: clubTypeData, isLoading: isClubTypeLoading, isError: isClubTypeError } = useQuery({
    queryKey: ["myClubTypes"],
    queryFn: fetchMyClubTypes,
  });

  // 서버에서 가져온 선택 목록으로 초기 상태 설정
  useEffect(() => {
    if (categoryData?.data) {
      setSelectedCategoryIds(new Set(categoryData.data.map((c) => c.id)));
    }
  }, [categoryData]);

  useEffect(() => {
    if (clubTypeData?.data) {
      setSelectedClubTypeIds(new Set(clubTypeData.data.map((c) => c.id)));
    }
  }, [clubTypeData]);

  /******** 핸들러 ********/

  const handleCategoryToggle = (id) => {
    setSelectedCategoryIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleClubTypeToggle = (id) => {
    setSelectedClubTypeIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // ─── 저장 mutation ─────────────────────────────────────────────────────────────
  const saveMutation = useMutation({
    mutationFn: () =>
      Promise.all([
        putMyInterestCategories([...selectedCategoryIds]),
        putMyClubTypes([...selectedClubTypeIds]),
      ]),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myInterestCategories"] });
      queryClient.invalidateQueries({ queryKey: ["myClubTypes"] });
      navigate(-1);
    },
    onError: (error) => {
      console.error("관심사 저장 실패:", error);
      alert("저장 중 오류가 발생했습니다.");
    },
  });

  const handleSave = () => {
    if (saveMutation.isPending || isCategoryError || isClubTypeError) return;
    saveMutation.mutate();
  };

  if (isCategoryLoading || isClubTypeLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-[14px] text-gray-400">불러오는 중...</p>
      </div>
    );
  }

  if (isCategoryError || isClubTypeError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white gap-3">
        <p className="text-[14px] text-gray-500">관심사 정보를 불러오지 못했습니다.</p>
        <button
          onClick={() => navigate(-1)}
          className="text-[13px] text-[#4068f7] font-medium"
        >
          돌아가기
        </button>
      </div>
    );
  }

  // ─── 컨텐츠 (모바일/데스크톱 공통) ────────────────────────────────────────────
  const content = (
    <>
      {/* 모바일 고정 헤더 */}
      {isMobile && (
        <>
          <div className="h-[56px]" />
          <header className="fixed top-0 left-0 right-0 z-50 bg-white px-2 pt-3 pb-3 border-b border-gray-100">
            <div className="flex items-center gap-1">
              <button
                onClick={() => navigate(-1)}
                className="w-10 h-10 flex items-center justify-center"
              >
                <BackIcon />
              </button>
              <span className="text-[17px] font-bold text-gray-900">프로필 및 관심사 수정</span>
            </div>
          </header>
        </>
      )}

      {/* 데스크톱 인라인 헤더 */}
      {!isMobile && (
        <div className="flex items-center gap-1 pt-4 pb-2 px-2">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          >
            <BackIcon />
          </button>
          <span className="text-[18px] font-bold text-gray-900">프로필 및 관심사 수정</span>
        </div>
      )}

      {/* 본문 */}
      <div className="flex flex-col pb-28">

        {/* ─── 프로필 정보 ── */}
        <div className="mx-4 mt-2 bg-white rounded-2xl border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.06)] px-5 py-5">
          <div className="flex items-center gap-4">
            {/* 아바타 */}
            <div className="w-[56px] h-[56px] bg-blue-100 rounded-full flex items-center justify-center shrink-0">
              <svg className="w-8 h-8 text-blue-400 mt-1" fill="currentColor" viewBox="0 2.5 24 24">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
            </div>

            {/* 이름 / 이메일 */}
            <div className="flex-1 min-w-0">
              <p className="text-[17px] font-bold text-gray-900 truncate">
                {userInfo?.name || "익명의 뷰어"}
              </p>
              <p className="text-[13px] text-gray-400 mt-0.5 truncate">
                {userInfo?.email || ""}
              </p>
              {userInfo && (
                <p className="text-[12px] font-semibold text-[#4068f7] mt-1.5">
                  학교 인증 완료
                </p>
              )}
            </div>
          </div>

          {/* 소속 학과/기관 */}
          {userInfo && (
            <div className="mt-4 pt-4 border-t border-gray-50">
              <p className="text-[12px] font-medium text-gray-400 mb-2">소속 학과/기관</p>
              <div
                onClick={() => setIsEditMajorOpen(true)}
                className="flex items-center justify-between cursor-pointer active:opacity-70 transition-opacity"
              >
                <span className="text-[14px] font-medium text-gray-700">
                  {userInfo?.major?.vendor_name || "학과 미설정"}
                </span>
                <svg
                  className="w-4 h-4 text-gray-300 shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          )}
        </div>

        {/* ─── 관심 공지 분야 ── */}
        <SectionTitle
          title="관심 공지 분야"
          subtitle="수신받고 싶은 공지 카테고리를 선택해 주세요."
          count={selectedCategoryIds.size}
        />
        <div className="mx-4 bg-white rounded-2xl border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.06)] px-4 py-4">
          <div className="flex flex-wrap gap-2">
            {INTEREST_CATEGORY_LIST.map((category) => (
              <Chip
                key={category.id}
                label={category.name}
                selected={selectedCategoryIds.has(category.id)}
                onClick={() => handleCategoryToggle(category.id)}
              />
            ))}
          </div>
        </div>

        {/* ─── 관심 동아리 카테고리 ── */}
        <SectionTitle
          title="관심 동아리 카테고리"
          subtitle="추천받고 싶은 동아리 분야를 선택해 주세요."
          count={selectedClubTypeIds.size}
        />
        <div className="mx-4 bg-white rounded-2xl border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.06)] px-4 py-4">
          <div className="flex flex-wrap gap-2">
            {INTEREST_CLUB_TYPE_LIST.map((clubType) => (
              <Chip
                key={clubType.id}
                label={clubType.name}
                selected={selectedClubTypeIds.has(clubType.id)}
                onClick={() => handleClubTypeToggle(clubType.id)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ─── 고정 저장 버튼 ── */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm border-t border-gray-100 px-4 py-3">
        <div className={isMobile ? "" : "max-w-2xl mx-auto"}>
          <button
            onClick={handleSave}
            disabled={saveMutation.isPending}
            className="w-full py-3.5 rounded-2xl font-bold text-[15px] bg-gray-900 text-white disabled:opacity-50 transition-all active:scale-[0.98]"
          >
            {saveMutation.isPending ? "저장 중..." : "저장"}
          </button>
        </div>
      </div>

      {/* ─── 학과 수정: 모바일 → Sheet / 데스크톱 → Modal ── */}
      {isMobile ? (
        <DepartmentEditSheet
          isOpen={isEditMajorOpen}
          onClose={() => setIsEditMajorOpen(false)}
        />
      ) : (
        <DepartmentEditModal
          isOpen={isEditMajorOpen}
          onClose={() => setIsEditMajorOpen(false)}
        />
      )}
    </>
  );

  // ─── 모바일 레이아웃 ─────────────────────────────────────────────────────────
  if (isMobile) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        {content}
      </div>
    );
  }

  // ─── 데스크톱 레이아웃 ───────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col bg-[#f8f9fa]">
      <TabBar />
      <main className="flex-1 w-full max-w-2xl mx-auto px-4 flex flex-col">
        {content}
      </main>
    </div>
  );
};

export default MYPEditPage;
