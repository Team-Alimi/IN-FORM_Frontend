import api from "@/api/axios";

/**
 * 알림 목록 조회 (최신순, 페이지네이션)
 * @param {number} page - 페이지 번호 (1부터 시작, 기본값 1)
 * @returns {Promise<{ content: Array, page_info: Object }>}
 */
export const fetchNotifications = async (page = 1) => {
  try {
    const res = await api.get("/api/v1/notifications", { params: { page, size: 20 } });
    return res.data.data; // { content: [...], page_info: {...} }
  } catch (error) {
    console.error("알림 목록 조회 실패:", error);
    throw error;
  }
};

/**
 * 안 읽은 알림 개수 조회 (배지용)
 * @returns {Promise<{ unread_count: number }>}
 */
export const fetchUnreadCount = async () => {
  try {
    const res = await api.get("/api/v1/notifications/unread-count");
    return res.data.data;
  } catch (error) {
    console.error("읽지 않은 알림 개수 조회 실패:", error);
    throw error;
  }
};

/**
 * 알림 개별 읽음 처리
 * @param {number} notificationId - 읽음 처리할 알림 ID
 * @returns {Promise}
 */
export const readNotification = async (notificationId) => {
  try {
    const res = await api.patch(`/api/v1/notifications/${notificationId}/read`);
    return res.data;
  } catch (error) {
    console.error("알림 개별 읽음 처리 실패:", error);
    throw error;
  }
};

/**
 * 전체 알림 읽음 처리
 * @returns {Promise<{ read_count: number }>}
 */
export const readAllNotifications = async () => {
  try {
    const res = await api.patch("/api/v1/notifications/read-all");
    return res.data;
  } catch (error) {
    console.error("알림 전체 읽음 처리 실패:", error);
    throw error;
  }
};
