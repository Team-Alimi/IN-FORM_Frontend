import { test } from "node:test";
import assert from "node:assert/strict";
import { saveInterestChanges } from "../../src/utils/saveInterestChanges.js";

const section = (label, before, after, save) => ({
  label, savedIds: new Set(before), selectedIds: new Set(after), save,
});

test("공지 분야만 선택하면 변경하지 않은 빈 영역은 요청하지 않는다", async () => {
  const calls = [];
  const sections = [
    section("vendors", [], [], () => calls.push("vendors")),
    section("categories", [], [1], (ids) => calls.push(ids)),
    section("clubTypes", [], [], () => calls.push("clubTypes")),
  ];
  assert.deepEqual(await saveInterestChanges(sections, () => {}), []);
  assert.deepEqual(calls, [[1]]);
});

test("변경 없음과 선택 순서 변경은 요청하지 않고 명시적인 전체 해제는 저장한다", async () => {
  const calls = [];
  await saveInterestChanges([
    section("unchanged", [1, 2], [2, 1], () => calls.push("unexpected")),
    section("empty", [], [], () => calls.push("unexpected")),
    section("clear", [1], [], (ids) => calls.push(ids)),
  ], () => {});
  assert.deepEqual(calls, [[]]);
});

test("일부 실패해도 성공 결과를 동기화하고 재시도는 실패 영역만 저장한다", async () => {
  const calls = [];
  let shouldFail = true;
  const error = new Error("실패");
  const sections = [
    section("success", [], [1], async () => {
      await new Promise((resolve) => setTimeout(resolve, 10));
      calls.push("success");
    }),
    section("failure", [], [2], () => {
      calls.push("failure");
      if (shouldFail) throw error;
    }),
  ];
  const saved = [];
  const handleSaved = (item, ids) => {
    item.savedIds = new Set(ids);
    saved.push(item.label);
  };
  assert.deepEqual(await saveInterestChanges(sections, handleSaved), [{ label: "failure", error }]);
  assert.deepEqual(saved, ["success"]);
  shouldFail = false;
  assert.deepEqual(await saveInterestChanges(sections, handleSaved), []);
  assert.deepEqual(calls, ["failure", "success", "failure"]);
});
