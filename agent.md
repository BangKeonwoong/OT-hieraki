# BHSA 어미절( mother clause ) 최종선택 도구 – Agent Guide (agent.md)

## 0) 한 줄 요약
사용자가 **성경의 “책(book)”을 선택**하면 BHSA(Text-Fabric)에서 그 책의 **clause_atom 목록**을 불러와 UI에 표시하고, 사용자가 **특정 clause_atom(=딸 절)을 클릭**하면 그 앞(이전) 절들 가운데 **어미절(mother) 후보들을 하이라이트**하며, 하이라이트된 후보 위에 **마우스 호버** 시 **점수 + 근거(설명 가능한 feature 기여도)** 를 툴팁으로 보여주는 “최종 선택” 작업 도구를 만든다.

---

## 1) 핵심 개념 / 용어
- **clause_atom**: BHSA의 “distributional maximal consecutive part of a clause” (연속 구간 단위의 절).
- **daughter clause_atom**: 사용자가 클릭한 목표 절(어미절을 찾고 싶은 대상).
- **mother clause_atom(어미절)**: daughter를 “anchoring” 하는 상위(선행) clause_atom.  
  BHSA에는 `mother` 라는 **edge feature**가 존재하며, 역사적으로 syn04types/sy04types 같은 도구가 “가능한 mother 후보”를 점수화해 제안하고 **분석자가 최종 선택**한다는 설명이 문서에 있다.
- **candidate mothers**: daughter 앞에 위치한 clause_atom들 중, mother일 “가능성”이 있는 후보 집합.
- **score & evidence**: 후보마다 점수(0~1 또는 0~100)와 “왜 그런 점수인지”를 설명하는 근거(특징값/가중치/기여도)를 제공해야 한다.

---

## 2) 제품 요구사항 (MVP)
### 2.1 사용자 플로우
1. 사용자가 **Book 선택** (예: Genesis).
2. 서버가 BHSA에서 그 책의 clause_atom들을 로드 → UI에 **텍스트 순서대로** 렌더.
3. 사용자가 리스트에서 **특정 clause_atom 클릭** (daughter 지정).
4. 시스템이 **daughter보다 앞(이전)의 clause_atom들**을 탐색하여:
   - “어미절 후보”를 선정(필터)하고
   - 후보마다 점수/근거를 계산(스코어링)한 뒤
   - UI에서 **후보 절을 하이라이트**한다.
5. 사용자가 하이라이트된 후보에 **hover** 하면:
   - 툴팁으로 `score`, `rank`, `evidence(근거)`를 표시한다.
6. (권장) 사용자가 후보를 클릭하면 해당 후보를 **최종 어미절로 선택**하고 저장/내보내기 가능하게 한다.

### 2.2 UI 상호작용 요구
- clause_atom 한 줄(또는 블록)을 “클릭 가능”하게 표시.
- 클릭 시:
  - daughter row는 별도 스타일(예: 테두리/배경)로 “선택됨” 표시.
  - 후보 row들은 하이라이트(점수에 따른 강도도 가능).
- hover 시:
  - 후보 row 위에 tooltip/popover 표시 (score + 근거 목록).
- 대용량(책 전체)에서도 스크롤이 부드럽도록 **가상 스크롤(virtualization)** 필수.

### 2.3 데이터 출력(저장) – 최소
- 최소 저장 포맷(예시):
  - `book`, `daughter_clause_atom`, `chosen_mother_clause_atom`, `timestamp`, `score_at_choice`, `notes(optional)`
- JSON Lines 또는 CSV로 export.
- (선택) 로컬 SQLite로 지속 저장.

---

## 3) BHSA(Text-Fabric) 데이터 접근 설계
### 3.1 추천 스택(안)
- **Backend**: Python + FastAPI  
- **BHSA access**: `text-fabric` + `tf.app.use('etcbc/bhsa', version='2021')` (버전은 config로)
- **Frontend**: React(typescript) + virtual list (react-window / react-virtualized)
- **Tooltip**: floating-ui / tippy.js 등 (hover latency 제어 가능)

### 3.2 BHSA에서 사용할 핵심 타입/피처(최소)
- Node types:
  - `book`, `chapter`, `verse`
  - `clause_atom`, `clause`
  - (선택) `sentence`, `sentence_atom`
  - `phrase(_atom)`, `word` (근거 계산용)
- Clause(-atom) features(자주 씀):
  - `typ` (clause(atom) type)
  - `kind` (rough clause type)
  - `rela` (relation)
  - `txt`, `domain` (text type 계열)
  - `code` (clause atom relation code)
  - `tab` (hierarchical tabulation depth)
  - `pargr` (paragraph number)
  - `number` (sequence number)
  - `dist`, `dist_unit` (distance to mother 관련)
- Edge features:
  - `mother` (핵심)

> 주의: `mother`는 Text-Fabric에서 **edge feature**이므로 `E.mother.f(node)` 형태로 접근한다.
> 값이 “집합(set)”처럼 취급되므로(0개 또는 1개가 일반적) 항상 리스트로 받는다고 가정.

