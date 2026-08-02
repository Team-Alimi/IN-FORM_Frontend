# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## Claude 행동 지침

1. **CLAUDE.md 자동 업데이트**: 큰 기능이 구현되거나 프로젝트 구조/컨벤션이 변경되면 이 파일도 함께 수정한다.
2. **학습 설명 포함**: 코드 구현 시 사용자의 학습을 위해 구현한 코드에 대한 구체적인 설명을 함께 제공한다.
3. **단계별 구현**: 코드 구현 시 과정을 단계별로 나누고 한 단계가 끝나면 사용자에게 다음 단계 진행을 허가받은 후 다음 단계로 넘어간다.

---

## Development Commands

```bash
npm run dev       # Start development server with HMR (Vite)
npm run build     # Build for production
npm run preview   # Preview production build
npm run lint      # Run ESLint
npm run format    # Format code with Prettier
```

---

## Technology Stack

- **React 19.2.0** with **Vite 7.2.2**
- **React Router DOM 7.9.5** for routing
- **Tailwind CSS 4.1.17** for styling (utility classes only, no CSS modules)
- **React Icons 5.5.0** for icon components
- **Zustand 5.0.8** for global client state (`stores/`)
- **TanStack React Query 5.90.7** for server state and caching
- **Axios 1.13.2** for HTTP requests (`api/axios.js`)

---

## Feature Code System

This project uses **3-letter uppercase codes** for all features:

| Code | 의미 |
|------|------|
| **HOM** | 홈 (메인 캘린더) |
| **EVL** | 공지사항 목록 |
| **EVD** | 공지사항 상세 |
| **CBL** | 동아리 목록 |
| **CBD** | 동아리 상세 |
| **MYP** | 마이페이지 |
| **LGN** | 로그인 |
| **ONB** | 온보딩 |
| **PRI** | 개인정보처리방침 |
| **TOS** | 서비스 이용약관 |
| **NOT** | 에러/404 페이지 |
| **MAN*** | 관리자 기능 (MANHOM, MANLGN, MANDTE, MANDTR, MANSTG, MANGBG, MANURV) |

**Naming Patterns:**
- Page components: `[CODE]Page.jsx` (e.g., `HOMPage.jsx`, `EVLPage.jsx`)
- Page folders: `pages/main/[CODE]/` or `pages/manage/[CODE]/`
- Component folders: `components/main/adaptive/feature/[CODE]/`

---

## Directory Structure

```
src/
├── api/                    # API 함수
│   ├── axios.js            # Axios 인스턴스 (Bearer 토큰, 401 처리) - 공용
│   ├── main/               # 사용자 API (도메인별 파일)
│   │   ├── articles.js     # 학교/동아리 공지사항 (fetchEvents, fetchClubs 등)
│   │   ├── calendar.js     # 월별 캘린더 데이터 (fetchMonthlyAll)
│   │   ├── bookmarks.js    # 북마크 CRUD
│   │   ├── notifications.js# 알림 목록/읽음 처리
│   │   ├── user.js         # 사용자 정보 수정/탈퇴
│   │   ├── auth.js         # 구글 로그인 (postGoogleLogin)
│   │   └── vendors.js      # 학과/제공처 목록 (fetchVendors)
│   └── manage/             # 관리자 API (TypeScript)
│
├── components/
│   ├── common/             # 전역 공용 (ErrorBoundary, ProtectedRoute)
│   └── main/
│       ├── adaptive/       # 모바일/데스크톱 공통 컴포넌트
│       │   ├── common/     # BackHeader, Badge, NotificationModal, SearchBar
│       │   └── feature/    # 기능별 컴포넌트 (HOM, EVL, EVD, CBL, CBD, MYP)
│       ├── desktop/        # 데스크톱 전용 (TabBar, Footer, MiniCalendar 등)
│       └── mobile/         # 모바일 전용 (BottomSheet, MobileTabBar 등)
│   └── manage/             # 관리자 컴포넌트 (TypeScript)
│
├── pages/
│   ├── main/[CODE]/        # 사용자 페이지
│   └── manage/[CODE]/      # 관리자 페이지 (TypeScript)
│
├── stores/
│   ├── useAuthStore.js     # 로그인 상태, 토큰, 사용자 정보 (persist)
│   ├── useEVLFilterStore.js# EVL 필터 상태 (persist)
│   └── deviceStore.js      # 모바일 여부 (430px 기준)
│
├── hooks/
│   ├── useSearchHistory.js # 검색 히스토리 (localStorage, 최대 5개)
│   ├── useCalendarPrefetch.js
│   ├── useAlertModal.tsx
│   └── useUrlAddModal.tsx
│
├── utils/
│   ├── calendarUtil.js     # 캘린더 그리드 생성, 이벤트 바 렌더링
│   ├── dateUtil.js         # 날짜 파싱/포맷/비교 함수
│   ├── statusUtil.js       # API 상태값 → 한국어/색상 변환
│   └── AnalyticsTraker.js  # GA4 페이지뷰 추적
│
├── constants/
│   └── filterOption.js     # FILTER_OPTIONS (카테고리), STATE_OPTIONS (상태)
│
└── assets/
```

