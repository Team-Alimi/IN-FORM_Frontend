import {
  CATEGORY_CODE_TO_NAME_MAP,
  CATEGORY_NAME_COLOR_MAP,
  DEFAULT_CATEGORY_COLOR,
} from '@/constants/filterOption';

const names: Record<string, string> = CATEGORY_CODE_TO_NAME_MAP;
const colors: Record<string, typeof DEFAULT_CATEGORY_COLOR> =
  CATEGORY_NAME_COLOR_MAP;

const CategoryBadge = ({ name }: { name: string }) => {
  const label = names[name] ?? name;
  const color = colors[label] ?? DEFAULT_CATEGORY_COLOR;
  return (
    <span
      className={`whitespace-nowrap rounded-full border px-2 py-1 text-[10px] ${color.bg} ${color.text} ${color.border}`}
    >
      {label}
    </span>
  );
};

export default CategoryBadge;
