# INFORM Frontend — Codex 작업 지침

## 작업 원칙

- 프로젝트 전반에 오래 적용될 규칙, 라우트, 구조가 바뀌면 이 문서도 함께 갱신한다. 구현 세부 사항·근거·예시는 [docs/development-conventions.md](docs/development-conventions.md)에 둔다.
- 기존 코드를 수정하기 전에 관련 코드를 확인하고, 작업 범위 밖의 사용자 변경은 보존한다. PR 생성 시 `.github/PULL_REQUEST_TEMPLATE.md`를 사용한다.
- 이슈 생성 시 `.github/ISSUE_TEMPLATE/`의 해당 유형 템플릿과 기본 라벨을 적용한다. 관리자 페이지 하위 이슈도 같은 규칙을 따른다.
- 완료 전에 관련 검증을 실행하고, 변경 파일·영향 범위·검증 결과를 보고한다. 단계마다 승인을 요구하지 말고, 중요한 설계 선택이나 추가 권한이 필요한 경우에만 질문한다.

## 명령어

```bash
npm run dev       # Vite 개발 서버
npm run build     # 프로덕션 빌드
npm run preview   # 프로덕션 빌드 미리보기
npm run lint      # ESLint
npm run format    # Prettier 적용 (파일을 변경함)
```

## 프로젝트 구조와 경계

- `src/api/axios.js`는 공용 Axios 클라이언트(Bearer 토큰 및 401 처리)다. 사용자 API는 `src/api/main/`, 관리자 API는 `src/api/manage/`에 둔다.
- 공통 가드는 `src/components/common/`에 둔다. 사용자 UI는 `src/components/main/`, 관리자 UI는 `src/components/manage/`에 둔다.
- 사용자 페이지는 `src/pages/main/[CODE]/`, 관리자 페이지는 `src/pages/manage/[CODE]/`에 둔다. 오류 UI는 `src/pages/NOT/`에 둔다.
- 전역 클라이언트 상태는 `src/stores/`, 재사용 동작은 `src/hooks/`, 유틸리티는 `src/utils/`, 고정 옵션은 `src/constants/`에 둔다.
- `src/`를 기준으로 하는 import에는 `@/` 별칭을 사용한다.
- 테스트 파일은 루트 `tests/` 아래에 소스의 하위 구조를 따라 배치한다. Node 직접 실행 테스트의 소스 import는 상대 경로를 사용한다.

## Feature Code System

페이지명, 기능 폴더, 관련 작업에는 세 글자 대문자 Feature Code를 일관되게 사용한다.

| Code | 영역 |
| --- | --- |
| HOM | 홈 / 메인 캘린더 |
| EVL / EVD | 행사 목록 / 행사 상세 |
| CBL / CBD | 동아리 목록 / 동아리 상세 |
| BKM | 북마크 |
| MYP | 마이페이지 |
| LGN / ONB | 로그인 / 온보딩 |
| PRI / TOS | 개인정보 처리방침 / 서비스 이용약관 |
| NOT | 오류 / 404 |
| MAN* | 관리자 기능 (`MANHOM`, `MANDTE`, `MANDTR`, `MANSTG`, `MANGBG`, `MANURV`, `MANUSR`, `MANVND`) |

페이지는 `[CODE]Page.jsx` 또는 `[CODE]Page.tsx`로 이름 짓는다. 데스크톱과 모바일이 함께 사용하는 사용자 기능 컴포넌트는 `components/main/adaptive/feature/[CODE]/`에 둔다.

## 코드와 상태 관리 규칙

