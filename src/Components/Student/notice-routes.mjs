export const NOTICE_BOARD_PATH = "/student-dashboard/notice-board";

export function noticeUrl(id) {
  return `${NOTICE_BOARD_PATH}?announcement=${encodeURIComponent(id)}#notice-${encodeURIComponent(id)}`;
}

export function legacyNoticeUrl(location) {
  if (location.pathname !== "/student-dashboard") return null;
  const id = new URLSearchParams(location.search).get("announcement");
  if (id) return noticeUrl(id);
  return location.hash === "#notice-board" ? NOTICE_BOARD_PATH : null;
}
