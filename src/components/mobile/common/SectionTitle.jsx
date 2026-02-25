const SectionTitle = ({ logoImage, KoreanTitle, EnglishTitle }) => {
  return (
    <div className="flex flex-row gap-4 items-center mx-3 pt-1">
      {logoImage && (
        <img
          src={logoImage}
          className="w-12 h-12 max-mobile:w-8 max-mobile:h-8"
        />
      )}
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
