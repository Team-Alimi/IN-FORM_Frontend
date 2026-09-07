import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import BottomSheet from "@/components/main/mobile/common/BottomSheet";
import { fetchVendors, fetchCategories } from "@/api/main/vendors";
import { fetchEvents } from "@/api/main/articles";
import { fetchMyInterestCategories, fetchMyVendors } from "@/api/main/user";
import { STATE_OPTIONS, CATEGORY_NAME_COLOR_MAP, DEFAULT_CATEGORY_COLOR } from "@/constants/filterOption";

const API_TO_STATE_KEY = {
  OPEN: "OnGoing",
  ENDING_SOON: "EndingSoon",
  UPCOMING: "UpComing",
  CLOSED: "Ended",
};

const STATUS_OPTIONS = [
  { value: "ALL",         label: "전체"   },
  { value: "OPEN",        label: "진행중" },
  { value: "ENDING_SOON", label: "마감임박" },
  { value: "UPCOMING",    label: "예정"   },
  { value: "CLOSED",      label: "마감"   },
];

const getChipClass = (value, isSelected) => {
  if (value === "ALL") {
    return isSelected
      ? "bg-primary text-white border-primary"
      : "bg-white text-gray-600 border-gray-300";
  }
  const opt = STATE_OPTIONS.find((o) => o.key === API_TO_STATE_KEY[value]);
  if (!opt) return isSelected ? "bg-gray-200 text-gray-700 border-gray-300" : "bg-white text-gray-500 border-gray-200";
  return isSelected
    ? `${opt.backgroundColor} ${opt.textColor} ${opt.borderColor}`
    : "bg-white text-gray-500 border-gray-200";
};

