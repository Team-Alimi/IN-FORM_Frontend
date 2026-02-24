import ClubRow from "./ClubRow";
import { useNavigate } from "react-router-dom";
import { useDeviceStore } from "../../../../stores/deviceStore";
import SearchBar from "../../common/SearchBar";
import {
  fetchClubs /*, fetchImminentClubs */,
} from "../../../../api/getClubList";
import { useState, useEffect } from "react";
import CalendarLogo from "../../../../assets/icons/calendarLogo.png";
const CLUB_PAGE_COUNT = 6;

const ClubListContainer = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [clubList, setClubList] = useState([]);
  const [searchText, setSearchText] = useState("");
  const fetchClubList = async () => {
    setIsLoading(true);
    try {
      const res = await fetchClubs({ page: 1, size: CLUB_PAGE_COUNT });
      console.log(res.data.data.club_articles);
      return res.data.data.club_articles;
    } catch (error) {
      alert("문제 발생");
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchClubList().then(setClubList);
  }, []);

  const handleClubClick = (id) => {
    navigate(`/clubs/detail/${id}`);
  };
  return (
    <div>
      <div className="p-2 w-full bg-white shadow-sm  rounded-xl">
        <div className="flex flex-row gap-2 items-center mx-8 pt-2">
          <img src={CalendarLogo} className="w-8 h-8" />
          <div className="flex flex-col">
            <div className="font-bold text-md text-gray-800">동아리 홍보글</div>
            <div className="font-medium text-xs text-gray-700">
              Club Promotion Article
            </div>
          </div>
        </div>
        <div className="m-4">
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
      </div>
    </div>
  );
};
export default ClubListContainer;
