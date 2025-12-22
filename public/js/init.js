console.log("PIXI.VERSION:", PIXI.VERSION);
(() => {
  const BASE_URL = window.location.origin;
  /* =========================================================
  0) PIXI SETUP
  ========================================================= */
  const app = new PIXI.Application({
    resizeTo: window,
    backgroundColor: 0x1a1a2e,
    antialias: true,
  });
  document.getElementById("gameContainer").appendChild(app.view);
  PIXI.BaseTexture.defaultOptions.scaleMode = PIXI.SCALE_MODES.NEAREST;

  /* =========================================================
  1) CONFIG / CONSTANTS
  ========================================================= */
  const CFG = {
    TMX: { MAP: `${BASE_URL}/tile/iso.tmx` },
    ASSET: { SPRITE_SHEET: `${BASE_URL}/img/avatar.png` },

    MAP_TOPRIGHT_SHIFT_LEFT_U: 0.5,
    OBJ_GRID_OFFSET_Y: -1,
    OBJ_RIGHT_PAD_U: -2,

    PLAYER_SCALE: 1 / 4,
    MOVE_MARGIN: 0.15,
    MOVE_SPEED: 3.5,

    OBJECTS_ARE_ORTHO: true,

    HIT_RADIUS: 10,
  };

  /* =========================================================
  2) WORLD / CONTAINERS
  ========================================================= */
  const worldContainer = new PIXI.Container();
  worldContainer.sortableChildren = true;
  app.stage.addChild(worldContainer);

  const mapContainer = new PIXI.Container();
  mapContainer.sortableChildren = true;
  worldContainer.addChild(mapContainer);

  const L = {
    background: new PIXI.Container(),
    triggerTile: new PIXI.Container(),
    foreground: new PIXI.Container(),
    mostfront: new PIXI.Container(),
    entities: new PIXI.Container(),
    objectsDebug: new PIXI.Container(),
    markers: new PIXI.Container(),
    glow: new PIXI.Container(),
  };
  Object.values(L).forEach((c) => (c.sortableChildren = true));

  // Set base z-index untuk layer ordering
  L.background.zIndex = 0;
  L.triggerTile.zIndex = 200;
  L.foreground.zIndex = 300;
  L.mostfront.zIndex = 350;
  L.entities.zIndex = 400; // default: player di depan triggerTile & foreground
  L.objectsDebug.zIndex = 500;
  L.markers.zIndex = 600;
  L.glow.zIndex = 700;

  // Add all layers (order doesn't matter karena pakai zIndex)
  mapContainer.addChild(L.background);
  mapContainer.addChild(L.triggerTile);
  mapContainer.addChild(L.foreground);
  mapContainer.addChild(L.mostfront);
  mapContainer.addChild(L.entities); // akan di bawah layer "foreground" & "triggerTile" jika enter layerPoly
  mapContainer.addChild(L.objectsDebug);
  mapContainer.addChild(L.markers);
  mapContainer.addChild(L.glow);

  const hitboxGraphic = new PIXI.Graphics();
  mapContainer.addChild(hitboxGraphic);

  /* =========================================================
  3) GLOBAL STATE
  ========================================================= */
  const S = {
    // web
    BASE_URL: BASE_URL,

    // runtime
    worldReady: false,
    lastUpdate: Date.now(),

    // map params (override by TMX)
    TILE_W: 128,
    TILE_H: 64,
    MAP_W: 10,
    MAP_H: 14,

    // iso origin
    ISO_ORIGIN_X: 0,
    ISO_ORIGIN_Y: 0,

    // player
    player: null,
    playerPos: { x: 4.5, y: 6.5 },

    // animations
    animations: {},
    idleFrames: {},
    currentDir: "down",
    currentIsLeft: false,

    // input
    keys: {},
    pointerTarget: null, // {x,y} in GRID
    inputEnabled: true, // block input ketika di luar web 
    gamePaused: false,


    // objects
    collisionRects: [],
    triggerRects: [],
    collisionPolys: [],
    triggerPolys: [],
    layerPolys: [],

    // object transform
    OBJ_U_LEFT: 0,
    OBJ_U_SCALE_X: 1,

    // states
    hitState: new Map(), // key -> boolean
    activeTriggerKey: null,
    // trigger ui
    activeTriggerPayload: null,
    activeTriggerButton: null,   // PIXI.Graphics / Sprite button
    activeTriggerGlow: null,     // glow reference (optional)

    // tile for door
    tilesetTextures: [],
    tilesetFirstGid: 0,

    // tile sprites map
    tileSpritesByGid: new Map(), // gid -> [sprites]

    // glow graphics
    activeGlows: new Map(), // "tx,ty" -> Graphics
    glowedGids: new Set(), // gid that currently glow

    // share query
    selectedProjectId: null, // 1 - 5
    
    // Door state (open, closed)
    doorOpen: false,

    // POPUP
    popupEl: document.getElementById("tilePopup"),
    popupCloseBtn: document.getElementById("popupCloseBtn"),

    // popup top
    popupTopEl: document.getElementById("mode-top"),
    popupImgEl: document.getElementById("popupImg"),
    popupTitleEl: document.getElementById("popupTitle"),
    popupDescEl: document.getElementById("popupDesc"),

    // popup com
    popupComEl: document.getElementById("mode-com"),
    popupVid1El: document.getElementById("vid-pitch-deck"),
    popupVid2El: document.getElementById("vid-demo"),
    popupWebLinkEl: document.getElementById("webLink"),
    popupGithubLinkEl: document.getElementById("githubLink"),

    // popup presentation
    popupPresentationEl: document.getElementById("mode-presentation"),
    popupVid0El: document.getElementById("vid-presentation-day"),

    // popup rating
    popupRatingEl: document.getElementById("mode-rating"),
    popupRatingContainerEl: document.getElementById("rating-container"),
    
    // popup info
    popupOverlayEl: document.getElementById("overlay"),

    // helper: loader
    loaderEl: document.getElementById("loadingOverlay")
  };

  /* =========================================================
  4) EXPOSE
  ========================================================= */
  window.GAME = {
    app,
    CFG,
    worldContainer,
    mapContainer,
    L,
    hitboxGraphic,
    S,
  };
})();
