import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import BookmarkItem from "./BookmarkItem";
import { getSchoolBookmarks } from "../../../../api/getSchoolBookmarks";
import { deleteSchoolBookmarksAll } from "../../../../api/deleteSchoolBookmarksAll";

const BookmarkSection = () => {
    const queryClient = useQueryClient();

    // 1. 북마크 목록 조회 (임의로 첫 페이지, 50개까지 가져옴)
    const { data: bookmarkData, isLoading, isError } = useQuery({
        queryKey: ["schoolBookmarks"],
        queryFn: () => getSchoolBookmarks({ page: 1, size: 50 }),
    });

    const bookmarks = bookmarkData?.data?.school_articles || [];

    // 2. 일괄 삭제 Mutation
    const deleteAllMutation = useMutation({
        mutationFn: deleteSchoolBookmarksAll,
        onSuccess: () => {
            // 삭제 성공 시 북마크 목록 새로고침(무효화)
            queryClient.invalidateQueries(["schoolBookmarks"]);
            alert("모든 북마크가 삭제되었습니다.");
        },
        onError: (error) => {
            console.error("일괄 삭제 실패:", error);
            alert("일괄 삭제에 실패했습니다.");
        }
    });

    const handleDelete = (id) => {
        // 개별 API가 구비되지 않았으므로 임시 알림 처리
        alert("아직 준비 중인 기능입니다.");
    };

    const handleBatchDelete = () => {
        if (window.confirm("모든 북마크를 삭제하시겠습니까?")) {
            deleteAllMutation.mutate();
        }
    };

    return (
        <div className="mb-8 w-full">
            {/* Header section (Title & Batch Delete) */}
            <div className="flex justify-between items-end mb-5 px-1 md:px-2">
                <h2 className="text-[18px] md:text-[20px] font-extrabold text-gray-800 flex items-center gap-2">
                    <span className="text-[20px] md:text-[22px]">📌</span> 북마크한 글
                </h2>
                {bookmarks.length > 0 && (
                    <button
                        onClick={handleBatchDelete}
                        className="text-[13.5px] md:text-[14.5px] text-red-500 font-bold hover:underline mb-0.5 transition-all"
                    >
                        일괄 삭제
                    </button>
                )}
            </div>

            {/* Content Section */}
            <div className="bg-white rounded-[20px] shadow-[0_2px_15px_rgb(0,0,0,0.03)] border border-gray-100 overflow-hidden min-h-[400px] flex flex-col">
                {isLoading ? (
                    <div className="flex-1 flex justify-center items-center text-gray-400">
                        <div className="w-8 h-8 border-4 border-gray-100 border-t-[#0056b3] rounded-full animate-spin"></div>
                    </div>
                ) : isError ? (
                    <div className="flex-1 flex justify-center items-center text-red-400 font-medium">북마크를 불러오는데 실패했습니다.</div>
                ) : bookmarks.length > 0 ? (
                    <div className="flex-1 overflow-y-auto max-h-[500px] p-4 custom-scrollbar">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {bookmarks.map((bookmark) => (
                                <BookmarkItem
                                    key={bookmark.article_id}
                                    id={bookmark.article_id}
                                    category={bookmark.categories?.category_name || "분류없음"}
                                    title={bookmark.title}
                                    source={bookmark.vendors?.[0]?.vendor_name || "출처없음"}
                                    startDate={bookmark.start_date}
                                    dueDate={bookmark.due_date}
                                    onDelete={handleDelete}
                                />
                            ))}
                        </div>
                    </div>
                ) : (
                    // Empty State (북마크 0개 일때 mypage1.jpg 화면)
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
                        <div className="w-[72px] h-[72px] bg-gray-50 rounded-full flex items-center justify-center mb-6">
                            <span className="text-3xl drop-shadow-sm rotate-45 transform -translate-x-0.5 -translate-y-0.5">
                                📌
                            </span>
                        </div>
                        <p className="text-gray-500 font-bold mb-2 text-[15px] md:text-[16px]">
                            북마크한 글이 없습니다
                        </p>
                        <p className="text-gray-400 text-[13px] md:text-[14px] font-medium">
                            중요한 공지사항을 북마크해보세요
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BookmarkSection;
