# AI 요약 재생성

**공지의 AI 요약을 지우고 재생성을 요청합니다. 요약이 엉뚱하게 나왔거나 원본이 수정되어 내용이 맞지 않을 때 씁니다.**

- **Method / Endpoint: `POST /api/v1/admin/articles/{articleId}/summary/regenerate`**
- **Auth Required: Required (Admin)**

> **즉시 반영되지 않습니다.** 이 API 는 `summary` 를 `NULL` 로 지우고 생성을 **요청만** 합니다.
> 실제 생성은 주기 배치가 맡으므로, 응답을 받은 직후 공지를 다시 조회하면 `summary` 가 **없는 상태**입니다.
> 화면은 "재생성을 요청했습니다" 로 안내하고, 요약 자리는 비워 두어야 합니다.
>
> 요약을 **직접 고치려면** 이 API 가 아니라 `PATCH /api/v1/admin/articles/{articleId}` 의 `summary` 필드를 쓰세요.

# Request

## Request Header

| Name | Value | Description | Required |
| --- | --- | --- | --- |
| Authorization | Bearer {access_token} | 서비스 Access Token | **필수** |

## Path Param

| Name | Type | Description | Required |
| --- | --- | --- | --- |
| articleId | Long | 요약을 다시 만들 공지 ID | **필수** |

## Request Sample

```
POST /api/v1/admin/articles/42/summary/regenerate
```

요청 body 가 없습니다.

# Response

## Response Param

| name | type | 비고 |
| --- | --- | --- |
| success | Boolean | 요청 성공 여부 |
| data | Object | **항상 null** — 돌려줄 것이 없습니다 |
| error | Object | 에러 정보 (성공 시 null) |

> `default-property-inclusion: non_null` 이라 성공 응답에서 `data` 키 자체가 빠집니다.
> 프론트는 `data` 의 존재를 가정하지 말고 `success` 만 보세요.

## Response Sample

```json
{
  "success": true
}
```

# Error

| HTTP Status | Code | Message | Description |
| --- | --- | --- | --- |
| 400 | INVALID_INPUT_VALUE | 유효하지 않은 입력 값입니다. | `articleId` 가 숫자가 아닐 때 |
| 401 | UNAUTHORIZED | 인증이 필요합니다. | 토큰 없음·만료 |
| 403 | FORBIDDEN | 권한이 없습니다. | 관리자가 아님 |
| 404 | ARTICLE_NOT_FOUND | 존재하지 않는 게시글입니다. | 해당 공지가 없을 때 |
| 500 | INTERNAL_SERVER_ERROR | 서버 내부 오류가 발생했습니다. | 서버 측 처리 오류 |
