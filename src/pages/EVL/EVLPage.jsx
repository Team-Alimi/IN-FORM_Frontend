import React from "react";
import { useState, useEffect, useMemo } from "react";
import MobileHeader from "../../components/mobile/common/mobileHeader";
import { useNavigate } from "react-router-dom";
import { getStatus } from "../../utils/statusUtil";
import TabBar from "../../components/desktop/common/TabBar";
import Footer from "../../components/desktop/common/Footer";
import MiniCalendarSet from "../../components/desktop/common/MiniCalendarSet";
import EventRow from "../../components/adaptive/feature/EVL/EventRow";
import MobileEventRow from "../../components/mobile/feature/EVL/mobileEventRow";
import MobileEventDetail from "../../components/adaptive/feature/EVD/MobileEventDetail";
import FilterBottomSheet from "../../components/adaptive/feature/EVL/FilterBottomSheet";
import SearchBar from "../../components/adaptive/common/SearchBar";
import { FiFilter } from "react-icons/fi";
import ImminentSidebar from "../../components/desktop/common/ImminentSidebar";
import { fetchEvents /*, fetchImminentEvents */ } from "../../api/getEventList";
import { fetchEventDetail } from "../../api/getEventDetail";
import { useDeviceStore } from "../../stores/deviceStore";
import MobileTabBar from "../../components/mobile/common/mobileTabBar";

