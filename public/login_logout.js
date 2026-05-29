console.log("login_logout.js loaded");

// ===== Elements =====
const loginModal = document.getElementById("loginModal");
const registerModal = document.getElementById("registerModal");
const loginBtn = document.getElementById("loginBtn");
const registerBtn = document.getElementById("registerBtn");
const logoutBtn = document.getElementById("logoutBtn");
const closeLogin = document.getElementById("closeLogin");
const closeRegister = document.getElementById("closeRegister");

const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const loginMsg = document.getElementById("loginMsg");
const registerMsg = document.getElementById("registerMsg");

// Add hidden CSRF inputs to the forms (if not already in HTML)
let loginCsrfInput = document.getElementById("csrfLogin");
let registerCsrfInput = document.getElementById("csrfRegister");
if(!loginCsrfInput) {
  loginCsrfInput = document.createElement("input");
  loginCsrfInput.type = "hidden";
  loginCsrfInput.id = "csrfLogin";
  loginCsrfInput.name = "_csrf";
  loginForm.appendChild(loginCsrfInput);
}
if(!registerCsrfInput) {
  registerCsrfInput = document.createElement("input");
  registerCsrfInput.type = "hidden";
  registerCsrfInput.id = "csrfRegister";
  registerCsrfInput.name = "_csrf";
  registerForm.appendChild(registerCsrfInput);
}

// ===== Modal open/close =====
loginBtn.addEventListener("click", () => {
  loginModal.style.display = "block";
  loginForm.querySelector("input").focus();
});
registerBtn.addEventListener("click", () => {
  registerModal.style.display = "block";
  registerForm.querySelector("input").focus();
});
closeLogin.addEventListener("click", () => loginModal.style.display = "none");
closeRegister.addEventListener("click", () => registerModal.style.display = "none");
window.addEventListener("click", e => {
  if (e.target === loginModal) loginModal.style.display = "none";
  if (e.target === registerModal) registerModal.style.display = "none";
});

// ===== Update Navbar =====
async function updateAuthButtons() {
  try {
    const res = await fetch("/api/status");
    const data = await res.json();
    if (data.loggedIn) {
      loginBtn.style.display = "none";
      registerBtn.style.display = "none";
      logoutBtn.style.display = "inline-block";
    } else {
      loginBtn.style.display = "inline-block";
      registerBtn.style.display = "inline-block";
      logoutBtn.style.display = "none";
    }
  } catch (err) {
    console.error("Error updating auth buttons:", err);
  }
}
updateAuthButtons();

// ===== Logout =====
logoutBtn.addEventListener("click", async e => {
  e.preventDefault();
  try {
    const res = await fetch("/api/logout", { 
      method: "POST", 
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin"  // <-- ADD THIS
    });
    if (res.ok) {
      updateAuthButtons();
      alert("✅ Logged out successfully");
    }
  } catch (err) {
    console.error(err);
    alert("❌ Logout failed");
  }
});

// ===== Login =====
loginForm.addEventListener("submit", async e => {
  e.preventDefault();
  loginMsg.innerText = "";

  const data = {
    email: document.getElementById("loginEmail").value,
    password: document.getElementById("loginPassword").value,
    _csrf: loginCsrfInput.value
  };

  try {
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      credentials: "same-origin"  // <-- ADD THIS
    });
    const result = await res.json();
    loginMsg.innerText = result.message;
    loginMsg.style.color = result.success ? "green" : "red";

    if (result.success) {
      setTimeout(() => {
        loginModal.style.display = "none";
        updateAuthButtons();
        loginForm.reset();
        loginMsg.innerText = "";
      }, 2000);
    }
  } catch (err) {
    console.error(err);
    loginMsg.innerText = "Login failed";
    loginMsg.style.color = "red";
  }
});

// ===== Register =====
registerForm.addEventListener("submit", async e => {
  console.log("REGISTER SUBMIT FIRED");
  e.preventDefault();
  registerMsg.innerText = "";

  const data = {
    username: document.getElementById("regUsername").value,
    email: document.getElementById("regEmail").value,
    password: document.getElementById("regPassword").value,
    _csrf: registerCsrfInput.value
  };

  try {
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      credentials: "same-origin"  // <-- ADD THIS
    });
    const result = await res.json();
    registerMsg.innerText = result.message;
    registerMsg.style.color = result.success ? "green" : "red";

    if (result.success) {
      setTimeout(() => {
        registerModal.style.display = "none";
        updateAuthButtons();
        registerForm.reset();
        registerMsg.innerText = "";
      }, 2000);
    }
  } catch (err) {
    console.error(err);
    registerMsg.innerText = "Registration failed";
    registerMsg.style.color = "red";
  }
});