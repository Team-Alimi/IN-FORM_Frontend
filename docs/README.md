# INFORM v2 API 명세 — 엔드포인트 목록

> **먼저 [00-common.md](00-common.md) 를 읽으세요.** 응답 봉투·인증·페이징·에러 코드·공통 응답 객체가
> 거기 있고, 아래 개별 명세는 전부 그 규격을 전제로 씁니다.

전체 63개.

## 관리자

| 기능 | Method | 엔드포인트 | 권한 | 명세 |
|---|---|---|---|---|
| 관리자 공지 목록 조회 | GET | `/api/v1/admin/articles` | Required (Admin) | [admin/article/관리자 공지 목록 조회.md](admin/article/%EA%B4%80%EB%A6%AC%EC%9E%90%20%EA%B3%B5%EC%A7%80%20%EB%AA%A9%EB%A1%9D%20%EC%A1%B0%ED%9A%8C.md) |
| 공지 작성 | POST | `/api/v1/admin/articles` | Required (Admin) | [admin/article/공지 작성.md](admin/article/%EA%B3%B5%EC%A7%80%20%EC%9E%91%EC%84%B1.md) |
| 공지 영구 삭제 | POST | `/api/v1/admin/articles/bulk/delete` | Required (Admin) | [admin/article/공지 영구 삭제.md](admin/article/%EA%B3%B5%EC%A7%80%20%EC%98%81%EA%B5%AC%20%EC%82%AD%EC%A0%9C.md) |
| 공지 일괄 배포 | POST | `/api/v1/admin/articles/bulk/publish` | Required (Admin) | [admin/article/공지 일괄 배포.md](admin/article/%EA%B3%B5%EC%A7%80%20%EC%9D%BC%EA%B4%84%20%EB%B0%B0%ED%8F%AC.md) |
| 공지 복구 | POST | `/api/v1/admin/articles/bulk/restore` | Required (Admin) | [admin/article/공지 복구.md](admin/article/%EA%B3%B5%EC%A7%80%20%EB%B3%B5%EA%B5%AC.md) |
| 재검수 완료 | POST | `/api/v1/admin/articles/bulk/review-complete` | Required (Admin) | [admin/article/재검수 완료.md](admin/article/%EC%9E%AC%EA%B2%80%EC%88%98%20%EC%99%84%EB%A3%8C.md) |
| 공지 상태 일괄 변경 | POST | `/api/v1/admin/articles/bulk/status` | Required (Admin) | [admin/article/공지 상태 일괄 변경.md](admin/article/%EA%B3%B5%EC%A7%80%20%EC%83%81%ED%83%9C%20%EC%9D%BC%EA%B4%84%20%EB%B3%80%EA%B2%BD.md) |
| 공지 휴지통 이동 | POST | `/api/v1/admin/articles/bulk/trash` | Required (Admin) | [admin/article/공지 휴지통 이동.md](admin/article/%EA%B3%B5%EC%A7%80%20%ED%9C%B4%EC%A7%80%ED%86%B5%20%EC%9D%B4%EB%8F%99.md) |
| 등록 전 중복 확인 | GET | `/api/v1/admin/articles/duplicate-check` | Required (Admin) | [admin/article/등록 전 중복 확인.md](admin/article/%EB%93%B1%EB%A1%9D%20%EC%A0%84%20%EC%A4%91%EB%B3%B5%20%ED%99%95%EC%9D%B8.md) |
| 중복 공지 병합 | POST | `/api/v1/admin/articles/merge` | Required (Admin) | [admin/article/중복 공지 병합.md](admin/article/%EC%A4%91%EB%B3%B5%20%EA%B3%B5%EC%A7%80%20%EB%B3%91%ED%95%A9.md) |
| 공지 검수 대시보드 통계 | GET | `/api/v1/admin/articles/stats` | Required (Admin) | [admin/article/공지 검수 대시보드 통계.md](admin/article/%EA%B3%B5%EC%A7%80%20%EA%B2%80%EC%88%98%20%EB%8C%80%EC%8B%9C%EB%B3%B4%EB%93%9C%20%ED%86%B5%EA%B3%84.md) |
| 휴지통 공지 목록 조회 | GET | `/api/v1/admin/articles/trash` | Required (Admin) | [admin/article/휴지통 공지 목록 조회.md](admin/article/%ED%9C%B4%EC%A7%80%ED%86%B5%20%EA%B3%B5%EC%A7%80%20%EB%AA%A9%EB%A1%9D%20%EC%A1%B0%ED%9A%8C.md) |
| 관리자 공지 상세 조회 | GET | `/api/v1/admin/articles/{articleId}` | Required (Admin) | [admin/article/관리자 공지 상세 조회.md](admin/article/%EA%B4%80%EB%A6%AC%EC%9E%90%20%EA%B3%B5%EC%A7%80%20%EC%83%81%EC%84%B8%20%EC%A1%B0%ED%9A%8C.md) |
| 공지 수정 | PATCH | `/api/v1/admin/articles/{articleId}` | Required (Admin) | [admin/article/공지 수정.md](admin/article/%EA%B3%B5%EC%A7%80%20%EC%88%98%EC%A0%95.md) |
| 유사 공지 비교 조회 | GET | `/api/v1/admin/articles/{articleId}/similar` | Required (Admin) | [admin/article/유사 공지 비교 조회.md](admin/article/%EC%9C%A0%EC%82%AC%20%EA%B3%B5%EC%A7%80%20%EB%B9%84%EA%B5%90%20%EC%A1%B0%ED%9A%8C.md) |
| 공지 상태 변경 이력 조회 | GET | `/api/v1/admin/articles/{articleId}/status-logs` | Required (Admin) | [admin/article/공지 상태 변경 이력 조회.md](admin/article/%EA%B3%B5%EC%A7%80%20%EC%83%81%ED%83%9C%20%EB%B3%80%EA%B2%BD%20%EC%9D%B4%EB%A0%A5%20%EC%A1%B0%ED%9A%8C.md) |
| AI 요약 재생성 | POST | `/api/v1/admin/articles/{articleId}/summary/regenerate` | Required (Admin) | [admin/article/AI 요약 재생성.md](admin/article/AI%20%EC%9A%94%EC%95%BD%20%EC%9E%AC%EC%83%9D%EC%84%B1.md) |
| 카테고리 목록 조회 (관리자) | GET | `/api/v1/admin/categories` | Required (Admin) | [admin/category/카테고리 목록 조회 (관리자).md](admin/category/%EC%B9%B4%ED%85%8C%EA%B3%A0%EB%A6%AC%20%EB%AA%A9%EB%A1%9D%20%EC%A1%B0%ED%9A%8C%20%28%EA%B4%80%EB%A6%AC%EC%9E%90%29.md) |
| 카테고리 등록 | POST | `/api/v1/admin/categories` | Required (Admin) | [admin/category/카테고리 등록.md](admin/category/%EC%B9%B4%ED%85%8C%EA%B3%A0%EB%A6%AC%20%EB%93%B1%EB%A1%9D.md) |
| 카테고리 삭제 | DELETE | `/api/v1/admin/categories/{categoryId}` | Required (Admin) | [admin/category/카테고리 삭제.md](admin/category/%EC%B9%B4%ED%85%8C%EA%B3%A0%EB%A6%AC%20%EC%82%AD%EC%A0%9C.md) |
| 카테고리 수정 · 비활성화 | PATCH | `/api/v1/admin/categories/{categoryId}` | Required (Admin) | [admin/category/카테고리 수정 · 비활성화.md](admin/category/%EC%B9%B4%ED%85%8C%EA%B3%A0%EB%A6%AC%20%EC%88%98%EC%A0%95%20%C2%B7%20%EB%B9%84%ED%99%9C%EC%84%B1%ED%99%94.md) |
| 관리자 댓글 목록·검색 | GET | `/api/v1/admin/comments` | Required (Admin) | [admin/comment/관리자 댓글 목록·검색.md](admin/comment/%EA%B4%80%EB%A6%AC%EC%9E%90%20%EB%8C%93%EA%B8%80%20%EB%AA%A9%EB%A1%9D%C2%B7%EA%B2%80%EC%83%89.md) |
| 관리자 댓글 일괄 삭제 | POST | `/api/v1/admin/comments/bulk/delete` | Required (Admin) | [admin/comment/관리자 댓글 일괄 삭제.md](admin/comment/%EA%B4%80%EB%A6%AC%EC%9E%90%20%EB%8C%93%EA%B8%80%20%EC%9D%BC%EA%B4%84%20%EC%82%AD%EC%A0%9C.md) |
| 관리자 파일 업로드 취소 | DELETE | `/api/v1/admin/files` | Required (Admin) | [admin/file/관리자 파일 업로드 취소.md](admin/file/%EA%B4%80%EB%A6%AC%EC%9E%90%20%ED%8C%8C%EC%9D%BC%20%EC%97%85%EB%A1%9C%EB%93%9C%20%EC%B7%A8%EC%86%8C.md) |
| 관리자 파일 업로드 | POST | `/api/v1/admin/files` | Required (Admin) | [admin/file/관리자 파일 업로드.md](admin/file/%EA%B4%80%EB%A6%AC%EC%9E%90%20%ED%8C%8C%EC%9D%BC%20%EC%97%85%EB%A1%9C%EB%93%9C.md) |
| 회원 목록 조회 | GET | `/api/v1/admin/users` | Required (Admin) | [admin/user/회원 목록 조회.md](admin/user/%ED%9A%8C%EC%9B%90%20%EB%AA%A9%EB%A1%9D%20%EC%A1%B0%ED%9A%8C.md) |
| 회원 단건 조회 | GET | `/api/v1/admin/users/{userId}` | Required (Admin) | [admin/user/회원 단건 조회.md](admin/user/%ED%9A%8C%EC%9B%90%20%EB%8B%A8%EA%B1%B4%20%EC%A1%B0%ED%9A%8C.md) |
| 회원 권한 변경 | PATCH | `/api/v1/admin/users/{userId}/role` | Required (Admin) | [admin/user/회원 권한 변경.md](admin/user/%ED%9A%8C%EC%9B%90%20%EA%B6%8C%ED%95%9C%20%EB%B3%80%EA%B2%BD.md) |
| 제공처 목록 조회 (관리자) | GET | `/api/v1/admin/vendors` | Required (Admin) | [admin/vendor/제공처 목록 조회 (관리자).md](admin/vendor/%EC%A0%9C%EA%B3%B5%EC%B2%98%20%EB%AA%A9%EB%A1%9D%20%EC%A1%B0%ED%9A%8C%20%28%EA%B4%80%EB%A6%AC%EC%9E%90%29.md) |
| 제공처 등록 | POST | `/api/v1/admin/vendors` | Required (Admin) | [admin/vendor/제공처 등록.md](admin/vendor/%EC%A0%9C%EA%B3%B5%EC%B2%98%20%EB%93%B1%EB%A1%9D.md) |
| 제공처 수정 · 비활성화 | PATCH | `/api/v1/admin/vendors/{vendorId}` | Required (Admin) | [admin/vendor/제공처 수정 · 비활성화.md](admin/vendor/%EC%A0%9C%EA%B3%B5%EC%B2%98%20%EC%88%98%EC%A0%95%20%C2%B7%20%EB%B9%84%ED%99%9C%EC%84%B1%ED%99%94.md) |

