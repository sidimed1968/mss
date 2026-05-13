let adminLang = localStorage.getItem("hikma-lang") || "fr";
let adminTab = "orders";
let archiveMode = "active";
const adminAssetPrefix = location.pathname.includes("/admin/admin125/") ? "../../" : "";

function filteredOrders() {
  let orders = Hikma.loadOrders();
  const q = document.getElementById("adminSearch")?.value.trim().toLowerCase() || "";
  const status = document.getElementById("statusFilter")?.value || "";
  const payment = document.getElementById("paymentFilter")?.value || "";
  const sort = document.getElementById("sortFilter")?.value || "dateDesc";
  orders = orders.filter(order => archiveMode === "archived" ? order.archived : !order.archived);
  if (q) {
    orders = orders.filter(order => [order.id, order.name, order.phone, Hikma.versionLabel(order.version), order.dedication].join(" ").toLowerCase().includes(q));
  }
  if (status) orders = orders.filter(order => order.status === status);
  if (payment) orders = orders.filter(order => order.payment === payment);
  orders.sort((a, b) => {
    if (sort === "dateAsc") return new Date(a.date) - new Date(b.date);
    if (sort === "nameAsc") return a.name.localeCompare(b.name);
    return new Date(b.date) - new Date(a.date);
  });
  return orders;
}

function renderAdmin() {
  document.querySelectorAll(".admin-tab").forEach(el => el.classList.add("hidden"));
  document.getElementById(`tab-${adminTab}`)?.classList.remove("hidden");
  document.querySelectorAll("[data-admin-tab]").forEach(btn => btn.classList.toggle("active", btn.dataset.adminTab === adminTab));
  renderOrders();
  renderAccounting();
  renderSettings();
  renderArchives();
  renderWhatsapp();
}

function renderOrders() {
  const table = document.getElementById("ordersTable");
  if (!table) return;
  const all = Hikma.loadOrders();
  const orders = filteredOrders();
  const active = all.filter(order => !order.archived);
  const pending = active.filter(order => order.status === "pending").length;
  const valid = active.filter(order => order.status === "validated").length;
  document.getElementById("ordersCount").textContent = `${active.length} commandes au total`;
  document.getElementById("pendingBadge").textContent = `◴ ${pending} attente`;
  document.getElementById("validBadge").textContent = `☑ ${valid} validées`;
  document.querySelectorAll("[data-filter-archive]").forEach(btn => btn.classList.toggle("active", btn.dataset.filterArchive === archiveMode));
  table.innerHTML = orders.map(order => `
    <tr>
      <td>${Hikma.formatDate(order.date)}</td>
      <td class="client">${Hikma.escapeHtml(order.name)}</td>
      <td>${Hikma.shortPhone(order.phone)}</td>
      <td>${Hikma.versionLabel(order.version)}</td>
      <td>${Hikma.paymentIcon(order.payment)} ${order.payment}</td>
      <td>${order.capture ? `<img class="capture-thumb" alt="Capture" src="${order.capture}">` : "<span class='muted'>-</span>"}</td>
      <td>${order.dedication ? Hikma.escapeHtml(order.dedication) : "<span class='muted'>-</span>"}</td>
      <td><span class="status ${order.status}">${order.status === "validated" ? "☑ Validé" : "◴ En attente"}</span></td>
      <td><div class="action-row">
        <button class="icon-btn" title="Voir" data-action="view" data-id="${order.id}">👁</button>
        <button class="icon-btn whatsapp" title="WhatsApp" data-action="whatsapp" data-id="${order.id}">☏</button>
        <button class="icon-btn" title="${order.archived ? "Restaurer" : "Archiver"}" data-action="archive" data-id="${order.id}">▤</button>
        ${order.status === "pending" ? `<button class="icon-btn ok-action" title="Valider et envoyer WhatsApp" data-action="validate" data-id="${order.id}">✓</button>` : ""}
        <button class="icon-btn danger" title="Supprimer" data-action="delete" data-id="${order.id}">×</button>
      </div></td>
    </tr>
  `).join("") || `<tr><td colspan="9" class="muted">Aucune commande</td></tr>`;
}

