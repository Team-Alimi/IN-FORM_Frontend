import api from "./axios";

/**
 * 알림 목록 조회
 * @returns {Promise} 알림 데이터 배열 (notification_id, title, message, article_type, article_id, is_read, created_at 포함)
 */
export const fetchNotifications = async () => {
    const res = await api.get("/api/v1/notifications");
    return res.data.data;
};

/**
 * 안 읽은 알림 개수 조회 (배지용)
 * @returns {Promise} unread_count를 포함한 객체
 */
export const fetchUnreadCount = async () => {
    const res = await api.get("/api/v1/notifications/unread-count");
    return res.data.data;
};

/**
 * 전체 알림 읽음 처리
 * @returns {Promise} 성공 여부
 */
export const readAllNotifications = async () => {
    const res = await api.patch("/api/v1/notifications/read-all");
    return res.data;
};
