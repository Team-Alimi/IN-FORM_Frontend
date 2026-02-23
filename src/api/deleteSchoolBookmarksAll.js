import instance from "./axios";

/**
 * 북마크한 학교글 전체 삭제
 * @returns {Promise}
 */
export async function deleteSchoolBookmarksAll() {
    try {
        // delete 메소드 사용
        const res = await instance.delete("/api/v1/bookmarks/school/all");
        return res.data;
    } catch (error) {
        console.error("[API] deleteSchoolBookmarksAll 에러 발생:", error);
        throw error;
    }
}
