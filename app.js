const SVG_NS = "http://www.w3.org/2000/svg";
const XHTML_NS = "http://www.w3.org/1999/xhtml";
const STAGE_ONE_GOAL = 5;
const AUTO_ADVANCE_DELAY = 1600;

const stageInfo = {
  "1": {
    title: "각 A의 삼각비를 구해 보세요",
    description: "세 변의 길이를 살펴보고, 방향이 달라도 각 A를 기준으로 계산하세요.",
    hint: "삼각형이 회전해도 직각 표시의 맞은편은 빗변입니다. 각 A의 대변과 인접변을 차근차근 찾아보세요."
  },
  "2": {
    title: "두 변으로 선택한 삼각비를 구해 보세요",
    description: "피타고라스 정리로 빠진 변을 구한 뒤, 각 A의 삼각비를 계산하세요.",
    hint: "빠진 변을 먼저 구하세요. 그다음 각 A를 기준으로 대변, 인접변, 빗변을 찾아 선택한 삼각비에 넣으면 됩니다."
  },
  "3": {
    title: "특수각의 삼각비 값을 구해 보세요",
    description: "30°, 45°, 60°의 직각삼각형 변의 비를 이용해 계산하세요.",
    hint: "30°-60°-90° 삼각형의 변의 비는 1 : √3 : 2이고, 45°-45°-90° 삼각형의 변의 비는 1 : 1 : √2입니다."
  }
};

const ratioInfo = {
  sin: { label: "sin A", title: "sin A를 완성하세요" },
  cos: { label: "cos A", title: "cos A를 완성하세요" },
  tan: { label: "tan A", title: "tan A를 완성하세요" },
  all: { label: "전체 삼각비", title: "전체 삼각비를 완성하세요" }
};

const baseTriangles = [
  { legs: [3, 4], hyp: 5, labels: ["3", "4", "5"] },
  { legs: [6, 8], hyp: 10, labels: ["6", "8", "10"] },
  { legs: [5, 12], hyp: 13, labels: ["5", "12", "13"] },
  { legs: [8, 15], hyp: 17, labels: ["8", "15", "17"] },
  { legs: [7, 24], hyp: 25, labels: ["7", "24", "25"] },
  { legs: [9, 12], hyp: 15, labels: ["9", "12", "15"] }
];

const radicalTriangles = [
  { legs: [1, Math.sqrt(3)], hyp: 2, labels: ["1", "√3", "2"] },
  { legs: [1, 1], hyp: Math.sqrt(2), labels: ["1", "1", "√2"] },
  { legs: [2, Math.sqrt(5)], hyp: 3, labels: ["2", "√5", "3"] },
  { legs: [Math.sqrt(3), Math.sqrt(6)], hyp: 3, labels: ["√3", "√6", "3"] },
  { legs: [Math.sqrt(5), Math.sqrt(11)], hyp: 4, labels: ["√5", "√11", "4"] }
];

const pythagorasTriangles = [
  { legs: [2, 3], hyp: Math.sqrt(13), labels: ["2", "3", "√13"] },
  { legs: [4, 5], hyp: Math.sqrt(41), labels: ["4", "5", "√41"] },
  { legs: [5, 6], hyp: Math.sqrt(61), labels: ["5", "6", "√61"] },
  { legs: [6, 7], hyp: Math.sqrt(85), labels: ["6", "7", "√85"] },
  { legs: [3, 5], hyp: Math.sqrt(34), labels: ["3", "5", "√34"] }
];

const specialAngleTriangles = {
  30: { legs: [Math.sqrt(3), 1], hyp: 2, labels: ["√3", "1", "2"] },
  45: { legs: [1, 1], hyp: Math.sqrt(2), labels: ["1", "1", "√2"] },
  60: { legs: [1, Math.sqrt(3)], hyp: 2, labels: ["1", "√3", "2"] }
};

const specialAngleAnswers = {
  30: { sin: "1/2", cos: "√3/2", tan: "√3/3" },
  45: { sin: "√2/2", cos: "√2/2", tan: "1" },
  60: { sin: "√3/2", cos: "1/2", tan: "√3" }
};

const boundaryAngleProblems = [
  { ratio: "sin", angle: 0, value: 0, label: "sin 0°" },
  { ratio: "cos", angle: 0, value: 1, label: "cos 0°" },
  { ratio: "tan", angle: 0, value: 0, label: "tan 0°" },
  { ratio: "sin", angle: 90, value: 1, label: "sin 90°" },
  { ratio: "cos", angle: 90, value: 0, label: "cos 90°" }
];

function scaledSpecialTriangle(angle, scale) {
  const base = specialAngleTriangles[angle];
  const scaleLabel = label => {
    if (label.includes("√")) return scale === 1 ? label : `${scale}${label}`;
    return String(Number(label) * scale);
  };
  return {
    legs: base.legs.map(value => value * scale),
    hyp: base.hyp * scale,
    labels: base.labels.map(scaleLabel)
  };
}

const layouts = [
  { points: [[95, 300], [405, 300], [405, 74]], right: 1, a: 0 },
  { points: [[425, 300], [105, 300], [105, 86]], right: 1, a: 0 },
  { points: [[105, 88], [175, 315], [420, 160]], right: 0, a: 2 },
  { points: [[116, 270], [353, 315], [408, 82]], right: 1, a: 0 },
  { points: [[100, 120], [382, 70], [420, 292]], right: 1, a: 0 },
  { points: [[390, 92], [110, 125], [170, 315]], right: 1, a: 0 }
];

const state = {
  stage: "1",
  ratioMode: "all",
  angleMode: "mixed",
  specialMode: "3-1",
  stageOneCorrect: 0,
  stageScores: { "1": 0, "2": 0, "3": 0 },
  stageTwoUnlocked: false,
  pendingStageChoice: false,
  activeMathInput: null,
  questionNumber: 0,
  current: null,
  attempts: 0,
  solved: 0,
  correct: 0,
  streak: 0,
  bestStreak: 0,
  nextQuestionTimer: null,
  answered: false,
  lastQuestionKey: ""
};

