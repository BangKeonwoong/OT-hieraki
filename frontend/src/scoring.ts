export type EvidenceItem = {
  feature: string;
  value: string | number | boolean | null;
  weight: number;
  contrib: number;
  note: string;
};

export type CandidateResult = {
  candidateId: number;
  score: number;
  rank: number;
  evidence: EvidenceItem[];
};

export type ClauseAtom = {
  id: number;
  ref: { book: string; chapter: number; verse: number };
  hebrew: string;
  koreanLiteral?: string | null;
  typ?: string | null;
  kind?: string | null;
  txt?: string | null;
  pargr?: string | null;
  tab?: number | null;
  number?: number | null;
  firstSlot?: number | null;
  lastSlot?: number | null;
  sentence?: number | null;
  lexemes?: string[];
};

export type StaticBookData = {
  book: string;
  atoms: ClauseAtom[];
  priorCounts: Record<string, number>;
  priorMax: number;
};

const WEIGHTS = {
  distance: 0.55,
  same_sentence: 0.35,
  typ_match: 0.25,
  txt_match: 0.15,
  lex_overlap: 0.65,
  prior: 0.5,
};

function sigmoid(x: number) {
  if (x >= 0) {
    const z = Math.exp(-x);
    return 1 / (1 + z);
  }
  const z = Math.exp(x);
  return z / (1 + z);
}

function jaccard(a: string[] = [], b: string[] = []) {
  if (a.length === 0 && b.length === 0) return 0;
  const setA = new Set(a);
  const setB = new Set(b);
  let intersection = 0;
  for (const item of setA) {
    if (setB.has(item)) intersection += 1;
  }
  return intersection / (setA.size + setB.size - intersection);
}

function distanceBucket(distance: number) {
  if (distance <= 3) return "1-3";
  if (distance <= 10) return "4-10";
  if (distance <= 30) return "11-30";
  return ">30";
}

export function scoreCandidates(
  daughter: ClauseAtom,
  candidates: ClauseAtom[],
  priorCounts: Record<string, number>,
  priorMax: number,
  indexMap: Map<number, number>,
  daughterIndex: number
): CandidateResult[] {
  const results: CandidateResult[] = [];

  candidates.forEach((cand) => {
    const candIndex = indexMap.get(cand.id);
    const distance = candIndex == null ? 0 : Math.max(0, daughterIndex - candIndex);
    const sameSentence =
      daughter.sentence != null &&
      cand.sentence != null &&
      daughter.sentence === cand.sentence;
    const typMatch = Boolean(daughter.typ && cand.typ && daughter.typ === cand.typ);
    const txtMatch = Boolean(daughter.txt && cand.txt && daughter.txt === cand.txt);
    const lexOverlap = jaccard(daughter.lexemes, cand.lexemes);

    const sig = [
      cand.typ ?? "?",
      daughter.typ ?? "?",
      distanceBucket(distance),
      `${cand.txt ?? "?"}->${daughter.txt ?? "?"}`,
    ].join("::");

    const priorCount = priorCounts[sig] ?? 0;
    const priorNorm = priorMax ? priorCount / priorMax : 0;

    const contribs: EvidenceItem[] = [];

    const distContrib = -WEIGHTS.distance * Math.log1p(Math.max(distance, 0));
    contribs.push({
      feature: "distance_clause_atoms",
      value: distance,
      weight: -WEIGHTS.distance,
      contrib: distContrib,
      note: "가까울수록 유리",
    });

    const sentenceContrib = WEIGHTS.same_sentence * (sameSentence ? 1 : 0);
    contribs.push({
      feature: "same_sentence",
      value: sameSentence,
      weight: WEIGHTS.same_sentence,
      contrib: sentenceContrib,
      note: "같은 문장 보너스",
    });

    const typContrib = WEIGHTS.typ_match * (typMatch ? 1 : 0);
    contribs.push({
      feature: "typ_match",
      value: typMatch,
      weight: WEIGHTS.typ_match,
      contrib: typContrib,
      note: "같은 절 유형",
    });

    const txtContrib = WEIGHTS.txt_match * (txtMatch ? 1 : 0);
    contribs.push({
      feature: "txt_match",
      value: txtMatch,
      weight: WEIGHTS.txt_match,
      contrib: txtContrib,
      note: "같은 텍스트 도메인",
    });

    const lexContrib = WEIGHTS.lex_overlap * lexOverlap;
    contribs.push({
      feature: "lex_overlap_jaccard",
      value: Math.round(lexOverlap * 1000) / 1000,
      weight: WEIGHTS.lex_overlap,
      contrib: lexContrib,
      note: "어휘 겹침",
    });

    const priorContrib = WEIGHTS.prior * priorNorm;
    contribs.push({
      feature: "prior_frequency",
      value: priorCount,
      weight: WEIGHTS.prior,
      contrib: priorContrib,
      note: "유사 연결 빈도",
    });

    const rawScore = contribs.reduce((sum, item) => sum + item.contrib, 0);
    const score = sigmoid(rawScore);

    results.push({
      candidateId: cand.id,
      score,
      rank: 0,
      evidence: contribs,
    });
  });

  results.sort((a, b) => b.score - a.score);
  results.forEach((item, idx) => {
    item.rank = idx + 1;
  });

  return results;
}

export function computeCandidates(
  atoms: ClauseAtom[],
  daughterId: number,
  limit: number,
  scope: string,
  priorCounts: Record<string, number>,
  priorMax: number
) {
  const index = atoms.findIndex((atom) => atom.id === daughterId);
  if (index < 0) return [] as CandidateResult[];
  const daughter = atoms[index];
  let candidates = atoms.slice(0, index);
  if (scope === "sentence") {
    candidates = candidates.filter(
      (c) => c.sentence != null && daughter.sentence != null && c.sentence === daughter.sentence
    );
  }
  if (scope !== "all" && limit > 0) {
    candidates = candidates.slice(-limit);
  }
  const indexMap = new Map<number, number>();
  atoms.forEach((atom, idx) => indexMap.set(atom.id, idx));
  return scoreCandidates(daughter, candidates, priorCounts, priorMax, indexMap, index);
}
