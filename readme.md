# GPX Creator

Prosta aplikacja webowa do tworzenia plików GPX na podstawie punktów zaznaczanych na mapie. Bez frameworków, bez bundlera — czysty HTML, CSS i JavaScript (Vanilla JS) oparty na mapie OpenStreetMap.

## 🔗 Kluczowe funkcje

* **Klik na mapie** otwiera okienko z polem na nazwę punktu.
* **Lista punktów** w bocznym panelu, z możliwością usuwania pojedynczych wpisów.
* **Eksport do GPX** — zapis wszystkich punktów na dysku jednym kliknięciem.
* **Mapa OpenStreetMap** (Leaflet) — bez kluczy API, bez opłat.
* **Brak `node_modules`**, bundlera i live servera — wystarczy otworzyć `index.html`.

## 🏛️ Struktura projektu

- `vendor/` — biblioteki zewnętrzne (Font Awesome, Leaflet)
- `styles.css` — style aplikacji
- `script.js` — logika aplikacji
- `index.html` — plik główny
- `README.md` — dokumentacja

## 📄 Instrukcja użycia

1. **Otwórz `index.html`** w przeglądarce.
2. **Kliknij na mapie** w miejscu, które chcesz oznaczyć.
3. **Wpisz nazwę** obiektu w okienku, które się pojawi, i zatwierdź.
4. Punkt pojawi się na mapie i na liście w panelu bocznym.
5. Powtórz dla kolejnych punktów, w razie potrzeby usuwaj je przyciskiem **×**.
6. Kliknij **„Zapisz GPX”**, aby pobrać plik `trasa.gpx` na dysk.

## ⚙️ Technologie

* **HTML5 + CSS3**
* **JavaScript (ES6)**
* **Leaflet** — biblioteka do interaktywnych map
* **OpenStreetMap** — źródło kafelków mapowych

## ⏱️ Historia wersji

* **v1.2 (2026-07-08):** Dodanie kolejnych funkcjonalności.
  * Dodano ręczne sortowanie punktów metodą przeciągnij-upuść.
  * Dodano przycisk sortowania alfabetycznego listy punktów.
  * Dodano zapamiętywanie ostatniego widoku mapy.

* **v1.1 (2026-07-08):** Dodanie nowych funkcjonalności.
  * Dodano import plików GPX z możliwością wczytania punktów z dysku.
  * Dodano automatyczny zapis punktów w `localStorage`.
  * Dodano przeciąganie szerokości panelu.

* **v1.0 (2026-07-07):** Pierwsza publiczna wersja aplikacji.
  * Aplikacja do tworzenia plików GPX na bazie punktów z mapy OpenStreetMap.
  * Wersja początkowa oparta na szablonie Vanilla JS.


## ✉️ Kontakt

Pytania, sugestie lub chęć współpracy: [fikasp@gmail.com](mailto:fikasp@gmail.com).

Dziękuję za korzystanie z aplikacji!