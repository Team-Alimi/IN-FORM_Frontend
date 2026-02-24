import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import BookmarkItem from "./BookmarkItem";
import { deleteSchoolBookmarksAll } from "../../../../api/deleteSchoolBookmarksAll";
import { deleteSchoolBookmark } from "../../../../api/deleteSchoolBookmark";
import { getSchoolBookmarks } from "../../../../api/getSchoolBookmarks";
import { useDeviceStore } from "../../../../stores/deviceStore";
import useAuthStore from "../../../../stores/useAuthStore";

const BookmarkSection = () => {
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const { userInfo } = useAuthStore();
    const isLoggedIn = !!userInfo;

    // 실제 데이터 페칭
    const { data: bookmarkData, isLoading } = useQuery({
        queryKey: ["schoolBookmarks"],
        queryFn: () => getSchoolBookmarks({ page: 1, size: 50 }),
        enabled: isLoggedIn,
    });

    // API 응답 구조에 맞게 데이터 가공 (school_articles)
    const bookmarks = bookmarkData?.data?.school_articles || [];

    // 일괄 삭제 Mutation
    const deleteAllMutation = useMutation({
        mutationFn: deleteSchoolBookmarksAll,
        onSuccess: () => {
            queryClient.invalidateQueries(["schoolBookmarks"]);
            alert("모든 북마크가 삭제되었습니다.");
        },
        onError: (error) => {
            console.error("일괄 삭제 실패:", error);
            alert("일괄 삭제에 실패했습니다.");
        }
    });

    // 개별 삭제 Mutation
    const deleteBookmarkMutation = useMutation({
        mutationFn: (id) => deleteSchoolBookmark(id),
        onSuccess: () => {
            queryClient.invalidateQueries(["schoolBookmarks"]);
            alert("북마크가 삭제되었습니다.");
        },
        onError: (error) => {
            console.error("북마크 삭제 실패:", error);
            alert("북마크 삭제에 실패했습니다.");
        }
    });

    const handleDelete = (id) => {
        if (window.confirm("이 북마크를 삭제하시겠습니까?")) {
            deleteBookmarkMutation.mutate(id);
        }
    };

    const handleBatchDelete = () => {
        if (window.confirm("모든 북마크를 삭제하시겠습니까?")) {
            deleteAllMutation.mutate();
        }
    };

    const isMobile = useDeviceStore((state) => state.isMobile);

    return (
        <div className="w-full">
            {/* Unified Section Container */}
            <div className={`
                ${isMobile
                    ? "bg-[#F4F8FE] rounded-[28px] border border-[#E8F0FB] shadow-[0_8px_30px_rgb(0,72,152,0.05)] p-4 pt-5"
                    : "bg-white rounded-2xl border border-gray-100 shadow-[0_2px_15px_rgb(0,0,0,0.03)] p-6 md:p-8"
                }
            `}>
                {/* Header section (Title & Batch Delete) - Integrated inside box */}
                <div className="flex justify-between items-center mb-5 md:mb-6 px-1">
                    <h2 className={`
                        font-bold text-gray-900 flex items-center gap-2
                        ${isMobile ? "text-[17px]" : "text-[20px]"}
                    `}>
                        📌 북마크한 글
                        {isLoggedIn && (
                            <span className="text-sm font-medium text-gray-400 ml-1">{bookmarks.length}</span>
                        )}
                    </h2>
                    {isLoggedIn && bookmarks.length > 0 && (
                        <button
                            onClick={handleBatchDelete}
                            className={`
                                font-semibold text-red-500 hover:text-red-600 transition-colors
                                ${isMobile ? "text-[13px]" : "text-[14px]"}
                            `}
                        >
                            전체 삭제
                        </button>
                    )}
                </div>

                {isLoggedIn ? (
                    isLoading ? (
                        <div className="py-20 text-center text-gray-400">데이터를 불러오는 중입니다...</div>
                    ) : bookmarks.length > 0 ? (
                        <div className={`
                            overflow-y-auto pr-1 custom-scrollbar
                            ${isMobile ? "max-h-[450px] flex flex-col gap-2.5" : "max-h-[600px] flex flex-col gap-4"}
                        `}>
                            {bookmarks.map((bookmark) => (
                                <BookmarkItem
                                    key={bookmark.article_id}
                                    id={bookmark.article_id}
                                    category={bookmark.categories?.category_name || "분속없음"}
                                    title={bookmark.title}
                                    source={bookmark.vendors?.[0]?.vendor_name || bookmark.vendor_name || "출처없음"}
                                    startDate={bookmark.start_date || ""}
                                    dueDate={bookmark.due_date || ""}
                                    status={bookmark.status}
                                    bookmarkCount={bookmark.bookmark_count || 0}
                                    onDelete={handleDelete}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="py-16 flex flex-col items-center justify-center text-center">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                <span className="text-2xl grayscale">📌</span>
                            </div>
                            <p className="text-gray-900 font-bold mb-1">북마크한 글이 없습니다</p>
                            <p className="text-gray-400 text-sm">중요한 공지사항을 북마크해보세요</p>
                        </div>
                    )
                ) : (
                    /* Guest View UI */
                    <div className="py-12 md:py-16 flex flex-col items-center justify-center text-center">
                        <p className="text-gray-900 font-bold text-[20px] mb-2">로그인 해야만 이용하실 수 있습니다</p>
                        <p className="text-gray-400 text-[14px] mb-10">북마크 기능을 사용하려면 로그인이 필요합니다.</p>

                        <button
                            onClick={() => navigate("/login")}
                            className="bg-[#0056b3] hover:bg-[#004a99] text-white font-bold py-3.5 px-10 rounded-2xl shadow-lg shadow-blue-900/10 transition-all active:scale-95"
                        >
                            로그인 하러가기
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BookmarkSection;
