import { useQuery } from '@tanstack/react-query';
import { fetchCategories } from '@/api/main/vendors';
import { CATEGORY_NAME_COLOR_MAP, DEFAULT_CATEGORY_COLOR } from '@/constants/filterOption';

interface CategoryFilterProp {
  selectedCategoryId: number | null;
  onChange: (id: number | null) => void;
}

const CategoryFilter = ({ selectedCategoryId, onChange }: CategoryFilterProp) => {
  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
    staleTime: 60 * 60 * 1000, // 1시간
  });

  const categories = ((categoriesData as { data?: { id: number; name: string }[] })?.data ?? []);

  return (
    <>
      {categories.map((cat) => {
        const colorInfo = CATEGORY_NAME_COLOR_MAP[cat.name as keyof typeof CATEGORY_NAME_COLOR_MAP] ?? DEFAULT_CATEGORY_COLOR;
        const isSelected = selectedCategoryId === cat.id;
        return (
          <button
            type="button"
            key={cat.id}
            onClick={() => onChange(cat.id)}
            className={`${isSelected ? colorInfo.dot : 'bg-gray-100'} p-2 py-1 rounded-sm mr-2 ${isSelected ? 'text-white' : 'text-gray-600'}`}
          >
            {cat.name}
          </button>
        );
      })}
    </>
  );
};

export default CategoryFilter;
