import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getVendorWarning } from '../../../src/utils/manage/vendorForm.ts';

const registration = '크롤러 시드에 "vendor": "test.club" 를 추가해야 수집이 시작됩니다.';
const hiding = '목록·필터에서만 숨겨집니다.';
const crawler = '수집을 멈추려면 크롤러 시드에서 "test.club" 를 함께 빼야 합니다.';

test('CLUB keeps hiding guidance while removing only the crawler sentence', () => {
  assert.equal(getVendorWarning({ type: 'CLUB', warning: `${hiding} ${crawler}` }), hiding);
  assert.equal(getVendorWarning({ type: 'CLUB', warning: `${hiding}\n${crawler}\n추가 안내입니다.` }), `${hiding} 추가 안내입니다.`);
});

test('CLUB registration crawler guidance stays hidden', () => {
  assert.equal(getVendorWarning({ type: 'CLUB', warning: registration }), undefined);
});

test('SCHOOL and unrelated warnings remain unchanged', () => {
  for (const warning of [registration, `${hiding} ${crawler}`]) {
    assert.equal(getVendorWarning({ type: 'SCHOOL', warning }), warning);
  }
  assert.equal(getVendorWarning({ type: 'CLUB', warning: '추가 안내입니다.' }), '추가 안내입니다.');
  assert.equal(getVendorWarning({ type: 'CLUB' }), undefined);
  assert.equal(getVendorWarning(null), undefined);
});
