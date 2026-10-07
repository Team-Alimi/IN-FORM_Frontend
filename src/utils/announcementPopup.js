const KEY = 'inform-announcement-hidden-v1';
export const readHiddenAnnouncements = () => {
  try {
    const value = JSON.parse(localStorage.getItem(KEY) || '{}');
    return value && typeof value === 'object' && !Array.isArray(value)
      ? value
      : {};
  } catch {
    return {};
  }
};
export const isAnnouncementHidden = (id, hidden, now = Date.now()) =>
  typeof hidden[id] === 'number' && hidden[id] > now;
export const hideAnnouncementForWeek = (id) => {
  const now = Date.now();
  const hidden = Object.fromEntries(
    Object.entries(readHiddenAnnouncements()).filter(
      ([, until]) => typeof until === 'number' && until > now
    )
  );
  hidden[id] = now + 7 * 24 * 60 * 60 * 1000;
  try {
    localStorage.setItem(KEY, JSON.stringify(hidden));
  } catch {
    /* In-memory dismissal still works. */
  }
};