### 3.3 Book 로딩 & clause_atom 정렬
- book 선택 시:
  - `bookNode = F.otype.s('book')` 중 `F.book.v(bookNode) == selectedBook`
  - `atoms = L.d(bookNode, otype='clause_atom')`
- 정렬:
  - `atoms`는 보통 TF가 canonical order로 반환하지만, 안정성을 위해 “첫 슬롯(oslot)” 기반 정렬을 권장.
  - `firstSlot = min(L.d(atom, otype='word'))` 또는 `L.d(atom, otype='word')[0]`(연속이라면)
  - 또는 `N.sortKey(atom)` 사용.
- 표시 텍스트:
  - `T.text(atom, fmt='text-orig-full')` 또는 utf8 포맷 사용.
  - row 표시에는 “본문 텍스트 + reference + typ/kind/txt” 정도를 포함.

### 3.4 DTO(프론트로 보내는 최소 필드)
각 clause_atom row:
```json
{
  "id": 123456,
  "ref": {"book":"Genesis","chapter":1,"verse":1},
  "hebrew": "בְּרֵאשִׁית ...",
  "typ": "WayX",
  "kind": "VC",
  "txt": "N",
  "pargr": "1",
  "tab": 3,
  "number": 1001,
  "firstSlot": 2010,
  "lastSlot": 2015
}
```

---

## 4) 후보 생성(candidate generation) 설계
### 4.1 후보 범위(“앞 모든 clause”의 실사용적 해석)
요구는 “daughter 앞 모든 clause 중 후보”지만, 책 전체를 항상 후보로 두면 UI/성능/인지 부하가 과도하므로 **기본 범위 + 확장 옵션**으로 설계하라.

- 기본(권장):  
  **같은 sentence 내부 + 이전 N개 clause_atom** (예: 200개)  
- 옵션:
  - 같은 verse/half_verse/paragraph(`pargr`)로 제한
  - 사용자가 슬라이더로 “후보 탐색 범위(N)” 조절
  - “전체 앞부분(책 시작까지)” 모드도 제공 가능 (하지만 기본은 제한)

### 4.2 후보 필터링(빠른 1차 필터)
candidateAtoms = atoms[0:indexOf(daughter)] 에서 다음을 만족하는 것만 남김:
- distance(절 간격)가 너무 큰 것 제외 (N limit)
- (선택) paragraph(`pargr`)가 너무 멀리 떨어지면 제외
- (선택) 텍스트 타입(`txt`)가 완전히 다른 블록이면 제외 (예: direct speech 구간/서사 구간)
- (선택) candidate의 `typ`/`kind`가 mother로 부적절한 경우 감점 또는 제외

---

## 5) 스코어링(score) & 근거(evidence) 설계
### 5.1 출력 형식
후보별로:
```json
{
  "candidateId": 111,
  "score": 0.82,
  "rank": 1,
  "evidence": [
    {"feature":"distance_clause_atoms","value":12,"weight":-0.015,"contrib":-0.18,"note":"가까울수록 유리"},
    {"feature":"same_sentence","value":true,"weight":0.20,"contrib":0.20,"note":"동일 sentence 보너스"},
    {"feature":"typ_pair_freq","value":"WayX→WayX","weight":0.12,"contrib":0.12,"note":"BHSA 관찰 빈도 기반"},
    {"feature":"lex_overlap_jaccard","value":0.33,"weight":0.30,"contrib":0.10,"note":"핵심 lexeme 겹침"}
  ]
}
```

### 5.2 “설명 가능”을 최우선
- 점수는 반드시 **특징 기여도 합**으로 설명 가능해야 한다.
- black-box 모델 금지(최소 MVP에서는).
- 구성은 단순 가중합(Weighted Sum) + sigmoid/clip 추천.

### 5.3 기본 스코어링(권장 베이스라인)
아래 3축은 BHSA 문서가 말하는 전통적인 근거와 일치한다:
1) **거리(distance)**: 가까울수록 mother 가능성 ↑  
2) **문법/어휘 대응(grammatical & lexical correspondences)**  
3) **유사 연결의 누적 빈도(earlier occurrences of similar clause connection)**

#### (A) 거리 기반
- `d = daughterIndex - candidateIndex` (clause_atom 단위 거리)
- contrib 예:
  - `-w_dist * log(1 + d)` 또는 `-w_dist * d`
- evidence에 `d`를 그대로 표시.

#### (B) 문법/어휘 대응
최소 구현(가볍고 빠름):
- `typ`/`kind` 상호호환:
  - 같은 `typ`면 보너스, 특정 조합이면 보너스/패널티
- `txt` 호환:
  - 같은 txt면 보너스
- Lexical overlap:
  - 각 clause_atom의 word lexeme 집합(예: `F.lex.v(word)`의 set) 만들어
  - `Jaccard = |A∩B| / |A∪B|`
  - contrib = `w_lex * Jaccard`
- (선택) predicate 단서:
  - daughter/candidate 각각에서 “첫 verb”의 `vt`(wayq/perf/impf 등) 비교