## 공지 조회

| 기능 | Method | 엔드포인트 | 권한 | 명세 |
|---|---|---|---|---|
| 공지 목록 조회 | GET | `/api/v1/articles` | Required (User) | [article/1. 공지 목록 조회.md](article/1.%20%EA%B3%B5%EC%A7%80%20%EB%AA%A9%EB%A1%9D%20%EC%A1%B0%ED%9A%8C.md) |
| 인기 공지 조회 | GET | `/api/v1/articles/popular` | Not Required | [article/인기 공지 조회.md](article/%EC%9D%B8%EA%B8%B0%20%EA%B3%B5%EC%A7%80%20%EC%A1%B0%ED%9A%8C.md) |
| 공지 상세 조회 | GET | `/api/v1/articles/{articleId}` | Required (User) | [article/2. 공지 상세 조회.md](article/2.%20%EA%B3%B5%EC%A7%80%20%EC%83%81%EC%84%B8%20%EC%A1%B0%ED%9A%8C.md) |

## 인증

| 기능 | Method | 엔드포인트 | 권한 | 명세 |
|---|---|---|---|---|
| 구글 로그인 | POST | `/api/v1/auth/login/google` | Not Required | [auth/1. 구글 로그인.md](auth/1.%20%EA%B5%AC%EA%B8%80%20%EB%A1%9C%EA%B7%B8%EC%9D%B8.md) |
| 로그아웃 | POST | `/api/v1/auth/logout` | Required (User) | [auth/3. 로그아웃.md](auth/3.%20%EB%A1%9C%EA%B7%B8%EC%95%84%EC%9B%83.md) |
| 전체 기기 로그아웃 | POST | `/api/v1/auth/logout/all` | Required (User) | [auth/4. 전체 기기 로그아웃.md](auth/4.%20%EC%A0%84%EC%B2%B4%20%EA%B8%B0%EA%B8%B0%20%EB%A1%9C%EA%B7%B8%EC%95%84%EC%9B%83.md) |
| 토큰 재발급 | POST | `/api/v1/auth/token/refresh` | Not Required | [auth/2. 토큰 재발급.md](auth/2.%20%ED%86%A0%ED%81%B0%20%EC%9E%AC%EB%B0%9C%EA%B8%89.md) |

