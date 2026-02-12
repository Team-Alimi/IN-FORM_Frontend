# INFORM Frontend
## 🛠️ 기술 스택

### Core
- **React 19** - UI 라이브러리
- **Vite** - 빌드 도구 및 개발 서버
- **React Router DOM** - 클라이언트 사이드 라우팅

### 상태 관리 & 데이터 페칭
- **TanStack Query (React Query)** - 서버 상태 관리
- **Zustand** - 클라이언트 상태 관리
- **Axios** - HTTP 클라이언트

### 스타일링
- **Tailwind CSS 4** - 유틸리티 우선 CSS 프레임워크
- **React Icons** - 아이콘 라이브러리

### 개발 도구
- **ESLint** - 코드 품질 관리
- **Prettier** - 코드 포매팅

## 📁 프로젝트 구조

```
src/
├── api/              # API 통신 관련 함수
├── assets/           # 정적 리소스 (이미지, 아이콘 등)
├── components/       # React 컴포넌트
│   ├── CBD/         # 동아리 상세 (Club Detail)
│   ├── CBL/         # 동아리 목록 (Club List)
│   ├── EVD/         # 이벤트 상세 (Event Detail)
│   ├── EVL/         # 이벤트 목록 (Event List)
│   ├── HOM/         # 홈/캘린더 (Home)
│   └── common/      # 공통 컴포넌트
├── constants/        # 상수 정의
├── pages/           # 페이지 컴포넌트
├── utils/           # 유틸리티 함수
├── App.jsx          # 루트 컴포넌트
└── main.jsx         # 엔트리 포인트
```

## 🌐 페이지 구조

| 경로 | 페이지 | 설명 |
|------|--------|------|
| `/` | HOMPage | 메인 캘린더 페이지 |
| `/clubs` | CBLPage | 동아리 목록 |
| `/clubs/detail/:id` | CBDPage | 동아리 상세 정보 |
| `/events` | EVLPage | 이벤트 목록 |
| `/events/detail/:id` | EVDPage | 이벤트 상세 정보 |
| `/error` | ErrorPage | 에러 페이지 |

## 🚦 시작하기

### 사전 요구사항

- Node.js 18.x 이상
- npm 또는 yarn

### 설치

```bash
# 저장소 클론
git clone https://github.com/Team-Alimi/IN-FORM_Frontend.git

# 디렉토리 이동
cd inform_frontend

# 의존성 설치
npm install
```

### 개발 서버 실행

```bash
npm run dev
```

브라우저에서 `http://localhost:5173`을 열어 확인

### 빌드

```bash
npm run build
```

빌드된 파일은 `dist` 폴더에 생성됩니다.

### 프리뷰

```bash
npm run preview
```

프로덕션 빌드를 로컬에서 미리 확인할 수 있습니다.

## 🎯 개발 가이드

### 네이밍 규칙

- 페이지 폴더명은 3글자 약어 사용 (HOM, EVL, EVD, CBL, CBD, NOT)
- 컴포넌트: PascalCase 사용
- 유틸리티 함수: camelCase 사용
- 상수: UPPER_SNAKE_CASE 사용

### Git 컨벤션

- 브랜치, 커밋 메세지는 "type: 간단한 설명"

| type     | 언제 쓰는지            |
| -------- | ----------------- |
| feat     | 새로운 기능            |
| fix      | 버그 수정             |
| docs     | README, 문서        |
| style    | 스타일만 변경 (CSS, 포맷) |
| refactor | 기능 변화 없는 코드 개선    |
| chore    | 설정, 패키지, 빌드       |
| test     | 테스트 코드            |


### 상태 관리

- **서버 데이터**: React Query를 사용하여 캐싱 및 동기화
- **클라이언트 상태**: Zustand를 사용하여 전역 상태 관리

### 스타일링

- Tailwind CSS의 유틸리티 클래스 우선 사용
- 공통 스타일은 `global.css`에 정의


## 👥 Contact

team.alimi.inform@gmail.com
