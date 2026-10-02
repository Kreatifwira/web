const SUPABASE_URL = "https://ogvoredngdrphqqpgchj.supabase.co";
const SUPABASE_KEY = "sb_publishable_5h1PImzxtrWyWBscJBr0vA_y6VCa48I";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

// Helper
const $ = (id) => document.getElementById(id);

// Browser elements
const urlForm = $("urlForm");
const urlInput = $("urlInput");
const frame = $("browserFrame");
const welcome = $("welcomeScreen");
const loading = $("loading");
const status = $("connectionStatus");

// Proxy panel
const panel = $("proxyPanel");


// ========================================
// URL
// ========================================

function normalizeUrl(url) {
  url = url.trim();

  if (!url) {
    return null;
  }

  // Search
  if (
    !url.includes(".") &&
    !/^https?:\/\//i.test(url)
  ) {
    return (
      "https://www.google.com/search?q=" +
      encodeURIComponent(url)
    );
  }

  // Tambahkan HTTPS jika belum ada
  if (!/^https?:\/\//i.test(url)) {
    url = "https://" + url;
  }

  return url;
}


// ========================================
// BROWSER NAVIGATION
// ========================================

async function navigate(url) {
  const target = normalizeUrl(url);

  if (!target) {
    return;
  }

  urlInput.value = target;

  welcome.style.display = "none";
  frame.style.display = "block";

  loading.style.display = "flex";
  status.textContent = "● Loading...";

  // LANGSUNG ke website.
  // Tidak menggunakan proxy atau Worker.
  frame.src = target;

  await saveBrowserUrl(target);
}


// Address bar
urlForm.addEventListener("submit", (event) => {
  event.preventDefault();

  navigate(urlInput.value);
});


// ========================================
// BROWSER CONTROLS
// ========================================

$("backBtn").onclick = () => {
  try {
    frame.contentWindow.history.back();
  } catch (error) {
    console.log("Back:", error);
  }
};


$("forwardBtn").onclick = () => {
  try {
    frame.contentWindow.history.forward();
  } catch (error) {
    console.log("Forward:", error);
  }
};


$("reloadBtn").onclick = () => {
  try {
    frame.contentWindow.location.reload();
  } catch (error) {
    frame.src = urlInput.value;
  }
};


// Browser loaded
frame.addEventListener("load", () => {
  loading.style.display = "none";
  status.textContent = "● Ready";
});


// ========================================
// QUICK LINKS
// ========================================

document
  .querySelectorAll(".quick-links button")
  .forEach((button) => {

    button.addEventListener("click", () => {
      const url = button.dataset.url;

      if (url) {
        navigate(url);
      }
    });

  });


// ========================================
// PANEL
// ========================================

if ($("openProxyBtn")) {
  $("openProxyBtn").onclick = () => {
    panel.classList.add("active");
  };
}


if ($("settingsBtn")) {
  $("settingsBtn").onclick = () => {
    panel.classList.add("active");
  };
}


if ($("closePanelBtn")) {
  $("closePanelBtn").onclick = () => {
    panel.classList.remove("active");
  };
}


// ========================================
// PROXY DISABLED
// ========================================

function setDirectBrowserMode() {

  if ($("proxyStatus")) {
    $("proxyStatus").textContent =
      "Browser langsung";
  }

  if ($("proxyStatusText")) {
    $("proxyStatusText").textContent =
      "Proxy dinonaktifkan untuk pengujian.";
  }

  if ($("statusDot")) {
    $("statusDot").classList.remove("active");
  }

  if ($("publicIp")) {
    $("publicIp").textContent = "-";
  }

}


// Nonaktifkan Cloudflare Proxy toggle
if ($("cloudProxyToggle")) {

  $("cloudProxyToggle").checked = false;

  $("cloudProxyToggle").disabled = true;

}


// ========================================
// SUPABASE AUTH
// ========================================

async function currentUser() {

  const {
    data: { user }
  } = await supabaseClient.auth.getUser();

  return user;
}


function setAuthUI(user) {

  const email = $("authEmail");
  const password = $("authPassword");
  const login = $("loginBtn");
  const signup = $("signupBtn");
  const logout = $("logoutBtn");

  if (user) {

    if (email) {
      email.style.display = "none";
    }

    if (password) {
      password.style.display = "none";
    }

    if (login) {
      login.style.display = "none";
    }

    if (signup) {
      signup.style.display = "none";
    }

    if (logout) {
      logout.style.display = "block";
    }

    if ($("authStatus")) {
      $("authStatus").textContent =
        `✓ Login: ${user.email}`;
    }

  } else {

    if (email) {
      email.style.display = "block";
    }

    if (password) {
      password.style.display = "block";
    }

    if (login) {
      login.style.display = "block";
    }

    if (signup) {
      signup.style.display = "block";
    }

    if (logout) {
      logout.style.display = "none";
    }

    if ($("authStatus")) {
      $("authStatus").textContent =
        "Belum login";
    }

  }

}


