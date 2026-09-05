import { useState, useEffect, useMemo } from "react";
import MobileHeader from "@/components/main/mobile/common/MobileHeader";
import { useNavigate } from "react-router-dom";
import { getStatus } from "@/utils/statusUtil";
import TabBar from "@/components/main/desktop/common/TabBar";
import Footer from "@/components/main/desktop/common/Footer";
import MiniCalendarSet from "@/components/main/desktop/common/MiniCalendarSet";
import EventRow from "@/components/main/adaptive/feature/EVL/EventRow";
import MobileEventRow from "@/components/main/mobile/feature/EVL/MobileEventRow";
import FilterBottomSheet from "@/components/main/adaptive/feature/EVL/FilterBottomSheet";
import SearchBar from "@/components/main/adaptive/common/SearchBar";
import { FiFilter } from "react-icons/fi";
import { IoOptionsOutline } from "react-icons/io5";
import { fetchEvents } from "@/api/main/articles";
import { useDeviceStore } from "@/stores/deviceStore";
import MobileTabBar from "@/components/main/mobile/common/MobileTabBar";
import SectionTitle from "@/components/main/mobile/common/SectionTitle";
import useEVLFilterStore from "@/stores/useEVLFilterStore";
import useSearchHistory from "@/hooks/useSearchHistory";

// FilterBottomSheet selectedStatuses 값 → API deadline_status 값 매핑
const STATUS_TO_DEADLINE = {
  OPEN: "OPEN",
  ENDING_SOON: "CLOSING_SOON",
  UPCOMING: "UPCOMING",
  CLOSED: "CLOSED",
};

