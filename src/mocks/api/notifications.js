/**
 * [MOCK] src/api/main/notifications.js 의 더미 버전
 *
 * 실제 서버 대신 src/mocks/data.js 의 더미 알림 데이터를 반환합니다.
 * vite.config.js 의 alias 설정으로 실제 파일 대신 이 파일이 사용됩니다.
 *
 * 포함 함수:
 *   - fetchNotifications   : 알림 목록 반환 (is_read 상태 포함)
 *   - fetchUnreadCount     : 읽지 않은 알림 수 반환
 *   - readAllNotifications : 모든 알림을 읽음 처리 (메모리에서 is_read: true 로 변경)
 *
 * 주의: 페이지 새로고침 시 알림 상태가 초기 더미 데이터로 리셋됩니다.
 */
import { MOCK_NOTIFICATIONS } from "@/mocks/data";

let _notifications = [...MOCK_NOTIFICATIONS];

export const fetchNotifications = async () => {
  return _notifications;
};

export const fetchUnreadCount = async () => {
  const unread = _notifications.filter((n) => !n.is_read).length;
  return { unread_count: unread };
};

export const readAllNotifications = async () => {
  _notifications = _notifications.map((n) => ({ ...n, is_read: true }));
  return { data: { success: true } };
};