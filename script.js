const state = {
  gold: 15,
  beer: 2,
  ingredients: {
    grain: 6,
    hops: 4,
    yeast: 3,
  },
  npc: null,
};

const npcPool = [
  { name: "Грета", order: "Легкий ель" },
  { name: "Борис", order: "Темний стаут" },
  { name: "Марко", order: "Золотий лагер" },
  { name: "Ольга", order: "Пшеничне пиво" },
  { name: "Іван", order: "Медове пиво" },
];

const goldEl = document.querySelector("#gold");
const beerEl = document.querySelector("#beer-stock");
const grainEl = document.querySelector("#grain");
const hopsEl = document.querySelector("#hops");
const yeastEl = document.querySelector("#yeast");
const npcNameEl = document.querySelector("#npc-name");
const npcOrderEl = document.querySelector("#npc-order");
const logEl = document.querySelector("#log");

const serveBtn = document.querySelector("#serve");
const dismissBtn = document.querySelector("#dismiss");
const brewBtn = document.querySelector("#brew");
const buyBtn = document.querySelector("#buy");

const logEntries = [];

const updateUI = () => {
  goldEl.textContent = state.gold;
  beerEl.textContent = state.beer;
  grainEl.textContent = state.ingredients.grain;
  hopsEl.textContent = state.ingredients.hops;
  yeastEl.textContent = state.ingredients.yeast;

  if (state.npc) {
    npcNameEl.textContent = state.npc.name;
    npcOrderEl.textContent = `Хоче: ${state.npc.order}`;
  } else {
    npcNameEl.textContent = "—";
    npcOrderEl.textContent = "—";
  }

  logEl.innerHTML = "";
  logEntries.slice(0, 6).forEach((entry) => {
    const li = document.createElement("li");
    li.textContent = entry;
    logEl.appendChild(li);
  });
};

const addLog = (message) => {
  logEntries.unshift(message);
  updateUI();
};

const spawnNpc = () => {
  const npc = npcPool[Math.floor(Math.random() * npcPool.length)];
  state.npc = { ...npc };
  addLog(`${npc.name} заходить до таверни та просить ${npc.order}.`);
};

const serveNpc = () => {
  if (!state.npc) return;
  if (state.beer <= 0) {
    addLog(`Немає пива для ${state.npc.name}. Треба зварити ще.`);
    return;
  }
  state.beer -= 1;
  state.gold += 5;
  addLog(`${state.npc.name} отримує пиво і залишає 5 золота.`);
  state.npc = null;
  spawnNpc();
};

const dismissNpc = () => {
  if (!state.npc) return;
  addLog(`${state.npc.name} не дочекався і пішов.`);
  state.npc = null;
  spawnNpc();
};

const brewBeer = () => {
  const { grain, hops, yeast } = state.ingredients;
  if (grain < 2 || hops < 1 || yeast < 1) {
    addLog("Недостатньо інгредієнтів для варіння.");
    return;
  }
  state.ingredients.grain -= 2;
  state.ingredients.hops -= 1;
  state.ingredients.yeast -= 1;
  state.beer += 1;
  addLog("Нова партія пива готова!");
};

const buyIngredients = () => {
  if (state.gold < 10) {
    addLog("Не вистачає золота на закупівлю.");
    return;
  }
  state.gold -= 10;
  state.ingredients.grain += 5;
  state.ingredients.hops += 3;
  state.ingredients.yeast += 2;
  addLog("Інгредієнти доставлено до комори.");
};

serveBtn.addEventListener("click", serveNpc);
serveBtn.addEventListener("click", updateUI);

brewBtn.addEventListener("click", brewBeer);
brewBtn.addEventListener("click", updateUI);

buyBtn.addEventListener("click", buyIngredients);
buyBtn.addEventListener("click", updateUI);

dismissBtn.addEventListener("click", dismissNpc);
dismissBtn.addEventListener("click", updateUI);

spawnNpc();
updateUI();
