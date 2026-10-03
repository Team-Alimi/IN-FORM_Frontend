export const getArticleClubTypes = (vendors = []) => {
  const types = new Map();
  for (const vendor of vendors ?? []) {
    if (vendor.type !== 'CLUB') continue;
    for (const type of vendor.club_types ?? []) {
      if (!types.has(type.id)) types.set(type.id, type);
    }
  }
  return [...types.values()];
};
