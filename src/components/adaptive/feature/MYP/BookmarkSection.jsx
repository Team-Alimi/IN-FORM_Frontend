import React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import BookmarkItem from "./BookmarkItem";
import { deleteSchoolBookmarksAll } from "../../../../api/deleteSchoolBookmarksAll";
import { useDeviceStore } from "../../../../stores/deviceStore";

const BookmarkSection = () => {
    const queryClient = useQueryClient();

    // 임시 목데이터 연동 (UI 확인용 - 많은 데이터 테스트)
    const MOCK_BOOKMARKS = Array.from({ length: 20 }).map((_, i) => ({
        article_id: i + 1,
        categories: { category_name: "학사공지" },
        title: `임시 북마크된 공지사항 길게 테스트 해보기 ${i + 1}번째 글입니다. 긴 제목 처리용!`,
        vendors: [{ vendor_name: "컴퓨터공학과" }],
        start_date: "2026-03-01",
        due_date: "2026-03-15",
    }));

    const bookmarks = MOCK_BOOKMARKS;

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

    const handleDelete = (id) => {
        alert("아직 준비 중인 기능입니다.");
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
                        <span className="text-sm font-medium text-gray-400 ml-1">{bookmarks.length}</span>
                    </h2>
                    {bookmarks.length > 0 && (
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

                {bookmarks.length > 0 ? (
                    <div className={`
                        overflow-y-auto pr-1 custom-scrollbar
                        ${isMobile ? "max-h-[450px] flex flex-col gap-2.5" : "max-h-[600px] flex flex-col gap-4"}
                    `}>
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
                ) : (
                    <div className="py-16 flex flex-col items-center justify-center text-center">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                            <span className="text-2xl grayscale">📌</span>
                        </div>
                        <p className="text-gray-900 font-bold mb-1">북마크한 글이 없습니다</p>
                        <p className="text-gray-400 text-sm">중요한 공지사항을 북마크해보세요</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BookmarkSection;
