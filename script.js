const canvas = document.querySelector("#tavern-canvas");
const ctx = canvas.getContext("2d");

const goldEl = document.querySelector("#gold");
const beerEl = document.querySelector("#beer");
const grainEl = document.querySelector("#grain");
const hopsEl = document.querySelector("#hops");
const yeastEl = document.querySelector("#yeast");
const guestNameEl = document.querySelector("#guest-name");
const guestOrderEl = document.querySelector("#guest-order");
const logEl = document.querySelector("#log");

const state = {
  gold: 20,
  beer: 3,
  ingredients: {
    grain: 6,
    hops: 4,
    yeast: 3,
  },
  player: {
    x: 3,
    y: 8,
    dir: "down",
  },
  guest: null,
  logs: [],
};

const tileSize = 32;
const tilesX = 30;
const tilesY = 17;

const tavernMap = Array.from({ length: tilesY }, (_, row) =>
  Array.from({ length: tilesX }, (_, col) => {
    if (row === 0 || row === tilesY - 1 || col === 0 || col === tilesX - 1) {
      return "wall";
    }
    if (row <= 2 && col >= 3 && col <= 10) return "bar";
    if (row >= 12 && col <= 7) return "kitchen";
    if (row >= 12 && col >= 22) return "pantry";
    if (row >= 5 && row <= 10 && col >= 12 && col <= 17) return "tables";
    return "floor";
  })
);

const interactables = {
  bar: { label: "Бар", action: "serve" },
  kitchen: { label: "Варильня", action: "brew" },
  pantry: { label: "Комора", action: "buy" },
};

const npcPool = [
  { name: "Еліна", order: "Медовий лагер" },
  { name: "Торн", order: "Темний стаут" },
  { name: "Леся", order: "Пряний ель" },
  { name: "Ярило", order: "Пшеничне пиво" },
  { name: "Руна", order: "Вишневий ель" },
];

const colors = {
  floor: "#402b1c",
  wall: "#26180f",
  bar: "#6b3d1c",
  tables: "#4d2c17",
  kitchen: "#3b2b1f",
  pantry: "#2f2219",
  highlight: "#f8d27a",
};

const keyState = new Set();
let lastMove = 0;

const addLog = (message) => {
  state.logs.unshift(message);
  state.logs = state.logs.slice(0, 6);
};

const spawnGuest = () => {
  const guest = npcPool[Math.floor(Math.random() * npcPool.length)];
  state.guest = { ...guest };
  guestNameEl.textContent = guest.name;
  guestOrderEl.textContent = `Замовляє: ${guest.order}`;
  addLog(`${guest.name} зайшов до таверни.`);
};

const updateHud = () => {
  goldEl.textContent = state.gold;
  beerEl.textContent = state.beer;
  grainEl.textContent = state.ingredients.grain;
  hopsEl.textContent = state.ingredients.hops;
  yeastEl.textContent = state.ingredients.yeast;

  logEl.innerHTML = "";
  state.logs.forEach((entry) => {
    const li = document.createElement("li");
    li.textContent = entry;
    logEl.appendChild(li);
  });
};

const isWalkable = (x, y) => {
  const tile = tavernMap[y]?.[x];
  return tile && tile !== "wall" && tile !== "bar";
};

const movePlayer = (dx, dy, dir) => {
  const now = Date.now();
  if (now - lastMove < 120) return;
  lastMove = now;
  const nextX = state.player.x + dx;
  const nextY = state.player.y + dy;
  state.player.dir = dir;
  if (isWalkable(nextX, nextY)) {
    state.player.x = nextX;
    state.player.y = nextY;
  }
};

const handleInput = () => {
  if (keyState.has("ArrowUp") || keyState.has("w")) movePlayer(0, -1, "up");
  if (keyState.has("ArrowDown") || keyState.has("s")) movePlayer(0, 1, "down");
  if (keyState.has("ArrowLeft") || keyState.has("a")) movePlayer(-1, 0, "left");
  if (keyState.has("ArrowRight") || keyState.has("d")) movePlayer(1, 0, "right");
};

