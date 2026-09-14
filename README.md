# INFORM Frontend

인하대학교 캠퍼스 정보 큐레이션 플랫폼 **INFORM**의 프론트엔드 레포지토리입니다.
학교 공지사항·동아리·행사 일정을 한 곳에서 확인하고 관리할 수 있습니다.

---

## 기술 스택

| 분류 | 기술 | 버전 |
|------|------|------|
| UI 프레임워크 | React | 19.2.0 |
| 빌드 도구 | Vite | 7.2.2 |
| 라우팅 | React Router DOM | 7.9.5 |
| 스타일링 | Tailwind CSS | 4.1.17 |
| 클라이언트 상태 | Zustand | 5.0.8 |
| 서버 상태 | TanStack React Query | 5.90.7 |
| HTTP 클라이언트 | Axios | 1.13.2 |
| 인증 | @react-oauth/google | 0.13.4 |
| 리치 텍스트 에디터 | TipTap | 3.22.2 |
| 아이콘 | React Icons | 5.5.0 |
| 분석 | react-ga4 (GA4) | 2.1.0 |
| 타입 | TypeScript | 5.9.3 |
| 폰트 | LINE Seed Sans KR | 0.1.0 |

---

## 프로젝트 구조

```
src/
├── api/                        # API 통신 함수
│   ├── axios.js                # Axios 인스턴스 (인증 인터셉터 포함)
│   ├── *.js                    # 기능별 API 함수
│   └── manage/                 # 관리자 API (TypeScript)
├── assets/                     # 정적 리소스 (아이콘, 이미지, SVG)
├── components/
│   ├── common/                 # 공통 컴포넌트
│   │   ├── ErrorBoundary.jsx
│   │   └── ProtectedRoute.jsx
│   ├── main/
│   │   ├── adaptive/           # 모바일·데스크톱 공용 컴포넌트
│   │   │   ├── common/         # SearchBar, Badge, BackHeader, NotificationModal
│   │   │   └── feature/        # 기능별 컴포넌트 (HOM, EVL, EVD, CBL, CBD, MYP)
│   │   ├── desktop/            # 데스크톱 전용 컴포넌트
│   │   │   └── common/         # TabBar, MiniCalendar, Imminent, ServiceLink 등
│   │   └── mobile/             # 모바일 전용 컴포넌트
│   │       ├── common/         # mobileHeader, mobileTabBar, BottomSheet 등
│   │       └── feature/        # HotEventList, mobileEventRow 등
│   └── manage/                 # 관리자 전용 컴포넌트 (TypeScript)
│       ├── common/             # ActionBtn, TableList, Menu, AlertModal 등
│       └── feature/            # MANDTE(에디터), MANHOM(대시보드) 등
├── constants/                  # 필터 옵션, 카테고리·상태 색상 정의
├── hooks/                      # 커스텀 훅
│   ├── useAlertModal.tsx
│   ├── useSearchHistory.js
│   ├── useCalendarPrefetch.js
│   └── useClubPrefetch.js
├── mocks/                      # 개발용 목 데이터
├── pages/
│   ├── main/                   # 사용자 페이지 (JSX, 10개)
│   ├── manage/                 # 관리자 페이지 (TSX, 7개)
│   └── NOT/                    # 에러·404 페이지
├── stores/                     # Zustand 스토어
│   ├── useAuthStore.js         # 인증 상태 (토큰, 유저 정보, persist)
│   ├── deviceStore.js          # 디바이스 유형 감지 (isMobile)
│   └── useEVLFilterStore.js    # 이벤트 목록 필터 상태
├── utils/                      # 유틸리티 함수
│   ├── CalendarUtil.js         # 캘린더 그리드·이벤트 바 계산
│   ├── dateUtil.js             # 날짜 파싱·포맷·비교
│   ├── statusUtil.js           # 공지 상태 매핑
│   └── AnalyticsTraker.js      # GA4 페이지뷰 추적
├── App.jsx                     # 루트 컴포넌트 (라우터 설정, GA4 초기화)
├── main.jsx                    # 앱 진입점 (Provider 설정)
└── global.css                  # 전역 스타일 (CSS 변수, 애니메이션, TipTap)
```

---

## 페이지 구조

### 사용자 페이지

| 경로 | 코드 | 설명 | 인증 필요 |
|------|------|------|----------|
| `/` | HOM | 메인 캘린더 (월별 공지 일정, HOT 게시글) | |
| `/login` | LGN | Google OAuth 로그인 | |
| `/onboarding` | ONB | 신규 사용자 온보딩 가이드 | |
| `/events` | EVL | 학교 공지사항·이벤트 목록 (검색·필터·페이지네이션) | ✅ |
| `/events/detail/:id` | EVD | 이벤트 상세 (북마크, 첨부파일, 캘린더 추가) | ✅ |
| `/clubs` | CBL | 동아리 목록 | ✅ |
| `/clubs/detail/:id` | CBD | 동아리 상세 | ✅ |
| `/mypage` | MYP | 내 프로필·북마크·학과 수정·계정 삭제 | ✅ |
| `/privacy-policy` | PRI | 개인정보처리방침 | |
| `/terms-of-service` | TOS | 이용약관 | |
| `/error`, `/*` | NOT | 에러·404 페이지 | |

