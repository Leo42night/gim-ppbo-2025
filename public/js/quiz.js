/***********************************************************
    * CONFIG
    ***********************************************************/
// Ubah path ini ke file spritesheet kamu (1205x363, 5 frame dalam 1 row)
const BASE_URL = window.location.origin;
const SHEET_URL = `${BASE_URL}/img/sheet-asdos.png`; // contoh: "./codec_sheet.png"

// Link repo (ubah sesuai repo kamu)
const GITHUB_REPO_URL = "https://github.com/Leo42night/gim-ppbo-2025";

const FRAME_LEO_COUNT = 5;
const SHEET_LEO_W = 1205;
const SHEET_LEO_H = 362;
const FRAME_LEO_W = Math.floor(SHEET_LEO_W / FRAME_LEO_COUNT); // 241
const FRAME_LEO_H = SHEET_LEO_H;

/***********************************************************
 * QUIZ BANK (10 pertanyaan OOP - random)
 ***********************************************************/
const QUIZ_BANK = [
  {
    q: "OOP: Apa tujuan utama 'encapsulation'?",
    choices: [
      "Menyembunyikan detail internal dan membatasi akses langsung ke state object",
      "Membuat satu class bisa mewarisi banyak class sekaligus",
      "Mengubah semua method menjadi static agar cepat"
    ],
    correctIndex: 0,
    explain: "Encapsulation menyembunyikan detail internal dan membatasi akses langsung ke state object."
  },
  {
    q: "OOP: Apa yang dimaksud 'inheritance'?",
    choices: [
      "Membungkus data agar tidak bisa diakses dari luar",
      "Class turunan mewarisi properti/method dari class induk",
      "Menggabungkan beberapa object menjadi satu array"
    ],
    correctIndex: 1,
    explain: "Inheritance memungkinkan class turunan mewarisi properti/method dari class induk."
  },
  {
    q: "OOP: Polymorphism paling sering berarti apa?",
    choices: [
      "Satu interface, banyak implementasi",
      "Satu object hanya boleh punya satu method",
      "Menghapus constructor agar hemat memori"
    ],
    correctIndex: 0,
    explain: "Polymorphism: satu interface yang sama, perilaku bisa berbeda tergantung implementasi/tipe."
  },
  {
    q: "OOP: Apa fungsi 'abstraction'?",
    choices: [
      "Menampilkan detail implementasi serinci mungkin",
      "Menyederhanakan kompleksitas: tampilkan hal penting, sembunyikan detail",
      "Mengubah class menjadi JSON otomatis"
    ],
    correctIndex: 1,
    explain: "Abstraction menyederhanakan kompleksitas dengan menampilkan hal penting dan menyembunyikan detail."
  },
  {
    q: "OOP: Constructor biasanya dipakai untuk apa?",
    choices: [
      "Menghapus object yang tidak dipakai",
      "Menginisialisasi object saat dibuat (state awal, validasi awal, dsb.)",
      "Menjalankan garbage collector secara manual"
    ],
    correctIndex: 1,
    explain: "Constructor dipakai untuk inisialisasi object ketika dibuat."
  },
  {
    q: "OOP: Bedanya class dan object paling tepat?",
    choices: [
      "Class = instance, Object = blueprint",
      "Class = blueprint/definisi; Object = instance dari class",
      "Class = file; Object = folder"
    ],
    correctIndex: 1,
    explain: "Class adalah blueprint/definisi, object adalah instance nyata."
  },
  {
    q: "OOP: Manfaat utama 'interface' (kontrak) dalam OOP?",
    choices: [
      "Membuat semua variabel menjadi public",
      "Mendefinisikan kontrak method agar implementasi bisa ditukar tanpa ubah pemakai",
      "Menghindari penggunaan constructor"
    ],
    correctIndex: 1,
    explain: "Interface mendefinisikan kontrak sehingga implementasi bisa diganti tanpa mengubah kode pemakai."
  },
  {
    q: "OOP: Apa itu method overriding?",
    choices: [
      "Class turunan mengganti implementasi method dari class induk",
      "Memanggil method yang sama berkali-kali dalam loop",
      "Menduplikasi object tanpa constructor"
    ],
    correctIndex: 0,
    explain: "Overriding: subclass mengganti implementasi method superclass."
  },
  {
    q: "OOP: Apa itu composition (has-a) secara umum?",
    choices: [
      "Relasi has-a: object dibangun dari object lain",
      "Relasi is-a: subclass selalu lebih cepat dari superclass",
      "Relasi one-to-many yang wajib pakai inheritance"
    ],
    correctIndex: 0,
    explain: "Composition adalah relasi has-a: object tersusun dari object lain."
  },
  {
    q: "OOP: Kenapa access modifier (private/protected/public) penting?",
    choices: [
      "Untuk kontrol akses, menjaga invariants, dan mengurangi coupling",
      "Supaya semua method otomatis jadi async",
      "Agar object bisa disimpan di database tanpa ORM"
    ],
    correctIndex: 0,
    explain: "Access modifier mengontrol akses, menjaga invariants, dan mengurangi coupling."
  }
];


