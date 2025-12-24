(() => {
  const SOUND = { muted: false, volume: 0.6, sounds: {} };

  function loadSound(name, src, { loop = false, volume = 1 } = {}) {
    const audio = new Audio(src);
    audio.preload = "auto";
    audio.loop = loop;
    audio.volume = volume * SOUND.volume;
    SOUND.sounds[name] = audio;
  }

  function playSound(name) {
    if (SOUND.muted) return;
    const audio = SOUND.sounds[name];
    if (!audio) return;
    const a = audio.cloneNode();
    a.volume = audio.volume;
    a.play().catch(() => {});
  }

  function loopSound(name) {
    if (SOUND.muted) return;
    const audio = SOUND.sounds[name];
    if (!audio) return;
    if (audio.paused) {
      audio.currentTime = 0;
      audio.play().catch(() => {});
    }
  }

  function stopSound(name) {
    const audio = SOUND.sounds[name];
    if (!audio) return;
    audio.pause();
    audio.currentTime = 0;
  }

  function setSoundMuted(muted) {
    SOUND.muted = muted;
    Object.values(SOUND.sounds).forEach((a) => a.pause());
  }

  function initSounds() {
    loadSound("select", "/sounds/select.wav");
    loadSound("door-open", "/sounds/door-open-short.mp3");
    loadSound("door-close", "/sounds/door-close.mp3");
    loadSound("walk", "/sounds/footstep.wav", { loop: true, volume: 0.4 });

    // info
    loadSound("codec", "/sounds/codec.mp3", { volume: 0.9 });
    loadSound("failed", "/sounds/failed.mp3", { volume: 1 });
    loadSound("success", "/sounds/winning.mp3", { volume: 1 });
    loadSound("typing", "/sounds/morse.mp3", { volume: 1 });
    
    // gallery
    loadSound("gallery-open", "/sounds/page-flip_show-image.mp3");
    loadSound("gallery-select", "/sounds/flip-card_select-image.mp3");
    loadSound("gallery-close", "/sounds/page-flip_close-image.mp3");
  }

  window.SOUND = { initSounds, playSound, loopSound, stopSound, setSoundMuted };
})();
