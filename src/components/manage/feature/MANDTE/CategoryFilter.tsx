import { FILTER_OPTIONS } from '@/constants/filterOption';

interface CategoryFilterProp {
  selectedCategory: string;
  onChange: (label: string) => void;
}

const CategoryFilter = ({ selectedCategory, onChange }: CategoryFilterProp) => {
  return (
    <>
      {FILTER_OPTIONS.map((item) => (
        <button
          type="button"
          key={item.label}
          onClick={() => onChange(item.label)}
          className={`${selectedCategory === item.label ? item.color : 'bg-gray-100'} p-2 py-1 rounded-sm mr-2 ${selectedCategory === item.label ? 'text-white' : 'text-gray-600'}`}
        >
          {item.label}
        </button>
      ))}
    </>
  );
};
export default CategoryFilter;
