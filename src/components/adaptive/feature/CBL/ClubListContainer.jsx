import ClubRow from "./ClubRow";
import { useNavigate } from "react-router-dom";
import SearchBar from "../../common/SearchBar";
import {
  fetchClubs /*, fetchImminentClubs */,
} from "../../../../api/clubArticles";
import { useState, useEffect } from "react";
import CalendarLogo from "../../../../assets/icons/calendarLogo.png";
import SectionTitle from "../../../mobile/common/SectionTitle";
import ClubLogo from "../../../../assets/icons/ClubLogo.png";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
const CLUB_PAGE_COUNT = 4;
const DEBOUNCE_DELAY = 400;

const ClubListContainer = () => {
  const navigate = useNavigate();
  // const [isLoading, setIsLoading] = useState(false);
  // const [clubList, setClubList] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [pageInfo, setPageInfo] = useState({
    current_page: 1,
    total_pages: 1,
    total_articles: 0,
  });

  // searchText 변경 후 400ms 뒤에 debouncedSearch 업데이트
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchText.trim());
    }, DEBOUNCE_DELAY);
    return () => clearTimeout(timer);
  }, [searchText]);

  const { data, isLoading } = useQuery({
    queryKey: ["clubs", debouncedSearch, currentPage], // ← 이 key가 기준
    queryFn: async () => {
      const res = await fetchClubs({
        page: currentPage,
        size: CLUB_PAGE_COUNT,
        keyword: debouncedSearch || undefined,
      });
      return {
        clubList: res.data.data.club_articles,
        pageInfo: res.data.data.page_info,
      };
    },
    staleTime: 60 * 1000 * 5,
    placeholderData: keepPreviousData,
  });

  const clubList = data?.clubList ?? [];
  const totalPages = data?.pageInfo?.total_pages ?? 1;

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
      <SectionTitle
        logoImage={ClubLogo}
        KoreanTitle={"동아리 홍보글"}
        EnglishTitle={"Club promotional article"}
      />
      <div className="m-2">
        <SearchBar
          placeholder={"동아리 검색..."}
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

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
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
          ))}

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
  );
};
export default ClubListContainer;