function renderAccounting() {
  const target = document.getElementById("tab-accounting");
  if (!target) return;
  const orders = Hikma.loadOrders();
  const valid = orders.filter(order => order.status === "validated" && !order.archived);
  const pending = orders.filter(order => order.status === "pending" && !order.archived);
  const byPayment = orders.reduce((acc, order) => {
    if (order.status === "validated" && !order.archived) acc[order.payment] = (acc[order.payment] || 0) + order.price;
    return acc;
  }, {});
  target.innerHTML = `
    <div class="section-title"><div><h2>Comptabilité</h2><p>Recettes et paiements validés</p></div></div>
    <div class="stats-grid">
      <article class="panel stat"><span>Chiffre d'affaires</span><b>${valid.reduce((sum, o) => sum + o.price, 0)} MRU</b></article>
      <article class="panel stat"><span>Commandes validées</span><b>${valid.length}</b></article>
      <article class="panel stat"><span>En attente</span><b>${pending.length}</b></article>
      <article class="panel stat"><span>Prix unitaire</span><b>${Hikma.settings().price} MRU</b></article>
    </div>
    <div class="table-wrap" style="margin-top:20px"><table><thead><tr><th>Paiement</th><th>Total</th></tr></thead><tbody>${Object.entries(byPayment).map(([name,total]) => `<tr><td>${Hikma.paymentIcon(name)} ${name}</td><td>${total} MRU</td></tr>`).join("") || "<tr><td colspan='2' class='muted'>Aucun paiement validé</td></tr>"}</tbody></table></div>
  `;
}

function renderSettings() {
  const target = document.getElementById("tab-settings");
  if (!target) return;
  const s = Hikma.settings();
  target.innerHTML = `
    <div class="section-title"><div><h2>Paramètres</h2><p>PDF du livre, couverture, préfaces et paiements</p></div></div>
    <form id="settingsForm" class="settings-form">
      <div class="settings-grid">
        <label class="panel">Nom du bureau<input name="businessName" value="${Hikma.escapeAttr(s.businessName)}" /></label>
        <label class="panel">Prix<input name="price" type="number" min="0" value="${s.price}" /></label>
        <label class="panel">Devise<input name="currency" value="${Hikma.escapeAttr(s.currency)}" /></label>
        <label class="panel">WhatsApp admin<input name="whatsapp" value="${Hikma.escapeAttr(s.whatsapp)}" /></label>
        <label class="panel">Bankily<input name="bankily" value="${Hikma.escapeAttr(s.bankily)}" /></label>
        <label class="panel">Masrivi<input name="masrivi" value="${Hikma.escapeAttr(s.masrivi)}" /></label>
        <label class="panel">Sedad<input name="sedad" value="${Hikma.escapeAttr(s.sedad)}" /></label>
        <label class="panel">Titre PDF français<input name="pdfTitleFr" value="${Hikma.escapeAttr(s.pdfTitleFr)}" /></label>
        <label class="panel">Titre PDF arabe<input name="pdfTitleAr" value="${Hikma.escapeAttr(s.pdfTitleAr)}" /></label>
      </div>
      <div class="settings-grid media-settings">
        <label class="panel">Livre PDF français
          <input name="pdfFr" type="file" accept="application/pdf" />
          <span class="muted">${s.fileNames.pdfFr || "Aucun PDF chargé"}</span>
        </label>
        <label class="panel">Livre PDF arabe
          <input name="pdfAr" type="file" accept="application/pdf" />
          <span class="muted">${s.fileNames.pdfAr || "Aucun PDF chargé"}</span>
        </label>
        <label class="panel">Couverture du livre
          <input name="cover" type="file" accept="image/*" />
          <span class="muted">${s.fileNames.cover || "Couverture par défaut"}</span>
        </label>
      </div>
      <div class="settings-grid">
        <label class="panel wide">Préface française
          <textarea name="prefaceFr" rows="9">${Hikma.escapeHtml(s.prefaceFr)}</textarea>
          <input name="prefaceFrFile" type="file" accept=".txt,text/plain" />
        </label>
        <label class="panel wide">المقدمة العربية
          <textarea name="prefaceAr" rows="9" dir="rtl">${Hikma.escapeHtml(s.prefaceAr)}</textarea>
          <input name="prefaceArFile" type="file" accept=".txt,text/plain" />
        </label>
      </div>
      <div class="settings-actions">
        <button class="primary" type="submit">Enregistrer les paramètres</button>
        <button class="primary muted-btn" type="button" data-download-admin-file="pdfFr">Télécharger PDF FR</button>
        <button class="primary muted-btn" type="button" data-download-admin-file="pdfAr">Télécharger PDF AR</button>
        <button class="primary muted-btn" type="button" data-download-admin-file="cover">Télécharger couverture</button>
      </div>
    </form>
  `;
}

