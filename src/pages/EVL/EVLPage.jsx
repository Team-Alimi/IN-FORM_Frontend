import React from "react";
import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { getStatus } from "../../utils/statusUtil";
import Header from "../../components/common/Header";
import TabBar from "../../components/common/TabBar";
import Footer from "../../components/common/Footer";
import MiniCalendarSet from "../../components/common/MiniCalendarSet";
import EventRow from "../../components/EVL/EventRow";
import SearchBar from "../../components/common/SearchBar";
import Imminent from "../../components/common/Imminent";
import api from "../../api/axios";

const EVLPage = () => {
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [eventsError, setEventsError] = useState(null);
  const [pageInfo, setPageInfo] = useState({
    current_page: 1,
    total_pages: 1,
    total_articles: 0,
  });

  const [imminentEvents, setImminentEvents] = useState([]);
  const [imminentLoading, setImminentLoading] = useState(false);
  const [imminentError, setImminentError] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);

  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [searchText, setSearchText] = useState("");

  const categories = [
    { id: "ALL", label: "전체" },
    { id: "LECTURE", label: "특강" },
    { id: "COMPETITION", label: "대회" },
    { id: "CONTEST", label: "공모전" },
  ];

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setEventsLoading(true);
        setEventsError(null);

        const res = await api.get("/api/v1/school_articles", {
          params: {
            page: currentPage,
            category: selectedCategory !== "ALL" ? selectedCategory : undefined,
            search: searchText.trim() !== "" ? searchText.trim() : undefined,
            size: 20,
          },
        });

        console.log("events list:", res.data);

        setEvents(res.data.school_articles || []);
        if (res.data.page_info) {
          setPageInfo(res.data.page_info);
        } else {
          // page_info가 없을 경우
          setPageInfo({
            current_page: currentPage,
            total_pages: 1,
            total_articles: res.data.school_articles
              ? res.data.school_articles.length
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

    fetchEvents();
  }, [currentPage, selectedCategory, searchText]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchText]);

  useEffect(() => {
    const fetchImminentEvents = async () => {
      try {
        setImminentLoading(true);
        setImminentError(null);

        const res = await api.get("/api/v1/deadline/school_articles");

        setImminentEvents(res.data.school_articles || []);
      } catch (error) {
        console.error("마감 임박 행사 불러오기 실패:", error);
        setImminentError("마감 임박 행사를 불러오지 못했습니다.");
      } finally {
        setImminentLoading(false);
      }
    };

    fetchImminentEvents();
  }, []);

  const currentEvents = events;
  const totalPages = pageInfo.total_pages || 1;



  const sortedEvents = useMemo(() => {
    if (!events) return [];

    return [...events].sort((a, b) => {
      const statusA = getStatus(a.start_date, a.due_date);
      const statusB = getStatus(b.start_date, b.due_date);

      const score = (status) => {
        if (status === "진행중") return 3;
        if (status === "예정") return 2;
        return 1;
      };
      return score(statusB) - score(statusA);
    });
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
    <div className="min-h-screen flex flex-col bg-gray-50">
      <TabBar />
      <div className="flex-1 w-full max-w-6xl mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row gap-6 items-start">
          {/* 왼쪽 사이드바 */}
          <aside className="w-full md:w-1/3 lg:w-1/4 space-y-6">
            <MiniCalendarSet />
            <div className="p-4 max-w-100 rounded-3xl bg-white shadow-md flex flex-col items-center">
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                🔥 마감 임박
              </h3>
              <div className="space-y-1 w-full">
                {imminentLoading && (
                  <p className="text-sm text-gray-400 text-center">
                    불러오는 중...
                  </p>
                )}
                {imminentError && (
                  <p className="text-sm text-red-400 text-center">
                    {imminentError}
                  </p>
                )}
                {!imminentLoading &&
                  !imminentError &&
                  imminentEvents.map((imminentEvent) => (
                    <Imminent
                      key={imminentEvent.article_id}
                      title={imminentEvent.title}
                      date={imminentEvent.due_date}
                      onClick={() => handleRowClick(imminentEvent.article_id)}
                    />
                  ))}
                {!imminentLoading &&
                  !imminentError &&
                  imminentEvents.length === 0 && (
                    <p className="text-sm text-gray-400 text-center">
                      표시할 마감 임박 행사가 없습니다.
                    </p>
                  )}
              </div>
            </div>
          </aside>

          {/* 오른쪽 메인 컨텐츠 */}
          <main className="flex-1 w-full bg-white rounded-xl shadow-sm border border-gray-200 p-6 min-h-[500px] flex flex-col justify-between">
            <div>
              <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                <h2 className="text-xl font-bold text-gray-800 w-full sm:w-auto">
                  이벤트/행사 목록
                </h2>
                <div className="w-full sm:w-64">
                  <SearchBar
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    placeholder="행사 제목 검색"
                  />
                </div>
              </div>

              {/* 카테고리 탭 */}
              <div className="flex flex-wrap gap-2 mb-6">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 
                    ${
                      selectedCategory === cat.id
                        ? "bg-blue-500 text-white shadow-md transform scale-105"
                        : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* 리스트 출력 */}
              <div className="space-y-1">
                {sortedEvents.length > 0 ? (
                  sortedEvents.map((event) => (
                    <EventRow
                      key={event.article_id}
                      title={event.title}
                      date={event.created_at}
                      status={getStatus(event.start_date, event.due_date)}
                      onClick={() => handleRowClick(event.article_id)}
                    />
                  ))
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
                  )
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
      <Footer />
    </div>
  );
};

export default EVLPage;
