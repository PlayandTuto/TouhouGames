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
// Numer łamigłówki liczony w czasie UTC: nowa łamigłówka o 00:00 UTC dla wszystkich
function dayNumber(date) {
  return Math.floor((date.getTime() - EPOCH) / 86400000) + 1;
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

// Data (dzień kalendarzowy UTC) dla numeru łamigłówki (#1 = 23.11.2026)
function dateOfDay(n) {
  const d = new Date(EPOCH + (n - 1) * 86400000);
  return new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
}
function dateKey(d) {
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
}

// Specjalna zagadka ustawiona ręcznie w special.js (jeśli jest i jest poprawna)
function specialPuzzle(n) {
  if (typeof SPECIAL === "undefined") return null;
  const sp = SPECIAL[dateKey(dateOfDay(n))];
  if (!sp) return null;
  try {
    const groups = sp.groups.map(g => {
      const base = g.cat ? CATS.find(c => c.id === g.cat) : null;
      if (g.cat && !base) throw new Error("nieznana kategoria " + g.cat);
      const cat = base ? Object.assign({}, base, g.pl ? { pl: g.pl } : {}, g.en ? { en: g.en } : {}, g.lv != null ? { lv: g.lv } : {})
                       : { id: "special" + Math.random(), lv: g.lv, pl: g.pl, en: g.en, note: !!g.note, m: g.m };
      return { cat, members: g.m.slice() };
    });
    const all = groups.flatMap(g => g.members);
    if (groups.length !== 4 || groups.some(g => g.members.length !== 4)) throw new Error("potrzeba 4 grup po 4 postacie");
    if (new Set(all).size !== 16) throw new Error("postacie się powtarzają");
    all.forEach(id => { if (!CHARS[id]) throw new Error("nieznana postać " + id); });
    if (countPartitions(all, groups.map(g => g.cat)) !== 1)
      console.warn("[special " + dateKey(dateOfDay(n)) + "] łamigłówka ma więcej niż jedno rozwiązanie!");
    return { n, groups, tiles: shuffle(all, mulberry32(n * 7 + 3)), title: sp.title || null, special: true };
  } catch (e) {
    console.error("[special " + dateKey(dateOfDay(n)) + "] " + e.message + " — używam zwykłej łamigłówki");
    return null;
  }
}

function getPuzzle(n) { return specialPuzzle(n) || generatePuzzle(n); }

if (typeof module !== "undefined") module.exports = { generatePuzzle, getPuzzle, countPartitions, dayNumber, dateOfDay, dateKey };