## 북마크

| 기능 | Method | 엔드포인트 | 권한 | 명세 |
|---|---|---|---|---|
| 북마크 전체 삭제 | DELETE | `/api/v1/bookmarks` | Required (User) | [bookmark/북마크 전체 삭제.md](bookmark/%EB%B6%81%EB%A7%88%ED%81%AC%20%EC%A0%84%EC%B2%B4%20%EC%82%AD%EC%A0%9C.md) |
| 북마크 목록 조회 | GET | `/api/v1/bookmarks` | Required (User) | [bookmark/북마크 목록 조회.md](bookmark/%EB%B6%81%EB%A7%88%ED%81%AC%20%EB%AA%A9%EB%A1%9D%20%EC%A1%B0%ED%9A%8C.md) |
| 북마크 해제 | DELETE | `/api/v1/bookmarks/articles/{articleId}` | Required (User) | [bookmark/북마크 해제.md](bookmark/%EB%B6%81%EB%A7%88%ED%81%AC%20%ED%95%B4%EC%A0%9C.md) |
| 북마크 추가 | PUT | `/api/v1/bookmarks/articles/{articleId}` | Required (User) | [bookmark/북마크 추가.md](bookmark/%EB%B6%81%EB%A7%88%ED%81%AC%20%EC%B6%94%EA%B0%80.md) |

