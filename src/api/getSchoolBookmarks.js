import instance from "./axios";

/**
 * 북마크한 학교 글 목록 조회
 * @param {Object} params - page, size, category_id, keyword
 * @returns {Promise}
 */
export async function getSchoolBookmarks(params) {
    try {
        const res = await instance.get("/api/v1/bookmarks/school", {
            params,
        });
        return res.data;
    } catch (error) {
        console.error("[API] getSchoolBookmarks 에러 발생:", error);
        throw error;
    }
}
