# ETCBC(BHSA) Clause Atom 계층: 어미절/딸절 리서치 답변 모음 (3개)

> 대화에서 제가 작성한 3개의 답변을 그대로 묶어 `.md`로 정리한 파일입니다.  
> (원문 링크는 답변에 포함된 그대로 유지했습니다.)

---

## 1) ETCBC에서 clause atom을 “어미절–딸절”로 하이라키화: 상세 기준(문헌 기반)

아래는 **ETCBC(자유대/VU, Talstra 전통)에서 clause atom을 “어미절(mother)–딸절(daughter)” 관계로 계층화할 때** 문헌에 근거해 확인되는 **판별(연결) 기준**을, 실제 작업에 바로 쓰기 좋게 **규칙/체크리스트 형태로 정리**한 것입니다. (요청대로 ETCBC/BHSA 문서·논문에 근거)

---

## 1) ETCBC에서 “어미절–딸절”이 뜻하는 것 (모델 전제)

- ETCBC의 **clause (atom) relations**는 “절(=clause atom)들을 쌍으로 연결”해 **트리 구조**로 표현합니다. Talstra 모델에서는 텍스트를 **선형으로 읽는다(처음→끝, clause by clause)**고 가정하고, **새로 등장하는 절을 이전 문맥의 한 절에 연결**하되, **여러 파라미터로 ‘가장 잘 맞는’ 절**에 붙입니다. ([research.vu.nl](https://research.vu.nl/ws/portalfiles/portal/78516691/complete%2Bdissertation.pdf))  
- Kingham(ETCBC 소개 논문)은 이를 이렇게 요약합니다: ETCBC는 **독립절을 “mother”**, 그에 **의존하는 절을 “daughter”**로 부르며, “덜 실험적인” 부분은 **접속사/관계소(=relative particles)처럼 명시적으로 이전 절과 연결시키는 표지**에 의존합니다. 동시에 프로그램은 **표지가 덜 분명한 관계**도 찾는데, 예로 **동사형(verb forms)의 근접성**, **인칭/수/성(person/number/gender) 연속성**, **후보 clause type 쌍 사이의 과거 연결 빈도**를 듭니다. ([unisapressjournals.co.za](https://unisapressjournals.co.za/index.php/JSEM/article/download/2974/2884/24071))  
- BHSA(ETCBC 데이터의 Text-Fabric 배포판) 문서에서는 `mother`를 “임베딩(포함) 관계가 아닐 수도 있는” **언어적 의존성(edge)**로 설명합니다. 즉, 단순히 “종속절이 포함된다”만이 아니라, **담화/연결 의존성까지 포함하는 연결**로 이해해야 합니다. ([etcbc.github.io](https://etcbc.github.io/bhsa/features/mother/))  

---

## 2) syn04types(ETCBC clause hierarchy 작업기) 관점에서 “판별 기준”이 만들어지는 방식

ETCBC 절 계층은 원리상 “기계가 자동으로 끝내는 확정 데이터”가 아닙니다.

- Talstra 전통의 핵심은 **인터랙티브 인코딩**입니다. 프로그램이 분석안을 **proposal**로 내고, 사람이 **accept/reject/correct**합니다. 사람이 고친 결정은 **패턴 리스트에 축적**되어 이후 제안에 반영될 수 있습니다(“학습” 가능). 사용자는 때로 **의미/화용/해석적 통찰**을 판단에 활용할 수 있지만, 프로그램이 저장하는 것은 기본적으로 **형식(formal) 패턴**입니다. ([research.vu.nl](https://research.vu.nl/ws/portalfiles/portal/78516691/complete%2Bdissertation.pdf))  
- 같은 논문(=VU dissertation)에서 syn04types에 대해 명시적으로 경고합니다: syn04types는 **production tool이 아니라 laboratory tool**이고, 생성되는 계층은 **연구 가설(hypotheses)**이며 **검토·수정 대상**입니다. 또한 어떤 파라미터에 **어떤 가중치를 줄지 자체가 연구 질문**이라고 말합니다. ([research.vu.nl](https://research.vu.nl/ws/portalfiles/portal/78516691/complete%2Bdissertation.pdf))  

→ 결론: “상세 기준”은 **(a) 프로그램이 관찰·계산하는 형식 신호** + **(b) 사람이 최종 선택할 때 쓰는 규칙(및 예외 처리)**의 결합으로 문서화됩니다.

---

## 3) 문헌에 ‘공식적으로’ 열거된 syn04types 핵심 신호들 (Talstra 계열 표)

VU dissertation의 Table 4.1(“Talstra: Formal observations”) 마지막 줄은 **clause hierarchy(=mother–daughter 연결)에서 syn04types가 사용하는 대표 신호**를 항목으로 박아 둡니다. 그대로 옮기면 핵심은 다음입니다. ([research.vu.nl](https://research.vu.nl/ws/portalfiles/portal/78516691/complete%2Bdissertation.pdf))  

### A. 절 유형(Clause types) 조합
- **mother(M)와 daughter(D)의 clause type** 조합 자체가 중요한 신호입니다. ([research.vu.nl](https://research.vu.nl/ws/portalfiles/portal/78516691/complete%2Bdissertation.pdf))  
  - 작업적으로는: 딸절의 `typ`(clause atom type)과 후보 어미절의 `typ`를 보며, “자주 붙는 조합/드문 조합”을 감안해 선택합니다(이 빈도는 프로그램이 누적). ([etcbc.github.io](https://etcbc.github.io/bhsa/features/mother/))  

### B. 명시적 주어(explicit subject)의 유무
- **명시적 주어가 있느냐 없느냐**가 연결 결정에 들어갑니다. ([research.vu.nl](https://research.vu.nl/ws/portalfiles/portal/78516691/complete%2Bdissertation.pdf))  
  - 이게 왜 중요하냐면, BHSA `instruction` 문서에 따르면 “행위자(actor) 집합 변화”가 단락/하위단락 시작과 연관될 수 있고, 이는 계층 분절(새 단위 시작) 판단에 영향을 주기 때문입니다. ([etcbc.github.io](https://etcbc.github.io/bhsa/features/instruction/))  

### C. 인칭/수/성(p/n/g) 일치·불일치
- **서술어(predicate)의 p/n/g (불)일치** ([research.vu.nl](https://research.vu.nl/ws/portalfiles/portal/78516691/complete%2Bdissertation.pdf))  
- **다른 요소들의 p/n/g (불)일치** ([research.vu.nl](https://research.vu.nl/ws/portalfiles/portal/78516691/complete%2Bdissertation.pdf))  
  - 작업적으로는: 후보 어미절과 딸절 사이에 **형태론적 congruence(일치)**가 강하면 “같은 참여자/같은 흐름”으로 묶일 가능성이 커집니다. (syn04types의 파라미터 묶음에도 “morphological congruence”가 직접 언급됩니다.) ([research.vu.nl](https://research.vu.nl/ws/portalfiles/portal/78516691/complete%2Bdissertation.pdf))  

### D. 절-수준 접속 표지의 유무(clauses level conjunctions)
- **절 수준 접속사/연결표지 존재 여부**가 핵심 신호입니다. ([research.vu.nl](https://research.vu.nl/ws/portalfiles/portal/78516691/complete%2Bdissertation.pdf))  
  - Kingham도 “덜 실험적인 부분은 접속사/관계소처럼 이전 절을 명시적으로 가리키는 표지에 의존”한다고 말합니다. ([unisapressjournals.co.za](https://unisapressjournals.co.za/index.php/JSEM/article/download/2974/2884/24071))  

### E. M–D 구성성분 관계 표지(“constituent relation” markers)
- **딸절이 어미절의 구성성분(목적어/주어/부사어 등)**로 기능한다는 표지들이 중요합니다. Table 4.1은 예로 **infinitive construct** 등을 직접 듭니다. ([research.vu.nl](https://research.vu.nl/ws/portalfiles/portal/78516691/complete%2Bdissertation.pdf))  

### F. 의사소통 영역(communicational domains) 표지
- **인용동사(quotation verbs), 담화 표지(discursive markers), 거시-통사 신호(macro-syntactic signals)** 같은 것들이 “도메인(예: 직접화법/서술)”을 바꾸는 신호로 취급됩니다. ([research.vu.nl](https://research.vu.nl/ws/portalfiles/portal/78516691/complete%2Bdissertation.pdf))  
  - BHSA `code=999`(direct speech) 설명이 바로 이 축입니다(아래 5절). ([etcbc.github.io](https://etcbc.github.io/bhsa/features/code/))  

### G. 특정 패턴(ellipsis, idiom 등)
- **생략(ellipsis), 관용/고정 패턴(idiom)** 같은 특수 패턴도 신호로 포함됩니다. ([research.vu.nl](https://research.vu.nl/ws/portalfiles/portal/78516691/complete%2Bdissertation.pdf))  
  - BHSA `code` 체계의 “defective clause atoms(220–223)”가 사실상 “서술어가 다른 atom에 있다/없다” 같은 생략·결손 케이스를 다루는 쪽입니다. ([etcbc.github.io](https://etcbc.github.io/bhsa/features/code/))  

---

## 4) “후보 어미절”을 어떻게 고르는가: 문서에 명시된 랭킹 기준 3종

BHSA `mother` 문서는 sy04types의 핵심을 매우 실무적으로 요약합니다. ([etcbc.github.io](https://etcbc.github.io/bhsa/features/mother/))  

1) **문법적·어휘적 대응(grammatical & lexical correspondences)**  
2) **비슷한 연결의 과거 출현 빈도(earlier occurrences of similar connection)**  
3) **거리(distance; clause atoms 단위)**  

그리고 최종 결정은 **분석자(사람)**가 합니다. 결정 결과는 계층 표시에서 **들여쓰기(tabulation)**로 정리되며, 들여쓰기 레벨이 **평행/종속 관계**를 반영한다고 설명합니다. ([etcbc.github.io](https://etcbc.github.io/bhsa/features/mother/))  

거리(`dist`)는 BHSA에서 “현재 객체와 그 mother 사이의 거리”로 정의되며, `dist_unit`이 무엇이냐에 따라 측정 방식이 달라집니다(절-원자면 clause_atom 단위). ([etcbc.github.io](https://etcbc.github.io/bhsa/features/dist/))  

---

## 5) “딸절로 판별되는” 대표 유형들: `code`(CARC) 체계가 제공하는 판별 규칙

ETCBC/BHSA에는 딸절 유형을 아주 구체적으로 분류하는 **clause atom relation code**가 있습니다. 이 코드는 “기능(function) 확정”이라기보다 **분포(distributional) 기반의 가설적 분류**(lexeme 그룹화)라는 점도 문서에 명시됩니다. ([etcbc.github.io](https://etcbc.github.io/bhsa/features/code/))  

아래는 문서에 적힌 “해당 코드가 붙는 조건(=딸절 판별 신호)”입니다.

### 5.1 Relative clause atoms (10–16)
- 조건: 딸절 atom의 “opening phrase(첫 구)”가 **`typ=CP`(conjunctive phrase)** 이고 **`function=Rela`(relative)** 인 경우.  
- 두 번째 자릿수: 딸절의 **서술어 시제/형(tense table)**. ([etcbc.github.io](https://etcbc.github.io/bhsa/features/code/))  

→ 실무: **관계절 표지(typ/function)**가 잡히면 그 atom은 높은 확률로 **딸절**이며, mother는 “그 관계절이 수식/의존하는” 앞 문맥 절로 잡힙니다(대개 바로 앞 또는 해당 명사구를 포함한 절).  

### 5.2 Infinitive construct clause atoms (50–74)
- 조건: 딸절의 **verbal predicate가 infinitive construct**인 경우.  
- (code-50)의 값이 전치사 클래스(예: `>L`, `B`, `K`, `L` 등)를 가리킵니다. ([etcbc.github.io](https://etcbc.github.io/bhsa/features/code/))  

→ 실무: inf.cstr이 “부사적/목적적 구성성분”으로 작동하면, 그걸 포함/지배하는 절이 mother가 되는 경향이 강합니다(=Table 4.1의 “constituent relation markers”). ([research.vu.nl](https://research.vu.nl/ws/portalfiles/portal/78516691/complete%2Bdissertation.pdf))  

### 5.3 Asyndetic clause atoms (100–167)
- 조건: **접속사 없이(asyndetic)** 이어진 구조.  
- 2·3번째 자릿수: 딸절/어미절의 서술어 tense. ([etcbc.github.io](https://etcbc.github.io/bhsa/features/code/))  

→ 실무 핵심: “asyndetic인데 어디에 붙이냐”가 어려운 케이스가 많은데, 아래 6절의 ‘rules of thumb’가 바로 이 문제를 다룹니다. ([research.vu.nl](https://research.vu.nl/ws/portalfiles/portal/78516691/complete%2Bdissertation.pdf))  

### 5.4 Parallel clause atoms (200–201)
- 조건: 두 atom이 **주어 존재 여부가 같고**, **서술어 전까지의 구(phrases)가 대응**하며, **딸절이 종속(subordinated)이 아니어야** “parallel”로 봅니다.  
- predicate가 없으면 둘은 같은 `typ`여야 합니다.  
- `200`: 동일 opening / `201`: coordinating conjunction을 무시하면 동일 opening. ([etcbc.github.io](https://etcbc.github.io/bhsa/features/code/))  

→ 실무: “평행”은 종속이 아니라 **병렬/대구**를 표시하는 강한 힌트입니다(그래서 들여쓰기(tab)에서도 평행을 따로 반영한다고 설명). ([etcbc.github.io](https://etcbc.github.io/bhsa/features/mother/))  

### 5.5 Defective clause atoms (220–223)
- 조건: 한 atom이 “절의 서술어(또는 핵심)”를 갖지 못하고, **다른 atom에 서술어가 들어 있는 경우**.  
- 220/221/222/223은 서술어 부재/위치에 따른 하위 분류. ([etcbc.github.io](https://etcbc.github.io/bhsa/features/code/))  

→ 실무: 결손/생략이 보이면 딸절이 어미절의 일부로 “의존”하도록 붙는 경우가 많습니다(특히 시·대구에서).  

### 5.6 Conjunctive adverbs (300–367)
- 조건: 기본은 asyndetic이지만 **conjunctive adverb**가 있는 경우.  
- 2·3번째 자릿수: 딸절/어미절 tense. ([etcbc.github.io](https://etcbc.github.io/bhsa/features/code/))  

### 5.7 Coordinate / Postulational / Conditional / Temporal / Final / Causal (400–967)
- 공통 조건: “clause opening conjunction phrase”에 들어 있는 접속(전치) 요소가 **어느 클래스(400/500/600/700/800/900)에 속하느냐**로 분류합니다.  
- 공통 규칙: 2·3번째 자릿수로 딸절/어미절 tense를 표시. ([etcbc.github.io](https://etcbc.github.io/bhsa/features/code/))  

→ 실무: “접속사가 있으면” 대체로 딸절은 그 접속이 **이어 가는/조건·시간·목적·이유를 제공하는** mother에 붙습니다(다만 ‘coordinate’는 종속이 아니라 병렬일 수 있음).

### 5.8 Direct speech (999)
- `999`는 “이 clause atom이 직접화법 구간을 시작한다”는 표지입니다.  
- 보통은 **verbum dicendi(말하다 동사)**가 있는 도입 절이 있고, 직접화법의 “메인” 딸절이 **`instruction=q`**를 가지며, 그 딸절이 도입 절을 mother로 하여 `999` 관계를 맺습니다.  
- 하지만 도입이 없거나(예: 이사야 14:16), 도입이 “내포절”에 있는 경우(예: 말라기 3:17)도 있어서, `q`와 `999`가 항상 1:1로 붙지는 않는다고 문서가 경고합니다. 그래서 `999`는 “직접화법 선언(declaration)”으로 해석을 확장하자고 제안합니다. ([etcbc.github.io](https://etcbc.github.io/bhsa/features/code/))  

---

## 6) 실제 주석 작업용 “판별 체크리스트” (문헌의 신호들을 작업 순서로 재정렬)

여기부터는 위 문헌의 항목들을 **실제 라벨링/연결 선택 프로시저**로 재구성한 것입니다. “ETCBC가 문서로 밝힌 신호들”을 **결정 순서**로만 정리합니다(가중치 자체는 연구 중이라고 문서가 말합니다). ([research.vu.nl](https://research.vu.nl/ws/portalfiles/portal/78516691/complete%2Bdissertation.pdf))  

### 6.1 1차: “명시적 표지” 먼저 잡아라
1) **관계절(typ=CP, function=Rela)** → 딸절로 거의 확정 ([etcbc.github.io](https://etcbc.github.io/bhsa/features/code/))  
2) **infinitive construct**(서술어가 inf.cstr) → 딸절 후보 강함 ([etcbc.github.io](https://etcbc.github.io/bhsa/features/code/))  
3) **직접화법 시작(instruction=q, code=999 패턴)** → direct speech 도메인 시작점으로 처리 ([etcbc.github.io](https://etcbc.github.io/bhsa/features/code/))  
4) **절-수준 접속사/접속 구문(conjunction phrase)** 존재 → 그 접속이 무엇을 “이어가는지/조건·시간·목적·이유를 제공하는지” 기준으로 mother 후보를 좁힌다 ([research.vu.nl](https://research.vu.nl/ws/portalfiles/portal/78516691/complete%2Bdissertation.pdf))  

### 6.2 2차: 딸절 “유형(code 그룹)”을 정하면 mother 선택이 쉬워진다
- “asyndetic냐 / conjunctive adverb냐 / coordinate냐 / conditional(600)냐 …”를 **code 체계로 먼저 분류**하면, 그 다음은 **어느 절을 이어가거나 수식하는지**로 mother를 고르는 문제로 축소됩니다. ([etcbc.github.io](https://etcbc.github.io/bhsa/features/code/))  

### 6.3 3차: mother 후보를 고르는 핵심 신호 (Talstra 표 + 랭킹 기준)
문헌이 명시한 신호를 “우선순위 힌트”로 쓰면 아래처럼 정리됩니다.

- **형태론적 일치/연속성(p/n/g)**: 서술어·핵심 요소의 인칭/수/성 일치가 강한 후보를 우선 고려 ([research.vu.nl](https://research.vu.nl/ws/portalfiles/portal/78516691/complete%2Bdissertation.pdf))  
- **명시적 주어/행위자 변화**: 새 주어(또는 actor set 변화)는 “새 단위 시작” 가능성 ↑ → 바로 앞 절에 단순히 붙이기보다 상위 단위/루트 처리를 검토 ([research.vu.nl](https://research.vu.nl/ws/portalfiles/portal/78516691/complete%2Bdissertation.pdf))  
- **절 유형(clause type) 조합/동사형 근접성**: clause type·verb form의 “근접/유사”가 높으면 연결 가능성 ↑ ([research.vu.nl](https://research.vu.nl/ws/portalfiles/portal/78516691/complete%2Bdissertation.pdf))  
- **참여자 참조/대명사 선행사**: 대명사 참조가 있으면 선행사를 가진 절(또는 동일 참조를 가진 절)에 붙이는 경향(아래 6.4의 rules of thumb에도 직접 언급) ([research.vu.nl](https://research.vu.nl/ws/portalfiles/portal/78516691/complete%2Bdissertation.pdf))  
- **어휘 반복/키워드 반복**: lexical repetitions가 강하면 같은 단위로 묶일 가능성 ↑ ([research.vu.nl](https://research.vu.nl/ws/portalfiles/portal/78516691/complete%2Bdissertation.pdf))  
- **거리(dist)**: 다른 신호가 비슷하면 **더 가까운 절**을 mother로 두는 방향이 문서상 랭킹 기준에 포함 ([etcbc.github.io](https://etcbc.github.io/bhsa/features/mother/))  
- **과거 빈도(학습된 패턴)**: “이 clause type 쌍은 과거에 이렇게 연결된 적이 많다”가 확률에 반영됨 ([etcbc.github.io](https://etcbc.github.io/bhsa/features/mother/))  

### 6.4 (중요) 문헌에 실제로 제시된 “Rules of thumb” (매우 실무적)
같은 VU dissertation(특히 애가 Lamentations 재분석)에서는, syn04types 작업 중 나온 **실무 규칙**을 “rules of thumb”로 정리합니다(예외 많고 완전하지 않다고 본문이 직접 경고). 그중 mother–daughter 판별에 바로 쓰이는 핵심만 추리면: ([research.vu.nl](https://research.vu.nl/ws/portalfiles/portal/78516691/complete%2Bdissertation.pdf))  

- **(일반)** 절은 보통 “언어적으로 의존”하거나 “흐름을 계속”하는 이전 절에 연결된다. ([research.vu.nl](https://research.vu.nl/ws/portalfiles/portal/78516691/complete%2Bdissertation.pdf))  
- **(구성성분)** 어떤 절이 다른 절의 구성성분(목적어/주어/부사어 등)이면 그 절에 연결한다. ([research.vu.nl](https://research.vu.nl/ws/portalfiles/portal/78516691/complete%2Bdissertation.pdf))  
- **(접속사)** clause-level conjunction이 있으면, 그 절은 “이어가는” 절에 연결된다. ([research.vu.nl](https://research.vu.nl/ws/portalfiles/portal/78516691/complete%2Bdissertation.pdf))  
- **(asyndesis)** asyndetic 절은 asyndetic 절에 붙는 경향이 있고, 접속사 있는 절에 붙는 경우는 드물다고 관찰한다. ([research.vu.nl](https://research.vu.nl/ws/portalfiles/portal/78516691/complete%2Bdissertation.pdf))  
- **(담화성/현저성)** clause type의 담화적 성격(더 “discursive”한가/덜한가)이 단위 형성에 영향을 주며, shift는 종결/새 시작/부연 등 기능을 가질 수 있다(단, 일반 규칙은 어렵다고 말함). ([research.vu.nl](https://research.vu.nl/ws/portalfiles/portal/78516691/complete%2Bdissertation.pdf))  
- **(참여자)** 참여자를 주어로 (재)도입하면 새 단위 시작 신호가 되며, 대명사 참조는 선행사/동일 참조를 가진 절에 연결하는 경향이 있다. ([research.vu.nl](https://research.vu.nl/ws/portalfiles/portal/78516691/complete%2Bdissertation.pdf))  

그리고 표시 규칙으로 **“원칙적으로 mother는 ‘같거나 더 얕은 들여쓰기’에서 가장 가까운 앞 절”**로 잡는다는 디폴트가 제시됩니다(표시/디스플레이 규칙이지만, 모호할 때의 기본값으로 쓸 수 있음). ([research.vu.nl](https://research.vu.nl/ws/portalfiles/portal/78516691/complete%2Bdissertation.pdf))  

---

## 7) 당신 작업에 바로 적용하는 요약(한 장짜리)

문헌 기반으로 “어미절/딸절 판별”을 **결정 트리**로 압축하면 이렇게 쓰면 됩니다.

1. **딸절 확정 표지부터 찾기**  
   - Rela(관계절), inf.cstr, direct speech(q/999), clause-level conjunction 존재 여부. ([etcbc.github.io](https://etcbc.github.io/bhsa/features/code/))  
2. **딸절 유형(code 그룹) 분류**  
   - asyndetic/coordinate/conditional/temporal/final/causal/parallel/defective 등. ([etcbc.github.io](https://etcbc.github.io/bhsa/features/code/))  
3. **mother 후보를 좁히는 신호**  
   - p/n/g 일치, 명시적 주어(행위자 변화), clause type/verb form 근접, 대명사 선행사, 어휘 반복. ([research.vu.nl](https://research.vu.nl/ws/portalfiles/portal/78516691/complete%2Bdissertation.pdf))  
4. **동률이면**  
   - 가까운 것(dist), 과거 패턴(빈도) 쪽(=프로그램 랭킹의 핵심 요소). ([etcbc.github.io](https://etcbc.github.io/bhsa/features/mother/))  
5. **끝으로 기억할 것**  
   - syn04types/ETCBC clause hierarchy는 “확정 데이터”가 아니라 **지속적으로 개선되는 연구 가설**이며, 특히 시문학에서는 오차가 더 늘 수 있다고 문서가 분명히 말합니다. ([research.vu.nl](https://research.vu.nl/ws/portalfiles/portal/78516691/complete%2Bdissertation.pdf))  

---

원하면, 지금 정리한 기준을 당신이 쓰는 **ETCBC/BHSA feature 조합(typ/function/mother/code/dist/tab/instruction)** 기준으로 “주석 가이드 문서(규칙 번호+예외 처리)” 형태로 더 압축해서, 팀이 일관되게 적용할 수 있는 **annotation policy**로도 재구성해 줄 수 있어요.

---

## 2) 어미절/딸절 정의(이론) + 실제 데이터 예시 포함

ETCBC의 **어미절(mother)** / **딸절(daughter)**은 “절의 종류 이름”이라기보다, **clause(혹은 clause atom) 사이에 설정된 ‘방향성 있는 의존(anchoring) 관계’에서의 역할**을 가리키는 용어입니다. (즉, *어미/딸은 관계(role)이고, 한 절이 상황에 따라 어미이기도 하고 딸이기도* 합니다.) ([unisapressjournals.co.za](https://unisapressjournals.co.za/index.php/JSEM/article/download/2974/2884/24071))

## 1) 어미절(= mother)의 정의

ETCBC의 clause relations(= clause atom relations) 계층에서 **어미절**은:

- **독립절(independent clause)**로 취급되는 절(또는 clause atom)이고,  
- 다른 절(또는 clause atom)이 **거기에 “매달려(anchored)” 종속(dependent)되도록 기준점이 되는 절**입니다.  
- 데이터적으로는, 딸절이 갖는 **`mother`(edge) 관계가 “가리키는 대상(타깃)”**이 어미절입니다. 즉, 방향은 **딸 → 어미**입니다. ([unisapressjournals.co.za](https://unisapressjournals.co.za/index.php/JSEM/article/download/2974/2884/24071))

또 하나 중요한 점: ETCBC의 `mother`는 “반드시 구조적으로 안에 포함(embedding)된다”는 뜻이 아니라, **embedding 관계가 없어도 성립하는 ‘언어학적 의존 관계’**입니다. (그래서 겉보기 배열만으로 ‘포함/비포함’을 단정하면 틀릴 수 있습니다.) ([etcbc.github.io](https://etcbc.github.io/bhsa/features/mother/))

## 2) 딸절(= daughter)의 정의

ETCBC의 clause relations 계층에서 **딸절**은:

- **종속절(dependent clause)**로 취급되는 절(또는 clause atom)이고,
- 어떤 어미절에 **“연결되어(anchored) 의존하는 절”**입니다.
- 데이터적으로는, 어떤 단위(object)가 `mother` 관계를 가진다면 **그 object가 딸(daughter)**이고, 그 `mother`가 가리키는 대상이 **어미(mother)**입니다. (ETCBC 문서가 관계를 설명할 때도 “object(daughter)와 its mother 사이의 관계”라고 명시합니다.) ([etcbc.github.io](https://etcbc.github.io/bhsa/features/rela/))

## 3) “절”이 아니라 “clause atom”인 이유(정의가 실무에 중요한 지점)

ETCBC는 문장이 다른 절에 의해 끊기거나 끼어드는(embedding) 경우를 처리하기 위해 **distributional unit인 “atom”**을 도입했고, 그 중 절 단위는 **clause atom**입니다. 예를 들어 Gen 3:11의 구조처럼 *주절 덩어리 사이에 אשר절/לבלתי절이 끼어드는* 상황에서는, 절을 한 덩어리로 보기 어렵기 때문에 **1~4의 ‘부분’을 clause atoms로 먼저 등록**합니다. ([unisapressjournals.co.za](https://unisapressjournals.co.za/index.php/JSEM/article/download/2974/2884/24071))

이걸 전제로, “어미/딸”은 **완성된 기능적 절(clause)만**이 아니라, **clause atom들 사이에서도** 설정됩니다(= clause atom relations). ([unisapressjournals.co.za](https://unisapressjournals.co.za/index.php/JSEM/article/download/2974/2884/24071))

---

# 실제 데이터 기반 예시 3개

아래 예시는 “성경 본문 + ETCBC 문서가 직접 언급한 구조/코드”를 사용해서, 어미/딸 관계가 무엇을 뜻하는지 *실제처럼* 보여주는 방식입니다.

## 예시 A) Gen 3:11 — 삽입(embedding) 때문에 clause atom이 필요해지는 경우

Kingham & van Peursen(ETCBC 관련 개요 논문)에서 Gen 3:11을 다음처럼 “부분(= clause atoms)”으로 분해합니다: ([unisapressjournals.co.za](https://unisapressjournals.co.za/index.php/JSEM/article/download/2974/2884/24071))

1. **המן העץ**  
2. **אשר צויתיך**  
3. **לבלתי אכל ממנו**  
4. **אכלת**

이 장면을 어미/딸로 이해하면(논문 설명에 근거한 자연스러운 해석):

- (1)+(4) = **바깥의 ‘포괄(주)절’** → 계층에서 **어미 역할**
- 2 = **אשר-절(관계절/종속절)** → (1)+(4)에 **딸로 매달림**
- 3 = **לבלתי-절(2 안에 또 삽입된 종속절)** → 2에 대해 **딸**(즉, “딸절이면서 동시에 더 작은 딸을 거느릴 수도 있음”)  

핵심은 이겁니다:  
**딸절은 ‘어미절의 일부’로 *포함*될 수도 있지만, ETCBC의 mother/daughter는 ‘포함’보다 더 일반적인 ‘의존/연결’ 개념**으로 쓰입니다. ([etcbc.github.io](https://etcbc.github.io/bhsa/features/mother/))

## 예시 B) 직접화법 — “말하다(verb. dicendi)” 도입절(어미) + 인용절(딸)

BHSA feature 문서 `code=999` 설명이 어미/딸을 아주 노골적으로 정의합니다. 요지는:

- 직접화법 구간은 보통 “말하다”류 동사가 있는 **도입 clause atom**으로 시작함  
- 그 다음의 **직접화법 본문(인용) clause atom**은 도입절에 **의존**함  
- 이때 **직접화법 본문 clause atom이 딸절**, 도입절이 **어미절**이고,
- 딸절(직접화법 본문)은 instruction `q`를 가지며, **어미와의 관계 코드가 999**로 기록된다고 설명합니다. ([etcbc.github.io](https://etcbc.github.io/bhsa/features/code/))

또한 예외(실데이터)도 문서가 직접 지정합니다:

- **Isaiah 14:16**: 직접화법이 “도입절 없이” 시작되는 경우  
- **Malachi 3:17**: “embedded clause atom이 선언(declare) 역할을 하면서” 직접화법이 설정되는 경우  
→ 이런 경우엔 ‘직접화법 본문 딸절’이 항상 999로 어미에 매이는 방식이 깨질 수 있다고 설명합니다. ([etcbc.github.io](https://etcbc.github.io/bhsa/features/code/))

정리하면, 직접화법에서의 어미/딸은 실무적으로 이렇게 잡습니다:

- 어미절(도입): “말하다/대답하다” 등 발화 도입 역할
- 딸절(인용): 실제 발화 내용(직접화법 구간의 main clause atom)

## 예시 C) Gen 3:1 — “인용 속 인용”이 텍스트 타입에 그대로 찍히는 경우

CTT 문서(ETCBC/CTT)는 Gen 3:1의 한 절을 예로 들며,

- `L> T>KLW M-KL <Y H-GN`  
- 이 clause가 **“narrative 안에서 quotation 안의 quotation”** 이라서  
- text type이 **`NQQ`** 로 표기된다고 말합니다. ([github.com](https://github.com/ETCBC/CTT))

이 한 줄이 어미/딸과 연결되는 실무 포인트:

- `NQQ`는 “인용(Q)이 한 번이 아니라 **두 겹**”이라는 뜻이고,  
- 따라서 최소한 한 인용절은 다른 인용절에 **종속(딸)**되어 “인용 속 인용” 구조를 이룹니다.
- 즉, 여기서는 **바깥 인용절이 어미**, **안쪽 인용절이 딸**(또는 그 반대 방향으로 어떤 기준점을 잡아야 하는지) 같은 계층 결정을 반드시 요구합니다. ([github.com](https://github.com/ETCBC/CTT))

---

# 데이터에서 어미/딸이 “어떻게 보이는가” (CTT 기준으로 바로 연결)

네가 “clause atom을 어미/딸로 하이라키화”하는 작업을 한다면, CTT 설명이 가장 직결됩니다.

- **Field 3 = 딸 clause atom의 type**  
- **Field 4 = 어미에 대한 표시**  
  - 예: 어미 clause atom type(`WayX`)  
  - 또는 `[Q]` (어미가 직접화법을 도입)  
  - 또는 `[R]` (root: 최상위—이 atom은 계층의 루트) ([github.com](https://github.com/ETCBC/CTT))

즉, ETCBC의 “어미절/딸절”은 결국:

- **(딸 clause atom) —(mother 관계)→ (어미 clause atom)**  
- 이 방향성을 중심으로, 계층(tree)을 구성하는 것입니다. ([etcbc.github.io](https://etcbc.github.io/bhsa/features/mother/))

---

## 3) 분석자가 “후보 어미절” 중 최종 결정을 내리는 기준

정정부터 해야 해. **“후보 어미절을 분석자가 직접 만든다”**라기보다는,

- **syn04types가** 각 clause atom(딸절)에 대해 **가능한 어미절 후보를 1개 이상 “제안(proposal)”하고, 확률순으로 랭킹**한다.
- **분석자는 그 “제안된 후보들” 중에서** 어느 연결이 가장 타당한지 **최종 선택**(accept / reject+correct)한다. ([etcbc.github.io](https://etcbc.github.io/bhsa/features/mother/))

그럼 “분석자는 어떤 기준으로 최종 결정하느냐?”에 대해, 문서에 근거해서 **결정 기준(=휴리스틱/판정 규칙 + 동률 깨기 규칙)**을 정리하면 아래야.

---

## 1) 최종 결정의 목표가 뭔가

분석자가 하는 최종 결정은 한 마디로:

> **“이 딸절은 앞 문맥의 어떤 절(또는 절-단위)과 가장 강하게 ‘언어적으로 의존(dependent)’하거나 ‘담화적으로 계속(continue)’되는가?”를 1개로 확정**하는 것

문서에서 “일반적으로 한 절은 자신이 어떤 방식으로 의존하거나 계속하는 다른 절에 연결된다”가 규칙 1번으로 명시돼. ([research.vu.nl](https://research.vu.nl/ws/portalfiles/portal/78516691/complete%2Bdissertation.pdf))

그리고 Talstra 모델에서 절 계층은 **선형 읽기(앞에서 뒤로)**를 모사해서, **새 절이 생길 때마다 앞 문맥의 어떤 절 하나에 ‘가장 잘 매칭되는’ 방식으로 연결**되도록 설계돼. ([research.vu.nl](https://research.vu.nl/ws/portalfiles/portal/78516691/complete%2Bdissertation.pdf))

---

## 2) “분석자가 최종 결정을 내릴 때” 쓰는 기준 묶음

문헌에는 크게 두 층이 있어:

- (A) syn04types가 실제로 계산할 때 보는 **형식 신호(formal observations / parameters)**  
- (B) 분석자가 그 신호를 “실제 연결 선택”으로 바꿀 때 쓰는 **rules of thumb(휴리스틱)**

둘 다가 최종 결정에 들어간다고 보면 돼.

---

### A. syn04types가(=후보 생성/랭킹에) 쓰는 핵심 형식 신호들

Talstra 절 계층(=mother–daughter) 레벨에서 “가장 중요한 신호”로 문서에 명시된 항목들이 있어. ([research.vu.nl](https://research.vu.nl/ws/portalfiles/portal/78516691/complete%2Bdissertation.pdf))  
(분석자도 결국 같은 신호를 보고 판단하는 게 일관성이 좋아.)

1) **어미/딸 절유형(clause type) 조합** ([research.vu.nl](https://research.vu.nl/ws/portalfiles/portal/78516691/complete%2Bdissertation.pdf))  
2) **명시적 주어(explicit subject) 존재/부재** ([research.vu.nl](https://research.vu.nl/ws/portalfiles/portal/78516691/complete%2Bdissertation.pdf))  
3) **서술어의 인칭/수/성(p/n/g) (불)일치** ([research.vu.nl](https://research.vu.nl/ws/portalfiles/portal/78516691/complete%2Bdissertation.pdf))  
4) **다른 요소들의 p/n/g (불)일치** ([research.vu.nl](https://research.vu.nl/ws/portalfiles/portal/78516691/complete%2Bdissertation.pdf))  
5) **절-수준 접속사(clause-level conjunction) 존재/부재** ([research.vu.nl](https://research.vu.nl/ws/portalfiles/portal/78516691/complete%2Bdissertation.pdf))  
6) **“구성성분 관계(constituent relation)” 표지**(예: inf.cstr 등) ([research.vu.nl](https://research.vu.nl/ws/portalfiles/portal/78516691/complete%2Bdissertation.pdf))  
7) **커뮤니케이션 도메인 표지**(인용동사, 담화표지, 거시-통사 신호 등) ([research.vu.nl](https://research.vu.nl/ws/portalfiles/portal/78516691/complete%2Bdissertation.pdf))  
8) **특정 패턴**(생략, 관용 등) ([research.vu.nl](https://research.vu.nl/ws/portalfiles/portal/78516691/complete%2Bdissertation.pdf))  

그리고 별도로, syn04types가 고려하는 파라미터 묶음을 더 크게 요약한 문장이 있는데, 이게 “분석자가 동률 깨기 할 때” 그대로 쓰는 체크리스트가 된다:

- **morphological congruence**, **syndesis/asyndesis**, **(조합된) clause types**, **participant references 패턴**, **lexical repetition**, **distance** 등 ([research.vu.nl](https://research.vu.nl/ws/portalfiles/portal/78516691/complete%2Bdissertation.pdf))

---

### B. 분석자가 최종 선택할 때 적용하는 “Rules of thumb” (문헌에 명시)

이건 “실제 사람이 어떤 논리로 mother를 확정하는지”를 가장 직접적으로 적어 놓은 부분이야. 다만 문서 자체가 **완전 규칙이 아니라 ‘rules of thumb’**이고 예외가 많다고 경고한다. ([research.vu.nl](https://research.vu.nl/ws/portalfiles/portal/78516691/complete%2Bdissertation.pdf))

#### B1) 일반 원칙(텍스트 단위/구조 처리)

1. **의존/계속되는 곳에 붙인다** ([research.vu.nl](https://research.vu.nl/ws/portalfiles/portal/78516691/complete%2Bdissertation.pdf))  
2. 어떤 절이 “개별 절”이 아니라 **‘텍스트 단위(unit)’ 전체에 연결되는 게 맞는 경우**, 그 단위의 **첫 절에 연결한다** ([research.vu.nl](https://research.vu.nl/ws/portalfiles/portal/78516691/complete%2Bdissertation.pdf))  
3. **큰 단위를 닫는(closing) 절**(앞과 다른 변주로 단위 종결을 표지)는 **그 단위 전체**에 연결한다(=그 단위 첫 절로 연결) ([research.vu.nl](https://research.vu.nl/ws/portalfiles/portal/78516691/complete%2Bdissertation.pdf))  
4. **독립 단위가 다른 단위 안에 삽입(embedded)**되면, 그것은 **최상위 들여쓰기**로 “치워 놓고”, 그 삽입 단위의 첫 절은 **root(어미 없음)**로 둬서 **삽입 바깥 문맥과 연결하지 않는다** ([research.vu.nl](https://research.vu.nl/ws/portalfiles/portal/78516691/complete%2Bdissertation.pdf))  

→ 이 4번이 특히 중요해. 많은 사람이 “무조건 앞 절에 매달기”로 가다가 여기서 깨져.

#### B2) 통사 규칙(연결을 강제하는 쪽)

1. 딸절이 다른 절의 **구성성분(object/subject/adjunct 등)**이면, **그 절이 어미** ([research.vu.nl](https://research.vu.nl/ws/portalfiles/portal/78516691/complete%2Bdissertation.pdf))  
2. 딸절에 **절-수준 접속사**가 있으면, 그 절은 **‘계속하는’ 절**에 연결 ([research.vu.nl](https://research.vu.nl/ws/portalfiles/portal/78516691/complete%2Bdissertation.pdf))  
3. **asyndetic(무접속) 절은 asyndetic 절에 붙는 경향**, 접속사 절에 붙는 건 드물다 ([research.vu.nl](https://research.vu.nl/ws/portalfiles/portal/78516691/complete%2Bdissertation.pdf))  
4. **절유형(clause type) / discursiveness·salience(담화성·현저성) 변화**가 단위 형성에 영향  
   - 같은 담화성의 절들이 큰 단위를 만들기 쉽고  
   - 더 담화적인 쪽으로의 shift는 종종 **종결/새 시작** 신호  
   - 반대 shift는 **부연/도입** 신호가 되기도 함  
   - 단, 일반 규칙은 어렵고 전체 담화 구조에 의존 ([research.vu.nl](https://research.vu.nl/ws/portalfiles/portal/78516691/complete%2Bdissertation.pdf))  

#### B3) 참여자(주어/대명사) 규칙

1. **참여자(인물)를 주어로 (재)도입**하면 **새 단위 시작** 신호(대명사도 재도입이지만 더 약함) ([research.vu.nl](https://research.vu.nl/ws/portalfiles/portal/78516691/complete%2Bdissertation.pdf))  
2. **대명사 참조(pronominal references)**가 있으면, 그 절은 **선행사(antecedent)가 있는 절** 또는 **같은 참조를 가진 절**에 연결 ([research.vu.nl](https://research.vu.nl/ws/portalfiles/portal/78516691/complete%2Bdissertation.pdf))  
3. 위 두 규칙이 합쳐지면 “주 참여자에 매인 2차 참여자 하위도메인”이 생길 수 있음 ([research.vu.nl](https://research.vu.nl/ws/portalfiles/portal/78516691/complete%2Bdissertation.pdf))  
4. 선행사-대명사 매칭은 **절 단독이 아니라 mother–daughter가 만드는 ‘단위 전체’**를 보고 판단 ([research.vu.nl](https://research.vu.nl/ws/portalfiles/portal/78516691/complete%2Bdissertation.pdf))  

#### B4) (특히 시문학에서) 운율/연(행) 경계 규칙

- 2콜론 운율의 힘이 강해서 A-colon 절은 B-colon 절보다 **앞 verseline 전체에 붙는 경향** ([research.vu.nl](https://research.vu.nl/ws/portalfiles/portal/78516691/complete%2Bdissertation.pdf))  
- **strophe 경계가 통사적 break**인 경우가 많고, enjambment는 드물며 보통 clause보다 큰 단위에서 일어남 ([research.vu.nl](https://research.vu.nl/ws/portalfiles/portal/78516691/complete%2Bdissertation.pdf))  
- acrostic이 구조를 꼬아 놓는 곳에서는 **순수 통사 논증의 힘이 약해지고**, **운율 구조의 가중치가 올라갈 수 있다** ([research.vu.nl](https://research.vu.nl/ws/portalfiles/portal/78516691/complete%2Bdissertation.pdf))  

---

## 3) 동률(애매)일 때 무엇으로 결론을 내리나: “랭킹 기준” 3종

BHSA 문서는 syn04types의 후보 랭킹(확률순 정렬)이 무엇을 근거로 하는지 딱 3개로 요약해 줘:

1) **문법적 + 어휘적 대응(grammatical/lexical correspondences)**  
2) **비슷한 연결이 과거에 얼마나 자주 나왔는가(earlier occurrences)**  
3) **거리(distance; clause atoms 단위)** ([etcbc.github.io](https://etcbc.github.io/bhsa/features/mother/))  

그리고 “결국 최종 결정은 분석자”라고 못 박는다. ([etcbc.github.io](https://etcbc.github.io/bhsa/features/mother/))

즉 실무적으로는:

- 1차: 위 B의 강제 규칙(구성성분/접속/참여자/경계 등)으로 걸러서  
- 2차: 남은 후보들 중에서 위 3개(대응성·빈도·거리)로 **동률을 깬다**  
이게 가장 안정적이야.

---

## 4) “실제 데이터”에서 분석자가 이렇게 결정한다: 문헌에 나온 실제 수정 사례

### 사례 1) “명시적 주어 + 연(연결) 경계”가 syn04types 제안을 뒤집 نشان 경우 (애가 2:7)

문서에서 애가 2:7의 한 연결을 예로 들면서 이렇게 말해:

- **딸절에 명시적 주어(Adonay)**가 등장하면, 앞의 “주어 없는 절”과의 단순 연결은 부적절해 보인다(=syn04types의 흔한 oversight). ([research.vu.nl](https://research.vu.nl/ws/portalfiles/portal/78516691/complete%2Bdissertation.pdf))  
- 그런데 “그럼 어디에 붙이냐?”에서, 단순히 바로 앞(25–26)도 가능해 보이지만,  
- **새 strophe 시작(아크로스틱 표지)**이 더 큰 break를 시사하므로, 더 앞의 strophe 시작 절(18)을 **더 좋은 mother 후보로 선택**한다. ([research.vu.nl](https://research.vu.nl/ws/portalfiles/portal/78516691/complete%2Bdissertation.pdf))  

즉 여기서 분석자는 이렇게 판단한 거야:

- **형식 신호**: 명시적 주어, 절유형(0QtX), referent 동일성(YHWH/Adonay) ([research.vu.nl](https://research.vu.nl/ws/portalfiles/portal/78516691/complete%2Bdissertation.pdf))  
- **운율/구조 신호**: strophe 경계(아크로스틱) ([research.vu.nl](https://research.vu.nl/ws/portalfiles/portal/78516691/complete%2Bdissertation.pdf))  
- 결론: “가까움”보다 “단위 경계”가 더 강한 신호라고 보고 mother를 더 위로 올림.

### 사례 2) “참여자 재도입/대명사 선행사”로 연결을 확정하는 경우 (애가 1:4b–cA 언급)

rules of thumb 자체가 애가 1:4b–cA를 예로 든다:

- **대명사/접미사로 Zion에 대해 3f.sg로 모든 참여자를 정의**하는 구간에서,  
- 참여자 규칙(대명사 참조는 선행사 절에 연결)을 통해 “같은 referential subdomain”으로 묶는 판단을 한다. ([research.vu.nl](https://research.vu.nl/ws/portalfiles/portal/78516691/complete%2Bdissertation.pdf))  

### 사례 3) “삽입된 독립 단위는 root 처리” (애가 1:9c)

문서가 규칙으로 못 박고 예시도 준다:

- **독립 단위가 다른 단위 안에 삽입**되면  
- 그 삽입 단위의 첫 절은 **root clause(어미 없음)**로 둬서 **바깥 문맥과 연결하지 않는다**  
- 예시로 **Lam 1:9c**를 든다. ([research.vu.nl](https://research.vu.nl/ws/portalfiles/portal/78516691/complete%2Bdissertation.pdf))  

---

## 5) 결정이 기록되는 방식(실무적으로 중요한 포인트)

분석자의 최종 결정을 데이터에 반영하면, BHSA 문서 기준으로는:

- 선택된 연결은 **들여쓰기(tabulation/indentation)**로 나타나고  
- 그 들여쓰기 레벨이 **평행(parallel) vs 종속(dependent) 관계**를 반영한다. ([etcbc.github.io](https://etcbc.github.io/bhsa/features/mother/))  

또한 예시 디스플레이 규칙으로,

- “원칙적으로 mother는 **같거나 더 얕은 들여쓰기에서 가장 가까운 앞 절**”로 잡히는 형태로 표기된다고 설명한다. (이건 **표시 규칙**이지만, 사람이 계층을 읽고 점검할 때 기본값 역할을 함) ([research.vu.nl](https://research.vu.nl/ws/portalfiles/portal/78516691/complete%2Bdissertation.pdf))  

---

## 6) 네 작업에 바로 쓸 “최종 결정 체크리스트” (문헌 기반)

1) **이 딸절이 ‘독립 삽입 단위’의 시작인가?** → root(어미 없음) 고려  
2) **구성성분 관계인가?** → 맞으면 그 절이 mother  
3) **절-수준 접속사/도메인 표지가 있나?** → “어느 절을 계속하는지”로 mother 결정  
4) **asyndetic vs syndetic 성격은?** → asyndetic이면 asyndetic 쪽으로 붙이는 기본값  
5) **참여자 재도입/대명사 선행사 규칙 적용**  
6) **절유형 shift + (시문학이면) strophe/운율 경계**  
7) **동률 깨기: 대응성·빈도·거리** ([etcbc.github.io](https://etcbc.github.io/bhsa/features/mother/))

---
