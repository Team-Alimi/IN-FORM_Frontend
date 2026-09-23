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

## 관리자 페이지 개편 (#86)

- 관리자도 공용 `/login`에서 Google OAuth로 로그인한다. 관리자 로그아웃은 인증 상태와 QueryClient 캐시를 비우고, 현재 관리자 경로를 `state.from.pathname`에 담아 `/login`으로 이동한다. 재로그인 후 기존 화면으로 복귀한다.
- 통합 브랜치는 `manageDev`, 페이지 브랜치는 `feat/<Feature Code>-<하위 이슈 번호>`다. 페이지 PR의 base는 `manageDev`이며, 최종 통합은 `dev`로 한다.
- MANHOM은 `src/api/manage/dashboard.ts`의 새 API 계약을 사용한다. 다른 관리자 페이지의 구 API 전환은 각 페이지 이슈에서 진행한다.
- 홈의 확인 필요 카드는 `/admin/articles?needs_check=true&size=1`의 `page_info.total_items`를 사용한다. 통계의 `duplicate_suspected`와 의미가 달라 대체하지 않는다.
- 검색의 출처는 관리자 제공처 목록에서 ID로 선택한다. 제공처 이름 문자열을 공지 목록 API에 전송하지 않는다. 비활성 옵션도 기존 공지 검색을 위해 포함한다.
- 전체 선택은 현재 페이지에만 적용하고 검색·페이지 이동 때 초기화한다. 배포는 선택한 모든 공지가 `READY_TO_PUBLISH` 또는 `DRAFT`일 때만 허용한다. 삭제는 휴지통 이동이며 HTTP 200의 `failed` 배열도 표시한다.
- 상단 새 탐색 UI는 개편된 페이지부터 적용한다. 미검수·반영 대기·휴지통·추가·상세 링크는 기존 라우트를 유지한다.
- MANURV는 두 목록 모두 `PENDING_REVIEW`로 제한하고 위쪽 확인 필요 목록에만 `needs_check=true`를 적용한다. 아래 검색 조건은 위쪽 목록에 영향을 주지 않는다. 목록별 선택·페이지를 분리하며, 반영대기는 `POST /articles/bulk/status`의 `READY_TO_PUBLISH`, 삭제는 `/bulk/trash`를 사용한다. 확인창에서 확정 후 처리하고, 처리 후 두 목록·홈 통계·기존 관리자 목록 캐시를 갱신한다. 상세 검토는 기존 상세 라우트로 연결한다.
- MANURV 브라우저 검증은 `python tests/pages/manage/MANURV/unreviewed_browser.py`로 실행한다. 독립 선택·검색·페이지 이동, 확인/취소, 부분 실패, 마지막 페이지 처리, 권한 오류, 430px 화면을 모의 API로 확인한다.
- MANSTG는 `READY_TO_PUBLISH`만 조회한다. `DRAFT`는 동아리 임시저장이므로 반영 대기 목록에 포함하지 않는다. 운영 반영은 `/articles/bulk/publish`, 삭제는 `/articles/bulk/trash`에 선택한 `ids`를 JSON으로 전달한다. 처리 후 관리자 목록·통계와 영향을 받는 사용자 공지 캐시를 갱신한다.
- MANURV/MANSTG의 검색폼(`ArticleSearchForm`), 표(`ReviewArticleTable`), 확인창(`ArticleActionModal`)은 `components/manage/common/`에서 공유한다. 표의 상태 배지는 실제 응답 상태를 표시하고, 주 동작 문구와 콜백은 페이지에서 지정한다.
- MANSTG 브라우저 검증은 `python tests/pages/manage/MANSTG/staged_browser.py`로 실행한다. 공통 UI를 변경한 경우 MANURV 브라우저 검증도 함께 실행한다.
- MANDTE는 `/manage/edit`에서 작성하고 `/manage/edit/:id`에서 실제 상세를 읽어 수정한다. ID는 선택 입력(1~100000000)이며 ID 확인은 상세 조회의 `404 ARTICLE_NOT_FOUND`만 미사용으로 판정한다. `duplicate-check`는 제목 검색으로 별도 제공하며 두 확인 결과 모두 저장 시점의 중복 검증을 대신하지 않는다.
- MANDTE는 학교의 미검수·반영대기·운영, 동아리의 임시저장·운영 상태를 지원한다. PATCH에는 변경할 수 없는 ID·출처 유형·상태를 보내지 않는다. 기존 출처·첨부의 연결 행 ID를 보존하고, 수집 출처는 제거할 수 없다. 수정 시 기존 날짜를 비우는 동작은 명세상 지원하지 않아 안내한다.
- Tiptap 본문을 저장 직전에 읽고, 이미지 업로드 응답 메타데이터를 `attachments`로 전송한다. 새 이미지의 명시적 제거와 작성 취소는 `DELETE /admin/files`의 JSON `file_urls`로 정리 요청한다. 기존 연결 파일에는 이 API를 호출하지 않는다. 첨부 제거 시 편집기 실행 취소 이력을 초기화해 제거된 URL이 복원되지 않게 한다. 본문에서만 지운 이미지는 첨부로 남는다.
- 작성 중 상단 메뉴·로그아웃·취소는 확인 후 새 파일 정리를 기다린다. 새로고침·탭 닫기는 브라우저 이탈 경고를 사용하며, 브라우저 강제 종료나 뒤로 이동 등 명시적 취소를 거치지 않은 업로드 정리는 서버 배치 영역이다. 저장 성공 후 관리자 목록으로 이동하며, 후속 캐시 재조회 오류로 등록을 다시 보내지 않는다.
- MANDTE 검증: `python tests/pages/manage/MANDTE/editor_browser.py`. 작성·수정 JSON, 실제 HTML, ID·제목 중복 확인, 날짜·출처·상태 조합, 업로드·제거·취소, 실패 입력 보존, 권한 오류와 데스크톱/430px 화면을 모의 API로 검증한다.
- MANDTR는 `GET /admin/articles/{id}`와 `['adminArticleDetail', id]`를 사용한다. 복수 카테고리·제공처, 선택 기간, 실제 상태, 한국 시간 기준 최종 수정 시각, 본문·첨부를 표시한다. 출처 키는 제공처 ID가 아닌 연결 행 ID이며 수집 출처는 툴팁과 접근성 이름으로 구분한다. 수정은 `/manage/edit/:id`, 삭제·발행은 기존 목록 흐름에서 처리한다.
- MANDTR 본문은 DOMPurify 허용 목록과 서식 속성 제한으로 정제한다. 제목·목록·표·이미지·링크·체크리스트 및 글자 서식을 유지하되 스크립트·이벤트·폼·프레임·앱 CSS 클래스·위치 스타일은 제거한다. 원본 기준 경로를 알 수 없는 상대 URL과 실행 가능한 URL은 링크로 열지 않는다. 본문의 이메일·전화 링크는 허용한다. 큰 표·코드는 내부 스크롤로 처리한다.
- MANDTR는 잘못된 ID에 요청하지 않으며 404·403·일반 오류를 구분한다. 직접 접속 뒤로 가기는 관리자 홈으로 복귀하며 SPA 내부에서 진입했다면 이전 화면으로 돌아간다. 검증은 `python tests/pages/manage/MANDTR/detail_browser.py`로 실행한다. 상세 API·수정 이동·첨부·HTML 정제·상태·선택 필드·오류·1280px/430px 화면을 모의 API로 확인한다.
- MANDTR의 실제 수집 본문은 HTML 대신 줄바꿈이 포함된 일반 텍스트로 내려오기도 한다. 정제 후 요소가 없는 텍스트는 `white-space: pre-wrap`으로 줄바꿈·빈 줄을 보존하고, 서식 HTML에는 이 스타일을 적용하지 않는다. 응답에서 사라진 강조나 문단 구분은 화면에서 추측해 만들지 않는다.
- 브라우저 검증: Vite 실행 후 Python Playwright 환경에서 `python tests/pages/manage/MANHOM/dashboard_browser.py`. API 응답을 브라우저에서 대체하므로 운영 데이터를 변경하지 않는다. 1280px/430px 캡처는 같은 폴더의 `screenshots/`에 생성한다.
