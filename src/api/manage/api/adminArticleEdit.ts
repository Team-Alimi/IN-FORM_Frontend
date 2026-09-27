// API 연동
import type {
  FormCategories,
  FormVendorListComponent,
} from '@/api/manage/dto/adminDto';
import api from '@/api/axios';

// [GET] /api/v1/categories
// 활성화된 카테고리 목록 조회
export const getCategoriesAll = async (): Promise<FormCategories[]> => {
  const response = await api.get('/api/v1/categories');
  return response.data.data;
};
// [GET] /api/v1/vendors
// 전체 출처 학과 정보 조회
export const getVendorList = async (): Promise<FormVendorListComponent[]> => {
  const response = await api.get('/api/v1/vendors');
  return response.data.data;
};