### 관리자 페이지 (`/manage/*`, TypeScript)

| 경로 | 설명 |
|------|------|
| `/manage` | 대시보드 (상태별 게시글 현황) |
| `/manage/login` | 관리자 로그인 |
| `/manage/detail/:id` | 게시글 상세 조회 |
| `/manage/edit`, `/manage/edit/:id` | 게시글 작성·수정 (TipTap 에디터) |
| `/manage/staged` | 반영 대기 게시글 |
| `/manage/garbage` | 휴지통 (복구·영구 삭제) |
| `/manage/unreviewed` | 미검수 게시글 |

---

## 주요 기능

### 반응형 디자인

- **모바일** (≤ 430px): 하단 탭바, 바텀 시트 모달, 스와이프 제스처 지원
- **데스크톱** (> 430px): 사이드바(미니 캘린더, 서비스 링크), 상단 탭바

### 캘린더

- 6×7 그리드 월별 캘린더
- 공지사항 기간을 이벤트 바(bar)로 시각화 (겹침 처리 포함)
- 날짜 선택 시 해당 날의 공지 목록 표시
- 카테고리·북마크 필터링 지원

### 공지사항·이벤트 목록 (EVL)

- 키워드 검색 (검색 기록 localStorage 저장)
- 다중 필터: 날짜 범위, 상태(진행중/예정/마감임박/종료), 카테고리, 출처
- 페이지네이션 (5/10/20개씩 보기)
- 상태 우선순위 정렬: 마감임박 > 진행중 > 예정 > 종료

### 인증

- Google OAuth 2.0 소셜 로그인
- 인하대 이메일(`@inha.edu`, `@inha.ac.kr`) 도메인 검증
- 로그인 상태·토큰 localStorage 영속화 (Zustand persist)
- Axios 인터셉터로 Bearer 토큰 자동 첨부
- 401/403 응답 시 자동 로그아웃·로그인 페이지 리다이렉트

### 북마크 및 알림

- 이벤트 북마크 추가/삭제
- 마이페이지에서 북마크 목록 일괄 관리
- 읽지 않은 알림 배지·전체 읽음 처리

### 관리자 기능

- TipTap 리치 텍스트 에디터로 게시글 작성·수정 (이미지 첨부 포함)
- 게시글 상태 관리: 미검수 → 반영 대기 → 반영/삭제 → 휴지통 → 영구 삭제·복구
- 중복 게시글 ID 검사
- 상태별 목록 조회 및 일괄 처리 (체크박스 선택)

### 기타

- **인앱 브라우저 감지**: 카카오톡·에브리타임·인스타그램 등에서 접속 시 외부 브라우저 유도
- **Google Analytics 4** 페이지 방문 추적
- **에러 바운더리** 및 전역 에러 페이지

---

## 시작하기

### 사전 요구사항

- Node.js 18.x 이상

### 환경 변수 설정

```bash
# .env 파일을 프로젝트 루트에 생성
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

### 설치 및 실행

```bash
# 저장소 클론
git clone https://github.com/Team-Alimi/IN-FORM_Frontend.git
cd inform_frontend

# 의존성 설치
npm install

# 개발 서버 실행 (http://localhost:5173)
npm run dev
```

### 빌드

```bash
npm run build     # 프로덕션 빌드 (dist/ 폴더 생성)
npm run preview   # 빌드 결과 로컬 미리보기
```

### 코드 품질

```bash
npm run lint      # ESLint 검사
npm run format    # Prettier 포매팅
```

---

## 개발 가이드

### 네이밍 컨벤션

| 대상 | 규칙 | 예시 |
|------|------|------|
| 컴포넌트 파일 | PascalCase | `EventRow.jsx` |
| 유틸리티 함수 | camelCase | `formatDateKey()` |
| 상수 | UPPER_SNAKE_CASE | `FILTER_OPTIONS` |
| 페이지 폴더 | 3글자 대문자 코드 | `HOM/`, `EVL/`, `EVD/` |
| import 경로 | `@/` 절대 경로 | `@/components/main/...` |

### Git 커밋 컨벤션

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

### 브랜치 전략

```
main        ← 프로덕션 배포
dev         ← 개발 통합 (기본 브랜치)
manageDev   ← 관리자 기능 개발
```

기능 브랜치는 `feat/기능명`, `fix/버그명` 형태로 분기 후 `dev`에 병합합니다.

---

## Contact

team.alimi.inform@gmail.com
