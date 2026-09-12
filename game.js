// =====================================
// MASUKKAN URL WEB APP GOOGLE APPS SCRIPT
// =====================================

const GOOGLE_SCRIPT_URL =
  "MASUKKAN_URL_WEB_APP_DI_SINI";


// =====================================
// VARIABEL
// =====================================

let username = "";
let nomor = "";

let score = 0;
let speed = 3;
let level = 1;

let playerX = 50;

let running = false;

let left = false;
let right = false;

let knives = [];

let animation;
let spawner;


// =====================================
// MULAI GAME
// =====================================

function mulaiGame() {

  username =
    document.getElementById("username").value.trim();

  nomor =
    document.getElementById("nomor").value.trim();

  if (!username || !nomor) {
    alert("Username dan nomor wajib diisi!");
    return;
  }

  score = 0;
  speed = 3;
  level = 1;
  playerX = 50;

  knives = [];

  document.querySelectorAll(".knife").forEach(k => k.remove());

  document.getElementById("score").textContent = score;
  document.getElementById("level").textContent = level;

  document.getElementById("menu").classList.add("hidden");
  document.getElementById("gameOver").classList.add("hidden");
  document.getElementById("game").classList.remove("hidden");

  document.getElementById("player").style.left = "50%";

  running = true;

  animation = requestAnimationFrame(update);

  spawner = setInterval(spawnKnife, 850);
}


// =====================================
// PISAU
// =====================================

function spawnKnife() {

  if (!running) return;

  const arena =
    document.getElementById("arena");

  const knife =
    document.createElement("div");

  knife.className = "knife";
  knife.textContent = "🔪";

  knife.style.left =
    (Math.random() * 90 + 2) + "%";

  arena.appendChild(knife);

  knives.push({
    element: knife,
    y: -60
  });
}


// =====================================
// GAME LOOP
// =====================================

function update() {

  if (!running) return;

  // gerakkan pemain
  if (left) playerX -= 1.5;
  if (right) playerX += 1.5;

  if (playerX < 5) playerX = 5;
  if (playerX > 95) playerX = 95;

  document.getElementById("player").style.left =
    playerX + "%";


  const player =
    document.getElementById("player");

  const playerRect =
    player.getBoundingClientRect();


  // gerakkan semua pisau
  for (let i = knives.length - 1; i >= 0; i--) {

    const knife = knives[i];

    knife.y += speed;

    knife.element.style.top =
      knife.y + "px";

    const knifeRect =
      knife.element.getBoundingClientRect();


    // tabrakan
    if (collision(playerRect, knifeRect)) {
      gameOver();
      return;
    }


    // berhasil dilewati
    if (knife.y > 560) {

      knife.element.remove();

      knives.splice(i, 1);

      score++;

      document.getElementById("score").textContent =
        score;


      // setiap 5 skor semakin cepat
      if (score % 5 === 0) {

        speed += 0.6;

        level++;

        document.getElementById("level").textContent =
          level;
      }
    }
  }

  animation =
    requestAnimationFrame(update);
}


// =====================================
// TABRAKAN
// =====================================

function collision(a, b) {

  return !(
    a.right < b.left ||
    a.left > b.right ||
    a.bottom < b.top ||
    a.top > b.bottom
  );
}


// =====================================
// GAME OVER
// =====================================

function gameOver() {

  running = false;

  cancelAnimationFrame(animation);
  clearInterval(spawner);

  document.getElementById("game").classList.add("hidden");

  document.getElementById("gameOver").classList.remove("hidden");

  document.getElementById("finalScore").textContent =
    score;

  kirimSkor();
}


// =====================================
// KIRIM SKOR KE GOOGLE SHEETS
// =====================================

function kirimSkor() {

  if (
    !GOOGLE_SCRIPT_URL ||
    GOOGLE_SCRIPT_URL ===
    "MASUKKAN_URL_WEB_APP_DI_SINI"
  ) {console.log("URL Google Apps Script belum dipasang.");

    return;
  }


  fetch(GOOGLE_SCRIPT_URL, {

    method: "POST",

    mode: "no-cors",

    headers: {
      "Content-Type": "text/plain;charset=utf-8"
    },

    body: JSON.stringify({

      name: username,

      nomor: nomor,

      score: score

    })

  })
  .then(() => {

    console.log("Data dikirim ke Google Sheets.");

  })
  .catch(error => {

    console.error(error);

  });
}


// =====================================
// MAIN LAGI
// =====================================

function mainLagi() {

  document.getElementById("gameOver")
    .classList.add("hidden");

  mulaiGame();
}


// =====================================
// MENU
// =====================================

function keMenu() {

  running = false;

  cancelAnimationFrame(animation);
  clearInterval(spawner);

  document.querySelectorAll(".knife")
    .forEach(k => k.remove());

  knives = [];

  document.getElementById("game")
    .classList.add("hidden");

  document.getElementById("gameOver")
    .classList.add("hidden");

  document.getElementById("menu")
    .classList.remove("hidden");

  loadLeaderboard();
}


// =====================================
// KONTROL HP
// =====================================

document.getElementById("left")
.addEventListener("touchstart", () => {
  left = true;
});

document.getElementById("left")
.addEventListener("touchend", () => {
  left = false;
});


document.getElementById("right")
.addEventListener("touchstart", () => {
  right = true;
});

document.getElementById("right")
.addEventListener("touchend", () => {
  right = false;
});


// =====================================
// KONTROL KEYBOARD
// =====================================

document.addEventListener("keydown", e => {

  if (e.key === "ArrowLeft") {
    left = true;
  }

  if (e.key === "ArrowRight") {
    right = true;
  }

});

document.addEventListener("keyup", e => {

  if (e.key === "ArrowLeft") {
    left = false;
  }

  if (e.key === "ArrowRight") {
    right = false;
  }

});


// =====================================
// LEADERBOARD
// =====================================

function loadLeaderboard() {

  const board =
    document.getElementById("leaderboard");

  if (
    !GOOGLE_SCRIPT_URL ||
    GOOGLE_SCRIPT_URL ===
    "MASUKKAN_URL_WEB_APP_DI_SINI"
  ) {

    board.innerHTML =
      "⚠️ Google Sheets belum terhubung.";

    return;
  }


  board.innerHTML =
    "⏳ Memuat leaderboard...";


  fetch(GOOGLE_SCRIPT_URL)

    .then(response => response.json())

    .then(data => {

      board.innerHTML = "";


      if (!data.length) {

        board.innerHTML =
          "Belum ada skor.";

        return;
      }


      data.slice(0, 10)
      .forEach((player, index) => {

        const row =
          document.createElement("div");

        row.className = "row";

        row.textContent =
          `${index + 1}. ${player.name} — ${player.score}`;

        board.appendChild(row);

      });

    })

    .catch(error => {

      console.error(error);

      board.innerHTML =
        "❌ Leaderboard gagal dimuat.";
    });
}


// =====================================
// LOAD AWAL
// =====================================

loadLeaderboard();
