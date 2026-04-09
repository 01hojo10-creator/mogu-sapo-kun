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
  const EXTRA_STYLE = `
    .catalog-stats { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:12px; }
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
      return { foodId, grams, prep: meta, step: "", label: "" };
    }
    return {
      foodId,
      grams,
      prep: meta.prep || "",
      step: meta.step || "",
      label: meta.label || meta.name || ""
    };
  }
  function normalizePart(partItem) {
    if (!partItem) return null;
    return {
      foodId: partItem.foodId,
      grams: Number(partItem.grams || 0),
      prep: partItem.prep || "",
      step: partItem.step || "",
      label: partItem.label || partItem.name || ""
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
    recipes.push(...buildJapaneseSides(), ...buildWesternSides(), ...buildChineseSides(), ...buildExtraSides(), ...buildSingleDishes(), ...buildDesserts());
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
      return `<tr><td>${item.kind}</td><td><div>${escapeHtml(getFoodLabel(item))}</div>${note ? `<div class="muted">${escapeHtml(`${noteLabel}: ${note}`)}</div>` : ""}</td><td>${formatNumber(item.grams, 0)} g</td><td>${formatNumber(item.grams * servings, 0)} g</td></tr>`;
    }).join("");
    return `<table class="ingredient-table"><thead><tr><th>区分</th><th>材料・調味料</th><th>1人前</th><th>${servings}人分</th></tr></thead><tbody>${rows}</tbody></table>`;
  };
  renderMetricCards = function (nutrition, note) {
    return `<div class="metrics-grid six">${METRIC_META.map((item) => `<article class="metric-card"><span>${item.label}</span><strong>${formatNumber(nutrition[item.key], item.digits)} ${item.unit}</strong><small>${note}</small></article>`).join("")}</div>`;
  };
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
    return `<article class="card recipe-detail"><div class="sub-head"><div><p class="section-kicker">Selected Recipe</p><h3>${escapeHtml(recipe.name)}</h3></div><span class="pill">${escapeHtml(recipe.cuisine)} / ${escapeHtml(recipe.category)}</span></div><div class="tag-row"><span class="tag">rotation ${escapeHtml(recipe.rotationKey)}</span>${recipe.tags.map((tag) => `<span class="pill">${escapeHtml(tag)}</span>`).join("")}</div><p class="muted">1人前 ${formatNumber(recipe.servingSize, 0)} g / エネルギー ${formatNumber(recipe.nutrition.energy, 0)} kcal / 塩分 ${formatNumber(recipe.nutrition.salt, 1)} g</p>${recipe.notes ? `<p class="muted">${escapeHtml(recipe.notes)}</p>` : ""}<div class="stack">${renderIngredientTable(recipe, state.settings.kitchenServings)}${renderMetricCards(recipe.nutrition, "食品成分表ベース")}<div><h4>作業指示</h4><ol class="detail-list">${recipe.instructions.map((step) => `<li>${escapeHtml(step)}</li>`).join("")}</ol></div></div></article>`;
  };
  renderSlotSelect = function (dayKey, mode, field, label, currentValue, recipes, optional = false) {
    return `<label class="field"><span>${label}</span><select data-menu-day="${dayKey}" data-menu-mode="${mode}" data-menu-field="${field}"><option value="">${optional ? "追加しない" : "選択してください"}</option>${recipes.map((recipe) => `<option value="${recipe.id}" ${recipe.id === currentValue ? "selected" : ""}>${escapeHtml(recipe.name)} (${escapeHtml(recipe.cuisine)})</option>`).join("")}</select></label>`;
  };
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
    Array.from(document.querySelectorAll('[data-recipe-card]')).forEach((card) => { card.addEventListener('click', () => { state.selectedRecipeId = card.dataset.recipeCard; renderAdminView(); }); });
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
      createRecipe({ id: "snack-simple-yogurt", name: "ヨーグルト", category: "おやつ", cuisine: "洋食", servingSize: 80, rotationKey: "乳製品", tags: ["おやつ", "乳製品", "安価"], ingredients: [part("yogurt", 80)], seasonings: [], instructions: ["器に盛り付けて提供する。"] }),
      createRecipe({ id: "snack-simple-steamed", name: "蒸しパン", category: "おやつ", cuisine: "和食", servingSize: 72, rotationKey: "蒸しパン", tags: ["おやつ", "焼き菓子", "安価"], ingredients: [part("flour", 22), part("egg", 10), part("milk", 18)], seasonings: [part("sugar", 8), part("baking_powder", 1.5)], instructions: ["生地をよく混ぜる。", "やわらかく蒸して食べやすく切る。"] }),
      createRecipe({ id: "snack-simple-pudding", name: "プリン", category: "おやつ", cuisine: "洋食", servingSize: 85, rotationKey: "プリン", tags: ["おやつ", "プリン", "安価"], ingredients: [part("milk", 58), part("egg", 18)], seasonings: [part("sugar", 9)], instructions: ["牛乳、卵、砂糖を合わせる。", "やさしく加熱して冷やし固める。"] }),
      createRecipe({ id: "snack-simple-castella", name: "カステラ", category: "おやつ", cuisine: "和食", servingSize: 70, rotationKey: "焼き菓子", tags: ["おやつ", "和菓子", "焼き菓子", "安価"], ingredients: [part("flour", 24), part("egg", 20), part("milk", 8)], seasonings: [part("sugar", 12)], instructions: ["卵と砂糖を泡立てて生地を作る。", "しっとり焼いて食べやすく切る。"] }),
      createRecipe({ id: "snack-simple-dorayaki", name: "どら焼き", category: "おやつ", cuisine: "和食", servingSize: 74, rotationKey: "和菓子", tags: ["おやつ", "和菓子", "安価"], ingredients: [part("flour", 18), part("egg", 12), part("milk", 6), part("azuki_paste", 24)], seasonings: [part("sugar", 6), part("baking_powder", 1)], instructions: ["生地を焼き、こしあんをはさむ。", "食べやすいサイズで提供する。"] }),
      createRecipe({ id: "snack-simple-yokan", name: "水ようかん", category: "おやつ", cuisine: "和食", servingSize: 72, rotationKey: "和菓子", tags: ["おやつ", "和菓子", "やわらかい", "安価"], ingredients: [part("azuki_paste", 42)], seasonings: [part("sugar", 8), part("gelatin_powder", 1.5)], instructions: ["こしあんに甘みを整える。", "やわらかく冷やし固める。"] }),
      createRecipe({ id: "snack-simple-baum", name: "バウムクーヘン", category: "おやつ", cuisine: "洋食", servingSize: 68, rotationKey: "焼き菓子", tags: ["おやつ", "洋菓子", "焼き菓子"], ingredients: [part("flour", 24), part("egg", 16), part("milk", 10)], seasonings: [part("sugar", 8), part("butter", 2)], instructions: ["生地を薄く重ねて焼く。", "食べやすい厚さに切って提供する。"] }),
      createRecipe({ id: "snack-simple-rollcake", name: "ロールケーキ", category: "おやつ", cuisine: "洋食", servingSize: 76, rotationKey: "洋菓子", tags: ["おやつ", "洋菓子", "やわらかい"], ingredients: [part("flour", 18), part("egg", 16), part("milk", 14)], seasonings: [part("sugar", 8)], instructions: ["スポンジ生地を焼く。", "やわらかく巻いて切り分ける。"] }),
      createRecipe({ id: "snack-simple-chiffon", name: "シフォンケーキ", category: "おやつ", cuisine: "洋食", servingSize: 72, rotationKey: "洋菓子", tags: ["おやつ", "洋菓子", "やわらかい"], ingredients: [part("flour", 20), part("egg", 16), part("milk", 16)], seasonings: [part("sugar", 8), part("baking_powder", 1)], instructions: ["ふんわりした生地を作る。", "やわらかく焼いて提供する。"] }),
      createRecipe({ id: "snack-simple-amashoku", name: "甘食", category: "おやつ", cuisine: "和食", servingSize: 68, rotationKey: "焼き菓子", tags: ["おやつ", "焼き菓子", "安価"], ingredients: [part("flour", 24), part("egg", 10), part("milk", 14)], seasonings: [part("sugar", 9), part("baking_powder", 1)], instructions: ["甘めの生地を作る。", "やわらかく焼いて整える。"] }),
      createRecipe({ id: "snack-simple-waffle", name: "ワッフル", category: "おやつ", cuisine: "洋食", servingSize: 70, rotationKey: "焼き菓子", tags: ["おやつ", "洋菓子", "焼き菓子"], ingredients: [part("flour", 22), part("egg", 14), part("milk", 16)], seasonings: [part("sugar", 6), part("butter", 2), part("baking_powder", 1)], instructions: ["生地を混ぜる。", "やわらかめに焼いて提供する。"] }),
      createRecipe({ id: "snack-simple-minicake", name: "ミニケーキ", category: "おやつ", cuisine: "洋食", servingSize: 70, rotationKey: "洋菓子", tags: ["おやつ", "洋菓子"], ingredients: [part("flour", 18), part("egg", 14), part("milk", 16)], seasonings: [part("sugar", 8), part("baking_powder", 1)], instructions: ["小さめの生地を作る。", "しっとり焼いて切り分ける。"] })
    ];
    return [...simpleSnacks, ...generated];
  }

  const SPECIAL_MENU_RECIPES = [
    createRecipe({ id: "special-sekihan", name: "お赤飯", category: "主食", cuisine: "和食", servingSize: 150, rotationKey: "赤飯", tags: ["行事食"], ingredients: [part("rice", 130), part("soft_rice", 20)], seasonings: [part("sesame", 2), part("salt", 0.2)], instructions: ["食べやすく盛り付ける。"] })
  ];
  const SNACK_MASTER = buildSnackMaster();
  function buildRecipeDictionary() {
    const entry = (notes, servingSize, ingredients, seasonings, steps) => ({ notes, servingSize, ingredients, seasonings, steps });
    return {
      "west-staple-bread": entry("耳までやわらかく食べやすいサイズに整える。", 70,
        [part("bread", 70, { prep: "耳まで食べやすい大きさに切る" })], [],
        ["食べやすい大きさに切る。", "乾燥しないように配膳直前に盛り付ける。"]),
      "jp-staple-soft-rice": entry("水分を含ませ、まとまりやすい軟飯にする。", 150,
        [part("soft_rice", 150, { prep: "温かくほぐし、まとまりを確認する" })], [],
        ["だまをほぐして口当たりを整える。", "温かいうちに茶碗へ盛り付ける。"]),
      "cn-staple-porridge": entry("だしでやわらかく炊いた中華粥にする。", 170,
        [part("soft_rice", 140, { prep: "米粒をつぶしすぎないようにほぐす" })],
        [part("broth", 35, { step: "粥をのばすとき" }), part("salt", 0.2, { step: "仕上げ" })],
        ["軟飯にだしを加えてやわらかくのばす。", "塩で薄く味を整えて温かく盛り付ける。"]),
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
      "snack-simple-pudding": entry("卵と牛乳で作る基本のやわらかいプリン。", 85,
        [part("milk", 58, { prep: "冷たすぎない温度にする" }), part("egg", 18, { prep: "よく溶きほぐす" })],
        [part("sugar", 9, { step: "卵液に溶かす" })],
        ["牛乳、卵、砂糖を合わせてこす。", "弱火または湯せんでやさしく加熱し、冷やし固める。"]),
      "snack-simple-steamed": entry("しっとりやわらかく仕上げる基本の蒸しパン。", 72,
        [part("flour", 22, { prep: "ふるう" }), part("egg", 10, { prep: "よく溶きほぐす" }), part("milk", 18, { prep: "常温に戻す" })],
        [part("sugar", 8, { step: "生地に加える" }), part("baking_powder", 1.5, { step: "粉に混ぜる" })],
        ["粉類を合わせる。", "卵、牛乳、砂糖を加えて混ぜる。", "型に流し、やわらかく蒸し上げる。"]),
      "snack-simple-dorayaki": entry("しっとりした生地でこしあんをはさむ。", 74,
        [part("flour", 18, { prep: "ふるう" }), part("egg", 12, { prep: "よく溶きほぐす" }), part("milk", 6, { prep: "常温に戻す" }), part("azuki_paste", 24, { prep: "食べやすい量に分ける" })],
        [part("sugar", 6, { step: "生地に加える" }), part("baking_powder", 1, { step: "粉に混ぜる" })],
        ["粉類と卵、牛乳、砂糖を合わせて生地を作る。", "小さく焼いて冷ます。", "こしあんをはさんで提供する。"]),
      "snack-simple-castella": entry("卵の風味を生かしたしっとりしたカステラ。", 70,
        [part("flour", 24, { prep: "ふるう" }), part("egg", 20, { prep: "泡立てやすい温度にする" }), part("milk", 8, { prep: "常温に戻す" })],
        [part("sugar", 12, { step: "卵に加えて泡立てる" })],
        ["卵と砂糖を泡立てる。", "小麦粉と牛乳を加えて生地をまとめる。", "しっとり焼いて食べやすく切る。"]),
      "snack-simple-yokan": entry("口どけの良い水ようかんに仕上げる。", 72,
        [part("azuki_paste", 42, { prep: "なめらかにしておく" })],
        [part("sugar", 8, { step: "あんに加える" }), part("gelatin_powder", 1.5, { step: "温めた液に溶かす" })],
        ["こしあんに砂糖を加えてのばす。", "ゼラチンを加えて型に流し、やわらかく冷やし固める。"])
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
  const DEFAULT_WEEKLY_SNACK_IDS = ["snack-simple-pudding", "snack-simple-steamed", "snack-simple-castella", "snack-simple-dorayaki", "snack-simple-yokan"];
  const FORCED_SIDE_REPLACEMENT_IDS = {
    "2026-04-21": ["west-side-broccoli-salad", "west-side-cabbage-coleslaw", "west-side-carrot-glace"],
    "2026-04-24": ["cn-side-komatsuna-chinese", "cn-side-cabbage-vinegar", "cn-side-carrot-sweet"]
  };
  const FIXED_WEEK_SIDE2_IDS = {
    "2026-04-21": "west-side-broccoli-salad",
    "2026-04-24": "cn-side-komatsuna-chinese"
  };
  const BIRTHDAY_SNACK_ID = "snack-cake-peach";
  const SEKIHAN_ID = "special-sekihan";

  const previousRenderAll = renderAll;
  getAllRecipes = function () { return [...SPECIAL_MENU_RECIPES, ...EXPANDED_RECIPES, ...SNACK_MASTER, ...normalizeCustomRecipes(state.customRecipes || [])].map(applyRecipeDictionary); };
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
      if (!dayMenu.snack || usedSnackIds.has(dayMenu.snack) || !map.has(dayMenu.snack) || (!isBirthdayWeek(weekStart) && !isPreferredSnackRecipe(map.get(dayMenu.snack)))) {
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
    return WEEKDAY_KEYS.some((_, index) => {
      const date = new Date(addDays(weekStart, index));
      const day = date.getDate();
      return day >= 15 && day <= 21;
    });
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
    const context = { cuisineCounts: { 和食: 0, 洋食: 0, 中華: 0 }, recipeUseCount: new Map(), mainRotationCount: new Map(), sideRotationCount: new Map(), dessertRotationCount: new Map(), dessertFruitCount: new Map(), dessertBaseCount: new Map(), lastMainId: null, lastMainRotationKey: null, lastDessertRotationKey: null, lastDessertFruitTag: null, lastDessertBaseTag: null, lastSideRotationKeys: new Set(), freshFruitDessertCount: 0, usedSideIds: new Set(), usedSideNames: new Set(), usedSnackIds: new Set() };
    const birthdayWeek = isBirthdayWeek(weekStart);
    const thirdWeek = isThirdWeekRuleWeek(weekStart);
    const forcedStaple = getRecipeMap().get(SEKIHAN_ID) || null;
    const forcedSnack = getRecipeMap().get(BIRTHDAY_SNACK_ID) || null;
    const exceptionDays = birthdayWeek ? [] : [...WEEKDAY_KEYS].sort(() => Math.random() - 0.5).slice(0, 1);
    WEEKDAY_KEYS.forEach((dayKey, index) => {
      const date = addDays(weekStart, index);
      const targetCuisine = chooseTargetCuisine(context.cuisineCounts, index);
      const candidates = [];
      for (let i = 0; i < 70; i += 1) {
        const staple = birthdayWeek || thirdWeek ? forcedStaple : pickRecipeWithHistory(filterRecipesLocal({ category: "主食", cuisine: targetCuisine, minEnergy: 100, maxEnergy: 230 }), context, "staple", date);
        const soup = pickRecipeWithHistory(filterRecipesLocal({ category: "汁物", cuisine: targetCuisine, minEnergy: 15, maxEnergy: 90 }), context, "soup", date);
        const mainPool = filterRecipesLocal({ category: "主菜", cuisine: targetCuisine, minEnergy: 140, maxEnergy: 280 }).filter((recipe) => !birthdayWeek || recipe.tags.includes("人気") || recipe.tags.includes("チーズ") || recipe.tags.includes("照り焼き"));
        const main = pickRecipeWithHistory(mainPool, context, "main", date, { excludeMainRotation: context.lastMainRotationKey });
        const side1 = pickRecipeWithHistory(filterPoolByUsedSideNames(filterRecipesLocal({ category: "副菜", cuisine: targetCuisine, minEnergy: 20, maxEnergy: 110, excludeIds: [...context.usedSideIds] }), context), context, "side1", date);
        const side2 = pickSecondSideRecipe(targetCuisine, context, side1, (pool, pickOptions) => pickRecipeWithHistory(pool, context, "side2", date, pickOptions), { excludeIds: [...context.usedSideIds], date });
        const dessert = pickRecipeWithHistory(filterRecipesLocal({ category: "デザート", minEnergy: 35, maxEnergy: 120 }), context, "dessert", date, { excludeRotationKeys: new Set([context.lastDessertRotationKey].filter(Boolean)) });
        const snack = birthdayWeek ? forcedSnack : pickRecipeWithHistory(filterPreferredSnackRecipes(filterRecipesLocal({ category: "おやつ", minEnergy: 40, maxEnergy: 160, excludeIds: [...context.usedSnackIds] })), context, "snack", date);
        if (!(staple && soup && main && side1 && side2 && dessert && snack)) continue;
        if (side1.id === side2.id || side1.name === side2.name) continue;
        const menu = { date, mode: "basic", basic: { staple: staple.id, soup: soup.id, main: main.id, side1: side1.id, side2: side2.id, dessert: dessert.id }, exception: { singleDish: null, extraSoup: null, extraSide: null, extraDessert: null }, snack: snack.id, memo: birthdayWeek ? "お誕生日献立" : `${targetCuisine}中心の自動献立`, generatedByAuto: true };
        candidates.push({ menu, score: scoreMenu(menu, context, targetCuisine) + (birthdayWeek ? 20 : 0) });
      }
      if (!birthdayWeek) {
        for (let i = 0; i < 20; i += 1) {
          const singleDish = pickRecipeWithHistory(filterRecipesLocal({ category: "単品料理", cuisine: targetCuisine, minEnergy: 320, maxEnergy: 520 }), context, "main", date, { excludeMainRotation: context.lastMainRotationKey });
          const snack = pickRecipeWithHistory(filterPreferredSnackRecipes(filterRecipesLocal({ category: "おやつ", minEnergy: 40, maxEnergy: 160, excludeIds: [...context.usedSnackIds] })), context, "snack", date);
          if (!(singleDish && snack)) continue;
          const exceptionCuisine = singleDish.cuisine;
          let extraSoup = null;
          let extraSide = null;
          let extraDessert = null;
          if (singleDish.nutrition.energy < 470) {
            extraSide = pickRecipeWithHistory(filterRecipesLocal({ category: "副菜", cuisine: exceptionCuisine, minEnergy: 25, maxEnergy: 90, excludeIds: [...context.usedSideIds] }), context, "side1", date);
            extraDessert = pickRecipeWithHistory(filterRecipesLocal({ category: "デザート", minEnergy: 40, maxEnergy: 110 }), context, "dessert", date);
          } else if (singleDish.nutrition.energy < 520) {
            extraDessert = pickRecipeWithHistory(filterRecipesLocal({ category: "デザート", minEnergy: 35, maxEnergy: 90 }), context, "dessert", date);
          }
          if (singleDish.nutrition.salt < 2.2) extraSoup = pickRecipeWithHistory(filterRecipesLocal({ category: "汁物", cuisine: exceptionCuisine, minEnergy: 15, maxEnergy: 70 }), context, "soup", date);
          const menu = { date, mode: "exception", basic: { staple: null, soup: null, main: null, side1: null, side2: null, dessert: null }, exception: { singleDish: singleDish.id, extraSoup: extraSoup?.id || null, extraSide: extraSide?.id || null, extraDessert: extraDessert?.id || null }, snack: snack.id, memo: `${targetCuisine}中心の例外献立`, generatedByAuto: true };
          if (exceptionDays.includes(dayKey)) candidates.push({ menu, score: scoreMenu(menu, context, targetCuisine) - 8 });
        }
      }
      const best = candidates.filter(Boolean).sort((a, b) => b.score - a.score)[0];
      week[dayKey] = best ? best.menu : createEmptyWeekMenu(weekStart)[dayKey];
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
      return `<article class="panel kitchen-day-sheet page-print-break"><div class="section-head"><div><p class="section-kicker">${WEEKDAY_LABELS[dayKey]}曜日</p><h2>${formatDate(dayMenu.date)} 調理室向け指示書</h2></div><p class="section-note">食数 ${state.settings.kitchenServings}食 / 昼食エネルギー ${formatNumber(evaluation.totals.energy, 0)} kcal / 塩分 ${formatNumber(evaluation.totals.salt, 1)} g</p></div><div class="kitchen-page-stack"><div class="kitchen-day-meta"><table class="kitchen-summary-table"><tbody>${summaryRows}</tbody></table>${renderMetricCards(evaluation.totals, "昼食全体")}</div><div class="check-grid">${renderConditionCards(evaluation)}</div><table class="kitchen-day-table"><thead><tr><th>献立枠</th><th>料理名</th><th>1人前量</th><th>材料</th><th>調味料</th><th>作業指示</th><th>栄養価</th></tr></thead><tbody>${recipeRows}</tbody></table></div></article>`;
    }).join("");
    elements.kitchenView.innerHTML = `<article class="panel kitchen-intro"><div class="section-head"><div><p class="section-kicker">Kitchen Sheets</p><h2>調理師向け 5日分指示書</h2></div><p class="section-note">印刷時は1日ごとにA4 1ページで改ページし、昼食全体と3時のおやつを1枚にまとめます。</p></div><p class="print-note">1ページの中に、主食、汁物、主菜、副菜1、副菜2、デザート、3時のおやつ、材料、調味料、1人前量、作業指示、栄養価、塩分、条件判定を表示します。</p></article>${sheets}`;
  };
  renderAdminView = function () {
    const week = getWeekMenus(state.settings.weekStart); const recipes = getAllRecipes(); const foods = getAllFoods(); const selectedRecipe = recipes.find((recipe) => recipe.id === state.selectedRecipeId) || null; const catalog = summarizeCatalog(recipes); const byCategory = (category) => recipes.filter((recipe) => recipe.category === category).sort((a, b) => a.name.localeCompare(b.name, 'ja'));
    const historyCount = Object.keys(state.menuHistory || {}).length;
    const editorCards = WEEKDAY_KEYS.map((dayKey) => { const dayMenu = week[dayKey]; const evaluation = evaluateDayMenu(dayMenu); return `<article class="menu-card"><div class="sub-head"><div><p class="section-kicker">${WEEKDAY_LABELS[dayKey]}曜日</p><h3>${formatDate(dayMenu.date)}</h3></div><span class="pill">${dayMenu.mode === "basic" ? "通常献立" : "例外献立"}</span></div><div class="stack"><label class="field"><span>献立タイプ</span><select data-menu-day="${dayKey}" data-menu-field="mode"><option value="basic" ${dayMenu.mode === "basic" ? "selected" : ""}>通常献立</option><option value="exception" ${dayMenu.mode === "exception" ? "selected" : ""}>例外献立</option></select></label><div class="grid-two">${renderSlotSelect(dayKey, "basic", "staple", "主食", dayMenu.basic.staple, byCategory("主食"))}${renderSlotSelect(dayKey, "basic", "soup", "汁物", dayMenu.basic.soup, byCategory("汁物"))}${renderSlotSelect(dayKey, "basic", "main", "主菜", dayMenu.basic.main, byCategory("主菜"))}${renderSlotSelect(dayKey, "basic", "side1", "副菜1", dayMenu.basic.side1, byCategory("副菜"))}${renderSlotSelect(dayKey, "basic", "side2", "副菜2", dayMenu.basic.side2, byCategory("副菜"))}${renderSlotSelect(dayKey, "basic", "dessert", "デザート", dayMenu.basic.dessert, byCategory("デザート"))}</div><div class="grid-two">${renderSlotSelect(dayKey, "exception", "singleDish", "単品料理", dayMenu.exception.singleDish, byCategory("単品料理"))}${renderSlotSelect(dayKey, "exception", "extraSoup", "追加汁物", dayMenu.exception.extraSoup, byCategory("汁物"), true)}${renderSlotSelect(dayKey, "exception", "extraSide", "追加副菜", dayMenu.exception.extraSide, byCategory("副菜"), true)}${renderSlotSelect(dayKey, "exception", "extraDessert", "追加デザート", dayMenu.exception.extraDessert, byCategory("デザート"), true)}</div><div class="grid-two">${renderSlotSelect(dayKey, "snack", "snack", "3時のおやつ", dayMenu.snack, byCategory("おやつ"))}</div><label class="field"><span>メモ</span><textarea data-menu-day="${dayKey}" data-menu-field="memo">${escapeHtml(dayMenu.memo || "")}</textarea></label><div class="check-grid">${renderConditionCards(evaluation)}</div></div></article>`; }).join("");
    elements.adminView.innerHTML = `<article class="panel"><div class="section-head"><div><p class="section-kicker">Admin</p><h2>管理画面</h2></div><p class="section-note">3週間重複禁止、毎月3週目のお赤飯、誕生日週ルール、3時のおやつを含めて自動生成します。履歴参照件数 ${historyCount} 件 / repeatBlockDays ${state.settings.repeatBlockDays} 日です。</p></div><div class="toolbar"><label class="field"><span>週の開始日</span><input id="admin-week-start" type="date" value="${escapeHtml(state.settings.weekStart)}"></label><label class="field"><span>調理人数</span><input id="admin-kitchen-servings" type="number" min="1" step="1" value="${escapeHtml(state.settings.kitchenServings)}"></label><label class="field"><span>誕生日週ルールを第3週に適用</span><input id="admin-birthday-week" type="checkbox" ${isBirthdayRuleEnabled() ? "checked" : ""}></label><button type="button" class="button button-primary" id="auto-generate-button">自動で5日分の献立を作成</button><button type="button" class="button button-secondary" id="regenerate-week-button">5日分を再生成</button><button type="button" class="button button-secondary" id="save-week-button">この週を保存</button></div><p class="print-note">3週目ルール ${isThirdWeekRuleWeek(state.settings.weekStart) ? "適用中: 主食はお赤飯固定" : "対象外"} / 誕生日週ルール ${!isBirthdayRuleEnabled() ? "OFF" : (isThirdWeekRuleWeek(state.settings.weekStart) ? "適用中: 第3週のため お赤飯 + ケーキ" : "待機中: 第3週のみ適用")}</p></article><article class="panel"><div class="section-head"><div><p class="section-kicker">Catalog</p><h2>料理マスタ概要</h2></div><p class="section-note">和食・洋食・中華に加え、おやつ約100種類を追加し、履歴を見ながら重複を抑えます。</p></div><div class="catalog-stats"><article class="metric-card"><span>総料理数</span><strong>${catalog.total}</strong><small>自動献立対象</small></article><article class="metric-card"><span>和食 / 洋食 / 中華</span><strong>${catalog.byCuisine["和食"]} / ${catalog.byCuisine["洋食"]} / ${catalog.byCuisine["中華"]}</strong><small>料理候補数</small></article><article class="metric-card"><span>副菜数</span><strong>${catalog.byCategory["副菜"]}</strong><small>偏り回避に使用</small></article><article class="metric-card"><span>デザート / おやつ</span><strong>${catalog.byCategory["デザート"]} / ${catalog.byCategory["おやつ"]}</strong><small>3週間重複禁止対象</small></article></div></article><article class="panel"><div class="section-head"><div><p class="section-kicker">Weekly Editor</p><h2>5日分献立編集</h2></div><p class="section-note">自動生成後も、月曜から金曜までと3時のおやつを個別に上書きできます。</p></div><div class="weekly-grid">${editorCards}</div></article><article class="panel"><div class="section-head"><div><p class="section-kicker">Recipe Master</p><h2>料理一覧</h2></div><p class="section-note">料理を選ぶと、cuisine、材料、調味料、1人前量、総量、作業指示、栄養価を確認できます。</p></div><div class="detail-grid"><div class="recipe-list">${recipes.map((recipe) => `<article class="recipe-card ${recipe.id === state.selectedRecipeId ? "is-active" : ""}" data-recipe-card="${recipe.id}"><div class="sub-head"><div><h3>${escapeHtml(recipe.name)}</h3><span class="tag">${escapeHtml(recipe.cuisine)} / ${escapeHtml(recipe.category)}</span></div><span class="pill">${formatNumber(recipe.nutrition.energy, 0)} kcal</span></div><p class="muted">rotation ${escapeHtml(recipe.rotationKey)} / ${escapeHtml(recipe.tags.join("・"))}</p></article>`).join("")}</div>${renderRecipeDetailPanel(selectedRecipe)}</div></article><article class="panel"><div class="section-head"><div><p class="section-kicker">Food Master</p><h2>食品マスタ</h2></div><p class="section-note">食品成分表ベースの100gあたり栄養価です。</p></div><div class="food-list">${foods.map((food) => `<article class="card"><div class="sub-head"><strong>${escapeHtml(food.name)}</strong><span class="pill">100g</span></div><p class="muted">エネルギー ${formatNumber(food.nutrients.energy, 0)} kcal / たんぱく質 ${formatNumber(food.nutrients.protein, 1)} g / 脂質 ${formatNumber(food.nutrients.fat, 1)} g / 炭水化物 ${formatNumber(food.nutrients.carbs, 1)} g / 食物繊維 ${formatNumber(food.nutrients.fiber, 1)} g / 塩分 ${formatNumber(food.nutrients.salt, 1)} g</p></article>`).join("")}</div></article>`;
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
    document.querySelector('#auto-generate-button')?.addEventListener('click', () => { regenerateWeekFromScratch(state.settings.weekStart); });
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
    Array.from(document.querySelectorAll('[data-recipe-card]')).forEach((card) => { card.addEventListener('click', () => { state.selectedRecipeId = card.dataset.recipeCard; renderAdminView(); }); });
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