function renderArchives() {
  const target = document.getElementById("tab-archives");
  if (!target) return;
  const archived = Hikma.loadOrders().filter(order => order.archived);
  target.innerHTML = `
    <div class="section-title"><div><h2>Archivage</h2><p>${archived.length} commande(s) archivée(s)</p></div></div>
    <div class="table-wrap"><table><thead><tr><th>Date</th><th>Client</th><th>WhatsApp</th><th>Version</th><th>Action</th></tr></thead><tbody>${archived.map(order => `<tr><td>${Hikma.formatDate(order.date)}</td><td>${Hikma.escapeHtml(order.name)}</td><td>${Hikma.shortPhone(order.phone)}</td><td>${Hikma.versionLabel(order.version)}</td><td><button class="primary" data-action="archive" data-id="${order.id}">Restaurer</button></td></tr>`).join("") || `<tr><td colspan="5" class="muted">Aucune archive</td></tr>`}</tbody></table></div>
  `;
}

function renderWhatsapp() {
  const target = document.getElementById("tab-whatsapp");
  if (!target) return;
  const orders = Hikma.loadOrders().filter(order => !order.archived);
  target.innerHTML = `
    <div class="section-title"><div><h2>WhatsApp</h2><p>Messages rapides pour les clients</p></div></div>
    <div class="whatsapp-list">${orders.map(order => `<article class="panel whatsapp-item"><div><strong>${Hikma.escapeHtml(order.name)}</strong><br><span class="muted">${Hikma.shortPhone(order.phone)} - ${order.status === "validated" ? "PDF disponible" : "Paiement en vérification"} - ${Hikma.versionLabel(order.version)}</span></div><button class="primary" data-action="whatsapp" data-id="${order.id}">Ouvrir WhatsApp</button></article>`).join("")}</div>
  `;
}

function viewOrder(id) {
  const order = Hikma.loadOrders().find(item => item.id === id);
  const content = document.getElementById("detailContent");
  if (!order || !content) return;
  content.innerHTML = `
    <h2>${Hikma.escapeHtml(order.name)}</h2>
    <p><strong>ID:</strong> ${order.id}</p>
    <p><strong>WhatsApp:</strong> ${Hikma.shortPhone(order.phone)}</p>
    <p><strong>Version:</strong> ${Hikma.versionLabel(order.version)}</p>
    <p><strong>Paiement:</strong> ${order.payment} - ${order.price} MRU</p>
    <p><strong>Dédicace:</strong> ${order.dedication || "-"}</p>
    <p><strong>Statut:</strong> ${order.status === "validated" ? "Validé" : "En attente"}</p>
    ${order.capture ? `<img src="${order.capture}" alt="Capture de paiement">` : ""}
    ${order.status === "validated" ? downloadButtons(order) : ""}
  `;
  document.getElementById("detailDialog").showModal();
}

function downloadButtons(order) {
  return Hikma.versionsFor(order)
    .map(version => `<button class="primary download" data-download="${order.id}" data-version="${version}">Télécharger PDF ${version.toUpperCase()}</button>`)
    .join(" ");
}

function mutateOrder(id, updater) {
  const orders = Hikma.loadOrders().map(order => order.id === id ? updater(order) : order);
  Hikma.saveOrders(orders);
  renderAdmin();
}

function whatsapp(order, validated = false) {
  const msg = validated || order.status === "validated"
    ? `Bonjour ${order.name}, votre paiement est validé. Vous pouvez vérifier votre commande avec le numéro ${Hikma.shortPhone(order.phone)} et télécharger votre livre PDF (${Hikma.versionLabel(order.version)}).`
    : `Bonjour ${order.name}, votre commande ${order.id} est en vérification. Nous vous confirmerons le paiement très bientôt.`;
  window.open(`https://wa.me/${Hikma.normalizePhone(order.phone)}?text=${encodeURIComponent(msg)}`, "_blank");
}

async function readTextFile(file) {
  if (!file || !file.size) return "";
  return file.text();
}