const els = {
  svg: document.querySelector("#triangleSvg"),
  tabs: [...document.querySelectorAll(".stage-tab")],
  stageTwoTab: document.querySelector('[data-stage="2"]'),
  stageTwoDescription: document.querySelector("#stageTwoDescription"),
  stageThreeTab: document.querySelector('[data-stage="3"]'),
  stageThreeDescription: document.querySelector("#stageThreeDescription"),
  stageScoreCards: [...document.querySelectorAll(".stage-score-card")],
  totalStageScore: document.querySelector("#totalStageScore"),
  stageScoreValues: {
    "1": document.querySelector("#stageOneScore"),
    "2": document.querySelector("#stageTwoScore"),
    "3": document.querySelector("#stageThreeScore")
  },
  stageBadge: document.querySelector("#stageBadge"),
  stageTitle: document.querySelector("#stageTitle"),
  stageDescription: document.querySelector("#stageDescription"),
  hintButton: document.querySelector("#hintButton"),
  hintPanel: document.querySelector("#hintPanel"),
  hintText: document.querySelector("#hintText"),
  boundaryHintVisual: document.querySelector("#boundaryHintVisual"),
  ratioSelector: document.querySelector("#ratioSelector"),
  ratioButtons: [...document.querySelectorAll(".ratio-option")],
  specialModeSelector: document.querySelector("#specialModeSelector"),
  specialModeButtons: [...document.querySelectorAll(".special-mode-option")],
  angleSelector: document.querySelector("#angleSelector"),
  angleSelectorTitle: document.querySelector("#angleSelectorTitle"),
  angleSelectorDescription: document.querySelector("#angleSelectorDescription"),
  angleButtons: [...document.querySelectorAll(".angle-option")],
  stageGoal: document.querySelector("#stageGoal"),
  trigAnswers: document.querySelector("#trigAnswers"),
  trigAnswerTitle: document.querySelector("#trigAnswerTitle"),
  specialLengthAnswers: document.querySelector("#specialLengthAnswers"),
  specialLengthRows: [...document.querySelectorAll(".special-length-row")],
  boundaryAngleAnswer: document.querySelector("#boundaryAngleAnswer"),
  boundaryQuestion: document.querySelector("#boundaryQuestion"),
  boundaryExpression: document.querySelector("#boundaryExpression"),
  boundaryInputLabel: document.querySelector("#boundaryInputLabel"),
  boundaryAngleInput: document.querySelector("#boundaryAngleInput"),
  boundaryResultMark: document.querySelector("#boundaryResultMark"),
  mathSymbolToolbar: document.querySelector("#mathSymbolToolbar"),
  insertRootButton: document.querySelector("#insertRootButton"),
  lengthAnswer: document.querySelector("#lengthAnswer"),
  missingSideName: document.querySelector("#missingSideName"),
  lengthInput: document.querySelector("#lengthInput"),
  mathCalculator: document.querySelector("#mathCalculator"),
  calculatorToggle: document.querySelector("#calculatorToggle"),
  calculatorBody: document.querySelector("#calculatorBody"),
  calculatorGuide: document.querySelector("#calculatorGuide"),
  calcFirst: document.querySelector("#calcFirst"),
  calcSecond: document.querySelector("#calcSecond"),
  calculatorRootButton: document.querySelector("#calculatorRootButton"),
  operationButtons: [...document.querySelectorAll(".operation-button")],
  calculateButton: document.querySelector("#calculateButton"),
  calculatorAnswer: document.querySelector("#calculatorAnswer"),
  calculatorStatus: document.querySelector("#calculatorStatus"),
  calculationResult: document.querySelector("#calculationResult"),
  stageComplete: document.querySelector("#stageComplete"),
  continueStageOne: document.querySelector("#continueStageOne"),
  goToStageTwo: document.querySelector("#goToStageTwo"),
  feedback: document.querySelector("#feedback"),
  questionChip: document.querySelector("#questionChip"),
  practiceGrid: document.querySelector("#practiceGrid"),
  diagramPanel: document.querySelector("#diagramPanel"),
  resetButton: document.querySelector("#resetButton"),
  checkButton: document.querySelector("#checkButton"),
  nextButton: document.querySelector("#nextButton"),
  totalCorrect: document.querySelector("#totalCorrect"),
  streak: document.querySelector("#streak"),
  solvedCount: document.querySelector("#solvedCount"),
  accuracy: document.querySelector("#accuracy"),
  bestStreak: document.querySelector("#bestStreak")
};

