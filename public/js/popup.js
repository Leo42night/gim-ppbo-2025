// popup utils: UI + cache + data fetch (FINAL: toggle video)
(() => {
  const STORAGE_KEY = "GAME_POPUP_DATA";
  const STORAGE_TIME_KEY = "GAME_POPUP_DATA_TIME";
  const CACHE_TTL = 1000 * 60 * 60 * 6;

  /* =========================
   * Cache helpers
   * ========================= */
  function loadPopupDataFromStorage() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const time = Number(localStorage.getItem(STORAGE_TIME_KEY));
      if (!raw || !time) return null;
      if (Date.now() - time > CACHE_TTL) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  function savePopupDataToStorage(data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      localStorage.setItem(STORAGE_TIME_KEY, Date.now().toString());
    } catch { }
  }

  async function fetchPopupData(baseUrl) {
    const res = await fetch(`${baseUrl}/api/projects`);
    if (!res.ok) throw new Error("HTTP " + res.status);
    const data = await res.json();
    savePopupDataToStorage(data);
    return data;
  }

  function getPopupDataById(list, id) {
    return list?.find((p) => p.id == id) || null;
  }

  /* =========================
   * UI refs (ambil sekali)
   * ========================= */
  const el = {
    popup: document.getElementById("tilePopup"),
    closeBtn: document.getElementById("popupCloseBtn"),
    overlay: document.getElementById("overlay"),

    top: document.getElementById("mode-top"),
    img: document.getElementById("popupImg"),
    title: document.getElementById("popupTitle"),
    desc: document.getElementById("popupDesc"),

    com: document.getElementById("mode-com"),
    videoLoading: document.getElementById("videoLoading"),
    vid1: document.getElementById("vid-pitch-deck"),
    vid2: document.getElementById("vid-demo"),
    webLink: document.getElementById("webLink"),
    repoLink: document.getElementById("githubLink"),

    presentation: document.getElementById("mode-presentation"),
    vid0: document.getElementById("vid-presentation-day"),

    rating: document.getElementById("mode-rating"),
    ratingContainer: document.getElementById("rating-container"),

    loader: document.getElementById("loadingOverlay"),
  };

  /* =========================
   * Video toggle (Pitch/Demo)
   * ========================= */
  const toggleWrap = document.querySelector(".video-toggle");
  const btnPitch = toggleWrap?.querySelector('[data-tab="pitch"]');
  const btnDemo = toggleWrap?.querySelector('[data-tab="demo"]');

  function showVideoLoading(show) {
    el.videoLoading?.classList.toggle("hidden", !show);
  }

  function attachVideoLoadListenersOnce() {
    if (el.vid1 && !el.vid1.__hasLoadListener) {
      el.vid1.addEventListener("load", () => showVideoLoading(false));
      el.vid1.__hasLoadListener = true;
    }
    if (el.vid2 && !el.vid2.__hasLoadListener) {
      el.vid2.addEventListener("load", () => showVideoLoading(false));
      el.vid2.__hasLoadListener = true;
    }
  }
  attachVideoLoadListenersOnce();


  function setSrcOnce(iframe, url) {
    if (!iframe) return false;
    const next = (url || "").trim();
    if (iframe.dataset.src === next) return false;
    iframe.dataset.src = next;
    iframe.src = next;
    return true;
  }


  // Stop video iframe: paling reliable adalah reload iframe ke url yang sama
  function stopIframe(iframe) {
    if (!iframe) return;
    const src = iframe.dataset.src || iframe.src;
    if (!src) return;
    iframe.src = src; // reset to itself -> stop playback
  }

  // tab: "pitch" | "demo"
  function setActiveTab(tab) {
    const pitchActive = tab === "pitch";

    btnPitch?.classList.toggle("is-active", pitchActive);
    btnDemo?.classList.toggle("is-active", !pitchActive);

    el.vid1?.classList.toggle("is-active", pitchActive);
    el.vid2?.classList.toggle("is-active", !pitchActive);

    // show loading saat pindah tab (kalau iframe punya src)
    const targetIframe = pitchActive ? el.vid1 : el.vid2;
    const hasSrc = (targetIframe?.dataset.src || targetIframe?.src || "").trim().length > 0;
    if (hasSrc) {
      showVideoLoading(true);
      setTimeout(() => showVideoLoading(false), 1200); // “perceived loading”
    }

    if (pitchActive) stopIframe(el.vid2);
    else stopIframe(el.vid1);
  }

  // init toggle click (sekali)
  btnPitch?.addEventListener("click", () => setActiveTab("pitch"));
  btnDemo?.addEventListener("click", () => setActiveTab("demo"));

  function hidePopupCom() {
    // stop semua saat popup disembunyikan
    stopIframe(el.vid1);
    stopIframe(el.vid2);

    // reset tab default
    setActiveTab("pitch");

    // hide container
    el.com?.classList.add("hidden");
  }

  /* =========================
   * Close / handlers
   * ========================= */
  function closePopup() {
    // hide modes
    el.presentation?.classList.add("hidden");
    el.rating?.classList.add("hidden");
    el.top?.classList.add("hidden");
    hidePopupCom();

    // reset iframe presentation (opsional stop)
    if (el.vid0) el.vid0.src = "";

    // hide popup
    el.popup?.classList.add("hidden");
  }

  function initPopupHandlers() {
    el.closeBtn?.addEventListener("click", closePopup);
    el.popup?.addEventListener("click", (e) => {
      if (e.target === el.popup) closePopup();
    });
  }

  /* =========================
   * Show functions
   * ========================= */
  function showPopupProject(baseUrl, data) {
    el.img.src = baseUrl + "/" + (data?.image ?? "");
    el.title.textContent = data?.title ?? "Info";
    el.desc.textContent = data?.description ?? "-";
    el.top?.classList.remove("hidden");
    el.popup?.classList.remove("hidden");
  }

  function showPopupCom(data = {}) {
    // kalau ada perubahan src, tampilkan loading
    const changed1 = setSrcOnce(el.vid1, data?.link_vid_pitch || "");
    const changed2 = setSrcOnce(el.vid2, data?.link_vid_demo || "");

    // tampilkan loading kalau video aktif sedang ganti src
    // (atau minimal 1 berubah, untuk UX)
    if (changed1 || changed2) showVideoLoading(true);

    // fallback: kalau iframe load ga terpanggil (kadang embed), matiin loader paksa
    const safety = setTimeout(() => showVideoLoading(false), 7000);
    // kalau load kejadian lebih cepat, listener akan hide loader

    el.webLink.href = data?.link_web || "#";
    el.repoLink.href = data?.link_repo || "#";

    if (!data?.link_vid_pitch && data?.link_vid_demo) setActiveTab("demo");
    else setActiveTab("pitch");

    el.com?.classList.remove("hidden");
    el.popup?.classList.remove("hidden");
  }


  function showOverlayInfo() {
    el.overlay?.classList.add("show");
  }

  function showPresentation(url) {
    if (el.vid0) el.vid0.src = url || "";
    el.presentation?.classList.remove("hidden");
    el.popup?.classList.remove("hidden");
  }

  function showRatingPopup() {
    el.rating?.classList.remove("hidden");
    el.popup?.classList.remove("hidden");
  }

  function showLoader(show) {
    if (!el.loader) return;
    el.loader.classList.toggle("hidden", !show);
  }

  /* =========================
   * Public API
   * ========================= */
  window.POPUP = {
    el,

    // handlers
    initPopupHandlers,
    closePopup,

    // show
    showPopupProject,
    showPopupCom,
    showOverlayInfo,
    showPresentation,
    showRatingPopup,
    showLoader,

    // data/cache
    loadPopupDataFromStorage,
    fetchPopupData,
    getPopupDataById,

    // (opsional) expose untuk debugging
    _video: { setActiveTab, stopIframe, setSrcOnce },
  };
})();
