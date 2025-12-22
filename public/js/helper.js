// helper.js
(() => {
  const G = window.GAME;
  const R = window.RATING;
  const { app, CFG, worldContainer, mapContainer, L, hitboxGraphic, S } = G;
  const { paint } = window.RATE;
  const { isLoggedIn } = window.AUTH;

  /* =========================================================
A) POPUP DATA CACHE (localStorage)
========================================================= */

  const STORAGE_KEY = "GAME_POPUP_DATA";
  const STORAGE_TIME_KEY = "GAME_POPUP_DATA_TIME";
  const CACHE_TTL = 1000 * 60 * 60 * 6; // 6 jam

  /**
   * Ambil popup data dari localStorage
   */
  function loadPopupDataFromStorage() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const time = Number(localStorage.getItem(STORAGE_TIME_KEY));

      if (!raw || !time) return null;

      const age = Date.now() - time;
      if (age > CACHE_TTL) {
        console.log("[POPUP] Cache expired");
        return null;
      }

      return JSON.parse(raw);
    } catch (err) {
      console.warn("[POPUP] Failed to parse cache", err);
      return null;
    }
  }

  /**
   * Simpan popup data ke localStorage
   */
  function savePopupDataToStorage(data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      localStorage.setItem(STORAGE_TIME_KEY, Date.now().toString());
      // console.log("[POPUP] Data cached");
    } catch (err) {
      console.warn("[POPUP] Failed to save cache", err);
    }
  }

  /**
   * Fetch popup data dari API
   */
  async function fetchPopupData() {
    console.log("[POPUP] Fetching from API...");
    const res = await fetch("http://localhost:8080/api/projects");
    console.log("[POPUP] response", res);
    if (!res.ok) {
      throw new Error("HTTP " + res.status);
    }

    const data = await res.json();
    console.log("[POPUP] Fetched", data);
    savePopupDataToStorage(data);
    return data;
  }

  /**
   * Init popup data (cache-first strategy)
   */
  async function initPopupData({ force = false } = {}) {
    if (!force) {
      const cached = loadPopupDataFromStorage();
      console.log("[POPUP] Loaded from cache", cached);
      if (cached) {
        S.popupDataProjects = cached;
        return cached;
      }
    }

    try {
      const fresh = await fetchPopupData();
      S.popupDataProjects = fresh;
      return fresh;
    } catch (err) {
      console.error("[POPUP] Fetch failed", err);
      S.popupDataProjects = [];
      return {};
    }
  }

  /**
   * Helper: ambil data popup by trigger ID
   */
  function getPopupData(triggerId) {
    console.log("[POPUP] getPopupData", triggerId);
    console.log(S.popupDataProjects);
    return S.popupDataProjects?.find((p) => p.id == triggerId) || null;
  }

  /**
   * Helper: clear cache (DEV / logout / debug)
   */
  function clearPopupCache() {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(STORAGE_TIME_KEY);
    console.log("[POPUP] Cache cleared");
  }

  /* =========================================================
  B) EXPORT KE GAME
  ========================================================= */

  S.popupDataProjects = [];
  S.initPopupData = initPopupData;
  S.getPopupData = getPopupData;
  S.clearPopupCache = clearPopupCache;

  /* =========================================================
  A) UI POPUP
  ========================================================= */
  function showPopupProject(data) {
    console.log("[POPUP] showPopupProject", data);
    const imageUrl = data?.image ?? "#";
    const title = data?.title ?? "Info";
    const desc = data?.description ?? "-";

    S.popupImgEl.src = "http://localhost:8080/" + imageUrl;
    S.popupTitleEl.textContent = title;
    S.popupDescEl.textContent = desc;
    S.popupTopEl.classList.remove("hidden");
    S.popupEl.classList.remove("hidden");
  }

  function showPopupCom(data) {
    console.log("[POPUP] showPopupCom", data);
    const yt1 = data?.link_vid_pitch ?? "#";
    const yt2 = data?.link_vid_demo ?? "#";
    const webLink = data?.link_web ?? "#";
    const repoLink = data?.link_repo ?? "#";
    
    S.popupVid1El.src = yt1;
    S.popupVid2El.src = yt2;
    S.popupWebLinkEl.href = webLink;
    S.popupGithubLinkEl.href = repoLink;
    S.popupComEl.classList.remove("hidden");
    S.popupEl.classList.remove("hidden");

    if(isLoggedIn) {
      loginMessage.classList.add("hidden");
      rateForm.classList.remove("hidden");

      S.selectedProjectId = data.id;
      const rating = localStorage.getItem(`rating_${data.id}`) || 0;
      paint(rating, "active");
    } else {
      loginMessage.classList.remove("hidden");
      rateForm.classList.add("hidden");
    }
  }

  function closePopup() {
    S.popupPresentationEl.classList.add("hidden");
    S.popupRatingEl.classList.add("hidden");
    S.popupTopEl.classList.add("hidden");
    S.popupComEl.classList.add("hidden");
    // reset iframe
    S.popupVid0El.src = ""; // presentation day
    S.popupVid1El.src = ""; // pitch deck
    S.popupVid2El.src = ""; // demo
    S.popupEl.classList.add("hidden");
  }

  // function delay(ms) {
  //   return new Promise(resolve => setTimeout(resolve, ms));
  // }

  function showTriggerPopup(obj, key) { // !!!
    console.log("[POPUP] showTriggerPopup", obj, key);

    if (obj.mode === "present") {
      S.popupVid0El.src = "https://www.youtube.com/embed/TuHMaFgQXsQ";
      S.popupPresentationEl.classList.remove("hidden");
      S.popupEl.classList.remove("hidden");
    } else if (obj.mode === "info") {
      S.popupOverlayEl.classList.add("show");
    } else if (obj.mode === "archive") {
      S.popupRatingContainerEl.innerHTML = "";

      S.loaderEl.classList.remove("hidden");

      Promise.all([isLoggedIn, R.fetchRatings()])
        .then(() => {
          R.updateRating();
        })
        .catch(err => {
          console.error(err);
        })
        .finally(() => {
          S.loaderEl.classList.add("hidden");
        });

      S.popupRatingEl.classList.remove("hidden");
      S.popupEl.classList.remove("hidden");
    }

    // Prioritas 2: cache/database
    const fromDb = S.getPopupData(obj.tim); // tim == projects.id

    const data =
      fromDb || {
        title: `Trigger ${obj.id}`,
        desc: `Tidak ada data popup untuk ${key}. Tambahkan data DB project.`,
        imageUrl: "",
      };

    if (obj.mode === "top") {
      showPopupProject(data);
    } else if (obj.mode === "com") {
      showPopupCom(data);
    } else {
      console.warn("[POPUP] Unknown mode", obj.mode);
    }
  }
  // showTriggerPopup({ mode: "archive" }, "archive");
  // showTriggerPopup({ mode: "com", target: "53", tim: "2" }, "archive");

  function initPopupHandlers() {
    if (S.popupCloseBtn) S.popupCloseBtn.addEventListener("click", closePopup);

    if (S.popupEl) {
      S.popupEl.addEventListener("click", (e) => {
        if (e.target === S.popupEl) closePopup();
      });
    }
  }

  /* =========================================================
  B) ISO HELPERS
  ========================================================= */
  function tileSpriteBaseY() {
    return S.TILE_H / 2;
  }

  function updateIsoOrigin() {
    S.ISO_ORIGIN_X = (S.MAP_H - 1) * (S.TILE_W / 2);
    S.ISO_ORIGIN_X -= CFG.MAP_TOPRIGHT_SHIFT_LEFT_U * (S.TILE_W / 2);
    S.ISO_ORIGIN_Y = 0;
  }

  function toIsoTiled(u, v) {
    return {
      x: (u - v) * (S.TILE_W / 2) + S.ISO_ORIGIN_X,
      y: (u + v) * (S.TILE_H / 2) + S.ISO_ORIGIN_Y,
    };
  }

  function toGridFromIsoTiled(ix, iy) {
    const x = ix - S.ISO_ORIGIN_X;
    const y = iy - S.ISO_ORIGIN_Y;
    const a = S.TILE_W / 2;
    const b = S.TILE_H / 2;
    const u = (x / a + y / b) / 2;
    const v = (y / b - x / a) / 2;
    return { x: u, y: v };
  }

  function screenDirToGridDir(sx, sy) {
    const a = S.TILE_W / 2;
    const b = S.TILE_H / 2;
    const du = (sx / a + sy / b) / 2;
    const dv = (sy / b - sx / a) / 2;
    return { x: du, y: dv };
  }

  /* =========================================================
  C) CAMERA
  ========================================================= */
  function centerCameraOnPlayer() {
    if (!S.player) return;
    const targetX = app.screen.width / 2 + 60;
    const targetY = app.screen.height / 2 + 60;

    worldContainer.x = targetX - S.player.x;
    worldContainer.y = targetY - S.player.y;
  }

  function updateStageHitArea() {
    app.stage.eventMode = "static";
    app.stage.hitArea = new PIXI.Rectangle(0, 0, app.screen.width, app.screen.height);
  }

  /* =========================================================
  D) OBJECT TRANSFORM (ORTHO -> ISO)
  ========================================================= */
  function transformObjectGrid(u, v) {
    const u2 = S.OBJ_U_LEFT + (u - S.OBJ_U_LEFT) * S.OBJ_U_SCALE_X;
    const v2 = v + CFG.OBJ_GRID_OFFSET_Y;
    return { u: u2, v: v2 };
  }

  function orthoPxToGrid(px, py) {
    return { u: px / S.TILE_W, v: py / S.TILE_H };
  }

  function orthoPointsToIsoPoints(pointsPx) {
    const yOff = tileSpriteBaseY();
    return pointsPx.map((p) => {
      const gv0 = orthoPxToGrid(p.x, p.y);
      const gv = transformObjectGrid(gv0.u, gv0.v);
      const ip = toIsoTiled(gv.u, gv.v);
      return { x: ip.x, y: ip.y + yOff };
    });
  }

  function rectOrthoPxToIsoPoly(rect) {
    return orthoPointsToIsoPoints([
      { x: rect.x, y: rect.y },
      { x: rect.x + rect.w, y: rect.y },
      { x: rect.x + rect.w, y: rect.y + rect.h },
      { x: rect.x, y: rect.y + rect.h },
    ]);
  }

  function rebuildObjectIsoPolys() {
    if (!CFG.OBJECTS_ARE_ORTHO) return;
    S.collisionRects.forEach((r) => (r.isoPoly = rectOrthoPxToIsoPoly(r)));
    S.triggerRects.forEach((r) => (r.isoPoly = rectOrthoPxToIsoPoly(r)));
  }

  /* =========================================================
  E) COLLISION (circle vs rect/poly)
  ========================================================= */
  function pointInPolygon(point, polygon) {
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i].x, yi = polygon[i].y;
      const xj = polygon[j].x, yj = polygon[j].y;
      const intersect =
        yi > point.y !== yj > point.y &&
        point.x < ((xj - xi) * (point.y - yi)) / (yj - yi) + xi;
      if (intersect) inside = !inside;
    }
    return inside;
  }

  function distPointToSegment(p, a, b) {
    const vx = b.x - a.x, vy = b.y - a.y;
    const wx = p.x - a.x, wy = p.y - a.y;
    const c1 = vx * wx + vy * wy;
    if (c1 <= 0) return Math.hypot(p.x - a.x, p.y - a.y);
    const c2 = vx * vx + vy * vy;
    if (c2 <= c1) return Math.hypot(p.x - b.x, p.y - b.y);
    const t = c1 / c2;
    const proj = { x: a.x + t * vx, y: a.y + t * vy };
    return Math.hypot(p.x - proj.x, p.y - proj.y);
  }

  function circleIntersectsPolygon(center, radius, poly) {
    if (pointInPolygon(center, poly)) return true;
    for (let i = 0; i < poly.length; i++) {
      const a = poly[i];
      const b = poly[(i + 1) % poly.length];
      if (distPointToSegment(center, a, b) <= radius) return true;
    }
    return false;
  }

  function circleIntersectsRect(center, radius, rect) {
    const closestX = Math.max(rect.x, Math.min(center.x, rect.x + rect.w));
    const closestY = Math.max(rect.y, Math.min(center.y, rect.y + rect.h));
    const dx = center.x - closestX;
    const dy = center.y - closestY;
    return dx * dx + dy * dy <= radius * radius;
  }

  function hitTestShape(center, radius, shape) {
    if (shape.isoPoly) return circleIntersectsPolygon(center, radius, shape.isoPoly);

    if (shape.w !== undefined) return circleIntersectsRect(center, radius, shape);

    // polygon object: shape.points
    const polyPts = CFG.OBJECTS_ARE_ORTHO ? orthoPointsToIsoPoints(shape.points) : shape.points;
    return circleIntersectsPolygon(center, radius, polyPts);
  }

  function isBlockedByCollision(center, radius = CFG.HIT_RADIUS) {
    for (const rect of S.collisionRects) if (hitTestShape(center, radius, rect)) return true;
    for (const poly of S.collisionPolys) if (hitTestShape(center, radius, poly)) return true;
    return false;
  }

  /* =========================================================
  F) GLOW (diamond graphics = clickable layer)
  ========================================================= */
  function drawGlowDiamondAtTile(tx, ty, options = {}) {
    const key = `${tx},${ty}`;
    if (S.activeGlows.has(key)) return S.activeGlows.get(key);

    const glow = new PIXI.Graphics();
    const p = toIsoTiled(tx, ty);
    const baseY = tileSpriteBaseY();

    const top = { x: p.x, y: p.y + baseY - S.TILE_H / 2 };
    const right = { x: p.x + S.TILE_W / 2, y: p.y + baseY };
    const bottom = { x: p.x, y: p.y + baseY + S.TILE_H / 2 };
    const left = { x: p.x - S.TILE_W / 2, y: p.y + baseY };

    const color = options.color ?? 0x00ffcc;

    glow.clear();
    for (let i = 10; i >= 1; i--) {
      glow.lineStyle(i, color, 0.05);
      glow.moveTo(top.x, top.y);
      glow.lineTo(right.x, right.y);
      glow.lineTo(bottom.x, bottom.y);
      glow.lineTo(left.x, left.y);
      glow.closePath();
    }
    glow.lineStyle(2, color, 0.95);
    glow.moveTo(top.x, top.y);
    glow.lineTo(right.x, right.y);
    glow.lineTo(bottom.x, bottom.y);
    glow.lineTo(left.x, left.y);
    glow.closePath();

    // ✅ interaktif + cursor
    glow.eventMode = "static";
    glow.cursor = "pointer";

    // penting: polygon hitArea (koordinat LOKAL glow)
    glow.hitArea = new PIXI.Polygon([
      top.x - glow.x, top.y - glow.y,
      right.x - glow.x, right.y - glow.y,
      bottom.x - glow.x, bottom.y - glow.y,
      left.x - glow.x, left.y - glow.y,
    ]);

    glow.on("pointertap", (e) => {
      e.stopPropagation();
      console.log("[GLOW CLICK]", key);
      // kalau kamu mau: showPopupProject dari data tile/gid tertentu, bisa ditambah di options
      if (options.onClick) options.onClick({ tx, ty, key });
    });

    glow.zIndex = bottom.y;
    L.glow.addChild(glow);

    S.activeGlows.set(key, glow);
    return glow;
  }

  function removeGlowDiamondAtTile(tx, ty) {
    const key = `${tx},${ty}`;
    const glow = S.activeGlows.get(key);
    if (!glow) return;
    glow.removeFromParent();
    glow.destroy(true);
    S.activeGlows.delete(key);
  }

  /* =========================================================
  G) DEBUG: "elemen mana yang diinteraksi"
  ========================================================= */
  function installInteractionDebugger() {
    // Capturing: lihat event paling awal
    // app.stage.on("pointerdown", (e) => {
    //   const t = e.target;
    //   console.log("[INTERACT] pointerdown target =", {
    //     target: t?.constructor?.name,
    //     name: t?.name,
    //     parent: t?.parent?.constructor?.name,
    //   });
    // });
  }

  /* =========================================================
  H) PLAYER helpers
  ========================================================= */
  function clampPlayerToMap() {
    S.playerPos.x = Math.max(
      CFG.MOVE_MARGIN,
      Math.min(S.MAP_W - 1 - CFG.MOVE_MARGIN, S.playerPos.x)
    );
    S.playerPos.y = Math.max(
      CFG.MOVE_MARGIN,
      Math.min(S.MAP_H - 1 - CFG.MOVE_MARGIN, S.playerPos.y)
    );
  }

  function updatePlayerPosition() {
    if (!S.player) return;
    // console.log("[PLAYER] updatePlayerPosition", S.playerPos);
    const iso = toIsoTiled(S.playerPos.x, S.playerPos.y);
    S.player.x = iso.x;
    S.player.y = iso.y + tileSpriteBaseY();
    S.player.zIndex = S.player.y + S.playerBaseZ;

    // debug hitbox
    hitboxGraphic.clear();
    hitboxGraphic.lineStyle(1, 0x00ff00, 1);
    hitboxGraphic.beginFill(0x00ff00, 0.25);
    hitboxGraphic.drawEllipse(S.player.x, S.player.y, 10, 6);
    hitboxGraphic.endFill();
  }

  function directionFromAngle(angleDeg) {
    const sector = Math.floor((angleDeg + 22.5) / 45) % 8;
    switch (sector) {
      case 0: return { dir: "side", isLeft: false };
      case 1: return { dir: "downSide", isLeft: false };
      case 2: return { dir: "down", isLeft: false };
      case 3: return { dir: "downSide", isLeft: true };
      case 4: return { dir: "side", isLeft: true };
      case 5: return { dir: "upSide", isLeft: true };
      case 6: return { dir: "up", isLeft: false };
      case 7: return { dir: "upSide", isLeft: false };
    }
  }

  function updatePlayerAnimation(moving, dir, isLeft) {
    if (!S.player) return;

    S.currentDir = dir || S.currentDir;
    S.currentIsLeft = isLeft ?? S.currentIsLeft;

    const sx = (S.currentIsLeft ? -1 : 1) * CFG.PLAYER_SCALE;
    S.player.scale.x = sx;
    S.player.scale.y = CFG.PLAYER_SCALE;

    if (moving) {
      const target = S.animations[S.currentDir];
      if (S.player.textures !== target) {
        S.player.textures = target;
        S.player.play();
      } else if (!S.player.playing) {
        S.player.play();
      }
    } else {
      const idle = S.idleFrames[S.currentDir];
      if (S.player.textures.length !== 1 || S.player.textures[0] !== idle)
        S.player.textures = [idle];
      S.player.gotoAndStop(0);
    }
  }

  async function createPlayerFromSheet() {
    const baseTexture = await PIXI.Assets.load(CFG.ASSET.SPRITE_SHEET);

    const SHEET_WIDTH = 384;
    const SHEET_HEIGHT = 960;
    const FRAME_COLS = 4;
    const FRAME_ROWS = 5;

    const FRAME_W = SHEET_WIDTH / FRAME_COLS;
    const FRAME_H = SHEET_HEIGHT / FRAME_ROWS;

    const frames = [];
    for (let row = 0; row < FRAME_ROWS; row++) {
      frames[row] = [];
      for (let col = 0; col < FRAME_COLS; col++) {
        const rect = new PIXI.Rectangle(col * FRAME_W, row * FRAME_H, FRAME_W, FRAME_H);
        frames[row][col] = new PIXI.Texture(baseTexture, rect);
      }
    }

    S.animations = {
      down: frames[0].slice(1),
      downSide: frames[1].slice(1),
      side: frames[2].slice(1),
      upSide: frames[3].slice(1),
      up: frames[4].slice(1),
    };

    S.idleFrames = {
      down: frames[0][0],
      downSide: frames[1][0],
      side: frames[2][0],
      upSide: frames[3][0],
      up: frames[4][0],
    };

    S.player = new PIXI.AnimatedSprite(S.animations.down);

    // ✅ anchor center-bottom
    S.player.anchor.set(0.5, 1);

    // ✅ tampil 3x lebih kecil, tapi texture tetap high-res
    S.player.scale.set(CFG.PLAYER_SCALE);

    S.player.animationSpeed = 0.12;
    S.player.play();

    // ✅ agar player tidak menghalangi interaksi objek lain
    S.player.eventMode = "passive";
    S.player.interactiveChildren = false;
    S.player.cursor = "default";

    L.entities.addChild(S.player);
    updatePlayerPosition();
  }

  /* =========================================================
  I) TMX / TSX LOAD
  ========================================================= */
  async function fetchText(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Fetch failed ${url}: ${res.status}`);
    return await res.text();
  }

  function parseCSV(csvText) {
    return csvText.trim().split(/[\s,]+/).map((n) => Number(n));
  }

  function readTMXProperties(objectEl) {
    const props = {};
    const propsEl = objectEl.querySelector("properties");
    if (!propsEl) return props;

    for (const p of propsEl.querySelectorAll("property")) {
      const name = p.getAttribute("name");
      const type = p.getAttribute("type") || "string";
      let value = p.getAttribute("value");
      if (value === null) value = p.textContent;

      if (type === "int" || type === "float") value = Number(value);
      if (type === "bool") value = value === "true";
      props[name] = value;
    }
    return props;
  }

  async function buildTexturesFromTSX(tsxDoc, baseDir) {
    const tilesetEl = tsxDoc.querySelector("tileset");
    const columnsAttr = tilesetEl.getAttribute("columns");

    // MODE A: atlas
    const atlasImageEl = tsxDoc.querySelector("tileset > image");
    if (atlasImageEl && columnsAttr) {
      const columns = Number(columnsAttr);
      const tw = Number(tilesetEl.getAttribute("tilewidth"));
      const th = Number(tilesetEl.getAttribute("tileheight"));
      const imageUrl = baseDir + atlasImageEl.getAttribute("source");
      const baseTexture = await PIXI.Assets.load(imageUrl);

      const rows = Math.floor(baseTexture.height / th);
      const total = rows * columns;

      const texturesByLocalId = [];
      for (let i = 0; i < total; i++) {
        const col = i % columns;
        const row = Math.floor(i / columns);
        const rect = new PIXI.Rectangle(col * tw, row * th, tw, th);
        texturesByLocalId[i] = new PIXI.Texture(baseTexture, rect);
      }
      return texturesByLocalId;
    }

    // MODE B: collection-of-images
    const texturesByLocalId = [];
    const tileEls = [...tsxDoc.querySelectorAll("tileset > tile")];

    await Promise.all(
      tileEls.map(async (t) => {
        const id = Number(t.getAttribute("id"));
        const img = t.querySelector("image");
        if (!img) return;
        const url = baseDir + img.getAttribute("source");
        const tex = await PIXI.Assets.load(url);
        texturesByLocalId[id] = tex;
      })
    );

    return texturesByLocalId;
  }

  function parseObjectGroups(tmxDoc) {
    S.collisionRects = [];
    S.triggerRects = [];
    S.collisionPolys = [];
    S.triggerPolys = [];
    S.layerPolys = [];

    const groups = [...tmxDoc.querySelectorAll("objectgroup")];

    for (const og of groups) {
      const name = (og.getAttribute("name") || "").toLowerCase();
      const objs = [...og.querySelectorAll("object")];

      for (const o of objs) {
        const id = Number(o.getAttribute("id") || 0);
        const ox = Number(o.getAttribute("x") || 0);
        const oy = Number(o.getAttribute("y") || 0);
        const ow = Number(o.getAttribute("width") || 0);
        const oh = Number(o.getAttribute("height") || 0);
        const properties = readTMXProperties(o);

        const polyEl = o.querySelector("polygon");
        if (polyEl) {
          const points = polyEl
            .getAttribute("points")
            .trim()
            .split(" ")
            .map((pair) => {
              const [px, py] = pair.split(",").map(Number);
              return { x: ox + px, y: oy + py };
            });

          const pack = { id, points, properties };

          if (name === "trigger") S.triggerPolys.push(pack);
          else if (name === "layer") S.layerPolys.push(pack);
          else if (name === "collisions") S.collisionPolys.push(pack);
          continue;
        }

        const r = { id, x: ox, y: oy, w: ow, h: oh, properties };
        if (name === "collisions") S.collisionRects.push(r);
        if (name === "trigger") S.triggerRects.push(r);
      }
    }
  }

  function computeObjectUTransform() {
    let minU = Infinity;
    let maxU = -Infinity;

    const scanRect = (r) => {
      const u1 = r.x / S.TILE_W;
      const u2 = (r.x + r.w) / S.TILE_W;
      minU = Math.min(minU, u1, u2);
      maxU = Math.max(maxU, u1, u2);
    };

    S.collisionRects.forEach(scanRect);
    S.triggerRects.forEach(scanRect);

    const scanPolyList = (arr) => {
      arr.forEach((poly) => {
        poly.points.forEach((p) => {
          const u = p.x / S.TILE_W;
          minU = Math.min(minU, u);
          maxU = Math.max(maxU, u);
        });
      });
    };

    scanPolyList(S.triggerPolys);
    scanPolyList(S.collisionPolys);
    scanPolyList(S.layerPolys);

    if (!isFinite(minU) || !isFinite(maxU) || maxU - minU < 1e-6) {
      S.OBJ_U_LEFT = 0;
      S.OBJ_U_SCALE_X = 1;
      return;
    }

    const targetRightU = S.MAP_W + CFG.OBJ_RIGHT_PAD_U;
    S.OBJ_U_LEFT = minU;
    S.OBJ_U_SCALE_X = (targetRightU - minU) / (maxU - minU);

    console.log("[OBJ U TRANSFORM]", {
      OBJ_U_LEFT: S.OBJ_U_LEFT,
      OBJ_U_SCALE_X: S.OBJ_U_SCALE_X,
      minU,
      maxU,
      MAP_W: S.MAP_W,
      targetRightU,
    });
  }

  function clearMapLayers() {
    L.background.removeChildren();
    L.triggerTile.removeChildren();
    L.foreground.removeChildren();
    L.objectsDebug.removeChildren();
    L.markers.removeChildren();

    // destroy glow
    for (const g of S.activeGlows.values()) {
      g.removeFromParent();
      g.destroy(true);
    }
    S.activeGlows.clear();
    L.glow.removeChildren();

    hitboxGraphic.clear();
    S.tileSpritesByGid.clear();
  }

  async function loadTMXAndBuildMap(tmxUrl) {
    clearMapLayers();

    const tmxText = await fetchText(tmxUrl);
    const tmxDoc = new DOMParser().parseFromString(tmxText, "text/xml");

    const mapEl = tmxDoc.querySelector("map");
    S.MAP_W = Number(mapEl.getAttribute("width"));
    S.MAP_H = Number(mapEl.getAttribute("height"));
    S.TILE_W = Number(mapEl.getAttribute("tilewidth"));
    S.TILE_H = Number(mapEl.getAttribute("tileheight"));

    updateIsoOrigin();

    const tilesetEl = tmxDoc.querySelector("tileset");
    const firstGid = Number(tilesetEl.getAttribute("firstgid"));
    const tsxSource = tilesetEl.getAttribute("source");

    const baseDir = tmxUrl.split("/").slice(0, -1).join("/") + "/";
    const tsxUrl = baseDir + tsxSource;

    const tsxText = await fetchText(tsxUrl);
    const tsxDoc = new DOMParser().parseFromString(tsxText, "text/xml");

    const texturesByLocalId = await buildTexturesFromTSX(tsxDoc, baseDir);

    // ✅ TAMBAHKAN: Simpan untuk digunakan changeSprite()
    S.tilesetTextures = texturesByLocalId;
    S.tilesetFirstGid = firstGid;

    // render layers
    const layerEls = [...tmxDoc.querySelectorAll("layer")];
    for (const layerEl of layerEls) {
      const name = layerEl.getAttribute("name");
      const csv = layerEl.querySelector("data").textContent;
      const gids = parseCSV(csv);

      const target =
        name === "background"
          ? L.background
          : name === "triggerTile"
            ? L.triggerTile
            : name === "foreground"
              ? L.foreground
              : L.background;

      for (let row = 0; row < S.MAP_H; row++) {
        for (let col = 0; col < S.MAP_W; col++) {
          const gid = gids[row * S.MAP_W + col];
          if (!gid) continue;

          const localId = gid - firstGid;
          const tex = texturesByLocalId[localId];
          if (!tex) continue;

          const p = toIsoTiled(col, row);

          const sp = new PIXI.Sprite(tex);
          sp.anchor.set(0.5, 1);
          sp.x = p.x;
          sp.y = p.y + tileSpriteBaseY();
          sp.zIndex = name === "triggerTile" ? sp.y + 1 : sp.y;

          target.addChild(sp);

          if (!S.tileSpritesByGid.has(gid)) S.tileSpritesByGid.set(gid, []);
          S.tileSpritesByGid.get(gid).push(sp);
        }
      }
    }

    // objects
    parseObjectGroups(tmxDoc);
    computeObjectUTransform();
    rebuildObjectIsoPolys();

    // spawn center
    S.playerPos.x = (S.MAP_W - 1) / 2;
    S.playerPos.y = (S.MAP_H - 1) / 2;

    console.log("✅ World ready (map built)", {
      MAP_W: S.MAP_W,
      MAP_H: S.MAP_H,
      TILE_W: S.TILE_W,
      TILE_H: S.TILE_H,
      ISO_ORIGIN_X: S.ISO_ORIGIN_X,
      ISO_ORIGIN_Y: S.ISO_ORIGIN_Y,
    });
  }

  /* =========================================================
  J) ENTER/EXIT HIT TRIGGER
  ========================================================= */
  function glowTargetFromProps(props) {
    console.log("[TRIGGER] glowTargetFromProps", props);
    if (!props || props.target === undefined) return;

    const gid = Number(props.target);
    const sprites = S.tileSpritesByGid.get(gid);

    if (!sprites || sprites.length === 0) {
      console.warn("[GLOW] No tile sprite found for GID", gid);
      return;
    }

    // simpan referensi aktif (untuk remove nanti)
    if (!S.activeTriggerGlow) S.activeTriggerGlow = [];

    sprites.forEach((sp) => {
      // jangan double-glow
      if (sp.__glowFilter) return;

      // pastikan tile tidak makan event
      sp.eventMode = "none";
      sp.cursor = null;

      const glow = new PIXI.filters.GlowFilter({
        distance: 20,              // ketebalan glow
        outerStrength: 2,
        innerStrength: 0,
        color: 0x00ffff,
        quality: 0.5,
      });

      // animasi pulse
      glow.__pulse = () => {
        glow.outerStrength =
          2 + Math.sin(performance.now() * 0.004) * 1.5;
      };

      sp.filters = sp.filters ? [...sp.filters, glow] : [glow];
      sp.__glowFilter = glow;

      app.ticker.add(glow.__pulse);

      S.activeTriggerGlow.push(sp);
    });
  }

  function removeGlowTarget() {
    if (!S.activeTriggerGlow) return;

    S.activeTriggerGlow.forEach((sp) => {
      const glow = sp.__glowFilter;
      if (!glow) return;

      app.ticker.remove(glow.__pulse);

      sp.filters = (sp.filters || []).filter((f) => f !== glow);
      delete sp.__glowFilter;
    });

    S.activeTriggerGlow.length = 0;
  }


  function getTileCenterFromTarget(props) {
    // Priority 1: by GID (target)
    const gid = props?.target;
    if (gid !== undefined && S.tileSpritesByGid.has(Number(gid))) {
      const list = S.tileSpritesByGid.get(Number(gid));
      if (list && list.length) {
        // sprite tile anchor (0.5,1): x,y = bottom center tile
        // center tile = naik sedikit half tile height
        const sp = list[0];
        return { x: sp.x, y: sp.y - (S.TILE_H / 2) };
      }
    }

    // Priority 2: by tile coord
    if (props?.targetTileX !== undefined && props?.targetTileY !== undefined) {
      const p = toIsoTiled(Number(props.targetTileX), Number(props.targetTileY));
      return { x: p.x, y: p.y + tileSpriteBaseY() - (S.TILE_H / 2) };
    }

    return null;
  }

  function showTriggerButton(props) {
    const center = getTileCenterFromTarget(props);
    if (center) {
      addActionButtonAt(center.x, center.y, () => {
        // onClick button -> show popup
        showTriggerPopup(props, props.key);
      });
    }
  }

  function removeTriggerButton() {
    if (S.activeTriggerButton) {
      S.activeTriggerButton.removeFromParent();
      S.activeTriggerButton.destroy(true);
      S.activeTriggerButton = null;
    }
  }

  function addActionButtonAt(x, y, onClick) {
    // Remove existing first
    if (S.activeTriggerButton) {
      S.activeTriggerButton.removeFromParent();
      S.activeTriggerButton.destroy(true);
      S.activeTriggerButton = null;
    }

    const btn = new PIXI.Graphics();
    btn.name = "TriggerActionButton";

    // button style (simple game UI)
    const r = 14;
    btn.beginFill(0x00ffcc, 0.95);
    btn.drawRoundedRect(-26, -16, 52, 32, 10);
    btn.endFill();

    btn.lineStyle(2, 0x001a1a, 0.9);
    btn.moveTo(-8, 0);
    btn.lineTo(8, 0);
    btn.moveTo(0, -8);
    btn.lineTo(0, 8);

    // place
    btn.x = x;
    btn.y = y;

    // ensure above the tile
    btn.zIndex = y + 9999;

    // interaction
    btn.eventMode = "static";
    btn.cursor = "pointer";
    btn.on("pointertap", (e) => {
      e.stopPropagation();
      onClick?.();
    });

    // Put in L.glow so it's above map layers
    L.glow.addChild(btn);

    S.activeTriggerButton = btn;
    return btn;
  }

  async function changeSprite(props) {
    if (!props.target || !props.change) return;

    // props.target = tile ID di layer (contoh: 22)
    // Ini adalah GID (Global ID) = firstGid + localId
    const targetGid = Number(props.target);
    console.log("[SPRITE] changeSprite", targetGid, props.change);
    const list = S.tileSpritesByGid.get(targetGid);
    console.log("[SPRITE] list", list);

    if (!list || !list.length) {
      console.warn(`[SPRITE] No sprites found for GID ${targetGid}`);
      return;
    }

    try {
      // props.change = tile ID tujuan (contoh: 21 untuk tile id="20")
      // Karena di CSV: tile id + 1, maka GID = firstGid + tileId
      const changeGid = Number(props.change);

      // Hitung localId dari changeGid
      const changeLocalId = changeGid - S.tilesetFirstGid;

      // Ambil texture dari tileset yang sudah di-load
      const newTexture = S.tilesetTextures[changeLocalId];

      if (!newTexture) {
        console.warn(`[SPRITE] Texture not found for GID ${changeGid} (localId: ${changeLocalId})`);
        return;
      }

      // Apply texture ke semua sprite dengan target GID
      list.forEach((sp) => {
        const oldTexture = sp.texture;
        sp.texture = newTexture;

        console.log(`[SPRITE] Changed sprite at (${sp.x}, ${sp.y})`);
      });

      console.log(`[SPRITE] ✅ Changed ${list.length} sprites from GID ${targetGid} to GID ${changeGid}`);

    } catch (err) {
      console.error(`[SPRITE] Failed to change sprite:`, err);
    }
  }

  function reportHit(key, hit, payload) {
    const prev = S.hitState.get(key) || false;
    const props = payload.properties || {};

    // ENTER
    if (hit && !prev) {
      console.log(`✅ ENTER ${key}`, props);

      // event popup
      if (key.startsWith("TRIGGER_RECT#") || key.startsWith("TRIGGER_POLY#")) {
        // case: door open
        if (props?.mode === "door") {
          // console.log("[TRIGGER] door open");
          changeSprite(props);
          // return;
        }

        // case: popup
        glowTargetFromProps(props);
        showTriggerButton(props); // tombol di tengah tile
      }

      // change player layer
      if (key.startsWith("LAYER_POLY#")) {
        // console.log("[LAYER] layerPoly hit");
        if (L.entities.zIndex === 100) return;
        L.entities.zIndex = 100;
      }
    }

    // EXIT
    if (!hit && prev) {
      // console.log(`⬅️ EXIT ${key}`, props);

      if (key.startsWith("TRIGGER_RECT#") || key.startsWith("TRIGGER_POLY#")) {
        removeGlowTarget();
        removeTriggerButton();
        closePopup();
      }

      // change player layer
      if (key.startsWith("LAYER_POLY#")) {
        // console.log("[LAYER] layerPoly exit");
        if (L.entities.zIndex === 400) return;
        L.entities.zIndex = 400;
      }
    }

    S.hitState.set(key, hit);
  }

  function getPlayerFootPoint() {
    return { x: S.player.x, y: S.player.y };
  }

  function checkAllObjectHits() {
    const c = getPlayerFootPoint();
    const r = CFG.HIT_RADIUS;

    S.collisionRects.forEach((obj) => // must not enter
      reportHit(`COLLISION_RECT#${obj.id}`, hitTestShape(c, r, obj), obj)
    );
    S.triggerRects.forEach((obj) => // event triggered
      reportHit(`TRIGGER_RECT#${obj.id}`, hitTestShape(c, r, obj), obj)
    );

    S.collisionPolys.forEach((obj) => // must not enter
      reportHit(`COLLISION_POLY#${obj.id}`, hitTestShape(c, r, obj), obj)
    );
    S.triggerPolys.forEach((obj) => // event triggered
      reportHit(`TRIGGER_POLY#${obj.id}`, hitTestShape(c, r, obj), obj)
    );
    S.layerPolys.forEach((obj) => // z-index player change
      reportHit(`LAYER_POLY#${obj.id}`, hitTestShape(c, r, obj), obj)
    );
  }

  /* =========================================================
  K) INPUT VECTOR (screen-based)
  ========================================================= */
  function computeScreenVectorFromInput() {
    if (!S.inputEnabled) return { sx: 0, sy: 0 };

    let sx = 0,
      sy = 0;

    if (S.keys["arrowup"] || S.keys["w"]) sy -= 1;
    if (S.keys["arrowdown"] || S.keys["s"]) sy += 1;
    if (S.keys["arrowleft"] || S.keys["a"]) sx -= 1;
    if (S.keys["arrowright"] || S.keys["d"]) sx += 1;

    const usingKeyboard = sx !== 0 || sy !== 0;
    if (usingKeyboard) S.pointerTarget = null;

    if (!usingKeyboard && S.pointerTarget) {
      const pIso = toIsoTiled(S.playerPos.x, S.playerPos.y);
      const tIso = toIsoTiled(S.pointerTarget.x, S.pointerTarget.y);

      sx = tIso.x - pIso.x;
      sy = tIso.y - pIso.y;

      const distIso = Math.hypot(sx, sy);
      if (distIso < 2) {
        S.pointerTarget = null;
        sx = 0;
        sy = 0;
      } else {
        sx /= distIso;
        sy /= distIso;
      }
    }

    // normalize diagonal keyboard
    if (usingKeyboard) {
      const len = Math.hypot(sx, sy);
      if (len > 0) {
        sx /= len;
        sy /= len;
      }
    }

    return { sx, sy };
  }


  function resetAllInputs() {
    // keyboard
    Object.keys(S.keys).forEach((k) => (S.keys[k] = false));

    // pointer
    S.pointerTarget = null;

    // marker
    L.markers.removeChildren();
  }

  function setInputEnabled(enabled) {
    S.inputEnabled = enabled;

    if (!enabled) {
      resetAllInputs();
    }
  }

  // stop movement
  function pauseGame() {
    gamePaused = true;
    setInputEnabled(false);
  }

  function resumeGame() {
    gamePaused = false;
    setInputEnabled(true);

    // reset timer supaya dt tidak loncat
    lastUpdate = Date.now();
  }

  window.addEventListener("blur", pauseGame);
  window.addEventListener("focus", resumeGame);

  // lebih akurat untuk tab switching
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) pauseGame();
    else resumeGame();
  });


  /* =========================================================
  EXPOSE HELPERS
  ========================================================= */
  window.GAME_HELPER = {
    // popup
    initPopupHandlers,
    showPopupProject,
    closePopup,

    // iso/camera
    tileSpriteBaseY,
    updateIsoOrigin,
    toIsoTiled,
    toGridFromIsoTiled,
    screenDirToGridDir,
    centerCameraOnPlayer,
    updateStageHitArea,

    // objects
    orthoPointsToIsoPoints,
    rectOrthoPxToIsoPoly,
    rebuildObjectIsoPolys,

    // collision
    hitTestShape,
    isBlockedByCollision,

    // glow
    drawGlowDiamondAtTile,
    removeGlowDiamondAtTile,

    // player
    clampPlayerToMap,
    updatePlayerPosition,
    directionFromAngle, // arah rotasi sheet player
    updatePlayerAnimation,
    createPlayerFromSheet,

    // TMX
    loadTMXAndBuildMap,

    // loop helpers
    computeScreenVectorFromInput,
    checkAllObjectHits, // collisions

    // debug
    installInteractionDebugger,
  };
})();