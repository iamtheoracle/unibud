export function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function seededShuffle(arr, seed) {
  if (!arr || !arr.length) return [];
  const r = mulberry32(seed || 1);
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function gradeQuestion(q, answer) {
  if (q.type === "mcq" || q.type === "true_false") {
    return String(answer ?? "") === String(q.correct_answer ?? "");
  }
  return null;
}

export function computeScore(questions, answersMap) {
  let earned = 0, total = 0, graded = 0, pending = 0;
  for (const q of questions || []) {
    const m = Number(q.marks) || 1;
    total += m;
    const a = answersMap ? answersMap[q.id] : undefined;
    if (q.type === "mcq" || q.type === "true_false") {
      graded++;
      if (String(a ?? "") === String(q.correct_answer ?? "")) earned += m;
    } else {
      pending++;
    }
  }
  return { earned, total, percent: total ? Math.round((earned / total) * 100) : 0, graded, pending };
}