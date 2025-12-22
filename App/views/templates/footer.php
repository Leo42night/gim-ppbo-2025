<script src="<?= BASE_URL ?>/js/init.js"></script>
<script src="<?= BASE_URL ?>/js/flash-card.js"></script>
<script src="<?= BASE_URL ?>/js/login.js"></script>
<script src="<?= BASE_URL ?>/js/rating.js"></script>
<script src="<?= BASE_URL ?>/js/rate.js"></script>

<script src="<?= BASE_URL ?>/js/helper.js"></script>
<script src="<?= BASE_URL ?>/js/main.js"></script>
<script src="<?= BASE_URL ?>/js/info.js"></script>

<script>
  function showFlash(message, type = "success", duration = 4000) {
    const container = document.getElementById("flash-container");

    const flash = document.createElement("div");
    flash.className = `flash ${type}`;
    flash.innerHTML = `
    <span>${message}</span>
    <span class="close">&times;</span>
  `;

    container.appendChild(flash);

    // tombol X
    flash.querySelector(".close").onclick = () => {
      flash.remove();
    };

    // auto remove
    setTimeout(() => {
      flash.remove();
    }, duration);
  }
</script>
<?php if (!empty($_COOKIE['flash_card'])): ?>
  <script>
    showFlash("<?= htmlspecialchars($_COOKIE['flash_card']) ?>");
  </script>
<?php endif; ?>
</body>
</html>