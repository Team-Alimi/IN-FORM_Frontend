import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchVendors } from "@/api/main/vendors";
import { fetchMyVendors, putMyVendors } from "@/api/main/user";
import BottomSheet from "@/components/main/mobile/common/BottomSheet";

/**
 * DepartmentEditSheet Component
 * @param {boolean} isOpen - 시트 열림 상태
 * @param {function} onClose - 시트 닫기 함수
 */
const DepartmentEditSheet = ({ isOpen, onClose }) => {
    const [selectedMajorId, setSelectedMajorId] = useState("");
    const queryClient = useQueryClient();

    // 1. 학과(SCHOOL) 벤더 목록 조회
    const { data: vendorsData, isLoading: isVendorsLoading } = useQuery({
        queryKey: ["vendors", "SCHOOL"],
        queryFn: () => fetchVendors("SCHOOL"),
        staleTime: 1000 * 60 * 60, // 1시간 캐싱
        enabled: isOpen, // 시트가 열릴 때만 조회
    });

    // 2. 현재 구독 학과 조회 (초기값 세팅용)
    const { data: myVendorsData } = useQuery({
        queryKey: ["myVendors"],
        queryFn: fetchMyVendors,
        staleTime: 1000 * 60 * 5,
        enabled: isOpen,
    });

    const vendors = vendorsData?.data || [];

    // 시트가 열릴 때마다 서버 값으로 초기화 (취소 후 재오픈 시 미저장 값 제거)
    useEffect(() => {
        if (!isOpen) return;
        const currentVendorId = myVendorsData?.data?.[0]?.id;
        if (currentVendorId) setSelectedMajorId(currentVendorId);
    }, [myVendorsData, isOpen]);

    // 3. 학과 수정 Mutation
    const updateMajorMutation = useMutation({
        mutationFn: (vendorId) => putMyVendors([Number(vendorId)]),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ["myVendors"] });
            alert("학과가 성공적으로 변경되었습니다.");
            onClose();
        },
        onError: (error) => {
            console.error("학과 변경 실패:", error);
            alert("학과 변경 중 오류가 발생했습니다.");
        }
    });

    const handleSave = () => {
        if (!selectedMajorId) {
            alert("학과를 선택해주세요.");
            return;
        }
        updateMajorMutation.mutate(selectedMajorId);
    };

    return (
        <BottomSheet
            isOpen={isOpen}
            onClose={onClose}
        >
            <div className="p-2">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-900">학과 설정</h2>
                </div>

                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-semibold text-gray-500 mb-3 ml-1">현재 설정된 학과</label>
                        <div className="relative">
                            <select
                                value={selectedMajorId}
                                onChange={(e) => setSelectedMajorId(e.target.value)}
                                disabled={isVendorsLoading || updateMajorMutation.isPending}
                                className="w-full px-4 py-4 bg-white text-gray-800 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none cursor-pointer disabled:opacity-50 shadow-sm font-medium"
                            >
                                <option value="" disabled>
                                    {isVendorsLoading ? "학과 목록을 불러오는 중..." : "학과를 선택하세요"}
                                </option>
                                {vendors.map((vendor) => (
                                    <option key={vendor.id} value={vendor.id}>
                                        {vendor.name}
                                    </option>
                                ))}
                            </select>
                            <div className="absolute top-1/2 -translate-y-1/2 right-4 pointer-events-none text-gray-400">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            onClick={onClose}
                            className="flex-1 py-4 text-[15px] font-bold text-gray-500 bg-white border border-gray-200 rounded-2xl hover:bg-gray-50 transition-colors active:scale-95"
                        >
                            취소
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={updateMajorMutation.isPending || (Number(selectedMajorId) === myVendorsData?.data?.[0]?.id)}
                            className="flex-1 py-4 text-[15px] font-bold text-white bg-[#294D7C] rounded-2xl hover:bg-[#1e3a5f] transition-colors shadow-lg shadow-blue-900/10 disabled:bg-gray-300 disabled:shadow-none active:scale-95"
                        >
                            {updateMajorMutation.isPending ? "저장 중..." : "저장하기"}
                        </button>
                    </div>
                </div>
            </div>
        </BottomSheet>
    );
};

export default DepartmentEditSheet;
