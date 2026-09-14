const CalendarCell = ({
  date,
  inCurrentMonth,
  isToday,
  isSelected,
  onClick,
  isMini,
}) => {
  // 요일 계산 (0: 일요일, 6: 토요일)
  const dayOfWeek = date.getDay();
  const isSunday = dayOfWeek === 0;
  const isSaturday = dayOfWeek === 6;

  // 텍스트 색상 결정
  let textColor = "text-gray-700";
  if (!inCurrentMonth) textColor = "text-gray-300";
  else if (isSunday) textColor = "text-red-500";
  else if (isSaturday) textColor = "text-blue-500";

  // 날짜 클릭 핸들러 - date를 명시적으로 전달
  const handleClick = () => {
    if (onClick && inCurrentMonth) {
      onClick(date); // Date 객체를 전달!
    }
  };

  // 원형 배지 크기
  let circleSizeStyle = "";
  let cellTextStyle = "";
  if (isMini) {
    circleSizeStyle = "w-6 h-6";
    cellTextStyle = "text-xs";
  } else {
    circleSizeStyle = "w-8 h-8 md:w-9 md:h-9 max-mobile:w-7 max-mobile:h-7";
    cellTextStyle = "text-xs sm:text-base md:text-base font-medium";
  }

  // 원형 배경 색상
  // - 오늘: 진한 primary 원 (항상 유지)
  // - 다른 날짜 선택: 연한 primary 원 추가 (오늘 원은 그대로)
  let circleBg = "";
  if (isToday) circleBg = "bg-primary text-white hover:bg-primary-dark";
  else if (isSelected && inCurrentMonth) circleBg = "bg-primary-light text-white hover:bg-primary-light-hover";
  else circleBg = `${textColor} hover:bg-gray-100`;

  return (
    <div
      className={`flex justify-center items-center py-0.5 ${inCurrentMonth ? "cursor-pointer" : "cursor-default"}`}
      onClick={handleClick}
    >
      <div
        className={`${circleSizeStyle} flex items-center justify-center rounded-full transition-colors
          ${circleBg}
        `}
      >
        <span className={`${cellTextStyle} max-mobile:text-[12px]`}>
          {date.getDate()}
        </span>
      </div>
    </div>
  );
};

export default CalendarCell;
