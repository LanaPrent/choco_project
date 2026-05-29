console.log("Contact form JS loaded");

// ===== Elements =====
const submitBtn = document.getElementById("submitBtn");
const form = document.getElementById("contactForm");
const csrfInput = document.getElementById("csrfToken");
const responseMsg = document.getElementById("responseMsg");
const loadingSpinner = document.getElementById("loadingSpinner");

// Disable submit until CSRF token is loaded
submitBtn.disabled = true;

// ===== Fetch a single CSRF token for all forms =====
async function fetchCsrfToken() {
  try {
    const res = await fetch("/csrf-token", {
      credentials: "same-origin"
    });

    const data = await res.json();

    // Set token for contact form
    csrfInput.value = data.csrfToken;
    submitBtn.disabled = false;

    // Set token for login/register forms
    const loginCsrf = document.getElementById("csrfLogin");
    const registerCsrf = document.getElementById("csrfRegister");

    if (loginCsrf) loginCsrf.value = data.csrfToken;
    if (registerCsrf) registerCsrf.value = data.csrfToken;
  } 
  catch (err) {
    console.error("CSRF fetch failed", err);
    alert("Security error. Please refresh the page.");
  }
}

// Call the function
fetchCsrfToken();

// ===== Submit Contact Form =====
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const data = {
    name: document.getElementById("name").value,
    email: document.getElementById("email").value,
    comments: document.getElementById("comments").value,
    _csrf: csrfInput.value
  };

  loadingSpinner.style.display = "block";

  try {
    const res = await fetch("/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    const result = await res.json();

    loadingSpinner.style.display = "none";

    responseMsg.innerText = result.message;
    responseMsg.style.color = result.success ? "green" : "red";

    form.reset();

    setTimeout(() => {
      responseMsg.innerText = "";
    }, 3000);

  } catch (err) {
    console.error(err);

    loadingSpinner.style.display = "none";

    responseMsg.innerText = "Error sending form";
    responseMsg.style.color = "red";
  }
});
