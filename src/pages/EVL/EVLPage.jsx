import { useState, useEffect, useMemo } from "react";
import MobileHeader from "../../components/mobile/common/mobileHeader";
import { useNavigate } from "react-router-dom";
import { getStatus } from "../../utils/statusUtil";
import TabBar from "../../components/desktop/common/TabBar";
import Footer from "../../components/desktop/common/Footer";
import MiniCalendarSet from "../../components/desktop/common/MiniCalendarSet";
import EventRow from "../../components/adaptive/feature/EVL/EventRow";
import MobileEventRow from "../../components/mobile/feature/EVL/mobileEventRow";
import FilterBottomSheet from "../../components/adaptive/feature/EVL/FilterBottomSheet";
import SearchBar from "../../components/adaptive/common/SearchBar";
import { FiFilter } from "react-icons/fi";
import { fetchEvents } from "../../api/schoolArticles";
import { useDeviceStore } from "../../stores/deviceStore";
import MobileTabBar from "../../components/mobile/common/mobileTabBar";
import SectionTitle from "../../components/mobile/common/SectionTitle";
import useEVLFilterStore from "../../stores/useEVLFilterStore";
import MobileFooter from "../../components/mobile/common/MobileFooter";

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
          start_date: activeFilters.startDate || undefined,
          end_date: activeFilters.endDate || undefined,
          vendor_id:
            activeFilters.vendorIds.length > 0
              ? activeFilters.vendorIds.join(",")
              : undefined,
          status: activeFilters.selectedStatuses.includes("ALL")
            ? undefined
            : activeFilters.selectedStatuses.join(","),
          category_id:
            activeFilters.categoryIds.length > 0
              ? activeFilters.categoryIds.join(",")
              : undefined,
        };
        const res = await fetchEvents(params);

        const apiData = res.data?.data;
        setEvents(apiData?.school_articles || []);
        if (apiData?.page_info) {
          setPageInfo(apiData.page_info);
        } else {
          setPageInfo({
            current_page: currentPage,
            total_pages: 1,
            total_articles: apiData?.school_articles
              ? apiData.school_articles.length
              : 0,
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

  useEffect(() => {
    setCurrentPage(1);
  }, [searchText, pageSize]);

  const totalPages = pageInfo.total_pages || 1;

  // 서버에서 status 필터링되어 오므로 정렬만 수행
  const sortedEvents = useMemo(() => {
    if (!events) return [];

    const score = (status) => {
      if (status === "ENDING_SOON") return 4;
      if (status === "OPEN") return 3;
      if (status === "UPCOMING") return 2;
      return 1;
    };

    return [...events].sort((a, b) => score(b.status) - score(a.status));
  }, [events]);

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
          ? "min-h-screen flex flex-col bg-linear-to-b from-[#ECF0FF] to-[#F0FDFA]"
          : "min-h-screen flex flex-col bg-[#f8f9fa]"
      }
    >
      {isMobile ? <MobileHeader /> : <TabBar />}
      <div className="flex-1 w-full max-w-6xl mx-auto px-4 py-2 max-mobile:py-2">
        <div className="flex flex-col md:flex-row gap-6 items-start">
          {/* 왼쪽 사이드바 */}
          <aside className="w-full md:w-1/3 lg:w-1/4 space-y-6 max-mobile:hidden">
            <MiniCalendarSet />
          </aside>

          {/* 오른쪽 메인 컨텐츠 */}
          <main
            className={
              isMobile
                ? "flex-1 w-full bg-[#F4F8FE] rounded-[28px] border border-[#E8F0FB] shadow-[0_8px_30px_rgb(0,72,152,0.05)] p-4 pt-5 min-h-[500px] flex flex-col justify-between"
                : "flex-1 w-full bg-white rounded-2xl border border-gray-100 shadow-[0_2px_15px_rgb(0,0,0,0.03)] p-6 md:p-8 min-h-[500px] flex flex-col justify-between"
            }
          >
            <div>
              <div className="flex flex-col sm:flex-row justify-between items-start mb-6 gap-4">
                {/* 왼쪽: 제목 */}
                <SectionTitle
                  KoreanTitle="공지사항"
                  EnglishTitle="Notice list"
                />
                {/* 오른쪽: 검색바 + 필터/페이지 선택 */}
                <div className="w-full sm:w-64 flex flex-col gap-2">
                  <SearchBar
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    placeholder="공지사항 검색..."
                  />
                  <div className="flex items-center justify-between sm:justify-end sm:gap-2">
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
                      onChange={(e) => setPageSize(Number(e.target.value))}
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
                {sortedEvents.length > 0 ? (
                  sortedEvents.map((event) => {
                    const statusText = getStatus(event.status).text;
                    if (isMobile) {
                      return (
                        <MobileEventRow
                          key={event.article_id}
                          status={statusText}
                          category={event.categories.category_name}
                          title={event.title}
                          source={
                            event.vendor_name ||
                            event.vendors?.[0]?.vendor_name ||
                            ""
                          }
                          date={event.due_date}
                          bookmarkCount={event.bookmark_count || 0}
                          onClick={() => handleRowClick(event.article_id)}
                        />
                      );
                    } else {
                      return (
                        <EventRow
                          key={event.article_id}
                          title={event.title}
                          date={event.due_date}
                          status={statusText}
                          onClick={() => handleRowClick(event.article_id)}
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
      {isMobile ? (
        <>
          <MobileFooter />
          <MobileTabBar activeIndex={1} />
        </>
      ) : <Footer />}
      <FilterBottomSheet
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        onApply={handleFilterApply}
        totalCount={pageInfo.total_articles}
        keyword={searchText}
      />
    </div>
  );
};

export default EVLPage;