async function refreshAuth() {

  const user = await currentUser();

  setAuthUI(user);

  if ($("storageStatus")) {

    $("storageStatus").textContent = user
      ? "Terhubung ke Supabase."
      : "Browser langsung — login Supabase untuk menyimpan URL.";

  }

  return user;
}


// Login
async function login() {

  const email = $("authEmail").value.trim();
  const password = $("authPassword").value;

  if (!email || !password) {

    alert("Masukkan email dan password.");

    return;
  }

  const {
    error
  } = await supabaseClient.auth.signInWithPassword({
    email,
    password
  });

  if (error) {

    alert("Login gagal: " + error.message);

    return;
  }

  await load();

  panel.classList.add("active");

  alert("Login berhasil.");

}


// Signup
async function signup() {

  const email = $("authEmail").value.trim();
  const password = $("authPassword").value;

  if (!email || !password) {

    alert("Masukkan email dan password.");

    return;
  }

  const {
    data,
    error
  } = await supabaseClient.auth.signUp({

    email,
    password,

    options: {
      emailRedirectTo: location.origin
    }

  });

  if (error) {

    alert(
      "Pendaftaran gagal: " +
      error.message
    );

    return;
  }

  if (data.session) {

    await load();

    alert(
      "Akun berhasil dibuat dan login."
    );

  } else {

    alert(
      "Akun berhasil dibuat. " +
      "Periksa email untuk verifikasi jika diperlukan."
    );

  }

}


// Logout
async function logout() {

  await supabaseClient.auth.signOut();

  await refreshAuth();

  alert("Sudah logout.");

}


if ($("loginBtn")) {
  $("loginBtn").onclick = login;
}

if ($("signupBtn")) {
  $("signupBtn").onclick = signup;
}

if ($("logoutBtn")) {
  $("logoutBtn").onclick = logout;
}


// ========================================
// SAVE LAST URL TO SUPABASE
// ========================================

async function saveBrowserUrl(url) {

  const user = await currentUser();

  if (!user) {
    return;
  }

  const {
    error
  } = await supabaseClient
    .from("browser_settings")
    .upsert(

      {
        user_id: user.id,
        last_url: url,
        updated_at: new Date().toISOString()
      },

      {
        onConflict: "user_id"
      }

    );

  if (error) {

    console.error(
      "Gagal menyimpan URL:",
      error.message
    );

  }

}


// ========================================
// LOAD
// ========================================

async function load() {

  setDirectBrowserMode();

  const user = await refreshAuth();

  if (!user) {
    return;
  }

  const {
    data,
    error
  } = await supabaseClient
    .from("browser_settings")
    .select("last_url")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {

    console.error(
      "Gagal membaca browser_settings:",
      error.message
    );

    return;
  }

  if (data?.last_url) {

    urlInput.value = data.last_url;

  }

}


// ========================================
// DISABLE PROXY BUTTONS
// ========================================

if ($("testProxyBtn")) {

  $("testProxyBtn").onclick = () => {

    if ($("publicIp")) {
      $("publicIp").textContent = "-";
    }

    alert(
      "Proxy dinonaktifkan. " +
      "Browser sedang menggunakan koneksi langsung."
    );

  };

}


if ($("saveProxyBtn")) {

  $("saveProxyBtn").onclick = () => {

    alert(
      "Pengaturan proxy sementara dinonaktifkan " +
      "untuk pengujian browser langsung."
    );

  };

}


if ($("clearProxyBtn")) {

  $("clearProxyBtn").onclick = () => {

    if ($("publicIp")) {
      $("publicIp").textContent = "-";
    }

    setDirectBrowserMode();

    if ($("storageStatus")) {

      $("storageStatus").textContent =
        "Proxy dinonaktifkan. Browser menggunakan koneksi langsung.";

    }

  };

}


// ========================================
// KEYBOARD SHORTCUTS
// ========================================

document.addEventListener(
  "keydown",
  (event) => {

    // Ctrl + L
    if (
      event.ctrlKey &&
      event.key.toLowerCase() === "l"
    ) {

      event.preventDefault();

      urlInput.focus();
      urlInput.select();

    }

    // Escape
    if (event.key === "Escape") {

      panel.classList.remove("active");

    }

  }
);


// ========================================
// SUPABASE AUTH STATE
// ========================================

supabaseClient.auth.onAuthStateChange(() => {

  setTimeout(() => {
    load();
  }, 0);

});


// ========================================
// START APPLICATION
// ========================================

load();
