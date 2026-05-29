console.log("auth.js loaded");

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

const loginCsrfInput =
    document.getElementById("csrfLogin");

const registerCsrfInput =
    document.getElementById("csrfRegister");

// ===== Load CSRF =====

async function loadCsrfToken() {

    try {

        const data = await apiFetch("/csrf-token");

        loginCsrfInput.value = data.csrfToken;

        registerCsrfInput.value = data.csrfToken;

    } catch (err) {

        console.error("CSRF load failed:", err);
    }
}

loadCsrfToken();

// ===== Modal logic =====

loginBtn.addEventListener("click", () => {

    loginModal.style.display = "block";

    document.getElementById("loginEmail").focus();
});

registerBtn.addEventListener("click", () => {

    registerModal.style.display = "block";

    document.getElementById("regUsername").focus();
});

closeLogin.addEventListener("click", () => {

    loginModal.style.display = "none";
});

closeRegister.addEventListener("click", () => {

    registerModal.style.display = "none";
});

window.addEventListener("click", (e) => {

    if (e.target === loginModal) {

        loginModal.style.display = "none";
    }

    if (e.target === registerModal) {

        registerModal.style.display = "none";
    }
});

// ===== Navbar auth state =====

async function updateAuthButtons() {

    try {

        const data = await apiFetch("/api/status");

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

        console.error(err);
    }
}

updateAuthButtons();

// ===== Login =====

loginForm.addEventListener("submit", async (e) => {

    e.preventDefault();

    loginMsg.innerText = "";

    const data = {

        email:
            document.getElementById("loginEmail").value,

        password:
            document.getElementById("loginPassword").value,

        _csrf: loginCsrfInput.value
    };

    try {

        const result = await apiFetch("/api/login", {

            method: "POST",

            body: JSON.stringify(data)
        });

        loginMsg.innerText = result.message;

        loginMsg.style.color =
            result.success ? "green" : "red";

        if (result.success) {

            updateAuthButtons();

            setTimeout(() => {

                loginModal.style.display = "none";

                loginForm.reset();

                loginMsg.innerText = "";

            }, 1500);
        }

    } catch (err) {

        console.error(err);

        loginMsg.innerText = err.message;

        loginMsg.style.color = "red";
    }
});

// ===== Register =====

registerForm.addEventListener("submit", async (e) => {

    e.preventDefault();

    registerMsg.innerText = "";

    const data = {

        username:
            document.getElementById("regUsername").value,

        email:
            document.getElementById("regEmail").value,

        password:
            document.getElementById("regPassword").value,

        _csrf: registerCsrfInput.value
    };

    try {

        const result = await apiFetch("/api/register", {

            method: "POST",

            body: JSON.stringify(data)
        });

        registerMsg.innerText = result.message;

        registerMsg.style.color =
            result.success ? "green" : "red";

        if (result.success) {

            setTimeout(() => {

                registerModal.style.display = "none";

                registerForm.reset();

                registerMsg.innerText = "";

            }, 1500);
        }

    } catch (err) {

        console.error(err);

        registerMsg.innerText = err.message;

        registerMsg.style.color = "red";
    }
});

// ===== Logout =====

logoutBtn.addEventListener("click", async (e) => {

    e.preventDefault();

    try {

        await apiFetch("/api/logout", {

            method: "POST"
        });

        updateAuthButtons();

        alert("Logged out");

    } catch (err) {

        console.error(err);

        alert("Logout failed");
    }
});
