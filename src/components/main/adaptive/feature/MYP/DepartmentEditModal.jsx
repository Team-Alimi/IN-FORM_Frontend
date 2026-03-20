import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import useAuthStore from "@/stores/useAuthStore";
import { getVendors } from "@/api/getVendors";
import { patchUserMajor } from "@/api/patchUserMajor";

/**
 * DepartmentEditModal - Desktop 전용 중앙 모달
 */
const DepartmentEditModal = ({ isOpen, onClose }) => {
    const { userInfo, login, accessToken, refreshToken } = useAuthStore();
    const [selectedMajorId, setSelectedMajorId] = useState(
        userInfo?.major?.vendor_id || ""
    );

    const { data: vendorsData, isLoading: isVendorsLoading } = useQuery({
        queryKey: ["vendors", "SCHOOL"],
        queryFn: () => getVendors("SCHOOL"),
        staleTime: 1000 * 60 * 60,
        enabled: isOpen,
    });

    const vendors = vendorsData?.data || [];

    const updateMajorMutation = useMutation({
        mutationFn: (majorId) => patchUserMajor(userInfo?.user_id, majorId),
        onSuccess: (_, majorId) => {
            const newMajor = vendors.find((v) => v.vendor_id === Number(majorId));
            if (newMajor && userInfo) {
                const updatedUserInfo = { ...userInfo, major: newMajor };
                login(accessToken, refreshToken, updatedUserInfo);
                alert("학과가 성공적으로 변경되었습니다.");
                onClose();
            }
        },
        onError: (error) => {
            console.error("학과 변경 실패:", error);
            alert("학과 변경 중 오류가 발생했습니다.");
            setSelectedMajorId(userInfo?.major?.vendor_id || "");
        }
    });

    const handleSave = () => {
        if (!selectedMajorId) {
            alert("학과를 선택해주세요.");
            return;
        }
        updateMajorMutation.mutate(selectedMajorId);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onClose} />
            <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-gray-900">학과 설정</h2>
                        <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M18 6L6 18M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div className="space-y-4">
                        <div className="relative">
                            <label className="block text-sm font-semibold text-gray-600 mb-2">현재 설정된 학과</label>
                            <select
                                value={selectedMajorId}
                                onChange={(e) => setSelectedMajorId(e.target.value)}
                                disabled={isVendorsLoading || updateMajorMutation.isPending}
                                className="w-full px-4 py-3.5 bg-gray-50 text-gray-800 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none cursor-pointer disabled:opacity-50"
                            >
                                <option value="" disabled>
                                    {isVendorsLoading ? "학과 목록을 불러오는 중..." : "학과를 선택하세요"}
                                </option>
                                {vendors.map((vendor) => (
                                    <option key={vendor.vendor_id} value={vendor.vendor_id}>
                                        {vendor.vendor_name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="pt-4 flex gap-3">
                            <button onClick={onClose} className="flex-1 px-4 py-3.5 text-sm font-bold text-gray-500 bg-gray-100 rounded-xl hover:bg-gray-200">취소</button>
                            <button
                                onClick={handleSave}
                                disabled={updateMajorMutation.isPending}
                                className="flex-1 px-4 py-3.5 text-sm font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 disabled:bg-blue-300 shadow-md shadow-blue-100"
                            >
                                {updateMajorMutation.isPending ? "저장 중..." : "저장하기"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DepartmentEditModal;