function randomItem(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function shufflePair(pair) {
  return Math.random() < .5 ? [...pair] : [pair[1], pair[0]];
}

function activeRatioRows() {
  return [...document.querySelectorAll(".formula-row")].filter(row => !row.hidden);
}

function syncRatioMode() {
  els.ratioButtons.forEach(button => {
    const active = button.dataset.ratioOption === state.ratioMode;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });
  document.querySelectorAll(".formula-row").forEach(row => {
    row.hidden = state.ratioMode !== "all" && row.dataset.ratio !== state.ratioMode;
  });
  els.trigAnswerTitle.textContent = ratioInfo[state.ratioMode].title;
}

function updateTrigLabels(angle = null) {
  const koreanNames = { sin: "사인", cos: "코사인", tan: "탄젠트" };
  els.ratioButtons.forEach(button => {
    const ratio = button.dataset.ratioOption;
    if (ratio !== "all") button.textContent = `${ratio} ${angle ? `${angle}°` : "A"}`;
  });
  document.querySelectorAll(".formula-row").forEach(row => {
    const ratio = row.dataset.ratio;
    const angleLabel = angle ? `${angle}°` : "A";
    const spokenAngle = angle ? `${angle}도` : "A";
    row.querySelector(".formula-name").innerHTML = `<span>${ratio}</span> ${angleLabel}`;
    row.querySelector('[data-part="numerator"]').setAttribute("aria-label", `${koreanNames[ratio]} ${spokenAngle} 분자`);
    row.querySelector('[data-part="denominator"]').setAttribute("aria-label", `${koreanNames[ratio]} ${spokenAngle} 분모`);
    row.querySelector('[data-refined-part="numerator"]').setAttribute("aria-label", `약분 또는 유리화한 ${koreanNames[ratio]} ${spokenAngle} 분자`);
    row.querySelector('[data-refined-part="denominator"]').setAttribute("aria-label", `약분 또는 유리화한 ${koreanNames[ratio]} ${spokenAngle} 분모`);
  });
}

function syncAngleMode() {
  if (state.specialMode === "3-3" && !["30", "45", "mixed"].includes(state.angleMode)) state.angleMode = "mixed";
  const isLengthPractice = state.specialMode === "3-3";
  els.angleSelectorTitle.textContent = isLengthPractice ? "특수각 삼각형 유형을 선택하세요" : "연습할 특수각을 선택하세요";
  els.angleSelectorDescription.textContent = isLengthPractice
    ? "두 특수 직각삼각형을 따로 또는 혼합해서 연습합니다."
    : "혼합 연습에서는 30°, 45°, 60°가 무작위로 나옵니다.";
  els.angleButtons.forEach(button => {
    const active = button.dataset.angleOption === state.angleMode;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
    button.hidden = isLengthPractice && button.dataset.angleOption === "60";
    if (button.dataset.angleOption === "30") button.textContent = state.specialMode === "3-3" ? "30°·60° 삼각형" : "30° 연습";
    if (button.dataset.angleOption === "45") button.textContent = state.specialMode === "3-3" ? "45° 삼각형" : "45° 연습";
    if (button.dataset.angleOption === "mixed") button.textContent = state.specialMode === "3-3" ? "혼합 유형" : "특수각 혼합";
  });
  els.angleSelector.hidden = state.stage !== "3" || state.specialMode === "3-4";
}

function updateSpecialStageCopy() {
  if (state.stage !== "3") return;
  const copies = {
    "3-1": ["삼각형으로 특수각의 삼각비를 구해 보세요", "여러 크기의 특수 직각삼각형에서 변의 비를 찾아 계산하세요."],
    "3-2": ["그림 없이 특수각의 값을 써 보세요", "30°, 45°, 60°의 sin, cos, tan 값을 바로 떠올려 입력하세요."],
    "3-3": ["주어진 한 변으로 나머지 변을 구해 보세요", "특수 직각삼각형의 변의 비를 이용해 물음표 두 개를 완성하세요."],
    "3-4": ["0°와 90°의 삼각비 값을 구해 보세요", "sin 0°, cos 0°, tan 0°, sin 90°, cos 90°의 값을 익혀 보세요."]
  };
  [els.stageTitle.textContent, els.stageDescription.textContent] = copies[state.specialMode];
  const boundaryMode = state.specialMode === "3-4";
  els.hintText.innerHTML = boundaryMode
    ? "<b>단위원의 좌표를 떠올려 보세요.</b><p>0°는 (1, 0), 90°는 (0, 1)입니다. cos는 x좌표, sin은 y좌표이고 tan 0°는 sin 0° / cos 0°로 구할 수 있어요.</p>"
    : `<b>특수 직각삼각형의 변의 비를 떠올려 보세요.</b><p>${stageInfo["3"].hint}</p>`;
}

function syncSpecialMode() {
  els.specialModeButtons.forEach(button => {
    const active = button.dataset.specialMode === state.specialMode;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });
  const isStageThree = state.stage === "3";
  const isDirectValues = isStageThree && state.specialMode === "3-2";
  const isLengthPractice = isStageThree && state.specialMode === "3-3";
  const isBoundaryPractice = isStageThree && state.specialMode === "3-4";
  els.specialModeSelector.hidden = !isStageThree;
  els.ratioSelector.hidden = isStageThree;
  els.trigAnswers.hidden = isLengthPractice || isBoundaryPractice;
  els.specialLengthAnswers.hidden = !isLengthPractice;
  els.boundaryAngleAnswer.hidden = !isBoundaryPractice;
  els.boundaryHintVisual.hidden = !isBoundaryPractice;
  els.hintPanel.classList.toggle("boundary-hint", isBoundaryPractice);
  els.mathSymbolToolbar.hidden = state.stage === "2" || isBoundaryPractice;
  els.practiceGrid.classList.toggle("no-diagram", isDirectValues || isBoundaryPractice);
  syncAngleMode();
  updateSpecialStageCopy();
}

function insertMathSymbol(symbol, preferredInput = null) {
  let input = preferredInput || state.activeMathInput;
  if (!input || input.disabled || input.closest("[hidden]")) {
    input = state.stage === "2"
      ? els.lengthInput
      : state.stage === "3" && state.specialMode === "3-3"
        ? els.specialLengthRows.find(row => !row.hidden)?.querySelector("input")
        : activeRatioRows()[0]?.querySelector("input");
  }
  if (!input) return;

  const start = input.selectionStart ?? input.value.length;
  const end = input.selectionEnd ?? start;
  input.setRangeText(symbol, start, end, "end");
  input.dispatchEvent(new Event("input", { bubbles: true }));
  input.focus();
  state.activeMathInput = input;
}

function insertCalculatorRoot() {
  const calculatorInputs = [els.calcFirst, els.calcSecond];
  const target = calculatorInputs.includes(state.activeMathInput)
    ? state.activeMathInput
    : calculatorInputs.find(input => !input.value.trim()) || els.calcFirst;
  insertMathSymbol("√", target);
}

function updateStageGoal() {
  const completed = Math.min(state.stageOneCorrect, STAGE_ONE_GOAL);
  els.stageGoal.innerHTML = state.stageTwoUnlocked
    ? `1단계 완료 <strong>${STAGE_ONE_GOAL} / ${STAGE_ONE_GOAL}</strong>`
    : `1단계 정답 <strong>${completed} / ${STAGE_ONE_GOAL}</strong>`;
  els.stageGoal.classList.toggle("complete", state.stageTwoUnlocked);
  els.stageTwoTab.disabled = !state.stageTwoUnlocked;
  els.stageTwoTab.setAttribute("aria-disabled", String(!state.stageTwoUnlocked));
  els.stageTwoDescription.textContent = state.stageTwoUnlocked
    ? "빠진 변부터 구해 계산하기"
    : `1단계 정답 ${STAGE_ONE_GOAL}개 후 열려요`;
  els.stageThreeTab.disabled = !state.stageTwoUnlocked;
  els.stageThreeTab.setAttribute("aria-disabled", String(!state.stageTwoUnlocked));
  els.stageThreeDescription.textContent = state.stageTwoUnlocked
    ? "0°부터 90°까지 값 익히기"
    : `1단계 정답 ${STAGE_ONE_GOAL}개 후 열려요`;
}

function showStageChoice() {
  state.pendingStageChoice = true;
  state.stageTwoUnlocked = true;
  updateStageGoal();
  els.stageComplete.hidden = false;
  els.nextButton.hidden = true;
  els.goToStageTwo.focus();
}

function scheduleNextQuestion() {
  window.clearTimeout(state.nextQuestionTimer);
  state.nextQuestionTimer = window.setTimeout(() => {
    state.nextQuestionTimer = null;
    if (state.answered && !state.pendingStageChoice) makeQuestion();
  }, AUTO_ADVANCE_DELAY);
}

function makeQuestion() {
  window.clearTimeout(state.nextQuestionTimer);
  state.nextQuestionTimer = null;
  let question;
  do {
    if (state.stage === "3" && state.specialMode === "3-4") {
      const boundary = randomItem(boundaryAngleProblems);
      question = { boundary, key: `3-4-${boundary.ratio}-${boundary.angle}` };
      continue;
    }

    let source;
    let angle = null;
    let scale = 1;
    if (state.stage === "3") {
      if (state.specialMode === "3-3" && state.angleMode === "30") angle = randomItem([30, 60]);
      else angle = state.angleMode === "mixed" ? randomItem([30, 45, 60]) : Number(state.angleMode);
      scale = state.specialMode === "3-2" ? 1 : randomItem([1, 2, 3, 4, 5]);
      source = scaledSpecialTriangle(angle, scale);
    } else if (state.stage === "1" && Math.random() < .45) source = randomItem(radicalTriangles);
    else if (state.stage === "2" && Math.random() < .5) source = randomItem(pythagorasTriangles);
    else source = randomItem(baseTriangles);
    const legOrder = state.stage === "3" ? [0, 1] : shufflePair([0, 1]);
    const layoutIndex = Math.floor(Math.random() * layouts.length);
    const layout = structuredClone(layouts[layoutIndex]);
    const roleAtVertex = [];
    roleAtVertex[layout.right] = "R";
    roleAtVertex[layout.a] = "A";
    roleAtVertex[[0, 1, 2].find(i => i !== layout.right && i !== layout.a)] = "O";

    const adjacentIndex = legOrder[0];
    const oppositeIndex = legOrder[1];
    const values = {
      adjacent: source.legs[adjacentIndex],
      opposite: source.legs[oppositeIndex],
      hyp: source.hyp
    };
    const labels = {
      adjacent: source.labels[adjacentIndex],
      opposite: source.labels[oppositeIndex],
      hyp: source.labels[2]
    };
    let missing = null;
    let givenSide = null;
    let missingSides = [];
    if (state.stage === "2") missing = randomItem(["adjacent", "opposite", "hyp"]);
    if (state.stage === "3" && state.specialMode === "3-3") {
      givenSide = randomItem(["adjacent", "opposite", "hyp"]);
      missingSides = ["adjacent", "opposite", "hyp"].filter(role => role !== givenSide);
    }

    question = {
      layout, roleAtVertex, values, labels, missing, givenSide, missingSides, angle, scale,
      key: `${state.stage}-${state.specialMode}-${layoutIndex}-${labels.adjacent}-${labels.opposite}-${missing}-${givenSide}-${angle}`
    };
  } while (question.key === state.lastQuestionKey);

  state.lastQuestionKey = question.key;
  state.current = question;
  state.questionNumber += 1;
  state.answered = false;
  clearInputs();
  renderQuestion();
}

function svgEl(tag, attrs = {}, text = "") {
  const node = document.createElementNS(SVG_NS, tag);
  Object.entries(attrs).forEach(([key, value]) => node.setAttribute(key, value));
  if (text) node.textContent = text;
  return node;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, character => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[character]);
}

function mathMarkup(value) {
  const text = String(value);
  if (text === "√") {
    return '<math class="inline-radical empty-radical" aria-label="루트"><msqrt><mspace width="0.7em" height="0.8em"></mspace></msqrt></math>';
  }
  const radical = text.match(/^([+-]?(?:\d+(?:\.\d+)?)?)√(\d+(?:\.\d+)?)$/);
  if (!radical) return escapeHtml(text);

  const coefficient = radical[1];
  const coefficientMarkup = coefficient === ""
    ? ""
    : coefficient === "-" ? "<mo>−</mo>" : `<mn>${escapeHtml(coefficient)}</mn>`;
  return `<math class="inline-radical" aria-label="${escapeHtml(text)}"><mrow>${coefficientMarkup}<msqrt><mn>${escapeHtml(radical[2])}</mn></msqrt></mrow></math>`;
}

function updateMathInputPreview(input) {
  const preview = input.parentElement?.querySelector(":scope > .math-input-preview");
  if (!preview) return;
  const displayValue = input.value.trim().replace(/^sqrt\((\d+(?:\.\d+)?)\)$/i, "√$1");
  const markup = mathMarkup(displayValue);
  const hasRadical = markup.startsWith("<math");
  preview.innerHTML = hasRadical ? markup : "";
  input.classList.toggle("has-math-preview", hasRadical);
}

