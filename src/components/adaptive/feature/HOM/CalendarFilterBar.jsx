import { FILTER_OPTIONS } from "../../../../constants/filterOption";

const CalendarFilterBar = ({ selectedFilter, onClick }) => {
  return (
    <div>
      {FILTER_OPTIONS.map((item) => {
        const isSelected = selectedFilter.includes(item.key);
        const variant = isSelected
          ? "bg-blue-500 text-white"
          : "bg-gray-200 text-gray-800";
        return (
          <button
            key={item.key}
            onClick={() => onClick(item.key)}
            className={`text-sm max-mobile:text-xs font-medium ${variant} p-1 px-2 rounded-xl mx-1 `}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
};
export default CalendarFilterBar;
