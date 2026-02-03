/* settings.js - Planfit Settings Page (v1)
  - weekGoal, accent, compact 저장/적용
  - localStorage 기반
*/

const SETTINGS_KEY = "planfit_settings_v1";
const RECORDS_KEY = "planfit_records_v1";

const $ = (sel) => document.querySelector(sel);

const weekGoalInput = $("#weekGoalInput");
const btnSaveGoal = $("#btnSaveGoal");
const goalTag = $("#goalTag");
const goalHint = $("#goalHint");

const accentSelect = $("#accentSelect");
const compactMode = $("#compactMode");
const btnApplyUi = $("#btnApplyUi");
const uiTag = $("#uiTag");

const btnClearRecords = $("#btnClearRecords");
const btnClearSettings = $("#btnClearSettings");
const btnClearAll = $("#btnClearAll");
const dataTag = $("#dataTag");
const dataHint = $("#dataHint");

function loadSettings(){
  try{
    return JSON.parse(localStorage.getItem(SETTINGS_KEY)) || {};
  }catch{
    return {};
  }
}
function saveSettings(obj){
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(obj));
}

function clampInt(v, min, max, fallback){
  const n = parseInt(v, 10);
  if(!Number.isFinite(n)) return fallback;
  return Math.max(min, Math.min(max, n));
}

function setTag(el, text){
  if(el) el.textContent = text;
}

function applySettingsToUI(s){
  // accent: CSS에서 :root[data-accent="..."]로 처리 (style.css 패치 필요)
  const accent = s.accent || "mint";
  document.documentElement.setAttribute("data-accent", accent);

  // compact: body.compact 토글
  document.body.classList.toggle("compact", !!s.compact);
}

function init(){
  // DOM 없는 경우 안전 종료
  if(!weekGoalInput || !btnSaveGoal || !accentSelect || !compactMode || !btnApplyUi) return;

  const s = loadSettings();

  // 초기값 반영
  const goal = clampInt(s.weekGoal ?? 3, 1, 14, 3);
  weekGoalInput.value = String(goal);

  accentSelect.value = s.accent || "mint";
  compactMode.checked = !!s.compact;

  applySettingsToUI({
    weekGoal: goal,
    accent: accentSelect.value,
    compact: compactMode.checked
  });

  setTag(goalTag, "저장됨");
  if(goalHint) goalHint.textContent = `현재 목표: 주 ${goal}회`;

  setTag(uiTag, `${accentSelect.value}${compactMode.checked ? " · compact" : ""}`);

  // 목표 저장
  btnSaveGoal.addEventListener("click", () => {
    const next = loadSettings();
    const g = clampInt(weekGoalInput.value, 1, 14, 3);
    weekGoalInput.value = String(g);

    next.weekGoal = g;
    saveSettings(next);

    setTag(goalTag, "저장됨");
    if(goalHint) goalHint.textContent = `현재 목표: 주 ${g}회`;
  });

  // UI 적용
  btnApplyUi.addEventListener("click", () => {
    const next = loadSettings();
    next.accent = accentSelect.value;
    next.compact = compactMode.checked;

    saveSettings(next);
    applySettingsToUI(next);

    setTag(uiTag, `${next.accent}${next.compact ? " · compact" : ""}`);
  });

  // 데이터 초기화
  btnClearRecords.addEventListener("click", () => {
    if(!confirm("운동 기록을 초기화할까요? (되돌릴 수 없어요)")) return;
    localStorage.removeItem(RECORDS_KEY);
    setTag(dataTag, "기록 초기화 완료");
    if(dataHint) dataHint.textContent = "운동 기록(localStorage)이 초기화되었습니다.";
  });

  btnClearSettings.addEventListener("click", () => {
    if(!confirm("설정을 초기화할까요?")) return;
    localStorage.removeItem(SETTINGS_KEY);
    setTag(dataTag, "설정 초기화 완료");
    if(dataHint) dataHint.textContent = "설정(localStorage)이 초기화되었습니다.";
    location.reload();
  });

  btnClearAll.addEventListener("click", () => {
    if(!confirm("전체 데이터를 초기화할까요? (기록+설정)")) return;
    localStorage.removeItem(RECORDS_KEY);
    localStorage.removeItem(SETTINGS_KEY);
    setTag(dataTag, "전체 초기화 완료");
    if(dataHint) dataHint.textContent = "전체 데이터가 초기화되었습니다.";
    location.reload();
  });
}

document.addEventListener("DOMContentLoaded", init);