function initializeMathInputPreviews() {
  document.querySelectorAll(".answer-panel input").forEach(input => {
    const shell = document.createElement("span");
    shell.className = "math-input-shell";
    input.before(shell);
    shell.append(input);

    const preview = document.createElement("span");
    preview.className = "math-input-preview";
    preview.setAttribute("aria-hidden", "true");
    shell.append(preview);
    input.addEventListener("input", () => updateMathInputPreview(input));
  });
}

function resetMathInputPreviews() {
  document.querySelectorAll(".answer-panel input").forEach(updateMathInputPreview);
}

function distance(a, b) {
  return Math.hypot(a[0] - b[0], a[1] - b[1]);
}

function unit(from, to) {
  const d = distance(from, to);
  return [(to[0] - from[0]) / d, (to[1] - from[1]) / d];
}

function pointAlong(origin, direction, amount) {
  return [origin[0] + direction[0] * amount, origin[1] + direction[1] * amount];
}

function pointsForSideLengths(layout, values) {
  const originalPoints = layout.points;
  const rightIndex = layout.right;
  const angleIndex = layout.a;
  const oppositeIndex = [0, 1, 2].find(index => index !== rightIndex && index !== angleIndex);
  const rightPoint = originalPoints[rightIndex];
  const angleDirection = unit(rightPoint, originalPoints[angleIndex]);
  const originalOppositeDirection = unit(rightPoint, originalPoints[oppositeIndex]);
  const perpendiculars = [
    [-angleDirection[1], angleDirection[0]],
    [angleDirection[1], -angleDirection[0]]
  ];
  const oppositeDirection = perpendiculars.reduce((best, candidate) => {
    const alignment = candidate[0] * originalOppositeDirection[0] + candidate[1] * originalOppositeDirection[1];
    const bestAlignment = best[0] * originalOppositeDirection[0] + best[1] * originalOppositeDirection[1];
    return alignment > bestAlignment ? candidate : best;
  });

  const rawPoints = [];
  rawPoints[rightIndex] = [0, 0];
  rawPoints[angleIndex] = [
    angleDirection[0] * values.adjacent,
    angleDirection[1] * values.adjacent
  ];
  rawPoints[oppositeIndex] = [
    oppositeDirection[0] * values.opposite,
    oppositeDirection[1] * values.opposite
  ];

  // Keep labels inside the 520 × 380 viewBox while preserving the exact side ratio.
  const bounds = { left: 78, right: 442, top: 58, bottom: 322 };
  const xs = rawPoints.map(point => point[0]);
  const ys = rawPoints.map(point => point[1]);
  const rawWidth = Math.max(...xs) - Math.min(...xs);
  const rawHeight = Math.max(...ys) - Math.min(...ys);
  const scale = Math.min(
    (bounds.right - bounds.left) / Math.max(rawWidth, 1),
    (bounds.bottom - bounds.top) / Math.max(rawHeight, 1)
  );
  const scaledWidth = rawWidth * scale;
  const scaledHeight = rawHeight * scale;
  const offsetX = bounds.left + ((bounds.right - bounds.left) - scaledWidth) / 2 - Math.min(...xs) * scale;
  const offsetY = bounds.top + ((bounds.bottom - bounds.top) - scaledHeight) / 2 - Math.min(...ys) * scale;

  return rawPoints.map(point => [
    point[0] * scale + offsetX,
    point[1] * scale + offsetY
  ]);
}

function vertexName(role) {
  return role === "R" ? "B" : role === "A" ? "A" : "C";
}

function sideRoleForVertices(role1, role2) {
  if (!role1.includes("R") && !role2.includes("R")) return "hyp";
  if (role1.includes("A") || role2.includes("A")) return "adjacent";
  return "opposite";
}

function renderQuestion() {
  const q = state.current;
  if (q.boundary) {
    els.svg.replaceChildren();
    els.boundaryQuestion.textContent = `${q.boundary.label}의 값을 입력하세요`;
    els.boundaryExpression.textContent = q.boundary.label;
    els.boundaryInputLabel.textContent = `${q.boundary.label}의 값`;
    els.boundaryAngleInput.setAttribute("aria-label", `${q.boundary.label}의 값`);
    return;
  }

  const points = pointsForSideLengths(q.layout, q.values);
  updateTrigLabels(q.angle);
  els.svg.replaceChildren();
  els.svg.append(svgEl("polygon", {
    points: points.map(p => p.join(",")).join(" "),
    class: "triangle-side"
  }));

  renderAngleMarks(q, points);

  for (let i = 0; i < 3; i += 1) {
    const j = (i + 1) % 3;
    const role = sideRoleForVertices(q.roleAtVertex[i], q.roleAtVertex[j]);
    const isMissing = q.missing === role || q.missingSides.includes(role);
    const solvedStageTwoSide = state.stage === "2"
      && q.missing === role
      && nearlyEqual(parseMath(els.lengthInput.value), q.values[role]);
    renderSideLabel(points[i], points[j], role, isMissing && !solvedStageTwoSide ? "?" : q.labels[role]);
  }

  const centroid = [points.reduce((s, p) => s + p[0], 0) / 3, points.reduce((s, p) => s + p[1], 0) / 3];
  points.forEach((p, index) => {
    const outward = unit(centroid, p);
    const labelPoint = pointAlong(p, outward, 29);
    els.svg.append(svgEl("text", {
      x: labelPoint[0], y: labelPoint[1] + 9,
      class: "vertex-label", "text-anchor": "middle"
    }, vertexName(q.roleAtVertex[index])));
  });

  const angleText = q.angle ? ` · ∠A = ${q.angle}°` : "";
  const ratioLabel = state.ratioMode === "all"
    ? ratioInfo.all.label
    : `${state.ratioMode} ${q.angle ? `${q.angle}°` : "A"}`;
  els.questionChip.textContent = state.stage === "3" && state.specialMode === "3-3"
    ? `문제 ${state.questionNumber}${angleText} · 나머지 두 변`
    : `문제 ${state.questionNumber}${angleText} · ${ratioLabel}`;
  if (q.angle) {
    els.trigAnswerTitle.textContent = state.ratioMode === "all"
      ? `${q.angle}°의 전체 삼각비를 완성하세요`
      : `${state.ratioMode} ${q.angle}°를 완성하세요`;
  }
  const sideNames = { adjacent: "변 AB", opposite: "변 BC", hyp: "변 AC" };
  if (state.stage === "2") {
    els.missingSideName.textContent = sideNames[q.missing];
  }
  if (state.stage === "3" && state.specialMode === "3-3") {
    els.specialLengthRows.forEach(row => {
      const role = row.dataset.specialSide;
      row.hidden = role === q.givenSide;
      row.querySelector(".special-side-name").textContent = sideNames[role];
      row.querySelector("input").setAttribute("aria-label", `${sideNames[role]}의 길이`);
    });
  }
}

function renderAngleMarks(q, points) {
  const r = q.layout.right;
  const othersR = [0, 1, 2].filter(i => i !== r);
  const u1 = unit(points[r], points[othersR[0]]);
  const u2 = unit(points[r], points[othersR[1]]);
  const size = 19;
  const p1 = pointAlong(points[r], u1, size);
  const p3 = pointAlong(points[r], u2, size);
  const corner = [points[r][0] + (u1[0] + u2[0]) * size, points[r][1] + (u1[1] + u2[1]) * size];
  els.svg.append(svgEl("polyline", { points: `${p1.join(",")} ${corner.join(",")} ${p3.join(",")}`, class: "right-angle" }));

  const a = q.layout.a;
  const othersA = [0, 1, 2].filter(i => i !== a);
  const au1 = unit(points[a], points[othersA[0]]);
  const au2 = unit(points[a], points[othersA[1]]);
  const arcStart = pointAlong(points[a], au1, 31);
  const arcEnd = pointAlong(points[a], au2, 31);
  const cross = au1[0] * au2[1] - au1[1] * au2[0];
  const sweep = cross > 0 ? 1 : 0;
  const path = `M ${points[a][0]} ${points[a][1]} L ${arcStart[0]} ${arcStart[1]} A 31 31 0 0 ${sweep} ${arcEnd[0]} ${arcEnd[1]} Z`;
  els.svg.append(svgEl("path", { d: path, class: "angle-arc" }));

  if (q.angle) {
    const bisectorLength = Math.hypot(au1[0] + au2[0], au1[1] + au2[1]);
    const bisector = [(au1[0] + au2[0]) / bisectorLength, (au1[1] + au2[1]) / bisectorLength];
    const angleLabelPoint = pointAlong(points[a], bisector, 58);
    els.svg.append(svgEl("text", {
      x: angleLabelPoint[0], y: angleLabelPoint[1] + 6,
      class: "angle-value", "text-anchor": "middle"
    }, `${q.angle}°`));
  }
}

