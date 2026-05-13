let visitorLang = localStorage.getItem("hikma-lang") || "fr";

function visitorRoute() {
  const hash = location.hash.replace("#", "") || "home";
  document.querySelectorAll("[data-route]").forEach(el => {
    el.classList.toggle("hidden", el.dataset.route !== hash);
  });
}

async function renderVisitorSettings() {
  const s = Hikma.settings();
  const price = document.getElementById("bookPrice");
  if (price) price.textContent = `${s.price} ${s.currency}`;

  const preface = document.getElementById("prefaceText");
  if (preface) preface.textContent = visitorLang === "ar" ? s.prefaceAr : s.prefaceFr;

  const cover = document.getElementById("bookCover");
  if (cover) {
    const file = await Hikma.getFile("cover");
    if (file) cover.src = URL.createObjectURL(file);
  }
}

function renderTrack(order) {
  const target = document.getElementById("trackResult");
  if (!target) return;
  if (!order) {
    target.innerHTML = `<div class="panel result-card"><strong>Commande introuvable</strong><p class="muted">Vérifiez le numéro WhatsApp utilisé pendant la commande.</p></div>`;
    return;
  }
  target.innerHTML = `
    <div class="panel result-card">
      <h2>${Hikma.escapeHtml(order.name)}</h2>
      <p><strong>ID:</strong> ${order.id}</p>
      <p><strong>WhatsApp:</strong> ${Hikma.shortPhone(order.phone)}</p>
      <p><strong>Version:</strong> ${Hikma.versionLabel(order.version)}</p>
      <p><strong>Statut:</strong> <span class="status ${order.status}">${order.status === "validated" ? "Paiement validé" : "En attente de validation"}</span></p>
      <p><strong>Paiement:</strong> ${order.payment} - ${order.price} MRU</p>
      ${order.status === "validated" ? downloadButtons(order) : `<p class="muted">Le téléchargement sera activé après validation du paiement par l'administrateur. Vous recevrez aussi une confirmation WhatsApp.</p>`}
    </div>
  `;
}

function downloadButtons(order) {
  return Hikma.versionsFor(order)
    .map(version => `<button class="primary download" data-download="${order.id}" data-version="${version}">Télécharger PDF ${version.toUpperCase()}</button>`)
    .join(" ");
}

function bindVisitor() {
  document.getElementById("languageToggle")?.addEventListener("click", () => {
    visitorLang = visitorLang === "fr" ? "ar" : "fr";
    Hikma.applyLanguage(visitorLang);
    renderVisitorSettings();
  });

  document.querySelectorAll("[data-view]").forEach(btn => {
    btn.addEventListener("click", event => {
      location.hash = event.currentTarget.dataset.view;
    });
  });

  document.getElementById("openOrder")?.addEventListener("click", () => {
    document.getElementById("orderDialog").showModal();
  });

  document.querySelectorAll(".close").forEach(btn => {
    btn.addEventListener("click", event => event.target.closest("dialog").close());
  });

  document.getElementById("orderForm")?.addEventListener("submit", async event => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    const capture = await Hikma.fileToDataUrl(form.capture.files[0]);
    const s = Hikma.settings();
    const order = {
      id: `BH-${Date.now().toString().slice(-6)}`,
      date: new Date().toISOString(),
      name: data.name,
      phone: Hikma.normalizePhone(data.phone),
      version: data.version,
      payment: data.payment,
      dedication: data.dedication,
      capture,
      status: "pending",
      archived: false,
      price: Number(s.price) || 200
    };
    Hikma.saveOrders([order, ...Hikma.loadOrders()]);
    form.reset();
    document.getElementById("orderDialog").close();
    location.hash = "track";
    document.getElementById("trackInput").value = Hikma.shortPhone(order.phone);
    renderTrack(order);
  });

  document.getElementById("trackForm")?.addEventListener("submit", event => {
    event.preventDefault();
    const q = Hikma.normalizePhone(document.getElementById("trackInput").value);
    const order = Hikma.loadOrders().find(item => item.phone === q && !item.archived);
    renderTrack(order);
  });

  document.addEventListener("click", async event => {
    const downloadButton = event.target.closest("[data-download]");
    if (!downloadButton) return;
    const order = Hikma.loadOrders().find(item => item.id === downloadButton.dataset.download);
    if (order && order.status === "validated") {
      await Hikma.downloadBook(order, downloadButton.dataset.version || "fr", "");
    }
  });
}

bindVisitor();
Hikma.applyLanguage(visitorLang);
renderVisitorSettings();
visitorRoute();
window.addEventListener("hashchange", visitorRoute);