const EVLPage = () => {
  const isMobile = useDeviceStore((state) => state.isMobile);
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [pageInfo, setPageInfo] = useState({
    current_page: 1,
    total_pages: 1,
    total_articles: 0,
  });

  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // 필터 상태를 스토어에서 가져와 페이지 이동 후 복귀 시에도 유지
  const { currentPage, pageSize, searchText, activeFilters,
          setCurrentPage, setPageSize, setSearchText, setActiveFilters } = useEVLFilterStore();

  const { history, addHistory, removeHistory, clearHistory } = useSearchHistory();

  const handleSearchSubmit = (keyword) => {
    addHistory(keyword);
  };

  const handleSelectHistory = (keyword) => {
    setSearchText(keyword);
    setCurrentPage(1);
    addHistory(keyword);
  };

  const handleRemoveHistory = (keyword) => {
    if (keyword === "__all__") clearHistory();
    else removeHistory(keyword);
  };

  const handleFilterApply = (filters) => {
    setActiveFilters(filters);
    setCurrentPage(1);
  };

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const params = {
          page: currentPage,
          size: pageSize,
          keyword: searchText.trim() !== "" ? searchText.trim() : undefined,
          starts_from: activeFilters.startDate || undefined,
          ends_to: activeFilters.endDate || undefined,
          vendor_id:
            activeFilters.vendorIds.length > 0
              ? activeFilters.vendorIds.join(",")
              : undefined,
          category_id:
            activeFilters.categoryIds.length > 0
              ? activeFilters.categoryIds.join(",")
              : undefined,
        };
        const res = await fetchEvents(params);

        const apiData = res.data?.data;
        setEvents(apiData?.content || []);
        if (apiData?.page_info) {
          setPageInfo(apiData.page_info);
        } else {
          setPageInfo({
            current_page: currentPage,
            total_pages: 1,
            total_items: apiData?.content ? apiData.content.length : 0,
          });
        }
      } catch (error) {
        console.error("행사 목록 불러오기 실패:", error);
        console.error("행사 목록을 불러오지 못했습니다.");
      }
    };

    loadEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    currentPage,
    pageSize,
    searchText,
    activeFilters.startDate,
    activeFilters.endDate,
    activeFilters.vendorIds.join(","),
    activeFilters.selectedStatuses.join(","),
    activeFilters.categoryIds.join(","),
  ]);


  const totalPages = pageInfo.total_pages || 1;

  // deadline_status 기준 정렬
  const sortedEvents = useMemo(() => {
    if (!events) return [];

    const score = (status) => {
      if (status === "CLOSING_SOON") return 4;
      if (status === "OPEN") return 3;
      if (status === "UPCOMING") return 2;
      return 1;
    };

    return [...events].sort((a, b) => score(b.deadline_status) - score(a.deadline_status));
  }, [events]);

  // 상태 필터 클라이언트 적용
  // TODO: 서버에서 deadline_status 파라미터 지원 시 params에 추가하고 이 useMemo 제거
  // 현재는 현재 페이지 데이터에만 필터가 적용되므로, 페이지 수/전체 개수는 필터 결과와 일치하지 않음
  const filteredEvents = useMemo(() => {
    if (
      activeFilters.selectedStatuses.includes("ALL") ||
      activeFilters.selectedStatuses.length === 0
    ) {
      return sortedEvents;
    }
    const allowed = activeFilters.selectedStatuses
      .map((key) => STATUS_TO_DEADLINE[key])
      .filter(Boolean);
    return sortedEvents.filter((e) => allowed.includes(e.deadline_status));
  }, [sortedEvents, activeFilters.selectedStatuses]);

  const handleRowClick = (id) => {
    navigate(`/events/detail/${id}`);
  };

  const handlePageChange = (pageNumber) => {
    if (pageNumber < 1 || pageNumber > totalPages) return;
    setCurrentPage(pageNumber);
    window.scrollTo(0, 0);
  };

  return (
    <div
      className={
        isMobile
          ? "min-h-screen flex flex-col bg-white"
          : "min-h-screen flex flex-col bg-[#f8f9fa]"
      }
    >
      {isMobile ? <MobileHeader title="공지사항" /> : <TabBar />}
      <div className="flex-1 w-full max-w-6xl mx-auto px-4 py-4 max-mobile:py-2">
        <div className="flex flex-col md:flex-row gap-6 items-start">
          {/* 왼쪽 사이드바 */}
          <aside className="w-full md:w-1/3 lg:w-1/4 space-y-6 max-mobile:hidden">
            <MiniCalendarSet />
          </aside>

          {/* 오른쪽 메인 컨텐츠 */}
          <main
            className={
              isMobile
                ? "flex-1 w-full min-h-[500px] flex flex-col justify-between"
                : "flex-1 w-full bg-white rounded-2xl border border-gray-100 shadow-[0_2px_15px_rgb(0,0,0,0.03)] p-6 md:p-8 min-h-[500px] flex flex-col justify-between"
            }
          >
            <div>
              <div className="flex flex-col sm:flex-row justify-between items-start mb-4 gap-4">
                {/* 왼쪽: 제목 - 데스크톱만 표시 (모바일은 MobileHeader에서 표시) */}
                <div className="max-mobile:hidden">
                  <SectionTitle
                    KoreanTitle="공지사항"
                    EnglishTitle="Notice list"
                  />
                </div>
                {/* 검색바 + 필터/페이지 선택 */}
                <div className="w-full sm:w-64 flex flex-col gap-2">
                  <SearchBar
                    value={searchText}
                    onChange={(e) => { setSearchText(e.target.value); setCurrentPage(1); }}
                    onSubmit={handleSearchSubmit}
                    placeholder="제목이나 내용을 검색하세요."
                    searchHistory={history}
                    onSelectHistory={handleSelectHistory}
                    onRemoveHistory={handleRemoveHistory}
                    rightSlot={
                      isMobile ? (
                        // 모바일: 검색바 우측에 필터 아이콘 통합
                        <button
                          type="button"
                          aria-label="필터 열기"
                          onClick={() => setIsFilterOpen(true)}
                          className="text-gray-400 hover:text-gray-600 cursor-pointer"
                        >
                          <IoOptionsOutline size={20} />
                        </button>
                      ) : null
                    }
                  />
                  {/* 데스크톱: 기존 필터 버튼 + 페이지 사이즈 유지 */}
                  <div className="flex items-center justify-between sm:justify-end sm:gap-2 max-mobile:hidden">
                    <button
                      type="button"
                      onClick={() => setIsFilterOpen(true)}
                      className="flex items-center gap-1 bg-[#F7FAFC] rounded-[10px] px-3 h-8 text-[14px] font-medium text-gray-800 shadow-sm border border-[#f5f8fd] active:scale-97 cursor-pointer"
                    >
                      <FiFilter size={14} className="text-gray-800" />
                      <span>필터</span>
                    </button>
                    <select
                      value={pageSize}
                      onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
                      className="bg-[#F7FAFC] rounded-[10px] px-3 h-8 text-[14px] font-medium text-gray-800 shadow-sm border border-[#f5f8fd] active:scale-97 cursor-pointer"
                    >
                      {[5, 10, 20].map((n) => (
                        <option key={n} value={n}>
                          {n}개씩 보기
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* 리스트 출력 */}
              <div className="space-y-1">
                {filteredEvents.length > 0 ? (
                  filteredEvents.map((event) => {
                    const statusResult = getStatus(event.deadline_status);
                    if (isMobile) {
                      return (
                        <MobileEventRow
                          key={event.id}
                          status={statusResult}
                          category={event.categories?.[0]?.name}
                          title={event.title}
                          vendors={event.vendors || []}
                          date={event.ends_on}
                          bookmarkCount={event.bookmark_count || 0}
                          viewCount={event.view_count}
                          onClick={() => handleRowClick(event.id)}
                        />
                      );
                    } else {
                      return (
                        <EventRow
                          key={event.id}
                          title={event.title}
                          date={event.ends_on}
                          status={statusResult?.text}
                          category={event.categories?.[0]?.name}
                          vendors={event.vendors || []}
                          onClick={() => handleRowClick(event.id)}
                        />
                      );
                    }
                  })
                ) : (
                  <div className="text-center py-20 text-gray-400 flex flex-col items-center">
                    <p>조건에 맞는 행사가 없습니다.</p>
                  </div>
                )}
              </div>
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`px-3 py-1 rounded-md text-sm ${
                    currentPage === 1
                      ? "text-gray-300 cursor-not-allowed"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  &lt;
                </button>

                {(() => {
                  const pages = [];
                  const delta = 2;
                  const left = currentPage - delta;
                  const right = currentPage + delta;

                  let prev = null;
                  for (let i = 1; i <= totalPages; i++) {
                    if (
                      i === 1 ||
                      i === totalPages ||
                      (i >= left && i <= right)
                    ) {
                      if (prev !== null && i - prev > 1) {
                        pages.push(
                          <span
                            key={`ellipsis-${i}`}
                            className="px-1 text-gray-400 text-sm select-none"
                          >
                            …
                          </span>,
                        );
                      }
                      pages.push(
                        <button
                          key={i}
                          onClick={() => handlePageChange(i)}
                          className={`w-8 h-8 rounded-full text-sm font-medium transition-colors ${
                            currentPage === i
                              ? "bg-blue-500 text-white shadow-sm"
                              : "text-gray-600 hover:bg-gray-100"
                          }`}
                        >
                          {i}
                        </button>,
                      );
                      prev = i;
                    }
                  }
                  return pages;
                })()}

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-1 rounded-md text-sm ${
                    currentPage === totalPages
                      ? "text-gray-300 cursor-not-allowed"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  &gt;
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
      {isMobile ? <MobileTabBar activeIndex={1} /> : <Footer />}
      <FilterBottomSheet
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        onApply={handleFilterApply}
        totalCount={pageInfo.total_items}
        keyword={searchText}
      />
    </div>
  );
};

export default EVLPage;