function renderSideLabel(a, b, role, text) {
  const mid = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  const center = [260, 190];
  let normal = [-(b[1] - a[1]), b[0] - a[0]];
  const len = Math.hypot(normal[0], normal[1]);
  normal = [normal[0] / len, normal[1] / len];
  const candidate1 = pointAlong(mid, normal, 24);
  const candidate2 = pointAlong(mid, normal, -24);
  const labelPoint = distance(candidate1, center) > distance(candidate2, center) ? candidate1 : candidate2;
  const hasRadical = String(text).includes("√");
  const width = Math.max(43, String(text).length * 17 + 19);
  const height = hasRadical ? 46 : 36;
  els.svg.append(svgEl("rect", {
    x: labelPoint[0] - width / 2, y: labelPoint[1] - height / 2,
    width, height, rx: height / 2, class: "side-label-bg"
  }));

  if (hasRadical) {
    const foreignObject = svgEl("foreignObject", {
      x: labelPoint[0] - width / 2, y: labelPoint[1] - height / 2,
      width, height, class: "side-label-math-object"
    });
    const mathLabel = document.createElementNS(XHTML_NS, "div");
    mathLabel.className = "side-label-math";
    mathLabel.innerHTML = mathMarkup(text);
    foreignObject.append(mathLabel);
    els.svg.append(foreignObject);
    return;
  }

  els.svg.append(svgEl("text", {
    x: labelPoint[0], y: labelPoint[1] + 7,
    class: `side-label${text === "?" ? " unknown-label" : ""}`, "text-anchor": "middle"
  }, text));
}

function parseMath(raw) {
  if (!raw) return NaN;
  let value = raw.trim().toLowerCase().replaceAll(" ", "").replaceAll(",", ".");
  value = value.replace(/sqrt\(([^()]+)\)/g, "√$1");
  if (value.includes("/")) {
    const parts = value.split("/");
    if (parts.length !== 2) return NaN;
    return parseMath(parts[0]) / parseMath(parts[1]);
  }
  const radicalMatch = value.match(/^([+-]?(?:\d+(?:\.\d+)?)?)\*?√(\d+(?:\.\d+)?)$/);
  if (radicalMatch) {
    let coefficient = radicalMatch[1];
    if (coefficient === "" || coefficient === "+") coefficient = 1;
    if (coefficient === "-") coefficient = -1;
    return Number(coefficient) * Math.sqrt(Number(radicalMatch[2]));
  }
  const number = Number(value);
  return Number.isFinite(number) ? number : NaN;
}

function nearlyEqual(a, b) {
  return Number.isFinite(a) && Number.isFinite(b) && Math.abs(a - b) <= 1e-6 * Math.max(1, Math.abs(b));
}

function greatestCommonDivisor(a, b) {
  let x = Math.abs(Math.trunc(a));
  let y = Math.abs(Math.trunc(b));
  while (y) [x, y] = [y, x % y];
  return x;
}

function integerCoefficient(raw) {
  const value = raw.trim().toLowerCase().replaceAll(" ", "").replace(/^sqrt\(([^()]+)\)$/i, "√$1");
  if (/^[+-]?\d+$/.test(value)) return Math.abs(Number(value));
  const radical = value.match(/^([+-]?(?:\d+)?)\*?√\d+$/);
  if (!radical) return null;
  if (["", "+", "-"].includes(radical[1])) return 1;
  return Math.abs(Number(radical[1]));
}

function fractionRefinementIssue(numeratorRaw, denominatorRaw) {
  const denominatorText = denominatorRaw.trim().toLowerCase().replaceAll(" ", "");
  if (denominatorText.includes("√") || denominatorText.includes("sqrt(")) return "rationalize";

  const denominator = parseMath(denominatorRaw);
  const numeratorFactor = integerCoefficient(numeratorRaw);
  if (numeratorFactor !== null && Number.isInteger(denominator)
    && greatestCommonDivisor(numeratorFactor, denominator) > 1) return "reduce";
  return null;
}

function primeFactorization(number) {
  let remaining = number;
  const factors = [];
  for (let divisor = 2; divisor * divisor <= remaining; divisor += 1) {
    while (remaining % divisor === 0) {
      factors.push(divisor);
      remaining /= divisor;
    }
  }
  if (remaining > 1) factors.push(remaining);
  return factors;
}

function simplifyRadical(number) {
  if (!Number.isInteger(number) || number < 0) return null;
  if (number === 0) return { outside: 0, inside: 1, text: "0", factors: [0] };
  const factors = primeFactorization(number);
  const counts = new Map();
  factors.forEach(factor => counts.set(factor, (counts.get(factor) || 0) + 1));
  let outside = 1;
  let inside = 1;
  counts.forEach((count, factor) => {
    outside *= factor ** Math.floor(count / 2);
    if (count % 2) inside *= factor;
  });
  const text = inside === 1 ? String(outside) : `${outside === 1 ? "" : outside}√${inside}`;
  return { outside, inside, text, factors };
}

function formatCalculationNumber(number) {
  const rounded = Math.round(number);
  return nearlyEqual(number, rounded) ? String(rounded) : String(Number(number.toFixed(6)));
}