- 사용자용 main 페이지·컴포넌트는 JavaScript/JSX(`.js`, `.jsx`)를, 관리자 페이지·컴포넌트·API는 TypeScript/TSX(`.ts`, `.tsx`)를 사용한다. Hook은 호출부와 주변 API에 맞춰 JS 또는 TS를 사용한다.
- 컴포넌트는 PascalCase, Hook·유틸리티·store는 camelCase, 상수는 UPPER_SNAKE_CASE를 사용한다. `COM1`–`COM9`, `LPT1` 같은 Windows 예약 파일명은 만들지 않는다.
- 컴포넌트는 화살표 함수로 선언한다. 로컬 이벤트 핸들러는 `handle*`, 콜백 prop은 `on*`으로 시작한다.
- 서버/API 상태는 TanStack React Query로 관리한다. 의미 있는 배열형 query key를 쓰고, 조건부 쿼리는 `enabled`로 제어하며, mutation 성공 뒤 영향받는 query key를 invalidate한다.
- Zustand는 공유 클라이언트/UI 상태에만 사용한다. 새로고침 뒤에도 남아야 하는 상태만 `persist`로 저장하고, 각 store에는 안정적인 storage key를 부여한다.

## 반응형 UI

- HOM은 월간 보기와 오늘 일정으로 시작하며, 다른 날짜 선택 시 월요일 시작 주간 보기로 전환한다. 오늘은 회색, 선택한 다른 날짜는 primary 원으로 표시한다. 목록 상단 손잡이를 아래로 60px 이상 드래그하거나 클릭·키보드로 실행하면 오늘의 월간 보기로 복귀한다. 목록 본문 스크롤과 드래그는 분리한다.
- HOM의 PC·모바일 캘린더는 날짜 아래 카테고리 점 표시를 공유한다. 진행 중인 행사들의 첫 번째 카테고리를 중복 제거해 최대 3개 표시한다. 월간·주간 전환은 높이를 부드럽게 변경하며, 동작 줄이기 설정을 존중한다.
- HOM에서 `source_type: CLUB`인 글은 일반 카테고리 대신 ‘동아리’ 공통 배지와 전용 색상의 점을 표시한다. 동아리 세부 유형별 색상은 구분하지 않는다.

- CBL 썸네일은 공지 목록의 `thumbnail_url`을 사용한다. CBL·CBD 해시태그는 `vendors[].club_types`의 이름을 사용하고 유형 ID로 중복을 제거한다. 이미지·유형 조회를 위해 게시물 상세 API를 추가 호출하지 않는다.

- 공용 `BottomSheet`는 상단 손잡이를 아래로 80px 이상 드래그하면 기본적으로 닫힌다. 본문 스크롤은 닫기 동작과 분리한다.
- `MobileTabBar`는 고정 탭바와 동일 높이의 문서 내 공간을 함께 렌더링한다. 탭바 높이는 `global.css`의 `--mobile-tab-bar-height`를 공유하며, 페이지마다 탭바용 하단 패딩을 중복 추가하지 않는다.
- 모바일 탭바는 하단 중앙의 캡슐형 5개 탭 UI를 사용한다. PC 상단 `TabBar`와 독립적으로 스타일을 관리한다.

- `adaptive/`는 두 레이아웃이 함께 쓰는 컴포넌트이며 `isMobile`로 레이아웃을 선택한다. `desktop/`, `mobile/`은 각 전용 UI를 둔다.
- 모바일 기준은 화면 너비 **430px 이하**다. `MOBILE_BREAKPOINT`, `useDeviceStore(...isMobile)`, Tailwind `max-mobile` variant를 재사용하고, 별도의 기준값을 만들지 않는다.
- 데스크톱 dialog에 모바일 대응 UI가 있으면 두 가지를 모두 유지한다. 데스크톱은 중앙 고정형 `[Name]Modal.jsx`, 모바일은 공용 `BottomSheet`를 사용하는 `[Name]Sheet.jsx`다.

## 인증과 라우트

- Vercel 배포는 `vercel.json`의 SPA rewrite를 유지한다. 하위 경로 직접 접속·새로고침도 `index.html`을 거쳐 React Router가 처리한다.
- 비로그인 HOM은 기본 캘린더 열람만 허용하고, 필터 조작 및 공지 상세 열기는 `/login`으로 안내한다.
- 공통 알림함은 `page_info.has_next`에 따라 다음 페이지를 조회하며 조회 실패와 빈 목록을 구분한다. 읽음 성공 후 목록·안 읽은 개수를 갱신하고, 연결 글은 상세 응답의 `source_type`에 따라 EVD 또는 CBD로 이동한다. 처리 중 닫은 알림창의 응답으로 뒤늦게 이동하지 않는다.

