import React, { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import useAuthStore from "@/stores/useAuthStore";
import { deleteAccount } from "@/api/main/user";
import { useNavigate } from "react-router-dom";

/**
 * AccountDeleteModal - Desktop 전용 회원 탈퇴 모달
 */
const AccountDeleteModal = ({ isOpen, onClose }) => {
    const { logout } = useAuthStore();
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const [inputText, setInputText] = useState("");

    // 모달이 닫힐 때 입력창 초기화
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
            navigate("/"); // 홈 메인 화면으로 리다이렉트 (로그인 페이지 등도 가능)
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

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onClose} />
            <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-gray-900">회원 탈퇴</h2>
                        <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M18 6L6 18M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div className="space-y-4">
                        <p className="text-sm text-gray-600 leading-relaxed font-medium">
                            탈퇴를 하시면 회원님의 모든 정보가 삭제됩니다. 정말 탈퇴하시겠습니까?
                            <br />
                            아래에 <span className="font-bold text-red-500">'탈퇴합니다'</span>를 입력해주세요.
                        </p>

                        <div className="relative">
                            <input
                                type="text"
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                placeholder="탈퇴합니다"
                                disabled={deleteMutation.isPending}
                                className="w-full px-4 py-3.5 bg-gray-50 text-gray-800 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all font-medium disabled:opacity-50"
                            />
                        </div>

                        <div className="pt-4 flex gap-3">
                            <button
                                onClick={onClose}
                                className="flex-1 px-4 py-3.5 text-sm font-bold text-gray-500 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                            >
                                취소
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={inputText !== "탈퇴합니다" || deleteMutation.isPending}
                                className="flex-1 px-4 py-3.5 text-sm font-bold text-white bg-red-600 rounded-xl hover:bg-red-700 disabled:bg-gray-300 shadow-md shadow-red-100 transition-all"
                            >
                                {deleteMutation.isPending ? "처리 중..." : "탈퇴하기"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AccountDeleteModal;