function calculateSquares() {
  const firstRaw = els.calcFirst.value.trim();
  const secondRaw = els.calcSecond.value.trim();
  const first = parseMath(els.calcFirst.value);
  const second = parseMath(els.calcSecond.value);
  const operation = els.operationButtons.find(button => button.classList.contains("active"))?.dataset.operation || "add";
  const wasExpanded = !els.calculationResult.hidden;

  els.calculatorAnswer.classList.remove("error");

  if (!firstRaw || !secondRaw) {
    els.calculatorAnswer.textContent = "?";
    els.calculatorStatus.textContent = "두 숫자를 입력하면 결과가 바로 나와요.";
    els.calculateButton.disabled = true;
    els.calculateButton.setAttribute("aria-expanded", "false");
    els.calculationResult.hidden = true;
    els.calculationResult.replaceChildren();
    return;
  }

  if (!Number.isFinite(first) || !Number.isFinite(second) || first < 0 || second < 0) {
    els.calculatorAnswer.textContent = "입력 확인";
    els.calculatorAnswer.classList.add("error");
    els.calculatorStatus.textContent = "0 이상의 두 길이를 정확히 입력해 주세요.";
    els.calculateButton.disabled = true;
    els.calculateButton.setAttribute("aria-expanded", "false");
    els.calculationResult.hidden = true;
    els.calculationResult.replaceChildren();
    return;
  }

  const firstSquared = first ** 2;
  const secondSquared = second ** 2;
  const radicand = operation === "add" ? firstSquared + secondSquared : firstSquared - secondSquared;
  if (radicand < -1e-8) {
    els.calculatorAnswer.textContent = "계산 불가";
    els.calculatorAnswer.classList.add("error");
    els.calculatorStatus.textContent = "빼기에서는 첫 번째 수에 더 긴 변을 입력하세요.";
    els.calculateButton.disabled = true;
    els.calculateButton.setAttribute("aria-expanded", "false");
    els.calculationResult.hidden = true;
    els.calculationResult.replaceChildren();
    return;
  }

  const cleanRadicand = nearlyEqual(radicand, Math.round(radicand)) ? Math.round(radicand) : radicand;
  const simplified = simplifyRadical(cleanRadicand);
  const symbol = operation === "add" ? "+" : "−";
  const firstDisplay = formatCalculationNumber(first);
  const secondDisplay = formatCalculationNumber(second);
  const factorsText = simplified && simplified.factors.length > 1 ? simplified.factors.join(" × ") : formatCalculationNumber(cleanRadicand);
  const radicalAnswer = simplified ? simplified.text : formatCalculationNumber(Math.sqrt(cleanRadicand));
  const factoringStep = simplified
    ? `<div class="calculation-step"><span>3</span><div><b>소인수분해</b><br>${formatCalculationNumber(cleanRadicand)} = ${factorsText}</div></div>`
    : "";

  els.calculatorAnswer.innerHTML = mathMarkup(radicalAnswer);
  els.calculatorStatus.textContent = `√(${firstRaw}² ${symbol} ${secondRaw}²) = ${radicalAnswer}`;
  els.calculateButton.disabled = false;
  els.calculationResult.innerHTML = `
    <div class="calculation-step"><span>1</span><div><b>각각 제곱하기</b><br>${firstDisplay}² = ${formatCalculationNumber(firstSquared)}, &nbsp; ${secondDisplay}² = ${formatCalculationNumber(secondSquared)}</div></div>
    <div class="calculation-step"><span>2</span><div><b>${operation === "add" ? "더하기" : "빼기"}</b><br>${formatCalculationNumber(firstSquared)} ${symbol} ${formatCalculationNumber(secondSquared)} = ${formatCalculationNumber(cleanRadicand)}</div></div>
    ${factoringStep}
    <div class="calculation-step final"><span>${simplified ? "4" : "3"}</span><div><b>루트 간단히 하기</b><br>${mathMarkup(`√${formatCalculationNumber(cleanRadicand)}`)} = ${mathMarkup(radicalAnswer)}</div></div>`;
  els.calculationResult.hidden = !wasExpanded;
  els.calculateButton.setAttribute("aria-expanded", String(wasExpanded));
}

function toggleCalculationSteps() {
  if (els.calculateButton.disabled) return;
  const willOpen = els.calculationResult.hidden;
  els.calculationResult.hidden = !willOpen;
  els.calculateButton.setAttribute("aria-expanded", String(willOpen));
}

function resetCalculator() {
  els.calcFirst.value = "";
  els.calcSecond.value = "";
  els.calcFirst.disabled = false;
  els.calcSecond.disabled = false;
  els.calculationResult.hidden = true;
  els.calculationResult.replaceChildren();
  const recommendedOperation = state.stage === "2" && state.current?.missing !== "hyp" ? "subtract" : "add";
  els.calcFirst.placeholder = "?";
  els.calcSecond.placeholder = "?";
  els.operationButtons.forEach(button => {
    const active = button.dataset.operation === recommendedOperation;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });
  els.calculatorGuide.textContent = recommendedOperation === "add"
    ? "빗변을 구하므로 두 짧은 변의 제곱을 더해 보세요."
    : "짧은 변을 구하므로 빗변을 첫 칸에 넣고 제곱끼리 빼 보세요.";
  calculateSquares();
}

function checkAnswer() {
  if (state.answered) return;
  let allCorrect = true;
  let hasEmpty = false;
  let hasWrong = false;
  let firstRefinementInput = null;
  const refinementIssues = new Set();
  const isSpecialLengthPractice = state.stage === "3" && state.specialMode === "3-3";
  const isBoundaryPractice = state.stage === "3" && state.specialMode === "3-4";

  if (state.stage === "2") {
    const raw = els.lengthInput.value;
    hasEmpty = !raw.trim();
    const lengthCorrect = nearlyEqual(parseMath(raw), state.current.values[state.current.missing]);
    allCorrect = allCorrect && lengthCorrect;
    if (raw.trim() && !lengthCorrect) hasWrong = true;
    els.lengthInput.style.borderColor = lengthCorrect ? "#5a9c72" : "#c94e43";
    els.lengthInput.style.background = lengthCorrect ? "#f0f8f2" : "#fff7f5";
  }

  if (isBoundaryPractice) {
    const raw = els.boundaryAngleInput.value;
    const correct = nearlyEqual(parseMath(raw), state.current.boundary.value);
    hasEmpty = !raw.trim();
    allCorrect = correct;
    if (raw.trim() && !correct) hasWrong = true;
    els.boundaryAngleAnswer.classList.toggle("correct", correct);
    els.boundaryAngleAnswer.classList.toggle("incorrect", !correct);
    els.boundaryResultMark.textContent = correct ? "✓" : "×";
  } else if (isSpecialLengthPractice) {
    els.specialLengthRows.filter(row => !row.hidden).forEach(row => {
      const input = row.querySelector("input");
      const correct = nearlyEqual(parseMath(input.value), state.current.values[row.dataset.specialSide]);
      if (!input.value.trim()) hasEmpty = true;
      row.classList.toggle("correct", correct);
      row.classList.toggle("incorrect", !correct);
      row.querySelector(".result-mark").textContent = correct ? "✓" : "×";
      allCorrect = allCorrect && correct;
      if (input.value.trim() && !correct) hasWrong = true;
    });
  } else {
    const expected = {
      sin: state.current.values.opposite / state.current.values.hyp,
      cos: state.current.values.adjacent / state.current.values.hyp,
      tan: state.current.values.opposite / state.current.values.adjacent
    };
    activeRatioRows().forEach(row => {
      const numeratorInput = row.querySelector('[data-part="numerator"]');
      const denominatorInput = row.querySelector('[data-part="denominator"]');
      const refinement = row.querySelector(".refinement-answer");
      const initialMark = row.querySelector(".initial-result-mark");

      if (refinement.hidden) {
        const numeratorRaw = numeratorInput.value;
        const denominatorRaw = denominatorInput.value;
        if (!numeratorRaw.trim() || !denominatorRaw.trim()) hasEmpty = true;
        const numerator = parseMath(numeratorRaw);
        const denominator = parseMath(denominatorRaw);
        const equivalent = denominator !== 0 && nearlyEqual(numerator / denominator, expected[row.dataset.ratio]);

        if (!equivalent) {
          row.classList.remove("correct", "partial", "needs-refinement");
          row.classList.add("incorrect");
          initialMark.textContent = "×";
          allCorrect = false;
          if (numeratorRaw.trim() && denominatorRaw.trim()) hasWrong = true;
          return;
        }

        const issue = fractionRefinementIssue(numeratorRaw, denominatorRaw);
        if (issue) {
          refinement.hidden = false;
          row.classList.remove("correct", "incorrect");
          row.classList.add("partial", "needs-refinement");
          numeratorInput.disabled = true;
          denominatorInput.disabled = true;
          initialMark.textContent = "✓";
          refinementIssues.add(issue);
          firstRefinementInput ||= refinement.querySelector('[data-refined-part="numerator"]');
          allCorrect = false;
          return;
        }

        row.classList.remove("incorrect", "partial", "needs-refinement");
        row.classList.add("correct");
        initialMark.textContent = "✓";
        return;
      }

      const refinedNumeratorInput = refinement.querySelector('[data-refined-part="numerator"]');
      const refinedDenominatorInput = refinement.querySelector('[data-refined-part="denominator"]');
      const numeratorRaw = refinedNumeratorInput.value;
      const denominatorRaw = refinedDenominatorInput.value;
      if (!numeratorRaw.trim() || !denominatorRaw.trim()) hasEmpty = true;
      const numerator = parseMath(numeratorRaw);
      const denominator = parseMath(denominatorRaw);
      const equivalent = denominator !== 0 && nearlyEqual(numerator / denominator, expected[row.dataset.ratio]);
      const issue = equivalent ? fractionRefinementIssue(numeratorRaw, denominatorRaw) : null;
      const refinedCorrect = equivalent && !issue;

      refinement.classList.toggle("correct", refinedCorrect);
      refinement.classList.toggle("incorrect", !refinedCorrect && !issue);
      refinement.querySelector(".refinement-result-mark").textContent = refinedCorrect ? "✓" : equivalent ? "!" : "×";
      row.classList.toggle("correct", refinedCorrect);
      row.classList.toggle("partial", !refinedCorrect);
      row.classList.remove("incorrect");
      allCorrect = allCorrect && refinedCorrect;
      if (issue) {
        refinementIssues.add(issue);
        firstRefinementInput ||= refinedNumeratorInput;
      } else if (numeratorRaw.trim() && denominatorRaw.trim() && !equivalent) {
        hasWrong = true;
      }
    });
  }

  if (hasEmpty) {
    const message = isBoundaryPractice
      ? "삼각비의 값을 입력해 주세요."
      : isSpecialLengthPractice
      ? "물음표로 표시된 두 변의 길이를 모두 입력해 주세요."
      : state.stage === "2"
      ? "빠진 변의 길이와 선택한 삼각비의 분자·분모를 모두 입력해 주세요."
      : "선택한 삼각비의 분자와 분모를 모두 입력해 주세요.";
    setFeedback("error", "빈칸이 있어요.", message);
    return;
  }

  if (refinementIssues.size && !hasWrong) {
    const title = refinementIssues.size > 1
      ? "맞았습니다. 약분하고 분모를 유리화하세요."
      : refinementIssues.has("rationalize")
        ? "맞았습니다. 분모를 유리화하세요."
        : "맞았습니다. 약분하세요.";
    setFeedback("", title, "오른쪽에 새로 생긴 분수 칸에 정리한 값을 입력하세요.");
    firstRefinementInput?.focus();
    return;
  }

  state.attempts += 1;
  if (allCorrect) {
    const reachedStageOneGoal = state.stage === "1" && !state.stageTwoUnlocked
      && state.stageOneCorrect + 1 >= STAGE_ONE_GOAL;
    state.answered = true;
    state.solved += 1;
    state.correct += 1;
    state.stageScores[state.stage] += 1;
    if (state.stage === "1") state.stageOneCorrect += 1;
    state.streak += 1;
    state.bestStreak = Math.max(state.bestStreak, state.streak);
    const successMessage = reachedStageOneGoal
      ? answerExplanation()
      : `${answerExplanation()} 잠시 후 다음 문제로 넘어갑니다.`;
    setFeedback("success", "정답이에요!", successMessage);
    els.checkButton.hidden = true;
    els.resetButton.hidden = true;
    els.nextButton.hidden = false;
    disableInputs(true);
    updateStageGoal();
    if (reachedStageOneGoal) showStageChoice();
    else scheduleNextQuestion();
  } else {
    state.streak = 0;
    setFeedback("error", "한 번 더 살펴보세요.", wrongAnswerHint());
  }
  updateProgress();
}

