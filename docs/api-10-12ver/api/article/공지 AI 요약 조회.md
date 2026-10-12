# 공지 AI 요약 조회

**AI 3줄 요약만 떼어 조회합니다. 상세 화면에서 "AI 요약 생성 중" 을 띄운 뒤 다시 받아 올 때 쓰는 전용 경로입니다.**

- **Method / Endpoint: `GET /api/v1/articles/{articleId}/summary`**
- **Auth Required: Required (User)**

> **상세 조회로 폴링하지 마세요.** 이유는 아래 "왜 전용 경로인가" 에 있습니다.

# Request

## Request Header

| Name | Value | Description | Required |
| --- | --- | --- | --- |
| Authorization | Bearer {access_token} | 서비스 Access Token | **필수** |

## Path Variable

| Name | Type | Description | Required |
| --- | --- | --- | --- |
| articleId | Long | 공지 번호 | **필수** |

## Request Sample

```
GET /api/v1/articles/1234/summary
```

# 언제 부르는가

[2. 공지 상세 조회.md](2.%20%EA%B3%B5%EC%A7%80%20%EC%83%81%EC%84%B8%20%EC%A1%B0%ED%9A%8C.md) 응답의
`summary_status` 가 **`PENDING`** 일 때만 부릅니다.

```
상세 조회 → summary_status
  READY    → 요약 표시. 이 API 부를 필요 없음
  PENDING  → "AI 요약 생성 중" 표시 + 이 API 를 2초 간격 4회까지
  NONE     → 요약 박스 숨김. 이 API 부르지 마세요
```

## 권장 재조회 규칙

| | |
|---|---|
| 간격 | **2초** |
| 최대 횟수 | **4회** (총 8초) |
| 중단 조건 | `READY` 를 받으면 즉시 중단, `NONE` 을 받으면 즉시 중단 |
| 4회 뒤에도 `PENDING` | **포기하고 요약 박스를 접습니다** |

생성은 보통 1~3초에 끝납니다. 한 번 실패해 재시도하면 2초, 두 번이면 추가 4초가 더 붙습니다
(서버 내부 백오프). 그래서 8초면 성공 케이스는 거의 잡힙니다.

> ⚠ **무한 폴링은 금지입니다.** `PENDING` 은 **"생성 요청이 걸렸다" 까지만** 뜻합니다.
> 실제 생성이 실패했거나 쿨다운(60초) 중인 경우도 똑같이 `PENDING` 으로 나옵니다 —
> 그 판정은 서버 내부 워커에서 일어나 응답 시점에는 알 수 없습니다.
> 끝까지 `PENDING` 이어도 오류가 아닙니다. 사용자가 나중에 다시 들어오면 그때는 채워져 있을 가능성이 높습니다.

# 왜 전용 경로인가

상세 조회(`GET /articles/{articleId}`)로 재조회하면 **세 가지가 같이 일어납니다.**

| | 상세 조회 | 이 API |
|---|---|---|
| 요약 생성 요청 | 요약이 빌 때마다 **다시 던집니다** | 하지 않습니다 |
| 조회수 집계 | 집계 경로를 탑니다 | 세지 않습니다 |
| 응답 크기 | 분류·출처·첨부·북마크까지 조인 | 두 필드 |

가장 중요한 건 첫 줄입니다. 생성 작업 큐는 **용량이 20이고 초과분은 거부**됩니다.
상세 조회로 폴링하면 그 큐가 폴링 요청으로 채워져 **실제 생성 작업이 밀려 나갑니다** —
요약을 빨리 보려고 한 폴링이 요약 생성을 막는 셈입니다.

# Response

## Response Param

| name | type | 비고 |
| --- | --- | --- |
| success | Boolean | 요청 성공 여부 |
| data.summary | String | 요약 본문. 아직 없으면 **필드 자체가 빠집니다** |
| data.summary_status | String | `READY` \| `PENDING` \| `NONE`. **항상 있습니다** |

## Response Sample

생성이 끝난 경우 — 이걸 받으면 재조회를 멈추고 화면을 교체합니다.

```json
{
  "success": true,
  "data": {
    "summary": "8월 20일까지 국가장학금 2차 신청. 신입생·편입생도 대상. 서류는 학사포털 제출.",
    "summary_status": "READY"
  }
}
```

아직 생성 중인 경우 — `summary` 가 없습니다.

```json
{
  "success": true,
  "data": {
    "summary_status": "PENDING"
  }
}
```

생성하지 않는 경우 — 기다려도 안 생깁니다.

```json
{
  "success": true,
  "data": {
    "summary_status": "NONE"
  }
}
```

# Error

| HTTP Status | Code | Message | Description |
| --- | --- | --- | --- |
| 401 | UNAUTHORIZED | 인증이 필요합니다. | 토큰 없음·만료 |
| 404 | ARTICLE_NOT_FOUND | 존재하지 않는 공지입니다. | 없는 번호이거나 **볼 수 없는 공지** |
| 500 | INTERNAL_SERVER_ERROR | 서버 내부 오류가 발생했습니다. | 서버 측 처리 오류 |

> **노출 기준이 상세 조회와 같습니다.** 상세로 404 인 공지는 여기서도 404 입니다 —
> 한쪽만 느슨하면 미배포 공지의 요약이 이쪽으로 새어 나갑니다.

> **생성 실패는 오류로 나가지 않습니다.** `PENDING` 그대로입니다.
> 사용자에게 보여 줄 수 있는 정보가 아니고, 재시도는 서버가 알아서 합니다.
