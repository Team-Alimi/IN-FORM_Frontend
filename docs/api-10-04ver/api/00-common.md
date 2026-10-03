<!-- docs/API_SPEC_V2.md 의 2장에서 뽑아 온 것입니다. 고칠 때 양쪽을 함께 고치세요. -->

> 모든 개별 엔드포인트 명세가 이 규격을 전제로 합니다.
> 엔드포인트 목록은 [README.md](README.md) 를 보세요.

# 공통 규격

## Base URL

```
https://api.inha-inform.today/api/v1
```

## 응답 래퍼

```json
// 성공
{ "success": true, "data": { ... }, "error": null }

// 실패
{ "success": false, "data": null,
  "error": { "code": "ARTICLE_NOT_FOUND", "message": "존재하지 않는 공지입니다." } }
```

## 인증

```
Authorization: Bearer {access_token}
```

- Access Token 1시간 / Refresh Token 14일
- **Refresh Token Rotation** — 재발급 시 이전 토큰 즉시 폐기, 재사용 감지 시 해당 사용자 전체 세션 무효화
- 기기별 다중 세션 지원 (Redis 키가 토큰 단위)
- 개인화 필드(`is_bookmarked`)는 토큰이 있을 때만 의미가 있고, 없으면 `false` 입니다

> **비로그인으로 열려 있는 것은 4가지입니다** — `GET /calendar/**`, `GET /articles/popular`,
> `GET /vendors`, `GET /categories`. 그리고 로그인 진입점 2개.
>
> 앞의 둘은 **홈 화면이 캘린더 페이지**라서 함께 열려 있습니다.
>
> **공지 목록·상세·인기·댓글 열람은 로그인이 필요합니다.** 구판 명세는 이들을 "공개" 로 적었지만
> 실제 동작은 `401` 이고, `PublicEndpointsTest` 가 그것을 의도적으로 고정하고 있습니다.
> 캘린더에서 상세로 넘어가는 순간 로그인 벽을 만나는 구조입니다.

## 네이밍

- 요청/응답 JSON 필드: **`snake_case`** (Jackson 전역 설정)
- 경로 변수: `{articleId}` 같은 camelCase 대신 리소스 경로만 사용
- 쿼리 파라미터: `snake_case`

## 페이징

> **`page` 는 v1과 같이 1-base 입니다.** Spring 은 내부적으로 0부터 세지만 경계에서 한 번만 변환합니다 —
> 프론트가 매번 +1 을 하면 결국 한 곳은 빠뜨리고, 그때 생기는 증상(첫 페이지 중복·마지막 페이지 누락)은
> **에러 없이 조용히** 일어납니다.

| 파라미터 | 기본값 | 설명 |
|---|---|---|
| `page` | `1` | **1-base** |
| `size` | `20` | 최대 50 |
| `sort` | 엔드포인트별 | `published_at,desc` 형식 |

**페이징 응답 형태**

```json
{
  "content": [ ... ],
  "page_info": {
    "current_page": 1,
    "size": 20,
    "total_pages": 7,
    "total_items": 137,
    "has_next": true
  }
}
```

> **페이지는 요청도 응답도 1부터입니다.** Spring 은 내부적으로 0부터 세지만 경계에서 한 번만 변환합니다 —
> 프론트가 매번 +1 을 하면 결국 한 곳은 빠뜨리고, 그때 생기는 증상(첫 페이지가 두 번 보이거나
> 마지막 페이지가 사라짐)은 **에러 없이 조용히** 일어납니다.
>
> `total_items` 는 `total_articles` 가 아닙니다 — 같은 봉투를 댓글·회원·알림 목록도 쓰기 때문에
> 필드 이름에 공지를 박으면 `GET /admin/users` 응답에 `total_articles` 가 나옵니다.

## 날짜·시각

| 타입 | 형식 | 예 |
|---|---|---|
| 날짜 | `yyyy-MM-dd` | `2026-08-01` |
| 시각 | ISO-8601 (offset 포함) | `2026-07-25T09:12:00+09:00` |

## 에러 코드

