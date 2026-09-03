import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  IoChevronBackOutline,
  IoChevronForwardOutline,
  IoBookOutline,
  IoFootballOutline,
  IoMusicalNotesOutline,
  IoHeartOutline,
  IoBrushOutline,
  IoBulbOutline,
  IoBodyOutline,
  IoLeafOutline,
} from "react-icons/io5";
import { fetchCategories, fetchClubTypes, fetchVendors } from "@/api/main/vendors";
import {
  putMyInterestCategories,
  putMyVendors,
  putMyClubTypes,
  postOnboardingComplete,
} from "@/api/main/user";
import useAuthStore from "@/stores/useAuthStore";
import { useDeviceStore } from "@/stores/deviceStore";
import SearchBar from "@/components/main/adaptive/common/SearchBar";

// 카테고리 이름 → 이모지 매핑 (API가 이모지를 제공하지 않아 프론트에서 매핑)
const CATEGORY_EMOJI_MAP = {
  학사: "🎓",
  장학금: "💰",
  "공모전·대회": "🏆",
  "특강·세미나": "✏️",
  "취업·인턴십": "💼",
  "행사·축제": "🎉",
  봉사활동: "🤝",
  어학시험: "📝",
  자격증: "📋",
  "학술·연구": "🔬",
  교환학생: "✈️",
  "창업·스타트업": "🚀",
  "문화·예술": "🎨",
  "스포츠·체육": "⚽",
  "멘토링·네트워킹": "🌐",
  지원사업: "📢",
};

// 동아리 유형 이름 → 아이콘 매핑
const CLUB_TYPE_ICON_MAP = {
  "학술/IT": IoBookOutline,
  "체육/스포츠": IoFootballOutline,
  "음악/공연": IoMusicalNotesOutline,
  봉사: IoHeartOutline,
  "문화·예술": IoBrushOutline,
  창업: IoBulbOutline,
  댄스: IoBodyOutline,
  종교: IoLeafOutline,
};

// 단계별 제목/부제 텍스트
const STEP_INFO = [
  {
    title: "관심 있는 분야를\n선택해 주세요",
    sub: "중복 선택이 가능해요",
  },
  {
    title: "소속 학교 또는\n관심 기관을 선택해 주세요",
    sub: "맞춤 공지사항을 불러오기 위해 필요해요",
  },
  {
    title: "어떤 동아리에\n관심이 있으신가요?",
    sub: "관심사에 맞는 동아리를 추천해 드릴게요",
  },
];