const FilterBottomSheet = ({ isOpen, onClose, onApply, totalCount, keyword }) => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedStatuses, setSelectedStatuses] = useState(["ALL"]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState([]);
  const [interestOnly, setInterestOnly] = useState(false);
  const [selectedVendorIds, setSelectedVendorIds] = useState([]);
  const [interestVendorOnly, setInterestVendorOnly] = useState(false);
  const [vendors, setVendors] = useState([]);
  const [previewCount, setPreviewCount] = useState(totalCount);
  const timerRef = useRef(null);
  // 체크박스로 자동 선택된 ID 추적 (해제 시 해당 칩만 선택 취소)
  const autoSelectedCategoryIdsRef = useRef([]);
  const autoSelectedVendorIdsRef = useRef([]);

  // 카테고리 목록 동적 조회
  const { data: categoriesData } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
    staleTime: 60 * 1000 * 60, // 1시간 (관리자가 바꾸지 않는 한 변동 없음)
  });
  const categories = categoriesData?.data || [];

  useEffect(() => {
    fetchVendors("SCHOOL")
      .then((res) => setVendors(res.data || []))
      .catch(() => {});
  }, []);

  // 필터 변경 시 미리 카운트 조회 (날짜 입력은 300ms 디바운스)
  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    // 상태 필터가 선택된 경우 서버에서 정확한 개수를 알 수 없으므로 표시 안 함
    if (!selectedStatuses.includes("ALL") && selectedStatuses.length > 0) {
      setPreviewCount(null);
      return;
    }

    timerRef.current = setTimeout(async () => {
      try {
        const params = {
          page: 1,
          size: 1,
          keyword: keyword || undefined,
          starts_from: startDate || undefined,
          ends_to: endDate || undefined,
          vendor_id: selectedVendorIds.length > 0 ? selectedVendorIds.join(",") : undefined,
          category_id: selectedCategoryIds.length > 0 ? selectedCategoryIds.join(",") : undefined,
        };
        const res = await fetchEvents(params);
        const apiData = res.data?.data;
        const count = apiData?.page_info?.total_items ?? 0;
        setPreviewCount(count);
      } catch {
        // 실패 시 이전 카운트 유지
      }
    }, 300);
    return () => clearTimeout(timerRef.current);
  }, [startDate, endDate, selectedVendorIds, keyword, selectedStatuses, selectedCategoryIds]);

  const toggleStatus = (value) => {
    if (value === "ALL") {
      setSelectedStatuses(["ALL"]);
      return;
    }
    setSelectedStatuses((prev) => {
      const without = prev.filter((s) => s !== "ALL");
      if (without.includes(value)) {
        const next = without.filter((s) => s !== value);
        return next.length === 0 ? ["ALL"] : next;
      }
      return [...without, value];
    });
  };

  const toggleCategory = (id) => {
    setSelectedCategoryIds((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const toggleVendor = (id) => {
    setSelectedVendorIds((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]
    );
  };

  // '관심분야만 보기' 체크 시 관심 카테고리 ID를 자동으로 선택
  // 해제 시 자동 선택됐던 칩만 취소 (수동 선택 칩은 유지)
  const handleInterestOnlyChange = async (checked) => {
    setInterestOnly(checked);
    if (checked) {
      try {
        const res = await fetchMyInterestCategories();
        const ids = (res?.data || []).map((c) => c.id);
        autoSelectedCategoryIdsRef.current = ids;
        setSelectedCategoryIds(ids);
      } catch {
        // 조회 실패 시 무시
      }
    } else {
      const ids = autoSelectedCategoryIdsRef.current;
      setSelectedCategoryIds((prev) => prev.filter((id) => !ids.includes(id)));
      autoSelectedCategoryIdsRef.current = [];
    }
  };

  // '구독한 학과만 보기' 체크 시 구독 학과 ID를 자동으로 선택
  // 해제 시 자동 선택됐던 칩만 취소 (수동 선택 칩은 유지)
  const handleInterestVendorOnlyChange = async (checked) => {
    setInterestVendorOnly(checked);
    if (checked) {
      try {
        const res = await fetchMyVendors();
        const ids = (res?.data || []).map((v) => v.id);
        autoSelectedVendorIdsRef.current = ids;
        setSelectedVendorIds(ids);
      } catch {
        // 조회 실패 시 무시
      }
    } else {
      const ids = autoSelectedVendorIdsRef.current;
      setSelectedVendorIds((prev) => prev.filter((id) => !ids.includes(id)));
      autoSelectedVendorIdsRef.current = [];
    }
  };

  const handleReset = () => {
    setStartDate("");
    setEndDate("");
    setSelectedStatuses(["ALL"]);
    setSelectedCategoryIds([]);
    setInterestOnly(false);
    autoSelectedCategoryIdsRef.current = [];
    setSelectedVendorIds([]);
    setInterestVendorOnly(false);
    autoSelectedVendorIdsRef.current = [];
  };

  const handleApply = () => {
    onApply({ startDate, endDate, selectedStatuses, categoryIds: selectedCategoryIds, vendorIds: selectedVendorIds });
    onClose();
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose}>
      {/* 일정 기간 */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[13px] font-semibold text-gray-800">
            기간 <span className="text-gray-500 font-normal">Schedule Period</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative flex-1 min-w-0">
            <div className="flex items-center gap-1.5 bg-gray-100 rounded-xl px-3 py-2.5 pointer-events-none">
              <span className="text-sm">📅</span>
              <span className={`text-sm ${startDate ? "text-gray-800" : "text-gray-400"}`}>
                {startDate || "시작일"}
              </span>
            </div>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="absolute inset-0 opacity-0 cursor-pointer w-full"
            />
          </div>
          <span className="text-gray-400 text-sm shrink-0">~</span>
          <div className="relative flex-1 min-w-0">
            <div className="flex items-center gap-1.5 bg-gray-100 rounded-xl px-3 py-2.5 pointer-events-none">
              <span className="text-sm">📅</span>
              <span className={`text-sm ${endDate ? "text-gray-800" : "text-gray-400"}`}>
                {endDate || "종료일"}
              </span>
            </div>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="absolute inset-0 opacity-0 cursor-pointer w-full"
            />
          </div>
        </div>
      </div>

      {/* 글 상태 */}
      <div className="mb-6">
        <p className="text-[13px] font-semibold text-gray-800 mb-2">
          상태 <span className="text-gray-500 font-normal">Progress</span>
        </p>
        <div className="flex flex-wrap gap-2">
          {STATUS_OPTIONS.map((opt) => {
            const isSelected = selectedStatuses.includes(opt.value);
            return (
              <button
                key={opt.value}
                onClick={() => toggleStatus(opt.value)}
                className={`px-3 py-1.5 rounded-full text-[13px] font-medium border transition-colors ${getChipClass(opt.value, isSelected)}`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 카테고리 */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[13px] font-semibold text-gray-800">
            카테고리 <span className="text-gray-500 font-normal">Category</span>
          </p>
          <label className="flex items-center gap-1.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={interestOnly}
              onChange={(e) => handleInterestOnlyChange(e.target.checked)}
              className="w-3.5 h-3.5 accent-primary cursor-pointer"
            />
            <span className="text-[12px] text-gray-500">관심분야만 보기</span>
          </label>
        </div>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => {
            const isSelected = selectedCategoryIds.includes(cat.id);
            const colorInfo = CATEGORY_NAME_COLOR_MAP[cat.name] ?? DEFAULT_CATEGORY_COLOR;
            return (
              <button
                key={cat.id}
                onClick={() => toggleCategory(cat.id)}
                className={`px-3 py-1.5 rounded-full text-[13px] font-medium border transition-colors ${
                  isSelected
                    ? `${colorInfo.dot} text-white border-transparent`
                    : "bg-white text-gray-500 border-gray-200"
                }`}
              >
                {cat.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* 학과 */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[13px] font-semibold text-gray-800">
            학과 <span className="text-gray-500 font-normal">Department</span>
          </p>
          <label className="flex items-center gap-1.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={interestVendorOnly}
              onChange={(e) => handleInterestVendorOnlyChange(e.target.checked)}
              className="w-3.5 h-3.5 accent-primary cursor-pointer"
            />
            <span className="text-[12px] text-gray-500">구독한 학과만 보기</span>
          </label>
        </div>
        <div className="flex flex-wrap gap-2 max-h-44 overflow-y-auto">
          {vendors.map((v) => {
            const isSelected = selectedVendorIds.includes(v.id);
            return (
              <button
                key={v.id}
                onClick={() => toggleVendor(v.id)}
                className={`px-3 py-1.5 rounded-full text-[13px] font-medium border transition-colors ${
                  isSelected
                    ? "bg-primary text-white border-primary"
                    : "bg-white text-gray-600 border-gray-300"
                }`}
              >
                {v.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* 하단 버튼 */}
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={handleReset}
          className="text-sm text-gray-400 underline underline-offset-2"
        >
          초기화
        </button>
        <button
          onClick={handleApply}
          className="flex-1 bg-primary text-white rounded-xl py-3 text-sm font-semibold"
        >
          {previewCount != null ? `${previewCount}개 항목 보기` : "항목 보기"}
        </button>
      </div>
    </BottomSheet>
  );
};

export default FilterBottomSheet;
