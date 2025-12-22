// main.js
(() => {
  const G = window.GAME;
  const H = window.GAME_HELPER;

  const { app, CFG, mapContainer, L, S } = G;

  /* =========================================================
  1) INIT POPUP + DEBUG
  ========================================================= */
  H.initPopupHandlers();
  H.installInteractionDebugger();

  /* =========================================================
  2) INPUT (keyboard + pointer)
  ========================================================= */
  window.addEventListener("keydown", (e) => (S.keys[e.key.toLowerCase()] = true));
  window.addEventListener("keyup", (e) => (S.keys[e.key.toLowerCase()] = false));

  H.updateStageHitArea();

  // stage pointerdown: hanya set move target kalau klik area kosong
  app.stage.on("pointerdown", (e) => {
    if (!S.inputEnabled) return; // block input ketika di luar web

    // kalau klik glow / object lain → JANGAN gerak
    if (e.target !== app.stage) return;

    const screen = e.global;
    const local = mapContainer.toLocal(screen);

    const grid = H.toGridFromIsoTiled(local.x, local.y - H.tileSpriteBaseY());
    S.pointerTarget = { x: grid.x, y: grid.y };

    // marker
    L.markers.removeChildren();
    const marker = new PIXI.Graphics();
    marker.beginFill(0x00ffcc, 0.9);
    marker.drawCircle(local.x, local.y, 4);
    marker.endFill();
    L.markers.addChild(marker);
  });

  /* =========================================================
  3) GAME LOOP
  ========================================================= */
  app.ticker.add(() => {
    if (!S.worldReady || !S.player) return;

    // kalau game pause, jangan update position, jangan cek hit
    if (S.gamePaused) return;

    const now = Date.now();
    let dt = (now - S.lastUpdate) / 1000;
    S.lastUpdate = now;

    // clamp dt biar tidak “teleport” kalau drop frame
    dt = Math.min(dt, 1 / 20); // max 0.05s

    const { sx, sy } = H.computeScreenVectorFromInput();
    const moving = sx !== 0 || sy !== 0;

    if (!moving) {
      H.updatePlayerAnimation(false, S.currentDir, S.currentIsLeft);
      H.checkAllObjectHits();
      return;
    }

    // screen -> grid dir
    const gdir = H.screenDirToGridDir(sx, sy);
    let moveX = gdir.x;
    let moveY = gdir.y;

    // normalize grid dir
    const gLen = Math.hypot(moveX, moveY);
    if (gLen > 0) {
      moveX /= gLen;
      moveY /= gLen;
    }

    // animation by screen angle
    let angleDeg = (Math.atan2(sy, sx) * 180) / Math.PI;
    if (angleDeg < 0) angleDeg += 360;
    const { dir, isLeft } = H.directionFromAngle(angleDeg);
    H.updatePlayerAnimation(true, dir, isLeft);

    // move & collision
    const old = { ...S.playerPos };

    S.playerPos.x += moveX * CFG.MOVE_SPEED * dt;
    S.playerPos.y += moveY * CFG.MOVE_SPEED * dt;

    H.clampPlayerToMap();
    H.updatePlayerPosition();

    const foot = { x: S.player.x, y: S.player.y };
    if (H.isBlockedByCollision(foot, CFG.HIT_RADIUS)) {
      S.playerPos.x = old.x;
      S.playerPos.y = old.y;
      H.updatePlayerPosition();
    }

    H.checkAllObjectHits();
    H.centerCameraOnPlayer();
  });

  /* =========================================================
  4) INIT / RESIZE
  ========================================================= */
  Promise.all([H.loadTMXAndBuildMap(CFG.TMX.MAP), H.createPlayerFromSheet(), S.initPopupData()]).then(() => {
    S.worldReady = true;
    S.lastUpdate = Date.now();
    H.updatePlayerPosition();
    H.centerCameraOnPlayer();
  });

  window.addEventListener("resize", () => {
    console.log("resize happend");
    H.updateStageHitArea();
    H.centerCameraOnPlayer();
  });
})();
