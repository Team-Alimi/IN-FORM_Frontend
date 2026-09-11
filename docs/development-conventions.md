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

소스 변경 후 `npm run lint`를 실행한다. 컴파일·라우팅·번들·배포에 영향을 줄 수 있는 변경에는 `npm run build`도 실행한다. 반응형 UI 변경은 데스크톱과 430px 모바일 레이아웃을 모두 확인하고, 로그인 처리 변경은 인앱 브라우저 외부 전환 경로도 확인한다. `npm run format`은 파일을 변경하므로 의도적으로 실행하고, 결과 변경도 함께 검토한다.