function bindAdmin() {
  document.getElementById("languageToggle")?.addEventListener("click", () => {
    adminLang = adminLang === "fr" ? "ar" : "fr";
    Hikma.applyLanguage(adminLang);
  });

  document.querySelectorAll(".close").forEach(btn => {
    btn.addEventListener("click", event => event.target.closest("dialog").close());
  });

  document.addEventListener("click", async event => {
    const tabButton = event.target.closest("[data-admin-tab]");
    if (tabButton) {
      adminTab = tabButton.dataset.adminTab;
      renderAdmin();
      return;
    }

    const archiveButton = event.target.closest("[data-filter-archive]");
    if (archiveButton) {
      archiveMode = archiveButton.dataset.filterArchive;
      renderOrders();
      return;
    }

    const actionButton = event.target.closest("[data-action]");
    if (actionButton) {
      const id = actionButton.dataset.id;
      const order = Hikma.loadOrders().find(item => item.id === id);
      if (!order) return;
      if (actionButton.dataset.action === "view") viewOrder(id);
      if (actionButton.dataset.action === "validate") {
        mutateOrder(id, item => ({ ...item, status: "validated" }));
        whatsapp({ ...order, status: "validated" }, true);
      }
      if (actionButton.dataset.action === "archive") mutateOrder(id, item => ({ ...item, archived: !item.archived }));
      if (actionButton.dataset.action === "delete" && confirm("Supprimer cette commande ?")) {
        Hikma.saveOrders(Hikma.loadOrders().filter(item => item.id !== id));
        renderAdmin();
      }
      if (actionButton.dataset.action === "whatsapp") whatsapp(order);
      return;
    }

    const downloadButton = event.target.closest("[data-download]");
    if (downloadButton) {
      const order = Hikma.loadOrders().find(item => item.id === downloadButton.dataset.download);
      if (order && order.status === "validated") {
        await Hikma.downloadBook(order, downloadButton.dataset.version || "fr", adminAssetPrefix);
      }
      return;
    }

    const adminDownload = event.target.closest("[data-download-admin-file]");
    if (adminDownload) {
      const key = adminDownload.dataset.downloadAdminFile;
      const file = await Hikma.getFile(key);
      if (file) {
        Hikma.downloadBlob(file, file.name || `${key}.pdf`);
        return;
      }
      if (key === "cover") {
        Hikma.downloadBlob(await fetch(`${adminAssetPrefix}assets/book-cover.svg`).then(r => r.blob()), "book-cover.svg");
        return;
      }
      const bundled = await Hikma.fetchBundledBook(adminAssetPrefix);
      if (bundled) Hikma.downloadBlob(bundled, "livre-original.pdf");
      if (!bundled) alert("Aucun fichier n'est encore chargé.");
    }
  });

  document.addEventListener("submit", async event => {
    if (event.target.id !== "settingsForm") return;
    event.preventDefault();
    const form = event.target;
    const data = Object.fromEntries(new FormData(form).entries());
    const current = Hikma.settings();
    const prefaceFrFile = await readTextFile(form.prefaceFrFile.files[0]);
    const prefaceArFile = await readTextFile(form.prefaceArFile.files[0]);
    const next = {
      ...current,
      businessName: data.businessName,
      price: Number(data.price) || 200,
      currency: data.currency || "MRU",
      whatsapp: Hikma.normalizePhone(data.whatsapp),
      bankily: data.bankily,
      masrivi: data.masrivi,
      sedad: data.sedad,
      pdfTitleFr: data.pdfTitleFr,
      pdfTitleAr: data.pdfTitleAr,
      prefaceFr: prefaceFrFile || data.prefaceFr,
      prefaceAr: prefaceArFile || data.prefaceAr,
      fileNames: { ...current.fileNames }
    };
    if (form.pdfFr.files[0]) {
      await Hikma.putFile("pdfFr", form.pdfFr.files[0]);
      next.fileNames.pdfFr = form.pdfFr.files[0].name;
    }
    if (form.pdfAr.files[0]) {
      await Hikma.putFile("pdfAr", form.pdfAr.files[0]);
      next.fileNames.pdfAr = form.pdfAr.files[0].name;
    }
    if (form.cover.files[0]) {
      await Hikma.putFile("cover", form.cover.files[0]);
      next.fileNames.cover = form.cover.files[0].name;
    }
    Hikma.saveSettings(next);
    renderAdmin();
    alert("Paramètres enregistrés.");
  });

  ["adminSearch", "statusFilter", "paymentFilter", "sortFilter"].forEach(id => {
    document.addEventListener("input", event => { if (event.target.id === id) renderOrders(); });
    document.addEventListener("change", event => { if (event.target.id === id) renderOrders(); });
  });
}

bindAdmin();
Hikma.applyLanguage(adminLang);
renderAdmin();
