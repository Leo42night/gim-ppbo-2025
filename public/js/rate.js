const starsEl = document.getElementById("stars");
const stars = Array.from(starsEl.querySelectorAll(".star"));
const ratingInput = document.getElementById("ratingValue");
const submitBtn = document.getElementById("submitRating");
const loaderEl = document.getElementById("loadingOverlay");

(() => {
  const { S } = window.GAME;
  const { isLoggedIn } = window.AUTH;

  let selected = 0;

  async function postJson(url, payload, { onTrack } = {}) {
    const requestId = crypto?.randomUUID?.() || String(Date.now()) + Math.random().toString(16).slice(2);

    try {
      const res = await fetch(url, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "X-Request-Id": requestId,
        },
        body: JSON.stringify(payload),
      });

      const raw = await res.text(); // ✅ selalu baca text dulu

      let data = null;
      try {
        data = raw ? JSON.parse(raw) : null;
      } catch (e) {
        // ✅ server balas HTML / bukan JSON
        const err = new Error("Invalid JSON response from server");
        err.meta = { requestId, status: res.status, raw: raw.slice(0, 500) };
        throw err;
      }

      if (!res.ok) {
        const err = new Error(data?.message || "Request failed");
        err.meta = { requestId, status: res.status, data };
        throw err;
      }

      return { ok: true, data, requestId };
    } catch (err) {
      // ✅ tracking (client-side)
      onTrack?.({
        requestId,
        url,
        payload,
        error: {
          name: err.name,
          message: err.message,
          meta: err.meta || null,
          stack: err.stack || null,
        },
      });

      return {
        ok: false,
        requestId,
        error: err.message,
        meta: err.meta || null,
      };
    }
  }

  function paint(value, mode) {
    stars.forEach((btn) => {
      const v = Number(btn.dataset.value);
      btn.classList.toggle("is-active", v <= value && mode === "active");
      btn.classList.toggle("is-hover", v <= value && mode === "hover");
      if (mode === "active") btn.classList.remove("is-hover");
    });
  }

  stars.forEach((btn) => {
    btn.addEventListener("mouseenter", () => paint(Number(btn.dataset.value), "hover"));
    btn.addEventListener("mouseleave", () => paint(selected, "active"));

    btn.addEventListener("click", () => {
      selected = Number(btn.dataset.value);
      ratingInput.value = String(selected);
      paint(selected, "active");
      submitBtn.disabled = selected === 0;
    });
  });

  submitBtn.addEventListener("click", () => {
    const rating = Number(ratingInput.value);
    loaderEl.classList.remove("hidden");

    postJson("/api/rate", { rating, project_id: S.selectedProjectId }, {
      onTrack: (t) => console.error("[RATE_TRACK]", t)
    }).then((result) => {
      loaderEl.classList.add("hidden");

      if (!result.ok) {
        FlashCard.show({
          mode: "error",
          message: `Gagal submit rating (${result.requestId}): ${result.error}`,
          duration: 3500
        });
        console.error("RATE ERROR:", result);
        return;
      }

      // console.log("/api/rate:", result.data);

      if (result.data.success) {
        localStorage.setItem(`rating_${S.selectedProjectId}`, rating);
        window.AUTH.setLoggedIn(true);
        FlashCard.show({ mode: "success", message: result.data.message, duration: 2000 });
      }
    });

  });

  window.RATE = {
    paint
  }
})();