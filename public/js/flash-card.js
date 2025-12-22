const flashEl = document.getElementById("flashCard");
const flashIconEl = document.getElementById("flashIcon");
const flashTitleEl = document.getElementById("flashTitle");
const flashMsgEl = document.getElementById("flashMessage");
const flashCloseBtn = document.getElementById("flashCloseBtn");
const flashProgressBar = document.getElementById("flashProgressBar");

let flashTimer = null;
let rafId = null;

const MODE_META = {
  success: { title: "Success", icon: "✓" },
  error: { title: "Error", icon: "!" },
  info: { title: "Info", icon: "i" }
};

function hideFlash() {
  // stop timers
  if (flashTimer) clearTimeout(flashTimer);
  flashTimer = null;
  if (rafId) cancelAnimationFrame(rafId);
  rafId = null;

  // animate out
  flashEl.classList.remove("show");
  // after transition, set display none
  setTimeout(() => {
    flashEl.classList.add("hidden");
  }, 180);
}

function showFlash({ mode = "info", message = "", title = "", duration = 3500 } = {}) {
  const meta = MODE_META[mode] || MODE_META.info;

  flashEl.dataset.mode = mode;
  flashTitleEl.textContent = title || meta.title;
  flashMsgEl.textContent = message;
  flashIconEl.textContent = meta.icon;

  // show
  flashEl.classList.remove("hidden");
  requestAnimationFrame(() => {
    flashEl.classList.add("show");
  });

  // progress animation (slider time)
  const start = performance.now();
  const end = start + duration;

  function tick(now) {
    const t = Math.min(1, (now - start) / duration);
    flashProgressBar.style.transform = `scaleX(${1 - t})`;
    if (now < end) rafId = requestAnimationFrame(tick);
  }
  flashProgressBar.style.transform = "scaleX(1)";
  if (rafId) cancelAnimationFrame(rafId);
  rafId = requestAnimationFrame(tick);

  // auto close
  if (flashTimer) clearTimeout(flashTimer);
  flashTimer = setTimeout(hideFlash, duration);
}

flashCloseBtn.addEventListener("click", hideFlash);

// Expose helper globally
window.FlashCard = { show: showFlash, hide: hideFlash };

// Demo (hapus kalau tidak perlu)
// FlashCard.show({ mode: "info", message: "Login berhasil!", duration: 4000 });
// setTimeout(() => FlashCard.show({ mode: "error", message: "Email tidak valid.", duration: 5000 }), 1200);