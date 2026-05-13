const Hikma = (() => {
  const STORE_KEY = "hikma-orders-v2";
  const LEGACY_STORE_KEY = "hikma-orders-v1";
  const SETTINGS_KEY = "hikma-settings-v2";
  const DB_NAME = "hikma-assets-db";
  const DB_STORE = "files";

  const defaultPrefaceFr = "Dans un monde marqué par des mutations rapides aux niveaux sanitaire, social et économique, les questions de santé et de développement ne peuvent plus être réduites à la seule disponibilité des services ou à la mobilisation des ressources. Elles sont désormais étroitement liées à la capacité des acteurs à communiquer efficacement, à transmettre les connaissances et à influencer positivement les comportements individuels et collectifs. Cet ouvrage propose une vision intégrée du rôle de la communication comme levier essentiel au service de la santé et du développement. Nouakchott, le 29 avril 2026 Dr Bechir Aounen.";
  const defaultPrefaceAr = "في عالم يشهد تحولات صحية واجتماعية واقتصادية متسارعة، لم تعد قضايا الصحة والتنمية مرتبطة فقط بتوفر الخدمات أو الموارد، بل أصبحت متصلة بقدرة الفاعلين على التواصل الفعال ونقل المعرفة وبناء الثقة. يقدم هذا الكتاب رؤية مدمجة لدور الاتصال كرافعة أساسية لخدمة الصحة والتنمية. نواكشوط، 29 أبريل 2026 الدكتور بشير عونن.";

  const translations = {
    fr: {
      tagline: "Communication de Santé",
      home: "Accueil",
      track: "Suivi de commande",
      category: "Communication de Santé",
      title: "Librairie Numérique",
      trust1: "Expertise reconnue",
      trust2: "Recherche approfondie",
      trust3: "Diffusé nationalement",
      how: "Comment ça marche ?",
      stepsTitle: "4 étapes simples pour commander et télécharger votre livre en français et en arabe",
      step1Title: "Passez votre commande",
      step1Text: "Choisissez la version française, arabe ou les deux, puis renseignez votre nom et votre numéro WhatsApp.",
      step2Title: "Effectuez le paiement",
      step2Text: "Transférez le montant via Bankily, Masrivi, Sedad ou Click et joignez la capture d'écran.",
      step3Title: "Attendez la validation",
      step3Text: "L'administrateur vérifie votre paiement et vous envoie la confirmation WhatsApp.",
      step4Title: "Téléchargez votre livre",
      step4Text: "Après validation, vérifiez votre commande par téléphone et téléchargez le PDF commandé.",
      orderNow: "Commander Maintenant",
      prefaceTitle: "Préface du livre",
      trackTitle: "Suivi de commande",
      search: "Rechercher",
      orders: "Gestion des Commandes",
      accounting: "Comptabilité",
      settings: "Paramètres",
      archives: "Archivage",
      newOrder: "Nouvelle commande",
      sendOrder: "Envoyer la commande"
    },
    ar: {
      tagline: "الاتصال الصحي",
      home: "الرئيسية",
      track: "تتبع الطلب",
      category: "الاتصال الصحي",
      title: "المكتبة الرقمية",
      trust1: "خبرة معترف بها",
      trust2: "بحث معمق",
      trust3: "انتشار وطني",
      how: "كيف يتم ذلك؟",
      stepsTitle: "4 خطوات بسيطة لطلب وتحميل كتابك بالفرنسية والعربية",
      step1Title: "أرسل طلبك",
      step1Text: "اختر النسخة الفرنسية أو العربية أو النسختين ثم أدخل اسمك ورقم واتساب.",
      step2Title: "ادفع المبلغ",
      step2Text: "حوّل المبلغ عبر بنكلي أو مصرفي أو سداد أو كليك وأرفق صورة الدفع.",
      step3Title: "انتظر التحقق",
      step3Text: "يتحقق المسؤول من الدفع ثم يرسل لك التأكيد عبر واتساب.",
      step4Title: "حمّل الكتاب",
      step4Text: "بعد التأكيد، تحقق من طلبك برقم الهاتف وحمّل ملف PDF المطلوب.",
      orderNow: "اطلب الآن",
      prefaceTitle: "مقدمة الكتاب",
      trackTitle: "تتبع الطلب",
      search: "بحث",
      orders: "إدارة الطلبات",
      accounting: "المحاسبة",
      settings: "الإعدادات",
      archives: "الأرشيف",
      newOrder: "طلب جديد",
      sendOrder: "إرسال الطلب"
    }
  };

  const seedOrders = [
    ["2026-05-12T13:32:00", "محمدفال ولدناصر الدين محمدن", "32624388", "both", "Bankily", "", "", "validated"],
    ["2026-05-11T23:35:00", "Isselmou Bedine", "46839319", "fr", "Bankily", "", "", "validated"],
    ["2026-05-11T22:19:00", "Mohameden Mohamed", "22688116", "ar", "Masrivi", "", "A tous les agents ...", "validated"],
    ["2026-05-11T22:16:00", "Md Mahmoud Said", "44116415", "both", "Masrivi", "receipt", "Homme d'affaires", "validated"],
    ["2026-05-11T22:11:00", "Sidi Boye Sidi", "36313376", "fr", "Bankily", "", "Ma famille", "validated"],
    ["2026-05-04T19:48:00", "Mamadou kane Mamadou kane", "48920000", "ar", "Bankily", "", "", "validated"],
    ["2026-05-04T17:42:00", "Sidi Mohamed Abdelaziz", "36304617", "both", "Bankily", "receipt", "À mon ami et frère", "validated"],
    ["2026-05-04T13:41:00", "ليلى احمد سالم حميدات", "49901549", "ar", "Sedad", "receipt", "", "validated"],
    ["2026-04-28T21:49:00", "Bechir Aounen", "36327192", "fr", "Bankily", "receipt", "", "validated"]
  ].map((row, index) => ({
    id: `BH-${String(2026001 + index)}`,
    date: row[0],
    name: row[1],
    phone: normalizePhone(row[2]),
    version: row[3],
    payment: row[4],
    capture: row[5] ? makeReceipt(row[4]) : "",
    dedication: row[6],
    status: row[7],
    archived: false,
    price: 200
  }));

  function defaultSettings() {
    return {
      businessName: "Bureau Hikma",
      price: 200,
      currency: "MRU",
      bankily: "32624388",
      masrivi: "22688116",
      sedad: "49901549",
      whatsapp: "22232624388",
      pdfTitleFr: "Communication de Santé",
      pdfTitleAr: "الاتصال كأداة للصحة والتنمية",
      prefaceFr: defaultPrefaceFr,
      prefaceAr: defaultPrefaceAr,
      fileNames: { pdfFr: "", pdfAr: "", cover: "" }
    };
  }

  function settings() {
    const saved = JSON.parse(localStorage.getItem(SETTINGS_KEY) || "null");
    const defaults = defaultSettings();
    return { ...defaults, ...(saved || {}), fileNames: { ...defaults.fileNames, ...((saved || {}).fileNames || {}) } };
  }

  function saveSettings(next) {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
  }

  function migrateOrder(order) {
    return {
      ...order,
      phone: normalizePhone(order.phone || ""),
      version: order.version || "fr",
      price: Number(order.price) || Number(settings().price) || 200,
      archived: Boolean(order.archived)
    };
  }

  function loadOrders() {
    const saved = localStorage.getItem(STORE_KEY);
    if (saved) return JSON.parse(saved).map(migrateOrder);
    const legacy = localStorage.getItem(LEGACY_STORE_KEY);
    if (legacy) {
      const migrated = JSON.parse(legacy).map(migrateOrder);
      saveOrders(migrated);
      return migrated;
    }
    saveOrders(seedOrders);
    return seedOrders;
  }

  function saveOrders(orders) {
    localStorage.setItem(STORE_KEY, JSON.stringify(orders));
  }

  function openDb() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, 1);
      request.onupgradeneeded = () => request.result.createObjectStore(DB_STORE);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async function putFile(key, file) {
    if (!file || !file.size) return;
    const db = await openDb();
    await new Promise((resolve, reject) => {
      const tx = db.transaction(DB_STORE, "readwrite");
      tx.objectStore(DB_STORE).put(file, key);
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error);
    });
    db.close();
  }

  async function getFile(key) {
    const db = await openDb();
    const file = await new Promise((resolve, reject) => {
      const tx = db.transaction(DB_STORE, "readonly");
      const request = tx.objectStore(DB_STORE).get(key);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
    db.close();
    return file;
  }

  async function fileToDataUrl(file) {
    return new Promise(resolve => {
      if (!file) {
        resolve("");
        return;
      }
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.readAsDataURL(file);
    });
  }

  function makeReceipt(payment) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 220"><rect width="180" height="220" rx="18" fill="#f8fafc"/><rect x="18" y="18" width="144" height="26" rx="8" fill="#16a34a"/><text x="90" y="36" text-anchor="middle" font-family="Arial" font-size="13" font-weight="700" fill="#fff">Paiement valide</text><text x="90" y="88" text-anchor="middle" font-family="Arial" font-size="22" font-weight="700" fill="#111827">${payment}</text><text x="90" y="122" text-anchor="middle" font-family="Arial" font-size="18" fill="#64748b">200 MRU</text><path d="M46 152h88M46 174h88" stroke="#cbd5e1" stroke-width="6" stroke-linecap="round"/></svg>`;
    return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
  }

  function applyLanguage(lang) {
    document.documentElement.lang = lang;
    document.body.dir = lang === "ar" ? "rtl" : "ltr";
    document.querySelectorAll("[data-i18n]").forEach(el => {
      const key = el.dataset.i18n;
      if (translations[lang][key]) el.textContent = translations[lang][key];
    });
    document.querySelectorAll("#languageToggle span").forEach(el => {
      el.textContent = lang === "fr" ? "العربية" : "Français";
    });
    localStorage.setItem("hikma-lang", lang);
  }

  function normalizePhone(phone) {
    const digits = String(phone || "").replace(/\D/g, "");
    if (!digits) return "";
    return digits.startsWith("222") ? digits : `222${digits}`;
  }

  function shortPhone(phone) {
    return String(phone || "").replace(/^222/, "");
  }

  function versionLabel(version) {
    return { fr: "Français", ar: "العربية", both: "Français + العربية" }[version] || "Français";
  }

  function versionsFor(order) {
    return order.version === "both" ? ["fr", "ar"] : [order.version || "fr"];
  }

  function paymentIcon(payment) {
    return { Bankily: "▥", Masrivi: "▭", Sedad: "▣", Click: "☑" }[payment] || "▣";
  }

  function formatDate(date) {
    return new Intl.DateTimeFormat("fr-FR", { dateStyle: "short", timeStyle: "short" }).format(new Date(date));
  }

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[char]));
  }

  function escapeAttr(value) {
    return escapeHtml(value).replace(/`/g, "&#096;");
  }

  function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 500);
  }

  async function fetchBundledBook(prefix = "") {
    try {
      const response = await fetch(`${prefix}assets/livre-original.pdf`);
      if (!response.ok) return null;
      return response.blob();
    } catch {
      return null;
    }
  }

  async function downloadBook(order, version, prefix = "") {
    const key = version === "ar" ? "pdfAr" : "pdfFr";
    const uploaded = await getFile(key);
    if (uploaded) {
      downloadBlob(uploaded, uploaded.name || `${order.id}-${version}.pdf`);
      return;
    }
    const bundled = await fetchBundledBook(prefix);
    if (bundled) {
      downloadBlob(bundled, `${order.id}-bureau-hikma-${version}.pdf`);
      return;
    }
    downloadBlob(makeFallbackPdf(order, version), `${order.id}-bureau-hikma-${version}.pdf`);
  }

  function makeFallbackPdf(order, version) {
    const s = settings();
    const title = version === "ar" ? s.pdfTitleAr : s.pdfTitleFr;
    const stream = `BT
/F1 24 Tf 70 760 Td (Bureau Hikma) Tj
/F1 18 Tf 0 -44 Td (${pdfSafe(title)}) Tj
/F1 12 Tf 0 -42 Td (Commande: ${pdfSafe(order.id)}) Tj
0 -24 Td (Client: ${pdfSafe(order.name)}) Tj
0 -24 Td (WhatsApp: ${pdfSafe(shortPhone(order.phone))}) Tj
0 -24 Td (Paiement valide: ${pdfSafe(order.payment)} - ${order.price} MRU) Tj
0 -48 Td (Livre numerique ${version.toUpperCase()} disponible. Chargez le PDF officiel dans Parametres.) Tj
ET`;
    const objects = [
      "<</Type/Catalog/Pages 2 0 R>>",
      "<</Type/Pages/Kids[3 0 R]/Count 1>>",
      "<</Type/Page/Parent 2 0 R/MediaBox[0 0 595 842]/Resources<</Font<</F1 4 0 R>>>>/Contents 5 0 R>>",
      "<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>",
      `<</Length ${stream.length}>>stream\n${stream}\nendstream`
    ];
    let pdf = "%PDF-1.4\n";
    const offsets = [0];
    objects.forEach((object, index) => {
      offsets.push(pdf.length);
      pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
    });
    const xref = pdf.length;
    pdf += `xref
0 ${objects.length + 1}
0000000000 65535 f 
${offsets.slice(1).map(offset => `${String(offset).padStart(10, "0")} 00000 n `).join("\n")}
trailer<</Size ${objects.length + 1}/Root 1 0 R>>
startxref
${xref}
%%EOF`;
    return new Blob([pdf], { type: "application/pdf" });
  }

  function pdfSafe(value) {
    return String(value)
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^\x20-\x7E]/g, " ")
      .replace(/[()\\]/g, "");
  }

  return {
    applyLanguage,
    downloadBlob,
    downloadBook,
    escapeAttr,
    escapeHtml,
    fetchBundledBook,
    fileToDataUrl,
    formatDate,
    getFile,
    loadOrders,
    normalizePhone,
    paymentIcon,
    putFile,
    saveOrders,
    saveSettings,
    settings,
    shortPhone,
    versionLabel,
    versionsFor
  };
})();
