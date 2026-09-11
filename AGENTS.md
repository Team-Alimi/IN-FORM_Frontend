# INFORM Frontend — Codex 작업 지침

## 작업 원칙

- 프로젝트 전반에 오래 적용될 규칙, 라우트, 구조가 바뀌면 이 문서도 함께 갱신한다. 구현 세부 사항·근거·예시는 [docs/development-conventions.md](docs/development-conventions.md)에 둔다.
- 기존 코드를 수정하기 전에 관련 코드를 확인하고, 작업 범위 밖의 사용자 변경은 보존한다. PR 생성 시 `.github/PULL_REQUEST_TEMPLATE.md`를 사용한다.
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
| MAN* | 관리자 기능 (`MANHOM`, `MANLGN`, `MANDTE`, `MANDTR`, `MANSTG`, `MANGBG`, `MANURV`) |

페이지는 `[CODE]Page.jsx` 또는 `[CODE]Page.tsx`로 이름 짓는다. 데스크톱과 모바일이 함께 사용하는 사용자 기능 컴포넌트는 `components/main/adaptive/feature/[CODE]/`에 둔다.

## 코드와 상태 관리 규칙

- 사용자용 main 페이지·컴포넌트는 JavaScript/JSX(`.js`, `.jsx`)를, 관리자 페이지·컴포넌트·API는 TypeScript/TSX(`.ts`, `.tsx`)를 사용한다. Hook은 호출부와 주변 API에 맞춰 JS 또는 TS를 사용한다.
- 컴포넌트는 PascalCase, Hook·유틸리티·store는 camelCase, 상수는 UPPER_SNAKE_CASE를 사용한다. `COM1`–`COM9`, `LPT1` 같은 Windows 예약 파일명은 만들지 않는다.
- 컴포넌트는 화살표 함수로 선언한다. 로컬 이벤트 핸들러는 `handle*`, 콜백 prop은 `on*`으로 시작한다.
- 서버/API 상태는 TanStack React Query로 관리한다. 의미 있는 배열형 query key를 쓰고, 조건부 쿼리는 `enabled`로 제어하며, mutation 성공 뒤 영향받는 query key를 invalidate한다.
- Zustand는 공유 클라이언트/UI 상태에만 사용한다. 새로고침 뒤에도 남아야 하는 상태만 `persist`로 저장하고, 각 store에는 안정적인 storage key를 부여한다.

## 반응형 UI

- `adaptive/`는 두 레이아웃이 함께 쓰는 컴포넌트이며 `isMobile`로 레이아웃을 선택한다. `desktop/`, `mobile/`은 각 전용 UI를 둔다.
- 모바일 기준은 화면 너비 **430px 이하**다. `MOBILE_BREAKPOINT`, `useDeviceStore(...isMobile)`, Tailwind `max-mobile` variant를 재사용하고, 별도의 기준값을 만들지 않는다.
- 데스크톱 dialog에 모바일 대응 UI가 있으면 두 가지를 모두 유지한다. 데스크톱은 중앙 고정형 `[Name]Modal.jsx`, 모바일은 공용 `BottomSheet`를 사용하는 `[Name]Sheet.jsx`다.

## 인증과 라우트

- Google OAuth는 인앱 WebView에서 완료할 수 없다. `index.html`의 외부 브라우저 처리(KakaoTalk: `kakaotalk://web/openExternal`, LINE: `openExternalBrowser=1`, 그 외 인앱 브라우저: 안내 오버레이)를 보존한다. 로그인 처리 변경 시 이 경로를 함께 확인한다.
- 공개 라우트: `/`, `/login`, `/onboarding`, `/privacy-policy`, `/terms-of-service`.
- 보호된 사용자 라우트: `/clubs`, `/clubs/detail/:id`, `/events`, `/events/detail/:id`, `/bookmarks`, `/mypage`.
- 관리자 라우트: `/manage`, `/manage/login`, `/manage/detail/:id`, `/manage/edit`, `/manage/staged`, `/manage/garbage`, `/manage/unreviewed`.

## Git workflow

- `main`은 프로덕션, `dev`는 기본 통합 브랜치, `manageDev`는 관리자 기능 개발 브랜치다.
- 이슈 작업은 `feat/<feature>-<issue-number>` 또는 `fix/<bug>-<issue-number>` 형식의 전용 브랜치에서 시작하고 `dev`로 병합한다.
- 커밋 형식은 `type: short description`이다. 허용 type은 `feat`, `fix`, `docs`, `style`, `refactor`, `chore`, `test`다.
