import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  IoNotificationsOutline,
  IoChatbubbleEllipsesOutline,
  IoDocumentTextOutline,
  IoShieldCheckmarkOutline,
  IoLogOutOutline,
  IoPersonRemoveOutline,
} from "react-icons/io5";
import useAuthStore from "@/stores/useAuthStore";
import { useDeviceStore } from "@/stores/deviceStore";
import { fetchMyProfile, patchNotificationSetting } from "@/api/main/user";
import { postLogout } from "@/api/main/auth";
import AccountDeleteSheet from "@/components/main/adaptive/feature/MYP/AccountDeleteSheet";
import AccountDeleteModal from "@/components/main/adaptive/feature/MYP/AccountDeleteModal";
import MobileHeader from "@/components/main/mobile/common/MobileHeader";

// ─── 설정 행 컴포넌트 ────────────────────────────────────────────────────────────
// div를 사용하여 내부에 button(Toggle 등) 중첩 허용
const SettingRow = ({ leftIcon, label, onClick, rightSlot }) => (
  <div
    onClick={onClick}
    className="w-full flex items-center px-4 py-4 active:bg-gray-50 transition-colors cursor-pointer"
  >
    {leftIcon && (
      <span className="mr-3 text-gray-400 shrink-0 text-[20px] flex items-center">
        {leftIcon}
      </span>
    )}
    <span className="flex-1 text-[15px] text-gray-800">{label}</span>
    {rightSlot !== undefined ? rightSlot : (
      <svg
        className="w-4 h-4 text-gray-300 shrink-0"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2.5}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
      </svg>
    )}
  </div>
);

// ─── 섹션 헤더 컴포넌트 ──────────────────────────────────────────────────────────
const SectionHeader = ({ title }) => (
  <div className="mx-4 px-4 pt-6 pb-2">
    <span className="text-[12px] font-semibold text-gray-400 tracking-wider">{title}</span>
  </div>
);

// ─── 토글 스위치 컴포넌트 ────────────────────────────────────────────────────────
// stopPropagation으로 부모 div의 onClick과 중복 실행 방지
const Toggle = ({ enabled, onToggle, disabled }) => (
  <button
    onClick={(e) => {
      e.stopPropagation();
      onToggle();
    }}
    disabled={disabled}
    className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${
      enabled ? "bg-[#4068f7]" : "bg-gray-200"
    } disabled:opacity-50`}
  >
    <span
      className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
        enabled ? "translate-x-5" : "translate-x-0"
      }`}
    />
  </button>
);

const MobileMYPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isMobile = useDeviceStore((state) => state.isMobile);

  // Zustand: 개별 선택자 사용 (객체 선택자는 매 렌더마다 새 참조 생성 → 에러 유발)
  const isLogIn = useAuthStore((state) => state.isLogIn);
  const userInfo = useAuthStore((state) => state.userInfo);
  const refreshToken = useAuthStore((state) => state.refreshToken);
  const logout = useAuthStore((state) => state.logout);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // ─── 프로필 조회 (email_notification_enabled 포함) ────────────────────────────
  const { data: profileData } = useQuery({
    queryKey: ["myProfile"],
    queryFn: fetchMyProfile,
    enabled: isLogIn,
  });
  const emailNotificationEnabled = profileData?.data?.email_notification_enabled ?? true;

  // ─── 알림 수신 설정 변경 (Optimistic Update) ─────────────────────────────────
  // onMutate: API 응답 전에 캐시를 즉시 새 값으로 업데이트 → 토글이 즉각 반응
  // onError:  실패 시 onMutate에서 저장해 둔 이전 값으로 복구
  const notificationMutation = useMutation({
    mutationFn: (enabled) => patchNotificationSetting(enabled),
    onMutate: async (newEnabled) => {
      // 진행 중인 리패치가 있으면 취소 (낙관적 업데이트를 덮어쓰지 않도록)
      await queryClient.cancelQueries({ queryKey: ["myProfile"] });

      // 롤백용으로 현재 캐시 스냅샷 저장
      const previousProfile = queryClient.getQueryData(["myProfile"]);

      // 캐시를 즉시 새 값으로 업데이트
      queryClient.setQueryData(["myProfile"], (old) => {
        if (!old) return old;
        return {
          ...old,
          data: { ...old.data, email_notification_enabled: newEnabled },
        };
      });

      return { previousProfile };
    },
    onSuccess: () => {
      // 서버 실제 값으로 최종 동기화
      queryClient.invalidateQueries({ queryKey: ["myProfile"] });
    },
    onError: (error, _newEnabled, context) => {
      // 실패 시 이전 캐시 값으로 롤백
      if (context?.previousProfile !== undefined) {
        queryClient.setQueryData(["myProfile"], context.previousProfile);
      }
      console.error("알림 설정 변경 실패:", error);
    },
  });

  const handleToggleNotification = () => {
    if (!isLogIn) return;
    if (notificationMutation.isPending) return;
    notificationMutation.mutate(!emailNotificationEnabled);
  };

  // ─── 로그아웃 ─────────────────────────────────────────────────────────────────
  const logoutMutation = useMutation({
    mutationFn: () => postLogout(refreshToken),
    onSuccess: () => {
      logout();
      queryClient.clear();
      navigate("/");
    },
    onError: () => {
      // 에러가 발생해도 로컬 토큰을 지우고 홈으로 이동
      logout();
      queryClient.clear();
      navigate("/");
    },
  });

  const handleLogout = () => {
    if (logoutMutation.isPending) return;
    logoutMutation.mutate();
  };

  return (
    <>
      {/* ─── 모바일 고정 헤더 ──────────────────────────────────────────────────── */}
      {isMobile && <MobileHeader title="마이페이지" />}

      {/* ─── 본문 ──────────────────────────────────────────────────────────────── */}
      <div className={`flex flex-col ${isMobile ? "pb-32" : "pb-8"}`}>

        {/* ─── 프로필 카드 ── 전체 클릭 → 학과 수정 ────────────────────────── */}
        <div
          onClick={() => isLogIn && navigate("/mypage/edit")}
          className={`mx-4 mt-2 bg-white rounded-2xl border border-gray-100 px-5 py-5 flex items-center gap-4 transition-colors ${
            isLogIn ? "cursor-pointer active:bg-gray-50" : ""
          }`}
        >
          {/* 아바타 */}
          <div className="w-[60px] h-[60px] bg-blue-100 rounded-full flex items-center justify-center shrink-0 overflow-hidden">
            <svg className="w-9 h-9 text-blue-400 mt-1.5" fill="currentColor" viewBox="0 2.5 24 24">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
          </div>

          {/* 사용자 정보 */}
          <div className="flex-1 min-w-0">
            <p className="text-[18px] font-bold text-gray-900 truncate">
              {userInfo?.name || "익명의 뷰어"}
            </p>
            <p className="text-[13px] text-gray-400 mt-0.5 truncate">
              {userInfo?.email || ""}
            </p>
            {userInfo && (
              <p className="text-[12px] font-semibold text-emerald-500 mt-1.5">
                학교 인증 완료
              </p>
            )}
          </div>

          {/* chevron */}
          {isLogIn && (
            <svg
              className="w-4 h-4 text-gray-300 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          )}
        </div>

        {/* ─── 일반 설정 ────────────────────────────────────────────────────── */}
        <SectionHeader title="일반 설정" />
        <div className="mx-4 bg-white divide-y divide-gray-100">
          {/* 알림 설정 */}
          <SettingRow
            leftIcon={<IoNotificationsOutline />}
            label="알림 설정"
            onClick={handleToggleNotification}
            rightSlot={
              <Toggle
                enabled={emailNotificationEnabled}
                onToggle={handleToggleNotification}
                disabled={notificationMutation.isPending}
              />
            }
          />
          {/* 불편사항 접수 */}
          <SettingRow
            leftIcon={<IoChatbubbleEllipsesOutline />}
            label="불편사항 접수"
            onClick={() =>
              window.open("https://forms.gle/hTPpZsoi41kbyBC27", "_blank", "noopener noreferrer")
            }
          />
        </div>

        {/* ─── 서비스 정보 + 로그아웃/회원탈퇴 (한 묶음) ──────────────────── */}
        <SectionHeader title="서비스 정보" />
        <div className="mx-4 bg-white divide-y divide-gray-100">
          {/* 서비스 이용약관 */}
          <SettingRow
            leftIcon={<IoDocumentTextOutline />}
            label="서비스 이용약관"
            onClick={() => navigate("/terms-of-service")}
          />
          {/* 개인정보처리방침 */}
          <SettingRow
            leftIcon={<IoShieldCheckmarkOutline />}
            label="개인정보처리방침"
            onClick={() => navigate("/privacy-policy")}
          />
          {/* 로그아웃 */}
          {isLogIn && (
            <div
              onClick={handleLogout}
              className={`w-full flex items-center px-4 py-4 transition-colors cursor-pointer active:bg-gray-50 ${
                logoutMutation.isPending ? "opacity-50 pointer-events-none" : ""
              }`}
            >
              <span className="mr-3 text-red-500 shrink-0 text-[20px] flex items-center">
                <IoLogOutOutline />
              </span>
              <span className="text-[15px] font-medium text-red-500">
                {logoutMutation.isPending ? "로그아웃 중..." : "로그아웃"}
              </span>
            </div>
          )}
          {/* 회원탈퇴 */}
          {isLogIn && (
            <div
              onClick={() => setIsDeleteOpen(true)}
              className="w-full flex items-center px-4 py-4 transition-colors cursor-pointer active:bg-gray-50"
            >
              <span className="mr-3 text-red-500 shrink-0 text-[20px] flex items-center">
                <IoPersonRemoveOutline />
              </span>
              <span className="text-[15px] font-medium text-red-500">회원탈퇴</span>
            </div>
          )}
        </div>

        {/* 비로그인 상태 */}
        {!isLogIn && (
          <div className="mx-4 mt-6">
            <button
              onClick={() => navigate("/login")}
              className="w-full py-3.5 rounded-xl font-bold text-[15px] bg-[#4068f7] text-white active:scale-[0.98] transition-all"
            >
              로그인하기
            </button>
          </div>
        )}
      </div>

      {/* ─── 회원탈퇴: 모바일 → Sheet / 데스크톱 → Modal ──────────────────────── */}
      {isMobile ? (
        <AccountDeleteSheet
          isOpen={isDeleteOpen}
          onClose={() => setIsDeleteOpen(false)}
        />
      ) : (
        <AccountDeleteModal
          isOpen={isDeleteOpen}
          onClose={() => setIsDeleteOpen(false)}
        />
      )}

    </>
  );
};

export default MobileMYPage;