---

## Code Conventions

### TypeScript vs JSX 분리 원칙
- `pages/main/`, `components/main/` → **JSX (.jsx, .js)**
- `pages/manage/`, `components/manage/`, `api/manage/` → **TypeScript (.tsx, .ts)**
- `hooks/` → 현재 혼재 (JS/TS)

### 파일명 규칙
- 컴포넌트: **PascalCase** (예: `MobileHeader.jsx`, `BookmarkSection.jsx`)
- 유틸/훅/스토어: **camelCase** (예: `useAuthStore.js`, `dateUtil.js`)
- 상수: **UPPER_SNAKE_CASE** (예: `FILTER_OPTIONS`, `MAX_HISTORY`)
- Windows 예약어 파일명 사용 금지 (COM1~COM9, LPT1 등)

### 컴포넌트 선언
```jsx
// ✅ 화살표 함수만 사용
const EventRow = ({ status, title, date, onClick }) => {
  return <div>...</div>;
};
export default EventRow;

// ❌ function 키워드 사용 안 함
function EventRow() { ... }
```

### Import 순서
```jsx
// 1. React / React Hooks
import { useState, useMemo } from "react";
// 2. 외부 라이브러리
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
// 3. 내부 컴포넌트
import DaySelectEventList from "@/components/...";
// 4. API
import { fetchEvents } from "@/api/main/articles";
// 5. 유틸 / 상수 / 스토어
import { formatDateKey } from "@/utils/dateUtil";
import { FILTER_OPTIONS } from "@/constants/filterOption";
import { useAuthStore } from "@/stores/useAuthStore";
```

### Hook 사용 순서
```jsx
const Component = () => {
  // 1. useState
  const [isOpen, setIsOpen] = useState(false);
  // 2. 스토어
  const { userInfo } = useAuthStore();
  // 3. 커스텀 훅
  const { history, addHistory } = useSearchHistory();
  // 4. useQuery / useMutation
  const { data, isLoading } = useQuery({ ... });
  // 5. useMemo / useCallback
  const filtered = useMemo(() => ..., [data]);
  // 6. useEffect
  useEffect(() => { ... }, []);
};
```

### 상수 선언
```jsx
// ✅ 컴포넌트 외부 최상단에 선언
const STATUS_KEY_MAP = {
  진행중: "OnGoing",
  마감임박: "EndingSoon",
};

const MyComponent = () => { ... };
```

### 이벤트 핸들러 네이밍
```jsx
// ✅ 컴포넌트 내부에서 정의하는 함수: handle* 접두사
const handleDateClick = (date) => { ... };
const handleDelete = (id) => { ... };
const handleCloseBottomSheet = () => { ... };

// ✅ 부모 → 자식으로 넘기는 prop 이름: on* 접두사
<BookmarkItem onDelete={handleDelete} />

// ✅ 자식 컴포넌트에서 prop 받을 때: on*
const BookmarkItem = ({ onDelete }) => { ... };

// ❌ 내부 함수에 on* 사용 안 함
const onDateClick = () => { ... };
```

### 조건부 렌더링
```jsx
// 단순 표시/숨김: && 연산자
{isLoggedIn && <ProfileSection />}

// 두 가지 분기: 삼항 연산자
{isLoading ? <Spinner /> : <Content />}

// 로딩/에러 처리: Early Return
if (isLoading) return <div>로딩 중...</div>;
if (error) return <div>에러가 발생했습니다</div>;
return <div>...</div>;
```

### Tailwind className
```jsx
// 조건 없을 때: 인라인
<div className="flex items-center justify-between py-3">

// 조건 있을 때: 템플릿 리터럴
<div className={`
  font-bold text-gray-900
  ${isMobile ? "text-[17px]" : "text-[20px]"}
`}>

// 커스텀 색상: 대괄호 표기법
<div className="bg-[#F4F8FE] text-[#4068f7]">
```

