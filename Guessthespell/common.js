// Wspólne ustawienia dla index.html i editor.html
window.GTS = (() => {
  // tier: 1 = klasyczne, 2 = mainline, 3 = foto/spin-off, 4 = bijatyki
  const GAMES = {
    EoSD: ["Embodiment of Scarlet Devil", 1], PCB: ["Perfect Cherry Blossom", 1],
    IN: ["Imperishable Night", 1], PoFV: ["Phantasmagoria of Flower View", 1],
    MoF: ["Mountain of Faith", 2], SA: ["Subterranean Animism", 2], UFO: ["Undefined Fantastic Object", 2],
    GFW: ["Great Fairy Wars", 2], TD: ["Ten Desires", 2], DDC: ["Double Dealing Character", 2],
    LoLK: ["Legacy of Lunatic Kingdom", 2], HSiFS: ["Hidden Star in Four Seasons", 2],
    WBaWC: ["Wily Beast and Weakest Creature", 2], UM: ["Unconnected Marketeers", 2],
    UDoALG: ["Unfinished Dream of All Living Ghost", 2], FW: ["Fossilized Wonders", 2] ,
    StB: ["Shoot the Bullet", 3], DS: ["Double Spoiler", 3], ISC: ["Impossible Spell Card", 3], VD: ["Violet Detector", 3],
    IaMP: ["Immaterial and Missing Power", 4], SWR: ["Scarlet Weather Rhapsody", 4], Soku: ["Hisoutensoku", 4],
    HM: ["Hopeless Masquerade", 4], ULiL: ["Urban Legend in Limbo", 4], AoCF: ["Antinomy of Common Flowers", 4],
    SFW: ["Sunken Fossil World", 4]
  };

  // Domyślne miejsca z nazwą spellcarda dla każdej gry: [x, y, szerokość, wysokość] jako ułamki obrazka.
  // Karta może nadpisać to własnym polem "mask" (pusta lista [] = bez mozaiki).
  // Ustaw je w editor.html i przepisz tutaj.
  const GAME_MASKS = {
    default: [[0, 0, 1, 0.1]],
    IaMP: [[0, 0.85, 1, 0.12]],
  };

  function masksFor(card) {
    return Array.isArray(card.mask) ? card.mask : (GAME_MASKS[card.game] || GAME_MASKS.default);
  }

  // Rysuje obrazek na canvasie i pikselizuje maski
  function renderCard(canvas, image, masks) {
    const W = image.naturalWidth, H = image.naturalHeight;
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(image, 0, 0);
    const block = Math.max(8, Math.round(W / 28));
    const tmp = document.createElement("canvas");
    const tctx = tmp.getContext("2d");
    for (const [fx, fy, fw, fh] of masks) {
      const x = Math.round(fx * W), y = Math.round(fy * H);
      const w = Math.round(fw * W), h = Math.round(fh * H);
      if (w <= 0 || h <= 0) continue;
      tmp.width = Math.max(1, Math.ceil(w / block));
      tmp.height = Math.max(1, Math.ceil(h / block));
      tctx.imageSmoothingEnabled = true;
      tctx.drawImage(image, x, y, w, h, 0, 0, tmp.width, tmp.height);
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(tmp, 0, 0, tmp.width, tmp.height, x, y, w, h);
      ctx.imageSmoothingEnabled = true;
    }
  }

  function hashStr(s) {
    let h = 2166136261;
    for (const c of s) { h ^= c.codePointAt(0); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }
  const cardId = c => hashStr(`${c.game}|${c.character}|${c.name}`).toString(36);

  return { GAMES, GAME_MASKS, masksFor, renderCard, hashStr, cardId };
})();
