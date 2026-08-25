import { FILTER_OPTIONS } from "@/constants/filterOption";

const CalendarFilterBar = ({ selectedFilter, onClick }) => {
  return (
    <div className="flex flex-row gap-2 overflow-x-auto scrollbar-hide">
      {FILTER_OPTIONS.map((item) => {
        const isSelected = selectedFilter.includes(item.key);
        const variant = isSelected
          ? `${item.color} text-white`
          : "bg-gray-100 text-gray-600";
        return (
          <button
            key={item.key}
            onClick={() => onClick(item.key)}
            className={`text-sm font-medium ${variant} py-1.5 px-4 rounded-full shrink-0 transition-colors`}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
};
export default CalendarFilterBar;
