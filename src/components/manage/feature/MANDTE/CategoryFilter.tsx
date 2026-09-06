import { CATEGORY_NAME_COLOR_MAP } from '@/constants/filterOption';

const CATEGORY_LIST = Object.entries(CATEGORY_NAME_COLOR_MAP).map(([name, colors]) => ({
  label: name,
  color: colors.dot,
}));

interface CategoryFilterProp {
  selectedCategory: string;
  onChange: (label: string) => void;
}

const CategoryFilter = ({ selectedCategory, onChange }: CategoryFilterProp) => {
  return (
    <>
      {CATEGORY_LIST.map((item) => (
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