function pickRandomQuestion(excludeIndex = null) {
  if (QUIZ_BANK.length === 0) return { q: "(No questions)", explain: "" };
  let idx;
  do {
    idx = Math.floor(Math.random() * QUIZ_BANK.length);
  } while (excludeIndex !== null && QUIZ_BANK.length > 1 && idx === excludeIndex);
  return { ...QUIZ_BANK[idx], _idx: idx };
}

/***********************************************************
 * TYPEWRITER
 ***********************************************************/
async function typewriter(el, text, {
  speed = 18,
  caret = true,
  onChar = null,
  typingSfx = true,     // ✅ baru
  typingSound = "typing" // ✅ baru
} = {}) {
  el.textContent = "";
  let i = 0;
  let cancelled = false;

  const caretChar = "▌";
  const setCaret = () => {
    if (!caret) return;
    el.textContent = el.textContent.replace(caretChar, "") + caretChar;
  };
  const removeCaret = () => {
    el.textContent = el.textContent.replace(caretChar, "");
  };

  // ✅ start typing sfx (loop)
  if (typingSfx) window.SOUND?.loopSound?.(typingSound);

  return new Promise((resolve) => {
    const finish = () => {
      // ✅ stop typing sfx
      if (typingSfx) window.SOUND?.stopSound?.(typingSound);
      removeCaret();
      resolve({
        cancel() { cancelled = true; },
        done: true
      });
    };

    const tick = () => {
      if (cancelled) return finish();
      if (i < text.length) {
        removeCaret();
        el.textContent += text[i++];
        if (typeof onChar === "function") onChar(i, text);
        setCaret();
        setTimeout(tick, speed);
      } else {
        finish();
      }
    };

    tick();
  });
}


function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function showCalling({ durationMs = 3000, intervalMs = 350 } = {}) {
  // play codec sekali pas mulai calling
  window.SOUND?.playSound?.("codec");

  const base = "[CODEC] CALLING";
  const dots = ["", ".", "..", "..."];
  const start = Date.now();
  let i = 0;

  // animasi titik
  while (Date.now() - start < durationMs) {
    dialogText.textContent = `${base}${dots[i % dots.length]}`;
    i++;
    await sleep(intervalMs);
  }
}

/***********************************************************
 * PIXI: Load sheet + crop 5 textures
 ***********************************************************/
let app, sprite, frames = [];
async function initPixi() {
  const wrap = document.getElementById("pixiWrap");
  wrap.innerHTML = "";

  app = new PIXI.Application({
    backgroundAlpha: 0,
    antialias: false,
    resolution: window.devicePixelRatio || 1,
    autoDensity: true,
    width: FRAME_LEO_W,
    height: FRAME_LEO_H
  });
  wrap.appendChild(app.view);

  // Load base texture
  const base = await PIXI.Assets.load(SHEET_URL);

  // Crop frames: 1 row of 5
  frames = [];
  for (let i = 0; i < FRAME_LEO_COUNT; i++) {
    const rect = new PIXI.Rectangle(i * FRAME_LEO_W, 0, FRAME_LEO_W, FRAME_LEO_H);
    const tex = new PIXI.Texture(base, rect);
    frames.push(tex);
  }

  sprite = new PIXI.Sprite(frames[0]);
  // tampilkan width screen
  // app.renderer.width: 271
  console.log("app.renderer.width:", app.renderer.width);
  // sprite.anchor.set(0.65); 
  if (app.renderer.width < 325) {
    sprite.anchor.set(0.55);
  } else if (app.renderer.width >= 325 && app.renderer.width < 362) {
    sprite.anchor.set(0.65);
  } else if (app.renderer.width >= 362 && app.renderer.width < 482) {
    sprite.anchor.set(0.75);
  } else {
    sprite.anchor.set(1);
  }
  sprite.x = app.renderer.width / 2;
  sprite.y = app.renderer.height / 2;

  // slight pixel feel
  sprite.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;

  app.stage.addChild(sprite);

  const scan = new PIXI.Graphics();
  scan.alpha = 0.12;

  scan.beginFill(0x39ff67);
  for (let y = 0; y < FRAME_LEO_H; y += 3) {
    scan.drawRect(0, y, FRAME_LEO_W, 1);
  }
  scan.endFill();

  app.stage.addChild(scan);
}

