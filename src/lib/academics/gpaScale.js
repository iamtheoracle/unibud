/** Nigerian 5.0 GPA scale — shared between Results and the Summary Report. */
export function pctToPoints(p) {
  if (p >= 70) return 5;
  if (p >= 60) return 4;
  if (p >= 50) return 3;
  if (p >= 45) return 2;
  if (p >= 40) return 1;
  return 0;
}

export function letter(p) {
  if (p >= 70) return "A";
  if (p >= 60) return "B";
  if (p >= 50) return "C";
  if (p >= 45) return "D";
  if (p >= 40) return "E";
  return "F";
}

export function gradePct(g) {
  if (!g || !g.max_score) return 0;
  return (g.score / g.max_score) * 100;
}

export function gpaOf(list) {
  let w = 0;
  let pts = 0;
  list.forEach((g) => {
    const unit = g.weight || 10;
    const p = gradePct(g);
    w += unit;
    pts += pctToPoints(p) * unit;
  });
  return w ? pts / w : 0;
}

export function avgPct(list) {
  if (!list.length) return 0;
  return list.reduce((s, g) => s + gradePct(g), 0) / list.length;
}