function answerExplanation() {
  const q = state.current;
  const ratioRule = state.ratioMode === "all"
    ? "sin A는 대변/빗변, cos A는 인접변/빗변, tan A는 대변/인접변"
    : state.ratioMode === "sin" ? "sin A는 대변/빗변"
      : state.ratioMode === "cos" ? "cos A는 인접변/빗변"
        : "tan A는 대변/인접변";
  if (state.stage === "3") {
    if (state.specialMode === "3-4") {
      return `${q.boundary.label} = ${q.boundary.value}입니다.`;
    }
    if (state.specialMode === "3-3") {
      const sideNames = { adjacent: "변 AB", opposite: "변 BC", hyp: "변 AC" };
      const answers = q.missingSides.map(role => `${sideNames[role]} = ${q.labels[role]}`).join(", ");
      return `${q.angle}° 특수 직각삼각형의 변의 비를 이용하면 ${answers}입니다.`;
    }
    const ratios = state.ratioMode === "all" ? ["sin", "cos", "tan"] : [state.ratioMode];
    const values = ratios.map(ratio => `${ratio} ${q.angle}° = ${specialAngleAnswers[q.angle][ratio]}`).join(", ");
    return `${q.angle}°의 특수각 값은 ${values}입니다.`;
  }
  if (state.stage === "2") {
    const lengthRule = q.missing === "hyp"
      ? `빗변² = ${q.labels.adjacent}² + ${q.labels.opposite}²`
      : "빗변의 제곱에서 주어진 짧은 변의 제곱을 빼기";
    return `${lengthRule}와 ${ratioRule}을 잘 이용했어요.`;
  }
  return `${ratioRule}입니다.`;
}

function wrongAnswerHint() {
  if (state.stage === "3" && state.specialMode === "3-4") {
    return "단위원에서 0°는 점 (1, 0), 90°는 점 (0, 1)이고, cos는 x좌표, sin은 y좌표예요.";
  }
  if (state.stage === "3") return state.current.angle === 45
    ? "45°-45°-90° 삼각형의 변의 비 1 : 1 : √2를 이용해 보세요."
    : "30°-60°-90° 삼각형에서 30°의 대변부터 1 : √3 : 2 순서예요.";
  if (state.stage === "2") return state.current.missing === "hyp"
    ? "두 짧은 변의 제곱을 더해 빗변을 구한 뒤, 선택한 삼각비에 넣어 보세요."
    : "빗변의 제곱에서 알고 있는 짧은 변의 제곱을 뺀 뒤, 선택한 삼각비에 넣어 보세요.";
  return "직각의 맞은편이 빗변이에요. 그다음 각 A와 마주 보는 대변을 찾아보세요.";
}

function setFeedback(type, title, body) {
  els.feedback.className = `feedback${type ? ` ${type}` : ""}`;
  els.feedback.querySelector(".feedback-icon").textContent = type === "success" ? "✓" : type === "error" ? "!" : "✦";
  els.feedback.querySelector("b").textContent = title;
  els.feedback.querySelector("p").textContent = body;
}

function clearInputs() {
  els.stageComplete.hidden = true;
  document.querySelectorAll(".formula-row").forEach(row => {
    row.classList.remove("correct", "incorrect", "partial", "needs-refinement");
    row.querySelectorAll("input").forEach(input => { input.value = ""; input.disabled = false; });
    row.querySelectorAll(".result-mark").forEach(mark => { mark.textContent = ""; });
    const refinement = row.querySelector(".refinement-answer");
    refinement.hidden = true;
    refinement.classList.remove("correct", "incorrect");
  });
  els.lengthInput.value = "";
  els.lengthInput.disabled = false;
  els.lengthInput.removeAttribute("style");
  els.specialLengthRows.forEach(row => {
    row.classList.remove("correct", "incorrect");
    const input = row.querySelector("input");
    input.value = "";
    input.disabled = false;
    row.querySelector(".result-mark").textContent = "";
  });
  els.boundaryAngleInput.value = "";
  els.boundaryAngleInput.disabled = false;
  els.boundaryAngleAnswer.classList.remove("correct", "incorrect");
  els.boundaryResultMark.textContent = "";
  resetCalculator();
  els.checkButton.hidden = false;
  els.resetButton.hidden = false;
  els.nextButton.hidden = true;
  resetMathInputPreviews();
  setFeedback("", "차근차근 풀어 보세요.", state.stage === "2"
    ? "빠진 변을 먼저 구한 뒤 선택한 삼각비까지 완성하세요."
    : state.stage === "3" && state.specialMode === "3-3"
      ? "주어진 변을 기준으로 특수 직각삼각형의 나머지 두 변을 구하세요."
      : state.stage === "3" && state.specialMode === "3-4"
        ? "단위원의 좌표를 떠올리며 0°와 90°의 삼각비 값을 입력하세요."
      : state.stage === "3" && state.specialMode === "3-2"
        ? "그림 없이 특수각의 sin, cos, tan 값을 바로 써 보세요."
        : state.stage === "3"
          ? "특수 직각삼각형의 변의 비를 떠올려 선택한 삼각비를 완성하세요."
      : `${ratioInfo[state.ratioMode].label}에 필요한 변을 그림에서 찾아보세요.`);
}

