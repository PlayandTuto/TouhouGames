// Touhou Connections — zagadki ustawione ręcznie na konkretne daty
// Klucz: data "RRRR-MM-DD". Taka zagadka zastępuje automatyczną tylko w ten jeden dzień,
// pozostałe dni się nie zmieniają.
//
// Każda grupa to albo istniejąca kategoria z data.js:
//   { cat: "sdm", m: ["remilia","flandre","sakuya","patchouli"] }
// albo własna kategoria tylko na ten dzień:
//   { lv: 0, pl: "Polska nazwa", en: "English name", m: ["id1","id2","id3","id4"] }
// lv = kolor: 0 żółty, 1 zielony, 2 niebieski, 3 fioletowy. note: true pokaże zapis japoński.
// Opcjonalny title wyświetla się pod nagłówkiem.
//
// Przy własnych kategoriach sam pilnujesz, żeby nikt z pozostałych 12 postaci do nich nie pasował
// (dla kategorii z data.js gra sprawdza to sama i ostrzega w konsoli).
 
const SPECIAL = {
   "2026-12-24": {
     title: { pl: "Wigilijna łamigłówka 🎄", en: "Christmas Eve puzzle 🎄" },
     groups: [
       { cat: "fairies", m: ["cirno","daiyousei","lily","clownpiece"] },
       { lv: 1, pl: "Bambusowy Las Zagubienia", en: "Bamboo Forest of the Lost", m: ["mokou","kagerou","tewi","reisen"] },
       { cat: "sisters", m: ["satori","koishi","remilia","flandre"] },
       { cat: "musicians", lv: 2, m: ["lunasa","merlin","lyrica","mystia"] },
     ],
   },
};