const EVLPage = () => {
  const isMobile = useDeviceStore((state) => state.isMobile);
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [eventsError, setEventsError] = useState(null);
  const [pageInfo, setPageInfo] = useState({
    current_page: 1,
    total_pages: 1,
    total_articles: 0,
  });

  // 마감임박행사 API 제거로 임시 미사용
  // const [imminentEvents, setImminentEvents] = useState([]);
  // const [imminentLoading, setImminentLoading] = useState(false);
  // const [imminentError, setImminentError] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [searchText, setSearchText] = useState("");
  const [activeFilters, setActiveFilters] = useState({
    startDate: "",
    endDate: "",
    selectedStatuses: ["ALL"],
    vendorIds: [],
  });
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const handleFilterApply = (filters) => {
    setActiveFilters(filters);
    setCurrentPage(1);
  };

  useEffect(() => {
    const loadEvents = async () => {
      try {
        setEventsLoading(true);
        setEventsError(null);

        const params = {
          page: currentPage,
          size: 20,
          keyword: searchText.trim() !== "" ? searchText.trim() : undefined,
          start_date: activeFilters.startDate || undefined,
          end_date: activeFilters.endDate || undefined,
          vendor_id: activeFilters.vendorIds.length > 0 ? activeFilters.vendorIds.join(",") : undefined,
        };
        const res = await fetchEvents(params);

        // api명세에 맞게 response 파싱
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
        setEventsError("행사 목록을 불러오지 못했습니다.");
      } finally {
        setEventsLoading(false);
      }
    };

    loadEvents();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, searchText, activeFilters.startDate, activeFilters.endDate, activeFilters.vendorIds.join(",")]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchText]);

  // 마감임박행사 API 제거로 임시 미사용
  // useEffect(() => {
  //   const loadImminentEvents = async () => {
  //     try {
  //       setImminentLoading(true);
  //       setImminentError(null);
  //
  //       const res = await fetchImminentEvents();
  //       setImminentEvents(res.data.school_articles || []);
  //     } catch (error) {
  //       console.error("마감 임박 행사 불러오기 실패:", error);
  //       setImminentError("마감 임박 행사를 불러오지 못했습니다.");
  //     } finally {
  //       setImminentLoading(false);
  //     }
  //   };
  //
  //   loadImminentEvents();
  // }, []);

  const currentEvents = events;
  const totalPages = pageInfo.total_pages || 1;

  const sortedEvents = useMemo(() => {
    if (!events) return [];

    const score = (status) => {
      if (status === "ENDING_SOON") return 4;
      if (status === "OPEN")        return 3;
      if (status === "UPCOMING")    return 2;
      return 1;
    };

    const filtered = activeFilters.selectedStatuses.includes("ALL")
      ? events
      : events.filter((e) => activeFilters.selectedStatuses.includes(e.status));

    return [...filtered].sort((a, b) => score(b.status) - score(a.status));
  }, [events, activeFilters.selectedStatuses]);

  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);

  const handleRowClick = (id) => {
    navigate(`/events/detail/${id}`);
  };

  const handleMobileRowClick = async (id) => {
    try {
      const eventData = await fetchEventDetail(id);
      setSelectedEvent(eventData);
      setIsBottomSheetOpen(true);
    } catch (err) {
      console.error("행사 상세 불러오기 실패:", err);
    }
  };

  const handleBottomSheetClose = () => {
    setIsBottomSheetOpen(false);
    setTimeout(() => setSelectedEvent(null), 300);
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
          ? "min-h-screen flex flex-col bg-linear-to-b from-[#ECF0FF] to-[#F0FDFA] pb-20"
          : "min-h-screen flex flex-col bg-[#f8f9fa]"
      }
    >
      {isMobile ? <MobileHeader /> : <TabBar />}
      <div className="flex-1 w-full max-w-6xl mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row gap-6 items-start">
          {/* 왼쪽 사이드바 */}
          <aside className="w-full md:w-1/3 lg:w-1/4 space-y-6">
            {!isMobile && <MiniCalendarSet />}
            {/* 마감임박행사 API 제거로 임시 미사용
            <ImminentSidebar
              imminentLoading={imminentLoading}
              imminentError={imminentError}
              imminentEvents={imminentEvents}
              onEventClick={handleRowClick}
            />
            */}
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
              <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                <h2 className="text-xl font-bold text-gray-800 w-full sm:w-auto">
                  📣 공지사항
                </h2>
                <div className="w-full sm:w-64">
                  <SearchBar
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    placeholder="공지사항 검색..."
                  />
                  <button
                    type="button"
                    onClick={() => setIsFilterOpen(true)}
                    className="mt-2 flex items-center gap-1 bg-[#F7FAFC] rounded-[10px] px-3 py-1.5 text-[14px] font-medium text-gray-800 shadow-sm border border-[#f5f8fd] active:scale-97"
                  >
                    <FiFilter size={18} className="text-gray-800" />
                    <span>필터</span>
                  </button>
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
                          date={event.start_date}
                          bookmarkCount={event.bookmark_count || 0}
                          onClick={() => handleMobileRowClick(event.article_id)}
                        />
                      );
                    } else {
                      return (
                        <EventRow
                          key={event.article_id}
                          title={event.title}
                          date={event.created_at}
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

                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (number) => (
                    <button
                      key={number}
                      onClick={() => handlePageChange(number)}
                      className={`w-8 h-8 rounded-full text-sm font-medium transition-colors ${
                        currentPage === number
                          ? "bg-blue-500 text-white shadow-sm"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      {number}
                    </button>
                  ),
                )}

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
        totalCount={pageInfo.total_articles}
        keyword={searchText}
      />
      {selectedEvent && (
        <MobileEventDetail
          isOpen={isBottomSheetOpen}
          onClose={handleBottomSheetClose}
          articleId={selectedEvent.article_id}
          status={selectedEvent.status}
          title={selectedEvent.title}
          vendors={selectedEvent.vendors}
          startDate={selectedEvent.start_date}
          dueDate={selectedEvent.due_date}
          created_at={selectedEvent.created_at}
          content={selectedEvent.content}
          category_name={selectedEvent.categories?.category_name}
          is_bookmarked={selectedEvent.is_bookmarked}
          bookmark_count={selectedEvent.bookmark_count}
        />
      )}
    </div>
  );
};

export default EVLPage;