function disableInputs(disabled) {
  document.querySelectorAll(".answer-panel input").forEach(input => { input.disabled = disabled; });
}

function resetCurrentAnswer() {
  if (state.answered) return;
  clearInputs();
  if (state.stage === "2") renderQuestion();
  const first = state.stage === "2"
    ? els.lengthInput
    : state.stage === "3" && state.specialMode === "3-3"
      ? els.specialLengthRows.find(row => !row.hidden).querySelector("input")
      : state.stage === "3" && state.specialMode === "3-4"
        ? els.boundaryAngleInput
      : activeRatioRows()[0].querySelector("input");
  first.focus();
}

function changeRatioMode(mode) {
  if (state.pendingStageChoice) return;
  if (mode === state.ratioMode) return;
  state.ratioMode = mode;
  syncRatioMode();
  if (state.answered) {
    makeQuestion();
    return;
  }
  clearInputs();
  renderQuestion();
}

function changeAngleMode(mode) {
  if (state.pendingStageChoice || mode === state.angleMode) return;
  state.angleMode = mode;
  syncAngleMode();
  if (state.stage !== "3") return;
  updateSpecialStageCopy();
  makeQuestion();
}

function changeSpecialMode(mode) {
  if (state.pendingStageChoice || mode === state.specialMode) return;
  state.specialMode = mode;
  if (["3-1", "3-2"].includes(mode)) state.ratioMode = "all";
  if (mode === "3-3" && !["30", "45", "mixed"].includes(state.angleMode)) state.angleMode = "mixed";
  state.activeMathInput = null;
  syncRatioMode();
  syncSpecialMode();
  makeQuestion();
}

function changeStage(stage, force = false) {
  if (["2", "3"].includes(stage) && !state.stageTwoUnlocked) return;
  if (state.pendingStageChoice && !force) return;
  state.pendingStageChoice = false;
  state.activeMathInput = null;
  els.stageComplete.hidden = true;
  state.stage = stage;
  if (stage === "3" && ["3-1", "3-2"].includes(state.specialMode)) state.ratioMode = "all";
  const info = stageInfo[stage];
  els.tabs.forEach(tab => {
    const active = tab.dataset.stage === stage;
    tab.classList.toggle("active", active);
    tab.setAttribute("aria-current", active ? "step" : "false");
  });
  els.stageScoreCards.forEach(card => {
    card.classList.toggle("active", card.dataset.scoreStage === stage);
  });
  els.stageBadge.textContent = `${stage}단계`;
  els.stageTitle.textContent = info.title;
  els.stageDescription.textContent = info.description;
  els.practiceGrid.classList.toggle("stage-two", stage === "2");
  const hintTitle = stage === "2" ? "피타고라스 정리를 떠올려 보세요."
    : stage === "3" ? "특수 직각삼각형의 변의 비를 떠올려 보세요."
      : "각 A에서 바라보세요.";
  els.hintText.innerHTML = `<b>${hintTitle}</b><p>${info.hint}</p>`;
  els.trigAnswers.hidden = false;
  els.mathSymbolToolbar.hidden = false;
  els.lengthAnswer.hidden = stage !== "2";
  els.mathCalculator.hidden = stage !== "2";
  els.calculatorBody.hidden = stage !== "2";
  els.calculatorToggle.setAttribute("aria-expanded", String(stage === "2"));
  els.hintPanel.hidden = true;
  els.hintButton.setAttribute("aria-expanded", "false");
  syncRatioMode();
  syncSpecialMode();
  updateStageGoal();
  makeQuestion();
}

function updateProgress() {
  const totalStageScore = Object.values(state.stageScores).reduce((sum, score) => sum + score, 0);
  els.totalStageScore.textContent = totalStageScore;
  Object.entries(els.stageScoreValues).forEach(([stage, element]) => {
    element.textContent = state.stageScores[stage];
  });
  els.totalCorrect.textContent = state.correct;
  els.streak.textContent = state.streak;
  els.solvedCount.textContent = state.solved;
  els.accuracy.textContent = state.attempts ? Math.round(state.correct / state.attempts * 100) : 0;
  els.bestStreak.textContent = state.bestStreak;
}

initializeMathInputPreviews();

els.tabs.forEach(tab => tab.addEventListener("click", () => changeStage(tab.dataset.stage)));
els.ratioButtons.forEach(button => button.addEventListener("click", () => changeRatioMode(button.dataset.ratioOption)));
els.specialModeButtons.forEach(button => button.addEventListener("click", () => changeSpecialMode(button.dataset.specialMode)));
els.angleButtons.forEach(button => button.addEventListener("click", () => changeAngleMode(button.dataset.angleOption)));
els.continueStageOne.addEventListener("click", () => {
  state.pendingStageChoice = false;
  els.stageComplete.hidden = true;
  makeQuestion();
});
els.goToStageTwo.addEventListener("click", () => changeStage("2", true));
els.hintButton.addEventListener("click", () => {
  const willOpen = els.hintPanel.hidden;
  els.hintPanel.hidden = !willOpen;
  els.hintButton.setAttribute("aria-expanded", String(willOpen));
});
els.checkButton.addEventListener("click", checkAnswer);
els.resetButton.addEventListener("click", resetCurrentAnswer);
els.nextButton.addEventListener("click", makeQuestion);
els.calculatorToggle.addEventListener("click", () => {
  const willOpen = els.calculatorBody.hidden;
  els.calculatorBody.hidden = !willOpen;
  els.calculatorToggle.setAttribute("aria-expanded", String(willOpen));
  if (willOpen) els.calcFirst.focus();
});
els.operationButtons.forEach(button => button.addEventListener("click", () => {
  els.operationButtons.forEach(item => {
    const active = item === button;
    item.classList.toggle("active", active);
    item.setAttribute("aria-pressed", String(active));
  });
  calculateSquares();
}));
els.calcFirst.addEventListener("input", calculateSquares);
els.calcSecond.addEventListener("input", calculateSquares);
els.lengthInput.addEventListener("input", () => {
  if (state.stage === "2" && state.current) renderQuestion();
});
els.calculateButton.addEventListener("click", toggleCalculationSteps);
els.insertRootButton.addEventListener("click", () => insertMathSymbol("√"));
els.calculatorRootButton.addEventListener("click", insertCalculatorRoot);
document.querySelectorAll("[data-root-target]").forEach(button => {
  button.addEventListener("click", () => {
    insertMathSymbol("√", document.getElementById(button.dataset.rootTarget));
  });
});
document.querySelectorAll(".answer-panel input").forEach(input => input.addEventListener("focus", () => {
  state.activeMathInput = input;
}));
document.querySelectorAll("input").forEach(input => input.addEventListener("keydown", event => {
  if (event.key !== "Enter") return;
  event.preventDefault();
  if (input.closest(".math-calculator")) toggleCalculationSteps();
  else checkAnswer();
}));

const requestedStage = new URLSearchParams(window.location.search).get("stage");
const requestedRatio = new URLSearchParams(window.location.search).get("ratio");
const requestedAngle = new URLSearchParams(window.location.search).get("angle");
const requestedSpecialMode = new URLSearchParams(window.location.search).get("special");
if (["sin", "cos", "tan", "all"].includes(requestedRatio)) state.ratioMode = requestedRatio;
if (["30", "45", "60", "mixed"].includes(requestedAngle)) state.angleMode = requestedAngle;
if (["3-1", "3-2", "3-3", "3-4"].includes(requestedSpecialMode)) state.specialMode = requestedSpecialMode;
const initialStage = { "1": "1", "1-1": "1", "1-2": "1" }[requestedStage] || "1";
changeStage(initialStage);
