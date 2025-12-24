console.log("PIXI.VERSION:", PIXI.VERSION);

(() => {
  const BASE_URL = window.location.origin;

  const app = new PIXI.Application({
    resizeTo: window,
    backgroundColor: 0x1a1a2e,
    antialias: true,
  });
  document.getElementById("gameContainer").appendChild(app.view);

  PIXI.BaseTexture.defaultOptions.scaleMode = PIXI.SCALE_MODES.NEAREST;

  const CFG = {
    TMX: { MAP: `${BASE_URL}/tile/iso.tmx` },
    ASSET: { SPRITE_SHEET: `${BASE_URL}/img/sheet-player.png` },

    MAP_TOPRIGHT_SHIFT_LEFT_U: -2,

    OBJ_GRID_OFFSET_Y: -1.5,
    OBJ_GRID_OFFSET_X: 0,
    OBJ_RIGHT_PAD_U: -2,

    PLAYER_SCALE: 1 / 4,
    MOVE_MARGIN: 0.15,
    MOVE_SPEED: 3.5,

    OBJECTS_ARE_ORTHO: true,

    HIT_RADIUS: 10,
  };

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

  L.background.zIndex = 0;
  L.triggerTile.zIndex = 200;
  L.foreground.zIndex = 300;
  L.mostfront.zIndex = 350;
  L.entities.zIndex = 400;
  L.objectsDebug.zIndex = 500;
  L.markers.zIndex = 600;
  L.glow.zIndex = 700;

  mapContainer.addChild(
    L.background,
    L.triggerTile,
    L.foreground,
    L.mostfront,
    L.entities,
    L.objectsDebug,
    L.markers,
    L.glow
  );

  const hitboxGraphic = new PIXI.Graphics();
  mapContainer.addChild(hitboxGraphic);

  const S = {
    BASE_URL,
    isDebug: true,

    worldReady: false,
    lastUpdate: Date.now(),
    gamePaused: false,
    inputEnabled: true,

    // map params
    TILE_W: 128,
    TILE_H: 64,
    MAP_W: 10,
    MAP_H: 14,

    ISO_ORIGIN_X: 0,
    ISO_ORIGIN_Y: 0,

    // player
    player: null,
    playerPos: { x: 4.5, y: 6.5 },
    playerBaseZ: 0,

    // animations
    animations: {},
    idleFrames: {},
    currentDir: "down",
    currentIsLeft: false,
    isWalking: false, // used by sound module only (optional)

    // input
    keys: {},
    pointerTarget: null,

    // objects
    collisionRects: [],
    triggerRects: [],
    collisionPolys: [],
    triggerPolys: [],
    layerPolys: [],

    // object transform
    OBJ_U_LEFT: 0,
    OBJ_U_SCALE_X: 1,

    // trigger state
    hitState: new Map(),
    activeTriggerKey: null,
    activeTriggerPayload: null,

    // tileset for sprite swap (door)
    tilesetTextures: [],
    tilesetFirstGid: 0,
    tileSpritesByGid: new Map(),

    doorOpen: false,

    // popup
    selectedProjectId: null,
  };

  window.GAME = { app, CFG, worldContainer, mapContainer, L, hitboxGraphic, S };

  window.DEBUG_SLIDE = false;

  window.DLOG = (...args) => {
    if (!window.DEBUG_SLIDE) return;
    console.log(...args);
  };
})();
