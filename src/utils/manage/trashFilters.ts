import type { TrashArticle } from '@/api/manage/trash';

export interface TrashFilters {
  id: string;
  title: string;
  vendor: string;
  category: string;
  start: string;
  end: string;
  status: string;
}
export const EMPTY_TRASH_FILTERS: TrashFilters = {
  id: '',
  title: '',
  vendor: '',
  category: '',
  start: '',
  end: '',
  status: '',
};

/** 일반 관리자 검색과 같은 기간 겹침 조건이며, 미정인 날짜는 열린 구간입니다. */
export const filterTrashArticles = (
  rows: TrashArticle[],
  filters: TrashFilters
) =>
  rows.filter(
    (row) =>
      (!filters.id || row.id === Number(filters.id)) &&
      (!filters.title ||
        row.title
          .toLocaleLowerCase()
          .includes(filters.title.toLocaleLowerCase())) &&
      (!filters.vendor ||
        row.vendors.some((vendor) =>
          vendor.name
            .toLocaleLowerCase()
            .includes(filters.vendor.toLocaleLowerCase())
        )) &&
      (!filters.category ||
        row.categories.some(
          (category) => category.id === Number(filters.category)
        )) &&
      (!filters.status || row.previous_status === filters.status) &&
      (!filters.start || !row.ends_on || row.ends_on >= filters.start) &&
      (!filters.end || !row.starts_on || row.starts_on <= filters.end)
  );
