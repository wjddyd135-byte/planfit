/* record.js - Planfit Record Page
  - localStorage로 날짜별 기록 저장
  - 체크/해제 즉시 저장
  - a11y: progressbar aria-valuenow 업데이트
*/

const LS_KEY = "planfit_records_v1";
const WEEK_GOAL = 3;

const $ = (sel) => document.querySelector(sel);

// ===== DOM =====
const elWeekCount  = $("#weekCount");
const elWeekGoal   = $("#weekGoal");
const elWeekBar    = $("#weekBar");
const elWeekProg   = $("#weekProgress");

const elPickedDate = $("#pickedDate");
const elDayBar     = $("#dayBar");
const elDayProg    = $("#dayProgress"); 
const elDoneCount  = $("#doneCount");
const elTotalCount = $("#totalCount");
const elRecordList = $("#recordList");
const elDayTag     = $("#dayTag");

const btnPrev    = $("#btnPrev");
const btnToday   = $("#btnToday");
const btnNext    = $("#btnNext");
const btnAddMock = $("#btnAddMock");


function pad2(n) { return String(n).padStart(2, "0"); }
function toKeyDate(d){
  return `${d.getFullYear()}-${pad2(d.getMonth()+1)}-${pad2(d.getDate())}`;
}
function formatKorean(d){
  return `${d.getFullYear()}.${pad2(d.getMonth()+1)}.${pad2(d.getDate())}`;
}

function loadDB(){
  try{
    return JSON.parse(localStorage.getItem(LS_KEY)) || {};
  }catch{
    return {};
  }
}
function saveDB(db){
  localStorage.setItem(LS_KEY, JSON.stringify(db));
}

function getWeekStart(date){
  const d = new Date(date);
  const day = d.getDay(); 
  const diff = (day === 0 ? -6 : 1) - day; 
  d.setDate(d.getDate() + diff);
  d.setHours(0,0,0,0);
  return d;
}

function countWeekWorkouts(db, date){
  const start = getWeekStart(date);
  const keys = [];
  for(let i=0;i<7;i++){
    const t = new Date(start);
    t.setDate(start.getDate() + i);
    keys.push(toKeyDate(t));
  }
  let count = 0;
  for(const k of keys){
    const arr = db[k] || [];
    const doneAny = arr.some(x => x.done === true);
    if(doneAny) count++;
  }
  return count;
}

function ensureDay(db, key){
  if(!db[key]) db[key] = []; 
}

const state = { date: new Date() };
state.date.setHours(0,0,0,0);

function setProgress(barEl, progEl, pct){
  const safe = Math.max(0, Math.min(100, Number.isFinite(pct) ? pct : 0));
  if(barEl) barEl.style.width = `${safe}%`;
  if(progEl) progEl.setAttribute("aria-valuenow", String(safe));
}

function renderDay(db, date){
  const key = toKeyDate(date);
  ensureDay(db, key);

  if (elPickedDate) elPickedDate.textContent = formatKorean(date);

  const items = db[key];
  const total = items.length;
  const done  = items.filter(x => x.done).length;

  if (elDoneCount)  elDoneCount.textContent  = String(done);
  if (elTotalCount) elTotalCount.textContent = String(total);

  const pct = total === 0 ? 0 : Math.round((done/total) * 100);
  setProgress(elDayBar, elDayProg, pct);

  if(elDayTag){
    if(total === 0) elDayTag.textContent = "REST";
    else if(done === total) elDayTag.textContent = "DONE";
    else elDayTag.textContent = "IN PROGRESS";
  }

  if(!elRecordList) return;
  elRecordList.innerHTML = "";

  if(total === 0){
    const empty = document.createElement("div");
    empty.className = "muted";
    empty.style.padding = "8px 0";
    empty.textContent = "아직 기록이 없어요. 아래 버튼으로 샘플을 추가해보세요!";
    elRecordList.appendChild(empty);
    return;
  }

  items.forEach((it, idx) => {
    const row = document.createElement("div");
    row.className = "item";

    const left = document.createElement("div");
    left.className = "item-left";

    const dot = document.createElement("div");
    dot.className = "dot";
    dot.style.opacity = it.done ? "1" : ".35";

    const info = document.createElement("div");

    const title = document.createElement("div");
    title.className = "item-title";
    title.textContent = it.name || "운동";

    const meta = document.createElement("div");
    meta.className = "item-meta";
    const sets = it.sets ? `세트: ${it.sets}` : "세트: -";
    const memo = it.memo ? ` · ${it.memo}` : "";
    meta.textContent = `${sets}${memo}`;

    info.appendChild(title);
    info.appendChild(meta);

    left.appendChild(dot);
    left.appendChild(info);

    const right = document.createElement("div");
    right.style.display = "flex";
    right.style.flexDirection = "column";
    right.style.alignItems = "flex-end";
    right.style.gap = "8px";

    const tag = document.createElement("span");
    tag.className = "tag";
    tag.textContent = it.done ? "완료" : "미완료";

    const check = document.createElement("input");
    check.type = "checkbox";
    check.checked = !!it.done;
    check.setAttribute("aria-label", "운동 완료 체크");
    check.addEventListener("change", () => {
      it.done = check.checked;
      saveDB(db);
      renderAll(db);
    });

    const del = document.createElement("button");
    del.className = "pill";
    del.type = "button";
    del.textContent = "삭제";
    del.setAttribute("aria-label", `${title.textContent} 기록 삭제`);
    del.addEventListener("click", () => {
      db[key].splice(idx, 1);
      saveDB(db);
      renderAll(db);
    });

    right.appendChild(tag);
    right.appendChild(check);
    right.appendChild(del);

    row.appendChild(left);
    row.appendChild(right);

    elRecordList.appendChild(row);
  });
}

function renderWeek(db, date){
  const count = countWeekWorkouts(db, date);

  if (elWeekCount) elWeekCount.textContent = String(count);
  if (elWeekGoal)  elWeekGoal.textContent  = String(WEEK_GOAL);

  const pct = Math.min(100, Math.round((count / WEEK_GOAL) * 100));
  setProgress(elWeekBar, elWeekProg, pct);
}

function renderAll(db){
  renderWeek(db, state.date);
  renderDay(db, state.date);
}

function addMockRecord(db, date){
  const key = toKeyDate(date);
  ensureDay(db, key);

  const samples = [
    { name: "벤치프레스", sets: "4 x 8",  memo: "가슴", done: false },
    { name: "랫풀다운",   sets: "4 x 10", memo: "등",   done: false },
    { name: "스쿼트",     sets: "4 x 8",  memo: "하체", done: false },
  ];

  const pick = samples[Math.floor(Math.random() * samples.length)];
  db[key].push(pick);
  saveDB(db);
}

function moveDay(delta){
  const d = new Date(state.date);
  d.setDate(d.getDate() + delta);
  d.setHours(0,0,0,0);
  state.date = d;
}

function init(){
  if(!btnPrev || !btnToday || !btnNext || !btnAddMock) return;

  const db = loadDB();
  renderAll(db);

  btnPrev.addEventListener("click", () => {
    moveDay(-1);
    renderAll(loadDB());
  });

  btnNext.addEventListener("click", () => {
    moveDay(1);
    renderAll(loadDB());
  });

  btnToday.addEventListener("click", () => {
    state.date = new Date();
    state.date.setHours(0,0,0,0);
    renderAll(loadDB());
  });

  btnAddMock.addEventListener("click", () => {
    const db2 = loadDB();
    addMockRecord(db2, state.date);
    renderAll(db2);
  });
}

document.addEventListener("DOMContentLoaded", init);