(function () {
  const STORAGE_KEYS = globalThis.STORAGE_KEYS || {
    customFoods: "nutrition-kun::custom-foods",
    customRecipes: "nutrition-kun::custom-recipes",
    weeklyMenus: "nutrition-kun::weekly-menus",
    goals: "nutrition-kun::goals",
    settings: "nutrition-kun::settings"
  };
  globalThis.STORAGE_KEYS = STORAGE_KEYS;
  const state = globalThis.state;
  const elements = globalThis.elements;
  if (!state || !elements) return;
  state.recipeMasterMode = state.recipeMasterMode || "view";
  state.recipeMasterDraft = state.recipeMasterDraft || null;
  state.recipeMasterDraftError = state.recipeMasterDraftError || "";
  state.recipeMasterAiLoading = Boolean(state.recipeMasterAiLoading);
  STORAGE_KEYS.customRecipeOverrides = STORAGE_KEYS.customRecipeOverrides || "nutrition-kun::custom-recipe-overrides";
  STORAGE_KEYS.hiddenDefaultRecipeIds = STORAGE_KEYS.hiddenDefaultRecipeIds || "nutrition-kun::hidden-default-recipe-ids";
  STORAGE_KEYS.aiApiKey = STORAGE_KEYS.aiApiKey || "nutrition-kun::ai-api-key";
  state.customRecipeOverrides = state.customRecipeOverrides && typeof state.customRecipeOverrides === "object" && !Array.isArray(state.customRecipeOverrides)
    ? state.customRecipeOverrides
    : loadStorage(STORAGE_KEYS.customRecipeOverrides, {});
  state.hiddenDefaultRecipeIds = Array.isArray(state.hiddenDefaultRecipeIds)
    ? state.hiddenDefaultRecipeIds
    : loadStorage(STORAGE_KEYS.hiddenDefaultRecipeIds, []);
  const EXTRA_STYLE = `
    .catalog-stats { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:12px; }
    .catalog-panel .section-head {
      margin-bottom:10px;
    }
    .catalog-panel .section-kicker {
      margin-bottom:2px;
    }
    .catalog-stats--compact {
      gap:8px;
    }
    .catalog-stats--compact .metric-card {
      padding:12px 14px;
      min-height:auto;
    }
    .catalog-stats--compact .metric-card span {
      margin-bottom:3px;
    }
    .catalog-stats--compact .metric-card strong {
      line-height:1.1;
    }
      .recipe-master-filter-bar { display:flex; flex-wrap:wrap; align-items:center; gap:8px; margin-bottom:14px; }
      .recipe-master-filter-actions { margin-left:auto; display:flex; align-items:center; }
      .recipe-master-add-button.is-added {
        background:rgba(104, 146, 88, 0.22);
        border-color:rgba(104, 146, 88, 0.44);
        color:#47603b;
      }
      .recipe-master-add-button.is-exists {
        background:rgba(201, 105, 43, 0.18);
        border-color:rgba(201, 105, 43, 0.38);
        color:#7a431d;
      }
    .recipe-master-filter-button.is-active {
      background:rgba(201, 105, 43, 0.14);
      border-color:rgba(201, 105, 43, 0.34);
      color:#8a4e24;
      box-shadow:none;
    }
    .recipe-master-filter-search {
      margin-left:4px;
      flex:0 1 240px;
      min-width:180px;
    }
    .recipe-master-search-input {
      width:100%;
      padding:9px 13px;
      border-radius:999px;
      border:1px solid rgba(201, 105, 43, 0.18);
      background:rgba(255, 255, 255, 0.82);
      color:#5a483d;
      font:inherit;
      line-height:1.2;
      outline:none;
    }
    .recipe-master-search-input:focus {
      border-color:rgba(201, 105, 43, 0.34);
      box-shadow:0 0 0 3px rgba(201, 105, 43, 0.08);
    }
    .recipe-master-form-grid {
      display:grid;
      grid-template-columns:repeat(2, minmax(0, 1fr));
      gap:12px;
    }
    .recipe-master-form-grid .field {
      min-width:0;
    }
    .recipe-master-form-grid .field.is-full {
      grid-column:1 / -1;
    }
    .recipe-master-form-error {
      margin:0;
      color:#9b3b2d;
      font-size:0.92rem;
      line-height:1.45;
    }
    .recipe-master-form-actions {
      display:flex;
      justify-content:flex-end;
      gap:10px;
    }
    .recipe-master-section-title {
      grid-column:1 / -1;
      margin:2px 0 -4px;
      font-size:0.88rem;
      font-weight:700;
      color:#6f533e;
    }
    .recipe-master-part-section {
      grid-column:1 / -1;
      display:grid;
      gap:8px;
    }
    .recipe-master-part-head {
      display:flex;
      align-items:center;
      justify-content:space-between;
      gap:10px;
    }
    .recipe-master-part-grid {
      display:grid;
      gap:8px;
    }
    .recipe-master-part-row {
      display:grid;
      grid-template-columns:minmax(0, 1fr) 92px auto;
      gap:8px;
    }
    .recipe-master-part-row input {
      min-width:0;
    }
    .recipe-master-part-add,
    .recipe-master-part-remove {
      padding-inline:12px;
      white-space:nowrap;
    }
    .recipe-master-ai-row {
      display:flex;
      align-items:center;
      justify-content:space-between;
      gap:10px;
      margin-bottom:12px;
    }
    .recipe-master-ai-note {
      margin:0;
      font-size:0.88rem;
      line-height:1.45;
      color:#7b6253;
    }
    .recipe-master-ai-button.is-loading {
      background:rgba(201, 105, 43, 0.18);
      border-color:rgba(201, 105, 43, 0.38);
      color:#8a4e24;
      box-shadow:none;
    }
    .recipe-nutrition-section {
      padding:12px 14px;
      border:1px solid rgba(162, 108, 86, 0.14);
      border-radius:16px;
      background:rgba(255, 255, 255, 0.72);
    }
    .recipe-nutrition-section h4 {
      margin:0 0 8px;
    }
    .recipe-nutrition-list {
      display:grid;
      grid-template-columns:repeat(2, minmax(0, 1fr));
      gap:6px 14px;
    }
    .recipe-nutrition-item {
      display:flex;
      align-items:baseline;
      justify-content:space-between;
      gap:10px;
      font-size:0.92rem;
      line-height:1.4;
      color:#5a483d;
    }
    .recipe-nutrition-item strong {
      color:#2f2621;
      font-size:0.92rem;
      white-space:nowrap;
    }
    .recipe-ingredient-section {
      display:grid;
      gap:8px;
    }
    .recipe-ingredient-section h4 {
      margin:0;
    }
    .recipe-ingredient-table {
      width:100%;
      border-collapse:collapse;
    }
    .recipe-ingredient-table td {
      padding:8px 0;
      border-top:1px solid rgba(162, 108, 86, 0.12);
      vertical-align:top;
    }
    .recipe-ingredient-table tr:first-child td {
      border-top:none;
    }
    .recipe-ingredient-group {
      display:grid;
      gap:4px;
    }
    .recipe-ingredient-group + .recipe-ingredient-group {
      margin-top:4px;
    }
    .recipe-ingredient-group h5 {
      margin:0;
      font-size:0.8rem;
      color:#8b786f;
    }
    .recipe-ingredient-group-title {
      display:inline-flex;
      align-items:center;
      width:fit-content;
      padding:3px 10px;
      border:1px solid rgba(162, 108, 86, 0.22);
      border-radius:999px;
      background:rgba(201, 105, 43, 0.08);
      color:#6f533e;
      font-weight:700;
      letter-spacing:0.03em;
    }
    .recipe-ingredient-main {
      display:grid;
      gap:4px;
    }
    .recipe-ingredient-amount {
      width:72px;
      text-align:right;
      white-space:nowrap;
      color:#3f2b1e;
      font-weight:700;
    }
    .recipe-master-detail-actions {
      display:flex;
      justify-content:flex-end;
      gap:10px;
      margin-top:14px;
    }
    #admin-view > .admin-settings-panel {
      padding:18px 20px;
    }
    #admin-view > .admin-settings-panel .section-head {
      gap:10px;
      margin-bottom:8px;
    }
    #admin-view > .admin-settings-panel .toolbar {
      gap:8px 10px;
      align-items:flex-end;
    }
    #admin-view > .admin-settings-panel .field {
      gap:5px;
    }
    #admin-view > .admin-settings-panel .field span {
      font-size:0.88rem;
    }
    #admin-view > .admin-settings-panel input {
      padding:10px 12px;
    }
    #admin-view > .admin-settings-panel .button {
      padding:10px 14px;
    }
    #admin-view > .admin-settings-panel .print-note {
      margin-top:8px;
      font-size:0.88rem;
      line-height:1.45;
    }
    #admin-view .weekly-editor-head {
      align-items:flex-start;
      flex-wrap:wrap;
      gap:16px 20px;
    }
    #admin-view .weekly-editor-settings {
      margin-left:auto;
      flex:1 1 560px;
      min-width:280px;
      display:grid;
      gap:8px;
    }
    #admin-view .weekly-editor-settings .toolbar {
      gap:8px 10px;
      align-items:flex-end;
      justify-content:flex-end;
    }
    #admin-view .weekly-editor-settings .field {
      gap:5px;
      min-width:140px;
    }
    #admin-view .weekly-editor-settings .field span {
      font-size:0.88rem;
    }
    #admin-view .weekly-editor-settings input {
      padding:10px 12px;
    }
    #admin-view .weekly-editor-settings .button {
      padding:10px 14px;
    }
    #admin-view .weekly-editor-settings .button.is-generating {
      background:#b8642d;
      border-color:#b8642d;
      box-shadow:none;
    }
    #admin-view .weekly-editor-settings .print-note {
      margin:0;
      font-size:0.88rem;
      line-height:1.45;
      text-align:right;
    }
    #admin-view .weekly-editor-panel {
      padding:18px 16px;
    }
    #admin-view .weekly-editor-panel .section-head {
      align-items:flex-start;
      gap:16px 20px;
      margin-bottom:16px;
    }
    #admin-view .weekly-editor-scroll {
      overflow-x:visible;
      padding-bottom:0;
    }
    #admin-view .weekly-editor-card-grid {
      display:grid;
      grid-template-columns:repeat(auto-fit, minmax(220px, 1fr));
      gap:12px;
      align-items:start;
      width:100%;
    }
    #admin-view .weekly-editor-day-card {
      display:grid;
      gap:12px;
      min-height:100%;
      padding:16px;
    }
    #admin-view .weekly-editor-day-head {
      display:grid;
      gap:12px;
    }
    #admin-view .weekly-editor-day-meta {
      display:flex;
      align-items:flex-start;
      justify-content:space-between;
      gap:10px;
    }
    #admin-view .weekly-editor-day-meta h3 {
      margin:4px 0 0;
      font-size:1.2rem;
      line-height:1.2;
    }
    #admin-view .weekly-editor-mode-pill {
      align-self:flex-start;
    }
    #admin-view .weekly-editor-mode-field {
      gap:6px;
    }
    #admin-view .weekly-editor-mode-field select {
      padding:10px 12px;
    }
    #admin-view .weekly-editor-card-body {
      display:grid;
      gap:12px;
    }
    #admin-view .weekly-editor-card-section {
      display:grid;
      gap:10px;
      padding:12px;
      border-radius:18px;
      background:rgba(255,255,255,0.56);
      border:1px solid rgba(164,124,92,0.12);
    }
    #admin-view .weekly-editor-save-button {
      padding:8px 12px;
    }
    #admin-view .weekly-editor-day-actions {
      display:flex;
      align-items:center;
      gap:8px;
      flex-wrap:wrap;
    }
    #admin-view .weekly-editor-shuffle-button {
      padding:8px 12px;
    }
    #admin-view .weekly-editor-save-button.is-saving-day {
      background:rgba(201, 105, 43, 0.16);
      border-color:rgba(201, 105, 43, 0.42);
      color:#8a4e24;
      box-shadow:none;
    }
    #admin-view .weekly-editor-card-section.is-hidden {
      display:none;
    }
    #admin-view .weekly-editor-section-title {
      margin:0;
      font-size:0.86rem;
      font-weight:800;
      letter-spacing:0.06em;
      color:#8b654c;
    }
    #admin-view .weekly-editor-fields {
      display:grid;
      gap:10px;
    }
    #admin-view .weekly-editor-card-section .field {
      gap:5px;
    }
    #admin-view .weekly-editor-card-section .field span {
      font-size:0.86rem;
    }
    #admin-view .weekly-editor-card-section select,
    #admin-view .weekly-editor-card-section textarea {
      padding:10px 12px;
    }
    #admin-view .weekly-editor-card-section textarea {
      min-height:88px;
    }
    #admin-view .weekly-editor-card-section select:has(option:checked:not([value=""])) {
      background:rgba(248, 238, 226, 0.96);
      border-color:rgba(201, 105, 43, 0.32);
      color:#5a473a;
    }
    .detail-grid > .recipe-list { gap:9px; }
    .detail-grid > .recipe-list .recipe-master-cuisine-group {
      display:grid;
      gap:9px;
    }
    .detail-grid > .recipe-list .recipe-master-cuisine-heading {
      margin:2px 2px 0;
      font-size:0.84rem;
      font-weight:800;
      letter-spacing:0.08em;
      color:#8b654c;
    }
    .detail-grid > .recipe-list .recipe-card {
      padding:12px 13px;
      min-height:0;
    }
    .detail-grid > .recipe-list .recipe-card .sub-head { gap:10px; }
    .detail-grid > .recipe-list .recipe-card .sub-head > div {
      display:flex;
      align-items:center;
      gap:8px;
      min-width:0;
      flex-wrap:wrap;
    }
    .detail-grid > .recipe-list .recipe-card h3 {
      margin:0;
      line-height:1.25;
    }
    .detail-grid > .recipe-list .recipe-card .tag {
      padding:4px 8px;
      font-size:0.76rem;
      line-height:1.2;
      white-space:nowrap;
    }
    .detail-grid > .recipe-list .recipe-card .pill {
      padding:4px 8px;
      font-size:0.76rem;
      white-space:nowrap;
    }
    .detail-grid > .recipe-list .recipe-card .muted {
      margin:6px 0 0;
      line-height:1.45;
    }
    .resident-friendly-panel .section-head { align-items:flex-start; }
    .resident-friendly-panel .section-note { max-width:36rem; }
    .resident-menu-table .resident-day-head { text-align:center; background:linear-gradient(180deg, rgba(245,226,228,0.9), rgba(255,247,238,0.92)); }
    .resident-day-date { display:block; font-size:1rem; font-weight:700; }
    .resident-day-weekday { display:block; margin-top:2px; font-size:0.92rem; color:#7b5c4a; }
    .resident-day-nutrition { display:flex; justify-content:center; gap:6px; flex-wrap:wrap; margin-top:8px; }
    .resident-nutrition-chip { display:inline-flex; align-items:center; justify-content:center; padding:4px 8px; border-radius:999px; font-size:0.76rem; font-weight:700; line-height:1.2; white-space:nowrap; border:1px solid rgba(162,108,86,0.12); }
    .resident-nutrition-chip.energy { background:rgba(255,236,207,0.92); color:#915f12; }
    .resident-nutrition-chip.salt { background:rgba(225,242,232,0.92); color:#35654b; }
    .resident-page-note.is-friendly { margin-top:8px; font-size:0.92rem; color:#7a6353; }
    .resident-season-strip { display:flex; justify-content:flex-end; margin-top:8px; padding-top:4px; min-height:46px; }
    .resident-season-strip svg { width:160px; height:auto; opacity:0.92; }
    .resident-season-strip text { font-family:"Yu Gothic","Hiragino Kaku Gothic ProN",sans-serif; }
    .kitchen-day-table { width:100%; table-layout:fixed; border-collapse:collapse; }
    .kitchen-day-table th, .kitchen-day-table td { border:1px solid rgba(56,43,28,0.14); padding:6px 7px; text-align:left; vertical-align:top; font-size:0.88rem; }
    .kitchen-day-table th { background:rgba(201,105,43,0.08); font-weight:700; }
    .kitchen-day-table th:nth-child(1), .kitchen-day-table td:nth-child(1) { width:13%; }
    .kitchen-day-table th:nth-child(2), .kitchen-day-table td:nth-child(2) { width:14%; }
    .kitchen-day-table th:nth-child(3), .kitchen-day-table td:nth-child(3) { width:10%; }
    .kitchen-day-table th:nth-child(4), .kitchen-day-table td:nth-child(4) { width:22%; }
    .kitchen-day-table th:nth-child(5), .kitchen-day-table td:nth-child(5) { width:18%; }
    .kitchen-day-table th:nth-child(6), .kitchen-day-table td:nth-child(6) { width:15%; }
    .kitchen-day-table th:nth-child(7), .kitchen-day-table td:nth-child(7) { width:8%; }
    .part-lines { display:grid; gap:4px; }
    .part-lines span { display:block; }
    .kitchen-page-stack { display:grid; gap:12px; }
    .weekly-grid .check-grid {
      display:none;
      grid-template-columns:minmax(0, 1fr);
      gap:10px;
    }
    .weekly-grid .check-card,
    .weekly-grid .check-card span,
    .weekly-grid .check-card strong,
    .weekly-grid .check-card p {
      writing-mode:horizontal-tb !important;
      text-orientation:mixed !important;
    }
    .weekly-grid .check-card {
      display:flex;
      flex-direction:column;
      align-items:flex-start;
      justify-content:flex-start;
      gap:4px;
      min-height:unset;
      padding:10px 12px;
      line-height:1.4;
      border-color:transparent;
      box-shadow:none;
    }
    .weekly-grid .check-card span,
    .weekly-grid .check-card strong,
    .weekly-grid .check-card p {
      display:block;
      width:100%;
      white-space:normal;
      word-break:normal;
      line-height:1.4;
    }
    @media (max-width:1120px) { .catalog-stats { grid-template-columns:1fr; } }
    @media print {
      @page { size:A4 portrait; margin:7mm; }
      .kitchen-day-sheet.panel { padding:6mm 5.5mm !important; min-height:282mm; }
      .kitchen-day-table th, .kitchen-day-table td { padding:4px 5px; font-size:8.2pt; }
      .kitchen-page-stack { gap:8px; }
      .kitchen-day-sheet .section-head { gap:8px; margin-bottom:2px; }
      .kitchen-day-sheet h2, .kitchen-day-sheet h3, .kitchen-day-sheet h4 { margin-bottom:4px; }
      .kitchen-day-sheet .kitchen-day-meta,
      .kitchen-day-sheet .metrics-grid,
      .kitchen-day-sheet .check-grid { gap:8px; }
      .kitchen-day-sheet .metric-card,
      .kitchen-day-sheet .check-card { padding:8px; }
      .kitchen-day-sheet .kitchen-summary-table th,
      .kitchen-day-sheet .kitchen-summary-table td { padding:4px 5px; font-size:8.2pt; }
      .kitchen-day-sheet .part-lines { gap:2px; }
      .kitchen-day-sheet .muted,
      .kitchen-day-sheet .print-note,
      .kitchen-day-sheet .section-note { font-size:8.6pt; line-height:1.35; }
      .resident-friendly-panel .section-head { margin-bottom:4px; }
      .resident-day-date { font-size:10.6pt; }
      .resident-day-weekday { font-size:8.7pt; }
      .resident-day-nutrition { gap:4px; margin-top:6px; }
      .resident-nutrition-chip { padding:3px 6px; font-size:7.6pt; }
      .resident-page-note.is-friendly { margin-top:5px; font-size:8.5pt; }
      .resident-season-strip { margin-top:4px; min-height:34px; }
      .resident-season-strip svg { width:120px; }
    }
  `;
  const style = document.createElement('style');
  style.textContent = EXTRA_STYLE;
  document.head.append(style);

  const CUISINES = ["和食", "洋食", "中華"];
  const CATEGORY_KEYS = ["主食", "汁物", "主菜", "副菜", "デザート", "単品料理"];
  const METRIC_META = [
    { key: "energy", label: "エネルギー", unit: "kcal", digits: 0 },
    { key: "protein", label: "たんぱく質", unit: "g", digits: 1 },
    { key: "fat", label: "脂質", unit: "g", digits: 1 },
    { key: "carbs", label: "炭水化物", unit: "g", digits: 1 },
    { key: "fiber", label: "食物繊維", unit: "g", digits: 1 },
    { key: "salt", label: "食塩相当量", unit: "g", digits: 1 }
  ];
  const EXPANDED_FOODS = [
    food("rice", "ごはん", 156, 2.5, 0.3, 37.1, 0.3, 0.0),
    food("soft_rice", "軟飯", 120, 2.0, 0.2, 28.5, 0.2, 0.0),
    food("bread", "食パン", 248, 8.9, 4.1, 46.7, 2.3, 1.3),
    food("roll_bread", "ロールパン", 309, 9.7, 9.0, 47.1, 2.0, 1.2),
    food("milk_bread", "ミルクパン", 280, 8.7, 6.1, 47.5, 1.9, 0.9),
    food("udon", "ゆでうどん", 105, 2.6, 0.4, 21.6, 1.0, 0.1),
    food("chinese_noodles", "中華めん", 149, 4.9, 0.7, 31.3, 1.3, 0.2),
    food("pasta", "ゆでパスタ", 150, 5.8, 0.9, 29.8, 1.8, 0.0),
    food("white_fish", "白身魚", 108, 22.3, 1.2, 0.1, 0.0, 0.1),
    food("salmon", "鮭", 124, 22.3, 4.1, 0.1, 0.0, 0.1),
    food("mackerel", "さば", 211, 20.7, 16.8, 0.2, 0.0, 0.1),
    food("chicken_thigh", "鶏もも肉", 190, 16.6, 14.2, 0.0, 0.0, 0.1),
    food("chicken_breast", "鶏むね肉", 133, 24.4, 1.9, 0.0, 0.0, 0.1),
    food("pork_lean", "豚もも肉", 183, 20.5, 10.2, 0.2, 0.0, 0.1),
    food("beef_mince", "合いびき肉", 224, 17.2, 17.4, 0.3, 0.0, 0.1),
    food("pork_mince", "豚ひき肉", 221, 17.3, 17.2, 0.1, 0.0, 0.1),
    food("tofu", "豆腐", 72, 6.6, 4.2, 1.6, 0.4, 0.0),
    food("egg", "卵", 142, 12.3, 10.3, 0.3, 0.0, 0.4),
    food("shrimp", "えび", 87, 18.4, 0.6, 0.2, 0.0, 0.6),
    food("potato", "じゃがいも", 59, 1.8, 0.1, 14.0, 1.3, 0.0),
    food("sweet_potato", "さつまいも", 126, 1.2, 0.2, 31.9, 2.8, 0.0),
    food("pumpkin", "かぼちゃ", 78, 1.9, 0.3, 17.1, 3.5, 0.0),
    food("spinach", "ほうれん草", 20, 2.2, 0.4, 3.1, 2.8, 0.1),
    food("komatsuna", "小松菜", 14, 1.5, 0.2, 2.4, 1.9, 0.1),
    food("broccoli", "ブロッコリー", 33, 4.3, 0.5, 5.2, 4.4, 0.0),
    food("cabbage", "キャベツ", 23, 1.3, 0.2, 5.2, 1.8, 0.0),
    food("chinese_cabbage", "白菜", 13, 0.8, 0.1, 3.2, 1.3, 0.0),
    food("carrot", "にんじん", 39, 0.7, 0.2, 9.3, 2.8, 0.1),
    food("onion", "玉ねぎ", 33, 1.0, 0.1, 8.8, 1.6, 0.0),
    food("daikon", "大根", 18, 0.5, 0.1, 4.1, 1.4, 0.0),
    food("burdock", "ごぼう", 58, 1.8, 0.1, 15.4, 5.7, 0.0),
    food("lotus_root", "れんこん", 66, 1.9, 0.1, 15.5, 2.0, 0.1),
    food("cucumber", "きゅうり", 13, 1.0, 0.1, 3.0, 1.1, 0.0),
    food("tomato", "トマト", 20, 0.7, 0.1, 4.7, 1.0, 0.0),
    food("corn", "コーン", 89, 3.5, 1.7, 16.8, 3.0, 0.0),
    food("mushrooms", "きのこ", 18, 2.3, 0.3, 4.4, 2.7, 0.0),
    food("bean_sprouts", "もやし", 15, 1.7, 0.1, 2.6, 1.3, 0.0),
    food("green_peas", "グリーンピース", 93, 6.9, 0.6, 15.6, 7.7, 0.0),
    food("bell_pepper", "ピーマン", 22, 0.9, 0.2, 5.1, 2.3, 0.0),
    food("wakame", "わかめ", 16, 1.9, 0.2, 5.6, 3.0, 0.5),
    food("apple", "りんご", 57, 0.1, 0.2, 15.5, 1.5, 0.0),
    food("banana", "バナナ", 86, 1.1, 0.2, 22.5, 1.1, 0.0),
    food("mandarin", "みかん", 49, 0.7, 0.1, 12.0, 1.0, 0.0),
    food("peach", "白桃", 40, 0.6, 0.1, 10.2, 1.3, 0.0),
    food("grape", "ぶどう", 59, 0.5, 0.1, 15.2, 0.5, 0.0),
    food("orange", "オレンジ", 46, 0.8, 0.1, 11.3, 1.0, 0.0),
    food("milk", "牛乳", 61, 3.3, 3.8, 4.8, 0.0, 0.1),
    food("yogurt", "ヨーグルト", 62, 3.6, 3.0, 5.3, 0.0, 0.1),
    food("pudding_base", "プリン", 126, 4.6, 5.8, 13.8, 0.0, 0.1),
    food("jelly_base", "ゼリーベース", 78, 0.2, 0.0, 19.5, 0.3, 0.0),
    food("milk_jelly", "ミルクゼリー", 92, 2.1, 2.8, 14.8, 0.0, 0.1),
    food("steamed_cake", "蒸しパン", 250, 6.2, 6.1, 43.8, 1.2, 0.5),
    food("miso", "味噌", 183, 12.5, 6.0, 25.6, 5.5, 12.4),
    food("broth", "だし汁", 4, 0.6, 0.0, 0.2, 0.0, 0.2),
    food("consomme", "コンソメ", 72, 3.0, 1.1, 12.0, 0.0, 13.0),
    food("soy_sauce", "しょうゆ", 71, 7.7, 0.0, 10.1, 0.8, 14.5),
    food("light_soy", "うすくちしょうゆ", 55, 5.5, 0.0, 8.0, 0.4, 16.0),
    food("mirin", "みりん", 241, 0.3, 0.0, 54.9, 0.0, 0.0),
    food("sugar", "砂糖", 391, 0.0, 0.0, 99.2, 0.0, 0.0),
    food("salt", "塩", 0, 0.0, 0.0, 0.0, 0.0, 99.0),
    food("pepper", "こしょう", 255, 11.0, 3.2, 64.8, 21.0, 0.0),
    food("herb_mix", "乾燥ハーブ", 285, 9.0, 4.0, 60.0, 37.0, 0.1),
    food("curry_roux", "カレールウ", 512, 7.0, 32.3, 48.9, 3.2, 7.8),
    food("tomato_sauce", "トマトソース", 68, 1.7, 2.1, 11.0, 1.8, 0.9),
    food("cream_sauce", "クリームソース", 163, 2.7, 13.5, 8.0, 0.0, 0.8),
    food("ketchup", "ケチャップ", 120, 1.5, 0.2, 29.0, 0.4, 3.0),
    food("mayonnaise", "マヨネーズ", 700, 1.4, 76.0, 2.1, 0.0, 1.8),
    food("sesame_oil", "ごま油", 900, 0.0, 100.0, 0.0, 0.0, 0.0),
    food("oyster_sauce", "オイスターソース", 134, 5.0, 0.0, 28.0, 0.2, 11.0),
    food("vinegar", "酢", 24, 0.2, 0.0, 2.4, 0.0, 0.0),
    food("ponzu", "ぽん酢", 46, 3.2, 0.0, 8.2, 0.2, 7.5),
    food("butter", "バター", 745, 0.5, 81.0, 0.2, 0.0, 1.5),
    food("cheese", "チーズ", 313, 22.7, 26.0, 1.3, 0.0, 2.8),
    food("sesame", "ごま", 599, 20.3, 54.2, 18.5, 10.8, 0.0),
    food("starch", "片栗粉", 330, 0.1, 0.1, 81.6, 0.0, 0.0),
    food("flour", "小麦粉", 349, 8.3, 1.5, 75.8, 2.5, 0.0),
    food("gelatin_powder", "ゼラチン", 344, 87.6, 0.3, 0.0, 0.0, 0.1),
    food("baking_powder", "ベーキングパウダー", 53, 0.0, 0.0, 27.7, 0.0, 0.0),
    food("azuki_paste", "こしあん", 244, 5.0, 0.2, 57.0, 4.0, 0.1)
  ];
  const EXPANDED_FOOD_MAP = new Map(EXPANDED_FOODS.map((item) => [item.id, item]));

  function food(id, name, energy, protein, fat, carbs, fiber, salt) {
    return { id, name, nutrients: { energy, protein, fat, carbs, fiber, salt } };
  }
  function part(foodId, grams, meta = {}) {
    if (typeof meta === "string") {
      return { foodId, grams, prep: meta, step: "", label: "", unit: "g" };
    }
    return {
      foodId,
      grams,
      prep: meta.prep || "",
      step: meta.step || "",
      label: meta.label || meta.name || "",
      unit: meta.unit || "g"
    };
  }
  function normalizePart(partItem) {
    if (!partItem) return null;
    return {
      foodId: partItem.foodId,
      grams: Number(partItem.grams || 0),
      prep: partItem.prep || "",
      step: partItem.step || "",
      label: partItem.label || partItem.name || "",
      unit: partItem.unit || "g"
    };
  }
  function normalizeParts(parts) {
    return (parts || []).map(normalizePart).filter(Boolean);
  }
  function getFoodLabel(partItem) {
    const foodItem = EXPANDED_FOOD_MAP.get(partItem.foodId) || getFoodMap().get(partItem.foodId);
    return partItem.label || foodItem?.name || partItem.foodId;
  }
  function emptyNutrition() { return { energy: 0, protein: 0, fat: 0, carbs: 0, fiber: 0, salt: 0, kcal: 0 }; }
  function withKcalAlias(nutrition) { return { ...nutrition, kcal: nutrition.energy }; }
  function addNutrition(left, right) {
    return withKcalAlias({
      energy: left.energy + right.energy,
      protein: left.protein + right.protein,
      fat: left.fat + right.fat,
      carbs: left.carbs + right.carbs,
      fiber: left.fiber + right.fiber,
      salt: left.salt + right.salt
    });
  }
  function calcNutrition(parts) {
    return withKcalAlias(parts.reduce((acc, partItem) => {
      const foodItem = EXPANDED_FOOD_MAP.get(partItem.foodId);
      if (!foodItem) return acc;
      const ratio = partItem.grams / 100;
      return {
        energy: acc.energy + foodItem.nutrients.energy * ratio,
        protein: acc.protein + foodItem.nutrients.protein * ratio,
        fat: acc.fat + foodItem.nutrients.fat * ratio,
        carbs: acc.carbs + foodItem.nutrients.carbs * ratio,
        fiber: acc.fiber + foodItem.nutrients.fiber * ratio,
        salt: acc.salt + foodItem.nutrients.salt * ratio,
        kcal: 0
      };
    }, emptyNutrition()));
  }
  function createRecipe(def) {
    const ingredients = normalizeParts(def.ingredients || []);
    const seasonings = normalizeParts(def.seasonings || []);
    const instructions = Array.isArray(def.steps) && def.steps.length
      ? def.steps
      : (Array.isArray(def.instructions) && def.instructions.length ? def.instructions : ["手順未設定"]);
    const nutrition = withKcalAlias(def.nutrition || calcNutrition([...ingredients, ...seasonings]));
    return {
      id: def.id,
      name: def.name,
      category: def.category,
      cuisine: def.cuisine,
      notes: def.notes || "",
      ingredients,
      seasonings,
      instructions,
      steps: instructions,
      servingSize: def.servingSize || 100,
      servings: 1,
      servingWeight: def.servingSize || 100,
      rotationKey: def.rotationKey || def.name,
      tags: def.tags || [],
      nutrition,
      description: def.description || `${def.cuisine}の${def.category}`
    };
  }
  function sideRecipe(id, name, cuisine, ingredients, seasonings, servingSize, rotationKey, tags) {
    return createRecipe({ id, name, category: "副菜", cuisine, ingredients, seasonings, instructions: ["食べやすく加熱または和える。", "盛り付けて提供する。"], servingSize, rotationKey, tags });
  }
  function buildSoupSeries(target, prefix, cuisine, ingredientsList, methods) {
    ingredientsList.forEach(([name, ingredients], ingredientIndex) => {
      methods.forEach((method) => {
        target.push(createRecipe({
          id: `${prefix}-soup-${ingredientIndex}-${method.key}`,
          name: `${name}${method.label}`,
          category: "汁物",
          cuisine,
          servingSize: method.servingSize,
          rotationKey: `${cuisine}-汁物-${method.key}`,
          tags: method.tags,
          ingredients: [...ingredients, ...(method.ingredients || [])],
          seasonings: method.seasonings,
          instructions: method.instructions || ["具材をやわらかく加熱する。", "調味して温かく仕上げる。"]
        }));
      });
    });
  }
  function buildMainSeries(target, prefix, cuisine, proteins, methods) {
    proteins.forEach((protein, proteinIndex) => {
      methods.forEach((method) => {
        target.push(createRecipe({
          id: `${prefix}-main-${proteinIndex}-${method.key}`,
          name: `${protein.name}${method.label}`,
          category: "主菜",
          cuisine,
          servingSize: protein.grams + 40,
          rotationKey: protein.rotationKey,
          tags: method.tags,
          ingredients: [part(protein.id, protein.grams), ...method.ingredients],
          seasonings: method.seasonings,
          instructions: method.instructions || ["主材料をやわらかく加熱する。", `${method.label.replace(/^の/, "")}で仕上げる。`]
        }));
      });
    });
  }
  function buildJapaneseSides() {
    return [
      sideRecipe("jp-side-spinach-ohitashi", "ほうれん草のおひたし", "和食", [part("spinach", 60)], [part("soy_sauce", 2)], 60, "青菜", ["定番"]),
      sideRecipe("jp-side-spinach-goma", "ほうれん草の胡麻和え", "和食", [part("spinach", 55)], [part("soy_sauce", 2), part("sesame", 4), part("sugar", 1)], 60, "青菜", ["胡麻"]),
      sideRecipe("jp-side-spinach-nibitashi", "ほうれん草の煮びたし", "和食", [part("spinach", 55)], [part("broth", 15), part("soy_sauce", 2)], 65, "青菜", ["煮びたし"]),
      sideRecipe("jp-side-komatsuna-ohitashi", "小松菜のおひたし", "和食", [part("komatsuna", 60)], [part("soy_sauce", 2)], 60, "青菜", ["定番"]),
      sideRecipe("jp-side-komatsuna-goma", "小松菜の胡麻和え", "和食", [part("komatsuna", 55)], [part("soy_sauce", 2), part("sesame", 4)], 60, "青菜", ["胡麻"]),
      sideRecipe("jp-side-komatsuna-nibitashi", "小松菜の煮びたし", "和食", [part("komatsuna", 55)], [part("broth", 15), part("soy_sauce", 2)], 65, "青菜", ["煮びたし"]),
      sideRecipe("jp-side-daikon-soft", "大根のやわらか煮", "和食", [part("daikon", 70)], [part("broth", 20), part("soy_sauce", 2), part("mirin", 2)], 75, "根菜", ["煮物"]),
      sideRecipe("jp-side-daikon-soboro", "大根のそぼろ煮", "和食", [part("daikon", 65), part("pork_mince", 18)], [part("broth", 20), part("soy_sauce", 2), part("starch", 1)], 80, "根菜", ["そぼろ"]),
      sideRecipe("jp-side-daikon-ponzu", "大根のぽん酢和え", "和食", [part("daikon", 60)], [part("ponzu", 3)], 60, "根菜", ["さっぱり"]),
      sideRecipe("jp-side-pumpkin-nimono", "かぼちゃ煮", "和食", [part("pumpkin", 70)], [part("soy_sauce", 2), part("mirin", 2), part("sugar", 1)], 75, "かぼちゃ", ["煮物"]),
      sideRecipe("jp-side-pumpkin-ama", "かぼちゃの甘煮", "和食", [part("pumpkin", 70)], [part("sugar", 2), part("broth", 10)], 75, "かぼちゃ", ["甘め"]),
      sideRecipe("jp-side-pumpkin-goma", "かぼちゃの胡麻煮", "和食", [part("pumpkin", 65)], [part("soy_sauce", 2), part("sesame", 3)], 70, "かぼちゃ", ["胡麻"]),
      sideRecipe("jp-side-potato-korogashi", "じゃがいもの煮ころがし", "和食", [part("potato", 70)], [part("soy_sauce", 2), part("mirin", 2), part("sugar", 1)], 75, "じゃがいも", ["煮物"]),
      sideRecipe("jp-side-potato-soboro", "じゃがいものそぼろ煮", "和食", [part("potato", 65), part("chicken_breast", 15)], [part("broth", 18), part("soy_sauce", 2), part("starch", 1)], 80, "じゃがいも", ["そぼろ"]),
      sideRecipe("jp-side-sweetpotato-nimono", "さつまいもの甘煮", "和食", [part("sweet_potato", 55)], [part("sugar", 2), part("broth", 10)], 60, "さつまいも", ["甘煮"])
    ];
  }
  function buildWesternSides() {
    return [
      sideRecipe("west-side-potato-salad", "ポテトサラダ", "洋食", [part("potato", 60), part("cucumber", 15), part("carrot", 10)], [part("mayonnaise", 7)], 85, "サラダ", ["定番"]),
      sideRecipe("west-side-potato-cheese", "じゃがいものチーズ焼き", "洋食", [part("potato", 60), part("cheese", 10)], [part("consomme", 1)], 75, "じゃがいも", ["チーズ"]),
      sideRecipe("west-side-potato-consomme", "じゃがいものコンソメ煮", "洋食", [part("potato", 65), part("onion", 12)], [part("consomme", 2)], 80, "じゃがいも", ["煮込み"]),
      sideRecipe("west-side-cabbage-coleslaw", "コールスロー", "洋食", [part("cabbage", 45), part("corn", 12), part("cucumber", 10)], [part("mayonnaise", 6), part("vinegar", 2)], 75, "キャベツ", ["サラダ"]),
      sideRecipe("west-side-cabbage-butter", "キャベツのバターソテー", "洋食", [part("cabbage", 60), part("onion", 10)], [part("butter", 3), part("consomme", 1)], 75, "キャベツ", ["ソテー"]),
      sideRecipe("west-side-cabbage-cream", "キャベツのクリーム煮", "洋食", [part("cabbage", 55), part("onion", 10)], [part("milk", 24), part("butter", 2), part("flour", 2), part("consomme", 0.8), part("salt", 0.1), part("pepper", 0.05)], 75, "キャベツ", ["クリーム"]),
      sideRecipe("west-side-broccoli-salad", "ブロッコリーサラダ", "洋食", [part("broccoli", 55), part("corn", 12)], [part("mayonnaise", 5)], 75, "ブロッコリー", ["サラダ"]),
      sideRecipe("west-side-broccoli-saute", "ブロッコリーソテー", "洋食", [part("broccoli", 60), part("onion", 10)], [part("butter", 2), part("consomme", 1)], 75, "ブロッコリー", ["ソテー"]),
      sideRecipe("west-side-broccoli-consomme", "ブロッコリーのコンソメ煮", "洋食", [part("broccoli", 60), part("carrot", 10)], [part("consomme", 2)], 75, "ブロッコリー", ["煮込み"]),
      sideRecipe("west-side-pumpkin-salad", "かぼちゃサラダ", "洋食", [part("pumpkin", 60), part("cucumber", 10)], [part("mayonnaise", 5)], 75, "かぼちゃ", ["サラダ"]),
      sideRecipe("west-side-pumpkin-butter", "かぼちゃのバター煮", "洋食", [part("pumpkin", 65)], [part("butter", 2), part("sugar", 1)], 70, "かぼちゃ", ["やわらか"]),
      sideRecipe("west-side-pumpkin-cream", "かぼちゃのクリーム和え", "洋食", [part("pumpkin", 60)], [part("milk", 18), part("butter", 1.5), part("flour", 1.5), part("salt", 0.1), part("pepper", 0.05)], 70, "かぼちゃ", ["クリーム"]),
      sideRecipe("west-side-carrot-glace", "にんじんグラッセ", "洋食", [part("carrot", 55)], [part("butter", 2), part("sugar", 1)], 60, "にんじん", ["定番"]),
      sideRecipe("west-side-carrot-salad", "にんじんサラダ", "洋食", [part("carrot", 50), part("cucumber", 10)], [part("mayonnaise", 4), part("vinegar", 2)], 65, "にんじん", ["サラダ"]),
      sideRecipe("west-side-sweetpotato-salad", "さつまいもサラダ", "洋食", [part("sweet_potato", 45), part("cucumber", 8)], [part("mayonnaise", 4)], 60, "さつまいも", ["サラダ"])
    ];
  }
  function buildChineseSides() {
    return [
      sideRecipe("cn-side-beansprout-namul", "もやしナムル", "中華", [part("bean_sprouts", 60)], [part("sesame_oil", 2), part("soy_sauce", 2)], 60, "ナムル", ["定番"]),
      sideRecipe("cn-side-beansprout-oyster", "もやしのオイスター煮", "中華", [part("bean_sprouts", 60), part("carrot", 10)], [part("oyster_sauce", 2), part("broth", 10)], 70, "ナムル", ["煮物"]),
      sideRecipe("cn-side-beansprout-sweet", "もやしの甘酢和え", "中華", [part("bean_sprouts", 55), part("cucumber", 10)], [part("vinegar", 3), part("sugar", 1), part("soy_sauce", 1)], 65, "ナムル", ["甘酢"]),
      sideRecipe("cn-side-komatsuna-chinese", "青菜の中華和え", "中華", [part("komatsuna", 60)], [part("sesame_oil", 2), part("soy_sauce", 2)], 60, "青菜", ["和え物"]),
      sideRecipe("cn-side-komatsuna-oyster", "青菜のオイスター煮", "中華", [part("komatsuna", 55), part("onion", 10)], [part("oyster_sauce", 2), part("broth", 10)], 70, "青菜", ["煮物"]),
      sideRecipe("cn-side-komatsuna-namul", "青菜ナムル", "中華", [part("komatsuna", 55)], [part("sesame_oil", 2), part("salt", 0.2)], 60, "青菜", ["ナムル"]),
      sideRecipe("cn-side-cabbage-chinese", "白菜の中華煮", "中華", [part("chinese_cabbage", 65), part("carrot", 10)], [part("broth", 12), part("soy_sauce", 2), part("starch", 1)], 80, "白菜", ["煮物"]),
      sideRecipe("cn-side-cabbage-oyster", "白菜のオイスター和え", "中華", [part("chinese_cabbage", 60)], [part("oyster_sauce", 2), part("sesame_oil", 1)], 65, "白菜", ["和え物"]),
      sideRecipe("cn-side-cabbage-vinegar", "白菜の甘酢和え", "中華", [part("chinese_cabbage", 55), part("cucumber", 10)], [part("vinegar", 3), part("sugar", 1)], 65, "白菜", ["甘酢"]),
      sideRecipe("cn-side-cucumber-vinegar", "きゅうりの甘酢和え", "中華", [part("cucumber", 50), part("corn", 10)], [part("vinegar", 3), part("sugar", 1), part("soy_sauce", 1)], 60, "きゅうり", ["甘酢"]),
      sideRecipe("cn-side-cucumber-namul", "きゅうりナムル", "中華", [part("cucumber", 50)], [part("sesame_oil", 2), part("salt", 0.2)], 55, "きゅうり", ["ナムル"]),
      sideRecipe("cn-side-cucumber-shrimp", "えび入り中華サラダ", "中華", [part("cucumber", 40), part("shrimp", 18), part("corn", 10)], [part("mayonnaise", 4), part("vinegar", 1)], 70, "きゅうり", ["サラダ"]),
      sideRecipe("cn-side-carrot-namul", "にんじんナムル", "中華", [part("carrot", 50)], [part("sesame_oil", 2), part("soy_sauce", 1)], 55, "にんじん", ["ナムル"]),
      sideRecipe("cn-side-carrot-oyster", "にんじんの中華煮", "中華", [part("carrot", 50), part("onion", 10)], [part("oyster_sauce", 2), part("broth", 10)], 65, "にんじん", ["煮物"]),
      sideRecipe("cn-side-carrot-sweet", "にんじんの甘酢和え", "中華", [part("carrot", 45), part("cucumber", 10)], [part("vinegar", 3), part("sugar", 1)], 60, "にんじん", ["甘酢"])
    ];
  }
  function buildExtraSides() {
    return [
      sideRecipe("mix-side-lotus-kinpira", "れんこんきんぴら", "和食", [part("lotus_root", 55), part("carrot", 10)], [part("soy_sauce", 2), part("mirin", 2), part("sesame_oil", 1)], 70, "根菜", ["追加副菜"]),
      sideRecipe("mix-side-burdock-soft", "ごぼうのやわらか煮", "和食", [part("burdock", 45), part("carrot", 10)], [part("broth", 12), part("soy_sauce", 2)], 60, "根菜", ["追加副菜"]),
      sideRecipe("mix-side-tomato-marina", "トマトマリネ", "洋食", [part("tomato", 60), part("onion", 10)], [part("vinegar", 2), part("sugar", 1)], 70, "トマト", ["追加副菜"]),
      sideRecipe("mix-side-corn-butter", "コーンバター", "洋食", [part("corn", 45)], [part("butter", 2), part("consomme", 1)], 50, "コーン", ["追加副菜"]),
      sideRecipe("mix-side-tofu-chinese", "豆腐の中華サラダ", "中華", [part("tofu", 55), part("cucumber", 10)], [part("soy_sauce", 2), part("sesame_oil", 1), part("vinegar", 1)], 70, "豆腐", ["追加副菜"])
    ];
  }
  function buildSingleDishes() {
    return [
      createRecipe({ id: "single-west-curry", name: "カレーライス", category: "単品料理", cuisine: "洋食", servingSize: 340, rotationKey: "カレー", tags: ["例外献立"], ingredients: [part("rice", 150), part("chicken_thigh", 70), part("potato", 50), part("onion", 35), part("carrot", 20)], seasonings: [part("curry_roux", 18), part("broth", 60)], instructions: ["具材をやわらかく煮る。", "ルウを溶かし、ごはんに添える。"] }),
      createRecipe({ id: "single-west-dry-curry", name: "ドライカレー", category: "単品料理", cuisine: "洋食", servingSize: 300, rotationKey: "カレー", tags: ["例外献立"], ingredients: [part("rice", 145), part("beef_mince", 45), part("onion", 30), part("carrot", 20), part("corn", 15)], seasonings: [part("curry_roux", 12), part("ketchup", 4)], instructions: ["具材を炒めて味をまとめる。", "ごはんと合わせて盛り付ける。"] }),
      createRecipe({ id: "single-west-napolitan", name: "ナポリタン", category: "単品料理", cuisine: "洋食", servingSize: 260, rotationKey: "パスタ", tags: ["例外献立"], ingredients: [part("pasta", 180), part("chicken_breast", 35), part("onion", 20), part("bell_pepper", 12)], seasonings: [part("ketchup", 10), part("consomme", 2)], instructions: ["具材をやわらかく炒める。", "パスタと調味料を合わせる。"] }),
      createRecipe({ id: "single-west-cream-pasta", name: "クリームパスタ", category: "単品料理", cuisine: "洋食", servingSize: 270, rotationKey: "パスタ", tags: ["例外献立"], ingredients: [part("pasta", 180), part("chicken_breast", 35), part("broccoli", 20), part("onion", 15)], seasonings: [part("milk", 45), part("butter", 3), part("flour", 4), part("consomme", 1), part("salt", 0.2), part("pepper", 0.05)], instructions: ["鶏肉、玉ねぎ、ブロッコリーをやわらかく加熱する。", "バターと小麦粉に牛乳を加えてのばし、パスタと合わせる。"] }),
      createRecipe({ id: "single-jp-oyako", name: "親子丼", category: "単品料理", cuisine: "和食", servingSize: 300, rotationKey: "丼", tags: ["例外献立"], ingredients: [part("rice", 145), part("chicken_thigh", 55), part("egg", 35), part("onion", 30)], seasonings: [part("broth", 35), part("soy_sauce", 4), part("mirin", 4)], instructions: ["具材をだしで煮る。", "卵でとじてごはんにのせる。"] }),
      createRecipe({ id: "single-jp-udon", name: "きのこあんかけうどん", category: "単品料理", cuisine: "和食", servingSize: 320, rotationKey: "うどん", tags: ["例外献立"], ingredients: [part("udon", 190), part("mushrooms", 30), part("komatsuna", 20)], seasonings: [part("broth", 80), part("soy_sauce", 4), part("starch", 2)], instructions: ["具材をやわらかく煮る。", "うどんにあんをかける。"] }),
      createRecipe({ id: "single-jp-wafu-pasta", name: "和風きのこパスタ", category: "単品料理", cuisine: "和食", servingSize: 255, rotationKey: "パスタ", tags: ["例外献立"], ingredients: [part("pasta", 170), part("mushrooms", 30), part("chicken_breast", 30)], seasonings: [part("soy_sauce", 4), part("butter", 3)], instructions: ["具材を加熱する。", "パスタと和風の味でまとめる。"] }),
      createRecipe({ id: "single-jp-zosui", name: "鮭雑炊", category: "単品料理", cuisine: "和食", servingSize: 280, rotationKey: "雑炊", tags: ["例外献立"], ingredients: [part("soft_rice", 140), part("salmon", 40), part("egg", 25), part("komatsuna", 15)], seasonings: [part("broth", 70), part("soy_sauce", 2)], instructions: ["具材をやわらかく煮る。", "雑炊に仕上げる。"] }),
      createRecipe({ id: "single-cn-ramen", name: "やわらか醤油ラーメン", category: "単品料理", cuisine: "中華", servingSize: 320, rotationKey: "ラーメン", tags: ["例外献立"], ingredients: [part("chinese_noodles", 180), part("chicken_breast", 35), part("bean_sprouts", 20), part("komatsuna", 15)], seasonings: [part("broth", 90), part("soy_sauce", 4), part("sesame_oil", 1)], instructions: ["スープを温める。", "麺と具材を合わせて盛り付ける。"] }),
      createRecipe({ id: "single-cn-bowl", name: "中華丼", category: "単品料理", cuisine: "中華", servingSize: 310, rotationKey: "丼", tags: ["例外献立"], ingredients: [part("rice", 145), part("pork_lean", 45), part("chinese_cabbage", 30), part("carrot", 15), part("mushrooms", 15)], seasonings: [part("broth", 35), part("soy_sauce", 3), part("starch", 2)], instructions: ["具材をやわらかく煮てあんにする。", "ごはんにかける。"] }),
      createRecipe({ id: "single-cn-mapo-bowl", name: "麻婆丼", category: "単品料理", cuisine: "中華", servingSize: 300, rotationKey: "丼", tags: ["例外献立"], ingredients: [part("rice", 145), part("tofu", 90), part("pork_mince", 28), part("onion", 15)], seasonings: [part("soy_sauce", 3), part("oyster_sauce", 2), part("starch", 2)], instructions: ["具材を煮てとろみをつける。", "ごはんにのせる。"] }),
      createRecipe({ id: "single-cn-yakisoba", name: "あんかけ焼きそば", category: "単品料理", cuisine: "中華", servingSize: 300, rotationKey: "焼きそば", tags: ["例外献立"], ingredients: [part("chinese_noodles", 170), part("pork_lean", 35), part("chinese_cabbage", 25), part("carrot", 12)], seasonings: [part("broth", 40), part("soy_sauce", 3), part("starch", 2)], instructions: ["具材をやわらかく煮る。", "麺にあんをかけて仕上げる。"] })
    ];
  }
  function buildDesserts() {
    const fruits = [
      { id: "apple", name: "りんご", budgetTag: "安価" },
      { id: "banana", name: "バナナ", budgetTag: "安価" },
      { id: "mandarin", name: "みかん", budgetTag: "安価" },
      { id: "orange", name: "オレンジ", budgetTag: "安価" },
      { id: "peach", name: "白桃", budgetTag: "高価寄り" },
      { id: "grape", name: "ぶどう", budgetTag: "高価寄り" }
    ];
    const bases = [
      { key: "jelly", label: "ゼリー", baseTag: "ゼリー系", rotationKey: "ゼリー", servingSize: 85, makeIngredients: (fruit) => [part(fruit.id, 65)], makeSeasonings: () => [part("sugar", 5), part("gelatin_powder", 2)], instructions: ["果物を食べやすく整える。", "砂糖とゼラチンで固めて冷やす。"] },
      { key: "yogurt", label: "ヨーグルト", baseTag: "ヨーグルト系", rotationKey: "ヨーグルト", servingSize: 95, makeIngredients: (fruit) => [part("yogurt", 70), part(fruit.id, 25)], makeSeasonings: () => [], instructions: ["果物を刻んでヨーグルトに合わせる。", "冷やして提供する。"] },
      { key: "pudding", label: "プリン", baseTag: "プリン系", rotationKey: "プリン", servingSize: 90, makeIngredients: (fruit) => [part("milk", 55), part("egg", 18), part(fruit.id, 15)], makeSeasonings: () => [part("sugar", 8)], instructions: ["牛乳、卵、砂糖を合わせて加熱する。", "果物を添えて冷やし固める。"] },
      { key: "milk", label: "ミルクゼリー", baseTag: "ゼリー系", rotationKey: "ミルクゼリー", servingSize: 90, makeIngredients: (fruit) => [part("milk", 60), part(fruit.id, 15)], makeSeasonings: () => [part("sugar", 5), part("gelatin_powder", 2)], instructions: ["牛乳に砂糖を合わせる。", "ゼラチンで固め、果物を添えて冷やす。"] },
      { key: "compote", label: "コンポート", baseTag: "生フルーツ系", rotationKey: "コンポート", servingSize: 85, makeIngredients: (fruit) => [part(fruit.id, 75)], makeSeasonings: () => [part("sugar", 4)], instructions: ["果物を食べやすく切る。", "軽く甘みをつけて冷やす。"] },
      { key: "cake", label: "蒸しパン", baseTag: "焼き菓子系", rotationKey: "蒸しパン", servingSize: 80, makeIngredients: (fruit) => [part("flour", 22), part("milk", 18), part("egg", 10), part(fruit.id, 18)], makeSeasonings: () => [part("sugar", 8), part("baking_powder", 1.5)], instructions: ["生地に果物を合わせる。", "やわらかく蒸して提供する。"] }
    ];
    const recipes = [];
    fruits.forEach((fruit, fruitIndex) => {
      bases.forEach((base, baseIndex) => {
        recipes.push(createRecipe({
          id: `dessert-${fruit.id}-${base.key}`,
          name: `${fruit.name}${base.label}`,
          category: "デザート",
          cuisine: CUISINES[(fruitIndex + baseIndex) % CUISINES.length],
          servingSize: base.servingSize,
          rotationKey: base.rotationKey,
          tags: ["デザート", base.baseTag, `果物:${fruit.name}`, fruit.budgetTag],
          ingredients: base.makeIngredients(fruit),
          seasonings: base.makeSeasonings(fruit),
          instructions: base.instructions
        }));
      });
    });
    [
      { id: "banana", name: "バナナ", grams: 75 },
      { id: "mandarin", name: "みかん", grams: 90 },
      { id: "apple", name: "りんご", grams: 75 },
      { id: "orange", name: "オレンジ", grams: 90 }
    ].forEach((fruit, index) => {
      recipes.push(createRecipe({
        id: `dessert-${fruit.id}-fresh`,
        name: fruit.name,
        category: "デザート",
        cuisine: CUISINES[index % CUISINES.length],
        servingSize: fruit.grams,
        rotationKey: "生フルーツ",
        tags: ["デザート", "生フルーツ", "生フルーツ系", `果物:${fruit.name}`, "安価"],
        ingredients: [part(fruit.id, fruit.grams)],
        seasonings: [],
        instructions: ["食べやすく切る。", "器に盛り付ける。"]
      }));
    });
    return recipes;
  }
  function buildAdditionalSingleDishes() {
    const dish = (definition) => createRecipe({
      ...definition,
      category: definition.id.startsWith("single-plus2-") ? "主食" : "単品料理",
      notes: definition.notes || "主食の完成メニューとして、そのまま提供する。",
      description: definition.description || `${definition.name}を主食の完成メニューとして提供する。`,
      tags: ["追加レシピ", "完成主食", ...(definition.tags || [])]
    });
    const definitions = [
      { id: "single-plus-jp-soboro-bowl", name: "鶏そぼろ丼", cuisine: "和食", servingSize: 300, rotationKey: "丼", tags: ["丼もの"], ingredients: [part("rice", 145), part("chicken_breast", 55), part("egg", 18), part("green_peas", 10)], seasonings: [part("broth", 30), part("soy_sauce", 4), part("mirin", 4), part("sugar", 2)], instructions: ["具材をやわらかく煮てそぼろ状にまとめる。", "ごはんにのせて提供する。"] },
      { id: "single-plus-jp-salmon-bowl", name: "鮭ほぐし丼", cuisine: "和食", servingSize: 295, rotationKey: "丼", tags: ["丼もの"], ingredients: [part("rice", 145), part("salmon", 50), part("egg", 16), part("komatsuna", 12)], seasonings: [part("broth", 25), part("soy_sauce", 3), part("mirin", 3)], instructions: ["鮭をやわらかく加熱してほぐす。", "ごはんに彩りよく盛り付ける。"] },
      { id: "single-plus-jp-pork-bowl", name: "豚のしょうが丼", cuisine: "和食", servingSize: 300, rotationKey: "丼", tags: ["丼もの"], ingredients: [part("rice", 145), part("pork_lean", 55), part("onion", 25), part("carrot", 12)], seasonings: [part("broth", 25), part("soy_sauce", 4), part("mirin", 3)], instructions: ["豚肉と玉ねぎをやわらかく煮る。", "ごはんにのせて提供する。"] },
      { id: "single-plus-jp-tofu-bowl", name: "豆腐そぼろ丼", cuisine: "和食", servingSize: 295, rotationKey: "丼", tags: ["丼もの"], ingredients: [part("rice", 145), part("tofu", 85), part("pork_mince", 20), part("green_peas", 10)], seasonings: [part("broth", 25), part("soy_sauce", 3), part("mirin", 3), part("starch", 1)], instructions: ["豆腐とそぼろをやわらかく煮る。", "軽くとろみをつけてごはんにのせる。"] },
      { id: "single-plus-jp-mushroom-oyako", name: "きのこ親子丼", cuisine: "和食", servingSize: 305, rotationKey: "丼", tags: ["丼もの"], ingredients: [part("rice", 145), part("chicken_thigh", 50), part("egg", 28), part("mushrooms", 20), part("onion", 20)], seasonings: [part("broth", 30), part("soy_sauce", 4), part("mirin", 4)], instructions: ["具材をだしでやわらかく煮る。", "卵でとじてごはんにのせる。"] },
      { id: "single-plus-jp-fish-bowl", name: "白身魚あんかけ丼", cuisine: "和食", servingSize: 300, rotationKey: "丼", tags: ["丼もの"], ingredients: [part("rice", 145), part("white_fish", 55), part("chinese_cabbage", 25), part("carrot", 12)], seasonings: [part("broth", 30), part("light_soy", 3), part("starch", 2)], instructions: ["白身魚と野菜をやわらかく煮る。", "とろみあんにしてごはんへかける。"] },
      { id: "single-plus-jp-egg-bowl", name: "たまごあん丼", cuisine: "和食", servingSize: 290, rotationKey: "丼", tags: ["丼もの"], ingredients: [part("rice", 145), part("egg", 40), part("onion", 20), part("mushrooms", 15)], seasonings: [part("broth", 35), part("soy_sauce", 3), part("starch", 2)], instructions: ["具材をだしで煮て卵を加える。", "あんにしてごはんへかける。"] },
      { id: "single-plus-jp-root-bowl", name: "根菜そぼろ丼", cuisine: "和食", servingSize: 300, rotationKey: "丼", tags: ["丼もの"], ingredients: [part("rice", 145), part("chicken_breast", 45), part("carrot", 15), part("burdock", 18), part("lotus_root", 15)], seasonings: [part("broth", 28), part("soy_sauce", 4), part("mirin", 3)], instructions: ["根菜をやわらかく煮る。", "そぼろと合わせてごはんにのせる。"] },
      { id: "single-plus-jp-shrimp-bowl", name: "えびたま丼", cuisine: "和食", servingSize: 295, rotationKey: "丼", tags: ["丼もの"], ingredients: [part("rice", 145), part("shrimp", 40), part("egg", 30), part("onion", 18)], seasonings: [part("broth", 28), part("soy_sauce", 3), part("mirin", 3)], instructions: ["えびと玉ねぎをやわらかく煮る。", "卵でとじてごはんにのせる。"] },
      { id: "single-plus-jp-green-bowl", name: "青菜あん丼", cuisine: "和食", servingSize: 295, rotationKey: "丼", tags: ["丼もの"], ingredients: [part("rice", 145), part("komatsuna", 25), part("tofu", 55), part("carrot", 10)], seasonings: [part("broth", 28), part("light_soy", 3), part("starch", 2)], instructions: ["青菜と豆腐をやわらかく煮る。", "あんにしてごはんへかける。"] },
      { id: "single-plus-west-chicken-curry", name: "チキンカレー", cuisine: "洋食", servingSize: 335, rotationKey: "カレー", tags: ["カレー"], ingredients: [part("rice", 150), part("chicken_thigh", 65), part("potato", 45), part("onion", 30), part("carrot", 20)], seasonings: [part("curry_roux", 18), part("broth", 55)], instructions: ["具材をやわらかく煮る。", "カレーに仕上げてごはんに添える。"] },
      { id: "single-plus-west-pork-curry", name: "ポークカレー", cuisine: "洋食", servingSize: 335, rotationKey: "カレー", tags: ["カレー"], ingredients: [part("rice", 150), part("pork_lean", 60), part("potato", 45), part("onion", 30), part("carrot", 20)], seasonings: [part("curry_roux", 18), part("broth", 55)], instructions: ["具材をやわらかく煮る。", "カレーに仕上げてごはんに添える。"] },
      { id: "single-plus-west-mushroom-curry", name: "きのこカレーライス", cuisine: "洋食", servingSize: 325, rotationKey: "カレー", tags: ["カレー"], ingredients: [part("rice", 150), part("mushrooms", 35), part("onion", 30), part("corn", 15)], seasonings: [part("curry_roux", 17), part("broth", 55)], instructions: ["具材をやわらかく煮る。", "香りよくカレーに仕上げる。"] },
      { id: "single-plus-west-vegetable-curry", name: "野菜カレーライス", cuisine: "洋食", servingSize: 325, rotationKey: "カレー", tags: ["カレー"], ingredients: [part("rice", 150), part("potato", 40), part("pumpkin", 30), part("onion", 25), part("carrot", 18)], seasonings: [part("curry_roux", 17), part("broth", 55)], instructions: ["野菜をやわらかく煮る。", "ルウを溶かしてごはんに添える。"] },
      { id: "single-plus-west-cutlet-curry", name: "カツカレー", cuisine: "洋食", servingSize: 340, rotationKey: "カレー", tags: ["カレー"], ingredients: [part("rice", 150), part("pork_lean", 60, { label: "やわらかカツ用豚肉" }), part("egg", 12), part("flour", 6), part("onion", 25), part("carrot", 18)], seasonings: [part("curry_roux", 18), part("broth", 55)], instructions: ["豚肉をやわらかく加熱し、カツ仕立てに整える。", "カレーをかけてごはんと合わせる。"] },
      { id: "single-plus-west-hayashi", name: "ハヤシライス", cuisine: "洋食", servingSize: 330, rotationKey: "ハヤシ", tags: ["洋食主食"], ingredients: [part("rice", 150), part("beef_mince", 45), part("onion", 35), part("mushrooms", 25)], seasonings: [part("ketchup", 8), part("tomato", 28), part("consomme", 2), part("broth", 35)], instructions: ["具材をやわらかく煮る。", "ハヤシソースにまとめてごはんに添える。"] },
      { id: "single-plus-west-mushroom-hayashi", name: "きのこハヤシライス", cuisine: "洋食", servingSize: 325, rotationKey: "ハヤシ", tags: ["洋食主食"], ingredients: [part("rice", 150), part("mushrooms", 35), part("onion", 30), part("beef_mince", 35)], seasonings: [part("ketchup", 8), part("tomato", 28), part("consomme", 2), part("broth", 35)], instructions: ["きのこをやわらかく煮る。", "ハヤシソースでまとめてごはんに添える。"] },
      { id: "single-plus-west-cheese-curry", name: "チーズカレーライス", cuisine: "洋食", servingSize: 330, rotationKey: "カレー", tags: ["カレー", "チーズ"], ingredients: [part("rice", 150), part("chicken_breast", 55), part("potato", 40), part("onion", 28), part("cheese", 10)], seasonings: [part("curry_roux", 17), part("broth", 50)], instructions: ["具材をやわらかく煮る。", "カレーにチーズを合わせてごはんに添える。"] },
      { id: "single-plus-west-dry-pilaf", name: "ドライカレーピラフ", cuisine: "洋食", servingSize: 305, rotationKey: "ピラフ", tags: ["洋食主食"], ingredients: [part("rice", 145), part("beef_mince", 40), part("onion", 25), part("carrot", 15), part("corn", 12)], seasonings: [part("curry_roux", 10), part("ketchup", 4), part("consomme", 2)], instructions: ["具材を炒めて味をまとめる。", "ごはんと合わせて提供する。"] },
      { id: "single-plus-west-chicken-rice", name: "チキンライス", cuisine: "洋食", servingSize: 300, rotationKey: "洋食主食", tags: ["洋食主食"], ingredients: [part("rice", 145), part("chicken_breast", 45), part("onion", 20), part("green_peas", 10), part("carrot", 12)], seasonings: [part("ketchup", 8), part("consomme", 2), part("butter", 2)], instructions: ["具材をやわらかく加熱する。", "ごはんと合わせてケチャップ味に仕上げる。"] },
      { id: "single-plus-west-meat-sauce", name: "ミートソーススパゲティ", cuisine: "洋食", servingSize: 270, rotationKey: "パスタ", tags: ["パスタ"], ingredients: [part("pasta", 180), part("beef_mince", 45), part("onion", 20), part("tomato", 30)], seasonings: [part("ketchup", 8), part("consomme", 2)], instructions: ["具材をやわらかく煮てソースにする。", "パスタに合わせて提供する。"] },
      { id: "single-plus-west-kinoko-pasta", name: "きのこ和風スパゲティ", cuisine: "和食", servingSize: 255, rotationKey: "パスタ", tags: ["パスタ"], ingredients: [part("pasta", 170), part("mushrooms", 30), part("chicken_breast", 28), part("onion", 15)], seasonings: [part("soy_sauce", 4), part("butter", 3)], instructions: ["具材をやわらかく加熱する。", "和風の味でパスタにまとめる。"] },
      { id: "single-plus-west-tomato-pasta", name: "鶏肉のトマトパスタ", cuisine: "洋食", servingSize: 270, rotationKey: "パスタ", tags: ["パスタ"], ingredients: [part("pasta", 180), part("chicken_breast", 40), part("tomato", 30), part("onion", 18)], seasonings: [part("ketchup", 7), part("consomme", 2)], instructions: ["具材をやわらかく煮る。", "トマト味でパスタと合わせる。"] },
      { id: "single-plus-west-spinach-cream", name: "ほうれん草クリームパスタ", cuisine: "洋食", servingSize: 270, rotationKey: "パスタ", tags: ["パスタ"], ingredients: [part("pasta", 180), part("spinach", 20), part("chicken_breast", 35), part("onion", 15)], seasonings: [part("milk", 45), part("butter", 3), part("flour", 4), part("consomme", 1), part("salt", 0.2), part("pepper", 0.05)], instructions: ["具材をやわらかく加熱する。", "クリームソースでパスタに合わせる。"] },
      { id: "single-plus-west-corn-pasta", name: "コーンバターパスタ", cuisine: "洋食", servingSize: 260, rotationKey: "パスタ", tags: ["パスタ"], ingredients: [part("pasta", 175), part("corn", 25), part("onion", 15)], seasonings: [part("butter", 3), part("consomme", 2)], instructions: ["具材をやわらかく加熱する。", "バター風味でパスタと合わせる。"] },
      { id: "single-plus-west-salmon-pasta", name: "鮭のミルクパスタ", cuisine: "洋食", servingSize: 270, rotationKey: "パスタ", tags: ["パスタ"], ingredients: [part("pasta", 180), part("salmon", 40), part("broccoli", 20), part("onion", 15)], seasonings: [part("milk", 40), part("butter", 2), part("consomme", 1), part("salt", 0.2)], instructions: ["鮭と野菜をやわらかく加熱する。", "ミルクソースでパスタに合わせる。"] },
      { id: "single-plus-west-shrimp-pasta", name: "えびトマトパスタ", cuisine: "洋食", servingSize: 265, rotationKey: "パスタ", tags: ["パスタ"], ingredients: [part("pasta", 175), part("shrimp", 38), part("tomato", 28), part("onion", 15)], seasonings: [part("ketchup", 7), part("consomme", 2)], instructions: ["えびと野菜をやわらかく煮る。", "トマト味でパスタに合わせる。"] },
      { id: "single-plus-west-vegetable-pasta", name: "野菜コンソメパスタ", cuisine: "洋食", servingSize: 255, rotationKey: "パスタ", tags: ["パスタ"], ingredients: [part("pasta", 170), part("broccoli", 20), part("carrot", 15), part("corn", 12), part("onion", 15)], seasonings: [part("consomme", 3), part("butter", 2)], instructions: ["野菜をやわらかく加熱する。", "コンソメ味でパスタと合わせる。"] },
      { id: "single-plus-west-cheese-napolitan", name: "チーズナポリタン", cuisine: "洋食", servingSize: 270, rotationKey: "パスタ", tags: ["パスタ", "チーズ"], ingredients: [part("pasta", 180), part("chicken_breast", 35), part("onion", 18), part("bell_pepper", 12), part("cheese", 10)], seasonings: [part("ketchup", 9), part("consomme", 2)], instructions: ["具材をやわらかく炒める。", "チーズを合わせてパスタに仕上げる。"] },
      { id: "single-plus-west-mushroom-cream", name: "きのこクリームスパゲティ", cuisine: "洋食", servingSize: 270, rotationKey: "パスタ", tags: ["パスタ"], ingredients: [part("pasta", 180), part("mushrooms", 32), part("onion", 15), part("milk", 20)], seasonings: [part("milk", 35), part("butter", 3), part("flour", 4), part("consomme", 1), part("salt", 0.2)], instructions: ["きのこをやわらかく加熱する。", "クリームソースでパスタと合わせる。"] },
      { id: "single-plus-jp-yakiudon", name: "やわらか焼うどん", cuisine: "和食", servingSize: 310, rotationKey: "うどん", tags: ["麺類"], ingredients: [part("udon", 190), part("pork_lean", 35), part("cabbage", 25), part("carrot", 12)], seasonings: [part("soy_sauce", 4), part("broth", 20)], instructions: ["具材をやわらかく炒め煮にする。", "うどんと合わせて仕上げる。"] },
      { id: "single-plus-jp-egg-udon", name: "玉子とじうどん", cuisine: "和食", servingSize: 320, rotationKey: "うどん", tags: ["麺類"], ingredients: [part("udon", 190), part("egg", 28), part("onion", 18), part("komatsuna", 15)], seasonings: [part("broth", 85), part("soy_sauce", 4)], instructions: ["だしに具材を入れてやわらかく煮る。", "卵でとじてうどんに合わせる。"] },
      { id: "single-plus-jp-kenchin-udon", name: "けんちんうどん", cuisine: "和食", servingSize: 325, rotationKey: "うどん", tags: ["麺類"], ingredients: [part("udon", 190), part("tofu", 50), part("daikon", 20), part("carrot", 15)], seasonings: [part("broth", 85), part("soy_sauce", 4)], instructions: ["具材をやわらかく煮る。", "うどんに合わせて温かく仕上げる。"] },
      { id: "single-plus-jp-tofu-udon", name: "豆腐あんかけうどん", cuisine: "和食", servingSize: 320, rotationKey: "うどん", tags: ["麺類"], ingredients: [part("udon", 190), part("tofu", 60), part("mushrooms", 20), part("komatsuna", 15)], seasonings: [part("broth", 85), part("soy_sauce", 4), part("starch", 2)], instructions: ["具材をやわらかく煮る。", "うどんにとろみあんをかける。"] },
      { id: "single-plus-cn-soy-yakisoba", name: "しょうゆ焼きそば", cuisine: "中華", servingSize: 295, rotationKey: "焼きそば", tags: ["麺類"], ingredients: [part("chinese_noodles", 170), part("pork_lean", 35), part("bean_sprouts", 25), part("carrot", 12)], seasonings: [part("soy_sauce", 4), part("sesame_oil", 1), part("broth", 15)], instructions: ["具材をやわらかく炒め煮にする。", "麺と合わせてしょうゆ味に仕上げる。"] },
      { id: "single-plus-cn-sauce-yakisoba", name: "ソース焼きそば", cuisine: "中華", servingSize: 300, rotationKey: "焼きそば", tags: ["麺類"], ingredients: [part("chinese_noodles", 170), part("pork_lean", 35), part("cabbage", 25), part("carrot", 12)], seasonings: [part("ketchup", 7), part("soy_sauce", 2), part("broth", 12)], instructions: ["具材をやわらかく加熱する。", "麺と合わせて食べやすく仕上げる。"] },
      { id: "single-plus-cn-gomoku-ramen", name: "五目ラーメン", cuisine: "中華", servingSize: 325, rotationKey: "ラーメン", tags: ["麺類"], ingredients: [part("chinese_noodles", 180), part("chicken_breast", 35), part("chinese_cabbage", 20), part("carrot", 12), part("mushrooms", 15)], seasonings: [part("broth", 90), part("soy_sauce", 4), part("sesame_oil", 1)], instructions: ["スープと具材をやわらかく仕上げる。", "麺と合わせて提供する。"] },
      { id: "single-plus-cn-miso-ramen", name: "味噌ラーメン", cuisine: "中華", servingSize: 325, rotationKey: "ラーメン", tags: ["麺類"], ingredients: [part("chinese_noodles", 180), part("pork_lean", 35), part("bean_sprouts", 20), part("corn", 12)], seasonings: [part("broth", 88), part("miso", 10), part("soy_sauce", 2)], instructions: ["具材をやわらかく煮る。", "味噌味のスープで麺と合わせる。"] },
      { id: "single-plus-cn-anmen", name: "中華あんかけ麺", cuisine: "中華", servingSize: 310, rotationKey: "麺類", tags: ["麺類"], ingredients: [part("chinese_noodles", 175), part("pork_lean", 35), part("chinese_cabbage", 25), part("carrot", 12), part("green_peas", 10)], seasonings: [part("broth", 45), part("soy_sauce", 3), part("starch", 2)], instructions: ["具材をやわらかく煮てあんにする。", "麺へかけて提供する。"] },
      { id: "single-plus-cn-kinoko-ramen", name: "きのこ塩ラーメン", cuisine: "中華", servingSize: 320, rotationKey: "ラーメン", tags: ["麺類"], ingredients: [part("chinese_noodles", 180), part("mushrooms", 25), part("komatsuna", 15), part("chicken_breast", 30)], seasonings: [part("broth", 90), part("salt", 0.4), part("sesame_oil", 1)], instructions: ["具材をやわらかく煮る。", "塩味のスープで麺と合わせる。"] },
      { id: "single-plus-cn-corn-ramen", name: "コーンラーメン", cuisine: "中華", servingSize: 320, rotationKey: "ラーメン", tags: ["麺類"], ingredients: [part("chinese_noodles", 180), part("corn", 18), part("chicken_breast", 30), part("komatsuna", 15)], seasonings: [part("broth", 90), part("soy_sauce", 3), part("sesame_oil", 1)], instructions: ["具材をやわらかく煮る。", "コーンをのせて麺と合わせる。"] },
      { id: "single-plus-jp-chicken-zosui", name: "鶏雑炊", cuisine: "和食", servingSize: 285, rotationKey: "雑炊", tags: ["雑炊"], ingredients: [part("soft_rice", 140), part("chicken_breast", 35), part("egg", 20), part("komatsuna", 15)], seasonings: [part("broth", 75), part("soy_sauce", 2)], instructions: ["具材をやわらかく煮る。", "雑炊に仕上げて提供する。"] },
      { id: "single-plus-jp-vegetable-zosui", name: "野菜雑炊", cuisine: "和食", servingSize: 280, rotationKey: "雑炊", tags: ["雑炊"], ingredients: [part("soft_rice", 140), part("chinese_cabbage", 25), part("carrot", 15), part("egg", 18)], seasonings: [part("broth", 75), part("soy_sauce", 2)], instructions: ["野菜をやわらかく煮る。", "雑炊に仕上げて提供する。"] },
      { id: "single-plus-west-mushroom-risotto", name: "きのこリゾット", cuisine: "洋食", servingSize: 285, rotationKey: "リゾット", tags: ["洋食主食"], ingredients: [part("rice", 135), part("mushrooms", 28), part("onion", 20), part("milk", 20)], seasonings: [part("broth", 45), part("consomme", 2), part("cheese", 8)], instructions: ["具材をやわらかく煮る。", "チーズを加えてリゾットに仕上げる。"] },
      { id: "single-plus-west-tomato-risotto", name: "トマトリゾット", cuisine: "洋食", servingSize: 285, rotationKey: "リゾット", tags: ["洋食主食"], ingredients: [part("rice", 135), part("tomato", 35), part("onion", 20), part("chicken_breast", 25)], seasonings: [part("broth", 45), part("consomme", 2), part("cheese", 6)], instructions: ["具材をやわらかく煮る。", "トマト風味のリゾットに仕上げる。"] },
      { id: "single-plus-west-shrimp-pilaf", name: "えびピラフ", cuisine: "洋食", servingSize: 280, rotationKey: "ピラフ", tags: ["洋食主食"], ingredients: [part("rice", 145), part("shrimp", 35), part("corn", 15), part("onion", 20)], seasonings: [part("consomme", 2), part("butter", 2)], instructions: ["具材をやわらかく加熱する。", "ごはんと合わせてピラフに仕上げる。"] },
      { id: "single-plus-west-vegetable-pilaf", name: "野菜ピラフ", cuisine: "洋食", servingSize: 275, rotationKey: "ピラフ", tags: ["洋食主食"], ingredients: [part("rice", 145), part("corn", 15), part("carrot", 15), part("onion", 18), part("green_peas", 10)], seasonings: [part("consomme", 2), part("butter", 2)], instructions: ["具材をやわらかく加熱する。", "ごはんと合わせて提供する。"] },
      { id: "single-plus-west-corn-risotto", name: "コーンチーズリゾット", cuisine: "洋食", servingSize: 285, rotationKey: "リゾット", tags: ["洋食主食"], ingredients: [part("rice", 135), part("corn", 22), part("onion", 18), part("milk", 22)], seasonings: [part("broth", 45), part("consomme", 2), part("cheese", 8)], instructions: ["具材をやわらかく煮る。", "チーズを加えてリゾットに仕上げる。"] },
      { id: "single-plus-cn-egg-fried-rice", name: "たまご炒飯", cuisine: "中華", servingSize: 275, rotationKey: "中華主食", tags: ["炒飯"], ingredients: [part("rice", 140), part("egg", 22), part("green_peas", 10), part("carrot", 10), part("onion", 15)], seasonings: [part("soy_sauce", 2), part("sesame_oil", 1)], instructions: ["具材をやわらかく加熱する。", "ごはんと合わせてやさしく炒める。"] },
      { id: "single-plus-cn-vegetable-rice", name: "野菜あんかけごはん", cuisine: "中華", servingSize: 295, rotationKey: "中華主食", tags: ["丼もの"], ingredients: [part("rice", 145), part("chinese_cabbage", 25), part("carrot", 15), part("mushrooms", 15), part("tofu", 40)], seasonings: [part("broth", 35), part("soy_sauce", 3), part("starch", 2)], instructions: ["具材をやわらかく煮る。", "あんにしてごはんへかける。"] },
      { id: "single-plus2-jp-oyako-bowl", name: "親子丼", cuisine: "和食", servingSize: 305, rotationKey: "丼", tags: ["丼もの"], ingredients: [part("rice", 145), part("chicken_thigh", 50), part("egg", 30), part("onion", 22)], seasonings: [part("broth", 30), part("soy_sauce", 4), part("mirin", 4)], instructions: ["鶏肉と玉ねぎをやわらかく煮る。", "卵でとじてごはんにのせる。"] },
      { id: "single-plus2-jp-tanin-bowl", name: "他人丼", cuisine: "和食", servingSize: 305, rotationKey: "丼", tags: ["丼もの"], ingredients: [part("rice", 145), part("pork_lean", 50), part("egg", 28), part("onion", 22)], seasonings: [part("broth", 30), part("soy_sauce", 4), part("mirin", 4)], instructions: ["豚肉と玉ねぎをやわらかく煮る。", "卵でとじてごはんにのせる。"] },
      { id: "single-plus2-jp-teriyaki-bowl", name: "鶏照り焼き丼", cuisine: "和食", servingSize: 300, rotationKey: "丼", tags: ["丼もの"], ingredients: [part("rice", 145), part("chicken_thigh", 55), part("komatsuna", 15), part("carrot", 10)], seasonings: [part("soy_sauce", 5), part("mirin", 4), part("sugar", 2)], instructions: ["鶏肉をやわらかく照り焼きにする。", "ごはんに彩りよく盛り付ける。"] },
      { id: "single-plus2-jp-miso-pork-bowl", name: "豚みそ丼", cuisine: "和食", servingSize: 300, rotationKey: "丼", tags: ["丼もの"], ingredients: [part("rice", 145), part("pork_lean", 55), part("onion", 22), part("cabbage", 18)], seasonings: [part("miso", 10), part("mirin", 4), part("broth", 18)], instructions: ["豚肉と野菜をやわらかく煮る。", "みそ味でまとめてごはんにのせる。"] },
      { id: "single-plus2-jp-salmon-egg-bowl", name: "鮭たま丼", cuisine: "和食", servingSize: 300, rotationKey: "丼", tags: ["丼もの"], ingredients: [part("rice", 145), part("salmon", 45), part("egg", 28), part("onion", 18)], seasonings: [part("broth", 28), part("soy_sauce", 3), part("mirin", 3)], instructions: ["鮭をやわらかく煮てほぐす。", "卵と合わせてごはんにのせる。"] },
      { id: "single-plus2-jp-hakusai-bowl", name: "白菜うま煮丼", cuisine: "和食", servingSize: 295, rotationKey: "丼", tags: ["丼もの"], ingredients: [part("rice", 145), part("chinese_cabbage", 30), part("chicken_breast", 40), part("carrot", 12), part("mushrooms", 15)], seasonings: [part("broth", 30), part("light_soy", 3), part("starch", 2)], instructions: ["具材をやわらかく煮る。", "とろみをつけてごはんへかける。"] },
      { id: "single-plus2-jp-kinoko-soboro-bowl", name: "きのこそぼろ丼", cuisine: "和食", servingSize: 300, rotationKey: "丼", tags: ["丼もの"], ingredients: [part("rice", 145), part("chicken_breast", 45), part("mushrooms", 25), part("green_peas", 10)], seasonings: [part("broth", 28), part("soy_sauce", 4), part("mirin", 3)], instructions: ["きのこと鶏そぼろをやわらかく煮る。", "ごはんにのせて提供する。"] },
      { id: "single-plus2-jp-gomoku-rice", name: "五目炊き込みごはん", cuisine: "和食", servingSize: 170, rotationKey: "炊き込みごはん", tags: ["混ぜごはん"], ingredients: [part("rice", 145), part("chicken_breast", 25), part("carrot", 12), part("burdock", 15), part("mushrooms", 18)], seasonings: [part("soy_sauce", 4), part("mirin", 3), part("broth", 18)], instructions: ["具材をやわらかく煮る。", "ごはんに混ぜて炊き込み風に仕上げる。"] },
      { id: "single-plus2-jp-chicken-burdock-rice", name: "鶏ごぼうごはん", cuisine: "和食", servingSize: 168, rotationKey: "炊き込みごはん", tags: ["混ぜごはん"], ingredients: [part("rice", 145), part("chicken_breast", 28), part("burdock", 18), part("carrot", 12)], seasonings: [part("soy_sauce", 4), part("mirin", 3), part("broth", 18)], instructions: ["鶏肉とごぼうをやわらかく煮る。", "ごはんと合わせて提供する。"] },
      { id: "single-plus2-jp-hijiki-rice", name: "ひじきごはん", cuisine: "和食", servingSize: 165, rotationKey: "混ぜごはん", tags: ["混ぜごはん"], ingredients: [part("rice", 145), part("carrot", 12), part("green_peas", 10), part("tofu", 30)], seasonings: [part("soy_sauce", 3), part("mirin", 2), part("broth", 15)], instructions: ["具材をやわらかく煮る。", "ごはんに混ぜて仕上げる。"] },
      { id: "single-plus2-jp-sweetpotato-rice", name: "さつまいもごはん", cuisine: "和食", servingSize: 168, rotationKey: "混ぜごはん", tags: ["混ぜごはん"], ingredients: [part("rice", 145), part("sweet_potato", 30)], seasonings: [part("salt", 0.3), part("broth", 10)], instructions: ["さつまいもをやわらかく加熱する。", "ごはんと合わせて食べやすく仕上げる。"] },
      { id: "single-plus2-jp-kinoko-ankake-udon", name: "きのこあんかけうどん", cuisine: "和食", servingSize: 320, rotationKey: "うどん", tags: ["麺類"], ingredients: [part("udon", 190), part("mushrooms", 28), part("komatsuna", 15), part("tofu", 40)], seasonings: [part("broth", 85), part("soy_sauce", 4), part("starch", 2)], instructions: ["具材をやわらかく煮る。", "うどんにとろみあんをかける。"] },
      { id: "single-plus2-jp-nanban-udon", name: "鶏南蛮うどん", cuisine: "和食", servingSize: 325, rotationKey: "うどん", tags: ["麺類"], ingredients: [part("udon", 190), part("chicken_thigh", 45), part("onion", 18), part("komatsuna", 15)], seasonings: [part("broth", 88), part("soy_sauce", 4), part("mirin", 3)], instructions: ["鶏肉と玉ねぎをやわらかく煮る。", "うどんに合わせて温かく仕上げる。"] },
      { id: "single-plus2-jp-hakusai-toji-udon", name: "白菜とじうどん", cuisine: "和食", servingSize: 320, rotationKey: "うどん", tags: ["麺類"], ingredients: [part("udon", 190), part("chinese_cabbage", 25), part("egg", 25), part("onion", 15)], seasonings: [part("broth", 88), part("soy_sauce", 4)], instructions: ["白菜をやわらかく煮る。", "卵でとじてうどんに合わせる。"] },
      { id: "single-plus2-jp-soft-shoyu-ramen", name: "やわらか醤油ラーメン", cuisine: "和食", servingSize: 320, rotationKey: "ラーメン", tags: ["麺類"], ingredients: [part("chinese_noodles", 180), part("chicken_breast", 35), part("komatsuna", 15), part("corn", 10)], seasonings: [part("broth", 90), part("soy_sauce", 4), part("sesame_oil", 1)], instructions: ["具材をやわらかく煮る。", "しょうゆ味のスープで麺と合わせる。"] },
      { id: "single-plus2-jp-shrimp-udon", name: "えびあんかけうどん", cuisine: "和食", servingSize: 320, rotationKey: "うどん", tags: ["麺類"], ingredients: [part("udon", 190), part("shrimp", 35), part("chinese_cabbage", 20), part("carrot", 12)], seasonings: [part("broth", 85), part("light_soy", 3), part("starch", 2)], instructions: ["えびと野菜をやわらかく煮る。", "とろみあんをうどんへかける。"] },
      { id: "single-plus2-west-curry-rice", name: "カレーライス", cuisine: "洋食", servingSize: 330, rotationKey: "カレー", tags: ["カレー"], ingredients: [part("rice", 150), part("chicken_breast", 55), part("potato", 45), part("onion", 30), part("carrot", 18)], seasonings: [part("curry_roux", 18), part("broth", 55)], instructions: ["具材をやわらかく煮る。", "カレーに仕上げてごはんに添える。"] },
      { id: "single-plus2-west-dry-curry", name: "ドライカレー", cuisine: "洋食", servingSize: 310, rotationKey: "カレー", tags: ["カレー"], ingredients: [part("rice", 145), part("beef_mince", 40), part("onion", 22), part("carrot", 15), part("green_peas", 10)], seasonings: [part("curry_roux", 10), part("ketchup", 5), part("consomme", 2)], instructions: ["具材をやわらかく炒め煮にする。", "ごはんと合わせて仕上げる。"] },
      { id: "single-plus2-west-omelet-rice", name: "オムライス", cuisine: "洋食", servingSize: 310, rotationKey: "洋食主食", tags: ["オムライス"], ingredients: [part("rice", 140), part("egg", 35), part("chicken_breast", 35), part("onion", 18), part("green_peas", 10)], seasonings: [part("ketchup", 10), part("consomme", 2), part("butter", 2)], instructions: ["チキンライスをやわらかく仕上げる。", "卵で包むように整えて提供する。"] },
      { id: "single-plus2-west-mushroom-omelet-rice", name: "きのこオムライス", cuisine: "洋食", servingSize: 310, rotationKey: "洋食主食", tags: ["オムライス"], ingredients: [part("rice", 140), part("egg", 35), part("mushrooms", 22), part("chicken_breast", 30), part("onion", 18)], seasonings: [part("ketchup", 9), part("consomme", 2), part("butter", 2)], instructions: ["具材をやわらかく加熱する。", "卵で包むように整えて提供する。"] },
      { id: "single-plus2-west-chicken-pilaf", name: "チキンピラフ", cuisine: "洋食", servingSize: 285, rotationKey: "ピラフ", tags: ["洋食主食"], ingredients: [part("rice", 145), part("chicken_breast", 38), part("corn", 12), part("onion", 18), part("carrot", 12)], seasonings: [part("consomme", 2), part("butter", 2)], instructions: ["具材をやわらかく加熱する。", "ごはんと合わせてピラフに仕上げる。"] },
      { id: "single-plus2-west-pumpkin-pilaf", name: "かぼちゃピラフ", cuisine: "洋食", servingSize: 285, rotationKey: "ピラフ", tags: ["洋食主食"], ingredients: [part("rice", 145), part("pumpkin", 28), part("onion", 18), part("corn", 12)], seasonings: [part("consomme", 2), part("butter", 2)], instructions: ["かぼちゃをやわらかく加熱する。", "ごはんと合わせて提供する。"] },
      { id: "single-plus2-west-cheese-doria", name: "チーズドリア", cuisine: "洋食", servingSize: 295, rotationKey: "ドリア", tags: ["洋食主食"], ingredients: [part("rice", 140), part("milk", 45), part("onion", 18), part("cheese", 12)], seasonings: [part("consomme", 2), part("butter", 2), part("flour", 4), part("salt", 0.2)], instructions: ["ホワイトソースをやわらかく作る。", "ごはんにかけて焼き色を軽くつける。"] },
      { id: "single-plus2-west-meat-doria", name: "ミートドリア", cuisine: "洋食", servingSize: 300, rotationKey: "ドリア", tags: ["洋食主食"], ingredients: [part("rice", 140), part("beef_mince", 35), part("onion", 18), part("milk", 40), part("cheese", 10)], seasonings: [part("ketchup", 6), part("consomme", 2), part("flour", 4)], instructions: ["ミートソースをやわらかくまとめる。", "ごはんにのせて温かく仕上げる。"] },
      { id: "single-plus2-west-cream-pasta", name: "クリームパスタ", cuisine: "洋食", servingSize: 270, rotationKey: "パスタ", tags: ["パスタ"], ingredients: [part("pasta", 180), part("chicken_breast", 35), part("onion", 15), part("milk", 35)], seasonings: [part("milk", 35), part("butter", 3), part("flour", 4), part("consomme", 1), part("salt", 0.2)], instructions: ["具材をやわらかく加熱する。", "クリームソースでパスタに合わせる。"] },
      { id: "single-plus2-west-napolitan", name: "ナポリタン", cuisine: "洋食", servingSize: 270, rotationKey: "パスタ", tags: ["パスタ"], ingredients: [part("pasta", 180), part("chicken_breast", 35), part("onion", 18), part("bell_pepper", 12)], seasonings: [part("ketchup", 9), part("consomme", 2)], instructions: ["具材をやわらかく加熱する。", "ケチャップ味でパスタに仕上げる。"] },
      { id: "single-plus2-west-pumpkin-cream-pasta", name: "かぼちゃクリームパスタ", cuisine: "洋食", servingSize: 270, rotationKey: "パスタ", tags: ["パスタ"], ingredients: [part("pasta", 180), part("pumpkin", 26), part("onion", 15), part("milk", 35)], seasonings: [part("milk", 35), part("butter", 3), part("flour", 4), part("consomme", 1), part("salt", 0.2)], instructions: ["かぼちゃをやわらかく煮る。", "クリームソースでパスタに合わせる。"] },
      { id: "single-plus2-west-broccoli-meat-pasta", name: "ブロッコリーミートパスタ", cuisine: "洋食", servingSize: 270, rotationKey: "パスタ", tags: ["パスタ"], ingredients: [part("pasta", 180), part("beef_mince", 38), part("broccoli", 20), part("tomato", 28)], seasonings: [part("ketchup", 7), part("consomme", 2)], instructions: ["具材をやわらかく煮てソースにする。", "パスタに合わせて提供する。"] },
      { id: "single-plus2-west-corn-cheese-pasta", name: "コーンチーズパスタ", cuisine: "洋食", servingSize: 265, rotationKey: "パスタ", tags: ["パスタ", "チーズ"], ingredients: [part("pasta", 175), part("corn", 20), part("onion", 15), part("cheese", 10)], seasonings: [part("consomme", 2), part("butter", 2), part("milk", 18)], instructions: ["具材をやわらかく加熱する。", "チーズを合わせてパスタに仕上げる。"] },
      { id: "single-plus2-west-egg-sand-plate", name: "たまごサンドプレート", cuisine: "洋食", servingSize: 240, rotationKey: "パン主食", tags: ["パン主食"], ingredients: [part("bread", 75), part("egg", 35), part("cabbage", 15), part("potato", 25)], seasonings: [part("butter", 4), part("salt", 0.2)], instructions: ["具材を食べやすく整える。", "パンにはさんで主食プレートにまとめる。"] },
      { id: "single-plus2-west-chicken-sand-plate", name: "チキンサンドプレート", cuisine: "洋食", servingSize: 250, rotationKey: "パン主食", tags: ["パン主食"], ingredients: [part("roll_bread", 80), part("chicken_breast", 40), part("cabbage", 15), part("tomato", 12)], seasonings: [part("butter", 4), part("salt", 0.2), part("pepper", 0.05)], instructions: ["鶏肉をやわらかく加熱する。", "パンにはさんで食べやすく仕上げる。"] },
      { id: "single-plus2-west-french-toast-plate", name: "フレンチトーストプレート", cuisine: "洋食", servingSize: 235, rotationKey: "パン主食", tags: ["パン主食"], ingredients: [part("bread", 75), part("egg", 25), part("milk", 35), part("pumpkin", 20)], seasonings: [part("sugar", 4), part("butter", 2)], instructions: ["パンを卵液に浸してやわらかく焼く。", "付け合わせを添えて提供する。"] },
      { id: "single-plus2-west-meat-gratin", name: "ミートマカロニグラタン", cuisine: "洋食", servingSize: 290, rotationKey: "グラタン", tags: ["洋食主食"], ingredients: [part("pasta", 165), part("beef_mince", 35), part("onion", 18), part("milk", 40), part("cheese", 10)], seasonings: [part("consomme", 2), part("butter", 2), part("flour", 4)], instructions: ["具材をやわらかく加熱する。", "ホワイトソースでまとめて温かく仕上げる。"] },
      { id: "single-plus2-cn-chuka-bowl", name: "中華丼", cuisine: "中華", servingSize: 305, rotationKey: "丼", tags: ["丼もの"], ingredients: [part("rice", 145), part("pork_lean", 45), part("chinese_cabbage", 25), part("carrot", 12), part("mushrooms", 15)], seasonings: [part("broth", 35), part("soy_sauce", 3), part("starch", 2)], instructions: ["具材をやわらかく煮る。", "中華あんをごはんへかける。"] },
      { id: "single-plus2-cn-mabo-bowl", name: "麻婆丼", cuisine: "中華", servingSize: 305, rotationKey: "丼", tags: ["丼もの"], ingredients: [part("rice", 145), part("tofu", 85), part("pork_mince", 25), part("onion", 15)], seasonings: [part("miso", 8), part("soy_sauce", 3), part("broth", 22), part("starch", 2)], instructions: ["豆腐とそぼろをやわらかく煮る。", "とろみをつけてごはんへかける。"] },
      { id: "single-plus2-cn-tenshinhan", name: "天津飯", cuisine: "中華", servingSize: 300, rotationKey: "丼", tags: ["丼もの"], ingredients: [part("rice", 145), part("egg", 40), part("green_peas", 10), part("mushrooms", 15)], seasonings: [part("broth", 30), part("soy_sauce", 3), part("starch", 2)], instructions: ["卵をやわらかくまとめる。", "あんをかけてごはんにのせる。"] },
      { id: "single-plus2-cn-gomoku-fried-rice", name: "五目炒飯", cuisine: "中華", servingSize: 280, rotationKey: "中華主食", tags: ["炒飯"], ingredients: [part("rice", 140), part("chicken_breast", 30), part("egg", 20), part("green_peas", 10), part("carrot", 10), part("onion", 15)], seasonings: [part("soy_sauce", 2), part("sesame_oil", 1)], instructions: ["具材をやわらかく加熱する。", "ごはんと合わせて食べやすく炒める。"] },
      { id: "single-plus2-cn-pork-fried-rice", name: "豚肉炒飯", cuisine: "中華", servingSize: 280, rotationKey: "中華主食", tags: ["炒飯"], ingredients: [part("rice", 140), part("pork_lean", 35), part("egg", 18), part("onion", 15), part("carrot", 10)], seasonings: [part("soy_sauce", 2), part("sesame_oil", 1)], instructions: ["具材をやわらかく加熱する。", "ごはんと合わせて仕上げる。"] },
      { id: "single-plus2-cn-chicken-ankake-fried-rice", name: "鶏あんかけ炒飯", cuisine: "中華", servingSize: 295, rotationKey: "中華主食", tags: ["炒飯"], ingredients: [part("rice", 140), part("chicken_breast", 35), part("egg", 18), part("chinese_cabbage", 20), part("carrot", 10)], seasonings: [part("broth", 28), part("soy_sauce", 3), part("starch", 2)], instructions: ["炒飯をやさしく仕上げる。", "鶏あんをかけて提供する。"] },
      { id: "single-plus2-cn-gomoku-yakisoba", name: "五目あんかけ焼きそば", cuisine: "中華", servingSize: 305, rotationKey: "焼きそば", tags: ["麺類"], ingredients: [part("chinese_noodles", 175), part("pork_lean", 35), part("chinese_cabbage", 22), part("carrot", 12), part("mushrooms", 15)], seasonings: [part("broth", 35), part("soy_sauce", 3), part("starch", 2)], instructions: ["具材をやわらかく煮る。", "あんを麺へかけて提供する。"] },
      { id: "single-plus2-cn-shio-yakisoba", name: "鶏塩焼きそば", cuisine: "中華", servingSize: 300, rotationKey: "焼きそば", tags: ["麺類"], ingredients: [part("chinese_noodles", 175), part("chicken_breast", 35), part("bean_sprouts", 22), part("cabbage", 20)], seasonings: [part("broth", 18), part("salt", 0.4), part("sesame_oil", 1)], instructions: ["具材をやわらかく加熱する。", "塩味で麺と合わせて仕上げる。"] },
      { id: "single-plus2-cn-kinoko-yakisoba", name: "きのこあんかけ焼きそば", cuisine: "中華", servingSize: 300, rotationKey: "焼きそば", tags: ["麺類"], ingredients: [part("chinese_noodles", 175), part("mushrooms", 25), part("chinese_cabbage", 20), part("carrot", 12), part("tofu", 35)], seasonings: [part("broth", 35), part("soy_sauce", 3), part("starch", 2)], instructions: ["具材をやわらかく煮る。", "あんを麺へかけて提供する。"] },
      { id: "single-plus2-cn-pork-vegetable-bowl", name: "豚肉白菜中華丼", cuisine: "中華", servingSize: 305, rotationKey: "丼", tags: ["丼もの"], ingredients: [part("rice", 145), part("pork_lean", 45), part("chinese_cabbage", 30), part("carrot", 12), part("onion", 15)], seasonings: [part("broth", 35), part("oyster_sauce", 3), part("starch", 2)], instructions: ["具材をやわらかく煮る。", "中華あんをかけてごはんにのせる。"] },
      { id: "single-plus2-cn-tofu-mabo-rice", name: "豆腐麻婆あんかけごはん", cuisine: "中華", servingSize: 300, rotationKey: "丼", tags: ["丼もの"], ingredients: [part("rice", 145), part("tofu", 90), part("pork_mince", 20), part("onion", 15), part("green_peas", 10)], seasonings: [part("miso", 8), part("soy_sauce", 3), part("broth", 22), part("starch", 2)], instructions: ["豆腐とそぼろをやわらかく煮る。", "あんにしてごはんへかける。"] },
      { id: "single-plus2-cn-chicken-shio-men", name: "鶏塩あんかけ麺", cuisine: "中華", servingSize: 320, rotationKey: "麺類", tags: ["麺類"], ingredients: [part("chinese_noodles", 180), part("chicken_breast", 35), part("chinese_cabbage", 20), part("corn", 10)], seasonings: [part("broth", 85), part("salt", 0.4), part("starch", 2)], instructions: ["具材をやわらかく煮る。", "塩味のあんを麺へかける。"] },
      { id: "single-plus2-cn-hakusai-ramen", name: "白菜あんかけラーメン", cuisine: "中華", servingSize: 325, rotationKey: "ラーメン", tags: ["麺類"], ingredients: [part("chinese_noodles", 180), part("chinese_cabbage", 28), part("pork_lean", 30), part("carrot", 12)], seasonings: [part("broth", 88), part("soy_sauce", 4), part("starch", 2)], instructions: ["具材をやわらかく煮る。", "あんをのせて麺と合わせる。"] },
      { id: "single-plus2-cn-seafood-ramen", name: "海鮮風塩ラーメン", cuisine: "中華", servingSize: 325, rotationKey: "ラーメン", tags: ["麺類"], ingredients: [part("chinese_noodles", 180), part("shrimp", 30), part("white_fish", 25), part("komatsuna", 15)], seasonings: [part("broth", 88), part("salt", 0.4), part("sesame_oil", 1)], instructions: ["具材をやわらかく煮る。", "塩味のスープで麺と合わせる。"] },
      { id: "single-plus2-cn-shrimp-porridge", name: "えび中華粥", cuisine: "中華", servingSize: 285, rotationKey: "中華粥", tags: ["中華主食"], ingredients: [part("soft_rice", 140), part("shrimp", 30), part("egg", 15), part("komatsuna", 12)], seasonings: [part("broth", 75), part("salt", 0.3), part("sesame_oil", 1)], instructions: ["具材をやわらかく煮る。", "中華粥に仕上げて提供する。"] },
      { id: "single-plus2-cn-egg-porridge", name: "中華風たまご粥", cuisine: "中華", servingSize: 280, rotationKey: "中華粥", tags: ["中華主食"], ingredients: [part("soft_rice", 140), part("egg", 25), part("onion", 15), part("komatsuna", 12)], seasonings: [part("broth", 75), part("salt", 0.3), part("sesame_oil", 1)], instructions: ["具材をやわらかく煮る。", "卵を加えて中華粥に仕上げる。"] },
      { id: "single-plus2-cn-champon-udon", name: "ちゃんぽん風うどん", cuisine: "中華", servingSize: 325, rotationKey: "うどん", tags: ["麺類"], ingredients: [part("udon", 190), part("chicken_breast", 35), part("chinese_cabbage", 20), part("carrot", 12), part("corn", 10)], seasonings: [part("broth", 88), part("soy_sauce", 3), part("sesame_oil", 1)], instructions: ["具材をやわらかく煮る。", "うどんに合わせてちゃんぽん風に仕上げる。"] },
      { id: "single-plus2-cn-gomoku-ankake-udon", name: "五目あんかけうどん", cuisine: "中華", servingSize: 325, rotationKey: "うどん", tags: ["麺類"], description: "やわらかく茹でたうどんに中華あんをかけた、食べやすい完成主食。", notes: "主食の完成メニューとして扱い、具とうどんを分割しないこと。", ingredients: [part("udon", 190), part("chicken_breast", 35), part("chinese_cabbage", 20), part("carrot", 12), part("mushrooms", 15)], seasonings: [part("broth", 88), part("soy_sauce", 3), part("sesame_oil", 1), part("starch", 2)], instructions: ["うどんをやわらかめに茹でる。", "野菜と具材を食べやすく煮る。", "中華あんを作ってとろみをつける。", "うどんにかけて仕上げる。"] },
      { id: "single-plus2-jp-sansai-soba", name: "山菜そば", cuisine: "和食", servingSize: 320, rotationKey: "そば", tags: ["麺類", "そば"], description: "だしの旨味を活かした、食べやすいそばの完成主食です。", notes: "麺はやや短めにし、山菜はやわらかく煮て提供する。", ingredients: [part("udon", 180, { label: "そば", prep: "やや短めにしてやわらかく仕上げる" }), part("komatsuna", 20, { label: "山菜ミックス", prep: "食べやすい長さに整える" }), part("carrot", 10, { prep: "細切り" })], seasonings: [part("broth", 220, { label: "だし" }), part("light_soy", 7), part("mirin", 4)], instructions: ["そばをやわらかめに茹でて短めに整える。", "山菜とにんじんをだしでやわらかく煮る。", "調味してそばにかけて仕上げる。"], nutrition: { energy: 338, protein: 11.6, fat: 4.1, carbs: 61.8, fiber: 3.9, salt: 2.4 } },
      { id: "single-plus2-jp-tanuki-soba", name: "たぬきそば", cuisine: "和食", servingSize: 315, rotationKey: "そば", tags: ["麺類", "そば"], description: "だしの香りを活かした、親しみやすいそばの完成主食です。", notes: "麺は短めにし、天かすは少量でつゆを含ませて食べやすくする。", ingredients: [part("udon", 180, { label: "そば", prep: "やや短めにしてやわらかく仕上げる" }), part("onion", 12, { label: "天かす", prep: "少量を使用" }), part("komatsuna", 12, { label: "青ねぎ", prep: "やわらかくする" })], seasonings: [part("broth", 220, { label: "だし" }), part("light_soy", 7), part("mirin", 4)], instructions: ["そばをやわらかめに茹でて短めに整える。", "だしを温めて調味する。", "そばに具をのせて仕上げる。"], nutrition: { energy: 352, protein: 10.9, fat: 6.3, carbs: 60.5, fiber: 2.8, salt: 2.5 } },
      { id: "single-plus2-jp-kitsune-soba", name: "きつねそば", cuisine: "和食", servingSize: 325, rotationKey: "そば", tags: ["麺類", "そば"], description: "味を含ませた具材でやさしく仕上げる、定番のそば主食です。", notes: "油揚げは甘辛くやわらかく煮て、麺は短めに仕上げる。", ingredients: [part("udon", 180, { label: "そば", prep: "やや短めにしてやわらかく仕上げる" }), part("tofu", 35, { label: "油揚げ", prep: "やわらかく煮る" }), part("komatsuna", 12, { label: "青ねぎ", prep: "やわらかくする" })], seasonings: [part("broth", 220, { label: "だし" }), part("light_soy", 7), part("mirin", 5), part("sugar", 2)], instructions: ["油揚げを甘辛くやわらかく煮る。", "そばをやわらかめに茹でて短めに整える。", "だしを温めて具をのせて仕上げる。"], nutrition: { energy: 361, protein: 12.4, fat: 6.8, carbs: 60.9, fiber: 3.1, salt: 2.5 } },
      { id: "single-plus2-jp-tsukimi-soba", name: "月見そば", cuisine: "和食", servingSize: 320, rotationKey: "そば", tags: ["麺類", "そば"], description: "卵のやわらかさを活かし、のどごし良く仕上げたそばの完成主食です。", notes: "卵はやわらかく仕上げ、麺は短めにして提供する。", ingredients: [part("udon", 180, { label: "そば", prep: "やや短めにしてやわらかく仕上げる" }), part("egg", 35, { prep: "やわらかく加熱する" }), part("komatsuna", 10, { label: "青ねぎ", prep: "やわらかくする" })], seasonings: [part("broth", 220, { label: "だし" }), part("light_soy", 7), part("mirin", 4)], instructions: ["そばをやわらかめに茹でて短めに整える。", "だしを温めて調味する。", "卵をやわらかく加熱してのせ、仕上げる。"], nutrition: { energy: 348, protein: 13.1, fat: 6.2, carbs: 58.7, fiber: 2.6, salt: 2.4 } },
      { id: "single-plus2-jp-kakitama-soba", name: "かき玉そば", cuisine: "和食", servingSize: 325, rotationKey: "そば", tags: ["麺類", "そば"], description: "卵でつゆをやさしくまとめた、飲み込みやすいそばの完成主食です。", notes: "卵はふんわり仕上げ、軽いとろみでつゆをまとわせる。", ingredients: [part("udon", 180, { label: "そば", prep: "やや短めにしてやわらかく仕上げる" }), part("egg", 40), part("onion", 12, { label: "長ねぎ", prep: "やわらかく煮る" })], seasonings: [part("broth", 220, { label: "だし" }), part("light_soy", 7), part("mirin", 4), part("starch", 2)], instructions: ["そばをやわらかめに茹でて短めに整える。", "だしを温めて軽くとろみをつける。", "溶き卵を流し入れてふんわり仕上げる。"], nutrition: { energy: 354, protein: 13.6, fat: 6.1, carbs: 59.8, fiber: 2.5, salt: 2.5 } },
      { id: "single-plus2-jp-nishin-soba", name: "にしんそば", cuisine: "和食", servingSize: 330, rotationKey: "そば", tags: ["麺類", "そば"], description: "やわらかく煮た魚をのせ、だしの旨味で食べやすくしたそばの完成主食です。", notes: "魚は骨に注意し、やわらかく煮てから提供する。", ingredients: [part("udon", 180, { label: "そば", prep: "やや短めにしてやわらかく仕上げる" }), part("salmon", 45, { label: "にしん甘露煮風", prep: "骨に注意してやわらかく煮る" }), part("onion", 10, { label: "長ねぎ", prep: "やわらかく煮る" })], seasonings: [part("broth", 220, { label: "だし" }), part("light_soy", 7), part("mirin", 5), part("sugar", 2)], instructions: ["魚をやわらかく煮て味を含ませる。", "そばをやわらかめに茹でて短めに整える。", "だしを温め、魚をのせて仕上げる。"], nutrition: { energy: 372, protein: 16.2, fat: 7.3, carbs: 58.9, fiber: 2.4, salt: 2.6 } },
      { id: "single-plus2-jp-tori-nanban-soba", name: "鶏南蛮そば", cuisine: "和食", servingSize: 330, rotationKey: "そば", tags: ["麺類", "そば"], description: "鶏肉と長ねぎをやわらかく仕上げた、だしの風味豊かなそばの完成主食です。", notes: "鶏肉は小さめにし、長ねぎは十分にやわらかく煮る。", ingredients: [part("udon", 180, { label: "そば", prep: "やや短めにしてやわらかく仕上げる" }), part("chicken_thigh", 45, { prep: "小さめに切る" }), part("onion", 20, { label: "長ねぎ", prep: "やわらかく煮る" })], seasonings: [part("broth", 220, { label: "だし" }), part("light_soy", 7), part("mirin", 5)], instructions: ["鶏肉と長ねぎをだしでやわらかく煮る。", "そばをやわらかめに茹でて短めに整える。", "温かいつゆを注いで仕上げる。"], nutrition: { energy: 381, protein: 16.8, fat: 7.8, carbs: 60.1, fiber: 2.7, salt: 2.6 } },
      { id: "single-plus2-jp-gomoku-ankake-soba", name: "五目あんかけそば", cuisine: "中華", servingSize: 340, rotationKey: "そば", tags: ["麺類", "そば", "とろみ"], description: "具だくさんのあんをかけ、とろみでまとめた食べやすいそばの完成主食です。", notes: "主食の完成メニューとして扱い、具とそばを分割しない。具材は小さめにそろえる。", ingredients: [part("udon", 180, { label: "そば", prep: "やや短めにしてやわらかく仕上げる" }), part("chicken_breast", 30, { label: "鶏肉", prep: "小さめに切る" }), part("chinese_cabbage", 20, { label: "白菜", prep: "やわらかく煮る" }), part("carrot", 15, { prep: "細切り" }), part("mushrooms", 12, { label: "しいたけ", prep: "小さめに切る" })], seasonings: [part("broth", 220, { label: "中華だし" }), part("soy_sauce", 7), part("mirin", 3), part("starch", 3)], instructions: ["具材を食べやすい大きさにそろえてやわらかく煮る。", "調味して片栗粉でとろみをつける。", "そばにあんをかけて仕上げる。"], nutrition: { energy: 392, protein: 15.2, fat: 6.8, carbs: 64.5, fiber: 3.6, salt: 2.7 } },
      { id: "single-plus2-jp-yawaraka-niku-soba", name: "やわらか肉そば", cuisine: "和食", servingSize: 330, rotationKey: "そば", tags: ["麺類", "そば"], description: "薄切り肉をやわらかく煮てのせた、食べやすいそばの完成主食です。", notes: "肉は薄切りでやわらかく煮含め、麺は短めにして提供する。", ingredients: [part("udon", 180, { label: "そば", prep: "やや短めにしてやわらかく仕上げる" }), part("pork_lean", 45, { label: "やわらか肉", prep: "薄切りでやわらかく煮る" }), part("onion", 18, { label: "長ねぎ", prep: "やわらかく煮る" })], seasonings: [part("broth", 220, { label: "だし" }), part("light_soy", 7), part("mirin", 5), part("sugar", 2)], instructions: ["肉を薄切りでやわらかく煮含める。", "そばをやわらかめに茹でて短めに整える。", "温かいつゆと一緒に盛り付ける。"], nutrition: { energy: 387, protein: 16.4, fat: 8.1, carbs: 60.3, fiber: 2.7, salt: 2.6 } },
      { id: "single-plus2-jp-kinoko-negi-soba", name: "きのこと長ねぎのそば", cuisine: "和食", servingSize: 320, rotationKey: "そば", tags: ["麺類", "そば", "きのこ"], description: "きのこの旨味と長ねぎの甘みを活かした、やさしい味わいのそばの完成主食です。", notes: "きのこは細かめにし、長ねぎはやわらかく煮て食べやすくする。", ingredients: [part("udon", 180, { label: "そば", prep: "やや短めにしてやわらかく仕上げる" }), part("mushrooms", 25, { label: "きのこ", prep: "食べやすく切る" }), part("onion", 22, { label: "長ねぎ", prep: "やわらかく煮る" })], seasonings: [part("broth", 220, { label: "だし" }), part("light_soy", 7), part("mirin", 4)], instructions: ["きのこと長ねぎをだしでやわらかく煮る。", "そばをやわらかめに茹でて短めに整える。", "温かいつゆを注いで仕上げる。"], nutrition: { energy: 341, protein: 11.9, fat: 4.5, carbs: 61.2, fiber: 3.4, salt: 2.5 } },
      { id: "single-plus2-west-meat-sauce-spaghetti-2", name: "ミートソーススパゲティ", cuisine: "洋食", servingSize: 275, rotationKey: "パスタ", tags: ["パスタ"], description: "しっとりしたミートソースで食べやすく仕上げたパスタ主食です。", notes: "麺はやや短めにし、ひき肉と野菜は細かくしてなじませる。", ingredients: [part("pasta", 180, { prep: "やや短めに仕上げる" }), part("beef_mince", 42), part("onion", 20), part("carrot", 12), part("tomato", 28)], seasonings: [part("ketchup", 8), part("consomme", 2), part("butter", 2)], instructions: ["パスタをやわらかめに茹でる。", "具材を細かくしてやわらかく煮る。", "ソースと合わせてしっとり仕上げる。"], nutrition: { energy: 386, protein: 14.8, fat: 8.2, carbs: 61.5, fiber: 3.8, salt: 2.2 } },
      { id: "single-plus2-west-napolitan-soft-2", name: "ナポリタン", cuisine: "洋食", servingSize: 272, rotationKey: "パスタ", tags: ["パスタ"], description: "ケチャップのやさしい酸味で食べやすくまとめたパスタ主食です。", notes: "麺は短めにし、具材は小さめでやわらかく仕上げる。", ingredients: [part("pasta", 180, { prep: "やや短めに仕上げる" }), part("chicken_breast", 35), part("onion", 18), part("bell_pepper", 10), part("carrot", 10)], seasonings: [part("ketchup", 9), part("consomme", 2), part("butter", 2)], instructions: ["パスタをやわらかめに茹でる。", "具材を食べやすく加熱する。", "ケチャップ味でしっとり仕上げる。"], nutrition: { energy: 378, protein: 14.2, fat: 7.4, carbs: 60.8, fiber: 3.3, salt: 2.1 } },
      { id: "single-plus2-west-cream-pasta-soft-2", name: "クリームパスタ", cuisine: "洋食", servingSize: 274, rotationKey: "パスタ", tags: ["パスタ"], description: "なめらかなソースでしっとり食べやすく仕上げたパスタ主食です。", notes: "麺は短めにし、ソースはゆるめにして飲み込みやすくする。", ingredients: [part("pasta", 180, { prep: "やや短めに仕上げる" }), part("chicken_breast", 34), part("onion", 15), part("milk", 38)], seasonings: [part("milk", 38), part("butter", 3), part("flour", 4), part("consomme", 1), part("salt", 0.2)], instructions: ["パスタをやわらかめに茹でる。", "具材をやわらかく加熱する。", "クリームソースと合わせてしっとり仕上げる。"], nutrition: { energy: 382, protein: 14.6, fat: 8.7, carbs: 58.9, fiber: 2.3, salt: 1.9 } },
      { id: "single-plus2-jp-wafu-kinoko-pasta-2", name: "和風きのこパスタ", cuisine: "和食", servingSize: 265, rotationKey: "パスタ", tags: ["パスタ"], description: "だしときのこの旨味を活かした、やさしい和風のパスタ主食です。", notes: "麺は短めにし、きのこは細かくして食べやすくする。", ingredients: [part("pasta", 175, { prep: "やや短めに仕上げる" }), part("mushrooms", 30), part("onion", 15), part("chicken_breast", 28)], seasonings: [part("soy_sauce", 4), part("butter", 2), part("broth", 20, { label: "和風だし" })], instructions: ["パスタをやわらかめに茹でる。", "きのこと具材をやわらかく加熱する。", "和風の味でしっとり仕上げる。"], nutrition: { energy: 371, protein: 14.9, fat: 6.9, carbs: 59.6, fiber: 3.4, salt: 2.0 } },
      { id: "single-plus2-west-tarako-pasta", name: "たらこパスタ", cuisine: "洋食", servingSize: 260, rotationKey: "パスタ", tags: ["パスタ"], description: "たらこの旨味をやさしくまとめた、食べやすいパスタ主食です。", notes: "麺は短めにし、たらこは全体になじませて塩分が強くなりすぎないようにする。", ingredients: [part("pasta", 175, { prep: "やや短めに仕上げる" }), part("salmon", 25, { label: "たらこ", prep: "全体にほぐしてなじませる" }), part("onion", 12), part("broccoli", 16, { label: "刻みのり風彩り", prep: "やわらかく仕上げる" })], seasonings: [part("butter", 3), part("light_soy", 2), part("broth", 12, { label: "だし" })], instructions: ["パスタをやわらかめに茹でる。", "具材をなじませるように温める。", "全体を和えてしっとり仕上げる。"], nutrition: { energy: 364, protein: 13.8, fat: 7.1, carbs: 58.1, fiber: 2.8, salt: 1.9 } },
      { id: "single-plus2-west-tuna-spinach-pasta", name: "ツナとほうれん草のパスタ", cuisine: "洋食", servingSize: 268, rotationKey: "パスタ", tags: ["パスタ"], description: "ツナの旨味とほうれん草の彩りを活かした食べやすいパスタ主食です。", notes: "麺は短めにし、ツナは細かくして全体になじませる。", ingredients: [part("pasta", 175, { prep: "やや短めに仕上げる" }), part("salmon", 32, { label: "ツナ", prep: "細かくほぐす" }), part("spinach", 18), part("onion", 14)], seasonings: [part("consomme", 2), part("butter", 2), part("milk", 16)], instructions: ["パスタをやわらかめに茹でる。", "具材を食べやすく加熱する。", "全体を合わせてしっとり仕上げる。"], nutrition: { energy: 372, protein: 15.1, fat: 7.6, carbs: 58.7, fiber: 3.2, salt: 1.8 } },
      { id: "single-plus2-west-kinoko-tomato-pasta", name: "きのこのトマトパスタ", cuisine: "洋食", servingSize: 270, rotationKey: "パスタ", tags: ["パスタ"], description: "きのこの旨味をトマトでまとめた、やさしい味わいのパスタ主食です。", notes: "麺は短めにし、きのこは小さくして口当たりをやわらかくする。", ingredients: [part("pasta", 180, { prep: "やや短めに仕上げる" }), part("mushrooms", 30), part("tomato", 30), part("onion", 16)], seasonings: [part("ketchup", 7), part("consomme", 2), part("butter", 2)], instructions: ["パスタをやわらかめに茹でる。", "きのこと野菜をやわらかく煮る。", "トマト味でしっとり仕上げる。"], nutrition: { energy: 368, protein: 12.6, fat: 6.8, carbs: 60.4, fiber: 3.7, salt: 2.0 } },
      { id: "single-plus2-west-chicken-vegetable-soft-pasta", name: "鶏肉と野菜のやわらかパスタ", cuisine: "洋食", servingSize: 275, rotationKey: "パスタ", tags: ["パスタ"], description: "鶏肉と野菜をやわらかく合わせた、しっとり食べやすいパスタ主食です。", notes: "麺は短めにし、鶏肉と野菜は小さめにそろえてやわらかくする。", ingredients: [part("pasta", 180, { prep: "やや短めに仕上げる" }), part("chicken_breast", 38), part("carrot", 12), part("broccoli", 18), part("onion", 16)], seasonings: [part("consomme", 2), part("milk", 18), part("butter", 2)], instructions: ["パスタをやわらかめに茹でる。", "鶏肉と野菜を食べやすく加熱する。", "ソースと合わせてしっとり仕上げる。"], nutrition: { energy: 379, protein: 15.4, fat: 7.5, carbs: 59.3, fiber: 3.5, salt: 1.9 } },
      { id: "single-plus2-west-pumpkin-cream-pasta-2", name: "かぼちゃのクリームパスタ", cuisine: "洋食", servingSize: 272, rotationKey: "パスタ", tags: ["パスタ"], description: "かぼちゃの甘みを活かし、なめらかに仕上げたパスタ主食です。", notes: "麺は短めにし、かぼちゃはしっかりやわらかくしてソースになじませる。", ingredients: [part("pasta", 180, { prep: "やや短めに仕上げる" }), part("pumpkin", 28), part("onion", 14), part("milk", 36)], seasonings: [part("milk", 36), part("butter", 3), part("flour", 4), part("consomme", 1), part("salt", 0.2)], instructions: ["パスタをやわらかめに茹でる。", "かぼちゃをやわらかく煮る。", "クリームソースと合わせてなめらかに仕上げる。"], nutrition: { energy: 381, protein: 13.2, fat: 8.4, carbs: 60.2, fiber: 3.3, salt: 1.8 } },
      { id: "single-plus2-west-cabbage-bacon-style-pasta", name: "キャベツとベーコン風パスタ", cuisine: "洋食", servingSize: 270, rotationKey: "パスタ", tags: ["パスタ"], description: "キャベツの甘みとベーコン風の旨味を合わせた食べやすいパスタ主食です。", notes: "麺は短めにし、ベーコン風具材はかたさと塩分に配慮してやわらかく仕上げる。", ingredients: [part("pasta", 178, { prep: "やや短めに仕上げる" }), part("pork_lean", 32, { label: "ベーコン風", prep: "小さくしてやわらかく加熱する" }), part("cabbage", 22), part("onion", 14)], seasonings: [part("consomme", 2), part("butter", 2), part("milk", 12)], instructions: ["パスタをやわらかめに茹でる。", "具材を食べやすくやわらかく加熱する。", "全体を合わせてしっとり仕上げる。"], nutrition: { energy: 376, protein: 14.1, fat: 7.8, carbs: 58.9, fiber: 3.1, salt: 2.0 } },
      { id: "single-plus2-jp-kitsune-udon-2", name: "きつねうどん", cuisine: "和食", servingSize: 325, rotationKey: "うどん", tags: ["麺類", "うどん"], description: "だしの旨味を活かした、食べやすいうどんの完成主食です。", notes: "麺はやや短めにし、油揚げはやわらかく煮て提供する。", ingredients: [part("udon", 190, { prep: "やや短めにしてやわらかく仕上げる" }), part("tofu", 35, { label: "油揚げ", prep: "やわらかく煮る" }), part("onion", 12, { label: "長ねぎ", prep: "やわらかく煮る" })], seasonings: [part("broth", 220, { label: "だし" }), part("light_soy", 7), part("mirin", 5), part("sugar", 2)], instructions: ["油揚げを甘辛くやわらかく煮る。", "うどんをやわらかめに茹でて短めに整える。", "だしを温めて盛り付ける。"], nutrition: { energy: 368, protein: 11.9, fat: 6.7, carbs: 63.1, fiber: 2.8, salt: 2.5 } },
      { id: "single-plus2-jp-tanuki-udon-2", name: "たぬきうどん", cuisine: "和食", servingSize: 318, rotationKey: "うどん", tags: ["麺類", "うどん"], description: "だしの風味を活かし、やさしい味わいに仕上げたうどんの完成主食です。", notes: "麺は短めにし、天かすは少量でつゆを含ませて食べやすくする。", ingredients: [part("udon", 190, { prep: "やや短めにしてやわらかく仕上げる" }), part("onion", 12, { label: "天かす", prep: "少量を使用" }), part("komatsuna", 12, { label: "青ねぎ", prep: "やわらかくする" })], seasonings: [part("broth", 220, { label: "だし" }), part("light_soy", 7), part("mirin", 4)], instructions: ["うどんをやわらかめに茹でて短めに整える。", "だしを温めて調味する。", "具をのせて温かく仕上げる。"], nutrition: { energy: 359, protein: 10.7, fat: 6.1, carbs: 62.0, fiber: 2.3, salt: 2.4 } },
      { id: "single-plus2-jp-tsukimi-udon-2", name: "月見うどん", cuisine: "和食", servingSize: 322, rotationKey: "うどん", tags: ["麺類", "うどん"], description: "卵のやわらかさを活かし、のどごし良く仕上げたうどんの完成主食です。", notes: "卵はやわらかく仕上げ、麺は短めにして提供する。", ingredients: [part("udon", 190, { prep: "やや短めにしてやわらかく仕上げる" }), part("egg", 35, { prep: "やわらかく加熱する" }), part("onion", 10, { label: "長ねぎ", prep: "やわらかく煮る" })], seasonings: [part("broth", 220, { label: "だし" }), part("light_soy", 7), part("mirin", 4)], instructions: ["うどんをやわらかめに茹でて短めに整える。", "だしを温めて調味する。", "卵をやわらかく加熱してのせ、仕上げる。"], nutrition: { energy: 362, protein: 12.8, fat: 5.8, carbs: 62.4, fiber: 1.9, salt: 2.4 } },
      { id: "single-plus2-jp-kakitama-udon-2", name: "かき玉うどん", cuisine: "和食", servingSize: 328, rotationKey: "うどん", tags: ["麺類", "うどん", "とろみ"], description: "卵でつゆをやさしくまとめた、飲み込みやすいうどんの完成主食です。", notes: "卵はふんわり仕上げ、軽いとろみでつゆをまとわせる。", ingredients: [part("udon", 190, { prep: "やや短めにしてやわらかく仕上げる" }), part("egg", 40), part("onion", 12, { label: "長ねぎ", prep: "やわらかく煮る" })], seasonings: [part("broth", 220, { label: "だし" }), part("light_soy", 7), part("mirin", 4), part("starch", 2)], instructions: ["うどんをやわらかめに茹でて短めに整える。", "だしを温めて軽くとろみをつける。", "溶き卵を流し入れてふんわり仕上げる。"], nutrition: { energy: 371, protein: 13.4, fat: 5.9, carbs: 63.0, fiber: 1.9, salt: 2.5 } },
      { id: "single-plus2-jp-niku-udon-2", name: "肉うどん", cuisine: "和食", servingSize: 332, rotationKey: "うどん", tags: ["麺類", "うどん"], description: "やわらかい肉とだしの旨味で食べやすく仕上げたうどんの完成主食です。", notes: "肉は薄切りでやわらかく煮含め、長ねぎは十分にやわらかくする。", ingredients: [part("udon", 190, { prep: "やや短めにしてやわらかく仕上げる" }), part("pork_lean", 45, { label: "やわらか肉", prep: "薄切りでやわらかく煮る" }), part("onion", 18, { label: "長ねぎ", prep: "やわらかく煮る" })], seasonings: [part("broth", 220, { label: "だし" }), part("light_soy", 7), part("mirin", 5), part("sugar", 2)], instructions: ["肉を薄切りでやわらかく煮含める。", "うどんをやわらかめに茹でて短めに整える。", "温かいつゆと一緒に盛り付ける。"], nutrition: { energy: 389, protein: 16.1, fat: 8.0, carbs: 61.2, fiber: 2.0, salt: 2.6 } },
      { id: "single-plus2-jp-tori-nanban-udon-2", name: "鶏南蛮うどん", cuisine: "和食", servingSize: 332, rotationKey: "うどん", tags: ["麺類", "うどん"], description: "鶏肉と長ねぎをやわらかく仕上げた、だしの風味豊かなうどんの完成主食です。", notes: "鶏肉は小さめにし、長ねぎは十分にやわらかく煮る。", ingredients: [part("udon", 190, { prep: "やや短めにしてやわらかく仕上げる" }), part("chicken_thigh", 45, { prep: "小さめに切る" }), part("onion", 20, { label: "長ねぎ", prep: "やわらかく煮る" })], seasonings: [part("broth", 220, { label: "だし" }), part("light_soy", 7), part("mirin", 5)], instructions: ["鶏肉と長ねぎをだしでやわらかく煮る。", "うどんをやわらかめに茹でて短めに整える。", "温かいつゆを注いで仕上げる。"], nutrition: { energy: 384, protein: 16.5, fat: 7.6, carbs: 61.0, fiber: 2.1, salt: 2.6 } },
      { id: "single-plus2-cn-gomoku-ankake-udon-2", name: "五目あんかけうどん", cuisine: "中華", servingSize: 340, rotationKey: "うどん", tags: ["麺類", "うどん", "とろみ"], description: "具だくさんのあんをかけ、とろみでまとめた食べやすいうどんの完成主食です。", notes: "主食の完成メニューとして扱い、具とうどんを分割しない。具材は小さめにそろえる。", ingredients: [part("udon", 190, { prep: "やや短めにしてやわらかく仕上げる" }), part("chicken_breast", 30, { label: "鶏肉", prep: "小さめに切る" }), part("chinese_cabbage", 20, { label: "白菜", prep: "やわらかく煮る" }), part("carrot", 15, { prep: "細切り" }), part("mushrooms", 12, { label: "しいたけ", prep: "小さめに切る" })], seasonings: [part("broth", 220, { label: "中華だし" }), part("soy_sauce", 7), part("mirin", 3), part("starch", 3)], instructions: ["具材を食べやすい大きさにそろえてやわらかく煮る。", "調味して片栗粉でとろみをつける。", "うどんにあんをかけて仕上げる。"], nutrition: { energy: 396, protein: 15.0, fat: 6.7, carbs: 65.9, fiber: 3.5, salt: 2.7 } },
      { id: "single-plus2-jp-kinoko-ankake-udon-2", name: "きのこあんかけうどん", cuisine: "和食", servingSize: 324, rotationKey: "うどん", tags: ["麺類", "うどん", "きのこ", "とろみ"], description: "きのこの旨味を活かし、とろみで食べやすくまとめたうどんの完成主食です。", notes: "麺は短めにし、きのこは細かくしてあんになじませる。", ingredients: [part("udon", 190, { prep: "やや短めにしてやわらかく仕上げる" }), part("mushrooms", 28, { label: "きのこ", prep: "食べやすく切る" }), part("tofu", 35), part("komatsuna", 12)], seasonings: [part("broth", 220, { label: "だし" }), part("soy_sauce", 4), part("light_soy", 2), part("starch", 3)], instructions: ["きのこをやわらかく煮る。", "調味して軽いとろみをつける。", "うどんにあんをかけて仕上げる。"], nutrition: { energy: 374, protein: 13.1, fat: 5.3, carbs: 64.2, fiber: 3.0, salt: 2.5 } },
      { id: "single-plus2-jp-soft-curry-udon", name: "やわらかカレーうどん", cuisine: "和食", servingSize: 338, rotationKey: "うどん", tags: ["麺類", "うどん", "カレー"], description: "辛味を控えめにし、だしの旨味で食べやすく仕上げたカレーうどんの完成主食です。", notes: "麺は短めにし、カレーは辛味を控えめにしてやわらかくまとめる。", ingredients: [part("udon", 190, { prep: "やや短めにしてやわらかく仕上げる" }), part("chicken_thigh", 38), part("onion", 20, { label: "長ねぎ", prep: "やわらかく煮る" }), part("carrot", 12)], seasonings: [part("broth", 220, { label: "だし" }), part("curry_roux", 12), part("mirin", 3), part("starch", 2)], instructions: ["具材をやわらかく煮る。", "だしでのばしたカレーで味を整える。", "うどんにかけて温かく仕上げる。"], nutrition: { energy: 401, protein: 14.2, fat: 8.3, carbs: 66.1, fiber: 2.6, salt: 2.6 } },
      { id: "single-plus2-jp-wakame-udon-2", name: "わかめうどん", cuisine: "和食", servingSize: 318, rotationKey: "うどん", tags: ["麺類", "うどん"], description: "わかめの風味を活かした、やさしい味わいのうどんの完成主食です。", notes: "麺は短めにし、わかめはやわらかく戻して食べやすくする。", ingredients: [part("udon", 190, { prep: "やや短めにしてやわらかく仕上げる" }), part("wakame", 8, { prep: "やわらかく戻して食べやすく切る" }), part("onion", 10, { label: "長ねぎ", prep: "やわらかく煮る" })], seasonings: [part("broth", 220, { label: "だし" }), part("light_soy", 7), part("mirin", 4)], instructions: ["わかめをやわらかく戻す。", "うどんをやわらかめに茹でて短めに整える。", "だしを温めて盛り付ける。"], nutrition: { energy: 349, protein: 10.8, fat: 4.4, carbs: 62.3, fiber: 2.5, salt: 2.4 } }
    ];
    return definitions.map(dish);
  }
  function buildAdditionalSoupRecipes() {
    const recipes = [];
    const japaneseBases = [
      { key: "daikon", label: "大根", ingredients: [part("daikon", 35)] },
      { key: "komatsuna", label: "小松菜", ingredients: [part("komatsuna", 28)] },
      { key: "carrot", label: "にんじん", ingredients: [part("carrot", 30)] },
      { key: "onion", label: "玉ねぎ", ingredients: [part("onion", 30)] },
      { key: "sweetpotato", label: "さつまいも", ingredients: [part("sweet_potato", 30)] },
      { key: "potato", label: "じゃがいも", ingredients: [part("potato", 32)] },
      { key: "cabbage", label: "キャベツ", ingredients: [part("cabbage", 30)] },
      { key: "spinach", label: "ほうれん草", ingredients: [part("spinach", 26)] },
      { key: "tofu-onion", label: "豆腐と玉ねぎ", ingredients: [part("tofu", 30), part("onion", 15)] },
      { key: "mushroom-daikon", label: "きのこと大根", ingredients: [part("mushrooms", 20), part("daikon", 20)] }
    ];
    const japaneseMethods = [
      { key: "miso", label: "味噌汁", servingSize: 150, seasonings: [part("broth", 120), part("miso", 10)], instructions: ["具材をやわらかく煮る。", "味噌を溶いて温かく仕上げる。"] },
      { key: "clear", label: "すまし汁", servingSize: 150, seasonings: [part("broth", 125), part("light_soy", 3)], instructions: ["具材をやわらかく煮る。", "だしを生かして薄味で仕上げる。"] }
    ];
    japaneseBases.forEach((base, baseIndex) => {
      japaneseMethods.forEach((method) => {
        recipes.push(createRecipe({ id: `plus-jp-soup-${baseIndex}-${method.key}`, name: `${base.label}${method.label}`, category: "汁物", cuisine: "和食", servingSize: method.servingSize, rotationKey: `和食追加汁物-${method.key}`, tags: ["追加レシピ", "汁物"], description: `${base.label}を使った食べやすい${method.label}。`, ingredients: base.ingredients, seasonings: method.seasonings, instructions: method.instructions }));
      });
    });
    const westernBases = [
      { key: "tomato", label: "トマト", ingredients: [part("tomato", 35), part("onion", 12)] },
      { key: "pumpkin", label: "かぼちゃ", ingredients: [part("pumpkin", 35), part("onion", 10)] },
      { key: "sweetpotato", label: "さつまいも", ingredients: [part("sweet_potato", 35), part("onion", 10)] },
      { key: "carrot", label: "にんじん", ingredients: [part("carrot", 35), part("onion", 10)] },
      { key: "mushroom", label: "きのこ", ingredients: [part("mushrooms", 30), part("onion", 12)] }
    ];
    const westernMethods = [
      { key: "consomme", label: "コンソメスープ", servingSize: 150, seasonings: [part("broth", 120), part("consomme", 3)], instructions: ["具材をやわらかく煮る。", "コンソメで味を整えて仕上げる。"] },
      { key: "potage", label: "ポタージュ", servingSize: 150, seasonings: [part("milk", 55), part("butter", 3), part("flour", 4), part("consomme", 1), part("salt", 0.2), part("pepper", 0.05)], instructions: ["具材をやわらかく煮る。", "牛乳でのばしてなめらかに仕上げる。"] },
      { key: "milk", label: "ミルクスープ", servingSize: 150, seasonings: [part("milk", 60), part("broth", 55), part("consomme", 1), part("salt", 0.2)], instructions: ["具材をやわらかく煮る。", "ミルクを加えてやさしく仕上げる。"] }
    ];
    westernBases.forEach((base, baseIndex) => {
      westernMethods.forEach((method) => {
        recipes.push(createRecipe({ id: `plus-west-soup-${baseIndex}-${method.key}`, name: `${base.label}${method.label}`, category: "汁物", cuisine: "洋食", servingSize: method.servingSize, rotationKey: `洋食追加汁物-${method.key}`, tags: ["追加レシピ", "汁物"], description: `${base.label}を使ったやさしい${method.label}。`, ingredients: base.ingredients, seasonings: method.seasonings, instructions: method.instructions }));
      });
    });
    const chineseBases = [
      { key: "tofu", label: "豆腐", ingredients: [part("tofu", 35), part("onion", 10)] },
      { key: "corn", label: "コーン", ingredients: [part("corn", 25), part("egg", 14)] },
      { key: "mushroom", label: "きのこ", ingredients: [part("mushrooms", 28), part("komatsuna", 12)] },
      { key: "tomato", label: "トマト", ingredients: [part("tomato", 28), part("egg", 14)] },
      { key: "greens", label: "青菜", ingredients: [part("komatsuna", 24), part("tofu", 20)] }
    ];
    const chineseMethods = [
      { key: "soup", label: "中華スープ", servingSize: 150, seasonings: [part("broth", 120), part("soy_sauce", 2), part("sesame_oil", 1)], instructions: ["具材をやわらかく煮る。", "中華風に味を整える。"] },
      { key: "thick", label: "とろみスープ", servingSize: 150, seasonings: [part("broth", 118), part("soy_sauce", 2), part("starch", 2)], instructions: ["具材をやわらかく煮る。", "ゆるいとろみをつけて仕上げる。"] },
      { key: "soft", label: "やわらかスープ", servingSize: 150, seasonings: [part("broth", 120), part("salt", 0.3), part("sesame_oil", 1)], instructions: ["具材をやわらかく煮る。", "あっさりした塩味で仕上げる。"] }
    ];
    chineseBases.forEach((base, baseIndex) => {
      chineseMethods.forEach((method) => {
        recipes.push(createRecipe({ id: `plus-cn-soup-${baseIndex}-${method.key}`, name: `${base.label}${method.label}`, category: "汁物", cuisine: "中華", servingSize: method.servingSize, rotationKey: `中華追加汁物-${method.key}`, tags: ["追加レシピ", "汁物"], description: `${base.label}を使った食べやすい${method.label}。`, ingredients: base.ingredients, seasonings: method.seasonings, instructions: method.instructions }));
      });
    });
    const misoAdditions = [
      { id: "plus-jp-miso-extra-tofu-komatsuna", name: "豆腐と小松菜のお味噌汁", ingredients: [part("tofu", 30), part("komatsuna", 18)], description: "だしの旨味を活かした、やわらかく食べやすい定番のお味噌汁です。", notes: "豆腐は小さめの角切りにし、小松菜は短めに切る。" },
      { id: "plus-jp-miso-extra-tofu-onion", name: "豆腐と玉ねぎのお味噌汁", ingredients: [part("tofu", 30), part("onion", 18)], description: "玉ねぎの甘みが出やすい、やさしい味わいのお味噌汁です。", notes: "玉ねぎは薄切りにしてやわらかく煮る。" },
      { id: "plus-jp-miso-extra-tofu-cabbage", name: "豆腐とキャベツのお味噌汁", ingredients: [part("tofu", 28), part("cabbage", 20)], description: "キャベツの甘みを活かした、口当たりのやさしいお味噌汁です。", notes: "キャベツはやわらかく煮て、繊維を感じにくくする。" },
      { id: "plus-jp-miso-extra-tofu-carrot", name: "豆腐とにんじんのお味噌汁", ingredients: [part("tofu", 28), part("carrot", 16)], description: "彩りを添えつつ食べやすく仕上げるお味噌汁です。", notes: "にんじんは薄切りまたは千切りでやわらかく煮る。" },
      { id: "plus-jp-miso-extra-sweetpotato", name: "さつまいものお味噌汁", ingredients: [part("sweet_potato", 34)], description: "甘みのある具材で、満足感を出しやすいお味噌汁です。", notes: "さつまいもは小さめに切り、やわらかく煮る。" },
      { id: "plus-jp-miso-extra-sweetpotato-onion", name: "さつまいもと玉ねぎのお味噌汁", ingredients: [part("sweet_potato", 26), part("onion", 16)], description: "甘みのある具材を組み合わせた、やさしい味わいのお味噌汁です。", notes: "玉ねぎは薄切りにし、さつまいもは崩れすぎない程度に煮る。" },
      { id: "plus-jp-miso-extra-potato-onion", name: "じゃがいもと玉ねぎのお味噌汁", ingredients: [part("potato", 26), part("onion", 16)], description: "定番の組み合わせで食べやすく仕上げるお味噌汁です。", notes: "じゃがいもはひと口大より小さめに切る。" },
      { id: "plus-jp-miso-extra-potato-komatsuna", name: "じゃがいもと小松菜のお味噌汁", ingredients: [part("potato", 24), part("komatsuna", 14)], description: "だしの旨味を感じやすい、やわらかな具材のお味噌汁です。", notes: "小松菜は短めに切って提供しやすくする。" },
      { id: "plus-jp-miso-extra-pumpkin-spinach", name: "かぼちゃとほうれん草のお味噌汁", ingredients: [part("pumpkin", 24), part("spinach", 14)], description: "彩りがよく、甘みのある具材でやさしく仕上げるお味噌汁です。", notes: "かぼちゃはやわらかく煮て、ほうれん草は短く切る。" },
      { id: "plus-jp-miso-extra-pumpkin-onion", name: "かぼちゃと玉ねぎのお味噌汁", ingredients: [part("pumpkin", 24), part("onion", 16)], description: "自然な甘みで食べやすく、満足感も出しやすいお味噌汁です。", notes: "かぼちゃは煮崩れしすぎないよう火加減を調整する。" },
      { id: "plus-jp-miso-extra-daikon-carrot", name: "大根とにんじんのお味噌汁", ingredients: [part("daikon", 22), part("carrot", 14)], description: "だしの旨味を活かしやすい、定番で安心感のあるお味噌汁です。", notes: "大根とにんじんは薄切りでやわらかく煮る。" },
      { id: "plus-jp-miso-extra-daikon-komatsuna", name: "大根と小松菜のお味噌汁", ingredients: [part("daikon", 22), part("komatsuna", 14)], description: "やさしい食感と彩りを両立しやすいお味噌汁です。", notes: "大根はやわらかく煮て、小松菜は短めに切る。" },
      { id: "plus-jp-miso-extra-cabbage-onion", name: "キャベツと玉ねぎのお味噌汁", ingredients: [part("cabbage", 20), part("onion", 16)], description: "野菜の甘みを感じやすく、塩分を上げすぎず満足感を出しやすいお味噌汁です。", notes: "キャベツは食べやすい大きさに切ってやわらかく煮る。" },
      { id: "plus-jp-miso-extra-hakusai-tofu", name: "白菜と豆腐のお味噌汁", ingredients: [part("chinese_cabbage", 22), part("tofu", 28)], description: "やわらかな白菜と豆腐で食べやすく整えたお味噌汁です。", notes: "白菜は短めに切り、豆腐は小さめの角切りにする。" },
      { id: "plus-jp-miso-extra-hakusai-mushroom", name: "白菜ときのこのお味噌汁", ingredients: [part("chinese_cabbage", 22), part("mushrooms", 16)], description: "きのこの旨味を活かしながら、やさしい味わいに仕上げるお味噌汁です。", notes: "白菜はやわらかく煮て、きのこは食べやすく切る。" },
      { id: "plus-jp-miso-extra-mushroom-tofu", name: "きのこと豆腐のお味噌汁", ingredients: [part("mushrooms", 18), part("tofu", 28)], description: "だしときのこの旨味を感じやすい、定番のお味噌汁です。", notes: "豆腐は小さめに切り、きのこはやわらかく煮る。" },
      { id: "plus-jp-miso-extra-mushroom-komatsuna", name: "きのこと小松菜のお味噌汁", ingredients: [part("mushrooms", 18), part("komatsuna", 14)], description: "旨味と彩りの両方を出しやすいお味噌汁です。", notes: "小松菜は葉先まで短めに切り、きのこはやわらかく加熱する。" },
      { id: "plus-jp-miso-extra-spinach-onion", name: "ほうれん草と玉ねぎのお味噌汁", ingredients: [part("spinach", 16), part("onion", 16)], description: "彩りがよく、玉ねぎの甘みで食べやすく仕上がるお味噌汁です。", notes: "ほうれん草は短く切り、玉ねぎは透き通るまで煮る。" },
      { id: "plus-jp-miso-extra-carrot-onion", name: "にんじんと玉ねぎのお味噌汁", ingredients: [part("carrot", 16), part("onion", 16)], description: "やさしい甘みで高齢者向けに提供しやすいお味噌汁です。", notes: "にんじんは薄切りにして口当たりをやわらかくする。" },
      { id: "plus-jp-miso-extra-daikon-tofu", name: "大根と豆腐のお味噌汁", ingredients: [part("daikon", 22), part("tofu", 28)], description: "定番具材を食べやすく仕上げた、安心感のあるお味噌汁です。", notes: "大根は薄切りでやわらかく煮て、豆腐は崩れないよう静かに加える。" },
      { id: "plus-jp-miso-extra-cabbage-komatsuna", name: "キャベツと小松菜のお味噌汁", ingredients: [part("cabbage", 18), part("komatsuna", 14)], description: "やわらかな葉物を合わせ、彩りよく仕上げるお味噌汁です。", notes: "キャベツと小松菜は短めに切って提供しやすくする。" },
      { id: "plus-jp-miso-extra-potato-cabbage", name: "じゃがいもとキャベツのお味噌汁", ingredients: [part("potato", 24), part("cabbage", 18)], description: "じゃがいものやわらかさで満足感を出しやすいお味噌汁です。", notes: "じゃがいもは小さめに切り、キャベツはやわらかく煮る。" }
    ];
    misoAdditions.forEach((definition) => {
      recipes.push(createRecipe({
        id: definition.id,
        name: definition.name,
        category: "汁物",
        cuisine: "和食",
        servingSize: 150,
        rotationKey: "和食追加汁物-miso",
        tags: ["追加レシピ", "汁物", "味噌汁"],
        description: definition.description,
        notes: definition.notes,
        ingredients: definition.ingredients,
        seasonings: [part("broth", 120), part("miso", 10)],
        instructions: ["具材を食べやすい大きさに切る。", "だしでやわらかく煮る。", "味噌を溶いて温かく仕上げる。"]
      }));
    });
    recipes.push(
      createRecipe({ id: "plus-cn-soup-soft-egg", name: "ふんわり卵スープ", category: "汁物", cuisine: "中華", servingSize: 150, rotationKey: "中華追加汁物-卵", tags: ["追加レシピ", "汁物", "中華"], description: "卵をふんわり仕上げた、やさしい中華風スープ。", notes: "薄くとろみをつけると、冷めにくく飲み込みやすい。", ingredients: [part("egg", 18)], seasonings: [part("broth", 120), part("soy_sauce", 2), part("starch", 1), part("sesame_oil", 1)], instructions: ["鶏ガラスープを温める。", "軽くとろみをつける。", "溶き卵を流し入れてふんわり仕上げる。"] }),
      createRecipe({ id: "plus-cn-soup-tofu-lettuce", name: "豆腐とレタスのスープ", category: "汁物", cuisine: "中華", servingSize: 150, rotationKey: "中華追加汁物-豆腐", tags: ["追加レシピ", "汁物", "中華"], description: "豆腐とレタスをやさしく仕上げた、軽い中華風スープ。", notes: "レタスは加熱しすぎず、やわらかくなったところで仕上げる。", ingredients: [part("tofu", 30), part("chinese_cabbage", 18, { label: "レタス", prep: "食べやすい大きさにちぎる" })], seasonings: [part("broth", 120), part("soy_sauce", 1), part("salt", 0.2), part("sesame_oil", 1)], instructions: ["スープを温める。", "豆腐を食べやすく切って加える。", "レタスを最後に入れて軽く火を通す。"] }),
      createRecipe({ id: "plus-cn-soup-wonton", name: "ワンタンスープ", category: "汁物", cuisine: "中華", servingSize: 150, rotationKey: "中華追加汁物-ワンタン", tags: ["追加レシピ", "汁物", "中華"], description: "つるりと食べやすいワンタンが入った中華風スープ。", notes: "ワンタンの具は少なめにし、皮の食感を活かす。", ingredients: [part("flour", 18, { label: "ワンタンの皮", prep: "やわらかく仕上がるサイズに整える" }), part("pork_mince", 12, { label: "ワンタンの具" }), part("chinese_cabbage", 12), part("onion", 8)], seasonings: [part("broth", 120), part("soy_sauce", 2), part("sesame_oil", 1)], instructions: ["スープを整える。", "ワンタンをやわらかく加熱する。", "火を通しすぎず、つるりとした食感で提供する。"] })
    );
    return recipes;
  }
  function buildAdditionalMainRecipes() {
    const recipes = [];
    const japaneseProteins = [
      { label: "鮭", id: "salmon", grams: 90, rotationKey: "魚" },
      { label: "白身魚", id: "white_fish", grams: 90, rotationKey: "魚" },
      { label: "鶏もも", id: "chicken_thigh", grams: 90, rotationKey: "鶏" },
      { label: "豚肉", id: "pork_lean", grams: 85, rotationKey: "豚" },
      { label: "豆腐", id: "tofu", grams: 120, rotationKey: "豆腐" }
    ];
    const japaneseMethods = [
      { key: "ginger", label: "の生姜煮", ingredients: [part("onion", 15)], seasonings: [part("broth", 20), part("soy_sauce", 5), part("mirin", 4), part("sugar", 1)], instructions: ["主材料をやわらかく煮る。", "甘辛くまとめて仕上げる。"] },
      { key: "negi-miso", label: "のねぎ味噌焼き", ingredients: [part("onion", 20)], seasonings: [part("miso", 8), part("mirin", 4), part("sugar", 1)], instructions: ["主材料をやわらかく加熱する。", "ねぎ味噌をのせて仕上げる。"] },
      { key: "mizore", label: "のみぞれ煮", ingredients: [part("daikon", 25)], seasonings: [part("broth", 22), part("light_soy", 4), part("starch", 2)], instructions: ["主材料をやわらかく煮る。", "大根おろし風のあんでまとめる。"] },
      { key: "goma", label: "の胡麻煮", ingredients: [part("carrot", 15)], seasonings: [part("broth", 20), part("soy_sauce", 4), part("sesame", 3), part("sugar", 1)], instructions: ["主材料をやわらかく煮る。", "胡麻の風味で仕上げる。"] }
    ];
    japaneseProteins.forEach((protein, proteinIndex) => {
      japaneseMethods.forEach((method) => {
        recipes.push(createRecipe({ id: `plus-jp-main-${proteinIndex}-${method.key}`, name: `${protein.label}${method.label}`, category: "主菜", cuisine: "和食", servingSize: protein.grams + 42, rotationKey: protein.rotationKey, tags: ["追加レシピ", "主菜"], description: `${protein.label}をやわらかく仕上げた和食の主菜。`, ingredients: [part(protein.id, protein.grams), ...method.ingredients], seasonings: method.seasonings, instructions: method.instructions }));
      });
    });
    const westernProteins = [
      { label: "チキン", id: "chicken_thigh", grams: 90, rotationKey: "鶏" },
      { label: "ポーク", id: "pork_lean", grams: 85, rotationKey: "豚" },
      { label: "白身魚", id: "white_fish", grams: 90, rotationKey: "魚" },
      { label: "鮭", id: "salmon", grams: 90, rotationKey: "魚" },
      { label: "豆腐", id: "tofu", grams: 120, rotationKey: "豆腐" }
    ];
    const westernMethods = [
      { key: "lemon", label: "のレモンソテー", ingredients: [part("carrot", 16)], seasonings: [part("butter", 2), part("salt", 0.2), part("pepper", 0.05)], instructions: ["主材料をやわらかく焼く。", "付け合わせとともに仕上げる。"] },
      { key: "mushroom", label: "のきのこソース", ingredients: [part("mushrooms", 20), part("onion", 18)], seasonings: [part("broth", 20), part("consomme", 2), part("starch", 1)], instructions: ["主材料をやわらかく加熱する。", "きのこソースをかけて仕上げる。"] },
      { key: "milk", label: "のミルク煮", ingredients: [part("onion", 18)], seasonings: [part("milk", 45), part("butter", 2), part("flour", 3), part("consomme", 1), part("salt", 0.2), part("pepper", 0.05)], instructions: ["主材料をやわらかく加熱する。", "ミルクソースでまとめる。"] }
    ];
    westernProteins.forEach((protein, proteinIndex) => {
      westernMethods.forEach((method) => {
        recipes.push(createRecipe({ id: `plus-west-main-${proteinIndex}-${method.key}`, name: `${protein.label}${method.label}`, category: "主菜", cuisine: "洋食", servingSize: protein.grams + 42, rotationKey: protein.rotationKey, tags: ["追加レシピ", "主菜"], description: `${protein.label}を食べやすく仕上げた洋食の主菜。`, ingredients: [part(protein.id, protein.grams), ...method.ingredients], seasonings: method.seasonings, instructions: method.instructions }));
      });
    });
    const chineseProteins = [
      { label: "鶏肉", id: "chicken_thigh", grams: 90, rotationKey: "鶏" },
      { label: "豚肉", id: "pork_lean", grams: 85, rotationKey: "豚" },
      { label: "白身魚", id: "white_fish", grams: 90, rotationKey: "魚" },
      { label: "豆腐", id: "tofu", grams: 120, rotationKey: "豆腐" },
      { label: "えび", id: "shrimp", grams: 80, rotationKey: "海鮮" }
    ];
    const chineseMethods = [
      { key: "greens-an", label: "の青菜あん", ingredients: [part("komatsuna", 20)], seasonings: [part("broth", 25), part("soy_sauce", 3), part("starch", 2)], instructions: ["主材料をやわらかく加熱する。", "青菜あんをかけて仕上げる。"] },
      { key: "soy-braise", label: "のしょうゆ煮込み", ingredients: [part("chinese_cabbage", 20)], seasonings: [part("broth", 20), part("soy_sauce", 4), part("sesame_oil", 1)], instructions: ["主材料をやわらかく煮る。", "しょうゆ味でまとめる。"] },
      { key: "salt-stir", label: "のやわらか塩炒め", ingredients: [part("onion", 16), part("bell_pepper", 12)], seasonings: [part("broth", 18), part("salt", 0.3), part("sesame_oil", 1)], instructions: ["主材料と野菜をやわらかく加熱する。", "塩味で食べやすく仕上げる。"] }
    ];
    chineseProteins.forEach((protein, proteinIndex) => {
      chineseMethods.forEach((method) => {
        recipes.push(createRecipe({ id: `plus-cn-main-${proteinIndex}-${method.key}`, name: `${protein.label}${method.label}`, category: "主菜", cuisine: "中華", servingSize: protein.grams + 42, rotationKey: protein.rotationKey, tags: ["追加レシピ", "主菜"], description: `${protein.label}をやわらかく仕上げた中華の主菜。`, ingredients: [part(protein.id, protein.grams), ...method.ingredients], seasonings: method.seasonings, instructions: method.instructions }));
      });
    });
    recipes.push(
      createRecipe({ id: "plus-cn-main-soft-mabo-tofu", name: "やわらか麻婆豆腐", category: "主菜", cuisine: "中華", servingSize: 165, rotationKey: "豆腐", tags: ["追加レシピ", "主菜", "中華"], description: "辛味を控えめにし、豆腐を食べやすく仕上げた中華風主菜。", notes: "豆腐は小さめに切り、とろみをしっかりつけて提供する。", ingredients: [part("tofu", 110), part("pork_mince", 25), part("onion", 16), part("green_peas", 8)], seasonings: [part("broth", 22), part("miso", 7), part("soy_sauce", 3), part("starch", 2), part("sesame_oil", 1)], instructions: ["豆腐は小さめの角切りにする。", "ひき肉と調味料をやさしい味で煮る。", "豆腐を加えて崩しすぎないように温める。", "片栗粉でとろみをつけて仕上げる。"] }),
      createRecipe({ id: "plus-cn-main-whitefish-ankake", name: "白身魚の中華あんかけ", category: "主菜", cuisine: "中華", servingSize: 155, rotationKey: "魚", tags: ["追加レシピ", "主菜", "中華"], description: "白身魚に野菜あんをかけ、しっとり食べやすく仕上げた主菜。", notes: "魚は骨に注意し、あんを多めにしてパサつきを防ぐ。", ingredients: [part("white_fish", 90), part("carrot", 15), part("onion", 18), part("mushrooms", 16)], seasonings: [part("broth", 24), part("soy_sauce", 3), part("oyster_sauce", 2), part("starch", 2)], instructions: ["白身魚は蒸すかやわらかく加熱する。", "人参、玉ねぎ、椎茸をやわらかく煮る。", "だしと調味料であんを作る。", "片栗粉でとろみをつけ、魚にかける。"] }),
      createRecipe({ id: "plus-cn-main-meatballs-amazu", name: "肉団子の甘酢煮", category: "主菜", cuisine: "中華", servingSize: 160, rotationKey: "鶏", tags: ["追加レシピ", "主菜", "中華"], description: "ふんわり肉団子を甘酢で食べやすく仕上げた中華風主菜。", notes: "鶏ひき肉に豆腐を混ぜ、冷めても固くなりにくくする。", ingredients: [part("chicken_breast", 60, { label: "鶏ひき肉" }), part("tofu", 35), part("onion", 12), part("carrot", 10)], seasonings: [part("broth", 16), part("vinegar", 4), part("sugar", 2), part("soy_sauce", 2), part("starch", 1)], instructions: ["鶏ひき肉と豆腐を混ぜて団子を作る。", "食べやすい大きさで加熱する。", "甘酢だれを作り、団子を煮からめる。", "必要に応じて軽くとろみをつける。"] }),
      createRecipe({ id: "plus-cn-main-soft-kanitama", name: "ふんわりカニ玉", category: "主菜", cuisine: "中華", servingSize: 150, rotationKey: "卵", tags: ["追加レシピ", "主菜", "中華"], description: "卵をやわらかく仕上げ、あんをかけて食べやすくした主菜。", notes: "卵は火を通しすぎず、やわらかさを残す。", ingredients: [part("egg", 55), part("white_fish", 20, { label: "かに風味具材" }), part("onion", 15), part("green_peas", 8)], seasonings: [part("broth", 18), part("soy_sauce", 2), part("starch", 2)], instructions: ["卵液に具材を合わせる。", "やわらかく火を通して丸くまとめる。", "醤油ベースのあんを作る。", "上からあんをかけて仕上げる。"] }),
      createRecipe({ id: "plus-cn-main-soft-ebitama", name: "ふんわりエビ玉", category: "主菜", cuisine: "中華", servingSize: 150, rotationKey: "卵", tags: ["追加レシピ", "主菜", "中華"], description: "卵とえびをやわらかくまとめ、あんでしっとり仕上げた主菜。", notes: "えびは小さく切るかやわらかいサイズを使う。", ingredients: [part("egg", 55), part("shrimp", 28), part("onion", 12), part("green_peas", 8)], seasonings: [part("broth", 18), part("soy_sauce", 2), part("starch", 2)], instructions: ["卵液にえびを合わせる。", "やわらかく焼いてまとめる。", "薄い醤油あんを作る。", "上からあんをかける。"] }),
      createRecipe({ id: "plus-cn-main-shrimp-chili", name: "エビのチリソース炒め", category: "主菜", cuisine: "中華", servingSize: 152, rotationKey: "海鮮", tags: ["追加レシピ", "主菜", "中華"], description: "小さめのえびを甘めのチリソースで食べやすく仕上げた主菜。", notes: "えびは小さめを使用し、ソースはケチャップベースで辛味を控えめにする。", ingredients: [part("shrimp", 70), part("onion", 18), part("tomato", 22), part("green_peas", 8)], seasonings: [part("broth", 12), part("ketchup", 8), part("vinegar", 2), part("sugar", 1.5), part("soy_sauce", 1.5), part("starch", 1)], instructions: ["えびは食べやすい大きさで下処理する。", "ソースを合わせてやさしい味に整える。", "えびを加熱し、ソースをからめる。", "必要に応じて軽くとろみをつける。"] }),
      createRecipe({ id: "plus-cn-main-chicken-soft-soybeans", name: "鶏肉とやわらか大豆の炒め物", category: "主菜", cuisine: "中華", servingSize: 160, rotationKey: "鶏", tags: ["追加レシピ", "主菜", "中華"], description: "鶏肉とやわらかい大豆を中華風に炒め合わせた食べやすい主菜。", notes: "カシューナッツの代わりにやわらかい大豆を使い、かたさを抑える。", ingredients: [part("chicken_breast", 75), part("tofu", 35, { label: "やわらか大豆" }), part("onion", 16), part("carrot", 10)], seasonings: [part("broth", 14), part("soy_sauce", 2.5), part("oyster_sauce", 2), part("sesame_oil", 1)], instructions: ["鶏肉を食べやすい大きさに切る。", "やわらかい大豆を用意する。", "調味料で炒め合わせる。", "汁気を少し残してしっとり仕上げる。"] }),
      createRecipe({ id: "plus-cn-main-hoikoro", name: "回鍋肉（ホイコーロー）", category: "主菜", cuisine: "中華", servingSize: 158, rotationKey: "豚", tags: ["追加レシピ", "主菜", "中華"], description: "豚肉とキャベツをやわらかく仕上げた中華風主菜。", notes: "豚肉は薄切り、キャベツはしっかり加熱してやわらかくする。味付けは濃すぎないようにする。", ingredients: [part("pork_lean", 75), part("cabbage", 30), part("onion", 16), part("bell_pepper", 10)], seasonings: [part("broth", 14), part("miso", 6), part("soy_sauce", 2.5), part("sesame_oil", 1)], instructions: ["豚肉を薄切りにする。", "キャベツを食べやすく切る。", "具材をやわらかく炒め煮にする。", "調味料を合わせて仕上げる。"] }),
      createRecipe({ id: "plus-cn-main-happosai", name: "八宝菜", category: "主菜", cuisine: "中華", servingSize: 165, rotationKey: "中華煮", tags: ["追加レシピ", "主菜", "中華"], description: "具材を食べやすい大きさにそろえ、とろみでまとめた中華風主菜。", notes: "具材の大きさをそろえ、片栗粉でしっかりまとめて食べやすくする。", ingredients: [part("pork_lean", 32), part("shrimp", 24), part("chinese_cabbage", 28), part("carrot", 12), part("mushrooms", 15), part("onion", 12)], seasonings: [part("broth", 24), part("soy_sauce", 3), part("oyster_sauce", 2), part("starch", 2)], instructions: ["具材を食べやすい大きさに切る。", "やわらかく煮る。", "調味料を加える。", "片栗粉でとろみをつける。"] }),
      createRecipe({ id: "plus-cn-main-atsuage-braise", name: "厚揚げの中華煮", category: "主菜", cuisine: "中華", servingSize: 160, rotationKey: "豆腐", tags: ["追加レシピ", "主菜", "中華"], description: "厚揚げに中華風の味を含ませ、やわらかく仕上げた主菜。", notes: "厚揚げは食べやすい大きさに切り、味をよく含ませる。", ingredients: [part("tofu", 100, { label: "厚揚げ" }), part("chinese_cabbage", 22), part("carrot", 12), part("onion", 15)], seasonings: [part("broth", 22), part("soy_sauce", 3), part("oyster_sauce", 1.5), part("starch", 1.5), part("sesame_oil", 1)], instructions: ["厚揚げを食べやすく切る。", "野菜と一緒にやわらかく煮る。", "中華調味で味を整える。", "軽くとろみをつけて仕上げる。"] }),
      createRecipe({ id: "plus-cn-main-chinjao-style", name: "チンジャオロース風炒め", category: "主菜", cuisine: "中華", servingSize: 155, rotationKey: "豚", tags: ["追加レシピ", "主菜", "中華"], description: "細切りの肉と野菜をやわらかく炒めた中華風主菜。", notes: "ピーマンと肉は細切りにし、しっかり加熱して食べやすくする。", ingredients: [part("pork_lean", 70), part("bell_pepper", 18), part("onion", 18), part("carrot", 12)], seasonings: [part("broth", 12), part("soy_sauce", 3), part("oyster_sauce", 2), part("sesame_oil", 1)], instructions: ["肉と野菜を細切りにする。", "やわらかくなるまで加熱する。", "調味料で味を整える。", "汁気を少し残して仕上げる。"] })
    );
    return recipes;
  }
  function buildAdditionalSideRecipes() {
    const recipes = [];
    const japaneseBases = [
      { key: "daikon", label: "大根", ingredients: [part("daikon", 70)], rotationKey: "根菜" },
      { key: "pumpkin", label: "かぼちゃ", ingredients: [part("pumpkin", 65)], rotationKey: "かぼちゃ" },
      { key: "potato", label: "じゃがいも", ingredients: [part("potato", 65)], rotationKey: "じゃがいも" },
      { key: "carrot", label: "にんじん", ingredients: [part("carrot", 55)], rotationKey: "にんじん" },
      { key: "komatsuna", label: "小松菜", ingredients: [part("komatsuna", 55)], rotationKey: "青菜" }
    ];
    const japaneseMethods = [
      { key: "dashi", makeName: (base) => `${base.label}のだし煮`, makeIngredients: () => [], seasonings: [part("broth", 18), part("soy_sauce", 2), part("mirin", 2)], tags: ["煮物"] },
      { key: "soboro", makeName: (base) => `${base.label}のそぼろあん`, makeIngredients: () => [part("chicken_breast", 15)], seasonings: [part("broth", 18), part("soy_sauce", 2), part("starch", 1)], tags: ["そぼろ"] },
      { key: "ume", makeName: (base) => `${base.label}の梅和え`, makeIngredients: () => [], seasonings: [part("vinegar", 2), part("sugar", 1), part("soy_sauce", 1)], tags: ["和え物"] },
      { key: "goma", makeName: (base) => `${base.label}の胡麻煮`, makeIngredients: () => [], seasonings: [part("soy_sauce", 2), part("sesame", 3), part("sugar", 1)], tags: ["胡麻"] }
    ];
    japaneseBases.forEach((base, baseIndex) => {
      japaneseMethods.forEach((method) => {
        recipes.push(sideRecipe(`plus-jp-side-${baseIndex}-${method.key}`, method.makeName(base), "和食", [...base.ingredients, ...method.makeIngredients(base)], method.seasonings, base.label === "小松菜" ? 60 : 75, base.rotationKey, ["追加レシピ", ...(method.tags || [])]));
      });
    });
    const westernBases = [
      { key: "cabbage", label: "キャベツ", ingredients: [part("cabbage", 55), part("onion", 10)], rotationKey: "キャベツ" },
      { key: "broccoli", label: "ブロッコリー", ingredients: [part("broccoli", 55), part("corn", 10)], rotationKey: "ブロッコリー" },
      { key: "tomato", label: "トマト", ingredients: [part("tomato", 55), part("onion", 10)], rotationKey: "トマト" },
      { key: "corn", label: "コーン", ingredients: [part("corn", 45), part("potato", 20)], rotationKey: "コーン" },
      { key: "sweetpotato", label: "さつまいも", ingredients: [part("sweet_potato", 50), part("cucumber", 8)], rotationKey: "さつまいも" }
    ];
    const westernMethods = [
      { key: "salad", makeName: (base) => `${base.label}サラダ`, seasonings: [part("mayonnaise", 5), part("vinegar", 2)], tags: ["サラダ"] },
      { key: "butter", makeName: (base) => `${base.label}のバター煮`, seasonings: [part("butter", 2), part("consomme", 1)], tags: ["煮込み"] },
      { key: "cream", makeName: (base) => `${base.label}のクリーム和え`, seasonings: [part("milk", 18), part("butter", 1.5), part("flour", 1.5), part("salt", 0.1)], tags: ["クリーム"] }
    ];
    westernBases.forEach((base, baseIndex) => {
      westernMethods.forEach((method) => {
        recipes.push(sideRecipe(`plus-west-side-${baseIndex}-${method.key}`, method.makeName(base), "洋食", base.ingredients, method.seasonings, 75, base.rotationKey, ["追加レシピ", ...(method.tags || [])]));
      });
    });
    const chineseBases = [
      { key: "beansprout", label: "もやし", ingredients: [part("bean_sprouts", 55), part("carrot", 10)], rotationKey: "もやし" },
      { key: "hakusai", label: "白菜", ingredients: [part("chinese_cabbage", 60), part("carrot", 10)], rotationKey: "白菜" },
      { key: "cucumber", label: "きゅうり", ingredients: [part("cucumber", 50), part("corn", 10)], rotationKey: "きゅうり" },
      { key: "carrot", label: "にんじん", ingredients: [part("carrot", 50), part("onion", 10)], rotationKey: "にんじん" },
      { key: "tofu", label: "豆腐", ingredients: [part("tofu", 55), part("komatsuna", 10)], rotationKey: "豆腐" }
    ];
    const chineseMethods = [
      { key: "mix", makeName: (base) => `${base.label}の中華和え`, seasonings: [part("soy_sauce", 2), part("sesame_oil", 1)], tags: ["和え物"] },
      { key: "oyster", makeName: (base) => `${base.label}のオイスター煮`, seasonings: [part("oyster_sauce", 2), part("broth", 10)], tags: ["煮物"] },
      { key: "sweet", makeName: (base) => `${base.label}の甘酢和え`, seasonings: [part("vinegar", 3), part("sugar", 1), part("soy_sauce", 1)], tags: ["甘酢"] }
    ];
    chineseBases.forEach((base, baseIndex) => {
      chineseMethods.forEach((method) => {
        recipes.push(sideRecipe(`plus-cn-side-${baseIndex}-${method.key}`, method.makeName(base), "中華", base.ingredients, method.seasonings, 70, base.rotationKey, ["追加レシピ", ...(method.tags || [])]));
      });
    });
    recipes.push(
      createRecipe({ id: "plus-cn-side-bangbang-harusame", name: "春雨サラダ（バンサンスー）", category: "副菜", cuisine: "中華", servingSize: 78, rotationKey: "春雨サラダ", tags: ["追加レシピ", "副菜", "中華", "和え物"], description: "春雨と野菜を中華だれで和えた、さっぱりした副菜。", notes: "春雨は短めに切り、きゅうりは薄切りにして食べやすくする。", ingredients: [part("chinese_noodles", 30, { label: "春雨", prep: "やわらかく戻して短く切る" }), part("cucumber", 18), part("chicken_breast", 12, { label: "ハム", prep: "細切りにする" }), part("egg", 12, { label: "卵", prep: "薄焼きにして細切りにする" })], seasonings: [part("soy_sauce", 2), part("vinegar", 2), part("sesame_oil", 1), part("sugar", 1)], instructions: ["春雨をやわらかく戻して短く切る。", "きゅうり、ハム、卵を食べやすく切る。", "中華だれで和えて仕上げる。"] }),
      createRecipe({ id: "plus-cn-side-crushed-cucumber", name: "たたききゅうりの中華和え", category: "副菜", cuisine: "中華", servingSize: 60, rotationKey: "きゅうり", tags: ["追加レシピ", "副菜", "中華", "和え物"], description: "きゅうりをやさしい味の中華だれで和えた副菜。", notes: "きゅうりは皮をむくか薄くして、かたさを抑える。", ingredients: [part("cucumber", 55)], seasonings: [part("soy_sauce", 2), part("sesame_oil", 1), part("vinegar", 1)], instructions: ["きゅうりを食べやすく下処理する。", "調味料を合わせる。", "全体を和えてなじませる。"] }),
      createRecipe({ id: "plus-cn-side-nasu-hitashi", name: "なすの中華浸し", category: "副菜", cuisine: "中華", servingSize: 68, rotationKey: "なす", tags: ["追加レシピ", "副菜", "中華", "和え物"], description: "とろりとやわらかいなすを中華風だれで仕上げた副菜。", notes: "なすはしっかり加熱し、皮はむくか薄くむいて食べやすくする。", ingredients: [part("tomato", 45, { label: "なす", prep: "食べやすく切ってやわらかく加熱する" }), part("onion", 10)], seasonings: [part("soy_sauce", 2), part("sesame_oil", 1), part("vinegar", 1)], instructions: ["なすを食べやすく切る。", "蒸すかやわらかく加熱する。", "ごま醤油だれに浸して味を含ませる。"] })
    );
    return recipes;
  }
  function buildAdditionalDessertRecipes() {
    const fruitFlavors = [
      { key: "apple", name: "りんご", foodId: "apple", tag: "果物:りんご" },
      { key: "banana", name: "バナナ", foodId: "banana", tag: "果物:バナナ" },
      { key: "mandarin", name: "みかん", foodId: "mandarin", tag: "果物:みかん" },
      { key: "peach", name: "白桃", foodId: "peach", tag: "果物:白桃" },
      { key: "grape", name: "ぶどう", foodId: "grape", tag: "果物:ぶどう" }
    ];
    const fruitBases = [
      { key: "jelly", label: "ゼリー", servingSize: 85, rotationKey: "追加デザートゼリー", ingredients: (flavor) => [part(flavor.foodId, 62)], seasonings: () => [part("sugar", 5), part("gelatin_powder", 2)], instructions: ["果物を食べやすく整える。", "ゼラチンで固めて冷やす。"] },
      { key: "yogurt", label: "ヨーグルト", servingSize: 95, rotationKey: "追加デザートヨーグルト", ingredients: (flavor) => [part("yogurt", 68), part(flavor.foodId, 24)], seasonings: () => [], instructions: ["果物を刻んでヨーグルトに合わせる。", "冷やして提供する。"] },
      { key: "compote", label: "コンポート", servingSize: 88, rotationKey: "追加デザートコンポート", ingredients: (flavor) => [part(flavor.foodId, 76)], seasonings: () => [part("sugar", 4)], instructions: ["果物をやわらかく整える。", "軽く甘みをつけて冷やす。"] },
      { key: "mousse", label: "ムース", servingSize: 84, rotationKey: "追加デザートムース", ingredients: (flavor) => [part("yogurt", 38), part("milk", 18), part(flavor.foodId, 20)], seasonings: () => [part("sugar", 5), part("gelatin_powder", 1.5)], instructions: ["材料をなめらかに混ぜる。", "冷やし固めて提供する。"] },
      { key: "pudding", label: "プリン", servingSize: 90, rotationKey: "追加デザートプリン", ingredients: (flavor) => [part("milk", 52), part("egg", 16), part(flavor.foodId, 15)], seasonings: () => [part("sugar", 7)], instructions: ["材料を合わせてやさしく加熱する。", "冷やし固めて提供する。"] }
    ];
    const softFlavors = [
      { key: "pumpkin", name: "かぼちゃ", foodId: "pumpkin", tag: "素材:かぼちゃ" },
      { key: "sweetpotato", name: "さつまいも", foodId: "sweet_potato", tag: "素材:さつまいも" },
      { key: "carrot", name: "にんじん", foodId: "carrot", tag: "素材:にんじん" },
      { key: "milk", name: "ミルク", foodId: "milk", tag: "素材:ミルク" },
      { key: "corn", name: "コーン", foodId: "corn", tag: "素材:コーン" }
    ];
    const softBases = [
      { key: "pudding", label: "プリン", servingSize: 88, rotationKey: "追加ソフトプリン", ingredients: (flavor) => [part("milk", 48), part("egg", 16), part(flavor.foodId, 18)], seasonings: () => [part("sugar", 7)], instructions: ["材料を合わせてやさしく加熱する。", "冷やし固めて提供する。"] },
      { key: "mousse", label: "ムース", servingSize: 84, rotationKey: "追加ソフトムース", ingredients: (flavor) => [part("yogurt", 36), part("milk", 18), part(flavor.foodId, 22)], seasonings: () => [part("sugar", 5), part("gelatin_powder", 1.5)], instructions: ["材料をなめらかに混ぜる。", "冷やし固めて提供する。"] },
      { key: "kanten", label: "ミルク寒天", servingSize: 86, rotationKey: "追加ソフト寒天", ingredients: (flavor) => [part("milk", 55), part(flavor.foodId, 18)], seasonings: () => [part("sugar", 5), part("gelatin_powder", 2)], instructions: ["材料を混ぜて温める。", "冷やし固めて提供する。"] },
      { key: "bavarois", label: "ババロア", servingSize: 86, rotationKey: "追加ソフトババロア", ingredients: (flavor) => [part("milk", 50), part("egg", 12), part(flavor.foodId, 18)], seasonings: () => [part("sugar", 6), part("gelatin_powder", 1.5)], instructions: ["材料を混ぜてなめらかにする。", "冷やし固めて提供する。"] },
      { key: "cake", label: "やわらかケーキ", servingSize: 82, rotationKey: "追加ソフトケーキ", ingredients: (flavor) => [part("flour", 20), part("egg", 12), part("milk", 14), part(flavor.foodId, 18)], seasonings: () => [part("sugar", 7), part("baking_powder", 1.5)], instructions: ["生地に素材を合わせる。", "やわらかく焼くか蒸して仕上げる。"] }
    ];
    const recipes = [];
    fruitFlavors.forEach((flavor, flavorIndex) => {
      fruitBases.forEach((base, baseIndex) => {
        recipes.push(createRecipe({ id: `plus-dessert-fruit-${flavor.key}-${base.key}`, name: `${flavor.name}${base.label}`, category: "デザート", cuisine: CUISINES[(flavorIndex + baseIndex) % CUISINES.length], servingSize: base.servingSize, rotationKey: base.rotationKey, tags: ["追加レシピ", "デザート", flavor.tag], description: `${flavor.name}を使った食べやすいデザート。`, ingredients: base.ingredients(flavor), seasonings: base.seasonings(flavor), instructions: base.instructions }));
      });
    });
    softFlavors.forEach((flavor, flavorIndex) => {
      softBases.forEach((base, baseIndex) => {
        recipes.push(createRecipe({ id: `plus-dessert-soft-${flavor.key}-${base.key}`, name: `${flavor.name}${base.label}`, category: "デザート", cuisine: CUISINES[(flavorIndex + baseIndex + 1) % CUISINES.length], servingSize: base.servingSize, rotationKey: base.rotationKey, tags: ["追加レシピ", "デザート", flavor.tag], description: `${flavor.name}を使ったやわらかいデザート。`, ingredients: base.ingredients(flavor), seasonings: base.seasonings(flavor), instructions: base.instructions }));
      });
    });
    [
      {
        id: "plus-dessert-anko-mizuyokan",
        name: "水ようかん",
        servingSize: 72,
        rotationKey: "和風デザート",
        tags: ["追加レシピ", "デザート", "和風", "あんこ"],
        description: "あんこの風味を活かした、やわらかく食べやすい和風デザートです。",
        notes: "固さを出しすぎず、なめらかで食べやすく仕上げる。",
        ingredients: [part("azuki_paste", 34)],
        seasonings: [part("sugar", 4), part("gelatin_powder", 1.5)],
        instructions: ["材料をよく混ぜる。", "やわらかく固める。", "冷やして提供する。"]
      },
      {
        id: "plus-dessert-anko-kuzumanju",
        name: "くずまんじゅう",
        servingSize: 74,
        rotationKey: "和風デザート",
        tags: ["追加レシピ", "デザート", "和風", "あんこ"],
        description: "なめらかなあんを包み、やわらかく仕上げた和風デザートです。",
        notes: "皮はやわらかく仕上げ、口に残りにくい状態で提供する。",
        ingredients: [part("jelly_base", 26, { label: "くず風生地" }), part("azuki_paste", 24)],
        seasonings: [part("sugar", 4), part("gelatin_powder", 1.5)],
        instructions: ["生地を合わせてなめらかにする。", "あんを包むように整える。", "冷やしてやわらかく仕上げる。"]
      },
      {
        id: "plus-dessert-anko-anmitsu-jelly",
        name: "あんみつ風ゼリー",
        servingSize: 82,
        rotationKey: "和風デザート",
        tags: ["追加レシピ", "デザート", "和風", "あんこ", "ゼリー"],
        description: "あんこと寒天風ゼリーを合わせた、食べやすい和風デザートです。",
        notes: "ゼリーは固めすぎず、果物は小さめにして食べやすくする。",
        ingredients: [part("jelly_base", 40, { label: "寒天風ゼリー" }), part("azuki_paste", 18), part("mandarin", 12)],
        seasonings: [part("sugar", 4), part("gelatin_powder", 1.5)],
        instructions: ["ゼリーをやわらかく整える。", "あんこと果物を合わせる。", "冷やして提供する。"]
      },
      {
        id: "plus-dessert-anko-milk-pudding",
        name: "あずきミルクプリン",
        servingSize: 88,
        rotationKey: "和風デザート",
        tags: ["追加レシピ", "デザート", "和風", "あんこ", "プリン"],
        description: "あずきの風味をやさしくまとめた、なめらかなミルクプリンです。",
        notes: "あずきは全体になじませ、固さを出しすぎないようにする。",
        ingredients: [part("milk", 55), part("azuki_paste", 16)],
        seasonings: [part("sugar", 4), part("gelatin_powder", 1.5)],
        instructions: ["材料をよく混ぜる。", "やわらかく固める。", "冷やして提供する。"]
      },
      {
        id: "plus-dessert-anko-bavarois",
        name: "小倉ババロア",
        servingSize: 86,
        rotationKey: "和風デザート",
        tags: ["追加レシピ", "デザート", "和風", "あんこ", "ババロア"],
        description: "小倉あんの風味を活かした、やわらかな和風ババロアです。",
        notes: "口当たりをなめらかにし、冷やしすぎて固くしない。",
        ingredients: [part("milk", 50), part("egg", 12), part("azuki_paste", 18)],
        seasonings: [part("sugar", 5), part("gelatin_powder", 1.5)],
        instructions: ["材料を混ぜてなめらかにする。", "やわらかく固める。", "冷やして提供する。"]
      },
      {
        id: "plus-dessert-anko-mousse",
        name: "あんこムース",
        servingSize: 84,
        rotationKey: "和風デザート",
        tags: ["追加レシピ", "デザート", "和風", "あんこ", "ムース"],
        description: "あんこの風味を活かした、ふんわりやわらかな和風ムースです。",
        notes: "なめらかに混ぜ、口どけ良く仕上げる。",
        ingredients: [part("yogurt", 36), part("milk", 18), part("azuki_paste", 20)],
        seasonings: [part("sugar", 4), part("gelatin_powder", 1.5)],
        instructions: ["材料をなめらかに混ぜる。", "やわらかく固める。", "冷やして提供する。"]
      },
      {
        id: "plus-dessert-anko-koshian-kanten",
        name: "こしあん寒天",
        servingSize: 76,
        rotationKey: "和風デザート",
        tags: ["追加レシピ", "デザート", "和風", "あんこ", "寒天"],
        description: "こしあんの風味をやさしくまとめた、食べやすい寒天風デザートです。",
        notes: "固めすぎず、スプーンで切れるやわらかさにする。",
        ingredients: [part("azuki_paste", 30)],
        seasonings: [part("sugar", 4), part("gelatin_powder", 2)],
        instructions: ["材料をよく混ぜる。", "やわらかく固める。", "冷やして提供する。"]
      },
      {
        id: "plus-dessert-anko-matcha-pudding",
        name: "抹茶あずきプリン",
        servingSize: 88,
        rotationKey: "和風デザート",
        tags: ["追加レシピ", "デザート", "和風", "あんこ", "プリン"],
        description: "抹茶の香りとあずきの風味を合わせた、やさしい和風プリンです。",
        notes: "抹茶の香りはやわらかく残し、固さを出しすぎないようにする。",
        ingredients: [part("milk", 52), part("azuki_paste", 14), part("milk", 2, { label: "抹茶", prep: "少量で香りづけする" })],
        seasonings: [part("sugar", 5), part("gelatin_powder", 1.5)],
        instructions: ["材料をよく混ぜる。", "やわらかく固める。", "冷やして提供する。"]
      },
      {
        id: "plus-dessert-anko-shiratama-style-jelly",
        name: "白玉風あんこゼリー",
        servingSize: 82,
        rotationKey: "和風デザート",
        tags: ["追加レシピ", "デザート", "和風", "あんこ", "ゼリー"],
        description: "白玉風のやわらかい食感をイメージした、食べやすいあんこゼリーです。",
        notes: "白玉は本物の団子にせず、やわらかいゼリー状で表現する。",
        ingredients: [part("jelly_base", 42, { label: "白玉風ゼリー" }), part("azuki_paste", 18)],
        seasonings: [part("sugar", 4), part("gelatin_powder", 1.5)],
        instructions: ["ゼリー液をやわらかく整える。", "あんこと合わせて盛り付ける。", "冷やして提供する。"]
      },
      {
        id: "plus-dessert-anko-yose",
        name: "あずき寄せ",
        servingSize: 78,
        rotationKey: "和風デザート",
        tags: ["追加レシピ", "デザート", "和風", "あんこ"],
        description: "あずきの風味を活かした、口当たりのやさしい和風デザートです。",
        notes: "やわらかく寄せて、のど越し良く仕上げる。",
        ingredients: [part("azuki_paste", 24), part("milk", 20)],
        seasonings: [part("sugar", 4), part("gelatin_powder", 1.5)],
        instructions: ["材料をよく混ぜる。", "やわらかく固める。", "冷やして提供する。"]
      }
    ].forEach((definition) => {
      recipes.push(createRecipe({
        id: definition.id,
        name: definition.name,
        category: "デザート",
        cuisine: "和食",
        servingSize: definition.servingSize,
        rotationKey: definition.rotationKey,
        tags: definition.tags,
        description: definition.description,
        notes: definition.notes,
        ingredients: definition.ingredients,
        seasonings: definition.seasonings,
        instructions: definition.instructions
      }));
    });
    return recipes;
  }
  function buildAdditionalSnackRecipes() {
    const fruitFlavors = [
      { key: "apple", name: "りんご", foodId: "apple" },
      { key: "banana", name: "バナナ", foodId: "banana" },
      { key: "mandarin", name: "みかん", foodId: "mandarin" },
      { key: "peach", name: "白桃", foodId: "peach" },
      { key: "grape", name: "ぶどう", foodId: "grape" }
    ];
    const fruitBases = [
      { key: "steamed", label: "蒸しパン", servingSize: 80, rotationKey: "追加おやつ蒸しパン", ingredients: (flavor) => [part("flour", 20), part("milk", 14), part("egg", 10), part(flavor.foodId, 20)], seasonings: () => [part("sugar", 7), part("baking_powder", 1.5)], instructions: ["生地に果物を合わせる。", "やわらかく蒸して提供する。"] },
      { key: "cake", label: "ふんわりケーキ", servingSize: 82, rotationKey: "追加おやつケーキ", ingredients: (flavor) => [part("flour", 22), part("egg", 12), part("milk", 12), part(flavor.foodId, 18)], seasonings: () => [part("sugar", 8), part("baking_powder", 1.5)], instructions: ["生地に果物を合わせる。", "しっとり焼き上げる。"] },
      { key: "manju", label: "やわらかまんじゅう", servingSize: 76, rotationKey: "追加おやつまんじゅう", ingredients: (flavor) => [part("flour", 18), part(flavor.foodId, 22)], seasonings: () => [part("sugar", 6), part("baking_powder", 1)], instructions: ["生地に具材を包む。", "やわらかく蒸して提供する。"] },
      { key: "pudding", label: "パンプディング", servingSize: 82, rotationKey: "追加おやつパンプディング", ingredients: (flavor) => [part("bread", 35), part("milk", 24), part("egg", 12), part(flavor.foodId, 14)], seasonings: () => [part("sugar", 5)], instructions: ["材料を合わせてしっとり加熱する。", "食べやすく冷まして提供する。"] },
      { key: "roll", label: "ロールケーキ", servingSize: 78, rotationKey: "追加おやつロール", ingredients: (flavor) => [part("flour", 18), part("egg", 12), part("milk", 10), part(flavor.foodId, 18)], seasonings: () => [part("sugar", 7), part("baking_powder", 1)], instructions: ["生地に果物を合わせる。", "やわらかいロールケーキに仕上げる。"] }
    ];
    const softFlavors = [
      { key: "pumpkin", name: "かぼちゃ", foodId: "pumpkin" },
      { key: "sweetpotato", name: "さつまいも", foodId: "sweet_potato" },
      { key: "carrot", name: "にんじん", foodId: "carrot" },
      { key: "milk", name: "ミルク", foodId: "milk" },
      { key: "corn", name: "コーン", foodId: "corn" }
    ];
    const softBases = [
      { key: "steamed", label: "蒸しパン", servingSize: 80, rotationKey: "追加おやつ蒸しパン", ingredients: (flavor) => [part("flour", 20), part("milk", 14), part("egg", 10), part(flavor.foodId, 20)], seasonings: () => [part("sugar", 7), part("baking_powder", 1.5)], instructions: ["生地に素材を合わせる。", "やわらかく蒸して提供する。"] },
      { key: "cake", label: "しっとりケーキ", servingSize: 82, rotationKey: "追加おやつケーキ", ingredients: (flavor) => [part("flour", 22), part("egg", 12), part("milk", 12), part(flavor.foodId, 18)], seasonings: () => [part("sugar", 8), part("baking_powder", 1.5)], instructions: ["生地に素材を合わせる。", "しっとり焼き上げる。"] },
      { key: "pudding", label: "パンプディング", servingSize: 82, rotationKey: "追加おやつパンプディング", ingredients: (flavor) => [part("bread", 35), part("milk", 24), part("egg", 12), part(flavor.foodId, 14)], seasonings: () => [part("sugar", 5)], instructions: ["材料を合わせてしっとり加熱する。", "食べやすく冷まして提供する。"] },
      { key: "cookie", label: "ソフトクッキー", servingSize: 70, rotationKey: "追加おやつ焼き菓子", ingredients: (flavor) => [part("flour", 18), part("milk", 10), part(flavor.foodId, 16)], seasonings: () => [part("sugar", 6), part("butter", 3), part("baking_powder", 1)], instructions: ["生地に素材を合わせる。", "やわらかく焼き上げる。"] },
      { key: "bouchee", label: "やわらかブッセ", servingSize: 74, rotationKey: "追加おやつブッセ", ingredients: (flavor) => [part("flour", 16), part("egg", 12), part("milk", 10), part(flavor.foodId, 16)], seasonings: () => [part("sugar", 6), part("baking_powder", 1)], instructions: ["生地に素材を合わせる。", "ふんわりと焼き上げる。"] }
    ];
    const recipes = [];
    fruitFlavors.forEach((flavor, flavorIndex) => {
      fruitBases.forEach((base, baseIndex) => {
        recipes.push(createRecipe({ id: `plus-snack-fruit-${flavor.key}-${base.key}`, name: `${flavor.name}${base.label}`, category: "おやつ", cuisine: CUISINES[(flavorIndex + baseIndex) % CUISINES.length], servingSize: base.servingSize, rotationKey: base.rotationKey, tags: ["追加レシピ", "おやつ", "追加おやつ"], description: `${flavor.name}を使った食べやすいおやつ。`, ingredients: base.ingredients(flavor), seasonings: base.seasonings(flavor), instructions: base.instructions }));
      });
    });
    softFlavors.forEach((flavor, flavorIndex) => {
      softBases.forEach((base, baseIndex) => {
        recipes.push(createRecipe({ id: `plus-snack-soft-${flavor.key}-${base.key}`, name: `${flavor.name}${base.label}`, category: "おやつ", cuisine: CUISINES[(flavorIndex + baseIndex + 1) % CUISINES.length], servingSize: base.servingSize, rotationKey: base.rotationKey, tags: ["追加レシピ", "おやつ", "追加おやつ"], description: `${flavor.name}を使ったやわらかいおやつ。`, ingredients: base.ingredients(flavor), seasonings: base.seasonings(flavor), instructions: base.instructions }));
      });
    });
    return recipes;
  }
  function buildBirthdayCakeRecipes() {
    const flavors = [
      { key: "apple", name: "りんご", foodId: "apple" },
      { key: "banana", name: "バナナ", foodId: "banana" },
      { key: "mandarin", name: "みかん", foodId: "mandarin" },
      { key: "orange", name: "オレンジ", foodId: "orange" },
      { key: "peach", name: "白桃", foodId: "peach" },
      { key: "grape", name: "ぶどう", foodId: "grape" }
    ];
    const cakeStyles = [
      { key: "short", label: "のバースデーショートケーキ", servingSize: 88, ingredients: (flavor) => [part("flour", 22), part("egg", 14), part("milk", 16), part(flavor.foodId, 18)], seasonings: () => [part("sugar", 8), part("baking_powder", 1.5)], instructions: ["生地を焼いてやわらかく仕上げる。", "果物を添えて提供する。"] },
      { key: "roll", label: "のバースデーロールケーキ", servingSize: 86, ingredients: (flavor) => [part("flour", 20), part("egg", 14), part("milk", 14), part(flavor.foodId, 18)], seasonings: () => [part("sugar", 8), part("baking_powder", 1.5)], instructions: ["生地をやわらかく焼く。", "果物を合わせて巻き、食べやすく切る。"] },
      { key: "mousse", label: "のバースデームースケーキ", servingSize: 84, ingredients: (flavor) => [part("yogurt", 38), part("milk", 18), part(flavor.foodId, 22)], seasonings: () => [part("sugar", 5), part("gelatin_powder", 1.5)], instructions: ["材料をなめらかに混ぜる。", "冷やし固めてケーキ仕立てにする。"] },
      { key: "milk", label: "のバースデーミルクケーキ", servingSize: 86, ingredients: (flavor) => [part("flour", 20), part("egg", 12), part("milk", 18), part(flavor.foodId, 16)], seasonings: () => [part("sugar", 8), part("baking_powder", 1.5)], instructions: ["生地をやわらかく焼く。", "果物を添えて食べやすく仕上げる。"] },
      { key: "fruit", label: "のバースデーフルーツケーキ", servingSize: 88, ingredients: (flavor) => [part("flour", 22), part("egg", 12), part("milk", 14), part(flavor.foodId, 20)], seasonings: () => [part("sugar", 8), part("baking_powder", 1.5)], instructions: ["生地に果物を合わせて焼く。", "冷まして提供する。"] }
    ];
    const recipes = [];
    flavors.forEach((flavor) => {
      cakeStyles.forEach((style) => {
        recipes.push(createRecipe({ id: `birthday-cake-${flavor.key}-${style.key}`, name: `${flavor.name}${style.label}`, category: "おやつ", cuisine: "洋食", servingSize: style.servingSize, rotationKey: "誕生日ケーキ", tags: ["追加レシピ", "おやつ", "birthday-cake", "誕生日", "ケーキ"], description: `${flavor.name}を使ったお誕生日用ケーキ。`, notes: "誕生日提供向けのやわらかいケーキ。", ingredients: style.ingredients(flavor), seasonings: style.seasonings(flavor), instructions: style.instructions }));
      });
    });
    return recipes;
  }
  function buildRecipeMaster() {
    const recipes = [];
    recipes.push(
      createRecipe({ id: "jp-staple-rice", name: "ごはん", category: "主食", cuisine: "和食", servingSize: 150, rotationKey: "米飯", tags: ["定番"], ingredients: [part("rice", 150)], seasonings: [], instructions: ["温かく盛り付ける。"] }),
      createRecipe({ id: "jp-staple-soft-rice", name: "軟飯", category: "主食", cuisine: "和食", servingSize: 150, rotationKey: "米飯", tags: ["やわらか"], ingredients: [part("soft_rice", 150)], seasonings: [], instructions: ["温かく盛り付ける。"] }),
      createRecipe({ id: "jp-staple-wakame-rice", name: "わかめごはん", category: "主食", cuisine: "和食", servingSize: 155, rotationKey: "米飯", tags: ["混ぜごはん"], ingredients: [part("rice", 145), part("wakame", 10)], seasonings: [part("salt", 0.3)], instructions: ["ごはんにわかめを混ぜて仕上げる。"] }),
      createRecipe({ id: "jp-staple-komatsuna-rice", name: "菜飯", category: "主食", cuisine: "和食", servingSize: 155, rotationKey: "米飯", tags: ["青菜"], ingredients: [part("rice", 145), part("komatsuna", 15)], seasonings: [part("soy_sauce", 2)], instructions: ["青菜をごはんに混ぜて仕上げる。"] }),
      createRecipe({ id: "jp-staple-mushroom-rice", name: "きのこごはん", category: "主食", cuisine: "和食", servingSize: 160, rotationKey: "米飯", tags: ["きのこ"], ingredients: [part("rice", 145), part("mushrooms", 18), part("carrot", 10)], seasonings: [part("soy_sauce", 3), part("mirin", 2)], instructions: ["具材を軽く煮て、ごはんに混ぜる。"] }),
      createRecipe({ id: "west-staple-roll", name: "ロールパン", category: "主食", cuisine: "洋食", servingSize: 70, rotationKey: "パン", tags: ["定番"], ingredients: [part("roll_bread", 70)], seasonings: [], instructions: ["食べやすく盛り付ける。"] }),
      createRecipe({ id: "west-staple-bread", name: "食パン", category: "主食", cuisine: "洋食", servingSize: 70, rotationKey: "パン", tags: ["定番"], ingredients: [part("bread", 70)], seasonings: [], instructions: ["必要に応じて半分に切る。"] }),
      createRecipe({ id: "west-staple-milk-bread", name: "ミルクパン", category: "主食", cuisine: "洋食", servingSize: 70, rotationKey: "パン", tags: ["やわらか"], ingredients: [part("milk_bread", 70)], seasonings: [], instructions: ["食べやすく盛り付ける。"] }),
      createRecipe({ id: "west-staple-corn-pilaf", name: "コーンピラフ", category: "主食", cuisine: "洋食", servingSize: 160, rotationKey: "洋食主食", tags: ["人気"], ingredients: [part("rice", 145), part("corn", 20), part("onion", 12)], seasonings: [part("consomme", 2), part("butter", 2)], instructions: ["具材を軽く混ぜて仕上げる。"] }),
      createRecipe({ id: "west-staple-cheese-rice", name: "チーズライス", category: "主食", cuisine: "洋食", servingSize: 160, rotationKey: "洋食主食", tags: ["チーズ"], ingredients: [part("rice", 145), part("cheese", 12)], seasonings: [part("consomme", 1)], instructions: ["温かいごはんにチーズを混ぜる。"] }),
      createRecipe({ id: "cn-staple-porridge", name: "中華粥", category: "主食", cuisine: "中華", servingSize: 170, rotationKey: "中華主食", tags: ["やわらか"], ingredients: [part("soft_rice", 140)], seasonings: [part("broth", 35), part("salt", 0.2)], instructions: ["やわらかく煮て盛り付ける。"] }),
      createRecipe({ id: "cn-staple-green-porridge", name: "青菜がゆ", category: "主食", cuisine: "中華", servingSize: 175, rotationKey: "中華主食", tags: ["青菜"], ingredients: [part("soft_rice", 140), part("komatsuna", 18)], seasonings: [part("broth", 35), part("salt", 0.2)], instructions: ["青菜を刻んで加え、やわらかく仕上げる。"] }),
      createRecipe({ id: "cn-staple-five-rice", name: "五目ごはん", category: "主食", cuisine: "中華", servingSize: 165, rotationKey: "中華主食", tags: ["混ぜごはん"], ingredients: [part("rice", 145), part("mushrooms", 15), part("carrot", 10), part("green_peas", 10)], seasonings: [part("soy_sauce", 3), part("sesame_oil", 1)], instructions: ["具材をごはんに混ぜて仕上げる。"] }),
      createRecipe({ id: "cn-staple-soft-fried-rice", name: "やわらか炒飯", category: "主食", cuisine: "中華", servingSize: 165, rotationKey: "中華主食", tags: ["人気"], ingredients: [part("rice", 140), part("egg", 18), part("green_peas", 10), part("carrot", 10)], seasonings: [part("soy_sauce", 2), part("sesame_oil", 1)], instructions: ["やわらかめに炒めて仕上げる。"] }),
      createRecipe({ id: "cn-staple-chinese-rice", name: "中華風ごはん", category: "主食", cuisine: "中華", servingSize: 160, rotationKey: "中華主食", tags: ["定番"], ingredients: [part("rice", 145), part("corn", 10), part("onion", 10)], seasonings: [part("oyster_sauce", 2), part("sesame_oil", 1)], instructions: ["香りをつけて仕上げる。"] })
    );
    buildSoupSeries(recipes, "jp", "和食", [["豆腐", [part("tofu", 40)]], ["わかめ", [part("wakame", 8)]], ["白菜", [part("chinese_cabbage", 35)]], ["かぼちゃ", [part("pumpkin", 35)]], ["きのこ", [part("mushrooms", 25)]]], [{ key: "miso", label: "味噌汁", servingSize: 150, seasonings: [part("broth", 120), part("miso", 10)], tags: ["汁物"] }, { key: "clear", label: "すまし汁", servingSize: 150, seasonings: [part("broth", 125), part("light_soy", 3)], tags: ["汁物"] }]);
    buildSoupSeries(recipes, "west", "洋食", [["キャベツ", [part("cabbage", 35)]], ["玉ねぎ", [part("onion", 30)]], ["コーン", [part("corn", 25)]], ["じゃがいも", [part("potato", 35)]], ["ブロッコリー", [part("broccoli", 30)]]], [{ key: "consomme", label: "コンソメスープ", servingSize: 150, seasonings: [part("broth", 120), part("consomme", 3)], tags: ["汁物"] }, { key: "cream", label: "クリームスープ", servingSize: 150, seasonings: [part("milk", 65), part("butter", 3), part("flour", 4), part("consomme", 1), part("salt", 0.2), part("pepper", 0.05)], tags: ["汁物"], instructions: ["具材をやわらかく煮る。", "バターと小麦粉でまとめ、牛乳を加えてとろみをつける。"] }]);
    buildSoupSeries(recipes, "cn", "中華", [["卵", [part("egg", 18)]], ["わかめ", [part("wakame", 8)]], ["白菜", [part("chinese_cabbage", 35)]], ["もやし", [part("bean_sprouts", 30)]], ["青菜", [part("komatsuna", 25)]]], [{ key: "soup", label: "中華スープ", servingSize: 150, seasonings: [part("broth", 120), part("soy_sauce", 2), part("sesame_oil", 1)], tags: ["汁物"] }, { key: "thick", label: "とろみスープ", servingSize: 150, seasonings: [part("broth", 118), part("soy_sauce", 2), part("starch", 2)], tags: ["汁物"] }]);
    buildMainSeries(recipes, "jp", "和食", [{ id: "white_fish", name: "白身魚", grams: 90, rotationKey: "魚" }, { id: "salmon", name: "鮭", grams: 90, rotationKey: "魚" }, { id: "chicken_thigh", name: "鶏もも", grams: 90, rotationKey: "鶏" }, { id: "pork_lean", name: "豚肉", grams: 85, rotationKey: "豚" }], [{ key: "nimono", label: "の煮付け", seasonings: [part("soy_sauce", 6), part("mirin", 6), part("sugar", 2), part("broth", 18)], ingredients: [], tags: ["煮物"] }, { key: "miso", label: "の味噌煮", seasonings: [part("miso", 10), part("mirin", 4), part("sugar", 2), part("broth", 18)], ingredients: [], tags: ["味噌"] }, { key: "teri", label: "の照り焼き", seasonings: [part("soy_sauce", 7), part("mirin", 7), part("sugar", 2)], ingredients: [], tags: ["照り焼き"] }, { key: "oroshi", label: "のおろしあん", seasonings: [part("light_soy", 4), part("broth", 22), part("starch", 2)], ingredients: [part("daikon", 25)], tags: ["あん"] }, { key: "yawaraka", label: "のやわらか煮", seasonings: [part("soy_sauce", 5), part("mirin", 4), part("broth", 24)], ingredients: [part("onion", 18)], tags: ["やわらか"] }]);
    buildMainSeries(recipes, "west", "洋食", [{ id: "chicken_thigh", name: "チキン", grams: 90, rotationKey: "鶏" }, { id: "pork_lean", name: "ポーク", grams: 85, rotationKey: "豚" }, { id: "white_fish", name: "白身魚", grams: 90, rotationKey: "魚" }, { id: "salmon", name: "鮭", grams: 90, rotationKey: "魚" }], [{ key: "tomato", label: "のトマト煮", seasonings: [part("tomato", 28), part("ketchup", 6), part("consomme", 2), part("salt", 0.2), part("pepper", 0.05)], ingredients: [part("onion", 20)], tags: ["トマト"], instructions: ["主材料と玉ねぎをやわらかく煮る。", "トマト、ケチャップ、コンソメで味を整える。"] }, { key: "cream", label: "のクリーム煮", seasonings: [part("milk", 45), part("butter", 4), part("flour", 4), part("consomme", 1), part("salt", 0.2), part("pepper", 0.05)], ingredients: [part("onion", 18)], tags: ["クリーム"], instructions: ["主材料と玉ねぎをやわらかく加熱する。", "バターと小麦粉をなじませ、牛乳とコンソメでクリーム煮に仕上げる。"] }, { key: "munier", label: "のムニエル", seasonings: [part("butter", 3), part("pepper", 0.1)], ingredients: [part("potato", 20), part("flour", 3)], tags: ["焼き"], instructions: ["主材料に薄く小麦粉をまぶす。", "バターでやわらかく焼き、付け合わせを添える。"] }, { key: "herb", label: "のハーブ焼き", seasonings: [part("butter", 2), part("pepper", 0.1), part("salt", 0.2)], ingredients: [part("carrot", 16)], tags: ["焼き"], instructions: ["主材料に下味をつける。", "付け合わせとともにやわらかく焼く。"] }, { key: "cheese", label: "のチーズ焼き", seasonings: [part("cheese", 10), part("consomme", 1)], ingredients: [part("tomato", 18)], tags: ["チーズ"], instructions: ["主材料にトマトを添えて加熱する。", "チーズをのせてやわらかく焼き上げる。"] }]);
    buildMainSeries(recipes, "cn", "中華", [{ id: "chicken_thigh", name: "鶏肉", grams: 90, rotationKey: "鶏" }, { id: "pork_lean", name: "豚肉", grams: 85, rotationKey: "豚" }, { id: "white_fish", name: "白身魚", grams: 90, rotationKey: "魚" }, { id: "tofu", name: "豆腐", grams: 120, rotationKey: "豆腐" }], [{ key: "an", label: "の中華あん", seasonings: [part("broth", 25), part("soy_sauce", 3), part("starch", 2)], ingredients: [part("carrot", 16), part("green_peas", 10)], tags: ["あん"] }, { key: "oyster", label: "のオイスター煮", seasonings: [part("oyster_sauce", 4), part("broth", 20), part("sesame_oil", 1)], ingredients: [part("onion", 18)], tags: ["オイスター"] }, { key: "sweet-sour", label: "の甘酢あん", seasonings: [part("ketchup", 5), part("vinegar", 3), part("sugar", 2), part("starch", 2)], ingredients: [part("onion", 16)], tags: ["甘酢"] }, { key: "ginger", label: "のしょうが蒸し", seasonings: [part("soy_sauce", 3), part("broth", 18), part("sesame_oil", 1)], ingredients: [part("chinese_cabbage", 20)], tags: ["蒸し"] }, { key: "stir", label: "のやわらか炒め", seasonings: [part("soy_sauce", 3), part("oyster_sauce", 2), part("sesame_oil", 1)], ingredients: [part("bell_pepper", 12), part("onion", 16)], tags: ["炒め"] }]);
    recipes.push(
      ...buildJapaneseSides(),
      ...buildWesternSides(),
      ...buildChineseSides(),
      ...buildExtraSides(),
      ...buildAdditionalSideRecipes(),
      ...buildSingleDishes(),
      ...buildAdditionalSingleDishes(),
      ...buildDesserts(),
      ...buildAdditionalDessertRecipes(),
      ...buildAdditionalSoupRecipes(),
      ...buildAdditionalMainRecipes()
    );
    return recipes;
  }

  const EXPANDED_RECIPES = buildRecipeMaster();
  const GOALS = { energy: 550, protein: 22, fat: 18, carbs: 75, fiber: 6, salt: 3.0 };

  getAllFoods = function () { return [...EXPANDED_FOODS, ...(state.customFoods || [])]; };
  getFoodMap = function () { return new Map(getAllFoods().map((item) => [item.id, item])); };
  getAllRecipes = function () { return [...EXPANDED_RECIPES, ...normalizeCustomRecipes(state.customRecipes || [])]; };
  getRecipeMap = function () { return new Map(getAllRecipes().map((recipe) => [recipe.id, recipe])); };
  syncSelectedRecipe = function () {
    const recipes = getAllRecipes();
    if (!recipes.find((recipe) => recipe.id === state.selectedRecipeId)) state.selectedRecipeId = recipes[0]?.id || null;
  };
  function normalizeCustomRecipes(recipes) {
    return recipes.map((recipe) => createRecipe({
      ...recipe,
      cuisine: recipe.cuisine || "和食",
      servingSize: recipe.servingSize || recipe.servingWeight || 100,
      ingredients: recipe.ingredients || [],
      seasonings: recipe.seasonings || [],
      instructions: recipe.instructions || recipe.steps || ["手順未設定"],
      rotationKey: recipe.rotationKey || recipe.name,
      tags: recipe.tags || []
    }));
  }
  createEmptyWeekMenu = function (weekStart) {
    const week = {};
    WEEKDAY_KEYS.forEach((dayKey, index) => {
      week[dayKey] = { date: addDays(weekStart, index), mode: "basic", basic: { staple: null, soup: null, main: null, side1: null, side2: null, dessert: null }, exception: { singleDish: null, extraSoup: null, extraSide: null, extraDessert: null }, memo: "", generatedByAuto: false };
    });
    return ensureWeeklyMenuIntegrity(weekStart, week, false);
  };
  function normalizeWeekMenuLocal(week, weekStart) {
    const base = createEmptyWeekMenu(weekStart);
    WEEKDAY_KEYS.forEach((dayKey) => {
      const day = week[dayKey] || {};
      base[dayKey] = { ...base[dayKey], ...day, date: day.date || base[dayKey].date, basic: { ...base[dayKey].basic, ...(day.basic || {}) }, exception: { ...base[dayKey].exception, ...(day.exception || {}) } };
    });
    return base;
  }
  getWeekMenus = function (weekStart) {
    return state.weeklyMenus[weekStart] ? normalizeWeekMenuLocal(state.weeklyMenus[weekStart], weekStart) : createEmptyWeekMenu(weekStart);
  };
  function ensureWeekExists(weekStart) {
    if (!state.weeklyMenus[weekStart]) {
      state.weeklyMenus[weekStart] = generateAutoWeek(weekStart);
      saveStorage(STORAGE_KEYS.weeklyMenus, state.weeklyMenus);
    }
  }
  evaluateDayMenu = function (dayMenu) {
    const map = getRecipeMap();
    const recipes = getMenuRecipeIds(dayMenu).map((id) => map.get(id)).filter(Boolean);
    const totals = recipes.reduce((acc, recipe) => addNutrition(acc, recipe.nutrition), emptyNutrition());
    const structurePass = dayMenu.mode === "basic" ? ["staple", "soup", "main", "side1", "side2", "dessert"].every((key) => Boolean(dayMenu.basic[key])) : Boolean(dayMenu.exception.singleDish);
    return { recipes, totals, structurePass, energyPass: totals.energy >= 500 && totals.energy <= 600, saltPass: totals.salt <= 3.0 };
  };
  menuSlotsForDisplay = function (dayMenu) {
    return dayMenu.mode === "basic" ? [["主食", dayMenu.basic.staple], ["汁物", dayMenu.basic.soup], ["主菜", dayMenu.basic.main], ["副菜1", dayMenu.basic.side1], ["副菜2", dayMenu.basic.side2], ["デザート", dayMenu.basic.dessert]] : [["単品料理", dayMenu.exception.singleDish], ["追加汁物", dayMenu.exception.extraSoup], ["追加副菜", dayMenu.exception.extraSide], ["追加デザート", dayMenu.exception.extraDessert]].filter(([, value]) => value);
  };
  function chooseTargetCuisine(cuisineCounts, seed) {
    return [...CUISINES].sort((a, b) => {
      const diff = (cuisineCounts[a] || 0) - (cuisineCounts[b] || 0);
      if (diff !== 0) return diff;
      return ((a.charCodeAt(0) + seed) % 5) - ((b.charCodeAt(0) + seed) % 5);
    })[0];
  }
  function filterRecipesLocal(opts) {
    const excludes = new Set((opts.excludeIds || []).filter(Boolean));
    return getAllRecipes().filter((recipe) => recipe.category === opts.category && (!opts.cuisine || recipe.cuisine === opts.cuisine) && !excludes.has(recipe.id) && recipe.nutrition.energy >= (opts.minEnergy || 0) && recipe.nutrition.energy <= (opts.maxEnergy || 9999));
  }
  function getTagValue(recipe, prefix) {
    return recipe?.tags?.find((tag) => tag.startsWith(prefix))?.slice(prefix.length) || null;
  }
  function getDessertProfile(recipe) {
    if (!recipe || recipe.category !== "デザート") return { fruit: null, base: null, budget: false, premium: false, freshFruit: false };
    return {
      fruit: getTagValue(recipe, "果物:"),
      base: recipe.tags.find((tag) => tag.endsWith("系")) || null,
      budget: recipe.tags.includes("安価"),
      premium: recipe.tags.includes("高価寄り"),
      freshFruit: recipe.tags.includes("生フルーツ")
    };
  }
  const RECIPE_PRIMARY_KEYWORD_WEIGHTS = new Map([
    ["ブロッコリー", 56], ["かぼちゃ", 56], ["にんじん", 42], ["人参", 42], ["玉ねぎ", 42], ["たまねぎ", 42],
    ["じゃがいも", 44], ["キャベツ", 44], ["青菜", 40], ["ほうれん草", 40], ["小松菜", 40], ["きのこ", 44],
    ["しめじ", 40], ["えのき", 40], ["なめこ", 40], ["豆腐", 48], ["大根", 44], ["白菜", 42], ["卵", 42],
    ["鶏", 40], ["豚", 40], ["鮭", 42], ["白身魚", 42], ["魚", 24], ["さつまいも", 46], ["里芋", 42], ["かぶ", 40],
    ["りんご", 34], ["バナナ", 34], ["みかん", 34], ["オレンジ", 34], ["白桃", 34], ["もも", 30], ["ぶどう", 34]
  ]);
  const RECIPE_FLAVOR_KEYWORD_WEIGHTS = new Map([
    ["コンソメ", 30], ["味噌", 30], ["みそ", 30], ["中華", 26], ["クリーム", 28], ["カレー", 28], ["トマト", 24],
    ["甘煮", 22], ["煮", 10], ["和え", 10], ["マヨ", 22], ["マヨネーズ", 22], ["酢", 18], ["しょうゆ", 18],
    ["醤油", 18], ["塩", 12], ["オイスター", 24], ["甘酢", 22], ["ごま", 16], ["胡麻", 16]
  ]);
  function getRecipeOverlapSourceText(recipe) {
    if (!recipe) return "";
    return [
      recipe.name || "",
      recipe.rotationKey || "",
      ...(recipe.tags || []),
      ...normalizeParts(recipe.ingredients || []).map((item) => getFoodLabel(item)),
      ...normalizeParts(recipe.seasonings || []).map((item) => getFoodLabel(item))
    ].join(" ").toLowerCase();
  }
  function collectRecipeOverlapKeywords(recipe, keywordWeights) {
    const text = getRecipeOverlapSourceText(recipe);
    const hits = new Map();
    keywordWeights.forEach((weight, keyword) => {
      if (text.includes(String(keyword).toLowerCase())) {
        hits.set(keyword, weight);
      }
    });
    return hits;
  }
  function scoreRecipeOverlap(recipeA, recipeB) {
    if (!(recipeA && recipeB)) return 0;
    if (recipeA.id && recipeB.id && recipeA.id === recipeB.id) return 320;
    if (recipeA.name && recipeB.name && recipeA.name === recipeB.name) return 260;
    const primaryA = collectRecipeOverlapKeywords(recipeA, RECIPE_PRIMARY_KEYWORD_WEIGHTS);
    const primaryB = collectRecipeOverlapKeywords(recipeB, RECIPE_PRIMARY_KEYWORD_WEIGHTS);
    const flavorA = collectRecipeOverlapKeywords(recipeA, RECIPE_FLAVOR_KEYWORD_WEIGHTS);
    const flavorB = collectRecipeOverlapKeywords(recipeB, RECIPE_FLAVOR_KEYWORD_WEIGHTS);
    let score = 0;
    let primaryMatches = 0;
    let flavorMatches = 0;
    primaryA.forEach((weight, keyword) => {
      if (primaryB.has(keyword)) {
        score += weight;
        primaryMatches += 1;
      }
    });
    flavorA.forEach((weight, keyword) => {
      if (flavorB.has(keyword)) {
        score += weight;
        flavorMatches += 1;
      }
    });
    if (primaryMatches >= 2) score += (primaryMatches - 1) * 42;
    if (flavorMatches >= 2) score += (flavorMatches - 1) * 18;
    if (primaryMatches && flavorMatches) score += 26;
    return score;
  }
  function scoreMenuOverlapPair(map, recipeIdA, recipeIdB, weight = 1) {
    const recipeA = map.get(recipeIdA);
    const recipeB = map.get(recipeIdB);
    return scoreRecipeOverlap(recipeA, recipeB) * weight;
  }
  function getIntraDayOverlapPenalty(menu, map = getRecipeMap()) {
    if (!menu) return 0;
    let penalty = 0;
    if (menu.mode === "basic") {
      penalty += scoreMenuOverlapPair(map, menu.basic.soup, menu.basic.side1, 1.7);
      penalty += scoreMenuOverlapPair(map, menu.basic.soup, menu.basic.side2, 1.7);
      penalty += scoreMenuOverlapPair(map, menu.basic.side1, menu.basic.side2, 1.1);
      penalty += scoreMenuOverlapPair(map, menu.basic.main, menu.basic.soup, 1.0);
      penalty += scoreMenuOverlapPair(map, menu.basic.main, menu.basic.side1, 0.95);
      penalty += scoreMenuOverlapPair(map, menu.basic.main, menu.basic.side2, 0.95);
      penalty += scoreMenuOverlapPair(map, menu.basic.staple, menu.basic.soup, 0.7);
      penalty += scoreMenuOverlapPair(map, menu.basic.staple, menu.basic.side1, 0.75);
      penalty += scoreMenuOverlapPair(map, menu.basic.staple, menu.basic.side2, 0.75);
      penalty += scoreMenuOverlapPair(map, menu.basic.staple, menu.basic.main, 0.55);
      penalty += scoreMenuOverlapPair(map, menu.basic.dessert, menu.snack, 1.15);
    } else {
      penalty += scoreMenuOverlapPair(map, menu.exception.singleDish, menu.exception.extraSoup, 1.5);
      penalty += scoreMenuOverlapPair(map, menu.exception.singleDish, menu.exception.extraSide, 1.5);
      penalty += scoreMenuOverlapPair(map, menu.exception.extraSoup, menu.exception.extraSide, 1.15);
      penalty += scoreMenuOverlapPair(map, menu.exception.extraDessert, menu.snack, 1.15);
    }
    return penalty;
  }
  function getPreferredCuisine(menu, targetCuisine) {
    return getPrimaryRecipeLocal(menu)?.cuisine || targetCuisine;
  }
  function getSideStyleBucket(recipe) {
    if (!recipe || recipe.category !== "副菜") return null;
    const seasoningIds = new Set((recipe.seasonings || []).map((item) => item.foodId));
    const tags = new Set(recipe.tags || []);
    if (seasoningIds.has("mayonnaise")) return "マヨネーズ系";
    if (tags.has("甘酢") || tags.has("マリネ")) return "甘酢系";
    if (tags.has("ナムル")) return "ナムル系";
    if (tags.has("煮物") || tags.has("煮びたし") || tags.has("煮込み") || tags.has("甘煮") || tags.has("甘め") || tags.has("そぼろ") || tags.has("やわらか")) return "煮物系";
    if (tags.has("ソテー")) return "ソテー系";
    if (tags.has("クリーム")) return "クリーム系";
    if (tags.has("胡麻")) return "胡麻系";
    if (tags.has("サラダ") || tags.has("和え物") || tags.has("さっぱり")) return "和え物系";
    return recipe.rotationKey || null;
  }
  function isSidePairTooSimilar(sideA, sideB) {
    if (!(sideA && sideB)) return false;
    if (sideA.id === sideB.id) return true;
    if (sideA.rotationKey && sideA.rotationKey === sideB.rotationKey) return true;
    const styleA = getSideStyleBucket(sideA);
    const styleB = getSideStyleBucket(sideB);
    return Boolean(styleA && styleB && styleA === styleB);
  }
  function filterCompatibleSideRecipes(pool, primarySide) {
    if (!primarySide) return pool;
    const compatible = pool.filter((recipe) => !isSidePairTooSimilar(primarySide, recipe));
    return compatible.length ? compatible : pool;
  }
  function filterSameNameSideRecipes(pool, primarySide) {
    if (!primarySide) return pool;
    const filtered = pool.filter((recipe) => recipe.id !== primarySide.id && recipe.name !== primarySide.name);
    return filtered.length ? filtered : pool.filter((recipe) => recipe.id !== primarySide.id);
  }
  function filterPoolByUsedSideNames(pool, context) {
    if (!context?.usedSideNames?.size) return pool;
    const filtered = pool.filter((recipe) => !context.usedSideNames.has(recipe.name));
    return filtered.length ? filtered : pool;
  }
  function hasDuplicateSidePair(dayMenu, map = getRecipeMap()) {
    if (!dayMenu || dayMenu.mode !== "basic") return false;
    const side1 = map.get(dayMenu.basic.side1);
    const side2 = map.get(dayMenu.basic.side2);
    if (!(side1 && side2)) return false;
    return side1.id === side2.id || side1.name === side2.name;
  }
  function buildReplacementSidePool(dayMenu, primarySide, context, options = {}) {
    const map = getRecipeMap();
    const cuisine = getPrimaryRecipeLocal(dayMenu)?.cuisine || primarySide?.cuisine || "和食";
    const blockedIds = new Set([primarySide?.id, ...(options.excludeIds || [])].filter(Boolean));
    const blockedNames = new Set([primarySide?.name, ...(options.excludeNames || [])].filter(Boolean));
    const filterOutDuplicates = (pool) => pool.filter((recipe) => !blockedIds.has(recipe.id) && !blockedNames.has(recipe.name));
    const shapePool = (pool, ignoreUsed = false) => {
      const noDupPool = filterOutDuplicates(pool);
      const balancedPool = filterCompatibleSideRecipes(noDupPool, primarySide);
      if (ignoreUsed) return balancedPool;
      return filterPoolByUsedSideNames(
        balancedPool.filter((recipe) => !(context?.usedSideIds?.has(recipe.id))),
        context
      );
    };
    const pools = [
      shapePool(filterRecipesLocal({ category: "副菜", cuisine, minEnergy: 20, maxEnergy: 110 }), false),
      shapePool(filterRecipesLocal({ category: "副菜", minEnergy: 20, maxEnergy: 110 }), false),
      shapePool(filterRecipesLocal({ category: "副菜", cuisine, minEnergy: 20, maxEnergy: 110 }), true),
      shapePool(filterRecipesLocal({ category: "副菜", minEnergy: 20, maxEnergy: 110 }), true)
    ].filter((pool) => pool.length);
    const preferredIds = (FORCED_SIDE_REPLACEMENT_IDS[dayMenu.date] || []).filter((id) => !blockedIds.has(id) && !blockedNames.has(map.get(id)?.name));
    for (const pool of pools) {
      const forcedRecipe = preferredIds.map((id) => map.get(id)).find((recipe) => recipe && pool.some((candidate) => candidate.id === recipe.id));
      if (forcedRecipe) return { pool, preferredId: forcedRecipe.id };
    }
    return { pool: pools[0] || [], preferredId: null };
  }
  function pickBestReplacementSide(dayMenu, primarySide, context, picker, options = {}) {
    const { pool, preferredId } = buildReplacementSidePool(dayMenu, primarySide, context, options);
    if (!pool.length) return null;
    if (preferredId) {
      const preferredRecipe = pool.find((recipe) => recipe.id === preferredId);
      if (preferredRecipe) return preferredRecipe;
    }
    const picked = picker(pool, { excludeRotationKeys: new Set([primarySide?.rotationKey].filter(Boolean)) });
    if (picked && picked.id !== primarySide?.id && picked.name !== primarySide?.name) return picked;
    return pool.find((recipe) => recipe.id !== primarySide?.id && recipe.name !== primarySide?.name) || null;
  }
  function pickSecondSideRecipe(cuisine, context, primarySide, picker, options = {}) {
    const replacement = pickBestReplacementSide(
      { date: options.date || "", mode: "basic", basic: { side1: primarySide?.id || null, side2: null }, exception: {} },
      primarySide,
      context,
      picker,
      { excludeIds: options.excludeIds || [], excludeNames: [primarySide?.name].filter(Boolean) }
    );
    if (replacement && replacement.id !== primarySide?.id && replacement.name !== primarySide?.name) return replacement;
    const excludeIds = [primarySide?.id].concat(options.excludeIds || []).filter(Boolean);
    const lastPool = filterRecipesLocal({ category: "副菜", minEnergy: 20, maxEnergy: 110, excludeIds }).filter((recipe) => recipe.name !== primarySide?.name);
    return lastPool[0] || null;
  }
  function isPreferredSnackRecipe(recipe) {
    if (!recipe || recipe.category !== "おやつ") return false;
    if (recipe.id === BIRTHDAY_SNACK_ID) return true;
    if (recipe.tags.includes("生フルーツ") || recipe.tags.includes("果物")) return false;
    return true;
  }
  function filterPreferredSnackRecipes(pool) {
    const preferred = pool.filter(isPreferredSnackRecipe);
    return preferred.length ? preferred : pool;
  }
  function applyCuisineConsistencyPenalty(menu, preferredCuisine, map) {
    const penaltyFor = (recipeId, amount) => {
      const recipe = map.get(recipeId);
      if (!recipe || !preferredCuisine || recipe.cuisine === preferredCuisine) return 0;
      return amount;
    };
    if (menu.mode === "basic") {
      return penaltyFor(menu.basic.soup, 40) + penaltyFor(menu.basic.side1, 22) + penaltyFor(menu.basic.side2, 22) + penaltyFor(menu.basic.staple, 12);
    }
    return penaltyFor(menu.exception.extraSoup, 65) + penaltyFor(menu.exception.extraSide, 46);
  }
  function scoreRecipePreference(recipe, context, role) {
    let score = (context.recipeUseCount.get(recipe.id) || 0) * 20;
    if (role === "main") {
      score += (context.mainRotationCount.get(recipe.rotationKey) || 0) * 40;
      if (recipe.rotationKey === context.lastMainRotationKey) score += 120;
      if (recipe.id === context.lastMainId) score += 180;
    }
    if (role.startsWith("side")) {
      score += (context.sideRotationCount.get(recipe.rotationKey) || 0) * 24;
      if (context.lastSideRotationKeys.has(recipe.rotationKey)) score += 40;
    }
    if (role === "dessert") {
      const profile = getDessertProfile(recipe);
      score += (context.dessertRotationCount.get(recipe.rotationKey) || 0) * 22;
      if (recipe.rotationKey === context.lastDessertRotationKey) score += 40;
      if (profile.base) {
        score += (context.dessertBaseCount.get(profile.base) || 0) * 28;
        if (profile.base === context.lastDessertBaseTag) score += 54;
      }
      if (profile.fruit) {
        score += (context.dessertFruitCount.get(profile.fruit) || 0) * 32;
        if (profile.fruit === context.lastDessertFruitTag) score += 72;
      }
      if (profile.premium) score += 18;
      if (profile.budget) score -= 8;
      if (profile.freshFruit) score += Math.max(0, context.freshFruitDessertCount - 1) * 12;
    }
    return score + Math.random() * 4;
  }
  function pickRecipe(pool, context, role, options = {}) {
    const excludeRotationKeys = options.excludeRotationKeys || new Set();
    const filtered = pool.filter((recipe) => !(excludeRotationKeys.has(recipe.rotationKey) || (role === "main" && options.excludeMainRotation && recipe.rotationKey === options.excludeMainRotation)));
    const source = filtered.length ? filtered : pool;
    if (!source.length) return null;
    const ranked = source.map((recipe) => ({ recipe, score: scoreRecipePreference(recipe, context, role) })).sort((a, b) => a.score - b.score).slice(0, Math.min(14, source.length));
    return ranked[Math.floor(Math.random() * ranked.length)].recipe;
  }
  function getPrimaryRecipeLocal(menu) {
    const map = getRecipeMap();
    return map.get(menu.mode === "basic" ? menu.basic.main : menu.exception.singleDish) || null;
  }
  function scoreMenu(menu, context, targetCuisine) {
    const evaluation = evaluateDayMenu(menu);
    if (!evaluation.structurePass) return -999999;
    let score = 1000;
    score -= Math.abs(evaluation.totals.energy - 550) * 4;
    if (evaluation.totals.energy < 500) score -= (500 - evaluation.totals.energy) * 4;
    if (evaluation.totals.energy > 600) score -= (evaluation.totals.energy - 600) * 5;
    if (evaluation.totals.salt > 3.0) score -= (evaluation.totals.salt - 3.0) * 260; else score += (3.0 - evaluation.totals.salt) * 4;
    const primary = getPrimaryRecipeLocal(menu);
    if (primary) {
      if (primary.id === context.lastMainId) score -= 220;
      if (primary.rotationKey === context.lastMainRotationKey) score -= 140;
      if (primary.cuisine !== targetCuisine) score -= 24;
      score -= (context.cuisineCounts[primary.cuisine] || 0) * 22;
      score -= (context.mainRotationCount.get(primary.rotationKey) || 0) * 40;
    }
    getMenuRecipeIds(menu).forEach((id) => { score -= (context.recipeUseCount.get(id) || 0) * 36; });
    const map = getRecipeMap();
    score -= applyCuisineConsistencyPenalty(menu, getPreferredCuisine(menu, targetCuisine), map);
    (menu.mode === "basic" ? [menu.basic.side1, menu.basic.side2] : [menu.exception.extraSide]).filter(Boolean).map((id) => map.get(id)).filter(Boolean).forEach((side) => {
      score -= (context.sideRotationCount.get(side.rotationKey) || 0) * 28;
      if (context.lastSideRotationKeys.has(side.rotationKey)) score -= 56;
    });
    if (menu.mode === "basic") {
      const side1 = map.get(menu.basic.side1);
      const side2 = map.get(menu.basic.side2);
      if (isSidePairTooSimilar(side1, side2)) score -= 160;
    }
    const dessert = map.get(menu.mode === "basic" ? menu.basic.dessert : menu.exception.extraDessert);
    if (dessert) {
      const profile = getDessertProfile(dessert);
      score -= (context.dessertRotationCount.get(dessert.rotationKey) || 0) * 24;
      if (dessert.rotationKey === context.lastDessertRotationKey) score -= 45;
      if (profile.base) {
        score -= (context.dessertBaseCount.get(profile.base) || 0) * 32;
        if (profile.base === context.lastDessertBaseTag) score -= 58;
      }
      if (profile.fruit) {
        score -= (context.dessertFruitCount.get(profile.fruit) || 0) * 38;
        if (profile.fruit === context.lastDessertFruitTag) score -= 88;
      }
      if (profile.premium) score -= 24;
      if (profile.budget) score += 14;
      if (profile.freshFruit) {
        if (context.freshFruitDessertCount === 0) score += 18;
        if (context.freshFruitDessertCount >= 2) score -= context.freshFruitDessertCount * 14;
      }
    }
    score -= getIntraDayOverlapPenalty(menu, map);
    return score;
  }
  function updateGenerationContext(menu, context) {
    const map = getRecipeMap();
    getMenuRecipeIds(menu).forEach((id) => context.recipeUseCount.set(id, (context.recipeUseCount.get(id) || 0) + 1));
    const primary = getPrimaryRecipeLocal(menu);
    if (primary) {
      context.lastMainId = primary.id;
      context.lastMainRotationKey = primary.rotationKey;
      context.cuisineCounts[primary.cuisine] = (context.cuisineCounts[primary.cuisine] || 0) + 1;
      context.mainRotationCount.set(primary.rotationKey, (context.mainRotationCount.get(primary.rotationKey) || 0) + 1);
    }
    context.lastSideRotationKeys = new Set();
    (menu.mode === "basic" ? [menu.basic.side1, menu.basic.side2] : [menu.exception.extraSide]).filter(Boolean).forEach((id) => {
      const recipe = map.get(id); if (!recipe) return;
      context.lastSideRotationKeys.add(recipe.rotationKey);
      context.sideRotationCount.set(recipe.rotationKey, (context.sideRotationCount.get(recipe.rotationKey) || 0) + 1);
      context.usedSideIds.add(id);
      context.usedSideNames?.add(recipe.name);
    });
    const dessert = map.get(menu.mode === "basic" ? menu.basic.dessert : menu.exception.extraDessert);
    if (dessert) {
      const profile = getDessertProfile(dessert);
      context.lastDessertRotationKey = dessert.rotationKey;
      context.dessertRotationCount.set(dessert.rotationKey, (context.dessertRotationCount.get(dessert.rotationKey) || 0) + 1);
      if (profile.base) {
        context.lastDessertBaseTag = profile.base;
        context.dessertBaseCount.set(profile.base, (context.dessertBaseCount.get(profile.base) || 0) + 1);
      }
      if (profile.fruit) {
        context.lastDessertFruitTag = profile.fruit;
        context.dessertFruitCount.set(profile.fruit, (context.dessertFruitCount.get(profile.fruit) || 0) + 1);
      }
      if (profile.freshFruit) context.freshFruitDessertCount += 1;
    }
    if (menu.snack) context.usedSnackIds.add(menu.snack);
  }
  function buildBasicCandidate(cuisine, context, date) {
    const staple = pickRecipe(filterRecipesLocal({ category: "主食", cuisine, minEnergy: 100, maxEnergy: 230 }), context, "staple");
    const soup = pickRecipe(filterRecipesLocal({ category: "汁物", cuisine, minEnergy: 15, maxEnergy: 90 }), context, "soup");
    const main = pickRecipe(filterRecipesLocal({ category: "主菜", cuisine, minEnergy: 140, maxEnergy: 280 }), context, "main", { excludeMainRotation: context.lastMainRotationKey });
    const side1 = pickRecipe(filterPoolByUsedSideNames(filterRecipesLocal({ category: "副菜", cuisine, minEnergy: 20, maxEnergy: 110 }), context), context, "side1");
    const side2 = pickSecondSideRecipe(cuisine, context, side1, (pool, pickOptions) => pickRecipe(pool, context, "side2", pickOptions));
    const dessert = pickRecipe(filterRecipesLocal({ category: "デザート", minEnergy: 35, maxEnergy: 120 }), context, "dessert", { excludeRotationKeys: new Set([context.lastDessertRotationKey].filter(Boolean)) });
    if (!(staple && soup && main && side1 && side2 && dessert)) return null;
    const menu = { date, mode: "basic", basic: { staple: staple.id, soup: soup.id, main: main.id, side1: side1.id, side2: side2.id, dessert: dessert.id }, exception: { singleDish: null, extraSoup: null, extraSide: null, extraDessert: null }, memo: `${cuisine}中心の自動献立`, generatedByAuto: true };
    return { menu, score: scoreMenu(menu, context, cuisine) };
  }
  function buildExceptionCandidate(cuisine, context, date) {
    const singleDish = pickRecipe(filterRecipesLocal({ category: "単品料理", cuisine, minEnergy: 320, maxEnergy: 520 }), context, "main", { excludeMainRotation: context.lastMainRotationKey });
    if (!singleDish) return null;
    let extraSoup = null, extraSide = null, extraDessert = null;
    if (singleDish.nutrition.energy < 470) {
      extraSide = pickRecipe(filterRecipesLocal({ category: "副菜", minEnergy: 25, maxEnergy: 90 }), context, "side1");
      extraDessert = pickRecipe(filterRecipesLocal({ category: "デザート", minEnergy: 40, maxEnergy: 110 }), context, "dessert");
    } else if (singleDish.nutrition.energy < 520) {
      extraDessert = pickRecipe(filterRecipesLocal({ category: "デザート", minEnergy: 35, maxEnergy: 90 }), context, "dessert");
    }
    if (singleDish.nutrition.salt < 2.2) extraSoup = pickRecipe(filterRecipesLocal({ category: "汁物", minEnergy: 15, maxEnergy: 70 }), context, "soup");
    const menu = { date, mode: "exception", basic: { staple: null, soup: null, main: null, side1: null, side2: null, dessert: null }, exception: { singleDish: singleDish.id, extraSoup: extraSoup?.id || null, extraSide: extraSide?.id || null, extraDessert: extraDessert?.id || null }, memo: `${cuisine}中心の例外献立`, generatedByAuto: true };
    return { menu, score: scoreMenu(menu, context, cuisine) - 8 };
  }
  function generateAutoWeek(weekStart) {
    const week = createEmptyWeekMenu(weekStart);
    const context = { cuisineCounts: { 和食: 0, 洋食: 0, 中華: 0 }, recipeUseCount: new Map(), mainRotationCount: new Map(), sideRotationCount: new Map(), dessertRotationCount: new Map(), dessertFruitCount: new Map(), dessertBaseCount: new Map(), lastMainId: null, lastMainRotationKey: null, lastDessertRotationKey: null, lastDessertFruitTag: null, lastDessertBaseTag: null, lastSideRotationKeys: new Set(), freshFruitDessertCount: 0, usedSideIds: new Set(), usedSideNames: new Set(), usedSnackIds: new Set() };
    const exceptionDays = [...WEEKDAY_KEYS].sort(() => Math.random() - 0.5).slice(0, 1);
    WEEKDAY_KEYS.forEach((dayKey, index) => {
      const targetCuisine = chooseTargetCuisine(context.cuisineCounts, index);
      const candidates = [];
      for (let i = 0; i < 90; i += 1) candidates.push(buildBasicCandidate(targetCuisine, context, addDays(weekStart, index)));
      for (let i = 0; i < 25; i += 1) candidates.push(buildExceptionCandidate(exceptionDays.includes(dayKey) ? targetCuisine : chooseTargetCuisine(context.cuisineCounts, index + i + 1), context, addDays(weekStart, index)));
      const best = candidates.filter(Boolean).sort((a, b) => b.score - a.score)[0];
      week[dayKey] = best ? best.menu : createEmptyWeekMenu(weekStart)[dayKey];
      updateGenerationContext(week[dayKey], context);
    });
    return week;
  }
  updateHeroSummary = function () {
    const week = getWeekMenus(state.settings.weekStart);
    const totals = evaluateDayMenu(week.mon).totals;
    if (elements.heroEnergy) {
      elements.heroEnergy.textContent = `${formatNumber(totals.energy, 0)} kcal`;
    }
  };
  renderIngredientTable = function (recipe, servings) {
    const rows = [...recipe.ingredients.map((item) => ({ ...item, kind: "食材" })), ...recipe.seasonings.map((item) => ({ ...item, kind: "調味料" }))].map((item) => {
      const note = item.kind === "食材" ? item.prep : item.step;
      const noteLabel = item.kind === "食材" ? "下処理" : "工程";
      return `<tr><td>${item.kind}</td><td><div>${escapeHtml(getFoodLabel(item))}</div>${note ? `<div class="muted">${escapeHtml(`${noteLabel}: ${note}`)}</div>` : ""}</td><td>${formatNumber(item.grams, 0)} g</td></tr>`;
    }).join("");
    return `<table class="ingredient-table"><thead><tr><th>区分</th><th>材料・調味料</th><th>1人前</th></tr></thead><tbody>${rows}</tbody></table>`;
  };
  function renderRecipeIngredientTable(recipe) {
    const renderGroupRows = (items, kind) => items.map((item) => {
      const note = kind === "食材" ? item.prep : item.step;
      const noteLabel = kind === "食材" ? "下処理" : "工程";
      return `<tr><td><div class="recipe-ingredient-main"><div>${escapeHtml(getFoodLabel(item))}</div>${note ? `<div class="muted">${escapeHtml(`${noteLabel}: ${note}`)}</div>` : ""}</div></td><td class="recipe-ingredient-amount">${formatNumber(item.grams, 0)} g</td></tr>`;
    }).join("");
    const sections = [];
    if (recipe.ingredients.length) {
      sections.push(`<div class="recipe-ingredient-group"><h5 class="recipe-ingredient-group-title">食材</h5><table class="recipe-ingredient-table"><tbody>${renderGroupRows(recipe.ingredients, "食材")}</tbody></table></div>`);
    }
    if (recipe.seasonings.length) {
      sections.push(`<div class="recipe-ingredient-group"><h5 class="recipe-ingredient-group-title">調味料</h5><table class="recipe-ingredient-table"><tbody>${renderGroupRows(recipe.seasonings, "調味料")}</tbody></table></div>`);
    }
    return `<section class="recipe-ingredient-section"><h4>材料・調味料（1人前）</h4>${sections.join("")}</section>`;
  }
  renderMetricCards = function (nutrition, note) {
    return `<div class="metrics-grid six">${METRIC_META.map((item) => `<article class="metric-card"><span>${item.label}</span><strong>${formatNumber(nutrition[item.key], item.digits)} ${item.unit}</strong><small>${note}</small></article>`).join("")}</div>`;
  };
  function renderRecipeNutritionCompact(nutrition) {
    const safeNutrition = nutrition || emptyNutrition();
    const nutritionItems = [
      ["エネルギー", `${formatNumber(safeNutrition.energy, 0)}kcal`],
      ["たんぱく質", `${formatNumber(safeNutrition.protein, 1)}g`],
      ["脂質", `${formatNumber(safeNutrition.fat, 1)}g`],
      ["炭水化物", `${formatNumber(safeNutrition.carbs, 1)}g`],
      ["食物繊維", `${formatNumber(safeNutrition.fiber, 1)}g`],
      ["食塩相当量", `${formatNumber(safeNutrition.salt, 1)}g`]
    ];
    return `<section class="recipe-nutrition-section"><h4>食品成分</h4><div class="recipe-nutrition-list">${nutritionItems.map(([label, value]) => `<div class="recipe-nutrition-item"><span>${label}</span><strong>${value}</strong></div>`).join("")}</div></section>`;
  }
  function renderKitchenNutritionSummary(nutrition) {
    return `<section><h4>食品成分</h4><div class="metrics-grid six">${METRIC_META.map((item) => `<article class="metric-card"><span>${item.label}</span><strong>${formatNumber(nutrition[item.key], item.digits)} ${item.unit}</strong></article>`).join("")}</div></section>`;
  }
  renderConditionCards = function (evaluation) {
    const cards = [{ label: "構成", pass: evaluation.structurePass, detail: evaluation.structurePass ? "必要な構成がそろっています。" : "必要な構成が不足しています。" }, { label: "エネルギー", pass: evaluation.energyPass, detail: `${formatNumber(evaluation.totals.energy, 0)} kcal / 目安 500〜600 kcal` }, { label: "塩分", pass: evaluation.saltPass, detail: `${formatNumber(evaluation.totals.salt, 1)} g / 上限 3.0 g` }];
    return cards.map((card) => `<article class="check-card ${card.pass ? "pass" : "fail"}"><span>${card.label}</span><strong>${card.pass ? "適合" : "要調整"}</strong><p class="muted">${card.detail}</p></article>`).join("");
  };
  function shouldHideDuplicateSide2(dayMenu, recipeMap) {
    if (!dayMenu || dayMenu.mode !== "basic") return false;
    const side1 = recipeMap.get(dayMenu.basic.side1);
    const side2 = recipeMap.get(dayMenu.basic.side2);
    if (!(side1 && side2)) return false;
    return side1.id === side2.id || side1.name === side2.name;
  }
  function getResidentCellText(dayMenu, slotKey, recipeMap) {
    if (dayMenu.mode === "basic") {
      if (slotKey === "side2" && shouldHideDuplicateSide2(dayMenu, recipeMap)) {
        return "";
      }
      return recipeMap.get(dayMenu.basic[slotKey])?.name || "調整中";
    }
    const singleDish = recipeMap.get(dayMenu.exception.singleDish)?.name || "";
    const extraSoup = recipeMap.get(dayMenu.exception.extraSoup)?.name;
    const extraSide = recipeMap.get(dayMenu.exception.extraSide)?.name;
    const extraDessert = recipeMap.get(dayMenu.exception.extraDessert)?.name;
    switch (slotKey) {
      case "staple":
        return singleDish;
      case "soup":
        return extraSoup || "";
      case "main":
        return extraSide || "";
      case "side1":
        return "";
      case "side2":
        return "";
      case "dessert":
        return extraDessert || "";
      default:
        return "調整中";
    }
  }
  function getKitchenSlotText(dayMenu, slotKey, recipeMap) {
    return getResidentCellText(dayMenu, slotKey, recipeMap);
  }
  function getKitchenSlotBindings(dayMenu, recipeMap = getRecipeMap()) {
    if (dayMenu.mode === "basic") {
      const side2RecipeId = shouldHideDuplicateSide2(dayMenu, recipeMap) ? null : dayMenu.basic.side2;
      return [
        ["主食", dayMenu.basic.staple],
        ["汁物", dayMenu.basic.soup],
        ["主菜", dayMenu.basic.main],
        ["副菜1", dayMenu.basic.side1],
        ["副菜2", side2RecipeId],
        ["デザート", dayMenu.basic.dessert]
      ];
    }
    return [
      ["主食", dayMenu.exception.singleDish],
      ["汁物", dayMenu.exception.extraSoup],
      ["主菜", dayMenu.exception.extraSide],
      ["副菜1", null],
      ["副菜2", null],
      ["デザート", dayMenu.exception.extraDessert]
    ];
  }
  function formatPartAmount(partItem, kind) {
    if (kind === "seasoning" && Math.round(Number(partItem.grams || 0)) === 0) {
      return "少々";
    }
    return `${formatNumber(partItem.grams, 0)}g`;
  }
  function formatPartLines(parts, servings, kind = "ingredient") {
    if (!parts.length) {
      return "該当なし";
    }
    return `<div class="part-lines">${parts.map((item) => {
      const note = item.prep || item.step;
      return `<span>${escapeHtml(getFoodLabel(item))} ${formatPartAmount(item, kind)}${note ? `（${escapeHtml(note)}）` : ""}</span>`;
    }).join("")}</div>`;
  }
  renderResidentView = function () {
    const week = getWeekMenus(state.settings.weekStart); const map = getRecipeMap();
    const headers = WEEKDAY_KEYS.map((dayKey) => `<th>${formatDate(week[dayKey].date)}<br>${WEEKDAY_LABELS[dayKey]}曜日</th>`).join("");
    const rows = [["主食", "staple"], ["汁物", "soup"], ["主菜", "main"], ["副菜1", "side1"], ["副菜2", "side2"], ["デザート", "dessert"]].map(([label, slotKey]) => `<tr><th scope="row">${label}</th>${WEEKDAY_KEYS.map((dayKey) => `<td>${escapeHtml(getResidentCellText(week[dayKey], slotKey, map))}</td>`).join("")}</tr>`).join("");
    elements.residentView.innerHTML = `<article class="panel"><div class="section-head"><div><p class="section-kicker">Resident Menu</p><h2>利用者向け 5日分献立表</h2></div><p class="section-note">A4 1枚で月曜から金曜の昼食を見やすく印刷する、利用者向けの簡潔な献立表です。</p></div><table class="resident-menu-table"><thead><tr><th>区分</th>${headers}</tr></thead><tbody>${rows}</tbody></table><p class="resident-page-note">印刷時は日付、曜日、主食、汁物、主菜、副菜1、副菜2、デザートのみを表示します。</p></article>`;
  };
  renderKitchenView = function () {
    const week = getWeekMenus(state.settings.weekStart); const map = getRecipeMap();
    const sheets = WEEKDAY_KEYS.map((dayKey) => {
      const dayMenu = week[dayKey]; const evaluation = evaluateDayMenu(dayMenu);
      const summaryRows = [["主食", "staple"], ["汁物", "soup"], ["主菜", "main"], ["副菜1", "side1"], ["副菜2", "side2"], ["デザート", "dessert"]].map(([label, slotKey]) => `<tr><th scope="row">${label}</th><td>${escapeHtml(getKitchenSlotText(dayMenu, slotKey, map))}</td></tr>`).join("");
      const grouped = new Map();
      getKitchenSlotBindings(dayMenu).forEach(([slotLabel, recipeId]) => {
        if (!recipeId) return;
        if (!grouped.has(recipeId)) grouped.set(recipeId, []);
        grouped.get(recipeId).push(slotLabel);
      });
      const recipeRows = [...grouped.entries()].map(([recipeId, slotLabels]) => {
        const recipe = map.get(recipeId);
        if (!recipe) return "";
        return `<tr><td>${escapeHtml(slotLabels.join(" / "))}</td><td>${escapeHtml(recipe.name)}</td><td>${formatNumber(recipe.servingSize, 0)} g</td><td>${formatNumber(recipe.servingSize * state.settings.kitchenServings, 0)} g</td><td>${formatPartLines(recipe.ingredients, state.settings.kitchenServings, "ingredient")}</td><td>${formatPartLines(recipe.seasonings, state.settings.kitchenServings, "seasoning")}</td><td>${escapeHtml(recipe.instructions.join(" / "))}</td><td>${formatNumber(recipe.nutrition.energy, 0)} kcal<br>塩分 ${formatNumber(recipe.nutrition.salt, 1)} g</td></tr>`;
      }).join("") || '<tr><td colspan="8">献立が未設定です。</td></tr>';
      return `<article class="panel kitchen-day-sheet page-print-break"><div class="section-head"><div><p class="section-kicker">${WEEKDAY_LABELS[dayKey]}曜日</p><h2>${formatDate(dayMenu.date)} 調理室向け指示書</h2></div><p class="section-note">食数 ${state.settings.kitchenServings}食 / エネルギー ${formatNumber(evaluation.totals.energy, 0)} kcal / 塩分 ${formatNumber(evaluation.totals.salt, 1)} g</p></div><div class="kitchen-page-stack"><div class="kitchen-day-meta"><table class="kitchen-summary-table"><tbody>${summaryRows}</tbody></table>${renderMetricCards(evaluation.totals, "献立全体")}</div><div class="check-grid">${renderConditionCards(evaluation)}</div><table class="kitchen-day-table"><thead><tr><th>献立枠</th><th>料理名</th><th>1人前量</th><th>総量</th><th>材料</th><th>調味料</th><th>作業指示</th><th>栄養価</th></tr></thead><tbody>${recipeRows}</tbody></table></div></article>`;
    }).join("");
    elements.kitchenView.innerHTML = `<article class="panel kitchen-intro"><div class="section-head"><div><p class="section-kicker">Kitchen Sheets</p><h2>調理師向け 5日分指示書</h2></div><p class="section-note">印刷時は1日ごとにA4 1ページで改ページし、献立、材料、調味料、総量、作業指示、栄養価、塩分、条件判定を表示します。</p></div><p class="print-note">調理師向けを印刷すると、月曜から金曜までが1日1ページで出力されます。</p></article>${sheets}`;
  };
  renderRecipeDetailPanel = function (recipe) {
    if (!recipe) return `<article class="card recipe-detail"><div class="empty-state">料理を選ぶと、材料、調味料、作業指示、1人前量、総量、栄養価を確認できます。</div></article>`;
    if (state.recipeMasterMode === "edit") {
      const draft = state.recipeMasterDraft || createRecipeDraftFromRecipe(recipe);
      const categoryOptions = ["主食", "汁物", "主菜", "副菜", "デザート", "おやつ", "単品料理"]
        .map((category) => `<option value="${escapeHtml(category)}" ${draft.category === category ? "selected" : ""}>${escapeHtml(category)}</option>`)
        .join("");
      const cuisineOptions = ["和食", "洋食", "中華"]
        .map((cuisine) => `<option value="${escapeHtml(cuisine)}" ${draft.cuisine === cuisine ? "selected" : ""}>${escapeHtml(cuisine)}</option>`)
        .join("");
      return `<article class="card recipe-detail"><div class="sub-head"><div><p class="section-kicker">Selected Recipe</p><h3>料理を編集</h3></div><span class="pill">${escapeHtml(recipe.cuisine)} / ${escapeHtml(recipe.category)}</span></div>${state.recipeMasterDraftError ? `<p class="recipe-master-form-error">${escapeHtml(state.recipeMasterDraftError)}</p>` : ""}<div class="recipe-master-form-grid"><label class="field"><span>料理名</span><input id="recipe-master-draft-name" data-recipe-master-draft="name" type="text" value="${escapeHtml(draft.name)}"></label><label class="field"><span>カテゴリ</span><select id="recipe-master-draft-category" data-recipe-master-draft="category">${categoryOptions}</select></label><label class="field"><span>cuisine</span><select id="recipe-master-draft-cuisine" data-recipe-master-draft="cuisine">${cuisineOptions}</select></label><label class="field"><span>1人前量</span><input id="recipe-master-draft-serving-size" data-recipe-master-draft="servingSize" type="number" min="1" step="1" value="${escapeHtml(draft.servingSize)}"></label><label class="field is-full"><span>提供方法</span><textarea id="recipe-master-draft-notes" data-recipe-master-draft="notes">${escapeHtml(draft.notes)}</textarea></label>${renderRecipeMasterPartEditor("ingredient", "食材", draft.ingredientRows || [])}${renderRecipeMasterPartEditor("seasoning", "調味料", draft.seasoningRows || [])}<div class="recipe-master-section-title">食品成分</div><label class="field"><span>エネルギー</span><input id="recipe-master-draft-energy" data-recipe-master-draft="energy" type="number" step="1" value="${escapeHtml(draft.energy)}"></label><label class="field"><span>たんぱく質</span><input id="recipe-master-draft-protein" data-recipe-master-draft="protein" type="number" step="0.1" value="${escapeHtml(draft.protein || "0")}"></label><label class="field"><span>脂質</span><input id="recipe-master-draft-fat" data-recipe-master-draft="fat" type="number" step="0.1" value="${escapeHtml(draft.fat || "0")}"></label><label class="field"><span>炭水化物</span><input id="recipe-master-draft-carbs" data-recipe-master-draft="carbs" type="number" step="0.1" value="${escapeHtml(draft.carbs || "0")}"></label><label class="field"><span>食物繊維</span><input id="recipe-master-draft-fiber" data-recipe-master-draft="fiber" type="number" step="0.1" value="${escapeHtml(draft.fiber || "0")}"></label><label class="field"><span>食塩相当量</span><input id="recipe-master-draft-salt" data-recipe-master-draft="salt" type="number" step="0.1" value="${escapeHtml(draft.salt)}"></label><label class="field is-full"><span>作業指示</span><textarea id="recipe-master-draft-steps" data-recipe-master-draft="steps">${escapeHtml(draft.steps)}</textarea></label></div><div class="recipe-master-form-actions"><button type="button" class="button button-secondary" id="recipe-master-cancel-button">キャンセル</button><button type="button" class="button button-primary" id="recipe-master-save-button">保存</button></div></article>`;
    }
    return `<article class="card recipe-detail"><div class="sub-head"><div><p class="section-kicker">Selected Recipe</p><h3>${escapeHtml(recipe.name)}</h3></div><span class="pill">${escapeHtml(recipe.cuisine)} / ${escapeHtml(recipe.category)}</span></div><div class="tag-row"><span class="tag">rotation ${escapeHtml(recipe.rotationKey)}</span>${recipe.tags.map((tag) => `<span class="pill">${escapeHtml(tag)}</span>`).join("")}</div>${recipe.notes ? `<div><h4>提供方法</h4><p class="muted">${escapeHtml(recipe.notes)}</p></div>` : ""}<div class="stack">${renderRecipeIngredientTable(recipe)}${renderRecipeNutritionCompact(recipe.nutrition)}<div><h4>作業指示</h4><ol class="detail-list">${recipe.instructions.map((step) => `<li>${escapeHtml(step)}</li>`).join("")}</ol></div></div><div class="recipe-master-detail-actions"><button type="button" class="button button-secondary" id="recipe-master-edit-button">編集</button><button type="button" class="button button-secondary" id="recipe-master-delete-button">削除</button></div></article>`;
  };
  renderSlotSelect = function (dayKey, mode, field, label, currentValue, recipes, optional = false) {
    return `<label class="field"><span>${label}</span><select data-menu-day="${dayKey}" data-menu-mode="${mode}" data-menu-field="${field}"><option value="">${optional ? "追加しない" : "選択してください"}</option>${recipes.map((recipe) => `<option value="${recipe.id}" ${recipe.id === currentValue ? "selected" : ""}>${escapeHtml(recipe.name)} (${escapeHtml(recipe.cuisine)})</option>`).join("")}</select></label>`;
  };
  function renderWeeklyEditorSlotSelect(dayKey, mode, field, label, currentValue, recipes, optional = false) {
    return `<label class="field"><span>${label}</span><select data-menu-day="${dayKey}" data-menu-mode="${mode}" data-menu-field="${field}"><option value="">${optional ? "追加しない" : "選択してください"}</option>${recipes.map((recipe) => `<option value="${recipe.id}" ${recipe.id === currentValue ? "selected" : ""}>${escapeHtml(recipe.name)}</option>`).join("")}</select></label>`;
  }
  function summarizeCatalog(recipes) {
    const byCuisine = Object.fromEntries(CUISINES.map((item) => [item, 0]));
    const byCategory = Object.fromEntries(CATEGORY_KEYS.map((item) => [item, 0]));
    recipes.forEach((recipe) => { byCuisine[recipe.cuisine] += 1; byCategory[recipe.category] += 1; });
    return { total: recipes.length, byCuisine, byCategory };
  }
  renderAdminView = function () {
    const week = getWeekMenus(state.settings.weekStart); const recipes = getAllRecipes(); const foods = getAllFoods(); const selectedRecipe = recipes.find((recipe) => recipe.id === state.selectedRecipeId) || null; const catalog = summarizeCatalog(recipes); const byCategory = (category) => recipes.filter((recipe) => recipe.category === category).sort((a, b) => a.name.localeCompare(b.name, 'ja'));
    const editorCards = WEEKDAY_KEYS.map((dayKey) => { const dayMenu = week[dayKey]; const evaluation = evaluateDayMenu(dayMenu); return `<article class="menu-card"><div class="sub-head"><div><p class="section-kicker">${WEEKDAY_LABELS[dayKey]}曜日</p><h3>${formatDate(dayMenu.date)}</h3></div><span class="pill">${dayMenu.mode === "basic" ? "通常献立" : "例外献立"}</span></div><div class="stack"><label class="field"><span>献立タイプ</span><select data-menu-day="${dayKey}" data-menu-field="mode"><option value="basic" ${dayMenu.mode === "basic" ? "selected" : ""}>通常献立</option><option value="exception" ${dayMenu.mode === "exception" ? "selected" : ""}>例外献立</option></select></label><div class="grid-two">${renderSlotSelect(dayKey, "basic", "staple", "主食", dayMenu.basic.staple, byCategory("主食"))}${renderSlotSelect(dayKey, "basic", "soup", "汁物", dayMenu.basic.soup, byCategory("汁物"))}${renderSlotSelect(dayKey, "basic", "main", "主菜", dayMenu.basic.main, byCategory("主菜"))}${renderSlotSelect(dayKey, "basic", "side1", "副菜1", dayMenu.basic.side1, byCategory("副菜"))}${renderSlotSelect(dayKey, "basic", "side2", "副菜2", dayMenu.basic.side2, byCategory("副菜"))}${renderSlotSelect(dayKey, "basic", "dessert", "デザート", dayMenu.basic.dessert, byCategory("デザート"))}</div><div class="grid-two">${renderSlotSelect(dayKey, "exception", "singleDish", "単品料理", dayMenu.exception.singleDish, byCategory("単品料理"))}${renderSlotSelect(dayKey, "exception", "extraSoup", "追加汁物", dayMenu.exception.extraSoup, byCategory("汁物"), true)}${renderSlotSelect(dayKey, "exception", "extraSide", "追加副菜", dayMenu.exception.extraSide, byCategory("副菜"), true)}${renderSlotSelect(dayKey, "exception", "extraDessert", "追加デザート", dayMenu.exception.extraDessert, byCategory("デザート"), true)}</div><label class="field"><span>メモ</span><textarea data-menu-day="${dayKey}" data-menu-field="memo">${escapeHtml(dayMenu.memo || "")}</textarea></label><div class="check-grid">${renderConditionCards(evaluation)}</div></div></article>`; }).join("");
    elements.adminView.innerHTML = `<article class="panel"><div class="section-head"><div><p class="section-kicker">Admin</p><h2>管理画面</h2></div><p class="section-note">大量の料理候補から、昼食献立を手動編集または自動生成します。利用者向け献立表と調理師向け指示書は、この週の内容をそのまま反映します。</p></div><div class="toolbar"><label class="field"><span>週の開始日</span><input id="admin-week-start" type="date" value="${escapeHtml(state.settings.weekStart)}"></label><label class="field"><span>調理人数</span><input id="admin-kitchen-servings" type="number" min="1" step="1" value="${escapeHtml(state.settings.kitchenServings)}"></label><button type="button" class="button button-primary" id="auto-generate-button">自動で5日分の献立を作成</button><button type="button" class="button button-secondary" id="regenerate-week-button">5日分を再生成</button><button type="button" class="button button-secondary" id="save-week-button">この週を保存</button></div></article><article class="panel"><div class="section-head"><div><p class="section-kicker">Catalog</p><h2>料理マスタ概要</h2></div><p class="section-note">和食・洋食・中華を増やし、副菜とデザートを十分に分散できる構成にしています。</p></div><div class="catalog-stats"><article class="metric-card"><span>総料理数</span><strong>${catalog.total}</strong><small>自動献立対象</small></article><article class="metric-card"><span>和食 / 洋食 / 中華</span><strong>${catalog.byCuisine["和食"]} / ${catalog.byCuisine["洋食"]} / ${catalog.byCuisine["中華"]}</strong><small>料理候補数</small></article><article class="metric-card"><span>副菜数</span><strong>${catalog.byCategory["副菜"]}</strong><small>偏り回避に使用</small></article><article class="metric-card"><span>デザート数</span><strong>${catalog.byCategory["デザート"]}</strong><small>分散候補</small></article></div></article><article class="panel"><div class="section-head"><div><p class="section-kicker">Weekly Editor</p><h2>5日分献立編集</h2></div><p class="section-note">自動生成後も、月曜から金曜までを個別に上書きできます。</p></div><div class="weekly-grid">${editorCards}</div></article><article class="panel"><div class="section-head"><div><p class="section-kicker">Recipe Master</p><h2>料理一覧</h2></div><p class="section-note">料理を選ぶと、cuisine、材料、調味料、1人前量、総量、作業指示、栄養価を確認できます。</p></div><div class="detail-grid"><div class="recipe-list">${recipes.map((recipe) => `<article class="recipe-card ${recipe.id === state.selectedRecipeId ? "is-active" : ""}" data-recipe-card="${recipe.id}"><div class="sub-head"><div><h3>${escapeHtml(recipe.name)}</h3><span class="tag">${escapeHtml(recipe.cuisine)} / ${escapeHtml(recipe.category)}</span></div><span class="pill">${formatNumber(recipe.nutrition.energy, 0)} kcal</span></div><p class="muted">rotation ${escapeHtml(recipe.rotationKey)} / ${escapeHtml(recipe.tags.join("・"))}</p></article>`).join("")}</div>${renderRecipeDetailPanel(selectedRecipe)}</div></article><article class="panel"><div class="section-head"><div><p class="section-kicker">Food Master</p><h2>食品マスタ</h2></div><p class="section-note">食品成分表ベースの100gあたり栄養価です。</p></div><div class="food-list">${foods.map((food) => `<article class="card"><div class="sub-head"><strong>${escapeHtml(food.name)}</strong><span class="pill">100g</span></div><p class="muted">エネルギー ${formatNumber(food.nutrients.energy, 0)} kcal / たんぱく質 ${formatNumber(food.nutrients.protein, 1)} g / 脂質 ${formatNumber(food.nutrients.fat, 1)} g / 炭水化物 ${formatNumber(food.nutrients.carbs, 1)} g / 食物繊維 ${formatNumber(food.nutrients.fiber, 1)} g / 塩分 ${formatNumber(food.nutrients.salt, 1)} g</p></article>`).join("")}</div></article>`;
    bindAdminViewEvents();
  };
  collectWeekDraftFromDom = function () {
    const week = createEmptyWeekMenu(state.settings.weekStart);
    Array.from(document.querySelectorAll('[data-menu-day]')).forEach((input) => {
      const dayKey = input.dataset.menuDay, field = input.dataset.menuField, mode = input.dataset.menuMode;
      if (field === 'mode') { week[dayKey].mode = input.value; return; }
      if (field === 'memo') { week[dayKey].memo = input.value; return; }
      if (mode === 'basic') week[dayKey].basic[field] = input.value || null;
      if (mode === 'exception') week[dayKey].exception[field] = input.value || null;
    });
    return week;
  };
  bindAdminViewEvents = function () {
    document.querySelector('#admin-week-start')?.addEventListener('change', (event) => { state.settings.weekStart = event.target.value || mondayString(new Date()); ensureWeekExists(state.settings.weekStart); saveStorage(STORAGE_KEYS.settings, state.settings); renderAll(); });
    document.querySelector('#admin-kitchen-servings')?.addEventListener('change', (event) => { state.settings.kitchenServings = Math.max(1, Number(event.target.value || 1)); saveStorage(STORAGE_KEYS.settings, state.settings); renderAll(); });
    document.querySelector('#auto-generate-button')?.addEventListener('click', () => { state.weeklyMenus[state.settings.weekStart] = generateAutoWeek(state.settings.weekStart); saveStorage(STORAGE_KEYS.weeklyMenus, state.weeklyMenus); renderAll(); });
    document.querySelector('#regenerate-week-button')?.addEventListener('click', () => { state.weeklyMenus[state.settings.weekStart] = generateAutoWeek(state.settings.weekStart); saveStorage(STORAGE_KEYS.weeklyMenus, state.weeklyMenus); renderAll(); });
    document.querySelector('#save-week-button')?.addEventListener('click', () => { state.weeklyMenus[state.settings.weekStart] = collectWeekDraftFromDom(); saveStorage(STORAGE_KEYS.weeklyMenus, state.weeklyMenus); renderAll(); });
    Array.from(document.querySelectorAll('[data-recipe-card]')).forEach((card) => { card.addEventListener('click', () => { state.selectedRecipeId = card.dataset.recipeCard; state.recipeMasterMode = "view"; state.recipeMasterDraft = null; state.recipeMasterDraftError = ""; renderAdminView(); }); });
  };
  STORAGE_KEYS.menuHistory = STORAGE_KEYS.menuHistory || "nutrition-kun::menu-history";
  if (!CATEGORY_KEYS.includes("おやつ")) CATEGORY_KEYS.push("おやつ");
  state.menuHistory = loadStorage(STORAGE_KEYS.menuHistory, {});
  state.settings.weekFlags = state.settings.weekFlags || {};
  state.settings.birthdayThirdWeekEnabled = typeof state.settings.birthdayThirdWeekEnabled === "boolean"
    ? state.settings.birthdayThirdWeekEnabled
    : Object.values(state.settings.weekFlags).some((flags) => Boolean(flags?.birthdayWeek));
  state.settings.repeatBlockDays = state.settings.repeatBlockDays || 15;

  function buildSnackMaster() {
    const flavors = [
      { key: "apple", name: "りんご", foodId: "apple" },
      { key: "banana", name: "バナナ", foodId: "banana" },
      { key: "mandarin", name: "みかん", foodId: "mandarin" },
      { key: "peach", name: "白桃", foodId: "peach" },
      { key: "grape", name: "ぶどう", foodId: "grape" },
      { key: "pumpkin", name: "かぼちゃ", foodId: "pumpkin" },
      { key: "sweetpotato", name: "さつまいも", foodId: "sweet_potato" },
      { key: "milk", name: "ミルク", foodId: "milk" },
      { key: "yogurt", name: "ヨーグルト", foodId: "yogurt" },
      { key: "rice", name: "お米", foodId: "soft_rice" }
    ];
    const templates = [
      { key: "jelly", suffix: "ゼリー", group: "ゼリー", size: 85, ingredients: (f) => [part(f.foodId, 55)], seasonings: () => [part("sugar", 5), part("gelatin_powder", 2)], instructions: ["食材を食べやすく整える。", "ゼラチンで固めて冷やす。"] },
      { key: "pudding", suffix: "プリン", group: "プリン", size: 90, ingredients: (f) => [part("milk", 50), part("egg", 16), part(f.foodId, 14)], seasonings: () => [part("sugar", 8)], instructions: ["牛乳、卵、砂糖を合わせる。", "やさしく加熱し、冷やして固める。"] },
      { key: "steamed", suffix: "蒸しパン", group: "蒸しパン", size: 82, ingredients: (f) => [part("flour", 20), part("milk", 14), part("egg", 10), part(f.foodId, 22)], seasonings: () => [part("sugar", 7), part("baking_powder", 1.5)], instructions: ["生地に具材を混ぜる。", "やわらかく蒸し上げる。"] },
      { key: "cake", suffix: "ケーキ", group: "洋菓子", size: 88, ingredients: (f) => [part("flour", 22), part("egg", 14), part("milk", 12), part(f.foodId, 18)], seasonings: () => [part("sugar", 8), part("baking_powder", 1.5)], instructions: ["生地に具材を合わせる。", "やわらかく焼くか蒸して仕上げる。"] },
      { key: "mousse", suffix: "ムース", group: "洋菓子", size: 84, ingredients: (f) => [part("yogurt", 38), part("milk", 18), part(f.foodId, 22)], seasonings: () => [part("sugar", 5), part("gelatin_powder", 1.5)], instructions: ["材料をなめらかに混ぜる。", "冷やし固めて提供する。"] },
      { key: "dorayaki", suffix: "どら焼き", group: "和菓子", size: 76, ingredients: (f) => [part("flour", 18), part("egg", 12), part("milk", 8), part(f.foodId, 16)], seasonings: () => [part("sugar", 8), part("baking_powder", 1)], instructions: ["生地を焼き、具材をはさむ。", "食べやすい大きさで提供する。"] },
      { key: "manju", suffix: "まんじゅう", group: "和菓子", size: 74, ingredients: (f) => [part("flour", 18), part(f.foodId, 24)], seasonings: () => [part("sugar", 6), part("baking_powder", 1)], instructions: ["皮に具を包む。", "やわらかく蒸して提供する。"] },
      { key: "fruit", suffix: "コンポート", group: "果物", size: 82, ingredients: (f) => [part(f.foodId, 72)], seasonings: () => [part("sugar", 4)], instructions: ["食材を食べやすく切る。", "軽く甘みをつけて冷やす。"] },
      { key: "yogurtcup", suffix: "ヨーグルト和え", group: "乳製品", size: 90, ingredients: (f) => [part("yogurt", 68), part(f.foodId, 22)], seasonings: () => [], instructions: ["具材を刻み、ヨーグルトで和える。", "冷やして提供する。"] },
      { key: "wagashi", suffix: "ようかん", group: "和菓子", size: 72, ingredients: (f) => [part(f.foodId, 28), part("azuki_paste", 22)], seasonings: () => [part("sugar", 4), part("gelatin_powder", 1.5)], instructions: ["あんと具材を合わせる。", "やわらかく固めて提供する。"] }
    ];
    const generated = templates.flatMap((template, templateIndex) => flavors.map((flavor, flavorIndex) => createRecipe({
      id: `snack-${template.key}-${flavor.key}`,
      name: `${flavor.name}${template.suffix}`,
      category: "おやつ",
      cuisine: CUISINES[(templateIndex + flavorIndex) % CUISINES.length],
      servingSize: template.size,
      rotationKey: `${template.group}`,
      tags: ["おやつ", template.group].concat(template.key === "cake" ? ["ケーキ"] : []),
      ingredients: template.ingredients(flavor),
      seasonings: template.seasonings(flavor),
      instructions: template.instructions
    })));
    const simpleSnacks = [
      createRecipe({ id: "snack-simple-yogurt", name: "ヨーグルト", category: "おやつ", cuisine: "洋食", servingSize: 80, rotationKey: "乳製品", tags: ["おやつ", "乳製品", "安価"], notes: "市販の個食ヨーグルトを使用する。", ingredients: [part("yogurt", 80, { label: "ヨーグルト 1個", prep: "冷蔵保管する" })], seasonings: [], instructions: ["冷蔵保管し、提供前に人数分を配る。"] }),
      createRecipe({ id: "snack-simple-jelly", name: "ゼリー", category: "おやつ", cuisine: "洋食", servingSize: 85, rotationKey: "ゼリー", tags: ["おやつ", "ゼリー", "安価"], notes: "市販のカップゼリーを使用する。", ingredients: [part("jelly_base", 85, { label: "市販ゼリー 1個", prep: "冷蔵保管する" })], seasonings: [], instructions: ["冷蔵保管し、提供前に人数分を配る。"] }),
      createRecipe({ id: "snack-simple-pudding", name: "プリン", category: "おやつ", cuisine: "洋食", servingSize: 85, rotationKey: "プリン", tags: ["おやつ", "プリン", "安価"], notes: "市販の個食プリンを使用する。", ingredients: [part("pudding_base", 85, { label: "市販プリン 1個", prep: "冷蔵保管する" })], seasonings: [], instructions: ["冷蔵保管し、提供前に人数分を配る。"] }),
      createRecipe({ id: "snack-simple-castella", name: "カステラ", category: "おやつ", cuisine: "和食", servingSize: 70, rotationKey: "焼き菓子", tags: ["おやつ", "和菓子", "焼き菓子", "安価"], notes: "市販のカステラを食べやすい大きさで提供する。", ingredients: [part("bread", 70, { label: "市販カステラ 1切", prep: "乾燥しないよう保管する" })], seasonings: [], instructions: ["乾燥しないよう保管し、提供前に皿へ盛り付ける。"], nutrition: { energy: 155, protein: 3.9, fat: 2.9, carbs: 32.0, fiber: 0.5, salt: 0.2 } }),
      createRecipe({ id: "snack-simple-dorayaki", name: "どら焼き", category: "おやつ", cuisine: "和食", servingSize: 74, rotationKey: "和菓子", tags: ["おやつ", "和菓子", "安価"], notes: "通常のあん入り市販どら焼きを使用する。", ingredients: [part("azuki_paste", 74, { label: "市販どら焼き 1個", prep: "個包装のまま、または皿にのせて提供できるよう準備する" })], seasonings: [], instructions: ["個包装のまま、または皿にのせて提供する。"], nutrition: { energy: 156, protein: 3.9, fat: 2.1, carbs: 31.2, fiber: 1.8, salt: 0.2 } }),
      createRecipe({ id: "snack-simple-yokan", name: "水ようかん", category: "おやつ", cuisine: "和食", servingSize: 72, rotationKey: "和菓子", tags: ["おやつ", "和菓子", "やわらかい", "安価"], notes: "市販の水ようかんを冷やして提供する。", ingredients: [part("azuki_paste", 72, { label: "市販水ようかん 1個", prep: "冷蔵保管し、よく冷やす" })], seasonings: [], instructions: ["冷蔵保管し、提供前に人数分を配る。"], nutrition: { energy: 132, protein: 2.8, fat: 0.1, carbs: 30.5, fiber: 2.2, salt: 0.1 } }),
      createRecipe({ id: "snack-simple-baum", name: "バウムクーヘン", category: "おやつ", cuisine: "洋食", servingSize: 68, rotationKey: "焼き菓子", tags: ["おやつ", "洋菓子", "焼き菓子"], notes: "市販のバウムクーヘンを食べやすい量で提供する。", ingredients: [part("bread", 68, { label: "市販バウムクーヘン 1切", prep: "食べやすい厚さを確認する" })], seasonings: [], instructions: ["個包装のまま、または皿にのせて提供する。"], nutrition: { energy: 150, protein: 3.1, fat: 7.0, carbs: 19.8, fiber: 0.4, salt: 0.2 } }),
      createRecipe({ id: "snack-simple-rollcake", name: "ロールケーキ", category: "おやつ", cuisine: "洋食", servingSize: 76, rotationKey: "洋菓子", tags: ["おやつ", "洋菓子", "やわらかい"], notes: "市販のロールケーキを崩れないよう提供する。", ingredients: [part("bread", 76, { label: "市販ロールケーキ 1切", prep: "形崩れしないよう冷蔵保管する" })], seasonings: [], instructions: ["冷蔵保管し、提供前に皿へ盛り付ける。"], nutrition: { energy: 148, protein: 3.8, fat: 7.3, carbs: 16.9, fiber: 0.3, salt: 0.2 } }),
      createRecipe({ id: "snack-simple-chiffon", name: "シフォンケーキ", category: "おやつ", cuisine: "洋食", servingSize: 72, rotationKey: "洋菓子", tags: ["おやつ", "洋菓子", "やわらかい"], notes: "市販のシフォンケーキをやわらかい状態で提供する。", ingredients: [part("bread", 72, { label: "市販シフォンケーキ 1切", prep: "つぶれや乾燥がないか確認する" })], seasonings: [], instructions: ["乾燥しないよう保管し、提供前に皿へ盛り付ける。"], nutrition: { energy: 142, protein: 3.7, fat: 4.8, carbs: 21.4, fiber: 0.4, salt: 0.2 } }),
      createRecipe({ id: "snack-simple-amashoku", name: "甘食", category: "おやつ", cuisine: "和食", servingSize: 68, rotationKey: "焼き菓子", tags: ["おやつ", "焼き菓子", "安価"], notes: "市販の甘食を食べやすい状態で提供する。", ingredients: [part("bread", 68, { label: "市販甘食 1個", prep: "硬すぎない製品を使用する" })], seasonings: [], instructions: ["個包装のまま、または皿にのせて提供する。"], nutrition: { energy: 150, protein: 3.4, fat: 4.6, carbs: 23.7, fiber: 0.4, salt: 0.2 } }),
      createRecipe({ id: "snack-simple-waffle", name: "ワッフル", category: "おやつ", cuisine: "洋食", servingSize: 70, rotationKey: "焼き菓子", tags: ["おやつ", "洋菓子", "焼き菓子"], notes: "市販のワッフルを食べやすい状態で提供する。", ingredients: [part("bread", 70, { label: "市販ワッフル 1個", prep: "食べやすい大きさを確認する" })], seasonings: [], instructions: ["個包装のまま、または皿にのせて提供する。"], nutrition: { energy: 156, protein: 3.5, fat: 5.8, carbs: 22.8, fiber: 0.4, salt: 0.2 } }),
      createRecipe({ id: "snack-simple-minicake", name: "ミニケーキ", category: "おやつ", cuisine: "洋食", servingSize: 70, rotationKey: "洋菓子", tags: ["おやつ", "洋菓子"], notes: "市販のミニケーキを人数分配りやすい形で使用する。", ingredients: [part("bread", 70, { label: "市販ミニケーキ 1個", prep: "個包装または皿で提供できるよう準備する" })], seasonings: [], instructions: ["個包装のまま、または皿にのせて提供する。"], nutrition: { energy: 152, protein: 3.2, fat: 6.1, carbs: 21.6, fiber: 0.4, salt: 0.2 } })
    ];
    return [...simpleSnacks, ...buildAdditionalSnackRecipes(), ...buildBirthdayCakeRecipes()];
  }

  const SPECIAL_MENU_RECIPES = [
    createRecipe({ id: "special-sekihan", name: "お赤飯", category: "主食", cuisine: "和食", servingSize: 150, rotationKey: "赤飯", tags: ["行事食"], ingredients: [part("rice", 130), part("soft_rice", 20)], seasonings: [part("sesame", 2), part("salt", 0.2)], instructions: ["食べやすく盛り付ける。"] })
  ];
  const SNACK_MASTER = buildSnackMaster();
  function buildRecipeDictionary() {
    const entry = (notes, servingSize, ingredients, seasonings, steps) => ({ notes, servingSize, ingredients, seasonings, steps });
    return {
      "jp-staple-rice": entry("乾燥、べたつき、かたまりを避ける。提供直前に盛り付ける。", 150,
        [part("rice", 150, { prep: "温かいごはんをほぐし、かたまりをなくす" })], [],
        ["温かいごはんをほぐし、かたまりをなくす。", "水分量と硬さを確認する。", "茶碗に150g盛り付ける。"]),
      "jp-staple-soft-rice": entry("硬すぎ、べたつきすぎに注意。利用者の食形態に合わせて状態を確認する。", 150,
        [part("soft_rice", 150, { prep: "温かい軟飯をやさしくほぐす" })], [],
        ["温かい軟飯をやさしくほぐす。", "水分量、まとまり、硬さを確認する。", "茶碗に150g盛り付ける。"]),
      "west-staple-bread": entry("パサつきに注意し、個別対応が必要なら半分切りや耳調整を行う。", 70,
        [part("bread", 70, { prep: "必要に応じて耳を含め食べやすい大きさに切る" })], [],
        ["必要に応じて耳を含め食べやすい大きさに切る。", "乾燥しないよう提供直前に皿へ盛り付ける。"]),
      "west-staple-roll": entry("乾燥防止のため提供直前に配膳し、固さが強い製品は避ける。", 70,
        [part("roll_bread", 70, { prep: "形崩れがないか確認する" })], [],
        ["形崩れがないか確認する。", "必要に応じて食べやすい向きに整えて皿へ盛り付ける。"]),
      "west-staple-milk-bread": entry("やわらかさを優先し、提供直前に配膳する。", 70,
        [part("milk_bread", 70, { prep: "表面の乾燥やつぶれを確認する" })], [],
        ["表面の乾燥やつぶれを確認する。", "必要に応じて食べやすい形に整えて皿へ盛り付ける。"]),
      "cn-staple-porridge": entry("水分量が少なすぎないよう確認し、熱すぎない状態で提供する。", 170,
        [part("soft_rice", 140, { prep: "温かい軟飯を用意する" }), part("broth", 35, { prep: "粥をのばすために温める" })],
        [part("salt", 0.2, { step: "仕上げに薄く味を整える" })],
        ["軟飯にだし汁を加えて温める。", "米粒をつぶしすぎないように、やわらかくのばす。", "塩で薄く味を整える。", "器に170g盛り付ける。"]),
      "special-sekihan": entry("行事食として提供し、ごま塩のかけすぎに注意する。", 150,
        [part("rice", 150, { label: "お赤飯", prep: "温かいお赤飯をほぐし、かたまりをなくす" })],
        [part("sesame", 2, { label: "ごま塩", step: "必要量を添える、または上からかける" })],
        ["温かいお赤飯をほぐし、かたまりをなくす。", "茶碗に150g盛り付ける。", "必要量のごま塩を添える、または上からかける。"]),
      "cn-staple-green-porridge": entry("青菜を細かく刻んで混ぜる中華風のがゆ。", 175,
        [part("soft_rice", 140, { prep: "米粒をつぶしすぎないようにほぐす" }), part("komatsuna", 18, { prep: "やわらかくゆでて細かく刻む" })],
        [part("broth", 35, { step: "粥をのばすとき" }), part("salt", 0.2, { step: "仕上げ" })],
        ["軟飯にだしを加えてやわらかくのばす。", "刻んだ青菜を加えてひと煮立ちさせ、塩で整える。"]),
      "west-soup-0-cream": entry("牛乳とバターでやさしい口当たりのクリームスープにする。", 150,
        [part("cabbage", 35, { prep: "1.5cm角に切る" }), part("onion", 10, { prep: "薄切りにする" })],
        [part("butter", 3, { step: "玉ねぎを炒めるとき" }), part("flour", 4, { step: "バターになじませる" }), part("milk", 65, { step: "数回に分けて加える" }), part("consomme", 1, { step: "牛乳を加えた後" }), part("salt", 0.2, { step: "仕上げ" }), part("pepper", 0.05, { step: "仕上げ" })],
        ["キャベツと玉ねぎをやわらかくなるまで加熱する。", "バターと小麦粉をなじませ、牛乳を少しずつ加えてのばす。", "コンソメ、塩、こしょうで味を整えて温かく仕上げる。"]),
      "jp-soup-0-clear": entry("豆腐をくずしすぎず、だしを生かしたすまし汁にする。", 150,
        [part("tofu", 40, { prep: "1.5cm角に切る" })],
        [part("broth", 125, { step: "汁を作るとき" }), part("light_soy", 3, { step: "仕上げ" })],
        ["だしを温める。", "豆腐を静かに加えて温め、薄口しょうゆで味を整える。"]),
      "cn-soup-0-thick": entry("卵を細く流して口当たりの良いとろみスープにする。", 150,
        [part("egg", 18, { prep: "よく溶きほぐす" })],
        [part("broth", 118, { step: "スープを温めるとき" }), part("soy_sauce", 2, { step: "味付け" }), part("starch", 2, { step: "最後に水で溶いて加える" })],
        ["だしを温めてしょうゆで調味する。", "水溶きでん粉でゆるくとろみをつける。", "溶き卵を細く流し入れてふんわり仕上げる。"]),
      "cn-soup-4-thick": entry("青菜を細かくして食べやすいとろみスープにする。", 150,
        [part("komatsuna", 25, { prep: "やわらかくゆでて細かく刻む" })],
        [part("broth", 118, { step: "スープを温めるとき" }), part("soy_sauce", 2, { step: "味付け" }), part("starch", 2, { step: "最後に水で溶いて加える" })],
        ["だしを温めてしょうゆで調味する。", "刻んだ青菜を加えて煮る。", "水溶きでん粉でゆるくとろみをつけて仕上げる。"]),
      "jp-soup-1-miso": entry("わかめをやわらかく戻した定番の味噌汁。", 150,
        [part("wakame", 8, { prep: "やわらかく戻して食べやすく切る" })],
        [part("broth", 120, { step: "汁を作るとき" }), part("miso", 10, { step: "火を止める直前" })],
        ["だしを温め、わかめを加える。", "味噌を溶き入れ、煮立てすぎずに仕上げる。"]),
      "west-main-1-herb": entry("豚肉をやわらかく焼き、乾燥ハーブで香りづけする。", 128,
        [part("pork_lean", 85, { prep: "筋を切り、ひと口大にする" }), part("carrot", 16, { prep: "薄い半月切りにして下ゆでする" })],
        [part("salt", 0.2, { step: "下味" }), part("pepper", 0.05, { step: "下味" }), part("herb_mix", 0.2, { step: "下味" }), part("butter", 2, { step: "焼くとき" })],
        ["豚肉に塩、こしょう、乾燥ハーブで下味をつける。", "にんじんをやわらかくしておく。", "豚肉をバターでやわらかく焼き、にんじんを添えて盛り付ける。"]),
      "jp-main-1-miso": entry("鮭をくずしすぎず、味噌だれをからめてやわらかく仕上げる。", 130,
        [part("salmon", 90, { prep: "骨を確認し、食べやすい大きさに切る" })],
        [part("broth", 18, { step: "煮汁を作るとき" }), part("miso", 10, { step: "煮汁に溶く" }), part("mirin", 4, { step: "煮汁に加える" }), part("sugar", 2, { step: "煮汁に加える" })],
        ["だし、味噌、みりん、砂糖を合わせて煮汁を作る。", "鮭を入れて弱火で煮含め、煮汁をからめる。"]),
      "cn-main-0-an": entry("鶏肉をやわらかく煮て中華あんをからめる。", 140,
        [part("chicken_thigh", 90, { prep: "ひと口大に切る" }), part("carrot", 16, { prep: "薄切りにする" }), part("green_peas", 10, { prep: "やわらかくゆでる" })],
        [part("broth", 25, { step: "あんを作るとき" }), part("soy_sauce", 3, { step: "味付け" }), part("starch", 2, { step: "最後に水で溶いて加える" })],
        ["鶏肉とにんじんをやわらかく加熱する。", "だしとしょうゆで味をつける。", "グリンピースを加え、水溶きでん粉であんにして仕上げる。"]),
      "cn-main-1-an": entry("豚肉をやわらかく煮て中華あんをからめる。", 135,
        [part("pork_lean", 85, { prep: "ひと口大に切る" }), part("carrot", 16, { prep: "薄切りにする" }), part("green_peas", 10, { prep: "やわらかくゆでる" })],
        [part("broth", 25, { step: "あんを作るとき" }), part("soy_sauce", 3, { step: "味付け" }), part("starch", 2, { step: "最後に水で溶いて加える" })],
        ["豚肉とにんじんをやわらかく加熱する。", "だしとしょうゆで味をつける。", "グリンピースを加え、水溶きでん粉であんにして仕上げる。"]),
      "jp-main-2-yawaraka": entry("鶏もも肉を玉ねぎと煮て、やわらかく食べやすくする。", 130,
        [part("chicken_thigh", 90, { prep: "ひと口大に切る" }), part("onion", 18, { prep: "薄切りにする" })],
        [part("broth", 24, { step: "煮汁を作るとき" }), part("soy_sauce", 5, { step: "味付け" }), part("mirin", 4, { step: "味付け" })],
        ["玉ねぎをやわらかく煮る。", "鶏もも肉を加えて火を通し、だし、しょうゆ、みりんで煮含める。"]),
      "west-main-2-cream": entry("白身魚を玉ねぎ入りのクリームソースでやわらかく煮る。", 150,
        [part("white_fish", 90, { prep: "骨を確認し、食べやすい大きさに切る" }), part("onion", 20, { prep: "薄切りにする" })],
        [part("butter", 4, { step: "玉ねぎを炒めるとき" }), part("flour", 4, { step: "バターになじませる" }), part("milk", 55, { step: "数回に分けて加える" }), part("consomme", 1, { step: "牛乳を加えた後" }), part("salt", 0.2, { step: "仕上げ" }), part("pepper", 0.05, { step: "仕上げ" })],
        ["白身魚は骨を確認し、食べやすい大きさに整える。", "玉ねぎをバターで炒め、小麦粉をなじませる。", "牛乳とコンソメを加えてソースを作り、白身魚を入れてやわらかく煮る。", "塩、こしょうで味を整えて仕上げる。"]),
      "west-main-0-herb": entry("チキンをしっとり焼き、乾燥ハーブで香りづけする。", 130,
        [part("chicken_thigh", 90, { prep: "余分な脂を除き、ひと口大に切る" }), part("carrot", 16, { prep: "薄い半月切りにして下ゆでする" })],
        [part("salt", 0.2, { step: "下味" }), part("pepper", 0.05, { step: "下味" }), part("herb_mix", 0.2, { step: "下味" }), part("butter", 2, { step: "焼くとき" })],
        ["鶏肉に塩、こしょう、乾燥ハーブで下味をつける。", "にんじんをやわらかくしておく。", "鶏肉をしっとり焼き、にんじんを添えて盛り付ける。"]),
      "jp-main-1-teri": entry("鮭に照りをつけて、やわらかく仕上げる。", 125,
        [part("salmon", 90, { prep: "骨を確認し、食べやすい大きさに切る" })],
        [part("soy_sauce", 7, { step: "たれを作るとき" }), part("mirin", 7, { step: "たれを作るとき" }), part("sugar", 2, { step: "たれを作るとき" })],
        ["しょうゆ、みりん、砂糖でたれを作る。", "鮭に火を通し、たれをからめて照りを出す。"]),
      "west-side-broccoli-consomme": entry("ブロッコリーをやわらかめに煮てコンソメ味に整える。", 75,
        [part("broccoli", 60, { prep: "小房に分けてやわらかく下ゆでする" }), part("carrot", 10, { prep: "薄切りにして下ゆでする" })],
        [part("consomme", 2, { step: "仕上げに加える" })],
        ["ブロッコリーとにんじんをやわらかく加熱する。", "コンソメで薄く味を整えて仕上げる。"]),
      "west-side-carrot-salad": entry("にんじんをやわらかめにして食べやすいサラダにする。", 65,
        [part("carrot", 50, { prep: "せん切りにしてやわらかく下ゆでする" }), part("cucumber", 10, { prep: "薄切りにして塩もみせず水気を切る" })],
        [part("mayonnaise", 4, { step: "和えるとき" }), part("vinegar", 2, { step: "和えるとき" })],
        ["にんじんをやわらかくゆでて冷ます。", "きゅうりの水気を切る。", "マヨネーズと酢で和えて味を整える。"]),
      "jp-side-sweetpotato-nimono": entry("さつまいもを甘めにやわらかく煮る。", 60,
        [part("sweet_potato", 55, { prep: "ひと口大に切り、水にさらす" })],
        [part("broth", 10, { step: "煮るとき" }), part("sugar", 2, { step: "煮るとき" })],
        ["さつまいもをやわらかく煮る。", "だしと砂糖で甘みを含ませて仕上げる。"]),
      "jp-side-spinach-goma": entry("ほうれん草をやわらかくゆで、胡麻だれで和える。", 60,
        [part("spinach", 55, { prep: "やわらかくゆでて2cm長さに切る" })],
        [part("sesame", 4, { step: "和え衣を作るとき" }), part("soy_sauce", 2, { step: "和え衣を作るとき" }), part("sugar", 1, { step: "和え衣を作るとき" })],
        ["ほうれん草をやわらかくゆでて水気を切る。", "すりごま、しょうゆ、砂糖を合わせる。", "ほうれん草を和え衣で和えて盛り付ける。"]),
      "cn-side-cucumber-vinegar": entry("きゅうりを食べやすくして甘酢で和える。", 60,
        [part("cucumber", 50, { prep: "薄切りにして水気を切る" }), part("corn", 10, { prep: "加熱して冷ます" })],
        [part("vinegar", 3, { step: "甘酢を作るとき" }), part("sugar", 1, { step: "甘酢を作るとき" }), part("soy_sauce", 1, { step: "甘酢を作るとき" })],
        ["きゅうりの水気を切る。", "酢、砂糖、しょうゆで甘酢を作る。", "きゅうりとコーンを和えて冷やす。"]),
      "cn-side-beansprout-namul": entry("もやしをやわらかめにしてごま油風味に仕上げる。", 60,
        [part("bean_sprouts", 60, { prep: "ひげ根を除き、やわらかくゆでる" })],
        [part("sesame_oil", 2, { step: "和えるとき" }), part("soy_sauce", 2, { step: "和えるとき" })],
        ["もやしをやわらかくゆでて水気を切る。", "ごま油としょうゆで和えて味をなじませる。"]),
      "cn-side-cucumber-shrimp": entry("えびときゅうりを合わせた食べやすい中華サラダ。", 70,
        [part("cucumber", 40, { prep: "薄切りにして水気を切る" }), part("shrimp", 18, { prep: "加熱して殻を除き、食べやすく切る" }), part("corn", 10, { prep: "加熱して冷ます" })],
        [part("mayonnaise", 4, { step: "和えるとき" }), part("vinegar", 1, { step: "和えるとき" })],
        ["えびを加熱して食べやすく切る。", "きゅうりの水気を切る。", "えび、きゅうり、コーンを合わせ、マヨネーズと酢で和える。"]),
      "mix-side-tofu-chinese": entry("豆腐をくずしすぎず、さっぱりした中華サラダにする。", 70,
        [part("tofu", 55, { prep: "水切りして1.5cm角に切る" }), part("cucumber", 10, { prep: "薄切りにして水気を切る" })],
        [part("soy_sauce", 2, { step: "たれを作るとき" }), part("sesame_oil", 1, { step: "たれを作るとき" }), part("vinegar", 1, { step: "たれを作るとき" })],
        ["豆腐の水気を切る。", "しょうゆ、ごま油、酢を合わせる。", "豆腐ときゅうりをたれで和えて盛り付ける。"]),
      "jp-side-potato-soboro": entry("じゃがいもに鶏そぼろあんをからめる。", 80,
        [part("potato", 65, { prep: "ひと口大に切ってやわらかく煮る" }), part("chicken_breast", 15, { prep: "細かくほぐす" })],
        [part("broth", 18, { step: "煮汁を作るとき" }), part("soy_sauce", 2, { step: "味付け" }), part("starch", 1, { step: "最後に水で溶いて加える" })],
        ["じゃがいもをやわらかく煮る。", "鶏肉をほぐしてだしで煮る。", "しょうゆで調味し、水溶きでん粉でとろみをつけてじゃがいもにからめる。"]),
      "mix-side-burdock-soft": entry("ごぼうをやわらかく煮て食べやすくする。", 60,
        [part("burdock", 45, { prep: "ささがきにして下ゆでする" }), part("carrot", 10, { prep: "細切りにして下ゆでする" })],
        [part("broth", 12, { step: "煮るとき" }), part("soy_sauce", 2, { step: "味付け" })],
        ["ごぼうとにんじんをやわらかく煮る。", "だしとしょうゆで薄味に整えて仕上げる。"]),
      "jp-side-pumpkin-goma": entry("かぼちゃをやわらかく煮て胡麻風味にする。", 70,
        [part("pumpkin", 65, { prep: "ひと口大に切る" })],
        [part("soy_sauce", 2, { step: "味付け" }), part("sesame", 3, { step: "仕上げに加える" })],
        ["かぼちゃをやわらかく煮る。", "しょうゆで薄く味を整え、すりごまをまぶして仕上げる。"]),
      "dessert-orange-fresh": entry("薄皮や種を確認してそのまま食べやすく出す。", 90,
        [part("orange", 90, { prep: "薄皮や種を確認し、ひと口大に切る" })], [],
        ["オレンジを食べやすい大きさに整える。", "冷やした器に盛り付ける。"]),
      "dessert-mandarin-milk": entry("みかんを添えたやわらかいミルクゼリー。", 90,
        [part("milk", 60, { prep: "冷たすぎない温度にする" }), part("mandarin", 15, { prep: "薄皮を確認し、食べやすく分ける" })],
        [part("sugar", 5, { step: "牛乳に溶かす" }), part("gelatin_powder", 2, { step: "温めた牛乳に溶かす" })],
        ["牛乳に砂糖を溶かし、ゼラチンを加える。", "器に流して冷やし固める。", "みかんをのせて提供する。"]),
      "dessert-banana-pudding": entry("バナナを添えたやわらかいプリン。", 90,
        [part("milk", 55, { prep: "冷たすぎない温度にする" }), part("egg", 18, { prep: "よく溶きほぐす" }), part("banana", 15, { prep: "つぶすか薄切りにする" })],
        [part("sugar", 8, { step: "卵液に溶かす" })],
        ["牛乳、卵、砂糖を合わせてこす。", "湯せんまたは弱火でやさしく加熱し、冷やし固める。", "バナナを添えて提供する。"]),
      "dessert-apple-yogurt": entry("りんごを合わせたさっぱりしたヨーグルト。", 95,
        [part("yogurt", 70, { prep: "冷やしておく" }), part("apple", 25, { prep: "皮と芯を除き、やわらかく食べやすく切る" })], [],
        ["りんごを食べやすい大きさに切る。", "ヨーグルトに合わせて冷やして提供する。"]),
      "dessert-mandarin-jelly": entry("みかん入りのやわらかいゼリー。", 85,
        [part("mandarin", 65, { prep: "薄皮を確認し、食べやすく分ける" })],
        [part("sugar", 5, { step: "ゼリー液を作るとき" }), part("gelatin_powder", 2, { step: "温めた液に溶かす" })],
        ["みかんを器に分ける。", "砂糖とゼラチンでゼリー液を作って流し、冷やし固める。"]),
      "dessert-peach-yogurt": entry("白桃を合わせたやさしいヨーグルトデザート。", 95,
        [part("yogurt", 70, { prep: "冷やしておく" }), part("peach", 25, { prep: "食べやすい大きさに切る" })], [],
        ["白桃を食べやすい大きさに整える。", "ヨーグルトに合わせて冷やして提供する。"]),
      "snack-mousse-pumpkin": entry("かぼちゃを裏ごしして作るやわらかいムース。", 84,
        [part("pumpkin", 22, { prep: "やわらかく蒸して裏ごしする" }), part("yogurt", 38, { prep: "なめらかにしておく" }), part("milk", 18, { prep: "常温に戻す" })],
        [part("sugar", 5, { step: "かぼちゃと合わせる" }), part("gelatin_powder", 1.5, { step: "温めた牛乳に溶かす" })],
        ["かぼちゃを蒸して裏ごしする。", "牛乳にゼラチンを溶かし、かぼちゃ、ヨーグルト、砂糖と合わせる。", "器に流して冷やし固める。"]),
      "snack-pudding-pumpkin": entry("かぼちゃを加えたやわらかいプリン。", 90,
        [part("milk", 50, { prep: "冷たすぎない温度にする" }), part("egg", 16, { prep: "よく溶きほぐす" }), part("pumpkin", 14, { prep: "やわらかく蒸してつぶす" })],
        [part("sugar", 8, { step: "卵液に溶かす" })],
        ["かぼちゃをなめらかにつぶす。", "牛乳、卵、砂糖、かぼちゃを合わせてこす。", "やさしく加熱し、冷やし固める。"]),
      "snack-steamed-apple": entry("りんごを刻んで入れたやわらかい蒸しパン。", 82,
        [part("flour", 20, { prep: "ふるう" }), part("milk", 14, { prep: "常温に戻す" }), part("egg", 10, { prep: "よく溶きほぐす" }), part("apple", 22, { prep: "小さく刻む" })],
        [part("sugar", 7, { step: "生地に加える" }), part("baking_powder", 1.5, { step: "粉に混ぜる" })],
        ["粉類を合わせる。", "卵、牛乳、砂糖、りんごを加えて混ぜる。", "型に入れてやわらかく蒸し上げる。"]),
      "snack-jelly-mandarin": entry("みかん入りのやわらかいゼリーおやつ。", 85,
        [part("mandarin", 55, { prep: "薄皮を確認し、食べやすく分ける" })],
        [part("sugar", 5, { step: "ゼリー液を作るとき" }), part("gelatin_powder", 2, { step: "温めた液に溶かす" })],
        ["みかんを器に分ける。", "砂糖とゼラチンでゼリー液を作って流し、冷やし固める。"]),
      "snack-wagashi-mandarin": entry("みかんを合わせたやわらかいようかん。", 72,
        [part("mandarin", 28, { prep: "薄皮を確認し、刻む" }), part("azuki_paste", 22, { prep: "なめらかにしておく" })],
        [part("sugar", 4, { step: "あんに加える" }), part("gelatin_powder", 1.5, { step: "温めた液に溶かす" })],
        ["あんとみかんを合わせる。", "砂糖とゼラチンを加えて型に流し、冷やし固める。"]),
      "snack-simple-pudding": entry("市販の個食プリンを冷やして提供する。", 85,
        [part("pudding_base", 85, { label: "市販プリン 1個", prep: "冷蔵保管する" })], [],
        ["冷蔵保管し、提供前に人数分を配る。"]),
      "snack-simple-jelly": entry("市販のカップゼリーを冷やして提供する。", 85,
        [part("jelly_base", 85, { label: "市販ゼリー 1個", prep: "冷蔵保管する" })], [],
        ["冷蔵保管し、提供前に人数分を配る。"]),
      "snack-simple-dorayaki": entry("通常のあん入り市販どら焼きを使用する。", 74,
        [part("azuki_paste", 74, { label: "市販どら焼き 1個", prep: "個包装のまま、または皿にのせて提供できるよう準備する" })], [],
        ["個包装のまま、または皿にのせて提供する。"]),
      "snack-simple-castella": entry("市販のカステラを食べやすい大きさで提供する。", 70,
        [part("bread", 70, { label: "市販カステラ 1切", prep: "乾燥しないよう保管する" })], [],
        ["乾燥しないよう保管し、提供前に皿へ盛り付ける。"]),
      "snack-simple-yokan": entry("市販の水ようかんを冷やして提供する。", 72,
        [part("azuki_paste", 72, { label: "市販水ようかん 1個", prep: "冷蔵保管し、よく冷やす" })], [],
        ["冷蔵保管し、提供前に人数分を配る。"])
    };
  }
  const RECIPE_DICTIONARY = buildRecipeDictionary();
  function applyRecipeDictionary(recipe) {
    const override = RECIPE_DICTIONARY[recipe.id];
    if (!override) return recipe;
    return createRecipe({
      ...recipe,
      ...override,
      id: recipe.id,
      name: recipe.name,
      category: recipe.category,
      cuisine: recipe.cuisine,
      rotationKey: override.rotationKey || recipe.rotationKey,
      tags: override.tags || recipe.tags,
      description: override.description || recipe.description
    });
  }
  const DEFAULT_WEEKLY_SNACK_IDS = ["snack-simple-pudding", "snack-simple-jelly", "snack-simple-castella", "snack-simple-dorayaki", "snack-simple-yokan"];
  const FORCED_SIDE_REPLACEMENT_IDS = {
    "2026-04-21": ["west-side-broccoli-salad", "west-side-cabbage-coleslaw", "west-side-carrot-glace"],
    "2026-04-24": ["cn-side-komatsuna-chinese", "cn-side-cabbage-vinegar", "cn-side-carrot-sweet"]
  };
  const FIXED_WEEK_SIDE2_IDS = {
    "2026-04-21": "west-side-broccoli-salad",
    "2026-04-24": "cn-side-komatsuna-chinese"
  };
  const BIRTHDAY_SNACK_ID = "snack-simple-minicake";
  const SEKIHAN_ID = "special-sekihan";

  const previousRenderAll = renderAll;
  getAllRecipes = function () {
    const hiddenDefaultRecipeIds = new Set((state.hiddenDefaultRecipeIds || []).filter(Boolean));
    const recipeOverrides = state.customRecipeOverrides || {};
    const defaultRecipes = [...SPECIAL_MENU_RECIPES, ...EXPANDED_RECIPES, ...SNACK_MASTER]
      .map(applyRecipeDictionary)
      .filter((recipe) => recipe.name !== "軟飯")
      .filter((recipe) => !hiddenDefaultRecipeIds.has(recipe.id))
      .map((recipe) => {
        const override = recipeOverrides[recipe.id];
        return override ? normalizeCustomRecipes([{ ...recipe, ...override, id: recipe.id }])[0] : recipe;
      });
    const recipes = [...defaultRecipes, ...normalizeCustomRecipes(state.customRecipes || [])];
    const recipesById = new Map();
    recipes.forEach((recipe) => {
      recipesById.set(recipe.id, recipe);
    });
    return [...recipesById.values()];
  };
  createEmptyWeekMenu = function (weekStart) {
    const week = {};
    WEEKDAY_KEYS.forEach((dayKey, index) => {
      week[dayKey] = { date: addDays(weekStart, index), mode: "basic", basic: { staple: null, soup: null, main: null, side1: null, side2: null, dessert: null }, exception: { singleDish: null, extraSoup: null, extraSide: null, extraDessert: null }, snack: null, memo: "", generatedByAuto: false };
    });
    return week;
  };
  function finalizeWeekForSave(weekStart, week, persist = false) {
    if (!week) return null;
    const resolvedWeek = ensureWeeklyMenuIntegrity(weekStart, week, false);
    if (!resolvedWeek) return null;
    const hasDuplicate = WEEKDAY_KEYS.some((dayKey) => hasDuplicateSidePair(resolvedWeek[dayKey]));
    if (hasDuplicate) return null;
    applyBirthdayWeekAutoOverrides(weekStart, resolvedWeek);
    if (persist) {
      state.weeklyMenus[weekStart] = resolvedWeek;
      saveStorage(STORAGE_KEYS.weeklyMenus, state.weeklyMenus);
      syncMenuHistoryStorage();
    }
    return resolvedWeek;
  }
  function hasRenderableWeekData(week) {
    if (!week) return false;
    return WEEKDAY_KEYS.some((dayKey) => {
      const day = week[dayKey];
      if (!day) return false;
      return Boolean(
        day.snack
        || day.basic?.staple
        || day.basic?.soup
        || day.basic?.main
        || day.basic?.side1
        || day.basic?.side2
        || day.basic?.dessert
        || day.exception?.singleDish
        || day.exception?.extraSoup
        || day.exception?.extraSide
        || day.exception?.extraDessert
      );
    });
  }
  function applyBirthdayWeekAutoOverrides(weekStart, week) {
    if (!week || !isBirthdayWeek(weekStart)) return week;
    const recipeMap = getRecipeMap();
    const forcedStaple = recipeMap.get(SEKIHAN_ID);
    const forcedSnack = recipeMap.get(BIRTHDAY_SNACK_ID);
    if (!forcedStaple && !forcedSnack) return week;
    WEEKDAY_KEYS.forEach((dayKey, index) => {
      const baseDay = createEmptyWeekMenu(weekStart)[dayKey];
      const dayMenu = week[dayKey] || baseDay;
      const nextBasic = {
        ...baseDay.basic,
        ...(dayMenu.basic || {}),
        staple: forcedStaple?.id || dayMenu.basic?.staple || null
      };
      week[dayKey] = {
        ...baseDay,
        ...dayMenu,
        basic: nextBasic,
        snack: forcedSnack?.id || dayMenu.snack || null
      };
    });
    return week;
  }
  function isCustomRecipeId(recipeId) {
    return normalizeCustomRecipes(state.customRecipes || []).some((recipe) => recipe.id === recipeId);
  }
  function normalizeRecipeMasterPartRows(parts) {
    return normalizeParts(parts || []).map((partItem) => ({
      label: getFoodLabel(partItem),
      grams: partItem.grams ? String(formatNumber(partItem.grams, 0)) : ""
    }));
  }
  function parseRecipeMasterTags(value) {
    return String(value || "")
      .split(/[\r\n,、・]/)
      .map((item) => item.trim())
      .filter(Boolean);
  }
  function buildRecipeMasterPartsFromRows(baseParts, rows, kind) {
    const normalizedBase = normalizeParts(baseParts || []);
    return rows
      .map((row, index) => {
        const basePart = normalizedBase[index] || {};
        const label = `${row?.label || ""}`.trim();
        const gramsValue = Number(row?.grams || 0);
        if (!label) return null;
        const safeLabel = label || `${kind}-${index + 1}`;
        return {
          ...basePart,
          foodId: basePart.foodId || `custom-${kind}-${index + 1}-${safeLabel.replace(/[^\w\u3040-\u30ff\u4e00-\u9faf]+/g, "-")}`,
          label: safeLabel,
          grams: Number.isFinite(gramsValue) ? gramsValue : 0,
          unit: "g",
          prep: kind === "ingredient" ? (basePart.prep || "") : "",
          step: kind === "seasoning" ? (basePart.step || "") : ""
        };
      })
      .filter(Boolean);
  }
  function collectRecipeMasterPartRowsFromDom(kind) {
    const rows = new Map();
    Array.from(document.querySelectorAll(`[data-recipe-master-part-kind="${kind}"]`)).forEach((input) => {
      const index = Number(input.dataset.recipeMasterPartIndex || 0);
      const field = input.dataset.recipeMasterPartField || "";
      if (!rows.has(index)) rows.set(index, { label: "", grams: "" });
      rows.get(index)[field] = input.value || "";
    });
    return Array.from(rows.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([, row]) => ({
        label: `${row.label || ""}`.trim(),
        grams: `${row.grams || ""}`.trim()
      }))
      .filter((row) => row.label || row.grams);
  }
  function createRecipeMasterPartRowMarkup(kind, title, index, row = {}) {
    return `<div class="recipe-master-part-row" data-recipe-master-part-row="${kind}"><input type="text" data-recipe-master-part-kind="${kind}" data-recipe-master-part-index="${index}" data-recipe-master-part-field="label" placeholder="${title}名" value="${escapeHtml(row.label || "")}"><input type="number" min="0" step="1" data-recipe-master-part-kind="${kind}" data-recipe-master-part-index="${index}" data-recipe-master-part-field="grams" placeholder="g" value="${escapeHtml(row.grams || "")}"><button type="button" class="button button-secondary recipe-master-part-remove" data-recipe-master-part-remove="${kind}">削除</button></div>`;
  }
  function renderRecipeMasterPartEditor(kind, title, rows) {
    const editorRows = rows && rows.length ? [...rows] : [{ label: "", grams: "" }];
    return `<div class="recipe-master-part-section" data-recipe-master-part-section="${kind}"><div class="recipe-master-part-head"><h4>${title}</h4><button type="button" class="button button-secondary recipe-master-part-add" data-recipe-master-part-add="${kind}" data-recipe-master-part-title="${title}">${title}を追加</button></div><div class="recipe-master-part-grid" data-recipe-master-part-grid="${kind}">${editorRows.map((row, index) => createRecipeMasterPartRowMarkup(kind, title, index, row)).join("")}</div></div>`;
  }
  function appendRecipeMasterPartRow(kind, title) {
    const grid = document.querySelector(`[data-recipe-master-part-grid="${kind}"]`);
    if (!grid) return;
    const indices = Array.from(grid.querySelectorAll(`[data-recipe-master-part-kind="${kind}"]`))
      .map((input) => Number(input.dataset.recipeMasterPartIndex || 0));
    const nextIndex = indices.length ? Math.max(...indices) + 1 : 0;
    grid.insertAdjacentHTML("beforeend", createRecipeMasterPartRowMarkup(kind, title, nextIndex));
  }
  function removeRecipeMasterPartRow(button) {
    const row = button.closest('[data-recipe-master-part-row]');
    const kind = button.dataset.recipeMasterPartRemove || "";
    const grid = row?.closest(`[data-recipe-master-part-grid="${kind}"]`);
    if (!row || !grid) return;
    const rows = Array.from(grid.querySelectorAll('[data-recipe-master-part-row]'));
    if (rows.length <= 1) {
      row.querySelectorAll('input').forEach((input) => {
        input.value = "";
      });
      return;
    }
    row.remove();
  }
  function createRecipeDraftFromRecipe(recipe) {
    return {
      name: recipe?.name || "",
      category: recipe?.category || "主菜",
      cuisine: recipe?.cuisine || "和食",
      description: recipe?.description || "",
      notes: recipe?.notes || "",
      rotationKey: recipe?.rotationKey || recipe?.name || "",
      tags: Array.isArray(recipe?.tags) ? recipe.tags.join("・") : "",
      servingSize: String(recipe?.servingSize || recipe?.servingWeight || 100),
      ingredientRows: normalizeRecipeMasterPartRows(recipe?.ingredients || []),
      seasoningRows: normalizeRecipeMasterPartRows(recipe?.seasonings || []),
      ingredients: normalizeParts(recipe?.ingredients || []).map((partItem) => {
        const base = `${getFoodLabel(partItem)}${partItem.grams ? ` ${formatNumber(partItem.grams, 0)}g` : ""}`;
        return partItem.prep ? `${base} / ${partItem.prep}` : base;
      }).join("\n"),
      seasonings: normalizeParts(recipe?.seasonings || []).map((partItem) => {
        const base = `${getFoodLabel(partItem)}${partItem.grams ? ` ${formatNumber(partItem.grams, 0)}g` : ""}`;
        return partItem.step ? `${base} / ${partItem.step}` : base;
      }).join("\n"),
      steps: Array.isArray(recipe?.instructions) ? recipe.instructions.join("\n") : (Array.isArray(recipe?.steps) ? recipe.steps.join("\n") : ""),
      energy: String(Number(recipe?.nutrition?.energy || recipe?.nutrition?.kcal || 0)),
      protein: String(Number(recipe?.nutrition?.protein || 0)),
      fat: String(Number(recipe?.nutrition?.fat || 0)),
      carbs: String(Number(recipe?.nutrition?.carbs || 0)),
      fiber: String(Number(recipe?.nutrition?.fiber || 0)),
      salt: String(Number(recipe?.nutrition?.salt || 0))
    };
  }
  function parseRecipeMasterDraftParts(value, kind) {
    return String(value || "")
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line, index) => {
        const [rawMain, rawNote = ""] = line.split(/\s*\/\s*/, 2);
        const trimmedMain = rawMain.trim();
        const amountMatch = trimmedMain.match(/^(.*?)(?:\s+|　)?(\d+(?:\.\d+)?)\s*g$/i);
        const label = (amountMatch ? amountMatch[1] : trimmedMain).trim();
        const grams = amountMatch ? Number(amountMatch[2]) : 0;
        const safeLabel = label || `${kind}-${index + 1}`;
        return {
          foodId: `custom-${kind}-${index + 1}-${safeLabel.replace(/[^\w\u3040-\u30ff\u4e00-\u9faf]+/g, "-")}`,
          grams: Number.isFinite(grams) ? grams : 0,
          prep: kind === "ingredient" ? rawNote.trim() : "",
          step: kind === "seasoning" ? rawNote.trim() : "",
          label: safeLabel
        };
      });
  }
  function buildRecipeMasterEditedRecipeFromDraft(baseRecipe, draft) {
    const normalizedName = (draft.name || "").trim();
    const servingSize = Math.max(1, Number(draft.servingSize || baseRecipe?.servingSize || baseRecipe?.servingWeight || 100));
    const energy = Number(draft.energy || 0);
    const protein = Number(draft.protein || 0);
    const fat = Number(draft.fat || 0);
    const carbs = Number(draft.carbs || 0);
    const fiber = Number(draft.fiber || 0);
    const salt = Number(draft.salt || 0);
    const stepsArray = (draft.steps || "").split(/\r?\n/).map((step) => step.trim()).filter(Boolean);
    const ingredients = Array.isArray(draft.ingredientRows)
      ? buildRecipeMasterPartsFromRows(baseRecipe.ingredients, draft.ingredientRows, "ingredient")
      : parseRecipeMasterDraftParts(draft.ingredients, "ingredient");
    const seasonings = Array.isArray(draft.seasoningRows)
      ? buildRecipeMasterPartsFromRows(baseRecipe.seasonings, draft.seasoningRows, "seasoning")
      : parseRecipeMasterDraftParts(draft.seasonings, "seasoning");
    return {
      ...baseRecipe,
      id: baseRecipe.id,
      name: normalizedName,
      category: draft.category,
      cuisine: draft.cuisine,
      description: draft.description || "",
      notes: draft.notes || "",
      ingredients,
      seasonings,
      instructions: stepsArray.length ? stepsArray : ["手順未設定"],
      steps: stepsArray.length ? stepsArray : ["手順未設定"],
      servingSize,
      servings: Number(baseRecipe.servings || 1),
      servingWeight: servingSize,
      rotationKey: (draft.rotationKey || "").trim() || baseRecipe.rotationKey || normalizedName,
      tags: parseRecipeMasterTags(draft.tags),
      nutrition: {
        ...(baseRecipe.nutrition || emptyNutrition()),
        energy,
        protein,
        fat,
        carbs,
        fiber,
        kcal: energy,
        salt
      }
    };
  }
  function removeRecipeIdFromWeeklyMenus(recipeId) {
    if (!recipeId) return false;
    let changed = false;
    Object.keys(state.weeklyMenus || {}).forEach((weekStart) => {
      const week = state.weeklyMenus[weekStart];
      if (!week) return;
      WEEKDAY_KEYS.forEach((dayKey) => {
        const dayMenu = week[dayKey];
        if (!dayMenu) return;
        ["staple", "soup", "main", "side1", "side2", "dessert"].forEach((field) => {
          if (dayMenu.basic?.[field] === recipeId) {
            dayMenu.basic[field] = null;
            changed = true;
          }
        });
        ["singleDish", "extraSoup", "extraSide", "extraDessert"].forEach((field) => {
          if (dayMenu.exception?.[field] === recipeId) {
            dayMenu.exception[field] = null;
            changed = true;
          }
        });
        if (dayMenu.snack === recipeId) {
          dayMenu.snack = null;
          changed = true;
        }
      });
    });
    return changed;
  }
  getWeekMenus = function (weekStart) {
    const base = createEmptyWeekMenu(weekStart);
    const source = state.weeklyMenus[weekStart];
    if (!source || !hasRenderableWeekData(source)) {
      const regenerated = finalizeWeekForSave(weekStart, generateAutoWeek(weekStart), true);
      return regenerated || base;
    }
    WEEKDAY_KEYS.forEach((dayKey) => {
      const day = source[dayKey] || {};
      base[dayKey] = { ...base[dayKey], ...day, snack: day.snack || null, basic: { ...base[dayKey].basic, ...(day.basic || {}) }, exception: { ...base[dayKey].exception, ...(day.exception || {}) } };
    });
    if (!hasRenderableWeekData(base)) {
      const regenerated = finalizeWeekForSave(weekStart, generateAutoWeek(weekStart), true);
      return regenerated || base;
    }
    const validated = finalizeWeekForSave(weekStart, base, true);
    if (validated && hasRenderableWeekData(validated)) return validated;
    const regenerated = finalizeWeekForSave(weekStart, generateAutoWeek(weekStart), true);
    return regenerated || base;
  };
  function ensureWeeklyMenuIntegrity(weekStart, week, persist = false) {
    let changed = false;
    const map = getRecipeMap();
    const usedSideIds = new Set();
    const usedSideNames = new Set();
    const usedSnackIds = new Set();
    const getSideName = (recipeId) => map.get(recipeId)?.name || null;
    const forceSpecificDaySidePair = (dayMenu) => {
      if (!dayMenu || dayMenu.mode !== "basic") return;
      const forcedSide2Id = FIXED_WEEK_SIDE2_IDS[dayMenu.date];
      if (!forcedSide2Id || !map.has(forcedSide2Id)) return;
      const side1 = map.get(dayMenu.basic.side1);
      const forcedSide2 = map.get(forcedSide2Id);
      if (!side1 || !forcedSide2) return;
      const sameAsSide1 = side1.id === forcedSide2.id || side1.name === forcedSide2.name;
      const currentSide2 = map.get(dayMenu.basic.side2);
      const alreadyValid = currentSide2 && currentSide2.id === forcedSide2.id && !sameAsSide1;
      if (alreadyValid) return;
      const fallbackId = FORCED_SIDE_REPLACEMENT_IDS[dayMenu.date]?.find((recipeId) => {
        const recipe = map.get(recipeId);
        return recipe && recipe.id !== side1.id && recipe.name !== side1.name;
      }) || null;
      const nextSide2Id = sameAsSide1 ? fallbackId : forcedSide2Id;
      if (nextSide2Id && nextSide2Id !== dayMenu.basic.side2) {
        dayMenu.basic.side2 = nextSide2Id;
        changed = true;
      }
    };
    const pickReplacementSideId = (dayMenu, primarySideId, options = {}) => {
      const primarySide = primarySideId ? map.get(primarySideId) : null;
      const replacement = pickBestReplacementSide(
        dayMenu,
        primarySide,
        { usedSideIds, usedSideNames },
        (pool) => pool.sort((a, b) => a.name.localeCompare(b.name, "ja"))[0] || null,
        {
          excludeIds: [...(options.excludeIds || []), ...(options.strict ? [...usedSideIds] : [])],
          excludeNames: [...(options.excludeNames || []), ...(options.strict ? [...usedSideNames] : [])]
        }
      );
      return replacement?.id || null;
    };
    const repairSameDaySidePair = (dayMenu) => {
      if (dayMenu.mode !== "basic") return true;
      let repaired = false;
      const replaceSide2 = (strict) => {
        const replacementId = pickReplacementSideId(dayMenu, dayMenu.basic.side1, {
          strict,
          excludeIds: [dayMenu.basic.side2].filter(Boolean),
          excludeNames: [getSideName(dayMenu.basic.side2)].filter(Boolean)
        });
        if (replacementId && replacementId !== dayMenu.basic.side2) {
          dayMenu.basic.side2 = replacementId;
          repaired = true;
        }
      };
      if (hasDuplicateSidePair(dayMenu, map)) replaceSide2(true);
      if (hasDuplicateSidePair(dayMenu, map)) replaceSide2(false);
      if (hasDuplicateSidePair(dayMenu, map)) {
        const replacementId = pickReplacementSideId(dayMenu, dayMenu.basic.side2, {
          strict: false,
          excludeIds: [dayMenu.basic.side1].filter(Boolean),
          excludeNames: [getSideName(dayMenu.basic.side1)].filter(Boolean)
        });
        if (replacementId && replacementId !== dayMenu.basic.side1) {
          dayMenu.basic.side1 = replacementId;
          repaired = true;
        }
      }
      if (repaired) changed = true;
      return !hasDuplicateSidePair(dayMenu, map);
    };
    const pickReplacementSnackId = () => {
      const preferred = DEFAULT_WEEKLY_SNACK_IDS.filter((id) => map.has(id) && !usedSnackIds.has(id));
      if (preferred.length) return preferred[0];
      return filterPreferredSnackRecipes(getAllRecipes()
        .filter((recipe) => recipe.category === "おやつ" && !usedSnackIds.has(recipe.id)))
        .sort((a, b) => {
          const aBudget = a.tags.includes("安価") ? 0 : 1;
          const bBudget = b.tags.includes("安価") ? 0 : 1;
          if (aBudget !== bBudget) return aBudget - bBudget;
          return a.name.localeCompare(b.name, "ja");
        })[0]?.id || null;
    };
    WEEKDAY_KEYS.forEach((dayKey) => {
      const dayMenu = week[dayKey];
      if (dayMenu.mode === "basic") {
        forceSpecificDaySidePair(dayMenu);
        const side1Id = dayMenu.basic.side1;
        const side2Id = dayMenu.basic.side2;
        const side1Name = getSideName(side1Id);
        const side2Name = getSideName(side2Id);
        if (!side1Id || usedSideIds.has(side1Id) || (side1Name && usedSideNames.has(side1Name))) {
          const replacementId = pickReplacementSideId(dayMenu, side2Id, { strict: true, excludeIds: [side1Id].filter(Boolean), excludeNames: [side1Name].filter(Boolean) });
          if (replacementId && replacementId !== side1Id) {
            dayMenu.basic.side1 = replacementId;
            changed = true;
          }
        }
        const firstSideRecipe = map.get(dayMenu.basic.side1);
        const secondSideRecipe = map.get(dayMenu.basic.side2);
        const sameDayDuplicate = Boolean(firstSideRecipe && secondSideRecipe && (firstSideRecipe.id === secondSideRecipe.id || firstSideRecipe.name === secondSideRecipe.name));
        const repeatedSide2 = Boolean(dayMenu.basic.side2 && (usedSideIds.has(dayMenu.basic.side2) || usedSideNames.has(getSideName(dayMenu.basic.side2))));
        if (!dayMenu.basic.side2 || repeatedSide2 || sameDayDuplicate || isSidePairTooSimilar(firstSideRecipe, secondSideRecipe)) {
          const replacementId = pickReplacementSideId(dayMenu, dayMenu.basic.side1, {
            strict: true,
            excludeIds: [dayMenu.basic.side2].filter(Boolean),
            excludeNames: [getSideName(dayMenu.basic.side2)].filter(Boolean)
          });
          if (replacementId && replacementId !== dayMenu.basic.side2) {
            dayMenu.basic.side2 = replacementId;
            changed = true;
          }
        }
        repairSameDaySidePair(dayMenu);
        forceSpecificDaySidePair(dayMenu);
        [dayMenu.basic.side1, dayMenu.basic.side2].filter(Boolean).forEach((recipeId) => {
          usedSideIds.add(recipeId);
          const name = getSideName(recipeId);
          if (name) usedSideNames.add(name);
        });
      } else if (dayMenu.exception.extraSide) {
        const currentName = getSideName(dayMenu.exception.extraSide);
        if (usedSideIds.has(dayMenu.exception.extraSide) || (currentName && usedSideNames.has(currentName))) {
          const replacementId = pickReplacementSideId(dayMenu, null);
          if (replacementId && replacementId !== dayMenu.exception.extraSide) {
            dayMenu.exception.extraSide = replacementId;
            changed = true;
          }
        }
        if (dayMenu.exception.extraSide) {
          usedSideIds.add(dayMenu.exception.extraSide);
          const name = getSideName(dayMenu.exception.extraSide);
          if (name) usedSideNames.add(name);
        }
      }
      if (!dayMenu.snack || (!isBirthdayWeek(weekStart) && usedSnackIds.has(dayMenu.snack)) || !map.has(dayMenu.snack) || (!isBirthdayWeek(weekStart) && !isPreferredSnackRecipe(map.get(dayMenu.snack)))) {
        const replacementSnackId = pickReplacementSnackId();
        if (replacementSnackId && replacementSnackId !== dayMenu.snack) {
          dayMenu.snack = replacementSnackId;
          changed = true;
        }
      }
      if (dayMenu.snack) usedSnackIds.add(dayMenu.snack);
    });
    const hasUnresolvedDuplicates = WEEKDAY_KEYS.some((dayKey) => hasDuplicateSidePair(week[dayKey], map));
    if (hasUnresolvedDuplicates) {
      return null;
    }
    if (changed) {
      state.weeklyMenus[weekStart] = week;
      if (persist) {
        saveStorage(STORAGE_KEYS.weeklyMenus, state.weeklyMenus);
        syncMenuHistoryStorage();
      }
    }
    return week;
  }
  function isBirthdayRuleEnabled() {
    return Boolean(state.settings.birthdayThirdWeekEnabled);
  }
  function isBirthdayWeek(weekStart) {
    return isBirthdayRuleEnabled() && isThirdWeekRuleWeek(weekStart);
  }
  function setBirthdayWeekRuleEnabled(value) {
    state.settings.birthdayThirdWeekEnabled = Boolean(value);
  }
  function isThirdWeekRuleWeek(weekStart) {
    const targetMonday = new Date(weekStart);
    const monthStart = new Date(targetMonday.getFullYear(), targetMonday.getMonth(), 1);
    const monthStartWeekday = monthStart.getDay();
    const offsetToMonday = monthStartWeekday === 0 ? -6 : 1 - monthStartWeekday;
    const firstWeekMonday = new Date(monthStart);
    firstWeekMonday.setDate(monthStart.getDate() + offsetToMonday);
    const thirdWeekMonday = new Date(firstWeekMonday);
    thirdWeekMonday.setDate(firstWeekMonday.getDate() + 14);
    return mondayString(targetMonday) === mondayString(thirdWeekMonday);
  }
  function businessDaysBetween(fromDate, toDate) {
    const from = new Date(fromDate);
    const to = new Date(toDate);
    if (!(from instanceof Date) || Number.isNaN(from.getTime()) || !(to instanceof Date) || Number.isNaN(to.getTime()) || from >= to) return Infinity;
    let count = 0;
    const cursor = new Date(from);
    cursor.setDate(cursor.getDate() + 1);
    while (cursor < to) {
      const day = cursor.getDay();
      if (day >= 1 && day <= 5) count += 1;
      cursor.setDate(cursor.getDate() + 1);
    }
    return count;
  }
  function historyRecordsForDay(dayMenu, date, recipeMap) {
    const records = [];
    const addRecord = (type, recipeId) => {
      if (!recipeId) return;
      const recipe = recipeMap.get(recipeId);
      if (!recipe) return;
      records.push({ key: `${type}:${recipeId}`, type, recipeId, name: recipe.name, lastUsedDate: date });
    };
    if (dayMenu.mode === "basic") {
      addRecord("main", dayMenu.basic.main);
      addRecord("dessert", dayMenu.basic.dessert);
      addRecord("side", dayMenu.basic.side1);
      addRecord("side", dayMenu.basic.side2);
    } else {
      addRecord("singleDish", dayMenu.exception.singleDish);
      addRecord("dessert", dayMenu.exception.extraDessert);
      addRecord("side", dayMenu.exception.extraSide);
    }
    addRecord("snack", dayMenu.snack);
    return records;
  }
  function syncMenuHistoryStorage() {
    const recipeMap = getRecipeMap();
    const nextHistory = {};
    Object.values(state.weeklyMenus || {}).forEach((week) => {
      WEEKDAY_KEYS.forEach((dayKey) => {
        const dayMenu = week?.[dayKey];
        if (!dayMenu?.date) return;
        historyRecordsForDay(dayMenu, dayMenu.date, recipeMap).forEach((record) => {
          const current = nextHistory[record.key];
          if (!current || current.lastUsedDate < record.lastUsedDate) nextHistory[record.key] = record;
        });
      });
    });
    state.menuHistory = nextHistory;
    saveStorage(STORAGE_KEYS.menuHistory, nextHistory);
  }
  function getLastUsedDate(type, recipeId, targetDate) {
    let lastUsed = null;
    Object.values(state.weeklyMenus || {}).forEach((week) => {
      WEEKDAY_KEYS.forEach((dayKey) => {
        const dayMenu = week?.[dayKey];
        if (!dayMenu?.date || new Date(dayMenu.date) >= new Date(targetDate)) return;
        const recipeMap = getRecipeMap();
        historyRecordsForDay(dayMenu, dayMenu.date, recipeMap).forEach((record) => {
          if (record.type === type && record.recipeId === recipeId && (!lastUsed || lastUsed < record.lastUsedDate)) lastUsed = record.lastUsedDate;
        });
      });
    });
    return lastUsed;
  }
  function isBlockedByHistory(type, recipeId, targetDate) {
    if (!["main", "singleDish", "dessert", "snack"].includes(type)) return false;
    const lastUsed = getLastUsedDate(type, recipeId, targetDate);
    if (!lastUsed) return false;
    return businessDaysBetween(lastUsed, targetDate) < state.settings.repeatBlockDays;
  }
  function recentSidePenalty(recipeId, targetDate) {
    const lastUsed = getLastUsedDate("side", recipeId, targetDate);
    if (!lastUsed) return 0;
    const gap = businessDaysBetween(lastUsed, targetDate);
    return gap < state.settings.repeatBlockDays ? (state.settings.repeatBlockDays - gap) * 8 : 0;
  }
  function getHistoryTypeForRole(recipe, role) {
    if (role === "dessert") return "dessert";
    if (role === "snack") return "snack";
    if (role.startsWith("side")) return "side";
    if (role === "main" && recipe.category === "単品料理") return "singleDish";
    if (role === "main") return "main";
    return "other";
  }
  function pickRecipeWithHistory(pool, context, role, targetDate, options = {}) {
    const excludeRotationKeys = options.excludeRotationKeys || new Set();
    const filtered = pool.filter((recipe) => {
      if (excludeRotationKeys.has(recipe.rotationKey)) return false;
      if (role === "main" && options.excludeMainRotation && recipe.rotationKey === options.excludeMainRotation) return false;
      const historyType = getHistoryTypeForRole(recipe, role);
      if (isBlockedByHistory(historyType, recipe.id, targetDate)) return false;
      return true;
    });
    const source = filtered.length ? filtered : pool;
    if (!source.length) return null;
    const ranked = source.map((recipe) => {
      let score = scoreRecipePreference(recipe, context, role);
      score += recentSidePenalty(recipe.id, targetDate);
      const historyType = getHistoryTypeForRole(recipe, role);
      if (isBlockedByHistory(historyType, recipe.id, targetDate)) score += 1000;
      return { recipe, score };
    }).sort((a, b) => a.score - b.score).slice(0, Math.min(14, source.length));
    return ranked[Math.floor(Math.random() * ranked.length)].recipe;
  }
  generateAutoWeek = function (weekStart) {
    const week = createEmptyWeekMenu(weekStart);
    const allRecipes = getAllRecipes();
    const cachedPoolCategories = ["主食", "汁物", "主菜", "副菜", "デザート", "単品料理", "おやつ"];
    const cachedPoolCuisines = ["all", ...CUISINES];
    const recipePools = Object.fromEntries(
      cachedPoolCategories.map((category) => [
        category,
        Object.fromEntries(
          cachedPoolCuisines.map((cuisine) => [
            cuisine,
            allRecipes.filter((recipe) => recipe.category === category && (cuisine === "all" || recipe.cuisine === cuisine))
          ])
        )
      ])
    );
    const getCachedRecipePool = (opts) => {
      const excludes = new Set((opts.excludeIds || []).filter(Boolean));
      const cuisineKey = opts.cuisine || "all";
      const basePool = recipePools[opts.category]?.[cuisineKey] || [];
      return basePool.filter((recipe) => !excludes.has(recipe.id) && recipe.nutrition.energy >= (opts.minEnergy || 0) && recipe.nutrition.energy <= (opts.maxEnergy || 9999));
    };
    const context = { cuisineCounts: { 和食: 0, 洋食: 0, 中華: 0 }, recipeUseCount: new Map(), mainRotationCount: new Map(), sideRotationCount: new Map(), dessertRotationCount: new Map(), dessertFruitCount: new Map(), dessertBaseCount: new Map(), lastMainId: null, lastMainRotationKey: null, lastDessertRotationKey: null, lastDessertFruitTag: null, lastDessertBaseTag: null, lastSideRotationKeys: new Set(), freshFruitDessertCount: 0, usedSideIds: new Set(), usedSideNames: new Set(), usedSnackIds: new Set() };
    const usedSoupIds = new Set();
    const usedMainIds = new Set();
    const exceptionDays = [...WEEKDAY_KEYS].sort(() => Math.random() - 0.5).slice(0, 1);
    const buildWeeklyVariedPool = (primaryPool, fallbackPool, usedIds, previousId) => {
      const backupPool = fallbackPool || primaryPool;
      const pools = [
        primaryPool.filter((recipe) => !usedIds.has(recipe.id) && recipe.id !== previousId),
        primaryPool.filter((recipe) => recipe.id !== previousId),
        backupPool.filter((recipe) => !usedIds.has(recipe.id) && recipe.id !== previousId),
        backupPool.filter((recipe) => recipe.id !== previousId),
        primaryPool.filter((recipe) => !usedIds.has(recipe.id)),
        backupPool.filter((recipe) => !usedIds.has(recipe.id)),
        primaryPool,
        backupPool
      ];
      return pools.find((pool) => pool.length) || [];
    };
    WEEKDAY_KEYS.forEach((dayKey, index) => {
      const date = addDays(weekStart, index);
      const targetCuisine = chooseTargetCuisine(context.cuisineCounts, index);
      const previousDayMenu = index > 0 ? week[WEEKDAY_KEYS[index - 1]] : null;
      const previousSoupId = previousDayMenu?.basic?.soup || null;
      const previousMainId = previousDayMenu?.basic?.main || null;
      const candidates = [];
      for (let i = 0; i < 12; i += 1) {
        const staple = pickRecipeWithHistory(getCachedRecipePool({ category: "主食", cuisine: targetCuisine, minEnergy: 100, maxEnergy: 230 }), context, "staple", date);
        const soupPool = getCachedRecipePool({ category: "汁物", cuisine: targetCuisine, minEnergy: 15, maxEnergy: 90 });
        const soup = pickRecipeWithHistory(buildWeeklyVariedPool(soupPool, soupPool, usedSoupIds, previousSoupId), context, "soup", date);
        const standardMainPool = getCachedRecipePool({ category: "主菜", cuisine: targetCuisine, minEnergy: 140, maxEnergy: 280 });
        const mainPool = buildWeeklyVariedPool(standardMainPool, standardMainPool, usedMainIds, previousMainId);
        const main = pickRecipeWithHistory(mainPool, context, "main", date, { excludeMainRotation: context.lastMainRotationKey });
        const side1 = pickRecipeWithHistory(filterPoolByUsedSideNames(getCachedRecipePool({ category: "副菜", cuisine: targetCuisine, minEnergy: 20, maxEnergy: 110, excludeIds: [...context.usedSideIds] }), context), context, "side1", date);
        const side2 = pickSecondSideRecipe(targetCuisine, context, side1, (pool, pickOptions) => pickRecipeWithHistory(pool, context, "side2", date, pickOptions), { excludeIds: [...context.usedSideIds], date });
        const dessert = pickRecipeWithHistory(getCachedRecipePool({ category: "デザート", minEnergy: 35, maxEnergy: 120 }), context, "dessert", date, { excludeRotationKeys: new Set([context.lastDessertRotationKey].filter(Boolean)) });
        const snack = pickRecipeWithHistory(filterPreferredSnackRecipes(getCachedRecipePool({ category: "おやつ", minEnergy: 40, maxEnergy: 160, excludeIds: [...context.usedSnackIds] })), context, "snack", date);
        if (!(staple && soup && main && side1 && side2 && dessert && snack)) continue;
        if (side1.id === side2.id || side1.name === side2.name) continue;
        const menu = { date, mode: "basic", basic: { staple: staple.id, soup: soup.id, main: main.id, side1: side1.id, side2: side2.id, dessert: dessert.id }, exception: { singleDish: null, extraSoup: null, extraSide: null, extraDessert: null }, snack: snack.id, memo: `${targetCuisine}中心の自動献立`, generatedByAuto: true };
        candidates.push({ menu, score: scoreMenu(menu, context, targetCuisine) });
      }
      for (let i = 0; i < 4; i += 1) {
        const singleDish = pickRecipeWithHistory(getCachedRecipePool({ category: "単品料理", cuisine: targetCuisine, minEnergy: 320, maxEnergy: 520 }), context, "main", date, { excludeMainRotation: context.lastMainRotationKey });
        const snack = pickRecipeWithHistory(filterPreferredSnackRecipes(getCachedRecipePool({ category: "おやつ", minEnergy: 40, maxEnergy: 160, excludeIds: [...context.usedSnackIds] })), context, "snack", date);
        if (!(singleDish && snack)) continue;
        const exceptionCuisine = singleDish.cuisine;
        let extraSoup = null;
        let extraSide = null;
        let extraDessert = null;
        if (singleDish.nutrition.energy < 470) {
          extraSide = pickRecipeWithHistory(getCachedRecipePool({ category: "副菜", cuisine: exceptionCuisine, minEnergy: 25, maxEnergy: 90, excludeIds: [...context.usedSideIds] }), context, "side1", date);
          extraDessert = pickRecipeWithHistory(getCachedRecipePool({ category: "デザート", minEnergy: 40, maxEnergy: 110 }), context, "dessert", date);
        } else if (singleDish.nutrition.energy < 520) {
          extraDessert = pickRecipeWithHistory(getCachedRecipePool({ category: "デザート", minEnergy: 35, maxEnergy: 90 }), context, "dessert", date);
        }
        if (singleDish.nutrition.salt < 2.2) extraSoup = pickRecipeWithHistory(getCachedRecipePool({ category: "汁物", cuisine: exceptionCuisine, minEnergy: 15, maxEnergy: 70 }), context, "soup", date);
        const menu = { date, mode: "exception", basic: { staple: null, soup: null, main: null, side1: null, side2: null, dessert: null }, exception: { singleDish: singleDish.id, extraSoup: extraSoup?.id || null, extraSide: extraSide?.id || null, extraDessert: extraDessert?.id || null }, snack: snack.id, memo: `${targetCuisine}中心の例外献立`, generatedByAuto: true };
        if (exceptionDays.includes(dayKey)) candidates.push({ menu, score: scoreMenu(menu, context, targetCuisine) - 8 });
      }
      const best = candidates.filter(Boolean).sort((a, b) => b.score - a.score)[0];
      week[dayKey] = best ? best.menu : createEmptyWeekMenu(weekStart)[dayKey];
      if (week[dayKey]?.mode === "basic") {
        if (week[dayKey].basic?.soup) usedSoupIds.add(week[dayKey].basic.soup);
        if (week[dayKey].basic?.main) usedMainIds.add(week[dayKey].basic.main);
      }
      updateGenerationContext(week[dayKey], context);
    });
    return finalizeWeekForSave(weekStart, week, false) || createEmptyWeekMenu(weekStart);
  };
  renderResidentView = function () {
    const week = getWeekMenus(state.settings.weekStart); const map = getRecipeMap();
    const headers = WEEKDAY_KEYS.map((dayKey) => {
      const dayMenu = week[dayKey];
      const evaluation = evaluateDayMenu(dayMenu);
      return `<th class="resident-day-head"><span class="resident-day-date">${formatDate(dayMenu.date)}</span><span class="resident-day-weekday">${WEEKDAY_LABELS[dayKey]}曜日</span><div class="resident-day-nutrition"><span class="resident-nutrition-chip energy">エネルギー ${formatNumber(evaluation.totals.energy, 0)} kcal</span><span class="resident-nutrition-chip salt">塩分 ${formatNumber(evaluation.totals.salt, 1)} g</span></div></th>`;
    }).join("");
    const rows = [["主食", "staple"], ["汁物", "soup"], ["主菜", "main"], ["副菜1", "side1"], ["副菜2", "side2"], ["デザート", "dessert"], ["3時のおやつ", "snack"]].map(([label, slotKey]) => {
      const cells = WEEKDAY_KEYS.map((dayKey) => {
        const day = week[dayKey];
        if (slotKey === "snack") return `<td>${escapeHtml(map.get(day.snack)?.name || "調整中")}</td>`;
        return `<td>${escapeHtml(getResidentCellText(day, slotKey, map))}</td>`;
      }).join("");
      return `<tr><th scope="row">${label}</th>${cells}</tr>`;
    }).join("");
    const springIllustration = `<div class="resident-season-strip" aria-hidden="true"><svg viewBox="0 0 220 56" role="img"><g fill="none" fill-rule="evenodd"><path d="M8 46c24-2 49-3 74-2 21 0 43 2 63 5 18 2 39 1 67-3" stroke="#a8c7a3" stroke-width="2.4" stroke-linecap="round"/><path d="M22 39c8-8 11-17 12-28M54 40c7-7 10-16 10-25M164 40c8-8 11-16 11-25" stroke="#a8c7a3" stroke-width="1.8" stroke-linecap="round"/><g transform="translate(10 7)"><g transform="translate(0 12)"><circle cx="12" cy="12" r="4.4" fill="#f4c7d3"/><ellipse cx="12" cy="5.5" rx="5.3" ry="7" fill="#f7d8e1"/><ellipse cx="18.5" cy="12" rx="7" ry="5.3" fill="#f7d8e1"/><ellipse cx="12" cy="18.5" rx="5.3" ry="7" fill="#f7d8e1"/><ellipse cx="5.5" cy="12" rx="7" ry="5.3" fill="#f7d8e1"/><circle cx="12" cy="12" r="2.5" fill="#f1b25d"/></g><g transform="translate(34 2) scale(.9)"><circle cx="12" cy="12" r="4.4" fill="#f4c7d3"/><ellipse cx="12" cy="5.5" rx="5.3" ry="7" fill="#f7d8e1"/><ellipse cx="18.5" cy="12" rx="7" ry="5.3" fill="#f7d8e1"/><ellipse cx="12" cy="18.5" rx="5.3" ry="7" fill="#f7d8e1"/><ellipse cx="5.5" cy="12" rx="7" ry="5.3" fill="#f7d8e1"/><circle cx="12" cy="12" r="2.5" fill="#f1b25d"/></g><g transform="translate(150 6) scale(.95)"><circle cx="12" cy="12" r="4.4" fill="#f4c7d3"/><ellipse cx="12" cy="5.5" rx="5.3" ry="7" fill="#f7d8e1"/><ellipse cx="18.5" cy="12" rx="7" ry="5.3" fill="#f7d8e1"/><ellipse cx="12" cy="18.5" rx="5.3" ry="7" fill="#f7d8e1"/><ellipse cx="5.5" cy="12" rx="7" ry="5.3" fill="#f7d8e1"/><circle cx="12" cy="12" r="2.5" fill="#f1b25d"/></g><path d="M92 24c6-7 14-8 20-2-10 0-16 3-20 11 0-3 0-6 0-9z" fill="#b8d9ac"/><path d="M104 22c4-5 10-6 15-2-8 0-12 3-15 9 0-2 0-4 0-7z" fill="#9fcf98"/></g><text x="166" y="51" font-size="10" fill="#967564">さくらの季節</text></g></svg></div>`;
    elements.residentView.innerHTML = `<article class="panel resident-friendly-panel"><div class="section-head"><div><p class="section-kicker">Resident Menu</p><h2>今週のおひるごはん</h2></div><p class="section-note">月曜から金曜までの昼食と3時のおやつを、大きめの文字でやさしく見やすくまとめた献立表です。</p></div><table class="resident-menu-table"><thead><tr><th>区分</th>${headers}</tr></thead><tbody>${rows}</tbody></table><p class="resident-page-note is-friendly">各曜日の見出しに、昼食のエネルギーと塩分を表示しています。単品料理の日は主食欄に料理名を表示し、3時のおやつも毎日表示します。</p>${springIllustration}</article>`;
  };
  renderKitchenView = function () {
    const week = getWeekMenus(state.settings.weekStart); const map = getRecipeMap();
    const sheets = WEEKDAY_KEYS.map((dayKey) => {
      const dayMenu = week[dayKey]; const evaluation = evaluateDayMenu(dayMenu);
      const summaryRows = [["主食", "staple"], ["汁物", "soup"], ["主菜", "main"], ["副菜1", "side1"], ["副菜2", "side2"], ["デザート", "dessert"], ["3時のおやつ", "snack"]].map(([label, slotKey]) => {
        const text = slotKey === "snack" ? (map.get(dayMenu.snack)?.name || "調整中") : getKitchenSlotText(dayMenu, slotKey, map);
        return `<tr><th scope="row">${label}</th><td>${escapeHtml(text)}</td></tr>`;
      }).join("");
      const grouped = new Map();
      getKitchenSlotBindings(dayMenu).concat(dayMenu.snack ? [["3時のおやつ", dayMenu.snack]] : []).forEach(([slotLabel, recipeId]) => {
        if (!recipeId) return;
        if (!grouped.has(recipeId)) grouped.set(recipeId, []);
        grouped.get(recipeId).push(slotLabel);
      });
      const recipeRows = [...grouped.entries()].map(([recipeId, slotLabels]) => {
        const recipe = map.get(recipeId);
        if (!recipe) return "";
        return `<tr><td>${escapeHtml(slotLabels.join(" / "))}</td><td>${escapeHtml(recipe.name)}</td><td>${formatNumber(recipe.servingSize, 0)} g</td><td>${formatPartLines(recipe.ingredients, state.settings.kitchenServings, "ingredient")}</td><td>${formatPartLines(recipe.seasonings, state.settings.kitchenServings, "seasoning")}</td><td>${escapeHtml(recipe.instructions.join(" / "))}</td><td>${formatNumber(recipe.nutrition.energy, 0)} kcal<br>塩分 ${formatNumber(recipe.nutrition.salt, 1)} g</td></tr>`;
      }).join("") || '<tr><td colspan="7">献立が未設定です。</td></tr>';
      return `<article class="panel kitchen-day-sheet page-print-break"><div class="section-head"><div><p class="section-kicker">${WEEKDAY_LABELS[dayKey]}曜日</p><h2>${formatDate(dayMenu.date)} 調理士向け指示書</h2></div></div><div class="kitchen-page-stack"><div class="kitchen-day-meta"><table class="kitchen-summary-table"><tbody>${summaryRows}</tbody></table>${renderKitchenNutritionSummary(evaluation.totals)}</div><table class="kitchen-day-table"><thead><tr><th>献立枠</th><th>料理名</th><th>1人前量</th><th>材料</th><th>調味料</th><th>作業指示</th><th>栄養価</th></tr></thead><tbody>${recipeRows}</tbody></table></div></article>`;
    }).join("");
    elements.kitchenView.innerHTML = `<article class="panel kitchen-intro"><div class="section-head"><div><p class="section-kicker">Kitchen Sheets</p><h2>調理師向け 5日分指示書</h2></div></div></article>${sheets}`;
  };
  renderAdminView = function () {
    const week = getWeekMenus(state.settings.weekStart); const recipes = getAllRecipes(); const foods = getAllFoods(); const selectedRecipe = recipes.find((recipe) => recipe.id === state.selectedRecipeId) || null; const catalog = summarizeCatalog(recipes); const byCategory = (category) => recipes.filter((recipe) => recipe.category === category).sort((a, b) => a.name.localeCompare(b.name, 'ja'));
    const historyCount = Object.keys(state.menuHistory || {}).length;
    const editorCards = WEEKDAY_KEYS.map((dayKey) => { const dayMenu = week[dayKey]; const evaluation = evaluateDayMenu(dayMenu); return `<article class="menu-card"><div class="sub-head"><div><p class="section-kicker">${WEEKDAY_LABELS[dayKey]}曜日</p><h3>${formatDate(dayMenu.date)}</h3></div><span class="pill">${dayMenu.mode === "basic" ? "通常献立" : "例外献立"}</span></div><div class="stack"><label class="field"><span>献立タイプ</span><select data-menu-day="${dayKey}" data-menu-field="mode"><option value="basic" ${dayMenu.mode === "basic" ? "selected" : ""}>通常献立</option><option value="exception" ${dayMenu.mode === "exception" ? "selected" : ""}>例外献立</option></select></label><div class="grid-two">${renderSlotSelect(dayKey, "basic", "staple", "主食", dayMenu.basic.staple, byCategory("主食"))}${renderSlotSelect(dayKey, "basic", "soup", "汁物", dayMenu.basic.soup, byCategory("汁物"))}${renderSlotSelect(dayKey, "basic", "main", "主菜", dayMenu.basic.main, byCategory("主菜"))}${renderSlotSelect(dayKey, "basic", "side1", "副菜1", dayMenu.basic.side1, byCategory("副菜"))}${renderSlotSelect(dayKey, "basic", "side2", "副菜2", dayMenu.basic.side2, byCategory("副菜"))}${renderSlotSelect(dayKey, "basic", "dessert", "デザート", dayMenu.basic.dessert, byCategory("デザート"))}</div><div class="grid-two">${renderSlotSelect(dayKey, "exception", "singleDish", "単品料理", dayMenu.exception.singleDish, byCategory("単品料理"))}${renderSlotSelect(dayKey, "exception", "extraSoup", "追加汁物", dayMenu.exception.extraSoup, byCategory("汁物"), true)}${renderSlotSelect(dayKey, "exception", "extraSide", "追加副菜", dayMenu.exception.extraSide, byCategory("副菜"), true)}${renderSlotSelect(dayKey, "exception", "extraDessert", "追加デザート", dayMenu.exception.extraDessert, byCategory("デザート"), true)}</div><div class="grid-two">${renderSlotSelect(dayKey, "snack", "snack", "3時のおやつ", dayMenu.snack, byCategory("おやつ"))}</div><label class="field"><span>メモ</span><textarea data-menu-day="${dayKey}" data-menu-field="memo">${escapeHtml(dayMenu.memo || "")}</textarea></label><div class="check-grid">${renderConditionCards(evaluation)}</div></div></article>`; }).join("");
    elements.adminView.innerHTML = `<article class="panel"><div class="section-head"><div><p class="section-kicker">Admin</p><h2>管理画面</h2></div></div><div class="toolbar"><label class="field"><span>週の開始日</span><input id="admin-week-start" type="date" value="${escapeHtml(state.settings.weekStart)}"></label><label class="field"><span>調理人数</span><input id="admin-kitchen-servings" type="number" min="1" step="1" value="${escapeHtml(state.settings.kitchenServings)}"></label><label class="field"><span>誕生日週ルールを第3週に適用</span><input id="admin-birthday-week" type="checkbox" ${isBirthdayRuleEnabled() ? "checked" : ""}></label><button type="button" class="button button-primary" id="auto-generate-button">自動で5日分の献立を作成</button></div><p class="print-note">3週目ルール ${isThirdWeekRuleWeek(state.settings.weekStart) ? "適用中: 主食はお赤飯固定" : "対象外"} / 誕生日週ルール ${!isBirthdayRuleEnabled() ? "OFF" : (isThirdWeekRuleWeek(state.settings.weekStart) ? "適用中: 第3週のため お赤飯 + ケーキ" : "待機中: 第3週のみ適用")}</p></article><article class="panel catalog-panel"><div class="section-head"><div><p class="section-kicker">Catalog</p><h2>料理マスタ概要</h2></div></div><div class="catalog-stats catalog-stats--compact"><article class="metric-card"><span>総料理数</span><strong>${catalog.total}</strong></article><article class="metric-card"><span>和食 / 洋食 / 中華</span><strong>${catalog.byCuisine["和食"]} / ${catalog.byCuisine["洋食"]} / ${catalog.byCuisine["中華"]}</strong></article><article class="metric-card"><span>副菜数</span><strong>${catalog.byCategory["副菜"]}</strong></article><article class="metric-card"><span>デザート / おやつ</span><strong>${catalog.byCategory["デザート"]} / ${catalog.byCategory["おやつ"]}</strong></article></div></article><article class="panel"><div class="section-head"><div><p class="section-kicker">Weekly Editor</p><h2>5日分献立編集</h2></div></div><div class="weekly-grid">${editorCards}</div></article><article class="panel"><div class="section-head"><div><p class="section-kicker">Recipe Master</p><h2>料理一覧</h2></div></div><div class="detail-grid"><div class="recipe-list">${recipes.map((recipe) => `<article class="recipe-card ${recipe.id === state.selectedRecipeId ? "is-active" : ""}" data-recipe-card="${recipe.id}"><div class="sub-head"><div><h3>${escapeHtml(recipe.name)}</h3><span class="tag">${escapeHtml(recipe.cuisine)} / ${escapeHtml(recipe.category)}</span></div><span class="pill">${formatNumber(recipe.nutrition.energy, 0)} kcal</span></div><p class="muted">rotation ${escapeHtml(recipe.rotationKey)} / ${escapeHtml(recipe.tags.join("・"))}</p></article>`).join("")}</div>${renderRecipeDetailPanel(selectedRecipe)}</div></article><article class="panel"><div class="section-head"><div><p class="section-kicker">Food Master</p><h2>食品マスタ</h2></div><p class="section-note">食品成分表ベースの100gあたり栄養価です。</p></div><div class="food-list">${foods.map((food) => `<article class="card"><div class="sub-head"><strong>${escapeHtml(food.name)}</strong><span class="pill">100g</span></div><p class="muted">エネルギー ${formatNumber(food.nutrients.energy, 0)} kcal / たんぱく質 ${formatNumber(food.nutrients.protein, 1)} g / 脂質 ${formatNumber(food.nutrients.fat, 1)} g / 炭水化物 ${formatNumber(food.nutrients.carbs, 1)} g / 食物繊維 ${formatNumber(food.nutrients.fiber, 1)} g / 塩分 ${formatNumber(food.nutrients.salt, 1)} g</p></article>`).join("")}</div></article>`;
    bindAdminViewEvents();
  };
  collectWeekDraftFromDom = function () {
    const week = createEmptyWeekMenu(state.settings.weekStart);
    Array.from(document.querySelectorAll('[data-menu-day]')).forEach((input) => {
      const dayKey = input.dataset.menuDay, field = input.dataset.menuField, mode = input.dataset.menuMode;
      if (field === 'mode') { week[dayKey].mode = input.value; return; }
      if (field === 'memo') { week[dayKey].memo = input.value; return; }
      if (field === 'snack') { week[dayKey].snack = input.value || null; return; }
      if (mode === 'basic') week[dayKey].basic[field] = input.value || null;
      if (mode === 'exception') week[dayKey].exception[field] = input.value || null;
    });
    return week;
  };
  function regenerateWeekFromScratch(weekStart) {
    delete state.weeklyMenus[weekStart];
    saveStorage(STORAGE_KEYS.weeklyMenus, state.weeklyMenus);
    const regenerated = finalizeWeekForSave(weekStart, generateAutoWeek(weekStart), false);
    if (!regenerated) {
      renderAll();
      return;
    }
    state.weeklyMenus[weekStart] = regenerated;
    syncMenuHistoryStorage();
    saveStorage(STORAGE_KEYS.weeklyMenus, state.weeklyMenus);
    saveStorage(STORAGE_KEYS.settings, state.settings);
    renderAll();
  }
  bindAdminViewEvents = function () {
    document.querySelector('#admin-week-start')?.addEventListener('change', (event) => { state.settings.weekStart = event.target.value || mondayString(new Date()); ensureWeekExists(state.settings.weekStart); saveStorage(STORAGE_KEYS.settings, state.settings); renderAll(); });
    document.querySelector('#admin-kitchen-servings')?.addEventListener('change', (event) => { state.settings.kitchenServings = Math.max(1, Number(event.target.value || 1)); saveStorage(STORAGE_KEYS.settings, state.settings); renderAll(); });
    document.querySelector('#admin-birthday-week')?.addEventListener('change', (event) => { setBirthdayWeekRuleEnabled(event.target.checked); saveStorage(STORAGE_KEYS.settings, state.settings); renderAll(); });
    document.querySelector('#regenerate-week-button')?.addEventListener('click', () => { regenerateWeekFromScratch(state.settings.weekStart); });
    document.querySelector('#save-week-button')?.addEventListener('click', () => {
      const validatedWeek = finalizeWeekForSave(state.settings.weekStart, collectWeekDraftFromDom(), false);
      if (!validatedWeek) {
        renderAll();
        return;
      }
      state.weeklyMenus[state.settings.weekStart] = validatedWeek;
      syncMenuHistoryStorage();
      saveStorage(STORAGE_KEYS.weeklyMenus, state.weeklyMenus);
      saveStorage(STORAGE_KEYS.settings, state.settings);
      renderAll();
    });
    Array.from(document.querySelectorAll('[data-recipe-card]')).forEach((card) => { card.addEventListener('click', () => { state.selectedRecipeId = card.dataset.recipeCard; state.recipeMasterMode = "view"; state.recipeMasterDraft = null; state.recipeMasterDraftError = ""; renderAdminView(); }); });
    Array.from(document.querySelectorAll('[data-recipe-filter]')).forEach((button) => {
      button.addEventListener('click', () => {
        state.adminRecipeMasterFilter = button.dataset.recipeFilter || "all";
        state.adminRecipeMasterSearch = "";
        state.adminRecipeMasterSearchDraft = "";
        const filteredRecipes = getRecipeMasterFilteredRecipes(getAllRecipes(), getRecipeMasterFilterValue(), "");
        if (!filteredRecipes.find((recipe) => recipe.id === state.selectedRecipeId)) {
          state.selectedRecipeId = filteredRecipes[0]?.id || null;
        }
        renderAdminView();
      });
    });
    const searchInput = document.querySelector('#recipe-master-search');
    const applyRecipeMasterSearch = () => {
      commitRecipeMasterSearchInputValue(searchInput?.value || "");
      const filteredRecipes = getRecipeMasterFilteredRecipes(getAllRecipes(), getRecipeMasterFilterValue(), getRecipeMasterSearchValue());
      if (!filteredRecipes.find((recipe) => recipe.id === state.selectedRecipeId)) {
        state.selectedRecipeId = filteredRecipes[0]?.id || null;
      }
      rerenderAdminRecipeMasterSearch(searchInput);
    };
    searchInput?.addEventListener('compositionstart', () => {
      state.isRecipeMasterComposing = true;
      state.adminRecipeMasterSearchDraft = searchInput?.value || "";
    });
    searchInput?.addEventListener('compositionend', () => {
      state.isRecipeMasterComposing = false;
      applyRecipeMasterSearch();
    });
    searchInput?.addEventListener('input', (event) => {
      if (event.isComposing || state.isRecipeMasterComposing) {
        state.adminRecipeMasterSearchDraft = event.target.value || "";
        return;
      }
      applyRecipeMasterSearch();
    });
    searchInput?.addEventListener('search', () => {
      if (state.isRecipeMasterComposing) return;
      applyRecipeMasterSearch();
    });
    document.querySelector('#recipe-master-add-button')?.addEventListener('click', () => {
      state.recipeMasterMode = "create";
      state.recipeMasterDraft = createEmptyRecipeMasterDraft();
      state.recipeMasterDraftError = "";
      renderAdminView();
    });
    document.querySelector('#recipe-master-edit-button')?.addEventListener('click', () => {
      const recipe = getRecipeMap().get(state.selectedRecipeId);
      if (!recipe) return;
      state.recipeMasterMode = "edit";
      state.recipeMasterDraft = createRecipeDraftFromRecipe(recipe);
      state.recipeMasterDraftError = "";
      renderAdminView();
    });
    document.querySelector('#recipe-master-delete-button')?.addEventListener('click', () => {
      const recipe = getRecipeMap().get(state.selectedRecipeId);
      if (!recipe) return;
      if (!window.confirm("この料理を削除しますか？")) return;
      if (isCustomRecipeId(recipe.id)) {
        state.customRecipes = (state.customRecipes || []).filter((item) => item.id !== recipe.id);
        saveStorage(STORAGE_KEYS.customRecipes, state.customRecipes);
      } else {
        state.hiddenDefaultRecipeIds = [...new Set([...(state.hiddenDefaultRecipeIds || []), recipe.id])];
        saveStorage(STORAGE_KEYS.hiddenDefaultRecipeIds, state.hiddenDefaultRecipeIds);
        if (state.customRecipeOverrides?.[recipe.id]) {
          const nextOverrides = { ...(state.customRecipeOverrides || {}) };
          delete nextOverrides[recipe.id];
          state.customRecipeOverrides = nextOverrides;
          saveStorage(STORAGE_KEYS.customRecipeOverrides, state.customRecipeOverrides);
        }
      }
      if (removeRecipeIdFromWeeklyMenus(recipe.id)) {
        syncMenuHistoryStorage();
        saveStorage(STORAGE_KEYS.weeklyMenus, state.weeklyMenus);
      }
      state.recipeMasterMode = "view";
      state.recipeMasterDraft = null;
      state.recipeMasterDraftError = "";
      const filteredRecipes = getRecipeMasterFilteredRecipes(getAllRecipes(), getRecipeMasterFilterValue(), getRecipeMasterSearchValue());
      state.selectedRecipeId = filteredRecipes[0]?.id || getAllRecipes()[0]?.id || null;
      renderAll();
    });
    document.querySelector('.recipe-detail')?.addEventListener('click', (event) => {
      const addButton = event.target.closest('[data-recipe-master-part-add]');
      if (addButton) {
        appendRecipeMasterPartRow(addButton.dataset.recipeMasterPartAdd || "", addButton.dataset.recipeMasterPartTitle || "");
        return;
      }
      const removeButton = event.target.closest('[data-recipe-master-part-remove]');
      if (removeButton) {
        removeRecipeMasterPartRow(removeButton);
      }
    });
    const syncRecipeMasterDraft = () => {
      if (state.recipeMasterMode !== "create" && state.recipeMasterMode !== "edit") return;
      state.recipeMasterDraft = collectRecipeMasterDraftFromDom();
    };
    Array.from(document.querySelectorAll('[data-recipe-master-draft]')).forEach((input) => {
      input.addEventListener('input', syncRecipeMasterDraft);
      input.addEventListener('change', syncRecipeMasterDraft);
    });
    document.querySelector('#recipe-master-ai-button')?.addEventListener('click', () => {
      const currentDraft = collectRecipeMasterDraftFromDom();
      const recipeName = (currentDraft.name || "").trim();
      state.recipeMasterDraft = currentDraft;
      if (!recipeName) {
        state.recipeMasterDraftError = "料理名を先に入力してください。";
        renderAdminView();
        return;
      }
      state.recipeMasterDraftError = "";
      state.recipeMasterAiLoading = true;
      renderAdminView();
      window.setTimeout(async () => {
        try {
          const aiResult = await callRecipeAutofillAI(recipeName);
          state.recipeMasterDraft = mergeRecipeMasterDraftWithAiResult(currentDraft, aiResult);
          state.recipeMasterDraftError = "";
        } catch (_error) {
          state.recipeMasterDraft = currentDraft;
          state.recipeMasterDraftError = _error instanceof Error && _error.message
            ? _error.message
            : "AI入力に失敗しました。もう一度お試しください。";
        } finally {
          state.recipeMasterAiLoading = false;
          renderAdminView();
        }
      }, 0);
    });
    document.querySelector('#recipe-master-cancel-button')?.addEventListener('click', () => {
      state.recipeMasterMode = "view";
      state.recipeMasterDraft = null;
      state.recipeMasterDraftError = "";
      renderAdminView();
    });
    document.querySelector('#recipe-master-save-button')?.addEventListener('click', () => {
      const draft = collectRecipeMasterDraftFromDom();
      state.recipeMasterDraft = draft;
      const normalizedName = (draft.name || "").trim();
      if (!normalizedName || !draft.category || !draft.cuisine) {
        state.recipeMasterDraftError = "料理名、カテゴリ、cuisine は必須です。";
        renderAdminView();
        return;
      }
      const duplicateRecipe = getAllRecipes().find((recipe) => recipe.name === normalizedName && recipe.id !== state.selectedRecipeId);
      if (duplicateRecipe) {
        state.recipeMasterDraftError = "同じ料理名が既にあります。";
        renderAdminView();
        return;
      }
      if (state.recipeMasterMode === "edit") {
        const selectedRecipe = getRecipeMap().get(state.selectedRecipeId);
        if (!selectedRecipe) {
          state.recipeMasterDraftError = "編集対象の料理が見つかりません。";
          renderAdminView();
          return;
        }
        const editedRecipe = buildRecipeMasterEditedRecipeFromDraft(selectedRecipe, draft);
        if (isCustomRecipeId(selectedRecipe.id)) {
          state.customRecipes = normalizeCustomRecipes(state.customRecipes || []).map((recipe) => recipe.id === selectedRecipe.id ? editedRecipe : recipe);
          saveStorage(STORAGE_KEYS.customRecipes, state.customRecipes);
        } else {
          state.customRecipeOverrides = {
            ...(state.customRecipeOverrides || {}),
            [selectedRecipe.id]: editedRecipe
          };
          saveStorage(STORAGE_KEYS.customRecipeOverrides, state.customRecipeOverrides);
        }
        state.selectedRecipeId = editedRecipe.id;
        state.recipeMasterMode = "view";
        state.recipeMasterDraft = null;
        state.recipeMasterDraftError = "";
        renderAll();
        return;
      }
      const customRecipe = buildRecipeMasterCustomRecipeFromDraft(draft);
      state.customRecipes = [...(state.customRecipes || []), customRecipe];
      saveStorage(STORAGE_KEYS.customRecipes, state.customRecipes);
      state.selectedRecipeId = customRecipe.id;
      state.recipeMasterMode = "view";
      state.recipeMasterDraft = null;
      state.recipeMasterDraftError = "";
      state.adminRecipeMasterFilter = "all";
      state.adminRecipeMasterSearch = "";
      state.adminRecipeMasterSearchDraft = "";
      renderAdminView();
    });
  };
  const RECIPE_MASTER_FILTER_OPTIONS = [
    { value: "all", label: "\u3059\u3079\u3066" },
    { value: "\u4e3b\u98df", label: "\u4e3b\u98df" },
    { value: "\u4e3b\u83dc", label: "\u4e3b\u83dc" },
    { value: "\u526f\u83dc", label: "\u526f\u83dc" },
    { value: "\u6c41\u7269", label: "\u6c41\u7269" },
    { value: "\u30c7\u30b6\u30fc\u30c8", label: "\u30c7\u30b6\u30fc\u30c8" },
    { value: "\u304a\u3084\u3064", label: "3\u6642\u306e\u304a\u3084\u3064" }
  ];
  function getRecipeMasterFilterValue() {
    return state.adminRecipeMasterFilter || "all";
  }
  function getRecipeMasterSearchValue() {
    return state.adminRecipeMasterSearch || "";
  }
  function getRecipeMasterSearchInputValue() {
    return state.adminRecipeMasterSearchDraft || "";
  }
  function commitRecipeMasterSearchInputValue(inputValue) {
    const nextValue = inputValue || "";
    state.adminRecipeMasterSearch = nextValue;
    state.adminRecipeMasterSearchDraft = nextValue;
  }
  function rerenderAdminRecipeMasterSearch(searchInput) {
    const scrollX = window.scrollX;
    const scrollY = window.scrollY;
    const selectionStart = searchInput?.selectionStart ?? null;
    const selectionEnd = searchInput?.selectionEnd ?? null;
    renderAdminView();
    const nextInput = document.querySelector("#recipe-master-search");
    if (nextInput) {
      try {
        nextInput.focus({ preventScroll: true });
      } catch (_error) {
        nextInput.focus();
      }
      if (selectionStart !== null && selectionEnd !== null) {
        nextInput.setSelectionRange(selectionStart, selectionEnd);
      }
    }
    window.scrollTo(scrollX, scrollY);
  }
  function createRecipeMasterCustomRecipe(recipe) {
    return {
      id: recipe.id,
      name: recipe.name,
      category: recipe.category,
      cuisine: recipe.cuisine,
      notes: recipe.notes || "",
      servingSize: recipe.servingSize || recipe.servingWeight || 100,
      rotationKey: recipe.rotationKey || recipe.name,
      tags: Array.isArray(recipe.tags) ? [...recipe.tags] : [],
      nutrition: recipe.nutrition ? { ...recipe.nutrition } : emptyNutrition(),
      ingredients: normalizeParts(recipe.ingredients || []).map((partItem) => ({ ...partItem })),
      seasonings: normalizeParts(recipe.seasonings || []).map((partItem) => ({ ...partItem })),
      instructions: Array.isArray(recipe.instructions) ? [...recipe.instructions] : (Array.isArray(recipe.steps) ? [...recipe.steps] : [])
    };
  }
  function createEmptyRecipeMasterDraft() {
    return {
      name: "",
      category: "主菜",
      cuisine: "和食",
      description: "",
      notes: "",
      rotationKey: "",
      tags: "",
      servingSize: "0",
      ingredientRows: [],
      seasoningRows: [],
      ingredients: "",
      seasonings: "",
      steps: "",
      energy: "0",
      protein: "0",
      fat: "0",
      carbs: "0",
      fiber: "0",
      salt: "0"
    };
  }
  function collectRecipeMasterDraftFromDom() {
    const ingredientRows = collectRecipeMasterPartRowsFromDom("ingredient");
    const seasoningRows = collectRecipeMasterPartRowsFromDom("seasoning");
    return {
      name: document.querySelector('#recipe-master-draft-name')?.value || "",
      category: document.querySelector('#recipe-master-draft-category')?.value || "",
      cuisine: document.querySelector('#recipe-master-draft-cuisine')?.value || "",
      description: state.recipeMasterDraft?.description || "",
      notes: document.querySelector('#recipe-master-draft-notes')?.value || "",
      rotationKey: state.recipeMasterDraft?.rotationKey || "",
      tags: state.recipeMasterDraft?.tags || "",
      servingSize: document.querySelector('#recipe-master-draft-serving-size')?.value || "",
      ingredientRows,
      seasoningRows,
      ingredients: document.querySelector('#recipe-master-draft-ingredients')?.value || "",
      seasonings: document.querySelector('#recipe-master-draft-seasonings')?.value || "",
      steps: document.querySelector('#recipe-master-draft-steps')?.value || "",
      energy: document.querySelector('#recipe-master-draft-energy')?.value || "",
      protein: document.querySelector('#recipe-master-draft-protein')?.value || "",
      fat: document.querySelector('#recipe-master-draft-fat')?.value || "",
      carbs: document.querySelector('#recipe-master-draft-carbs')?.value || "",
      fiber: document.querySelector('#recipe-master-draft-fiber')?.value || "",
      salt: document.querySelector('#recipe-master-draft-salt')?.value || ""
    };
  }
  function buildRecipeMasterCustomRecipeFromDraft(draft) {
    const normalizedName = (draft.name || "").trim();
    const servingSize = Math.max(1, Number(draft.servingSize || 100));
    const energy = Number(draft.energy || 0);
    const protein = Number(draft.protein || 0);
    const fat = Number(draft.fat || 0);
    const carbs = Number(draft.carbs || 0);
    const fiber = Number(draft.fiber || 0);
    const salt = Number(draft.salt || 0);
    const stepsArray = (draft.steps || "").split(/\r?\n/).map((step) => step.trim()).filter(Boolean);
    const ingredients = Array.isArray(draft.ingredientRows)
      ? buildRecipeMasterPartsFromRows([], draft.ingredientRows, "ingredient")
      : parseRecipeMasterDraftParts(draft.ingredients, "ingredient");
    const seasonings = Array.isArray(draft.seasoningRows)
      ? buildRecipeMasterPartsFromRows([], draft.seasoningRows, "seasoning")
      : parseRecipeMasterDraftParts(draft.seasonings, "seasoning");
    return {
      id: `custom-recipe-${Date.now()}`,
      name: normalizedName,
      category: draft.category,
      cuisine: draft.cuisine,
      description: draft.description || "",
      notes: draft.notes || "",
      ingredients,
      seasonings,
      instructions: stepsArray.length ? stepsArray : ["手順未設定"],
      steps: stepsArray.length ? stepsArray : ["手順未設定"],
      servingSize,
      servings: 1,
      servingWeight: servingSize,
      rotationKey: (draft.rotationKey || "").trim() || normalizedName,
      tags: [...new Set(["custom", ...parseRecipeMasterTags(draft.tags)])],
      nutrition: {
        energy,
        protein,
        fat,
        carbs,
        fiber,
        salt,
        kcal: energy
      }
    };
  }
  function renderRecipeMasterAiRow() {
    return `<div class="recipe-master-ai-row"><p class="recipe-master-ai-note">AI下書き。内容確認後に保存してください。</p><button type="button" class="button button-secondary recipe-master-ai-button${state.recipeMasterAiLoading ? " is-loading" : ""}" id="recipe-master-ai-button" ${state.recipeMasterAiLoading ? "disabled" : ""}>${state.recipeMasterAiLoading ? "AIで下書き作成中..." : "AIで下書き作成"}</button></div>`;
  }
  const RECIPE_MASTER_AI_ENDPOINT = "/api/recipe-autofill";
  function readRecipeMasterAiErrorMessage(payload) {
    if (payload && typeof payload.error === "string" && payload.error.trim()) {
      return payload.error.trim();
    }
    return "AI入力に失敗しました。もう一度お試しください。";
  }
  async function callRecipeAutofillAI(recipeName) {
    const response = await fetch(RECIPE_MASTER_AI_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ recipeName })
    });
    let payload = null;
    try {
      payload = await response.json();
    } catch (_error) {
      payload = null;
    }
    if (!response.ok) {
      throw new Error(readRecipeMasterAiErrorMessage(payload));
    }
    if (!payload || typeof payload !== "object") {
      throw new Error("AI入力に失敗しました。もう一度お試しください。");
    }
    return payload;
  }
  function mergeRecipeMasterDraftWithAiResult(draft, aiResult) {
    const nextDraft = { ...(draft || createEmptyRecipeMasterDraft()) };
    const allowedCategories = new Set(["主食", "汁物", "主菜", "副菜", "デザート", "おやつ", "単品料理"]);
    const allowedCuisines = new Set(["和食", "洋食", "中華"]);
    const category = typeof aiResult?.category === "string" ? aiResult.category.trim() : "";
    const cuisine = typeof aiResult?.cuisine === "string" ? aiResult.cuisine.trim() : "";
    const description = typeof aiResult?.description === "string" ? aiResult.description.trim() : "";
    const notes = typeof aiResult?.notes === "string" ? aiResult.notes.trim() : "";
    const servingSize = Number(aiResult?.servingSize);
    const energy = Number(aiResult?.nutrition?.energy);
    const salt = Number(aiResult?.nutrition?.salt);
    const steps = Array.isArray(aiResult?.steps)
      ? aiResult.steps.map((step) => `${step || ""}`.trim()).filter(Boolean).join("\n")
      : (typeof aiResult?.steps === "string" ? aiResult.steps.trim() : "");
    const stringifyParts = (parts) => {
      if (Array.isArray(parts)) {
        return parts.map((item) => {
          if (typeof item === "string") return item.trim();
          if (!item || typeof item !== "object") return "";
          const label = `${item.label || item.name || item.food || ""}`.trim();
          const grams = Number(item.grams || item.amount || 0);
          const note = `${item.prep || item.step || item.note || ""}`.trim();
          const base = label ? `${label}${Number.isFinite(grams) && grams > 0 ? ` ${Math.round(grams)}g` : ""}` : "";
          return base ? `${base}${note ? ` / ${note}` : ""}` : "";
        }).filter(Boolean).join("\n");
      }
      return typeof parts === "string" ? parts.trim() : "";
    };
    const ingredients = stringifyParts(aiResult?.ingredients);
    const seasonings = stringifyParts(aiResult?.seasonings);
    return {
      ...nextDraft,
      category: allowedCategories.has(category) ? category : nextDraft.category,
      cuisine: allowedCuisines.has(cuisine) ? cuisine : nextDraft.cuisine,
      servingSize: Number.isFinite(servingSize) && servingSize > 0 ? `${Math.round(servingSize)}` : nextDraft.servingSize,
      description: description || nextDraft.description,
      notes: notes || nextDraft.notes,
      ingredients: ingredients || nextDraft.ingredients,
      seasonings: seasonings || nextDraft.seasonings,
      steps: steps || nextDraft.steps,
      energy: Number.isFinite(energy) ? `${Math.round(energy)}` : nextDraft.energy,
      salt: Number.isFinite(salt) ? `${Math.round(salt * 10) / 10}` : nextDraft.salt
    };
  }
  function renderRecipeMasterCreatePanel() {
    const draft = state.recipeMasterDraft || createEmptyRecipeMasterDraft();
    const categoryOptions = ["主食", "汁物", "主菜", "副菜", "デザート", "おやつ", "単品料理"]
      .map((category) => `<option value="${escapeHtml(category)}" ${draft.category === category ? "selected" : ""}>${escapeHtml(category)}</option>`)
      .join("");
    const cuisineOptions = ["和食", "洋食", "中華"]
      .map((cuisine) => `<option value="${escapeHtml(cuisine)}" ${draft.cuisine === cuisine ? "selected" : ""}>${escapeHtml(cuisine)}</option>`)
      .join("");
    return `<article class="card recipe-detail"><div class="sub-head"><div><p class="section-kicker">New Selected Recipe</p><h3>新しいメニューを追加</h3></div><span class="pill">customRecipes</span></div>${state.recipeMasterDraftError ? `<p class="recipe-master-form-error">${escapeHtml(state.recipeMasterDraftError)}</p>` : ""}<div class="recipe-master-form-grid"><label class="field"><span>料理名</span><input id="recipe-master-draft-name" data-recipe-master-draft="name" type="text" value="${escapeHtml(draft.name)}"></label><label class="field"><span>カテゴリ</span><select id="recipe-master-draft-category" data-recipe-master-draft="category">${categoryOptions}</select></label><label class="field"><span>cuisine</span><select id="recipe-master-draft-cuisine" data-recipe-master-draft="cuisine">${cuisineOptions}</select></label><label class="field"><span>1人前量</span><input id="recipe-master-draft-serving-size" data-recipe-master-draft="servingSize" type="number" min="1" step="1" value="${escapeHtml(draft.servingSize)}"></label><label class="field is-full"><span>提供方法</span><textarea id="recipe-master-draft-notes" data-recipe-master-draft="notes">${escapeHtml(draft.notes)}</textarea></label>${renderRecipeMasterPartEditor("ingredient", "食材", draft.ingredientRows || [])}${renderRecipeMasterPartEditor("seasoning", "調味料", draft.seasoningRows || [])}<div class="recipe-master-section-title">食品成分</div><label class="field"><span>エネルギー</span><input id="recipe-master-draft-energy" data-recipe-master-draft="energy" type="number" step="1" value="${escapeHtml(draft.energy)}"></label><label class="field"><span>たんぱく質</span><input id="recipe-master-draft-protein" data-recipe-master-draft="protein" type="number" step="0.1" value="${escapeHtml(draft.protein || "0")}"></label><label class="field"><span>脂質</span><input id="recipe-master-draft-fat" data-recipe-master-draft="fat" type="number" step="0.1" value="${escapeHtml(draft.fat || "0")}"></label><label class="field"><span>炭水化物</span><input id="recipe-master-draft-carbs" data-recipe-master-draft="carbs" type="number" step="0.1" value="${escapeHtml(draft.carbs || "0")}"></label><label class="field"><span>食物繊維</span><input id="recipe-master-draft-fiber" data-recipe-master-draft="fiber" type="number" step="0.1" value="${escapeHtml(draft.fiber || "0")}"></label><label class="field"><span>食塩相当量</span><input id="recipe-master-draft-salt" data-recipe-master-draft="salt" type="number" step="0.1" value="${escapeHtml(draft.salt)}"></label><label class="field is-full"><span>作業指示</span><textarea id="recipe-master-draft-steps" data-recipe-master-draft="steps">${escapeHtml(draft.steps)}</textarea></label></div><div class="recipe-master-form-actions"><button type="button" class="button button-secondary" id="recipe-master-cancel-button">キャンセル</button><button type="button" class="button button-primary" id="recipe-master-save-button">追加保存</button></div></article>`;
  }
  function getRecipeMasterFilteredRecipes(recipes, filterValue, searchValue) {
    const normalizedSearch = (searchValue || "").trim().toLocaleLowerCase("ja");
    const categoryFiltered = filterValue === "all"
      ? [...recipes]
      : recipes.filter((recipe) => recipe.category === filterValue);
    return categoryFiltered
      .filter((recipe) => !normalizedSearch || recipe.name.toLocaleLowerCase("ja").includes(normalizedSearch))
      .sort((a, b) => a.name.localeCompare(b.name, "ja"));
  }
  function renderRecipeMasterPanel(recipes) {
    const activeFilter = getRecipeMasterFilterValue();
    const searchValue = getRecipeMasterSearchValue();
    const searchInputValue = getRecipeMasterSearchInputValue();
    const filteredRecipes = getRecipeMasterFilteredRecipes(recipes, activeFilter, searchValue);
    const selectedRecipe = filteredRecipes.find((recipe) => recipe.id === state.selectedRecipeId) || null;
    const filterButtons = RECIPE_MASTER_FILTER_OPTIONS.map((option) => `<button type="button" class="button button-secondary recipe-master-filter-button ${option.value === activeFilter ? "is-active" : ""}" data-recipe-filter="${escapeHtml(option.value)}">${escapeHtml(option.label)}</button>`).join("");
    const searchField = `<div class="recipe-master-filter-search"><input id="recipe-master-search" class="recipe-master-search-input" type="search" placeholder="\u6599\u7406\u540d\u3067\u691c\u7d22" value="${escapeHtml(searchInputValue)}"></div>`;
    const addButton = `<div class="recipe-master-filter-actions"><button type="button" class="button button-primary recipe-master-add-button${state.adminRecipeMasterAddState ? ` is-${state.adminRecipeMasterAddState}` : ""}" id="recipe-master-add-button" ${selectedRecipe ? "" : "disabled"}>\u30e1\u30cb\u30e5\u30fc\u8ffd\u52a0</button></div>`;
    const renderRecipeCard = (recipe) => `<article class="recipe-card ${recipe.id === state.selectedRecipeId ? "is-active" : ""}" data-recipe-card="${recipe.id}"><div class="sub-head"><div><h3>${escapeHtml(recipe.name)}</h3><span class="tag">${escapeHtml(recipe.cuisine)} / ${escapeHtml(recipe.category)}</span></div><span class="pill">${formatNumber(recipe.nutrition.energy, 0)} kcal</span></div></article>`;
    const cuisineOrder = ["和食", "洋食", "中華"];
    const cuisineSections = cuisineOrder
      .map((cuisine) => ({
        cuisine,
        recipes: filteredRecipes.filter((recipe) => recipe.cuisine === cuisine)
      }))
      .filter((section) => section.recipes.length > 0);
    const otherCuisineRecipes = filteredRecipes.filter((recipe) => !cuisineOrder.includes(recipe.cuisine));
    if (otherCuisineRecipes.length) {
      cuisineSections.push({ cuisine: "その他", recipes: otherCuisineRecipes });
    }
    const recipeCards = filteredRecipes.length
      ? cuisineSections.map((section) => `<section class="recipe-master-cuisine-group"><div class="recipe-master-cuisine-heading">${escapeHtml(section.cuisine)}</div>${section.recipes.map(renderRecipeCard).join("")}</section>`).join("")
      : `<article class="card"><div class="empty-state">\u8a72\u5f53\u3059\u308b\u6599\u7406\u304c\u3042\u308a\u307e\u305b\u3093\u3002</div></article>`;
    const recipeDetail = state.recipeMasterMode === "create"
      ? renderRecipeMasterCreatePanel()
      : (selectedRecipe
        ? renderRecipeDetailPanel(selectedRecipe)
        : `<article class="card recipe-detail"><div class="empty-state">\u6599\u7406\u3092\u9078\u3076\u3068\u8a73\u7d30\u304c\u8868\u793a\u3055\u308c\u307e\u3059\u3002</div></article>`);
    return `<div class="section-head"><div><p class="section-kicker">Recipe Master</p><h2>\u6599\u7406\u4e00\u89a7</h2></div></div><div class="recipe-master-filter-bar">${filterButtons}${searchField}${addButton}</div><div class="detail-grid"><div class="recipe-list">${recipeCards}</div>${recipeDetail}</div>`;
  }
  function pickWeeklyEditorShuffleRecipe(recipes, currentValue, excludeIds = []) {
    if (!Array.isArray(recipes) || !recipes.length) {
      return currentValue || null;
    }
    const freshPool = recipes.filter((recipe) => recipe.id !== currentValue && !excludeIds.includes(recipe.id));
    if (freshPool.length) {
      return freshPool[Math.floor(Math.random() * freshPool.length)].id;
    }
    const relaxedPool = recipes.filter((recipe) => recipe.id !== currentValue);
    if (relaxedPool.length) {
      return relaxedPool[Math.floor(Math.random() * relaxedPool.length)].id;
    }
    return recipes[Math.floor(Math.random() * recipes.length)].id;
  }
  function buildWeeklyEditorShuffledDayMenuCandidate(dayMenu) {
    const recipes = getAllRecipes();
    const byCategory = (category) => recipes.filter((recipe) => recipe.category === category);
    const stapleRecipes = recipes.filter((recipe) => recipe.category === "主食" || recipe.category === "単品料理");
    const nextDayMenu = {
      ...dayMenu,
      basic: { ...dayMenu.basic },
      exception: { ...dayMenu.exception }
    };
    if (dayMenu.mode === "exception") {
      nextDayMenu.exception.singleDish = pickWeeklyEditorShuffleRecipe(stapleRecipes, dayMenu.exception.singleDish);
      nextDayMenu.exception.extraSoup = pickWeeklyEditorShuffleRecipe(byCategory("汁物"), dayMenu.exception.extraSoup);
      nextDayMenu.exception.extraSide = pickWeeklyEditorShuffleRecipe(byCategory("副菜"), dayMenu.exception.extraSide);
      nextDayMenu.exception.extraDessert = pickWeeklyEditorShuffleRecipe(byCategory("デザート"), dayMenu.exception.extraDessert);
      return nextDayMenu;
    }
    const usedIds = [];
    nextDayMenu.basic.staple = pickWeeklyEditorShuffleRecipe(stapleRecipes, dayMenu.basic.staple, usedIds);
    if (nextDayMenu.basic.staple) usedIds.push(nextDayMenu.basic.staple);
    nextDayMenu.basic.soup = pickWeeklyEditorShuffleRecipe(byCategory("汁物"), dayMenu.basic.soup, usedIds);
    if (nextDayMenu.basic.soup) usedIds.push(nextDayMenu.basic.soup);
    nextDayMenu.basic.main = pickWeeklyEditorShuffleRecipe(byCategory("主菜"), dayMenu.basic.main, usedIds);
    if (nextDayMenu.basic.main) usedIds.push(nextDayMenu.basic.main);
    nextDayMenu.basic.side1 = pickWeeklyEditorShuffleRecipe(byCategory("副菜"), dayMenu.basic.side1, usedIds);
    if (nextDayMenu.basic.side1) usedIds.push(nextDayMenu.basic.side1);
    nextDayMenu.basic.side2 = pickWeeklyEditorShuffleRecipe(byCategory("副菜"), dayMenu.basic.side2, usedIds);
    if (nextDayMenu.basic.side2) usedIds.push(nextDayMenu.basic.side2);
    nextDayMenu.basic.dessert = pickWeeklyEditorShuffleRecipe(byCategory("デザート"), dayMenu.basic.dessert, usedIds);
    nextDayMenu.snack = pickWeeklyEditorShuffleRecipe(byCategory("おやつ"), dayMenu.snack);
    return nextDayMenu;
  }
  function scoreWeeklyEditorShuffledDayMenu(dayMenu) {
    const evaluation = evaluateDayMenu(dayMenu);
    return getIntraDayOverlapPenalty(dayMenu)
      + (evaluation.structurePass ? 0 : 999999)
      + Math.abs(evaluation.totals.energy - 550) * 0.35
      + Math.max(0, evaluation.totals.salt - 3.0) * 120;
  }
  function buildWeeklyEditorShuffledDayMenu(dayMenu) {
    let bestMenu = null;
    let bestScore = Number.POSITIVE_INFINITY;
    for (let attempt = 0; attempt < 12; attempt += 1) {
      const candidate = buildWeeklyEditorShuffledDayMenuCandidate(dayMenu);
      const score = scoreWeeklyEditorShuffledDayMenu(candidate);
      if (score < bestScore) {
        bestScore = score;
        bestMenu = candidate;
      }
    }
    return bestMenu || buildWeeklyEditorShuffledDayMenuCandidate(dayMenu);
  }
  function applyWeeklyEditorShuffledDayMenu(dayKey, dayMenu) {
    const setInputValue = (selector, value) => {
      const input = document.querySelector(selector);
      if (input) {
        input.value = value || "";
      }
    };
    setInputValue(`[data-menu-day="${dayKey}"][data-menu-field="mode"]`, dayMenu.mode);
    setInputValue(`[data-menu-day="${dayKey}"][data-menu-mode="basic"][data-menu-field="staple"]`, dayMenu.basic.staple);
    setInputValue(`[data-menu-day="${dayKey}"][data-menu-mode="basic"][data-menu-field="soup"]`, dayMenu.basic.soup);
    setInputValue(`[data-menu-day="${dayKey}"][data-menu-mode="basic"][data-menu-field="main"]`, dayMenu.basic.main);
    setInputValue(`[data-menu-day="${dayKey}"][data-menu-mode="basic"][data-menu-field="side1"]`, dayMenu.basic.side1);
    setInputValue(`[data-menu-day="${dayKey}"][data-menu-mode="basic"][data-menu-field="side2"]`, dayMenu.basic.side2);
    setInputValue(`[data-menu-day="${dayKey}"][data-menu-mode="basic"][data-menu-field="dessert"]`, dayMenu.basic.dessert);
    setInputValue(`[data-menu-day="${dayKey}"][data-menu-mode="exception"][data-menu-field="singleDish"]`, dayMenu.exception.singleDish);
    setInputValue(`[data-menu-day="${dayKey}"][data-menu-mode="exception"][data-menu-field="extraSoup"]`, dayMenu.exception.extraSoup);
    setInputValue(`[data-menu-day="${dayKey}"][data-menu-mode="exception"][data-menu-field="extraSide"]`, dayMenu.exception.extraSide);
    setInputValue(`[data-menu-day="${dayKey}"][data-menu-mode="exception"][data-menu-field="extraDessert"]`, dayMenu.exception.extraDessert);
    setInputValue(`[data-menu-day="${dayKey}"][data-menu-field="snack"]`, dayMenu.snack);
    setInputValue(`[data-menu-day="${dayKey}"][data-menu-field="memo"]`, dayMenu.memo);
  }
  function renderWeeklyEditorPanel(week, recipes) {
    const byCategory = (category) => recipes.filter((recipe) => recipe.category === category).sort((a, b) => a.name.localeCompare(b.name, "ja"));
    const getWeeklyEditorStapleGroupLabel = (recipe) => {
      const name = recipe?.name || "";
      const rotationKey = recipe?.rotationKey || "";
      if (/(パン|サンド|トースト)/.test(name) || /パン/.test(rotationKey)) return "パン";
      if (/(うどん|そば|ラーメン|焼きそば|そうめん|パスタ|スパゲティ|ナポリタン|麺)/.test(name) || /(うどん|そば|ラーメン|焼きそば|パスタ|麺)/.test(rotationKey)) return "麺類";
      return "ご飯もの";
    };
    const groupWeeklyEditorStapleItems = (items) => {
      const grouped = new Map([["ご飯もの", []], ["麺類", []], ["パン", []]]);
      (items || []).forEach((recipe) => {
        const groupLabel = getWeeklyEditorStapleGroupLabel(recipe);
        grouped.get(groupLabel)?.push(recipe);
      });
      return [...grouped.entries()].map(([label, groupItems]) => ({
        label,
        items: groupItems.sort((a, b) => a.name.localeCompare(b.name, "ja"))
      }));
    };
    const getWeeklyEditorOptionLabel = (field, recipe) => {
      if (field === "snack" && recipe?.id === BIRTHDAY_SNACK_ID && isBirthdayWeek(state.settings.weekStart)) {
        return "誕生日のおやつ";
      }
      return recipe?.name || "";
    };
    const renderWeeklyEditorSlotOptions = (items, currentValue, field = "") => {
      if (!items?.length) return "";
      const isGrouped = Array.isArray(items) && items[0] && Array.isArray(items[0].items);
      if (!isGrouped) {
        return items.map((recipe) => `<option value="${recipe.id}" ${recipe.id === currentValue ? "selected" : ""}>${escapeHtml(getWeeklyEditorOptionLabel(field, recipe))}</option>`).join("");
      }
      return items.map((group) => `<optgroup label="${escapeHtml(group.label)}">${group.items.map((recipe) => `<option value="${recipe.id}" ${recipe.id === currentValue ? "selected" : ""}>${escapeHtml(getWeeklyEditorOptionLabel(field, recipe))}</option>`).join("")}</optgroup>`).join("");
    };
    const renderWeeklyEditorSlotSelect = (dayKey, mode, field, label, currentValue, items, optional = false) => `<label class="field">${label ? `<span>${label}</span>` : ""}<select data-menu-day="${dayKey}" data-menu-mode="${mode}" data-menu-field="${field}"><option value="">${optional ? "追加しない" : "選択してください"}</option>${renderWeeklyEditorSlotOptions(items, currentValue, field)}</select></label>`;
    const renderWeeklyEditorPlaceholderField = (label) => `<label class="field"><span>${label}</span><select disabled><option value="">選択してください</option></select></label>`;
    const settingsMarkup = `<div class="weekly-editor-settings"><div class="toolbar"><label class="field"><span>週の開始日</span><input id="admin-week-start" type="date" value="${escapeHtml(state.settings.weekStart)}"></label><label class="field"><span>誕生日週ルールを第3週に適用</span><input id="admin-birthday-week" type="checkbox" ${isBirthdayRuleEnabled() ? "checked" : ""}></label></div><p class="print-note">3週目ルール ${isThirdWeekRuleWeek(state.settings.weekStart) ? "適用中: 主食はお赤飯" : "対象外"} / 誕生日週ルール ${!isBirthdayRuleEnabled() ? "OFF" : (isThirdWeekRuleWeek(state.settings.weekStart) ? "適用中: 第3週のため お赤飯 + ケーキ" : "待機中: 第3週のみ適用")}</p></div>`;
    const cards = WEEKDAY_KEYS.map((dayKey) => {
      const dayMenu = week[dayKey];
      const stapleItems = groupWeeklyEditorStapleItems(recipes.filter((recipe) => recipe.category === "主食" || recipe.category === "単品料理"));
      const unifiedFields = dayMenu.mode === "basic"
        ? `${renderWeeklyEditorSlotSelect(dayKey, "basic", "staple", "主食", dayMenu.basic.staple, stapleItems)}${renderWeeklyEditorSlotSelect(dayKey, "basic", "soup", "汁物", dayMenu.basic.soup, byCategory("汁物"))}${renderWeeklyEditorSlotSelect(dayKey, "basic", "main", "主菜", dayMenu.basic.main, byCategory("主菜"))}${renderWeeklyEditorSlotSelect(dayKey, "basic", "side1", "副菜1", dayMenu.basic.side1, byCategory("副菜"))}${renderWeeklyEditorSlotSelect(dayKey, "basic", "side2", "副菜2", dayMenu.basic.side2, byCategory("副菜"))}${renderWeeklyEditorSlotSelect(dayKey, "basic", "dessert", "デザート", dayMenu.basic.dessert, byCategory("デザート"))}`
        : `${renderWeeklyEditorSlotSelect(dayKey, "exception", "singleDish", "主食", dayMenu.exception.singleDish, stapleItems)}${renderWeeklyEditorSlotSelect(dayKey, "exception", "extraSoup", "汁物", dayMenu.exception.extraSoup, byCategory("汁物"), true)}${renderWeeklyEditorPlaceholderField("主菜")}${renderWeeklyEditorSlotSelect(dayKey, "exception", "extraSide", "副菜1", dayMenu.exception.extraSide, byCategory("副菜"), true)}${renderWeeklyEditorPlaceholderField("副菜2")}${renderWeeklyEditorSlotSelect(dayKey, "exception", "extraDessert", "デザート", dayMenu.exception.extraDessert, byCategory("デザート"), true)}`;
      return `<article class="menu-card weekly-editor-day-card" data-weekly-card="${dayKey}"><div class="weekly-editor-day-head"><div class="weekly-editor-day-meta"><div><p class="section-kicker">${WEEKDAY_LABELS[dayKey]}曜日</p><h3>${formatDate(dayMenu.date)}</h3></div><div class="weekly-editor-day-actions"><button type="button" class="button button-secondary weekly-editor-save-button${state.adminWeeklySavedDayKey === dayKey ? " is-saving-day" : ""}" data-save-day="${dayKey}">保存</button><button type="button" class="button button-secondary weekly-editor-shuffle-button" data-shuffle-day="${dayKey}">シャッフル</button></div></div><input type="hidden" data-menu-day="${dayKey}" data-menu-field="mode" value="${escapeHtml(dayMenu.mode)}"></div><div class="weekly-editor-card-body"><section class="weekly-editor-card-section"><div class="weekly-editor-fields">${unifiedFields}</div></section><section class="weekly-editor-card-section"><p class="weekly-editor-section-title">3時のおやつ</p><div class="weekly-editor-fields">${renderWeeklyEditorSlotSelect(dayKey, "snack", "snack", "", dayMenu.snack, byCategory("おやつ"))}</div></section><section class="weekly-editor-card-section"><p class="weekly-editor-section-title">メモ</p><label class="field"><textarea data-menu-day="${dayKey}" data-menu-field="memo">${escapeHtml(dayMenu.memo || "")}</textarea></label></section></div></article>`;
    }).join("");
    return `<div class="section-head weekly-editor-head"><div><p class="section-kicker">Weekly Editor</p><h2>5日分献立編集</h2></div>${settingsMarkup}</div><div class="weekly-editor-scroll"><div class="weekly-editor-card-grid">${cards}</div></div>`;
  }
  function bindWeeklyEditorPanelEvents() {
    document.querySelector('#admin-week-start')?.addEventListener('change', (event) => { state.settings.weekStart = event.target.value || mondayString(new Date()); ensureWeekExists(state.settings.weekStart); saveStorage(STORAGE_KEYS.settings, state.settings); renderAll(); });
    document.querySelector('#admin-birthday-week')?.addEventListener('change', (event) => { setBirthdayWeekRuleEnabled(event.target.checked); saveStorage(STORAGE_KEYS.settings, state.settings); renderAll(); });
    Array.from(document.querySelectorAll('[data-save-day]')).forEach((button) => {
      button.addEventListener('click', () => {
        const dayKey = button.dataset.saveDay;
        if (!dayKey) return;
        state.adminWeeklySavedDayKey = dayKey;
        const scheduleDaySaveFlashClear = () => {
          if (state.adminWeeklySavedDayTimer) {
            window.clearTimeout(state.adminWeeklySavedDayTimer);
          }
          state.adminWeeklySavedDayTimer = window.setTimeout(() => {
            state.adminWeeklySavedDayKey = null;
            state.adminWeeklySavedDayTimer = null;
            renderAdminView();
          }, 500);
        };
        const currentWeek = getWeekMenus(state.settings.weekStart);
        const draftWeek = collectWeekDraftFromDom();
        currentWeek[dayKey] = draftWeek[dayKey];
        const validatedWeek = finalizeWeekForSave(state.settings.weekStart, currentWeek, false);
        if (!validatedWeek) {
          renderAll();
          scheduleDaySaveFlashClear();
          return;
        }
        state.weeklyMenus[state.settings.weekStart] = validatedWeek;
        syncMenuHistoryStorage();
        saveStorage(STORAGE_KEYS.weeklyMenus, state.weeklyMenus);
        saveStorage(STORAGE_KEYS.settings, state.settings);
        renderAll();
        scheduleDaySaveFlashClear();
      });
    });
    Array.from(document.querySelectorAll('[data-shuffle-day]')).forEach((button) => {
      button.addEventListener('click', () => {
        const dayKey = button.dataset.shuffleDay;
        if (!dayKey) return;
        const draftWeek = collectWeekDraftFromDom();
        const currentDayMenu = draftWeek[dayKey];
        if (!currentDayMenu) return;
        const nextDayMenu = buildWeeklyEditorShuffledDayMenu(currentDayMenu);
        applyWeeklyEditorShuffledDayMenu(dayKey, nextDayMenu);
      });
    });
  }
  function syncWeeklyEditorModeCards() {}
  const previousRenderAdminViewForRecipeMaster = renderAdminView;
  renderAdminView = function () {
    const originalBindAdminViewEvents = bindAdminViewEvents;
    bindAdminViewEvents = function () {};
    try {
      previousRenderAdminViewForRecipeMaster();
    } finally {
      bindAdminViewEvents = originalBindAdminViewEvents;
    }
    const recipeMasterPanel = Array.from(elements.adminView.querySelectorAll(".panel")).find((panel) => panel.querySelector(".section-kicker")?.textContent?.trim() === "Recipe Master");
    if (recipeMasterPanel) {
      recipeMasterPanel.innerHTML = renderRecipeMasterPanel(getAllRecipes());
    }
    const foodMasterPanel = Array.from(elements.adminView.querySelectorAll(".panel")).find((panel) => panel.querySelector(".section-kicker")?.textContent?.trim() === "Food Master");
    if (foodMasterPanel) {
      foodMasterPanel.remove();
    }
    const adminPanel = Array.from(elements.adminView.querySelectorAll(".panel")).find((panel) => panel.querySelector(".section-kicker")?.textContent?.trim() === "Admin");
    const weeklyEditorPanel = Array.from(elements.adminView.querySelectorAll(".panel")).find((panel) => panel.querySelector(".section-kicker")?.textContent?.trim() === "Weekly Editor");
    if (adminPanel && weeklyEditorPanel) {
      const weeklyHead = weeklyEditorPanel.querySelector(".section-head");
      const settingsToolbar = adminPanel.querySelector(".toolbar");
      const settingsNote = adminPanel.querySelector(".print-note");
      if (weeklyHead && settingsToolbar) {
        const settingsWrap = document.createElement("div");
        settingsWrap.className = "weekly-editor-settings";
        settingsWrap.appendChild(settingsToolbar);
        if (settingsNote) {
          settingsWrap.appendChild(settingsNote);
        }
        weeklyHead.classList.add("weekly-editor-head");
        weeklyHead.appendChild(settingsWrap);
      }
      adminPanel.remove();
    }
    bindAdminViewEvents();
  };
  const previousRenderAdminViewForWeeklyEditor = renderAdminView;
  renderAdminView = function () {
    previousRenderAdminViewForWeeklyEditor();
    const weeklyEditorPanel = Array.from(elements.adminView.querySelectorAll(".panel")).find((panel) => panel.querySelector(".section-kicker")?.textContent?.trim() === "Weekly Editor");
    if (weeklyEditorPanel) {
      weeklyEditorPanel.classList.add("weekly-editor-panel");
      weeklyEditorPanel.innerHTML = renderWeeklyEditorPanel(getWeekMenus(state.settings.weekStart), getAllRecipes());
      bindWeeklyEditorPanelEvents();
      syncWeeklyEditorModeCards();
    }
  };
  const RESTORED_RESIDENT_CARD_STYLE = `
    .resident-friendly-panel { padding:18px; }
    .resident-board-shell {
      position:relative;
      overflow:hidden;
      border-radius:32px;
      border:4px solid rgba(236, 191, 145, 0.88);
      background:
        radial-gradient(circle at top left, rgba(255, 223, 182, 0.35), transparent 26%),
        linear-gradient(180deg, rgba(255, 252, 247, 0.98), rgba(255, 247, 240, 0.96));
      padding:18px 18px 14px;
    }
    .resident-board-shell::before {
      content:"";
      position:absolute;
      inset:0;
      pointer-events:none;
      background:
        radial-gradient(circle at 8% 14%, rgba(255, 224, 198, 0.22), transparent 14%),
        radial-gradient(circle at 92% 84%, rgba(202, 224, 198, 0.2), transparent 15%);
    }
    .resident-board-header {
      position:relative;
      z-index:1;
      display:grid;
      justify-items:center;
      gap:10px;
      margin-bottom:14px;
      text-align:center;
    }
    .resident-board-kicker {
      margin:0;
      font-size:0.74rem;
      letter-spacing:0.24em;
      text-transform:uppercase;
      color:#a96a43;
      font-weight:700;
    }
    .resident-board-titleline {
      display:flex;
      align-items:center;
      justify-content:center;
      gap:12px;
      flex-wrap:wrap;
    }
    .resident-board-title {
      margin:0;
      font-size:clamp(2rem, 3vw, 2.8rem);
      line-height:1.08;
      letter-spacing:-0.03em;
      font-weight:800;
      color:#d1733f;
    }
    .resident-board-icon {
      width:28px;
      height:28px;
      color:#e6a047;
      opacity:0.9;
      flex:0 0 auto;
    }
    .resident-board-range {
      display:inline-flex;
      align-items:center;
      justify-content:center;
      min-height:42px;
      padding:8px 18px;
      border-radius:999px;
      background:#dc7e42;
      color:#fff8f2;
      font-size:1.02rem;
      font-weight:800;
      letter-spacing:0.01em;
      box-shadow:0 10px 24px rgba(182, 112, 59, 0.16);
    }
    .resident-cards-stack {
      position:relative;
      z-index:1;
      display:grid;
      gap:10px;
    }
    .resident-day-card {
      display:grid;
      grid-template-columns:108px 94px minmax(0, 1fr);
      align-items:stretch;
      min-height:132px;
      border-radius:28px;
      border:2px solid var(--resident-card-border, rgba(222, 175, 131, 0.88));
      background:var(--resident-card-bg, rgba(255, 248, 241, 0.96));
      overflow:hidden;
      box-shadow:0 8px 18px rgba(118, 77, 43, 0.06);
    }
    .resident-card-date {
      display:flex;
      flex-direction:column;
      align-items:center;
      justify-content:center;
      gap:4px;
      padding:14px 10px;
      background:rgba(255, 255, 255, 0.35);
      border-right:2px solid rgba(255, 255, 255, 0.72);
    }
    .resident-card-date .resident-day-date {
      display:block;
      font-size:0.95rem;
      font-weight:700;
      color:#6d5d51;
      line-height:1;
    }
    .resident-card-date .resident-day-weekday {
      display:block;
      font-size:3.2rem;
      font-weight:900;
      line-height:0.94;
      letter-spacing:-0.05em;
      color:var(--resident-accent, #b5614c);
    }
    .resident-card-metrics {
      display:grid;
      align-content:center;
      justify-items:center;
      gap:10px;
      padding:12px 8px;
      background:rgba(255, 255, 255, 0.42);
      border-right:2px dashed rgba(130, 110, 91, 0.18);
      text-align:center;
    }
    .resident-metric {
      display:grid;
      gap:2px;
      justify-items:center;
    }
    .resident-metric-value {
      font-size:1.05rem;
      line-height:1;
      font-weight:900;
      color:var(--resident-accent, #b5614c);
    }
    .resident-metric-label {
      font-size:0.68rem;
      line-height:1.1;
      font-weight:700;
      color:#6f6358;
      letter-spacing:0.06em;
    }
    .resident-metric-divider {
      width:34px;
      border-top:1px solid rgba(125, 108, 93, 0.28);
    }
    .resident-card-menu {
      display:grid;
      align-content:center;
      gap:10px;
      padding:16px 18px;
      min-width:0;
    }
    .resident-card-lunch {
      min-width:0;
    }
    .resident-card-items {
      display:flex;
      flex-wrap:wrap;
      align-items:center;
      gap:12px 16px;
      width:100%;
    }
    .resident-card-item {
      position:relative;
      padding-right:16px;
      font-size:1.34rem;
      line-height:1.32;
      font-weight:800;
      color:#3a2f28;
      letter-spacing:-0.02em;
      word-break:keep-all;
    }
    .resident-card-item:not(:last-child)::after {
      content:"";
      position:absolute;
      right:0;
      top:50%;
      transform:translateY(-50%);
      height:1.5em;
      border-right:2px solid rgba(136, 118, 101, 0.2);
    }
    .resident-card-snack {
      display:flex;
      align-items:center;
      gap:10px;
      min-width:0;
      padding:8px 12px;
      border-radius:14px;
      background:rgba(255, 255, 255, 0.54);
      border:1px solid rgba(160, 132, 103, 0.18);
    }
    .resident-card-snack-label {
      flex:0 0 auto;
      font-size:0.94rem;
      line-height:1.2;
      font-weight:800;
      color:#8d674f;
      letter-spacing:0.04em;
      white-space:nowrap;
    }
    .resident-card-snack-text {
      min-width:0;
      font-size:1.12rem;
      line-height:1.35;
      font-weight:700;
      color:#4c3d33;
      word-break:keep-all;
    }
    .resident-board-footer {
      position:relative;
      z-index:1;
      display:flex;
      align-items:center;
      justify-content:space-between;
      gap:14px;
      margin-top:10px;
      padding-top:10px;
      border-top:1px solid rgba(153, 124, 98, 0.16);
    }
    .resident-footer-mark {
      display:flex;
      align-items:center;
      gap:10px;
      color:#7e6b5b;
    }
    .resident-footer-mark svg {
      width:28px;
      height:28px;
      flex:0 0 auto;
      color:#e19a62;
    }
    .resident-footer-text {
      font-size:0.88rem;
      font-weight:700;
      color:#7a6758;
    }
    .resident-weekly-message {
      display:flex;
      align-items:center;
      gap:12px;
      min-width:0;
      flex:1 1 auto;
      margin-left:8px;
    }
    .resident-weekly-message-label {
      flex:0 0 auto;
      margin:0;
      font-size:1rem;
      font-weight:900;
      color:#8e6349;
      letter-spacing:0.04em;
      white-space:nowrap;
    }
    .resident-weekly-message-text {
      margin:0;
      min-width:0;
      font-size:1.06rem;
      line-height:1.55;
      font-weight:700;
      color:#4a3c33;
    }
    .resident-footer-app {
      font-size:0.74rem;
      font-weight:800;
      letter-spacing:0.14em;
      text-transform:uppercase;
      color:#ae876c;
      text-align:right;
    }
    @media (max-width:1120px) {
      .resident-day-card { grid-template-columns:90px 82px minmax(0, 1fr); }
      .resident-card-item { font-size:1.12rem; }
    }
    @media (max-width:760px) {
      .resident-board-shell { padding:14px 14px 12px; border-radius:24px; }
      .resident-board-title { font-size:1.8rem; }
      .resident-board-range { min-height:36px; padding:7px 14px; font-size:0.9rem; }
      .resident-day-card { grid-template-columns:1fr; min-height:unset; }
      .resident-card-date,
      .resident-card-metrics {
        border-right:0;
        border-bottom:1px dashed rgba(130, 110, 91, 0.18);
      }
      .resident-card-date { padding:12px 10px 10px; }
      .resident-card-date .resident-day-weekday { font-size:2.4rem; }
      .resident-card-metrics {
        grid-template-columns:1fr auto 1fr;
        gap:8px;
        padding:10px 12px;
      }
      .resident-metric-divider {
        width:1px;
        height:28px;
        border-top:0;
        border-left:1px solid rgba(125, 108, 93, 0.28);
      }
      .resident-card-menu { padding:12px 14px; }
      .resident-card-item { font-size:1.06rem; padding-right:12px; }
      .resident-card-snack {
        gap:8px;
        padding:7px 10px;
      }
      .resident-card-snack-label {
        font-size:0.84rem;
      }
      .resident-card-snack-text {
        font-size:0.98rem;
      }
      .resident-board-footer {
        flex-direction:column;
        align-items:flex-start;
      }
      .resident-weekly-message {
        width:100%;
        margin-left:0;
        flex-wrap:wrap;
        gap:8px;
      }
      .resident-weekly-message-label {
        font-size:0.9rem;
      }
      .resident-weekly-message-text {
        font-size:0.94rem;
        line-height:1.5;
      }
      .resident-footer-app { text-align:left; }
    }
    @media print {
      html:has(#resident-view.is-print-target),
      body:has(#resident-view.is-print-target) {
        width:auto !important;
      }

      body:has(#resident-view.is-print-target) .app-shell {
        width:100% !important;
      }

      @page resident-landscape { size:A4 landscape; margin:6mm; }

      #resident-view.is-print-target .resident-friendly-panel {
        page:resident-landscape;
        padding:0 !important;
        border:0;
        background:#fff;
        box-shadow:none;
        width:100%;
        max-width:none;
      }

      #resident-view.is-print-target .resident-board-shell {
        border-width:1.5pt;
        border-radius:16pt;
        min-height:0;
        padding:4.5mm 5mm 3.5mm;
        background:#fffdfa;
        break-inside:avoid;
        page-break-inside:avoid;
      }

      #resident-view.is-print-target .resident-board-header {
        gap:2mm;
        margin-bottom:2.8mm;
      }

      #resident-view.is-print-target .resident-board-kicker { font-size:7.4pt; }
      #resident-view.is-print-target .resident-board-title { font-size:20pt; }
      #resident-view.is-print-target .resident-board-icon { width:15pt; height:15pt; }

      #resident-view.is-print-target .resident-board-range {
        min-height:0;
        padding:2mm 7mm;
        font-size:10pt;
        box-shadow:none;
      }

      #resident-view.is-print-target .resident-cards-stack { gap:2mm; }

      #resident-view.is-print-target .resident-day-card {
        grid-template-columns:21mm 18mm minmax(0, 1fr);
        min-height:23.6mm;
        border-width:1pt;
        border-radius:12pt;
        box-shadow:none;
      }

      #resident-view.is-print-target .resident-card-date { padding:2.6mm 1.2mm; }
      #resident-view.is-print-target .resident-card-date .resident-day-date { font-size:8.9pt; }
      #resident-view.is-print-target .resident-card-date .resident-day-weekday { font-size:22pt; }

      #resident-view.is-print-target .resident-card-metrics {
        gap:1.3mm;
        padding:2.3mm 1.1mm;
      }

      #resident-view.is-print-target .resident-metric-value { font-size:9.2pt; }
      #resident-view.is-print-target .resident-metric-label { font-size:6.6pt; }

      #resident-view.is-print-target .resident-card-menu {
        gap:1.5mm;
        padding:2.2mm 2.6mm;
        overflow:hidden;
      }

      #resident-view.is-print-target .resident-card-lunch {
        min-width:0;
      }

      #resident-view.is-print-target .resident-card-items {
        gap:1mm 2.8mm;
        flex-wrap:nowrap;
      }

      #resident-view.is-print-target .resident-card-item {
        flex:0 0 auto;
        white-space:nowrap;
        font-size:11.3pt;
        line-height:1.08;
        padding-right:2.4mm;
      }

      #resident-view.is-print-target .resident-card-item:not(:last-child)::after {
        border-right-width:1pt;
      }

      #resident-view.is-print-target .resident-card-snack {
        gap:1.8mm;
        padding:1.3mm 1.8mm;
        border-radius:7pt;
      }

      #resident-view.is-print-target .resident-card-snack-label {
        padding:0.9mm 1.8mm;
        font-size:7.6pt;
        line-height:1;
      }

      #resident-view.is-print-target .resident-card-snack-text {
        font-size:8.6pt;
        line-height:1.15;
        font-weight:700;
      }

      #resident-view.is-print-target .resident-board-footer {
        margin-top:2.5mm;
        padding-top:2mm;
        display:grid;
        grid-template-columns:1fr auto 1fr;
        align-items:center;
        gap:0;
      }

      #resident-view.is-print-target .resident-footer-mark {
        grid-column:1;
        justify-self:start;
        display:flex;
        align-items:center;
        gap:6px;
      }
      #resident-view.is-print-target .resident-footer-mark svg { width:15pt; height:15pt; }

      #resident-view.is-print-target .resident-footer-text {
        font-size:7pt;
        font-weight:600;
        color:#8a7769;
      }

      #resident-view.is-print-target .resident-weekly-message {
        grid-column:2;
        justify-self:center;
        align-self:center;
        min-width:0;
        display:flex;
        align-items:baseline;
        justify-content:center;
        gap:10px;
        flex-wrap:wrap;
        text-align:center;
      }

      #resident-view.is-print-target .resident-weekly-message-label {
        font-size:16pt;
        font-weight:900;
        letter-spacing:0.03em;
        color:#845541;
      }

      #resident-view.is-print-target .resident-weekly-message-text {
        font-size:17.6pt;
        line-height:1.22;
        font-weight:700;
        color:#4b3e37;
      }

      #resident-view.is-print-target .resident-footer-app { display:none; }
    }
  `;
  if (!document.getElementById("resident-card-restore-style")) {
    const restoredResidentStyle = document.createElement("style");
    restoredResidentStyle.id = "resident-card-restore-style";
    restoredResidentStyle.textContent = RESTORED_RESIDENT_CARD_STYLE;
    document.head.append(restoredResidentStyle);
  }
  STORAGE_KEYS.residentWeeklyMessages = STORAGE_KEYS.residentWeeklyMessages || "nutrition-kun::resident-weekly-messages";
  STORAGE_KEYS.usedResidentMessages = STORAGE_KEYS.usedResidentMessages || "nutrition-kun::used-resident-messages";
  const RESIDENT_MESSAGE_CANDIDATES = {
    spring: [
      "春のやわらかな空気を感じながら、今週もお食事の時間をゆっくりお楽しみください。",
      "花の季節に心なごむひとときを添えられるよう、今週も昼食を整えました。",
      "新しい季節の明るさとともに、毎日の昼食時間を心地よくお過ごしください。",
      "春らしいやさしい陽気の中で、今週もお食事を楽しんでいただけましたらうれしいです。",
      "気持ちのよい春風を感じながら、今週もほっとできる昼食時間になりますように。",
      "やわらかな陽ざしに包まれる季節です。今週も昼食の時間を大切にお過ごしください。",
      "春の景色を眺めるように、今週もゆったりとした気持ちでお食事をお楽しみください。",
      "季節の移ろいを感じながら、今週もあたたかな昼食時間をお届けします。"
    ],
    earlySummer: [
      "新緑のさわやかさを感じながら、今週も気持ちよく昼食時間をお過ごしください。",
      "青葉の美しい季節です。今週もゆっくりとお食事を楽しんでいただけましたら幸いです。",
      "少しずつ初夏の空気を感じる頃、今週も心和む昼食時間になりますように。",
      "風の心地よい季節に合わせて、今週もやさしい昼食時間をお届けします。",
      "新しい緑がまぶしい季節です。今週も毎日の昼食を楽しみにしていただけましたらうれしいです。",
      "さわやかな季節の流れとともに、今週も穏やかな食事の時間をお過ごしください。",
      "初夏の明るい空気の中で、今週もおいしい昼食時間をゆっくりお楽しみください。",
      "みずみずしい季節の気配を感じながら、今週も心やすらぐ昼食をお届けします。"
    ],
    rainy: [
      "雨の日が続く季節ですが、今週も昼食の時間がほっとするひとときになりますように。",
      "しっとりとした季節の中でも、今週は心晴れやかにお食事を楽しんでいただけましたら幸いです。",
      "梅雨の時期だからこそ、毎日の昼食時間をゆったり気持ちよくお過ごしください。",
      "雨音に耳を傾けながら、今週も落ち着いた昼食時間をお楽しみください。",
      "季節の変わり目ですが、今週も無理なく穏やかにお食事を楽しんでいただけますように。",
      "やわらかな雨の季節に合わせて、今週も心なごむ昼食時間を整えました。",
      "しっとりした空気の中でも、昼食の時間があたたかなひとときになりますように。",
      "雨の多い時期ですので、今週も気持ちがやわらぐ昼食時間をお届けします。"
    ],
    summer: [
      "暑さのある季節ですので、今週も無理なくゆったりと昼食の時間をお過ごしください。",
      "日差しの強い日が続きます。今週も涼やかな気持ちでお食事を楽しんでいただけましたら幸いです。",
      "夏の気配が深まる頃、今週も心地よい昼食時間になりますように。",
      "暑い季節だからこそ、今週も落ち着いてお食事を楽しめる時間を大切にお届けします。",
      "夏空の明るさとともに、今週もゆっくりと昼食をお楽しみください。",
      "体調に気をつけたい季節です。今週も穏やかな気持ちで昼食時間をお過ごしください。",
      "夏の日差しの中でも、昼食の時間がほっとできるひとときになりますように。",
      "暑さを感じる毎日ですが、今週も無理なく楽しい昼食時間をお過ごしください。"
    ],
    autumn: [
      "実りの季節を感じながら、今週もゆったりと昼食の時間をお楽しみください。",
      "秋のやさしい空気の中で、今週も心なごむお食事時間をお届けします。",
      "少しずつ深まる季節とともに、今週も穏やかな昼食時間になりますように。",
      "秋らしい落ち着いた空気を感じながら、今週もお食事を楽しんでいただけましたら幸いです。",
      "実りの季節ならではのあたたかさを添えて、今週も昼食時間を整えました。",
      "過ごしやすい季節です。今週も毎日の昼食を楽しみにしていただけましたらうれしいです。",
      "秋の彩りを感じる頃、今週もゆっくりとした昼食時間をお過ごしください。",
      "穏やかな秋風とともに、今週もやさしい昼食時間をお届けします。"
    ],
    winter: [
      "寒さの深まる季節ですので、今週もあたたかな気持ちで昼食時間をお過ごしください。",
      "冷え込みやすい時期ですが、今週も心までほっとする昼食時間になりますように。",
      "冬の澄んだ空気の中で、今週もゆったりとお食事を楽しんでいただけましたら幸いです。",
      "寒い季節だからこそ、今週も落ち着いた昼食時間を大切にお届けします。",
      "あたたかい食事の時間が楽しみになるよう、今週もやさしい昼食を整えました。",
      "冬の日々を穏やかに過ごせるよう、今週も心なごむ昼食時間をお届けします。",
      "寒さに気をつけたい頃です。今週も無理なく楽しいお食事時間をお過ごしください。",
      "冬の静かな季節に寄り添いながら、今週もやさしい昼食時間になりますように。"
    ]
  };
  function getResidentMessageSeasonKey(weekStart) {
    const source = weekStart ? new Date(`${weekStart}T00:00:00`) : new Date();
    const month = source.getMonth() + 1;
    if (month >= 3 && month <= 4) return "spring";
    if (month === 5) return "earlySummer";
    if (month === 6) return "rainy";
    if (month >= 7 && month <= 8) return "summer";
    if (month >= 9 && month <= 11) return "autumn";
    return "winter";
  }
  function getResidentMessageCandidates(weekStart) {
    const seasonKey = getResidentMessageSeasonKey(weekStart);
    return RESIDENT_MESSAGE_CANDIDATES[seasonKey] || RESIDENT_MESSAGE_CANDIDATES.spring;
  }
  function getSavedResidentWeeklyMessages() {
    return loadStorage(STORAGE_KEYS.residentWeeklyMessages, {});
  }
  function saveResidentWeeklyMessages(messages) {
    saveStorage(STORAGE_KEYS.residentWeeklyMessages, messages);
  }
  function getUsedResidentMessages() {
    const list = loadStorage(STORAGE_KEYS.usedResidentMessages, []);
    return Array.isArray(list) ? list.filter(Boolean) : [];
  }
  function saveUsedResidentMessages(messages) {
    saveStorage(STORAGE_KEYS.usedResidentMessages, Array.from(new Set(messages.filter(Boolean))));
  }
  function buildGeneratedResidentMessage(weekStart, usedMessages) {
    const seasonKey = getResidentMessageSeasonKey(weekStart);
    const seasonPhrases = {
      spring: ["春のやわらかな空気を感じながら", "花の季節の明るさに包まれて", "春の陽ざしを感じながら"],
      earlySummer: ["新緑のさわやかさを感じながら", "初夏のやさしい風に包まれて", "青葉の季節を感じながら"],
      rainy: ["雨の季節の落ち着きとともに", "しっとりした空気を感じながら", "梅雨の穏やかな時間の中で"],
      summer: ["夏の明るい空気とともに", "暑さに気をつけながら", "夏の季節を感じながら"],
      autumn: ["秋のやさしい空気を感じながら", "実りの季節に寄り添って", "秋風の心地よさとともに"],
      winter: ["寒さの深まる季節ですので", "冬の静かな空気に包まれて", "冷え込みやすい頃ですので"]
    };
    const endings = [
      "今週も昼食の時間をゆっくりお楽しみください。",
      "今週も心なごむお食事時間をお過ごしください。",
      "今週も穏やかな気持ちでお食事を楽しんでいただけましたら幸いです。",
      "今週もほっとできる昼食時間になりますように。"
    ];
    const openings = seasonPhrases[seasonKey] || seasonPhrases.spring;
    for (const opening of openings) {
      for (const ending of endings) {
        const message = `${opening}、${ending}`;
        if (!usedMessages.includes(message)) {
          return message;
        }
      }
    }
    return `${openings[0]}、${endings[0]}`;
  }
  function getOrCreateResidentWeeklyMessage(weekStart) {
    const weeklyMessages = getSavedResidentWeeklyMessages();
    const usedMessages = getUsedResidentMessages();
    const existing = weeklyMessages[weekStart];
    if (existing) {
      if (!usedMessages.includes(existing)) {
        usedMessages.push(existing);
        saveUsedResidentMessages(usedMessages);
      }
      return existing;
    }
    const seasonalCandidates = getResidentMessageCandidates(weekStart);
    const unusedSeasonal = seasonalCandidates.find((message) => !usedMessages.includes(message));
    const globalCandidates = Object.values(RESIDENT_MESSAGE_CANDIDATES).flat();
    const unusedGlobal = globalCandidates.find((message) => !usedMessages.includes(message));
    const nextMessage = unusedSeasonal || unusedGlobal || buildGeneratedResidentMessage(weekStart, usedMessages);
    weeklyMessages[weekStart] = nextMessage;
    usedMessages.push(nextMessage);
    saveResidentWeeklyMessages(weeklyMessages);
    saveUsedResidentMessages(usedMessages);
    return nextMessage;
  }
  renderResidentView = function () {
    const week = getWeekMenus(state.settings.weekStart);
    const map = getRecipeMap();
    const weeklyMessage = getOrCreateResidentWeeklyMessage(state.settings.weekStart);
    const dayPalettes = [
      { bg: "rgba(255, 244, 241, 0.96)", border: "rgba(228, 158, 142, 0.88)", accent: "#ba5d4d" },
      { bg: "rgba(255, 247, 238, 0.96)", border: "rgba(232, 179, 121, 0.88)", accent: "#bc7640" },
      { bg: "rgba(244, 250, 239, 0.97)", border: "rgba(171, 204, 143, 0.9)", accent: "#5f8752" },
      { bg: "rgba(241, 247, 255, 0.97)", border: "rgba(143, 182, 224, 0.9)", accent: "#567aa5" },
      { bg: "rgba(255, 251, 233, 0.97)", border: "rgba(227, 204, 128, 0.9)", accent: "#a98a39" }
    ];
    const firstDay = week[WEEKDAY_KEYS[0]];
    const lastDay = week[WEEKDAY_KEYS[WEEKDAY_KEYS.length - 1]];
    const weekRange = `${formatDate(firstDay.date)}（${WEEKDAY_LABELS[WEEKDAY_KEYS[0]]}）〜 ${formatDate(lastDay.date)}（${WEEKDAY_LABELS[WEEKDAY_KEYS[WEEKDAY_KEYS.length - 1]]}）`;
    const headerLeftIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4.2"/><path d="M12 1.8v3.2M12 19v3.2M22.2 12H19M5 12H1.8M19.6 4.4l-2.2 2.2M6.6 17.4l-2.2 2.2M19.6 19.6l-2.2-2.2M6.6 6.6L4.4 4.4"/></svg>`;
    const headerRightIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 3v10"/><path d="M17 3v10"/><path d="M4.5 6.5h5M14.5 6.5h5"/><path d="M6 20c0-2.7 1.8-4.5 4-4.5h4c2.2 0 4 1.8 4 4.5"/><path d="M9.2 15.5h5.6"/></svg>`;
    const footerIcon = `<svg viewBox="0 0 32 32" fill="none" aria-hidden="true"><circle cx="16" cy="16" r="13" fill="#f6d7b9"/><path d="M10.5 12.5c1.2-1.3 2.5-2 3.9-2 1.5 0 2.7.8 3.7 2M10.5 19.2c1.5 1.8 3.3 2.8 5.5 2.8 2.3 0 4.1-1 5.5-2.8" stroke="#c87842" stroke-width="1.8" stroke-linecap="round"/><circle cx="12.2" cy="15.1" r="1.2" fill="#c87842"/><circle cx="19.8" cy="15.1" r="1.2" fill="#c87842"/><path d="M25.2 7.5c-1.3 2.8-3.4 4.5-6.3 5.2 1.2-2.4 3.3-4.2 6.3-5.2z" fill="#a9cd9a"/></svg>`;
    const cards = WEEKDAY_KEYS.map((dayKey, index) => {
      const dayMenu = week[dayKey];
      const evaluation = evaluateDayMenu(dayMenu);
      const palette = dayPalettes[index % dayPalettes.length];
      const lunchItems = [
        getResidentCellText(dayMenu, "staple", map),
        getResidentCellText(dayMenu, "soup", map),
        getResidentCellText(dayMenu, "main", map),
        getResidentCellText(dayMenu, "side1", map),
        getResidentCellText(dayMenu, "side2", map),
        getResidentCellText(dayMenu, "dessert", map)
      ].filter((value) => value && String(value).trim());
      const snackText = isBirthdayWeek(state.settings.weekStart) && dayMenu.snack === BIRTHDAY_SNACK_ID ? "誕生日のおやつ" : (map.get(dayMenu.snack)?.name || "調整中");
      const safeLunchItems = lunchItems.length ? lunchItems : ["調整中"];
      return `<article class="resident-day-card" style="--resident-card-bg:${palette.bg}; --resident-card-border:${palette.border}; --resident-accent:${palette.accent};"><div class="resident-card-date"><span class="resident-day-date">${formatDate(dayMenu.date)}</span><span class="resident-day-weekday">${WEEKDAY_LABELS[dayKey]}</span></div><div class="resident-card-metrics"><div class="resident-metric"><strong class="resident-metric-value">${formatNumber(evaluation.totals.energy, 0)}</strong><span class="resident-metric-label">kcal</span></div><div class="resident-metric-divider" aria-hidden="true"></div><div class="resident-metric"><strong class="resident-metric-value">${formatNumber(evaluation.totals.salt, 1)}g</strong><span class="resident-metric-label">塩分</span></div></div><div class="resident-card-menu"><div class="resident-card-lunch"><div class="resident-card-items">${safeLunchItems.map((item) => `<span class="resident-card-item">${escapeHtml(item)}</span>`).join("")}</div></div><div class="resident-card-snack"><span class="resident-card-snack-label">3時のおやつ</span><span class="resident-card-snack-text">${escapeHtml(snackText)}</span></div></div></article>`;
    }).join("");
    elements.residentView.innerHTML = `<article class="panel resident-friendly-panel"><div class="resident-board-shell"><header class="resident-board-header"><p class="resident-board-kicker">Resident Menu</p><div class="resident-board-titleline"><span class="resident-board-icon" aria-hidden="true">${headerLeftIcon}</span><h2 class="resident-board-title">今週の献立</h2><span class="resident-board-icon" aria-hidden="true">${headerRightIcon}</span></div><div class="resident-board-range">${weekRange}</div></header><div class="resident-cards-stack">${cards}</div><footer class="resident-board-footer"><div class="resident-footer-mark"><span aria-hidden="true">${footerIcon}</span><span class="resident-footer-text">もぐサポ君</span></div><div class="resident-weekly-message"><p class="resident-weekly-message-label">今週の一言</p><p class="resident-weekly-message-text">${escapeHtml(weeklyMessage)}</p></div><div class="resident-footer-app">MOGU SUPPORT PLANNER</div></footer></div></article>`;
  };
  const previousRenderViews = renderViews;
  renderViews = function () {
    previousRenderViews();
    const viewMap = {
      'resident-view': elements.residentView,
      'kitchen-view': elements.kitchenView,
      'admin-view': elements.adminView
    };
    Object.entries(viewMap).forEach(([viewId, view]) => {
      if (!view) return;
      const isActive = viewId === state.selectedView;
      const isPrintTarget = viewId === state.printTarget;
      view.classList.toggle('is-active', isActive);
      view.classList.toggle('is-print-target', isPrintTarget);
      view.style.display = isActive ? 'grid' : 'none';
    });
    Array.from(document.querySelectorAll('.nav-button[data-view]')).forEach((button) => {
      button.classList.toggle('is-active', button.dataset.view === state.selectedView);
    });
    console.log('[nav] renderViews', { selectedView: state.selectedView, printTarget: state.printTarget });
  };
  function bindTopNavigationButtons() {
    const activateView = (viewId, buttonName) => {
      state.selectedView = viewId;
      renderViews();
      console.log(`[nav] ${buttonName} clicked`, { selectedView: state.selectedView });
    };
    const printView = (viewId, buttonName) => {
      state.selectedView = viewId;
      state.printTarget = viewId;
      renderViews();
      console.log(`[nav] ${buttonName} clicked`, { selectedView: state.selectedView, printTarget: state.printTarget });
      window.setTimeout(() => window.print(), 0);
    };
    const residentButton = document.querySelector('.nav-button[data-view="resident-view"]');
    const kitchenButton = document.querySelector('.nav-button[data-view="kitchen-view"]');
    const adminButton = document.querySelector('.nav-button[data-view="admin-view"]');
    const residentPrintButton = document.querySelector('#print-resident-button');
    const kitchenPrintButton = document.querySelector('#print-kitchen-button');
    if (residentButton) residentButton.onclick = () => activateView('resident-view', '利用者向け献立表');
    if (kitchenButton) kitchenButton.onclick = () => activateView('kitchen-view', '調理室向け指示書');
    if (adminButton) adminButton.onclick = () => activateView('admin-view', '管理画面');
    if (residentPrintButton) residentPrintButton.onclick = () => printView('resident-view', '利用者向けを印刷');
    if (kitchenPrintButton) kitchenPrintButton.onclick = () => printView('kitchen-view', '調理室向けを印刷');
    activateView(state.selectedView || 'resident-view', '初期表示');
  }
  renderAll = function () {
    ensureWeekExists(state.settings.weekStart);
    syncMenuHistoryStorage();
    if (elements.heroWeekLabel) {
      elements.heroWeekLabel.textContent = `対象週 ${formatWeekLabel(state.settings.weekStart)}`;
    }
    if (typeof updateHeroSummary === 'function') updateHeroSummary();
    if (typeof renderViews === 'function') renderViews();
    renderResidentView();
    renderKitchenView();
    renderAdminView();
    bindTopNavigationButtons();
  };
  ensureWeekExists(state.settings.weekStart);
  syncSelectedRecipe();
  renderAll();
})();