## 캘린더

| 기능 | Method | 엔드포인트 | 권한 | 명세 |
|---|---|---|---|---|
| 월간 캘린더 조회 | GET | `/api/v1/calendar/articles` | Not Required | [calendar/월간 캘린더 조회.md](calendar/%EC%9B%94%EA%B0%84%20%EC%BA%98%EB%A6%B0%EB%8D%94%20%EC%A1%B0%ED%9A%8C.md) |

## 댓글

| 기능 | Method | 엔드포인트 | 권한 | 명세 |
|---|---|---|---|---|
| 댓글 목록 조회 | GET | `/api/v1/articles/{articleId}/comments` | Required (User) | [comment/댓글 목록 조회.md](comment/%EB%8C%93%EA%B8%80%20%EB%AA%A9%EB%A1%9D%20%EC%A1%B0%ED%9A%8C.md) |
| 댓글 작성 | POST | `/api/v1/articles/{articleId}/comments` | Required (User) | [comment/댓글 작성.md](comment/%EB%8C%93%EA%B8%80%20%EC%9E%91%EC%84%B1.md) |
| 댓글 삭제 | DELETE | `/api/v1/comments/{commentId}` | Required (User) | [comment/댓글 삭제.md](comment/%EB%8C%93%EA%B8%80%20%EC%82%AD%EC%A0%9C.md) |
| 댓글 수정 | PATCH | `/api/v1/comments/{commentId}` | Required (User) | [comment/댓글 수정.md](comment/%EB%8C%93%EA%B8%80%20%EC%88%98%EC%A0%95.md) |

## 공통 조회

| 기능 | Method | 엔드포인트 | 권한 | 명세 |
|---|---|---|---|---|
| 카테고리 조회 | GET | `/api/v1/categories` | Not Required | [common/카테고리 조회.md](common/%EC%B9%B4%ED%85%8C%EA%B3%A0%EB%A6%AC%20%EC%A1%B0%ED%9A%8C.md) |
| 제공처 목록 조회 | GET | `/api/v1/vendors` | Not Required | [common/제공처 목록 조회.md](common/%EC%A0%9C%EA%B3%B5%EC%B2%98%20%EB%AA%A9%EB%A1%9D%20%EC%A1%B0%ED%9A%8C.md) |

## 알림

