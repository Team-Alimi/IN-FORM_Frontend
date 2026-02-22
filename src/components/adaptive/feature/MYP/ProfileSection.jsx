import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import useAuthStore from "../../../../stores/useAuthStore";
import { getVendors } from "../../../../api/getVendors";
import { patchUserMajor } from "../../../../api/patchUserMajor";

const ProfileSection = () => {
    const { userInfo, login, accessToken, refreshToken } = useAuthStore();

    // 로컬 상태로 먼저 UI를 제어하고, API 성공 시 전역 상태 동기화
    const [selectedMajorId, setSelectedMajorId] = useState(
        userInfo?.major?.vendor_id || ""
    );

    // 1. 학과(SCHOOL) 벤더 목록 조회
    const { data: vendorsData, isLoading: isVendorsLoading } = useQuery({
        queryKey: ["vendors", "SCHOOL"],
        queryFn: () => getVendors("SCHOOL"),
        staleTime: 1000 * 60 * 60, // 1시간 캐싱
    });

    const vendors = vendorsData?.data || [];

    // 2. 학과 수정 Mutation
    const updateMajorMutation = useMutation({
        mutationFn: (majorId) => patchUserMajor(userInfo?.user_id, majorId),
        onSuccess: (_, majorId) => {
            // 변경된 학과 객체 찾기
            const newMajor = vendors.find((v) => v.vendor_id === Number(majorId));

            if (newMajor && userInfo) {
                // 기존 스토어의 userInfo에서 major만 교체하여 다시 login(저장) 처리
                const updatedUserInfo = {
                    ...userInfo,
                    major: newMajor,
                };
                login(accessToken, refreshToken, updatedUserInfo);
                alert("학과가 성공적으로 변경되었습니다.");
            }
        },
        onError: (error) => {
            console.error("학과 변경 실패:", error);
            alert("학과 변경 중 오류가 발생했습니다.");
            // 롤백 (원래 스토어 값으로)
            setSelectedMajorId(userInfo?.major?.vendor_id || "");
        }
    });

    const handleMajorChange = (e) => {
        const newMajorId = e.target.value;
        setSelectedMajorId(newMajorId);

        if (newMajorId && userInfo?.user_id) {
            updateMajorMutation.mutate(newMajorId);
        }
    };

    return (
        <div className="bg-white rounded-2xl p-5 md:p-8 shadow-[0_2px_15px_rgb(0,0,0,0.03)] border border-gray-100 flex flex-col mb-8 w-full transition-all">
            <div className="flex items-center gap-4 mb-6">
                {/* Profile Image Dummy */}
                <div className="w-16 h-16 md:w-20 md:h-20 bg-[#0056b3] rounded-full flex items-center justify-center text-white text-3xl shadow-sm shrink-0">
                    <svg className="w-8 h-8 md:w-10 md:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                </div>

                {/* User Info */}
                <div className="flex flex-col justify-center overflow-hidden">
                    <h2 className="text-[19px] md:text-2xl font-extrabold text-gray-900 truncate">
                        {userInfo?.name || "student"}
                    </h2>
                    <p className="text-gray-500 text-[13px] md:text-sm mt-0.5 truncate">
                        {userInfo?.email || "student@inha.edu"}
                    </p>
                </div>
            </div>

            {/* Major Input Section */}
            <div className="mt-1 relative">
                <label className="block text-sm font-semibold text-gray-600 mb-2.5">학과</label>
                <div className="relative">
                    <select
                        value={selectedMajorId}
                        onChange={handleMajorChange}
                        disabled={isVendorsLoading || updateMajorMutation.isPending}
                        className="w-full px-4 py-3.5 bg-gray-50/80 text-gray-800 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0056b3]/30 focus:border-[#0056b3] transition-all text-sm md:text-base font-medium appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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

                    {/* Custom Select Dropdown Arrow */}
                    <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-gray-400">
                        {updateMajorMutation.isPending ? (
                            <div className="w-4 h-4 border-2 border-gray-300 border-t-[#0056b3] rounded-full animate-spin"></div>
                        ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileSection;