function setFrame(n) { // n: 1..5
  const idx = Math.max(1, Math.min(5, n)) - 1;
  if (sprite && frames[idx]) sprite.texture = frames[idx];
}

/***********************************************************
 * UI + STATE MACHINE
 ***********************************************************/
const overlay = document.getElementById("overlay");
const openBtn = document.getElementById("openPopup");
const closeBtn = document.getElementById("closePopup");
const dialogText = document.getElementById("dialogText");
const actionsEl = document.getElementById("actions");

let lastQuestionIndex = null;
const REQUIRED_CORRECT = 3;
let correctStreak = 0;

function clearActions() {
  actionsEl.innerHTML = "";
}

function addButton(label, { primary = false, onClick } = {}) {
  const btn = document.createElement("button");
  btn.className = "btn" + (primary ? " primary" : "");
  btn.textContent = label;
  btn.addEventListener("click", onClick);
  actionsEl.appendChild(btn);
  return btn;
}

function handleAnswer(picked, chosenIndex) {
  if (chosenIndex === picked.correctIndex) {
    onCorrect(picked);
  } else {
    onWrong(picked);
  }
}

async function showInitial() {
  clearActions();
  setFrame(1);

  // ✅ reset progress quiz
  correctStreak = 0;

  dialogText.textContent =
    `[SYSTEM] Tekan "Mulai Dialog" untuk memulai komunikasi...`;

  addButton("Mulai Dialog", {
    primary: true,
    onClick: () => startDialog()
  });

  addButton("Tutup", {
    onClick: () => hidePopup()
  });
}

async function startDialog() {
  stopSpeak();
  clearActions();
  setFrame(2);

  // ✅ tampilkan CALLING... 3 detik (anim titik) + play sound codec
  await showCalling({ durationMs: 3000, intervalMs: 350 });

  // habis calling -> lanjut intro
  await typewriter(
    dialogText,
    `[CODEC] Halo. Kita mulai test singkat.\n` +
    `[CODEC] Aku mau cek pemahamanmu tentang OOP.\n` +
    `[CODEC] Siap?`,
    { speed: 18 }
  );

  // after finished -> frame 3 and go quiz
  // tunggu 1 detik sebelum muncul frame 3
  await new Promise(resolve => setTimeout(resolve, 1500));
  setFrame(3);
  await showQuiz();
}

let currentUtterance = null;

function stopSpeak() {
  try {
    speechSynthesis.cancel();
  } catch { }
  currentUtterance = null;
}

function speakID(text) {
  // Web Speech API butuh gesture user dulu (klik) -> aman karena quiz muncul setelah tombol
  if (!("speechSynthesis" in window)) return;

  stopSpeak();

  const u = new SpeechSynthesisUtterance(text);
  u.lang = "id-ID";
  u.rate = 1.0;   // bisa 0.95 kalau mau lebih natural
  u.pitch = 1.0;
  u.volume = 1.0;

  // coba pilih voice id-ID kalau tersedia
  const pickVoice = () => {
    const voices = speechSynthesis.getVoices?.() || [];
    const v =
      voices.find(v => v.lang === "id-ID") ||
      voices.find(v => v.lang?.toLowerCase().startsWith("id")) ||
      null;
    if (v) u.voice = v;
    speechSynthesis.speak(u);
  };

  // kadang voices belum siap pertama kali
  const voicesNow = speechSynthesis.getVoices?.() || [];
  if (voicesNow.length === 0) {
    speechSynthesis.onvoiceschanged = () => {
      speechSynthesis.onvoiceschanged = null;
      pickVoice();
    };
  } else {
    pickVoice();
  }

  currentUtterance = u;
}

async function showQuiz() {
  clearActions();

  const picked = pickRandomQuestion(lastQuestionIndex);
  lastQuestionIndex = picked._idx;

  // Tampilkan teks quiz (typewriter)
  await typewriter(
    dialogText,
    `[QUIZ] ${picked.q}\n\n` + `Pilih aksi:`,
    { speed: 16, typingSfx: true }
  );

  // ✅ Bacakan quiz dalam Bahasa Indonesia
  // (hilangkan label [QUIZ], bacakan versi natural)
  const spoken =
    `Pertanyaan. ${picked.q} ` +
    `Pilihan jawaban. ` +
    `Satu. ${picked.choices[0]}. ` +
    `Dua. ${picked.choices[1]}. ` +
    `Tiga. ${picked.choices[2]}.`;
  speakID(spoken);

  // Render 3 pilihan jawaban
  picked.choices.forEach((choiceText, idx) => {
    addButton(`${idx + 1}. ${choiceText}`, {
      onClick: () => {
        // optional: klik sound
        window.SOUND?.playSound?.("select");
        stopSpeak(); // stop TTS saat user memilih
        handleAnswer(picked, idx);
      }
    });
  });

  addButton("Tidak ingin menjawab", {
    onClick: () => {
      window.SOUND?.playSound?.("select");
      stopSpeak();
      onNoAnswer();
    }
  });
}