| 기능 | Method | 엔드포인트 | 권한 | 명세 |
|---|---|---|---|---|
| 알림 목록 조회 | GET | `/api/v1/notifications` | Required (User) | [notification/알림 목록 조회.md](notification/%EC%95%8C%EB%A6%BC%20%EB%AA%A9%EB%A1%9D%20%EC%A1%B0%ED%9A%8C.md) |
| 알림 전체 읽음 처리 | PATCH | `/api/v1/notifications/read-all` | Required (User) | [notification/알림 전체 읽음 처리.md](notification/%EC%95%8C%EB%A6%BC%20%EC%A0%84%EC%B2%B4%20%EC%9D%BD%EC%9D%8C%20%EC%B2%98%EB%A6%AC.md) |
| 안 읽은 알림 개수 조회 | GET | `/api/v1/notifications/unread-count` | Required (User) | [notification/안 읽은 알림 개수 조회.md](notification/%EC%95%88%20%EC%9D%BD%EC%9D%80%20%EC%95%8C%EB%A6%BC%20%EA%B0%9C%EC%88%98%20%EC%A1%B0%ED%9A%8C.md) |
| 알림 개별 읽음 처리 | PATCH | `/api/v1/notifications/{notificationId}/read` | Required (User) | [notification/알림 개별 읽음 처리.md](notification/%EC%95%8C%EB%A6%BC%20%EA%B0%9C%EB%B3%84%20%EC%9D%BD%EC%9D%8C%20%EC%B2%98%EB%A6%AC.md) |

## 사용자·온보딩

| 기능 | Method | 엔드포인트 | 권한 | 명세 |
|---|---|---|---|---|
| 회원 탈퇴 | DELETE | `/api/v1/users/me` | Required (User) | [user/4. 회원 탈퇴.md](user/4.%20%ED%9A%8C%EC%9B%90%20%ED%83%88%ED%87%B4.md) |
| 내 프로필 조회 | GET | `/api/v1/users/me` | Required (User) | [user/1. 내 프로필 조회.md](user/1.%20%EB%82%B4%20%ED%94%84%EB%A1%9C%ED%95%84%20%EC%A1%B0%ED%9A%8C.md) |
| 알림 수신 설정 변경 | PATCH | `/api/v1/users/me` | Required (User) | [user/5. 알림 수신 설정 변경.md](user/5.%20%EC%95%8C%EB%A6%BC%20%EC%88%98%EC%8B%A0%20%EC%84%A4%EC%A0%95%20%EB%B3%80%EA%B2%BD.md) |
| 관심 분류 조회 | GET | `/api/v1/users/me/interests/categories` | Required (User) | [user/8. 관심 분류 조회.md](user/8.%20%EA%B4%80%EC%8B%AC%20%EB%B6%84%EB%A5%98%20%EC%A1%B0%ED%9A%8C.md) |
| 관심 분류 저장 | PUT | `/api/v1/users/me/interests/categories` | Required (User) | [user/7. 관심 분류 저장.md](user/7.%20%EA%B4%80%EC%8B%AC%20%EB%B6%84%EB%A5%98%20%EC%A0%80%EC%9E%A5.md) |
| 관심 동아리 유형 조회 | GET | `/api/v1/users/me/interests/club-types` | Required (User) | [user/10. 관심 동아리 유형 조회.md](user/10.%20%EA%B4%80%EC%8B%AC%20%EB%8F%99%EC%95%84%EB%A6%AC%20%EC%9C%A0%ED%98%95%20%EC%A1%B0%ED%9A%8C.md) |
| 관심 동아리 유형 저장 | PUT | `/api/v1/users/me/interests/club-types` | Required (User) | [user/9. 관심 동아리 유형 저장.md](user/9.%20%EA%B4%80%EC%8B%AC%20%EB%8F%99%EC%95%84%EB%A6%AC%20%EC%9C%A0%ED%98%95%20%EC%A0%80%EC%9E%A5.md) |
| 온보딩 완료 | POST | `/api/v1/users/me/onboarding/complete` | Required (User) | [user/6. 온보딩 완료.md](user/6.%20%EC%98%A8%EB%B3%B4%EB%94%A9%20%EC%99%84%EB%A3%8C.md) |
| 구독 학과·기관 조회 | GET | `/api/v1/users/me/vendors` | Required (User) | [user/3. 구독 학과·기관 조회.md](user/3.%20%EA%B5%AC%EB%8F%85%20%ED%95%99%EA%B3%BC%C2%B7%EA%B8%B0%EA%B4%80%20%EC%A1%B0%ED%9A%8C.md) |
| 구독 학과·기관 저장 | PUT | `/api/v1/users/me/vendors` | Required (User) | [user/2. 구독 학과·기관 저장.md](user/2.%20%EA%B5%AC%EB%8F%85%20%ED%95%99%EA%B3%BC%C2%B7%EA%B8%B0%EA%B4%80%20%EC%A0%80%EC%9E%A5.md) |