const tileInFront = () => {
  const { x, y, dir } = state.player;
  if (dir === "up") return { x, y: y - 1 };
  if (dir === "down") return { x, y: y + 1 };
  if (dir === "left") return { x: x - 1, y };
  return { x: x + 1, y };
};

const interact = () => {
  const { x, y } = tileInFront();
  const tile = tavernMap[y]?.[x];
  const station = interactables[tile];
  if (!station) {
    addLog("Тут немає з чим взаємодіяти.");
    updateHud();
    return;
  }
  if (station.action === "serve") {
    if (!state.guest) {
      addLog("Немає гостей для обслуговування.");
    } else if (state.beer <= 0) {
      addLog("Пиво закінчилося. Спочатку зваріть нову партію.");
    } else {
      state.beer -= 1;
      state.gold += 6;
      addLog(`${state.guest.name} отримує пиво і залишає 6 золота.`);
      spawnGuest();
    }
  }
  if (station.action === "brew") {
    const { grain, hops, yeast } = state.ingredients;
    if (grain < 2 || hops < 1 || yeast < 1) {
      addLog("Недостатньо інгредієнтів для варіння.");
    } else {
      state.ingredients.grain -= 2;
      state.ingredients.hops -= 1;
      state.ingredients.yeast -= 1;
      state.beer += 1;
      addLog("Ви зварили нову партію пива.");
    }
  }
  if (station.action === "buy") {
    if (state.gold < 10) {
      addLog("Не вистачає золота на закупівлю.");
    } else {
      state.gold -= 10;
      state.ingredients.grain += 5;
      state.ingredients.hops += 3;
      state.ingredients.yeast += 2;
      addLog("Комора поповнена новими інгредієнтами.");
    }
  }
  updateHud();
};

const drawTile = (x, y, tile) => {
  ctx.fillStyle = colors[tile] || colors.floor;
  ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
  if (tile === "tables") {
    ctx.fillStyle = "#6f4a2c";
    ctx.fillRect(x * tileSize + 6, y * tileSize + 6, tileSize - 12, tileSize - 12);
  }
};

const drawPlayer = () => {
  const { x, y } = state.player;
  ctx.fillStyle = "#ffd066";
  ctx.fillRect(x * tileSize + 6, y * tileSize + 4, 20, 24);
  ctx.fillStyle = "#3a2616";
  ctx.fillRect(x * tileSize + 8, y * tileSize + 10, 16, 8);
};

const drawStations = () => {
  Object.entries(interactables).forEach(([tile, { label }]) => {
    for (let y = 0; y < tilesY; y += 1) {
      for (let x = 0; x < tilesX; x += 1) {
        if (tavernMap[y][x] === tile) {
          ctx.fillStyle = colors.highlight;
          ctx.font = "10px 'Press Start 2P'";
          ctx.fillText(label, x * tileSize + 4, y * tileSize + 20);
          return;
        }
      }
    }
  });
};

const drawGuest = () => {
  if (!state.guest) return;
  ctx.fillStyle = "#9ad1ff";
  ctx.fillRect(10 * tileSize, 5 * tileSize, 20, 26);
  ctx.fillStyle = "#1e2b3a";
  ctx.fillRect(10 * tileSize + 4, 5 * tileSize + 10, 12, 8);
};

const drawScene = () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  tavernMap.forEach((row, y) => {
    row.forEach((tile, x) => drawTile(x, y, tile));
  });
  drawStations();
  drawGuest();
  drawPlayer();
};

const loop = () => {
  handleInput();
  drawScene();
  requestAnimationFrame(loop);
};

window.addEventListener("keydown", (event) => {
  if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)) {
    event.preventDefault();
  }
  if (event.key === "e" || event.key === "E") {
    interact();
  }
  keyState.add(event.key);
});

window.addEventListener("keyup", (event) => {
  keyState.delete(event.key);
});

spawnGuest();
updateHud();
loop();
