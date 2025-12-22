const starsEl = document.getElementById("stars");
const stars = Array.from(starsEl.querySelectorAll(".star"));
const ratingInput = document.getElementById("ratingValue");
const submitBtn = document.getElementById("submitRating");

(() => {
  const { S } = window.GAME;
  
  let selected = 0;
  
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
    S.loaderEl.classList.remove("hidden");
    
    // kirim ke server / simpan data
    // console.log(JSON.stringify({ "rating": rating, "project_id": S.selectedProjectId }));
    fetch("/api/rate", { method:"POST", body: JSON.stringify({ "rating": rating, "project_id": S.selectedProjectId }) })
    .then(res => res.json())
    .then(data => {
      S.loaderEl.classList.add("hidden");
      if(data.success) {
        localStorage.setItem(`rating_${S.selectedProjectId}`, rating);
        FlashCard.show({ mode: "success", message: data.message, duration: 2000 });
      }
    })
    .catch(err => {
        S.loaderEl.classList.add("hidden");
        console.error(err);
      });
  });

  window.RATE = {
    paint
  }
})();