const ONBPage = () => {
  const navigate = useNavigate();
  const isMobile = useDeviceStore((state) => state.isMobile);
  const setUserInfo = useAuthStore((state) => state.setUserInfo);

  const [step, setStep] = useState(1);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState(new Set());
  const [selectedVendorIds, setSelectedVendorIds] = useState(new Set());
  const [selectedClubTypeIds, setSelectedClubTypeIds] = useState(new Set());
  const [vendorSearchQuery, setVendorSearchQuery] = useState("");

  /******** 데이터 조회 ********/
  const { data: categoriesRes } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
    staleTime: 60 * 1000 * 60,
  });

  const { data: vendorsRes } = useQuery({
    queryKey: ["vendors", "SCHOOL"],
    queryFn: () => fetchVendors("SCHOOL"),
    staleTime: 60 * 1000 * 60,
  });

  const { data: clubTypesRes } = useQuery({
    queryKey: ["clubTypes"],
    queryFn: fetchClubTypes,
    staleTime: 60 * 1000 * 60,
  });

  const categories = categoriesRes?.data ?? [];
  const vendors = vendorsRes?.data ?? [];
  const clubTypes = clubTypesRes?.data ?? [];

  // 검색어로 필터링된 기관 목록
  const filteredVendors = useMemo(() => {
    const q = vendorSearchQuery.trim();
    if (!q) return vendors;
    return vendors.filter((v) => v.name.includes(q));
  }, [vendors, vendorSearchQuery]);

  /******** Mutation ********/
  const categoryMutation = useMutation({
    mutationFn: (ids) => putMyInterestCategories([...ids]),
    onSuccess: () => setStep(2),
    onError: (e) => console.error("[ONB] putMyInterestCategories 에러:", e),
  });

  const vendorMutation = useMutation({
    mutationFn: (ids) => putMyVendors([...ids]),
    onSuccess: () => setStep(3),
    onError: (e) => console.error("[ONB] putMyVendors 에러:", e),
  });

  const clubTypeMutation = useMutation({
    mutationFn: async (ids) => {
      await putMyClubTypes([...ids]);
      return postOnboardingComplete();
    },
    onSuccess: (res) => {
      if (res?.data) setUserInfo(res.data);
      navigate("/");
    },
    onError: (e) => console.error("[ONB] clubTypes/complete 에러:", e),
  });

  // 건너뛰기 최종 단계용 — club-types PUT 없이 완료 처리
  const completeMutation = useMutation({
    mutationFn: postOnboardingComplete,
    onSuccess: (res) => {
      if (res?.data) setUserInfo(res.data);
      navigate("/");
    },
    onError: (e) => console.error("[ONB] onboardingComplete 에러:", e),
  });

  const isLoading =
    categoryMutation.isPending ||
    vendorMutation.isPending ||
    clubTypeMutation.isPending ||
    completeMutation.isPending;

  /******** 핸들러 ********/
  const handleBack = () => {
    if (step > 1) setStep(step - 1);
    else navigate(-1);
  };

  const handleSkip = () => {
    if (step < 3) setStep(step + 1);
    else completeMutation.mutate();
  };

  const handleToggleCategory = (id) => {
    setSelectedCategoryIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleToggleVendor = (id) => {
    setSelectedVendorIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleToggleClubType = (id) => {
    setSelectedClubTypeIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleNext = () => {
    if (step === 1) {
      if (selectedCategoryIds.size === 0) {
        alert("최소 1개 이상 선택해주세요.");
        return;
      }
      categoryMutation.mutate(selectedCategoryIds);
    } else if (step === 2) {
      if (selectedVendorIds.size === 0) {
        alert("최소 1개 이상 선택해주세요.");
        return;
      }
      vendorMutation.mutate(selectedVendorIds);
    } else {
      if (selectedClubTypeIds.size === 0) {
        alert("최소 1개 이상 선택해주세요.");
        return;
      }
      clubTypeMutation.mutate(selectedClubTypeIds);
    }
  };

  /******** 렌더링 ********/
  const { title, sub } = STEP_INFO[step - 1];

  const card = (
    <div className={`flex flex-col bg-white w-full ${isMobile ? "h-dvh" : "flex-1"}`}>
      {/* 헤더: 뒤로가기 + 진행 바 + 건너뛰기 */}
      <div className="flex items-center justify-between px-5 pt-10 pb-6">
        <button onClick={handleBack} className="p-1 -ml-1" aria-label="이전 단계">
          <IoChevronBackOutline className="text-[22px] text-gray-800" />
        </button>
        <div className="flex gap-1.5">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1 w-8 rounded-full transition-colors duration-300 ${
                s <= step ? "bg-gray-900" : "bg-gray-200"
              }`}
            />
          ))}
        </div>
        <button
          onClick={handleSkip}
          disabled={isLoading}
          className="text-[14px] text-gray-500 disabled:opacity-40"
        >
          건너뛰기
        </button>
      </div>

      {/* 제목 */}
      <div className="px-5 mb-6">
        <h1 className="text-[24px] font-bold text-gray-900 whitespace-pre-line leading-tight mb-1.5">
          {title}
        </h1>
        <p className="text-[14px] text-gray-400">{sub}</p>
      </div>

      {/* 선택 영역 */}
      <div className="flex-1 overflow-y-auto px-5">
        {/* Step 1 — 관심 분야 pill 칩 */}
        {step === 1 && (
          <div className="flex flex-wrap gap-2 pb-4">
            {categories.map((cat) => {
              const selected = selectedCategoryIds.has(cat.id);
              const emoji = CATEGORY_EMOJI_MAP[cat.name] ?? "📌";
              return (
                <button
                  key={cat.id}
                  onClick={() => handleToggleCategory(cat.id)}
                  className={`flex items-center gap-1.5 px-4 py-2.5 rounded-full text-[14px] font-medium transition-colors ${
                    selected
                      ? "bg-gray-900 text-white"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  <span>{emoji}</span>
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Step 2 — 소속 기관 리스트 */}
        {step === 2 && (
          <>
            {/* 검색바 (스크롤 시 상단 고정) */}
            <div className="sticky top-0 bg-white pb-3 z-10">
              <SearchBar
                value={vendorSearchQuery}
                onChange={(e) => setVendorSearchQuery(e.target.value)}
                placeholder="학과 또는 기관 이름 검색"
              />
            </div>
            <div className="divide-y divide-gray-100 pb-4">
              {filteredVendors.length > 0 ? (
                filteredVendors.map((vendor) => {
                  const selected = selectedVendorIds.has(vendor.id);
                  return (
                    <button
                      key={vendor.id}
                      onClick={() => handleToggleVendor(vendor.id)}
                      className="flex items-center justify-between w-full py-4 text-left"
                    >
                      <span
                        className={`text-[15px] ${
                          selected ? "text-gray-900 font-medium" : "text-gray-800"
                        }`}
                      >
                        {vendor.name}
                      </span>
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                          selected ? "border-gray-900 bg-gray-900" : "border-gray-300"
                        }`}
                      >
                        {selected && (
                          <svg
                            className="w-3 h-3 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={3}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        )}
                      </div>
                    </button>
                  );
                })
              ) : (
                <p className="py-8 text-center text-[14px] text-gray-400">
                  검색 결과가 없어요
                </p>
              )}
            </div>
          </>
        )}

        {/* Step 3 — 동아리 유형 아이콘 카드 */}
        {step === 3 && (
          <div className="grid grid-cols-3 gap-3 pb-4">
            {clubTypes.map((ct) => {
              const selected = selectedClubTypeIds.has(ct.id);
              const Icon = CLUB_TYPE_ICON_MAP[ct.name];
              return (
                <button
                  key={ct.id}
                  onClick={() => handleToggleClubType(ct.id)}
                  className={`flex flex-col items-center gap-2 py-4 rounded-xl transition-colors ${
                    selected
                      ? "bg-gray-900 text-white"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {Icon && <Icon className="text-[24px]" />}
                  <span className="text-[13px] font-medium">{ct.name}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 다음 / 시작하기 버튼 (pill, 우측 정렬) */}
      <div className="flex justify-end px-5 pb-10 pt-4">
        <button
          onClick={handleNext}
          disabled={isLoading}
          className="flex items-center gap-1 px-6 py-3.5 rounded-full bg-gray-900 text-white text-[15px] font-semibold disabled:opacity-60 transition-opacity"
        >
          <span>{isLoading ? "저장 중..." : step === 3 ? "시작하기" : "다음"}</span>
          {!isLoading && <IoChevronForwardOutline className="text-[16px]" />}
        </button>
      </div>
    </div>
  );

  if (isMobile) return card;

  // 데스크톱: 로그인 페이지와 동일한 2단 분할 레이아웃 (좌=브랜딩, 우=폼)
  return (
    <div className="flex w-full h-dvh">
      {/* 왼쪽: 브랜딩 패널 — 로그인 페이지와 동일한 디자인 */}
      <div className="hidden md:flex flex-col w-1/2 bg-[#0056b3] items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-blue-400/20 rounded-full blur-3xl" />
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center mb-6 shadow-2xl">
            <img src="/inform_icon.png" alt="InForm Logo" className="w-16 h-auto" />
          </div>
          <h1 className="text-white text-5xl font-black mb-4 tracking-tight">IN:FORM</h1>
          <p className="text-white/90 text-lg font-medium text-center leading-relaxed">
            인하대학교의 모든 공지사항을<br />바로 이곳에서 한번에
          </p>
        </div>
      </div>
      {/* 오른쪽: 폼 패널 — h-full로 컨테이너 높이(dvh)를 채움 */}
      <div className="flex flex-col w-full md:w-1/2 bg-white h-full overflow-hidden">
        <div className="flex-1 flex flex-col w-full max-w-[460px] mx-auto min-h-0">{card}</div>
      </div>
    </div>
  );
};

export default ONBPage;
