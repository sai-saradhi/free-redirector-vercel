const $ = (s) => document.querySelector(s);
const loginView = $("#loginView");
const appView = $("#appView");
const linksEl = $("#links");
const countText = $("#countText");

function showToast(message) {
  const t = $("#toast");
  t.textContent = message;
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 1800);
}

async function api(url, options = {}) {
  const opts = { ...options, headers: { "Content-Type": "application/json", ...(options.headers || {}) } };
  const res = await fetch(url, opts);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}

function showApp() {
  loginView.classList.add("hidden");
  appView.classList.remove("hidden");
  loadLinks();
}

async function checkAuth() {
  try {
    const data = await api("/api/login");
    if (data.authenticated) showApp();
  } catch {}
}

$("#loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  $("#loginError").textContent = "";
  try {
    await api("/api/login", {
      method: "POST",
      body: JSON.stringify({ password: $("#password").value })
    });
    $("#password").value = "";
    showApp();
  } catch (err) {
    $("#loginError").textContent = err.message;
  }
});

$("#logoutBtn").addEventListener("click", async () => {
  await api("/api/logout", { method: "POST" });
  appView.classList.add("hidden");
  loginView.classList.remove("hidden");
});

$("#refreshBtn").addEventListener("click", loadLinks);

$("#createForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  $("#createError").textContent = "";
  try {
    await api("/api/links", {
      method: "POST",
      body: JSON.stringify({
        slug: $("#slug").value,
        destination: $("#destination").value
      })
    });
    $("#slug").value = "";
    $("#destination").value = "";
    showToast("Link created");
    loadLinks();
  } catch (err) {
    $("#createError").textContent = err.message;
  }
});

function publicBase() {
  return window.location.origin;
}

function row(link) {
  const url = `${publicBase()}/${encodeURIComponent(link.slug)}`;
  const safeDest = link.destination.replace(/"/g, "&quot;");
  return `
    <article class="link-row" data-id="${link.id}">
      <div>
        <div class="link-url">${url}</div>
        <div class="meta">
          <span class="badge ${link.enabled ? "on" : ""}">${link.enabled ? "Active" : "Disabled"}</span>
          <span class="badge">${link.clicks || 0} clicks</span>
        </div>
      </div>
      <div class="destination">${safeDest}</div>
      <div class="actions">
        <button class="ghost copy" data-url="${url}">Copy</button>
        <button class="ghost edit" data-id="${link.id}" data-destination="${safeDest}">Edit</button>
        <button class="ghost toggle" data-id="${link.id}" data-enabled="${link.enabled}">${link.enabled ? "Disable" : "Enable"}</button>
        <button class="danger delete" data-id="${link.id}">Delete</button>
      </div>
    </article>
  `;
}

async function loadLinks() {
  try {
    const links = await api("/api/links");
    countText.textContent = `${links.length} link${links.length === 1 ? "" : "s"}`;
    linksEl.innerHTML = links.length
      ? links.map(row).join("")
      : `<div class="empty">No links yet. Create your first redirect above.</div>`;
  } catch (err) {
    if (err.message === "Unauthorized") {
      appView.classList.add("hidden");
      loginView.classList.remove("hidden");
    } else {
      linksEl.innerHTML = `<div class="empty">${err.message}</div>`;
    }
  }
}

linksEl.addEventListener("click", async (e) => {
  const button = e.target.closest("button");
  if (!button) return;

  try {
    if (button.classList.contains("copy")) {
      await navigator.clipboard.writeText(button.dataset.url);
      showToast("Copied");
      return;
    }

    if (button.classList.contains("edit")) {
      const destination = prompt("New destination URL:", button.dataset.destination);
      if (destination === null) return;
      await api(`/api/links/${button.dataset.id}`, {
        method: "PATCH",
        body: JSON.stringify({ destination })
      });
      showToast("Destination updated");
      loadLinks();
      return;
    }

    if (button.classList.contains("toggle")) {
      await api(`/api/links/${button.dataset.id}`, {
        method: "PATCH",
        body: JSON.stringify({ enabled: button.dataset.enabled !== "true" })
      });
      showToast("Link updated");
      loadLinks();
      return;
    }

    if (button.classList.contains("delete")) {
      if (!confirm("Delete this redirect link?")) return;
      await api(`/api/links/${button.dataset.id}`, { method: "DELETE" });
      showToast("Link deleted");
      loadLinks();
    }
  } catch (err) {
    alert(err.message);
  }
});

checkAuth();