#### (C) 유사 연결 빈도(통계 priors)
- **BHSA의 기존 `mother` 엣지**를 “관찰 데이터”로 삼아,
  - (candidate_typ, daughter_typ, distance_bucket, txt_pair) 같은 시그니처의 등장 빈도를 집계
  - prior 점수를 만들 것 (예: log probability 또는 normalized frequency)
- 이 방식은 “학습”이라기보다 “집계 기반 휴리스틱”이라 구현이 쉽고 설명 가능하다.
- evidence에는 “이 시그니처가 BHSA에서 몇 번 관찰됨”을 표시.

> 구현 팁: book 단위로 미리 precompute 해두면 클릭 때 빠르다.
> `mother` 엣지를 따라 (daughter -> mother) 페어를 수집하고 distance를 계산해 카운트 테이블을 만든다.

### 5.4 점수 스케일
- 내부: 실수 점수(가중합)
- 출력: `sigmoid(raw)`로 0~1로 변환하거나, 0~100으로 스케일
- UI에는 “상대 순위”가 더 중요하므로 rank도 함께 제공.

---

## 6) 하이라이트/툴팁 UX 디테일
- 후보 하이라이트는 “눈에 띄되 과하지 않게”:
  - 점수 상위 K개(예: 20개)만 하이라이트하는 옵션 제공 권장
  - 또는 threshold(예: score>=0.5) 기반
- Hover tooltip 내용(최소):
  - `score`, `rank`
  - distance
  - typ/kind/txt
  - lexical overlap 수치
  - prior 빈도(있다면)
- Tooltip은 150~250ms 딜레이를 줘서 스크롤 중 과도한 팝업을 막는다.

---

## 7) 최종 선택(선택 기능) – 강력 권장
“최종선택작업” 도구라면, 사용자가 클릭/단축키로 mother를 확정할 수 있어야 실제로 쓸모가 있다.

권장 UX:
- daughter 클릭 → 후보가 하이라이트됨
- 후보 클릭 → “이 후보를 mother로 지정”
- 지정 후:
  - daughter row에 “선택된 mother”를 표시(예: 작은 라벨/아이콘)
  - 다음 daughter로 이동 단축키 제공

저장:
- `/api/selection` POST:
  - book, daughterId, motherId, score, evidence snapshot(optional), user, timestamp

내보내기:
- `/api/export?book=Genesis` → JSONL/CSV 다운로드

---

## 8) API 엔드포인트(예시)
- `GET /api/books`
- `GET /api/book/{book}/clause-atoms`
- `GET /api/book/{book}/candidates?daughterId=...&scope=...`
- `POST /api/book/{book}/selection`
- `GET /api/book/{book}/export`

---

## 9) 성능/캐싱 가이드
- Text-Fabric `use()`는 **프로세스 시작 시 1회 로드** (lazy import 금지).
- book별로 다음을 메모리에 캐시:
  - clause_atom 리스트(정렬된 배열)
  - id -> index 매핑
  - id -> basic metadata(DTO)
  - (선택) prior 카운트 테이블
- candidate 계산은 O(N_scope)로 제한하고, scope가 커질 때는 서버에서 pagination/상위K만 반환.

---

## 10) 테스트/검증 기준(acceptance criteria)
MVP 완료 기준:
1. Book 선택 후 clause_atom 리스트가 순서대로 보인다.
2. clause_atom 클릭 시, 이전 절들 중 후보들이 하이라이트된다.
3. 하이라이트된 후보에 hover 하면 score+근거가 tooltip으로 뜬다.
4. (권장) 후보 클릭으로 mother 선택이 저장되고 export된다.
5. 동일 book에서 재접속/재로딩 시 선택 결과가 유지된다(최소: 파일 저장).

---

## 11) 구현 순서(권장)
1) Backend에서 BHSA 로드 + `GET /books` + `GET /book/{book}/clause-atoms`
2) Frontend에서 book picker + virtual list 렌더 + row click 상태관리
3) `/candidates` 구현(거리 기반 + typ/txt + lex overlap) → 하이라이트/툴팁 연결
4) prior(빈도) 집계 추가
5) selection 저장 + export
6) UX 개선(검색/점프/스코프 슬라이더/단축키)

---

## 12) 확장 아이디어(선택)
- “candidate 강조 강도”를 점수에 비례하게(heatmap 느낌)
- clause(기능 단위)와 clause_atom(연속 단위) 보기 토글
- 선택 결과를 이용한 “가중치 튜닝(반자동)” 기능
- “근거”에 실제 텍스트 근거(공통 lexeme 하이라이트) 포함
- sentence/verse 경계 표시 및 빠른 이동

---

## 13) 참고(개발자가 알아야 하는 BHSA 문서 키워드)
- `mother`(edge feature), `dist`, `dist_unit`, `typ`, `kind`, `txt`, `code`, `tab`, `pargr`
- BHSA features 문서: etcbc.github.io/bhsa/features/ (필드 정의 확인)
- Text-Fabric 기본: annotation.github.io/text-fabric/
