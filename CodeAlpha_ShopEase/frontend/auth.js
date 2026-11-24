async function sendAuthRequest(path, payload) {
  const response = await fetch(`/api/auth/${path}`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || "Authentication failed.");
  return data;
}
function showFormMessage(message, isError = true) {
  const el = document.getElementById("form-message");
  if (el) {
    el.textContent = message;
    el.className = `form-message ${isError ? "error" : "success"}`;
  }
}
document.getElementById("register-form")?.addEventListener("submit", async event => {
  event.preventDefault();
  const button = event.currentTarget.querySelector("button[type=submit]");
  button.disabled = true;
  try {
    await sendAuthRequest("register", {
      name: document.getElementById("name").value.trim(),
      email: document.getElementById("email").value.trim(),
      password: document.getElementById("password").value
    });
    showFormMessage("Account created! Taking you to the shop…", false);
    setTimeout(() => location.href = "/", 700);
  } catch (error) {
    showFormMessage(error.message);
    button.disabled = false;
  }
});
document.getElementById("login-form")?.addEventListener("submit", async event => {
  event.preventDefault();
  const button = event.currentTarget.querySelector("button[type=submit]");
  button.disabled = true;
  try {
    await sendAuthRequest("login", {
      email: document.getElementById("email").value.trim(),
      password: document.getElementById("password").value
    });
    showFormMessage("Login successful! Welcome back.", false);
    const next = new URLSearchParams(location.search).get("next");
    setTimeout(() => location.href = next === "cart.html" ? "cart.html" : "/", 600);
  } catch (error) {
    showFormMessage(error.message);
    button.disabled = false;
  }
});
