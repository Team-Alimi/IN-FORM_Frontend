const ServiceLink = ({
  icon, // 아이콘
  label, // 아이콘 대신 텍스트로 표시
  size = 42, // 원 크기
  bgColor = "bg-gray-100", // 원 배경색
  textColor = "text-gray-600", // label 글자색
  href, // 외부링크 (필수)
  content, // 설명 텍스트
}) => {
  const handleClick = () => {
    if (href) {
      window.open(href, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div
      onClick={handleClick}
      className="
        group flex items-center gap-3 w-full p-3
        bg-white border border-gray-100 rounded-2xl shadow-sm
        cursor-pointer transition-all duration-200
        hover:shadow-md hover:border-primary hover:-translate-y-0.5
      "
    >
      <div
        className={`
        rounded-full flex items-center justify-center
        cursor-pointer hover:opacity-80 transition
        ${bgColor}
      `}
        style={{ width: size, height: size }}
      >
        {icon ? (
          icon
        ) : (
          <span className={`text-sm font-medium ${textColor}`}>{label}</span>
        )}
      </div>
      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <span className="text-gray-600 text-sm truncate group-hover:text-primary transition-colors">
          {content}
        </span>
      </div>
    </div>
  );
};

export default ServiceLink;
