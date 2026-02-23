import ClubRow from "./ClubRow";
import { useNavigate } from "react-router-dom";
import { useDeviceStore } from "../../../../stores/deviceStore";
import SearchBar from "../../common/SearchBar";
import {
  fetchClubs /*, fetchImminentClubs */,
} from "../../../../api/getClubList";
import { useState } from "react";

const ClubListContainer = () => {
  const mockClubList = [
    {
      title: "IUPC 프로그래밍 경진대회",
      vendors: { vendor_name: "IUPC" },
      start_date: "2026-03-01",
      due_date: "2026-03-15",
      attachment_url: "",
    },
    {
      title: "별지기 천문 관측 행사",
      vendors: { vendor_name: "별지기" },
      start_date: "2026-03-05",
      due_date: "2026-03-20",
      attachment_url: "",
    },
    {
      title: "인하 밴드부 정기 공연",
      vendors: { vendor_name: "인하밴드" },
      start_date: "2026-03-10",
      due_date: "2026-04-01",
      attachment_url: "",
    },
    {
      title: "사진부 봄 출사 모집",
      vendors: { vendor_name: "렌즈클럽" },
      start_date: "2026-03-12",
      due_date: "2026-03-25",
      attachment_url: "",
    },
    {
      title: "로봇공학회 신입 부원 모집",
      vendors: { vendor_name: "로봇공학회" },
      start_date: "2026-03-15",
      due_date: "2026-04-05",
      attachment_url: "",
    },
    {
      title: "영화감상 클럽 상영회",
      vendors: { vendor_name: "시네마클럽" },
      start_date: "2026-03-18",
      due_date: "2026-03-30",
      attachment_url: "",
    },
    {
      title: "창업 동아리 아이디어 해커톤",
      vendors: { vendor_name: "스타트업랩" },
      start_date: "2026-03-20",
      due_date: "2026-04-10",
      attachment_url: "",
    },
    {
      title: "댄스 동아리 신입 오디션",
      vendors: { vendor_name: "인하댄스" },
      start_date: "2026-03-22",
      due_date: "2026-04-01",
      attachment_url: "",
    },
    {
      title: "독서 토론 클럽 4월 모집",
      vendors: { vendor_name: "책읽는모임" },
      start_date: "2026-03-25",
      due_date: "2026-04-07",
      attachment_url: "",
    },
    {
      title: "AI 연구회 논문 스터디",
      vendors: { vendor_name: "AI연구회" },
      start_date: "2026-03-28",
      due_date: "2026-04-15",
      attachment_url: "",
    },
    {
      title: "봉사 동아리 지역 사회 캠페인",
      vendors: { vendor_name: "나눔회" },
      start_date: "2026-04-01",
      due_date: "2026-04-20",
      attachment_url: "",
    },
    {
      title: "게임 개발 동아리 게임잼",
      vendors: { vendor_name: "게임개발부" },
      start_date: "2026-04-03",
      due_date: "2026-04-25",
      attachment_url: "",
    },
  ];

  return (
    <div>
      <div>모바일 클럽 컨테이너 </div>
      <div className="p-2 w-full">
        <div className="grid grid-cols-2 gap-4">
          {mockClubList.map((item) => (
            <ClubRow key={item.title} data={item} />
          ))}
        </div>
      </div>
    </div>
  );
};
export default ClubListContainer;