### 주석 스타일
```jsx
// 한국어 한 줄 주석 (코드 의도 설명)
const [selectedDate, setSelectedDate] = useState(null); // 선택된 날짜

// 섹션 구분
/******** 핸들러 ********/

// API 함수는 JSDoc
/**
 * 학교 공지사항 목록 조회
 * @param {Object} params
 */
export const fetchEvents = async (params) => { ... };
```

### React Query 패턴
```jsx
// useQuery
const { data, isLoading, error } = useQuery({
  queryKey: ["monthlyAll", calendarMonth, selectedFilter], // 종속성 배열
  queryFn: () => fetchMonthlyAll({ calendarMonth }), // from "@/api/main/calendar"
  staleTime: 60 * 1000 * 10,   // 10분
  gcTime: 60 * 1000 * 20,      // 20분
  placeholderData: keepPreviousData,
  enabled: !!calendarMonth,    // 조건부 실행
});

// useMutation
const deleteMutation = useMutation({
  mutationFn: (id) => deleteSchoolBookmark(id),
  onSuccess: () => queryClient.invalidateQueries({ queryKey: ["schoolBookmarks"] }),
  onError: (error) => console.error(error),
});
```

### Zustand Store 패턴
```jsx
import { create } from "zustand";
import { persist } from "zustand/middleware";

const useXxxStore = create(
  persist(
    (set) => ({
      value: null,
      setValue: (v) => set({ value: v }),
    }),
    { name: "xxx-storage" } // localStorage 키
  )
);
```

---

## Component Patterns

### 반응형 컴포넌트 구조
- **`adaptive/`**: 모바일/데스크톱 모두 사용 (내부에서 `isMobile`로 조건부 렌더링)
- **`desktop/`**: 데스크톱 전용
- **`mobile/`**: 모바일 전용

### Modal + Sheet 쌍 패턴
데스크톱용 Modal과 모바일용 BottomSheet를 항상 쌍으로 구현:
```
DepartmentEditModal.jsx  ← 데스크톱 (중앙 고정 모달)
DepartmentEditSheet.jsx  ← 모바일 (BottomSheet 컴포넌트 활용)
```

### 모바일 브레이크포인트
- 기준: **430px** (`deviceStore.js`의 `MOBILE_BREAKPOINT`)
- Tailwind 커스텀: `max-mobile`
- 코드: `const isMobile = useDeviceStore((state) => state.isMobile);`

---

## Key Design Decisions

### 인앱 브라우저 처리 (`index.html`)
- 카카오톡: `kakaotalk://web/openExternal` 프로토콜로 자동 탈출
- 라인: `?openExternalBrowser=1` 파라미터
- 에브리타임/기타: 오버레이 안내 화면 표시
- 이유: Google OAuth가 WebView(인앱 브라우저)에서 차단됨

### Google OAuth
- 인앱 브라우저에서 Google 로그인 불가 → 외부 브라우저 유도 필수

---

## Route Structure

```
/                     → HOMPage (공개)
/login                → LGNPage (공개)
/onboarding           → ONBPage (공개)
/privacy-policy       → PRIPage (공개)
/terms-of-service     → TOSPage (공개)
/clubs                → CBLPage (보호)
/clubs/detail/:id     → CBDPage (보호)
/events               → EVLPage (보호)
/events/detail/:id    → EVDPage (보호)
/mypage               → MYPage  (보호)
/manage               → MANHOMPage (관리자)
/manage/login         → MANLGNPage
/manage/detail/:id    → MANDTRPage
/manage/edit          → MANDTEPage
/manage/staged        → MANSTGPage
/manage/garbage       → MANGBGPage
/manage/unreviewed    → MANURVPage
```

---

## Git Workflow

### 브랜치 전략

```
main        ← 프로덕션 배포
dev         ← 개발 통합 (기본 브랜치)
manageDev   ← 관리자 기능 개발
```

기능 브랜치는 `feat/기능명`, `fix/버그명` 형태로 분기 후 `dev`에 병합한다.

**이슈 처리 시 반드시 새 브랜치를 만들어서 구현할 것.**

### 커밋 컨벤션

```
type: 간단한 설명
```

| type | 설명 |
|------|------|
| `feat` | 새로운 기능 |
| `fix` | 버그 수정 |
| `docs` | 문서 변경 |
| `style` | 스타일 변경 (CSS, 포맷) |
| `refactor` | 기능 변화 없는 코드 개선 |
| `chore` | 설정·패키지·빌드 |
| `test` | 테스트 코드 |

### Import 경로

절대 경로 `@/` 사용:
```js
import EventRow from "@/components/main/adaptive/feature/EVL/EventRow";
import { fetchEvents } from "@/api/main/articles";
```
