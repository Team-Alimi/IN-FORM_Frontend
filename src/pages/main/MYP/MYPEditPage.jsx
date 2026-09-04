import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useAuthStore from "@/stores/useAuthStore";
import { useDeviceStore } from "@/stores/deviceStore";
import {
  fetchMyVendors,
  putMyVendors,
  fetchMyInterestCategories,
  putMyInterestCategories,
  fetchMyClubTypes,
  putMyClubTypes,
} from "@/api/main/user";
import { fetchVendors, fetchCategories } from "@/api/main/vendors";
import TabBar from "@/components/main/desktop/common/TabBar";

// ─── 관심 동아리 유형 마스터 목록 (공개 API 없음, 하드코딩 유지) ─────────────────────
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
        ? "bg-primary text-white border-primary"
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
      <span className="text-[13px] text-primary font-medium">{count}개 선택됨</span>
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

  const [selectedVendorIds, setSelectedVendorIds] = useState(new Set());
  const [selectedCategoryIds, setSelectedCategoryIds] = useState(new Set());
  const [selectedClubTypeIds, setSelectedClubTypeIds] = useState(new Set());

  // 서버 응답으로 초기화를 최초 1회만 수행하기 위한 플래그
  const vendorInitialized = useRef(false);
  const categoryInitialized = useRef(false);
  const clubTypeInitialized = useRef(false);

  // ─── 소속 학과·기관 마스터 목록 (GET /api/v1/vendors?type=SCHOOL) ───────────────
  const {
    data: vendorListData,
    isLoading: isVendorListLoading,
    isError: isVendorListError,
  } = useQuery({
    queryKey: ["vendors", "SCHOOL"],
    queryFn: () => fetchVendors("SCHOOL"),
    staleTime: 60 * 1000 * 30,
  });

  // ─── 내가 구독 중인 학과·기관 (GET /api/v1/users/me/vendors) ────────────────────
  const {
    data: myVendorData,
    isLoading: isMyVendorLoading,
    isError: isMyVendorError,
  } = useQuery({
    queryKey: ["myVendors"],
    queryFn: fetchMyVendors,
  });

  // ─── 관심 공지 분야 마스터 목록 (GET /api/v1/categories) ─────────────────────────
  const {
    data: categoryListData,
    isLoading: isCategoryListLoading,
    isError: isCategoryListError,
  } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
    staleTime: 60 * 1000 * 30,
  });

  // ─── 내가 선택한 관심 공지 분야 (GET /api/v1/users/me/interests/categories) ───────
  const {
    data: myInterestCategoryData,
    isLoading: isMyInterestCategoryLoading,
    isError: isMyInterestCategoryError,
  } = useQuery({
    queryKey: ["myInterestCategories"],
    queryFn: fetchMyInterestCategories,
  });

  // ─── 내가 선택한 관심 동아리 유형 (GET /api/v1/users/me/interests/club-types) ──────
  const {
    data: myClubTypeData,
    isLoading: isMyClubTypeLoading,
    isError: isMyClubTypeError,
  } = useQuery({
    queryKey: ["myClubTypes"],
    queryFn: fetchMyClubTypes,
  });

  // 서버에서 가져온 선택 목록으로 초기 상태 설정 (최초 1회만 실행)
  useEffect(() => {
    if (myVendorData?.data && !vendorInitialized.current) {
      setSelectedVendorIds(new Set(myVendorData.data.map((v) => v.id)));
      vendorInitialized.current = true;
    }
  }, [myVendorData]);

  useEffect(() => {
    if (myInterestCategoryData?.data && !categoryInitialized.current) {
      setSelectedCategoryIds(new Set(myInterestCategoryData.data.map((c) => c.id)));
      categoryInitialized.current = true;
    }
  }, [myInterestCategoryData]);

  useEffect(() => {
    if (myClubTypeData?.data && !clubTypeInitialized.current) {
      setSelectedClubTypeIds(new Set(myClubTypeData.data.map((c) => c.id)));
      clubTypeInitialized.current = true;
    }
  }, [myClubTypeData]);

  /******** 핸들러 ********/

  const handleVendorToggle = (id) => {
    setSelectedVendorIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

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
        putMyVendors([...selectedVendorIds]),
        putMyInterestCategories([...selectedCategoryIds]),
        putMyClubTypes([...selectedClubTypeIds]),
      ]),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myVendors"] });
      queryClient.invalidateQueries({ queryKey: ["myInterestCategories"] });
      queryClient.invalidateQueries({ queryKey: ["myClubTypes"] });
      navigate(-1);
    },
    onError: (error) => {
      console.error("관심사 저장 실패:", error);
      alert("저장 중 오류가 발생했습니다.");
    },
  });

  const hasError =
    isVendorListError || isMyVendorError ||
    isCategoryListError || isMyInterestCategoryError ||
    isMyClubTypeError;

  const handleSave = () => {
    if (saveMutation.isPending || hasError) return;
    saveMutation.mutate();
  };

  const isLoading =
    isVendorListLoading || isMyVendorLoading ||
    isCategoryListLoading || isMyInterestCategoryLoading ||
    isMyClubTypeLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-[14px] text-gray-400">불러오는 중...</p>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white gap-3">
        <p className="text-[14px] text-gray-500">정보를 불러오지 못했습니다.</p>
        <button
          onClick={() => navigate(-1)}
          className="text-[13px] text-primary font-medium"
        >
          돌아가기
        </button>
      </div>
    );
  }

  // ─── 컨텐츠 (모바일/데스크톱 공통) ────────────────────────────────────────────
  const content = (
    <>
      {/* 모바일 고정 헤더 — MobileHeader와 동일한 스타일 (px-5, pt-6 pb-4, bold 대형 타이틀) */}
      {isMobile && (
        <>
          <div className="h-[76px]" />
          <header className="fixed top-0 left-0 right-0 z-50 w-full bg-white px-5 pt-6 pb-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate(-1)}
                aria-label="뒤로가기"
                className="w-8 h-8 flex items-center justify-center shrink-0"
              >
                <BackIcon />
              </button>
              <span className="text-[22px] font-bold text-gray-900 leading-tight truncate">
                프로필 및 관심사 수정
              </span>
            </div>
          </header>
        </>
      )}

      {/* 데스크톱 인라인 헤더 */}
      {!isMobile && (
        <div className="flex items-center gap-1 pt-4 pb-2 px-4">
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
            <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
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
                <p className="text-[12px] font-semibold text-emerald-500 mt-1.5">
                  학교 인증 완료
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ─── 소속 학과·기관 (다중 선택, GET /api/v1/vendors?type=SCHOOL) ── */}
        <SectionTitle
          title="소속 학과·기관"
          subtitle="소속된 학과·기관을 선택해 주세요."
          count={selectedVendorIds.size}
        />
        <div className="mx-4 bg-white rounded-2xl border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.06)] px-4 py-4">
          <div className="flex flex-wrap gap-2">
            {vendorListData?.data?.map((vendor) => (
              <Chip
                key={vendor.id}
                label={vendor.name}
                selected={selectedVendorIds.has(vendor.id)}
                onClick={() => handleVendorToggle(vendor.id)}
              />
            ))}
          </div>
        </div>

        {/* ─── 관심 공지 분야 (GET /api/v1/categories) ── */}
        <SectionTitle
          title="관심 공지 분야"
          subtitle="수신받고 싶은 공지 카테고리를 선택해 주세요."
          count={selectedCategoryIds.size}
        />
        <div className="mx-4 bg-white rounded-2xl border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.06)] px-4 py-4">
          <div className="flex flex-wrap gap-2">
            {categoryListData?.data?.map((category) => (
              <Chip
                key={category.id}
                label={category.name}
                selected={selectedCategoryIds.has(category.id)}
                onClick={() => handleCategoryToggle(category.id)}
              />
            ))}
          </div>
        </div>

        {/* ─── 관심 동아리 카테고리 (하드코딩 마스터 목록, 공개 API 없음) ── */}
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
            className="w-full py-3.5 rounded-2xl font-bold text-[15px] bg-primary text-white disabled:opacity-50 transition-all active:scale-[0.98]"
          >
            {saveMutation.isPending ? "저장 중..." : "저장"}
          </button>
        </div>
      </div>
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
