import { FILTER_OPTIONS } from "../../../../constants/filterOption";

const CalendarFilterBar = ({ selectedFilter, onClick }) => {
  return (
    <div className="flex flex-row flex-wrap gap-2">
      {FILTER_OPTIONS.map((item) => {
        const isSelected = selectedFilter.includes(item.key);
        let category = item.color;
        const variant = isSelected
          ? `${category} text-white`
          : "bg-gray-200 text-gray-800";
        return (
          <button
            key={item.key}
            onClick={() => onClick(item.key)}
            className={`text-sm max-mobile:text-xs font-medium ${variant} p-1 px-2 rounded-xl shrink-0`}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
};
export default CalendarFilterBar;
