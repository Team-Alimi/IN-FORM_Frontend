import type {
  AdminVendor,
  UpdateVendor,
  VendorType,
} from '@/api/manage/vendors';

export interface VendorFormValues {
  name: string;
  initial: string;
  type: VendorType;
  homepage_url: string;
  is_active: boolean;
  club_type_ids: number[];
}
export const getVendorWarning = (vendor: AdminVendor | null) => {
  if (vendor?.type === 'CLUB' && vendor.warning?.includes('크롤러 시드')) {
    const warning = vendor.warning
      .split(/(?<=[.!?])\s+/)
      .filter((sentence) => !sentence.includes('크롤러 시드'))
      .join(' ')
      .trim();
    return warning || undefined;
  }
  return vendor?.warning;
};
export const hasClubTypesChanged = (
  form: VendorFormValues,
  original: AdminVendor
) => {
  const previous = original.club_types?.map((item) => item.id) ?? [];
  return (
    previous.length !== form.club_type_ids.length ||
    previous.some((id) => !form.club_type_ids.includes(id))
  );
};
export const getVendorHomepage = (value?: string) => {
  if (!value) return undefined;
  try {
    const url = new URL(value);
    return ['http:', 'https:'].includes(url.protocol) ? url.href : undefined;
  } catch {
    return undefined;
  }
};
export const validateVendorForm = (
  form: VendorFormValues,
  original: AdminVendor | null
) => {
  if (!form.name.trim()) return '제공처 이름을 입력해 주세요.';
  if (form.name.trim().length > 100)
    return '제공처 이름은 100자까지 입력할 수 있습니다.';
  if (!original) {
    if (!form.initial.trim()) return '식별자를 입력해 주세요.';
    if (form.initial.trim().length > 100)
      return '식별자는 100자까지 입력할 수 있습니다.';
    if (/\s/.test(form.initial.trim()))
      return '식별자에는 공백을 넣을 수 없습니다.';
  }
  const homepage = form.homepage_url.trim();
  if (
    form.type === 'CLUB' &&
    (!original || hasClubTypesChanged(form, original)) &&
    !form.club_type_ids.length
  )
    return '동아리 유형을 하나 이상 선택해 주세요.';
  // 기존의 비표준 주소는 이름/활성 여부만 바꿀 때 다시 보내지 않습니다.
  if (!original || homepage !== (original.homepage_url ?? '').trim()) {
    if (homepage.length > 500)
      return '홈페이지 URL은 500자까지 입력할 수 있습니다.';
    if (homepage && !getVendorHomepage(homepage))
      return '홈페이지 URL은 http:// 또는 https://로 시작하는 주소를 입력해 주세요.';
  }
  return '';
};
export const buildVendorPatch = (
  form: VendorFormValues,
  original: AdminVendor
): UpdateVendor => ({
  ...(form.type === 'CLUB' && hasClubTypesChanged(form, original)
    ? { club_type_ids: form.club_type_ids }
    : {}),
  ...(form.name.trim() !== original.name ? { name: form.name.trim() } : {}),
  ...(form.homepage_url.trim() !== (original.homepage_url ?? '').trim()
    ? { homepage_url: form.homepage_url.trim() }
    : {}),
  ...(form.is_active !== original.is_active
    ? { is_active: form.is_active }
    : {}),
});
