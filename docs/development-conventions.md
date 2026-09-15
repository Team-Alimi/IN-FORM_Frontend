# 개발 규약

이 문서는 구현 시 참고할 상세 규약을 담는다. Codex가 모든 작업에서 적용할 핵심 규칙은 [`AGENTS.md`](../AGENTS.md)에 있다.

## 디렉터리 상세

```text
src/
  api/
    axios.js                공용 Axios 클라이언트
    main/                   사용자 도메인 API 모듈
    manage/                 관리자 API 모듈 (TypeScript)
  components/
    common/                 공통 가드와 오류 처리
    main/
      adaptive/             데스크톱·모바일 공용 컴포넌트
      desktop/              데스크톱 전용 UI
      mobile/               BottomSheet를 포함한 모바일 전용 UI
    manage/                 관리자 UI (TypeScript)
  pages/
    main/[CODE]/            사용자 페이지 (JSX)
    manage/[CODE]/          관리자 페이지 (TSX)
  stores/                   Zustand 클라이언트 상태
  hooks/                    재사용 Hook
  utils/                    캘린더·날짜·상태·분석 유틸리티
  constants/                고정 옵션 집합
  assets/                   정적 에셋
```

사용자 API 모듈은 도메인별로 `articles.js`, `calendar.js`, `bookmarks.js`, `notifications.js`, `user.js`, `auth.js`, `vendors.js`, `comments.js`로 나뉜다. 요청·응답 동작을 변경하기 전에는 `docs/api-09-06ver/`의 API 명세를 확인한다.

## 컴포넌트 구성

두 레이아웃에서 함께 쓰는 기능 컴포넌트는 `components/main/adaptive/feature/[CODE]/`에 둔다. 상위 컴포넌트가 `isMobile`에 따라 모바일 또는 데스크톱 표현을 선택한다. `BackHeader`, `Badge`, `NotificationModal`, `SearchBar`처럼 공용 시각 요소는 `adaptive/common/`에 둔다. 데스크톱 전용 탐색·footer·캘린더 위젯은 `desktop/`, 모바일 전용 탐색·header·sheet는 `mobile/`에 둔다.

데스크톱과 모바일의 UI 표현이 나뉘는 동작은 `DepartmentEditModal.jsx`, `DepartmentEditSheet.jsx`처럼 짝이 되는 이름을 사용한다. Sheet는 공용 `BottomSheet`를 조합해서 만들며, 상호작용을 중복 구현하지 않는다.

## 스타일과 소스 규약

모바일 고정 탭바는 `--mobile-tab-bar-height`(기본 80px + 하단 safe area)로 높이를 통일한다. `MobileTabBar`가 같은 높이의 `shrink-0` 공간을 문서 흐름에 확보하므로 HOM/EVL/CBL/BKM/MYP는 콘텐츠용 간격만 둔다. BKM 편집 액션처럼 탭바 바로 위의 고정 요소도 같은 변수를 `bottom`으로 사용하고, 해당 액션 자체의 높이만 별도로 본문에 확보한다.

- Tailwind utility class만 사용하고 CSS module은 추가하지 않는다. 정적 class는 일반 문자열로, 조건부 class가 있을 때만 template literal을 사용한다. 임의 Tailwind 값에는 `bg-[#F4F8FE]`처럼 대괄호 문법을 사용한다.
- 컴포넌트 범위 상수는 컴포넌트 위에 둔다. 자명하지 않은 의도에는 간결한 주석을 쓰고, 탐색성이 좋아질 때만 section 주석을 쓴다. 의미 있는 매개변수나 반환 동작이 있는 export API 함수에는 JSDoc을 작성한다.
- 로딩·오류 상태에는 early return을 우선한다. 단순 존재 조건은 `&&`, 두 갈래 렌더링은 ternary를 사용한다.
- import 순서는 React/Hook, 외부 패키지, 내부 컴포넌트, API 모듈, 유틸리티·상수·store 순서다. 사용하지 않는 import는 남기지 않는다.
- 컴포넌트 내부 Hook은 일반적으로 state, Zustand store, custom Hook, React Query, memoized 값/callback, effect 순서로 둔다. 조건부로 Hook 순서를 바꾸지 않는다.

## React Query 상세

query key에는 응답에 영향을 주는 모든 입력을 넣는다. 예를 들어 월과 필터를 기준으로 하는 쿼리는 `['monthlyAll', calendarMonth, selectedFilter]`가 될 수 있다. 준비되지 않은 입력은 `enabled`로 제어한다. 이전 목록·캘린더 데이터를 유지해 전환이 매끄러워지는 경우에는 `placeholderData: keepPreviousData`를 사용한다.

캐시 시간은 도메인별로 정한다. 기존 월간 캘린더 패턴은 `staleTime` 10분, `gcTime` 20분을 사용하지만, 다른 데이터에 그대로 복사하지 않는다. mutation은 `onSuccess`에서 최소 범위의 영향받은 query key를 invalidate하고, UI 피드백이 필요하면 오류를 명시적으로 처리한다.

## Zustand 상세

기존 persist store에는 인증 상태와 행사 목록 필터가 있다. `deviceStore.js`는 모바일 breakpoint 판정을 소유한다. API로 가져온 데이터를 persist하지 말고, 실제 클라이언트 설정·세션 상태만 저장한다. 기존 persistence key 변경은 데이터 마이그레이션을 고려한 경우에만 한다.

## 검증 가이드

### 배포 및 상세 진입

- `vercel.json`은 Vercel의 하위 경로 요청을 `/index.html`로 rewrite한다. API는 기존 별도 API 도메인을 사용한다. 배포 후 `/login`, `/events`, `/events/detail/:id` 등의 직접 접속 및 새로고침을 확인한다. 존재하지 않는 경로는 React Router의 오류 페이지가 처리한다.
- EVD/CBD는 `useDetailScrollReset(id)`로 상세 진입 및 ID 변경 시 문서 스크롤을 즉시 초기화한다. 모바일 상세 본문은 별도 스크롤 컨테이너를 만들지 않는다.
- 로그아웃 상태에서 HOM 카테고리 칩, 필터 열기, 관심학과 체크박스, 캘린더 공지 및 인기 공지를 눌러 로그인 화면으로 이동하는지 확인한다. 공지 클릭 시 로그인 후 돌아갈 상세 경로를 `state.from.pathname`에 보관한다.

테스트 파일은 `src/`와 분리하여 루트 `tests/` 아래에 둔다. 예를 들어 `src/utils/saveInterestChanges.js`의 테스트는 `tests/utils/saveInterestChanges.test.js`에 저장한다. Node 내장 테스트 러너는 Vite의 `@/` 별칭을 해석하지 않으므로 테스트에서 소스를 가져올 때는 상대 경로를 사용한다. 해당 테스트는 `node --test tests/utils/saveInterestChanges.test.js`로 실행한다.

소스 변경 후 `npm run lint`를 실행한다. 컴파일·라우팅·번들·배포에 영향을 줄 수 있는 변경에는 `npm run build`도 실행한다. 반응형 UI 변경은 데스크톱과 430px 모바일 레이아웃을 모두 확인하고, 로그인 처리 변경은 인앱 브라우저 외부 전환 경로도 확인한다. `npm run format`은 파일을 변경하므로 의도적으로 실행하고, 결과 변경도 함께 검토한다.