async function onCorrect(picked) {
  stopSpeak();
  clearActions();
  setFrame(4);

  window.SOUND?.playSound?.("success");

  correctStreak++;

  // Jika belum sampai 3, lanjut quiz lagi
  if (correctStreak < REQUIRED_CORRECT) {
    await typewriter(
      dialogText,
      `[CODEC] Benar.\n` +
      `[CODEC] ${picked.explain}\n\n` +
      `[SYSTEM] Progress: ${correctStreak}/${REQUIRED_CORRECT}\n` +
      `Lanjut pertanyaan berikutnya...`,
      { speed: 16 }
    );

    addButton("Lanjut", {
      primary: true,
      onClick: async () => {
        setFrame(3);
        await showQuiz();
      }
    });

    addButton("Tutup", { onClick: () => hidePopup() });
    return;
  }

  // ✅ Kalau sudah 3 benar -> baru dinyatakan berhasil & tampilkan repo
  await typewriter(
    dialogText,
    `[CODEC] Benar.\n` +
    `[CODEC] Mantap. ${picked.explain}\n\n` +
    `[SYSTEM] Kamu lolos (3/3).\n\n` +
    `Selamat! Ini link repo proyek:\n${GITHUB_REPO_URL}`,
    { speed: 16 }
  );

  addButton("Buka Repo GitHub", {
    primary: true,
    onClick: () => window.open(GITHUB_REPO_URL, "_blank", "noopener,noreferrer")
  });

  addButton("Main Lagi (Reset)", {
    onClick: async () => {
      correctStreak = 0;
      setFrame(3);
      await showQuiz();
    }
  });

  addButton("Tutup", { onClick: () => hidePopup() });
}

async function onWrong(picked) {
  stopSpeak();
  clearActions();
  setFrame(5);

  window.SOUND?.playSound?.("failed");

  // ✅ opsional: kalau salah, reset progress supaya benar-benar “3 pertanyaan sebelum berhasil”
  correctStreak = 0;

  await typewriter(
    dialogText,
    `[CODEC] SALAH.\n` +
    `[CODEC] Kamu harus jawab. Jangan kabur.\n\n` +
    `(Hint) ${picked.explain}\n\n` +
    `[SYSTEM] Progress di-reset: ${correctStreak}/${REQUIRED_CORRECT}\n` +
    `Klik di bawah untuk coba lagi dengan pertanyaan berbeda.`,
    { speed: 14 }
  );

  addButton("Jawab lagi", {
    primary: true,
    onClick: async () => {
      setFrame(3);
      await showQuiz();
    }
  });

  addButton("Tutup", { onClick: () => hidePopup() });
}

async function onNoAnswer() {
  stopSpeak();
  clearActions();
  setFrame(2);

  await typewriter(dialogText,
    `[CODEC] Oke.\n` +
    `Kalau kapan-kapan siap, kita lanjut lagi.`,
    { speed: 16 });

  addButton("Kembali ke Awal", {
    primary: true,
    onClick: () => showInitial()
  });

  addButton("Tutup", { onClick: () => hidehidePopup() });
}

function showPopupOverlay() {
  overlay.classList.add("show");
}

function hidePopup() {
  stopSpeak();
  overlay.classList.remove("show");
}

/***********************************************************
 * EVENTS
 ***********************************************************/
async function initInfo() {
  // showPopupOverlay();
  // init pixi once per open (biar simpel & bersih)
  try {
    await initPixi();
    await showInitial();
  } catch (err) {
    console.error(err);
    dialogText.textContent =
      "Gagal load Pixi/spritesheet. Pastikan SHEET_URL benar dan file tersedia.";
    clearActions();
    addButton("Tutup", { onClick: () => hidePopup() });
  }
}
initInfo();

closeBtn.addEventListener("click", () => hidePopup());
overlay.addEventListener("click", (e) => {
  if (e.target === overlay) hidePopup();
});

// Optional: ESC to close
window.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && overlay.classList.contains("show")) hidePopup();
});