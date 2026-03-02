const API = "http://localhost:3001";

async function register() {
  const username = document.getElementById("regUsername").value;
  const password = document.getElementById("regPassword").value;

  const res = await fetch(`${API}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  });

  const data = await res.json();
  alert(JSON.stringify(data));
}

async function login() {
  const username = document.getElementById("loginUsername").value;
  const password = document.getElementById("loginPassword").value;

  const res = await fetch(`${API}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  });

  const data = await res.json();

  if (data.token) {
    localStorage.setItem("token", data.token);
    const tokenBox = document.getElementById("tokenDisplay");
    tokenBox.textContent = data.token;
    tokenBox.classList.remove("empty");
    const footerUser = document.getElementById("footerUser");
    footerUser.textContent = data.username || "(from token)";
  } else {
    alert(JSON.stringify(data));
  }
}

async function getProfile() {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API}/me`, {
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });

  const data = await res.json();
  const profileBox = document.getElementById("profileDisplay");
  profileBox.textContent = JSON.stringify(data, null, 2);
  profileBox.classList.remove("empty");
}