<div id="gameContainer"></div>

<div id="info">
  <div>Klik di map untuk bergerak</div>
</div>

<!-- Loading Overlay -->
<div id="loadingOverlay" class="loading-overlay hidden">
  <div class="loader">
    <div class="spinner"></div>
    <div class="loading-text">Loading...</div>
  </div>
</div>

<!-- Flash Card -->
<div id="flashCard" class="flash-card hidden" role="status" aria-live="polite">
  <div class="flash-inner">
    <div class="flash-icon" id="flashIcon" aria-hidden="true"></div>

    <div class="flash-content">
      <div class="flash-title" id="flashTitle">Info</div>
      <div class="flash-message" id="flashMessage">Message here...</div>
    </div>

    <button class="flash-close" id="flashCloseBtn" aria-label="Close">✕</button>
  </div>

  <!-- time slider -->
  <div class="flash-progress">
    <div class="flash-progress-bar" id="flashProgressBar"></div>
  </div>
</div>

<!-- Top-right login button -->
<div class="top-right">
  <button id="googleLoginBtn" class="login-btn">
    <img id="loginIcon" referrerpolicy="no-referrer" crossorigin="anonymous" src="/img/g-logo.png" alt="Google Login" />
  </button>

  <!-- Dropdown user -->
  <div class="user-menu" id="userMenu">
    <div class="user-name" id="userName"></div>
    <div class="user-email" id="userEmail"></div>
    <button class="logout-btn" id="logoutBtn">Logout</button>
  </div>
</div>

<!-- Popup: Tile Main (Top, Com, Day, Rating) -->
<div id="tilePopup" class="popup hidden">
  <div class="popup-card">
    <button class="popup-close" id="popupCloseBtn">✕</button>

    <!-- Presentation - Top -->
    <div id="mode-top" class="small hidden">
      <div class="popup-image">
        <img id="popupImg" alt="Popup Image" />
      </div>
      <h2 id="popupTitle">Title</h2>
      <p id="popupDesc">Description</p>
    </div>

    <!-- Presentation - Com -->
    <div id="mode-com" class="big space-y hidden">
      <div class="popup-video">
        <div class="video-toggle">
          <button type="button" class="toggle-btn is-active" data-tab="pitch">
            Pitch Deck
          </button>
          <button type="button" class="toggle-btn" data-tab="demo">
            Demo
          </button>
          <button type="button" class="toggle-btn" data-tab="doc">
            Document
          </button>
        </div>

        <div class="com-stage-3">
          <div class="com-loading hidden" id="comLoading">
            <div class="spinner"></div>
            <div class="loading-text">Loading video...</div>
          </div>

          <iframe id="vid-pitch-deck" class="present-com-frame is-active" title="Presentasi" frameborder="0"
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen></iframe>

          <iframe id="vid-demo" class="present-com-frame" title="Demo" frameborder="0" loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen></iframe>

          <iframe id="doc-report" class="present-com-frame" frameborder="0" loading="lazy" title="Doc"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
        </div>

      </div>

      <div class="popup-link">
        <a id="webLink" target="_blank" rel="noopener noreferrer">🌐 Open Website</a>
        <a id="githubLink" target="_blank" rel="noopener noreferrer">
          <img src="<?= BASE_URL ?>/img/github.svg" alt="GitHub" width="24" height="24" />
          Open GitHub
        </a>
      </div>

      <!-- rate -->
      <div style="padding-top: 10px">
        <div id="loginMessage">
          Silakan <button id="loginPopupBtn">Login</button> untuk memberi rating. Email
          yang diterima hanya Mahasiswa Sisfo UNTAN
          (H1101xx10xx@student.untan.ac.id)
        </div>
        <div class="rate-row hidden" id="rateForm">
          <div class="stars" id="stars" aria-label="Rating" role="radiogroup">
            <button type="button" class="star" data-value="1" aria-label="1 star">
              ★
            </button>
            <button type="button" class="star" data-value="2" aria-label="2 stars">
              ★
            </button>
            <button type="button" class="star" data-value="3" aria-label="3 stars">
              ★
            </button>
            <button type="button" class="star" data-value="4" aria-label="4 stars">
              ★
            </button>
            <button type="button" class="star" data-value="5" aria-label="5 stars">
              ★
            </button>
          </div>

          <input type="hidden" id="ratingValue" name="rating" value="0" />

          <button type="button" class="submit-btn" id="submitRating" disabled>
            Submit
          </button>
        </div>
      </div>
    </div>

    <!-- Presentation Day -->
    <div id="mode-presentation" class="big hidden">
      <h2 class="popup-header">Hari Presentasi</h2>
      <div class="iframe-wrap">
        <div class="iframe-loading" id="vidLoading">
          Loading video…
        </div>

        <iframe id="vid-presentation-day" src="https://www.youtube.com/embed/TuHMaFgQXsQ" frameborder="0"
          title="Hari Presentasi"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerpolicy="strict-origin-when-cross-origin" allowfullscreen>
        </iframe>
      </div>
    </div>

    <!-- Rating -->
    <div id="mode-rating" class="hidden">
      <h2 class="popup-header">Rating</h2>
      <div id="rating-container"></div>
    </div>
  </div>
</div>

<!-- Popup: Quiz info -->
<div id="overlay" class="overlay">
  <div class="popup-info" role="dialog" aria-modal="true" aria-labelledby="popupTitle">
    <div class="popup-info-header">
      <div class="title" id="popupTitle">
        <span class="led"></span>
        CODEC / OOP QUIZ
      </div>
      <button class="button-quiz" id="btnMute"><img src="/img/speak.png"></button>
      <button class="button-quiz" id="closePopup">Close</button>
    </div>

    <div class="content">
      <div class="portrait">
        <div id="pixiWrap"></div>
        <div class="note" style="text-align: center">THE ASDOS</div>
      </div>

      <div class="dialog">
        <div class="dialog-text" id="dialogText"></div>
        <div class="actions" id="actions"></div>
      </div>
    </div>
  </div>
</div>

<!-- Image -->
<div class="background-overlay" id="background-overlay"></div>

<div class="gallery-container" id="gallery">
  <div class="images-wrapper">
    <div class="photo-card" onclick="focusPhoto(this)">
      <img class="photo-content" src="<?= BASE_URL ?>/img/happy.jpeg" alt="happy">
      <div class="photo-caption">Happy</div>
    </div>
    <div class="photo-card" onclick="focusPhoto(this)">
      <img class="photo-content" src="<?= BASE_URL ?>/img/angry.jpeg" alt="angry">
      <div class="photo-caption">Angry</div>
    </div>
    <div class="photo-card" onclick="focusPhoto(this)">
      <img class="photo-content" src="<?= BASE_URL ?>/img/stressed.jpeg" alt="stressed">
      <div class="photo-caption">Stressed</div>
    </div>
  </div>

  <div class="text-area">
    <h2>Terimakasih telah berkunjung!</h2>
    <p>Berikut gambar dari para tim. Ekspresi mana yang menurut anda paling jujur?</p>
  </div>
</div>

<button class="close-btn" id="closeBtn" onclick="closeGallery()">×</button>