- Google OAuth는 인앱 WebView에서 완료할 수 없다. `index.html`의 외부 브라우저 처리(KakaoTalk: `kakaotalk://web/openExternal`, LINE: `openExternalBrowser=1`, 그 외 인앱 브라우저: 안내 오버레이)를 보존한다. 로그인 처리 변경 시 이 경로를 함께 확인한다.
- 공개 라우트: `/`, `/login`, `/onboarding`, `/privacy-policy`, `/terms-of-service`.
- 보호된 사용자 라우트: `/clubs`, `/clubs/detail/:id`, `/events`, `/events/detail/:id`, `/bookmarks`, `/mypage`.
- 관리자 라우트: `/manage`, `/manage/detail/:id`, `/manage/edit`, `/manage/edit/:id`, `/manage/staged`, `/manage/garbage`, `/manage/unreviewed`, `/manage/users`, `/manage/vendors`.
- 관리자 로그인도 공용 `/login`을 사용하고, 로그인 후 돌아갈 관리자 경로는 `state.from.pathname`으로 전달한다.
- `/manage` 부모 라우트에 `ProtectedRoute`와 `Outlet`을 적용해 모든 관리자 페이지의 비로그인 접근을 API 요청 전에 처리한다.
- MANDTE 작성·수정은 `src/api/manage/articleEditor.ts`를 사용한다. 본문 이미지는 관리자 파일 업로드 후 첨부에 연결하며, 취소 시 새로 업로드한 미연결 파일만 정리 요청한다.
- 동아리 세부 유형은 MANVND에서 동아리 자체에 지정한다. MANDTE 글 작성·수정에서는 출처 동아리만 선택하며 세부 유형 선택이나 유형별 출처 필터를 추가하지 않는다.
- MANDTR 상세는 `src/api/manage/articleDetail.ts`로 조회한다. 읽기 전용 HTML 본문은 `src/utils/manage/articleContent.ts`로 정제하고, 출처·첨부 링크는 HTTP(S) 주소만 연다.
- MANGBG는 `src/api/manage/trash.ts`의 휴지통 전용 API를 사용한다. 전체 페이지 조회 후 화면에서 검색하며, 삭제 전 상태(`previous_status`)가 없는 게시물은 복구를 차단한다.
- MANUSR 회원관리는 `src/api/manage/users.ts`를 사용한다. 회원 상세는 우측 패널에서 조회하며, 본인 권한 변경과 탈퇴 회원 승격을 차단하고 탈퇴 관리자의 강등은 허용한다.
- MANVND 제공처·동아리 관리는 `src/api/manage/vendors.ts`를 사용한다. 식별자와 SCHOOL/CLUB 구분은 등록 후 고정한다. 동아리 세부 유형은 `/api/v1/club-types`에서 조회해 복수 선택하며, 등록 시 하나 이상 필수다. 수정 시 `club_type_ids`는 선택이 달라진 경우에만 전송하고 SCHOOL에는 보내지 않는다. 비활성화는 목록·필터 숨김이다. 등록·숨김 응답의 `warning`을 표시하되, 수동 운영하는 CLUB에서는 크롤러 시드 안내를 숨기고 SCHOOL에서는 유지한다.

## Git workflow

- `main`은 프로덕션, `dev`는 기본 통합 브랜치, `manageDev`는 관리자 기능 개발 브랜치다.
- 이슈 작업은 `feat/<feature>-<issue-number>` 또는 `fix/<bug>-<issue-number>` 형식의 전용 브랜치에서 시작하고 `dev`로 병합한다.
- 관리자 개편(#86)은 `manageDev`를 통합 브랜치로 사용한다. 페이지마다 상위 이슈의 하위 이슈와 `feat/<Feature Code>-<issue-number>` 브랜치를 만들고, 페이지 PR은 `manageDev`로 보낸다. 개편 완료 후 `dev`로 통합한다. 카테고리 관리는 디자인 확정 후 진행한다.
- 커밋 형식은 `type: short description`이다. 허용 type은 `feat`, `fix`, `docs`, `style`, `refactor`, `chore`, `test`다.
