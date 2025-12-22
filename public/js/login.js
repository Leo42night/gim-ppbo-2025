const loginBtn = document.getElementById("googleLoginBtn");
const loginPopupBtn = document.getElementById("loginPopupBtn");
const loginMessage = document.getElementById("loginMessage");
const rateForm = document.getElementById("rateForm");
const loginIcon = document.getElementById("loginIcon");
const userMenu = document.getElementById("userMenu");
const userNameEl = document.getElementById("userName");
const userEmailEl = document.getElementById("userEmail");
const logoutBtn = document.getElementById("logoutBtn");

(() => {
  // cek login dari localStorage
  let isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  let me = {};

  function openCenteredPopup(url, name = "oauth", w = 520, h = 640) {
    const dualScreenLeft = window.screenLeft ?? window.screenX;
    const dualScreenTop = window.screenTop ?? window.screenY;

    const width = window.innerWidth || document.documentElement.clientWidth || screen.width;
    const height = window.innerHeight || document.documentElement.clientHeight || screen.height;

    const left = dualScreenLeft + (width - w) / 2;
    const top = dualScreenTop + (height - h) / 2;

    return window.open(
      url,
      name,
      `scrollbars=yes,width=${w},height=${h},top=${top},left=${left}`
    );
  }

  async function startGoogleLogin() {
    // 1) Minta URL OAuth ke backend
    const res = await fetch(`/auth/popup`, {
      credentials: "include" // WAJIB agar cookie state terset
    });

    if (!res.ok) throw new Error("Failed to get OAuth URL");

    const { authUrl } = await res.json();

    // 2) Buka popup
    const popup = openCenteredPopup(authUrl);
    if (!popup) throw new Error("Popup blocked by browser");

    // 3) Tunggu message dari popup callback
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        cleanup();
        reject(new Error("OAuth timeout"));
      }, 120000);

      const poll = setInterval(() => {
        if (popup.closed) {
          cleanup();
          reject(new Error("Popup closed by user"));
        }
      }, 400);

      function onMessage(event) {
        // A) Pastikan dari origin backend callback (bukan extension)
        if (event.origin !== BASE_URL) return;

        // B) Pastikan message datang dari window popup yang kita buka
        if (event.source !== popup) return;

        // C) Pastikan payload format kita
        let data = event.data;
        if (typeof data === "string") {
          // kalau ada yang ngirim string, coba parse JSON
          try { data = JSON.parse(data); } catch { return; }
        }
        if (!data || data.type !== "oauth_result" || typeof data.ok !== "boolean") return;

        cleanup();
        resolve(data);
      }

      function cleanup() {
        clearTimeout(timeout);
        clearInterval(poll);
        window.removeEventListener("message", onMessage);
      }

      window.addEventListener("message", onMessage);
    });
  }

  async function getme() {
    // sukses -> ambil /me
    const meRes = await fetch(`/api/me`, { credentials: "include" });
    me = await meRes.json();
    console.log("[ME]:", me);

    if (!meRes.ok || me.error) {
      return false;
    }

    loginIcon.src =
      me.picture || "https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png";
    userNameEl.textContent = me.name;
    userEmailEl.textContent = me.email;
    isLoggedIn = true;
    localStorage.setItem("isLoggedIn", "true");
  }

  async function setuplogin(btn) {
    if (isLoggedIn) {
      userMenu.classList.toggle("show");
      return true;
    }

    btn.disabled = true;

    try {
      const result = await startGoogleLogin();

      if (!result.ok) {
        console.error("OAuth failed:", result);
        alert(result.message || ("Login gagal: " + (result.error || "unknown")));
        return false;
      }

      if (!await getme()) return false;
      return true;

    } catch (e) {
      console.error(e);
      alert(e.message || "Terjadi error saat login");
      return false;
    } finally {
      btn.disabled = false;
    }
  }

  function rateLoginState() {
    console.log("rateLoginState", isLoggedIn);
    if (isLoggedIn) {
      loginMessage.classList.add("hidden");
      rateForm.classList.remove("hidden");
    }
  }

  // klik tombol utama
  loginBtn.addEventListener("click", async () => {
    const ok = await setuplogin(loginBtn);
    if (!ok) return;
    // FlashCard.show({ mode: "success", message: "Login berhasil!", duration: 2000 });
  });

  loginPopupBtn.addEventListener("click", async () => {
    const ok = await setuplogin(loginPopupBtn);
    if (!ok) return;
    rateLoginState();
  });

  // logout
  logoutBtn.addEventListener("click", () => {
    fetch("/auth/logout", { credentials: "include" })
      .then(() => {
        isLoggedIn = false;
        localStorage.removeItem("isLoggedIn");
        for(let i = 0; i < 5; i++) localStorage.removeItem(`rating_${i}`);
        loginIcon.src = "https://developers.google.com/identity/images/g-logo.png";
        userMenu.classList.remove("show");
      })
      .catch(err => console.error(err));
  });

  // klik di luar menu -> close
  document.addEventListener("click", (e) => {
    if (!loginBtn.contains(e.target) && !userMenu.contains(e.target)) {
      userMenu.classList.remove("show");
    }
  });

  getme(); // cek apa sudah pernah login
  rateLoginState();

  window.AUTH = {
    isLoggedIn
  }
})();