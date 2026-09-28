let links = {
  sih: "https://youtube.com/",
  google: "https://google.com/"
};

async function load() {
  try {
    const r = await fetch("/redirects.json", {cache:"no-store"});
    if (r.ok) links = await r.json();
  } catch {}
  render();
}

function render() {
  const el = document.querySelector("#links");
  el.innerHTML = "";
  for (const [slug,destination] of Object.entries(links)) {
    const row = document.createElement("div");
    row.className = "row";
    row.innerHTML = `
      <input class="slug" value="${escapeHtml(slug)}" placeholder="sih">
      <input class="destination" value="${escapeHtml(destination)}" placeholder="https://youtube.com/">
      <button class="delete" title="Delete">×</button>
    `;
    row.querySelector(".slug").onchange = e => {
      const value = e.target.value.trim().toLowerCase().replace(/^\/+/, "");
      if (!value || value === slug) return;
      links[value] = links[slug];
      delete links[slug];
      render();
    };
    row.querySelector(".destination").oninput = e => {
      links[slug] = e.target.value;
    };
    row.querySelector(".delete").onclick = () => {
      delete links[slug];
      render();
    };
    el.appendChild(row);
  }
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
  }[c]));
}

document.querySelector("#add").onclick = () => {
  let slug = "new-link";
  let n = 2;
  while (links[slug]) slug = `new-link-${n++}`;
  links[slug] = "https://example.com/";
  render();
};

document.querySelector("#download").onclick = () => {
  const blob = new Blob([JSON.stringify(links,null,2)+"\n"], {type:"application/json"});
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "redirects.json";
  a.click();
  URL.revokeObjectURL(a.href);
};

load();