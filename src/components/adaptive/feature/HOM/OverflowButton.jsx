const OverflowButton = ({ count, dateKey, onOverflowClick }) => {
  return (
    <button
      onClick={() => onOverflowClick(dateKey)}
      className="text-xs sm:text-sm text-gray-600 hover:text-main-component hover:font-semibold transition-colors px-1 py-0.5 rounded"
    >
      +{count}
    </button>
  );
};

export default OverflowButton;
