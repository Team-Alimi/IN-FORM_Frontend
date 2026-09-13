import { test } from "node:test";
import assert from "node:assert/strict";
import { getDeadlineStatusParam } from "../../src/utils/deadlineStatusParam.js";

test("전체 및 빈 선택은 서버 상태 필터를 생략한다", () => {
  assert.equal(getDeadlineStatusParam(), undefined);
  assert.equal(getDeadlineStatusParam([]), undefined);
  assert.equal(getDeadlineStatusParam(["ALL", "OPEN"]), undefined);
});

test("모든 EVL 상태를 명세의 API 값으로 변환한다", () => {
  for (const [input, expected] of Object.entries({
    OPEN: "OPEN", ENDING_SOON: "CLOSING_SOON", UPCOMING: "UPCOMING", CLOSED: "CLOSED",
  })) assert.equal(getDeadlineStatusParam([input]), expected);
});

test("복수 선택은 쉼표 OR 조건으로 전달하며 중복과 미지원 값을 제외한다", () => {
  assert.equal(getDeadlineStatusParam(["OPEN", "ENDING_SOON"]), "OPEN,CLOSING_SOON");
  assert.equal(getDeadlineStatusParam(["ENDING_SOON", "CLOSING_SOON", "UNKNOWN"]), "CLOSING_SOON");
  assert.equal(getDeadlineStatusParam(["UNKNOWN"]), undefined);
  assert.equal(getDeadlineStatusParam(["ALWAYS"]), "ALWAYS");
});