| code | HTTP | 설명 |
|---|---|---|
| `INVALID_INPUT_VALUE` | 400 | 요청 값 검증 실패 (`@Valid`) |
| `INVALID_STATE_TRANSITION` | 400 | 허용되지 않은 상태 전이 **(신규)** |
| `NOT_IN_TRASH` | 400 | 휴지통 상태가 아니라 복구 불가 |
| `INVALID_ID_TOKEN` | 401 | 유효하지 않은 구글 토큰 |
| `TOKEN_EXPIRED` | 401 | Access Token 만료 **(신규)** |
| `INVALID_REFRESH_TOKEN` | 401 | Refresh Token 무효 또는 재사용 감지 **(신규)** |
| `FORBIDDEN` | 403 | 권한 없음 |
| `DOMAIN_RESTRICTED` | 403 | 인하대 계정만 가입 가능 |
| `USER_NOT_FOUND` | 404 | |
| `ARTICLE_NOT_FOUND` | 404 | |
| `CATEGORY_NOT_FOUND` | 404 | |
| `VENDOR_NOT_FOUND` | 404 | **(신규)** |
| `ATTACHMENT_NOT_FOUND` | 404 | **(신규)** |
| `DUPLICATE_ARTICLE` | 409 | `external_key` 중복 |
| `INVALID_FILE_TYPE` | 400 | 허용: jpg, jpeg, png, gif, webp |
| `FILE_SIZE_EXCEEDED` | 400 | 10MB 초과 |
| `FILE_IS_EMPTY` | 400 | |
| `FILE_UPLOAD_FAILED` | 500 | |
| `INTERNAL_SERVER_ERROR` | 500 | |

## 공통 응답 객체

**`VendorSummary`**
```json
{ "id": 3, "name": "컴퓨터공학과", "initial": "컴공", "type": "SCHOOL" }
```

**`CategorySummary`**
```json
{ "id": 1, "name": "장학" }
```

**`ArticleSummary`** — 목록용
```json
{
  "id": 42,
  "source_type": "SCHOOL",
  "title": "2026학년도 1학기 국가장학금 신청 안내",
  "starts_on": "2026-08-01",
  "ends_on": "2026-08-20",
  "deadline_status": "OPEN",
  "published_at": "2026-07-25T09:12:00+09:00",
  "vendors": [ { "id": 3, "name": "컴퓨터공학과", "initial": "컴공", "type": "SCHOOL" } ],
  "categories": [ { "id": 1, "name": "장학" } ],
  "summary": "8월 20일까지 국가장학금 2차 신청. 신입생·편입생도 대상.",
  "bookmark_count": 37,
  "is_bookmarked": true,
  "comment_count": 5,
  "view_count": 1284,
  "has_attachment": true,
  "under_review": false
}
```

`summary`는 AI 생성(2문장/150자) — 미생성이면 `null`(프론트는 생략 렌더링).
`is_bookmarked` 는 로그인 시에만 의미가 있고, 비로그인이면 항상 `false` 입니다.

`has_attachment` 는 목록에 **클립 아이콘을 그리기 위한 값**이라 개수나 목록까지는 내보내지 않습니다.
첨부 목록은 상세(`ArticleDetail`)에만 있습니다.

`under_review` — **이 필드만 별도 설명이 필요합니다.**
크롤러가 원본 수정을 감지해 재검수로 내려간 공지에 "검수 중" 배지를 띄우기 위한 값입니다.
**북마크 목록에서만 `true` 가 될 수 있습니다** — 일반 피드는 `PUBLISHED` 만 보여 주므로
그런 공지가 애초에 나오지 않습니다. 내가 담아 둔 공지가 조용히 사라진 것처럼 보이지 않게 하려는 목적입니다.

`deadline_status` — 마감 기준 파생값 (DB 컬럼 아님)

| 값 | 조건 |
|---|---|
| `UPCOMING` | 오늘 < `starts_on` |
| `OPEN` | 진행 중 |
| `CLOSING_SOON` | `ends_on` 까지 3일 이내 |
| `CLOSED` | 오늘 > `ends_on` |
| `ALWAYS` | 기간 정보 없음 |

> **v1 문제**: `status` 필드가 마감 상태를 뜻했는데 `admin_status`와 이름이 헷갈렸습니다.
> v2는 `deadline_status`로 명확히 하고, 관리자 상태는 `status`로 관리자 응답에만 넣습니다.

---
