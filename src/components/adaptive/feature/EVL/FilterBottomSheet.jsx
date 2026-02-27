import { useState, useEffect, useRef } from "react";
import BottomSheet from "../../../mobile/common/BottomSheet";
import { getVendors } from "../../../../api/getVendors";
import { fetchEvents } from "../../../../api/schoolArticles";
import { STATE_OPTIONS } from "../../../../constants/filterOption";

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
      ? "bg-blue-500 text-white border-blue-500"
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
  const [selectedVendorIds, setSelectedVendorIds] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [previewCount, setPreviewCount] = useState(totalCount);
  const timerRef = useRef(null);

  useEffect(() => {
    getVendors("SCHOOL")
      .then((res) => setVendors(res.data || []))
      .catch(() => {});
  }, []);

  // 필터 변경 시 미리 카운트 조회 (날짜 입력은 300ms 디바운스)
  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      try {
        const statusParam = selectedStatuses.includes("ALL")
          ? undefined
          : selectedStatuses.join(",");
        const params = {
          page: 1,
          size: 1,
          keyword: keyword || undefined,
          start_date: startDate || undefined,
          end_date: endDate || undefined,
          vendor_id: selectedVendorIds.length > 0 ? selectedVendorIds.join(",") : undefined,
          status: statusParam,
        };
        const res = await fetchEvents(params);
        const apiData = res.data?.data;
        const count = apiData?.page_info?.total_articles ?? apiData?.school_articles?.length ?? 0;
        setPreviewCount(count);
      } catch {
        // 실패 시 이전 카운트 유지
      }
    }, 300);
    return () => clearTimeout(timerRef.current);
  }, [startDate, endDate, selectedVendorIds, keyword, selectedStatuses]);

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

  const toggleVendor = (id) => {
    setSelectedVendorIds((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]
    );
  };

  const handleReset = () => {
    setStartDate("");
    setEndDate("");
    setSelectedStatuses(["ALL"]);
    setSelectedVendorIds([]);
  };

  const handleApply = () => {
    onApply({ startDate, endDate, selectedStatuses, vendorIds: selectedVendorIds });
    onClose();
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} className="max-h-[85vh] overflow-y-auto">
      {/* 일정 기간 */}
      <div className="mb-6">
        <p className="text-[13px] font-semibold text-gray-800 mb-2">
          일정 기간 <span className="text-gray-500 font-normal">Schedule Period</span>
        </p>
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="flex-1 bg-[#F4F4F4] rounded-xl px-3 py-2 text-sm text-gray-700 outline-none"
          />
          <span className="text-gray-400 text-sm">~</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="flex-1 bg-[#F4F4F4] rounded-xl px-3 py-2 text-sm text-gray-700 outline-none"
          />
        </div>
      </div>

      {/* 글 상태 */}
      <div className="mb-6">
        <p className="text-[13px] font-semibold text-gray-800 mb-2">
          글 상태 <span className="text-gray-500 font-normal">Progress</span>
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

      {/* 학과 */}
      <div className="mb-8">
        <p className="text-[13px] font-semibold text-gray-800 mb-2">
          학과 <span className="text-gray-500 font-normal">Department</span>
        </p>
        <div className="flex flex-wrap gap-2">
          {vendors.map((v) => {
            const isSelected = selectedVendorIds.includes(v.vendor_id);
            return (
              <button
                key={v.vendor_id}
                onClick={() => toggleVendor(v.vendor_id)}
                className={`px-3 py-1.5 rounded-full text-[13px] font-medium border transition-colors ${
                  isSelected
                    ? "bg-blue-500 text-white border-blue-500"
                    : "bg-white text-gray-600 border-gray-300"
                }`}
              >
                {v.vendor_name}
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
          className="flex-1 bg-blue-500 text-white rounded-xl py-3 text-sm font-semibold"
        >
          {previewCount != null ? `${previewCount}개 항목 보기` : "항목 보기"}
        </button>
      </div>
    </BottomSheet>
  );
};

export default FilterBottomSheet;
