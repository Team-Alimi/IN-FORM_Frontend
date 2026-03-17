import instance from "@/api/axios";

/**
 * 북마크한 학교 공지사항 개별 삭제
 * @param {number} article_id - 삭제할 게시글의 고유 식별자
 * @returns {Promise}
 */
export async function deleteSchoolBookmark(article_id) {
    try {
        const res = await instance.delete(`/api/v1/bookmarks/school/${article_id}`);
        return res.data;
    } catch (error) {
        console.error(`[API] deleteSchoolBookmark (ID: ${article_id}) 에러 발생:`, error);
        throw error;
    }
}
