import ClubRow from "./ClubRow";
import { useNavigate } from "react-router-dom";
import { useDeviceStore } from "../../../../stores/deviceStore";
import SearchBar from "../../common/SearchBar";
import {
  fetchClubs /*, fetchImminentClubs */,
} from "../../../../api/getClubList";
import { useState, useEffect } from "react";
import CalendarLogo from "../../../../assets/icons/calendarLogo.png";
const CLUB_PAGE_COUNT = 4;
const DEBOUNCE_DELAY = 400;

const ClubListContainer = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [clubList, setClubList] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [pageInfo, setPageInfo] = useState({
    current_page: 1,
    total_pages: 1,
    total_articles: 0,
  });
  const totalPages = pageInfo.total_pages || 1;
  // searchText 변경 후 400ms 뒤에 debouncedSearch 업데이트
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchText.trim());
    }, DEBOUNCE_DELAY);
    return () => clearTimeout(timer);
  }, [searchText]);

  useEffect(() => {
    const fetchClubList = async () => {
      setIsLoading(true);
      try {
        const params = {
          page: currentPage,
          size: CLUB_PAGE_COUNT,
          keyword: debouncedSearch || undefined,
        };
        const res = await fetchClubs(params);
        console.log(res.data.data.club_articles);
        setClubList(res.data.data.club_articles);
        if (res.data.data.page_info) {
          setPageInfo(res.data.data.page_info);
        } else {
          setPageInfo({
            current_page: currentPage,
            total_pages: res.data.data.club_articles / CLUB_PAGE_COUNT,
            total_articles: res.data.data.club_articles,
          });
        }
      } catch (error) {
        alert("문제 발생");
      } finally {
        setIsLoading(false);
      }
    };
    fetchClubList();
  }, [debouncedSearch, currentPage]);

  const handleClubClick = (id) => {
    navigate(`/clubs/detail/${id}`);
  };

  const handlePageChange = (pageNumber) => {
    if (pageNumber < 1 || pageNumber > totalPages) return;
    setCurrentPage(pageNumber);
    window.scrollTo(0, 0);
  };
  useEffect(() => {
    setCurrentPage(1);
  }, [searchText]);
  return (
    <div>
      <div className="w-ful rounded-xl">
        <div className="flex flex-row gap-2 items-center mx-8 pt-2">
          <img src={CalendarLogo} className="w-8 h-8" />
          <div className="flex flex-col">
            <div className="font-bold text-md text-gray-800">동아리 홍보글</div>
            <div className="font-medium text-xs text-gray-700">
              Club Promotion Article
            </div>
          </div>
        </div>
        <div className="m-2">
          <SearchBar
            placeholder={"동아리명을 입력하세요"}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          {clubList.map((item) => (
            <ClubRow
              key={item.article_id}
              data={item}
              onClick={handleClubClick}
            />
          ))}
        </div>
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-10">
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
      </div>
    </div>
  );
};
export default ClubListContainer;
