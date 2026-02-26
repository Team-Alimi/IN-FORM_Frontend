const SectionTitle = ({ KoreanTitle, EnglishTitle }) => {
  return (
    <div className="flex flex-row gap-4 items-center mx-3 pt-1">
      <div className="flex flex-col">
        <div className="font-bold text-xl text-gray-800 max-mobile:text-base">
          {KoreanTitle}
        </div>
        <div className="font-medium text-sm text-gray-700 max-mobile:text-xs">
          {EnglishTitle}
        </div>
      </div>
    </div>
  );
};
export default SectionTitle;
