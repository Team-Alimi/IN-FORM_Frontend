/**
 * [MOCK] src/api/main/notifications.js 의 더미 버전
 *
 * 실제 서버 대신 src/mocks/data.js 의 더미 알림 데이터를 반환합니다.
 * vite.config.js 의 alias 설정으로 실제 파일 대신 이 파일이 사용됩니다.
 *
 * 포함 함수:
 *   - fetchNotifications   : 알림 목록 반환 (페이지네이션 포함)
 *   - fetchUnreadCount     : 읽지 않은 알림 수 반환
 *   - readNotification     : 개별 알림 읽음 처리
 *   - readAllNotifications : 모든 알림을 읽음 처리
 *
 * 주의: 페이지 새로고침 시 알림 상태가 초기 더미 데이터로 리셋됩니다.
 */
import { MOCK_NOTIFICATIONS } from "@/mocks/data";

let _notifications = [...MOCK_NOTIFICATIONS];

export const fetchNotifications = async (page = 1) => {
  const size = 20;
  const start = (page - 1) * size;
  const content = _notifications.slice(start, start + size);
  return {
    content,
    page_info: {
      current_page: page,
      size,
      total_pages: Math.ceil(_notifications.length / size),
      total_items: _notifications.length,
      has_next: start + size < _notifications.length,
    },
  };
};

export const fetchUnreadCount = async () => {
  const unread = _notifications.filter((n) => !n.read).length;
  return { unread_count: unread };
};

export const readNotification = async (notificationId) => {
  _notifications = _notifications.map((n) =>
    n.id === notificationId ? { ...n, read: true } : n
  );
  return { success: true };
};

export const readAllNotifications = async () => {
  const readCount = _notifications.filter((n) => !n.read).length;
  _notifications = _notifications.map((n) => ({ ...n, read: true }));
  return { success: true, data: { read_count: readCount } };
};
