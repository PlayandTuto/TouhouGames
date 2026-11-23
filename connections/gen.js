// Deterministyczny generator dziennej łamigłówki
const EPOCH = Date.UTC(2026, 10, 23); // #1 = 23.11.2026
 
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function shuffle(arr, rnd) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function dayNumber(date) {
  const utc = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  return Math.round((utc - EPOCH) / 86400000) + 1;
}
 
// Ile jest podziałów 16 postaci na 4 wybrane kategorie po 4 osoby?
function countPartitions(chars, cats) {
  const fits = chars.map(c => cats.map(k => k.m.includes(c)));
  const cnt = [0, 0, 0, 0];
  let total = 0;
  (function rec(i) {
    if (total > 1) return;
    if (i === chars.length) { total++; return; }
    for (let k = 0; k < 4; k++) {
      if (fits[i][k] && cnt[k] < 4) { cnt[k]++; rec(i + 1); cnt[k]--; }
    }
  })(0);
  return total;
}
 
function generatePuzzle(n) {
  const rnd = mulberry32(n * 2654435761 + 12345);
  // każdy poziom ma własny cykl kategorii, więc kategorie nie powtarzają się co chwilę
  const order = [0, 1, 2, 3].map(l => {
    const list = CATS.filter(c => c.lv === l);
    const L = list.length, cycle = Math.floor((n - 1) / L);
    const perm = shuffle(list, mulberry32(cycle * 7919 + l * 104729 + 1));
    return { perm, idx: (n - 1) % L, L };
  });
  for (let attempt = 0; attempt < 4000; attempt++) {
    // co 40 nieudanych prób przesuń jedną z kategorii dalej w cyklu
    const block = Math.floor(attempt / 40), off = [0, 0, 0, 0];
    if (block > 0) off[(block - 1) % 4] = Math.floor((block - 1) / 4) + 1;
    const cats = order.map((o, l) => o.perm[(o.idx + off[l]) % o.L]);
    const used = new Set();
    const groups = [];
    let ok = true;
    for (const cat of cats) {
      const pool = shuffle(cat.m.filter(id => !used.has(id)), rnd);
      if (pool.length < 4) { ok = false; break; }
      const pick = pool.slice(0, 4);
      pick.forEach(id => used.add(id));
      groups.push({ cat, members: pick });
    }
    if (!ok) continue;
    const all = groups.flatMap(g => g.members);
    if (countPartitions(all, cats) !== 1) continue;
    // preferuj dni z co najmniej jednym fałszywym tropem
    const herrings = all.filter(id => cats.filter(k => k.m.includes(id)).length > 1).length;
    if (herrings === 0 && attempt % 40 < 30) continue;
    return { n, groups, tiles: shuffle(all, rnd) };
  }
  throw new Error("Nie udało się wygenerować łamigłówki " + n);
}
 
if (typeof module !== "undefined") module.exports = { generatePuzzle, countPartitions, dayNumber };
 
