const catalog = [
  {id:"glock", name:"Glock-18 | Candy Apple", value:100, emoji:"🔫", rarity:"Consumer"},
  {id:"usp", name:"USP-S | Ticket to Hell", value:250, emoji:"🔫", rarity:"Mil-Spec"},
  {id:"ak", name:"AK-47 | Slate", value:500, emoji:"🎯", rarity:"Restricted"},
  {id:"awp", name:"AWP | Atheris", value:900, emoji:"🎯", rarity:"Classified"},
  {id:"m4", name:"M4A1-S | Decimator", value:1500, emoji:"🔫", rarity:"Classified"},
  {id:"neon", name:"AK-47 | Neon Rider", value:3000, emoji:"⚡", rarity:"Covert"},
  {id:"knife", name:"★ Shadow Daggers", value:5000, emoji:"🗡️", rarity:"Rare"}
];

const state = {
  balance: 1000,
  inventory: [catalog[0], catalog[1], catalog[2]],
  source: null,
  target: null,
  busy: false
};

const $ = (id) => document.getElementById(id);
const fmt = (n) => n.toLocaleString("ru-RU");
function toast(message) {
  const el = $("toast"); el.textContent = message; el.classList.add("show");
  clearTimeout(toast.timer); toast.timer = setTimeout(() => el.classList.remove("show"), 2300);
}
function chanceValue() {
  if (!state.source || !state.target) return 0;
  return Math.max(3, Math.min(95, Math.floor(state.source.value / state.target.value * 100)));
}
function renderBalance() { $("balance").textContent = fmt(state.balance); }
function renderPicker() {
  $("source-picker").innerHTML = "";
  $("target-picker").innerHTML = "";
  state.inventory.forEach((skin, index) => {
    $("source-picker").appendChild(makeSkinButton(skin, "source", index));
  });
  catalog.forEach((skin, index) => {
    $("target-picker").appendChild(makeSkinButton(skin, "target", index));
  });
}
function makeSkinButton(skin, type, index) {
  const btn = document.createElement("button");
  btn.className = "skin-option" + ((type === "source" ? state.source?.id : state.target?.id) === skin.id ? " selected" : "");
  btn.innerHTML = `<span class="mini-emoji">${skin.emoji}</span><b>${skin.name.split("|")[1] || skin.name}</b><small>${fmt(skin.value)} BP</small>`;
  btn.addEventListener("click", () => {
    if (type === "source") state.source = skin; else state.target = skin;
    renderUpgrade(); renderPicker();
  });
  return btn;
}
function renderSlot(id, skin, emptyTitle) {
  const slot = $(id);
  if (!skin) {
    slot.innerHTML = `<div class="slot-placeholder"><div class="slot-plus">＋</div><b>${emptyTitle}</b><small>${id === "source-slot" ? "Предмет из твоего инвентаря" : "Предмет, который хочешь получить"}</small></div>`;
    return;
  }
  slot.innerHTML = `<div class="skin-preview"><div class="skin-emoji">${skin.emoji}</div><strong>${skin.name}</strong><small>${fmt(skin.value)} BP · ${skin.rarity}</small></div>`;
}
function renderUpgrade() {
  renderSlot("source-slot", state.source, "Выбери исходный скин");
  renderSlot("target-slot", state.target, "Выбери целевой скин");
  const chance = chanceValue();
  $("chance").textContent = chance + "%";
  $("chance-ring").style.background = `conic-gradient(#aa72ff ${chance * 3.6}deg,#382b49 0deg)`;
  const valid = state.source && state.target && state.target.value > state.source.value && !state.busy;
  $("upgrade-button").disabled = !valid;
  $("upgrade-hint").textContent = !state.source || !state.target ? "Выбери два предмета" :
    state.target.value <= state.source.value ? "Целевой скин должен быть дороже" : "При успехе скин добавится в коллекцию";
}
function renderInventory() {
  const grid = $("inventory-grid");
  $("inventory-count").textContent = state.inventory.length;
  const total = state.inventory.reduce((sum, item) => sum + item.value, 0);
  $("inventory-total").textContent = "Стоимость: " + fmt(total) + " BP";
  $("leader-value").textContent = fmt(total) + " BP";
  grid.innerHTML = "";
  if (!state.inventory.length) {
    grid.innerHTML = '<div class="empty-state"><b>Пока пусто</b>Получи бесплатный предмет в разделе Roulette.</div>';
    return;
  }
  state.inventory.forEach(item => {
    const card = document.createElement("div"); card.className = "inventory-card";
    card.innerHTML = `<div class="item-emoji">${item.emoji}</div><strong>${item.name}</strong><small>${fmt(item.value)} BP</small>`;
    grid.appendChild(card);
  });
}
function showResult(success, skin) {
  $("result-icon").textContent = success ? "✦" : "↻";
  $("result-title").textContent = success ? "Успешная прокачка!" : "В этот раз не получилось";
  $("result-text").textContent = success
    ? `${skin.name} добавлен в твой инвентарь. Это виртуальный предмет демоверсии.`
    : "Попробуй выбрать другую цель. Исходный предмет остался в инвентаре.";
  $("result-modal").classList.add("show");
}
$("upgrade-button").addEventListener("click", () => {
  if ($("upgrade-button").disabled || state.busy) return;
  state.busy = true; renderUpgrade();
  $("upgrade-button").textContent = "ПРОВЕРЯЕМ...";
  const source = state.source, target = state.target, chance = chanceValue();
  setTimeout(() => {
    const success = Math.random() * 100 < chance;
    if (success) state.inventory.push(target);
    state.busy = false; $("upgrade-button").innerHTML = 'ПРОКАЧАТЬ <span>↗</span>';
    renderPicker(); renderUpgrade(); renderInventory();
    showResult(success, target);
  }, 1100);
});
function renderRouletteTrack() {
  const track = $("roulette-track"); track.innerHTML = "";
  for (let i = 0; i < 18; i++) {
    const skin = catalog[(i * 3 + 1) % catalog.length];
    const card = document.createElement("div"); card.className = "roulette-card";
    card.innerHTML = `<span>${skin.emoji}</span><b>${skin.name.split("|")[1] || skin.name}</b>`;
    track.appendChild(card);
  }
}
$("roulette-button").addEventListener("click", () => {
  if (state.busy) return;
  state.busy = true;
  const btn = $("roulette-button"); btn.disabled = true; btn.textContent = "РУЛЕТКА КРУТИТСЯ...";
  const winner = catalog[Math.floor(Math.random() * catalog.length)];
  const track = $("roulette-track");
  track.style.transition = "none"; track.style.transform = "translateX(0)";
  requestAnimationFrame(() => requestAnimationFrame(() => {
    track.style.transition = "transform 3.5s cubic-bezier(.12,.72,.08,1)";
    const cardWidth = 122;
    const targetIndex = 13;
    const offset = targetIndex * cardWidth - ($("roulette-track-wrap").clientWidth / 2) + 56;
    track.style.transform = `translateX(-${offset}px)`;
  }));
  setTimeout(() => {
    state.inventory.push(winner);
    renderInventory(); renderPicker();
    $("roulette-result").textContent = `Выпало: ${winner.name} · ${fmt(winner.value)} BP`;
    btn.disabled = false; btn.innerHTML = 'ПОЛУЧИТЬ СКИН <span>✦</span>';
    state.busy = false; toast("Новый предмет добавлен в инвентарь!");
  }, 3700);
});
document.querySelectorAll(".nav-item").forEach(button => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".nav-item").forEach(b => b.classList.remove("active"));
    document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
    button.classList.add("active");
    $("page-" + button.dataset.page).classList.add("active");
  });
});
$("modal-close").addEventListener("click", () => $("result-modal").classList.remove("show"));
$("result-ok").addEventListener("click", () => $("result-modal").classList.remove("show"));
$("result-modal").addEventListener("click", e => { if (e.target === $("result-modal")) $("result-modal").classList.remove("show"); });

renderBalance(); renderPicker(); renderUpgrade(); renderInventory(); renderRouletteTrack();

// Telegram Mini App integration (works as a normal webpage too).
if (window.Telegram?.WebApp) {
  const tg = window.Telegram.WebApp;
  tg.ready();
  tg.expand();
  try { tg.setHeaderColor("#100d19"); tg.setBackgroundColor("#100d19"); } catch (_) {}
  if (tg.initDataUnsafe?.user) {
    const user = tg.initDataUnsafe.user;
    $("avatar").textContent = (user.first_name || "G").slice(0, 1).toUpperCase();
    $("leader-name").innerHTML = `👤 ${user.first_name || "Ты"} <small>Telegram-профиль</small>`;
  }
}
