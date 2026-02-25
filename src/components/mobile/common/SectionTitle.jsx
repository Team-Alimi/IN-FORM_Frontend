const SectionTitle = ({ logoImage, KoreanTitle, EnglishTitle }) => {
  return (
    <div className="flex flex-row gap-4 items-center mx-4 pt-1">
      <img src={logoImage} className="w-8 h-8" />
      <div className="flex flex-col">
        <div className="font-bold text-md text-gray-800">{KoreanTitle}</div>
        <div className="font-medium text-xs text-gray-700">{EnglishTitle}</div>
      </div>
    </div>
  );
};
export default SectionTitle;
