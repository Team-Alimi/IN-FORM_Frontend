import React, { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import useAuthStore from "@/stores/useAuthStore";
import { deleteAccount } from "@/api/user";
import BottomSheet from "@/components/main/mobile/common/BottomSheet";
import { useNavigate } from "react-router-dom";

/**
 * AccountDeleteSheet Component
 * @param {boolean} isOpen - 시트 열림 상태
 * @param {function} onClose - 시트 닫기 함수
 */
const AccountDeleteSheet = ({ isOpen, onClose }) => {
    const { logout } = useAuthStore();
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const [inputText, setInputText] = useState("");

    // 시트가 닫힐 때 입력창 초기화
    useEffect(() => {
        if (!isOpen) {
            setInputText("");
        }
    }, [isOpen]);

    const deleteMutation = useMutation({
        mutationFn: deleteAccount,
        onSuccess: () => {
            alert("회원 탈퇴가 완료되었습니다.");
            logout();
            queryClient.clear();
            onClose();
            navigate("/"); // 홈 메인으로 리다이렉트
        },
        onError: (error) => {
            console.error("회원 탈퇴 실패:", error);
            alert("회원 탈퇴 처리 중 오류가 발생했습니다.");
        }
    });

    const handleDelete = () => {
        if (inputText !== "탈퇴합니다") return;
        deleteMutation.mutate();
    };

    return (
        <BottomSheet isOpen={isOpen} onClose={onClose}>
            <div className="p-2">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-900">회원 탈퇴</h2>
                </div>

                <div className="space-y-6">
                    <div>
                        <p className="text-sm font-medium text-gray-600 mb-4 ml-1 leading-relaxed">
                            탈퇴를 하시면 회원님의 모든 정보가 삭제됩니다. 정말 탈퇴하시겠습니까?
                            <br />
                            아래에 <span className="font-bold text-red-500">'탈퇴합니다'</span>를 입력해주세요.
                        </p>
                        <input
                            type="text"
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            placeholder="탈퇴합니다"
                            disabled={deleteMutation.isPending}
                            className="w-full px-4 py-4 bg-white text-gray-800 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all font-medium shadow-sm disabled:opacity-50"
                        />
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            onClick={onClose}
                            className="flex-1 py-4 text-[15px] font-bold text-gray-500 bg-white border border-gray-200 rounded-2xl hover:bg-gray-50 transition-colors active:scale-95"
                        >
                            취소
                        </button>
                        <button
                            onClick={handleDelete}
                            disabled={inputText !== "탈퇴합니다" || deleteMutation.isPending}
                            className="flex-1 py-4 text-[15px] font-bold text-white bg-red-600 rounded-2xl hover:bg-red-700 transition-colors shadow-lg shadow-red-900/10 disabled:bg-gray-300 disabled:shadow-none active:scale-95"
                        >
                            {deleteMutation.isPending ? "처리 중..." : "탈퇴하기"}
                        </button>
                    </div>
                </div>
            </div>
        </BottomSheet>
    );
};

export default AccountDeleteSheet;
