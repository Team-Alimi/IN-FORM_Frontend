// 순서와 무관하게 실제 선택이 변경된 영역만 저장한다. 빈 배열로 변경한 경우도 포함한다.
export const saveInterestChanges = async (sections, onSaved) => {
  const changed = sections.filter(({ selectedIds, savedIds }) =>
    selectedIds.size !== savedIds.size ||
    [...selectedIds].some((id) => !savedIds.has(id)),
  );
  const results = await Promise.allSettled(changed.map(async (section) => {
    const ids = [...section.selectedIds];
    await section.save(ids);
    onSaved(section, ids);
  }));

  return results.flatMap((result, index) =>
    result.status === "rejected"
      ? [{ label: changed[index].label, error: result.reason }]
      : [],
  );
};
