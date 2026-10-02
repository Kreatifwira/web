const SUPABASE_URL = "https://ogvoredngdrphqqpgchj.supabase.co";
const SUPABASE_KEY = "sb_publishable_5h1PImzxtrWyWBscJBr0vA_y6VCa48I";
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
const $ = (id) => document.getElementById(id);
const urlInput = $("urlInput");
const homeInput = $("homeInput");
const frame = $("browserFrame");
const homeScreen = $("homeScreen");
const loading = $("loading");
const status = $("connectionStatus");
const menuOverlay = $("menuOverlay");

function normalizeUrl(value) {
  value = value.trim();
  if (!value) return null;
  if (/^https?:\/\//i.test(value)) return value;
  if (value.includes(".")) return "https://" + value;
  return "https://www.google.com/search?q=" + encodeURIComponent(value);
}

async function navigate(value) {
  const target = normalizeUrl(value);
  if (!target) return;
  urlInput.value = target;
  homeInput.value = target;
  homeScreen.style.display = "none";
  frame.style.display = "block";
  loading.style.display = "flex";
  status.textContent = "● Memuat...";
  frame.src = target;
  await saveLastUrl(target);
}

urlInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    navigate(urlInput.value);
  }
});

$("searchForm").addEventListener("submit", (event) => {
  event.preventDefault();
  navigate(homeInput.value);
});

$("goBtn").onclick = () => navigate(urlInput.value);
$("clearUrlBtn").onclick = () => {
  urlInput.value = "";
  urlInput.focus();
};

function reloadPage() {
  try {
    frame.contentWindow.location.reload();
  } catch {
    frame.src = urlInput.value;
  }
}

function goBack() {
  try { frame.contentWindow.history.back(); } catch (error) { console.log(error); }
}

function goForward() {
  try { frame.contentWindow.history.forward(); } catch (error) { console.log(error); }
}

function goHome() {
  frame.style.display = "none";
  homeScreen.style.display = "flex";
  status.textContent = "● Siap";
}

$("reloadBtn").onclick = reloadPage;
$("bottomReloadBtn").onclick = reloadPage;
$("backBtn").onclick = goBack;
$("bottomBackBtn").onclick = goBack;
$("bottomForwardBtn").onclick = goForward;
$("homeBtn").onclick = goHome;
$("menuHomeBtn").onclick = () => { goHome(); closeMenu(); };
$("menuReloadBtn").onclick = () => { reloadPage(); closeMenu(); };

frame.addEventListener("load", () => {
  loading.style.display = "none";
  status.textContent = "● Siap";
});

document.querySelectorAll(".shortcut-grid button").forEach((button) => {
  button.onclick = () => navigate(button.dataset.url);
});

function openMenu() { menuOverlay.classList.add("active"); }
function closeMenu() { menuOverlay.classList.remove("active"); }
$("menuBtn").onclick = openMenu;
$("settingsBtn").onclick = openMenu;
$("closeMenuBtn").onclick = closeMenu;
menuOverlay.addEventListener("click", (event) => {
  if (event.target === menuOverlay) closeMenu();
});

$("copyUrlBtn").onclick = async () => {
  try {
    await navigator.clipboard.writeText(urlInput.value);
    alert("Alamat berhasil disalin.");
  } catch {
    alert("Tidak dapat menyalin alamat.");
  }
};

async function getCurrentUser() {
  const { data: { user } } = await supabaseClient.auth.getUser();
  return user;
}

function updateAuthUI(user) {
  const email = $("authEmail");
  const password = $("authPassword");
  const login = $("loginBtn");
  const signup = $("signupBtn");
  const logout = $("logoutBtn");
  if (user) {
    email.style.display = "none";
    password.style.display = "none";
    login.style.display = "none";
    signup.style.display = "none";
    logout.style.display = "block";
    $("authStatus").textContent = `✓ Login: ${user.email}`;
  } else {
    email.style.display = "block";
    password.style.display = "block";
    login.style.display = "block";
    signup.style.display = "block";
    logout.style.display = "none";
    $("authStatus").textContent = "Belum login";
  }
}

async function login() {
  const email = $("authEmail").value.trim();
  const password = $("authPassword").value;
  if (!email || !password) return alert("Masukkan email dan password.");
  const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
  if (error) return alert("Login gagal: " + error.message);
  await load();
  alert("Login berhasil.");
}

async function signup() {
  const email = $("authEmail").value.trim();
  const password = $("authPassword").value;
  if (!email || !password) return alert("Masukkan email dan password.");
  const { data, error } = await supabaseClient.auth.signUp({ email, password, options: { emailRedirectTo: location.origin } });
  if (error) return alert("Pendaftaran gagal: " + error.message);
  if (data.session) {
    await load();
    alert("Akun berhasil dibuat.");
  } else {
    alert("Akun berhasil dibuat. Periksa email untuk verifikasi jika diperlukan.");
  }
}

async function logout() {
  await supabaseClient.auth.signOut();
  await load();
  alert("Anda sudah logout.");
}

$("loginBtn").onclick = login;
$("signupBtn").onclick = signup;
$("logoutBtn").onclick = logout;

async function saveLastUrl(url) {
  const user = await getCurrentUser();
  if (!user) return;
  const { error } = await supabaseClient.from("browser_settings").upsert({
    user_id: user.id,
    last_url: url,
    updated_at: new Date().toISOString()
  }, { onConflict: "user_id" });
  if (error) console.error("Supabase:", error.message);
}

async function load() {
  const user = await getCurrentUser();
  updateAuthUI(user);
  $("storageStatus").textContent = user ? "Terhubung ke Supabase." : "Browser langsung — belum login.";
  if (!user) return;
  const { data, error } = await supabaseClient.from("browser_settings").select("last_url").eq("user_id", user.id).maybeSingle();
  if (!error && data?.last_url) urlInput.value = data.last_url;
}

supabaseClient.auth.onAuthStateChange(() => setTimeout(load, 0));

document.addEventListener("keydown", (event) => {
  if (event.ctrlKey && event.key.toLowerCase() === "l") {
    event.preventDefault();
    urlInput.focus();
    urlInput.select();
  }
  if (event.key === "Escape") closeMenu();
});

load();