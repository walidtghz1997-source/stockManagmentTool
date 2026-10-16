/* StockFlow: stock management tool (vanilla JavaScript, no dependencies).
   Sections: 1) config  2) translations  3) storage  4) state & data operations
             5) validation  6) rendering  7) dialogs & toast  8) events  9) init */
(() => {
  "use strict";

  /* ============================================================
     1) CONFIG
     ============================================================ */
  const KEYS = {
    products: "stockflow-products-v1",
    threshold: "stockflow-low-stock-threshold-v1",
    lang: "stockflow-lang-v1"
  };
  const DEFAULT_THRESHOLD = 5;
  const DEFAULT_LANG = "ar";
  const MAX_NAME = 80;
  const MAX_CATEGORY = 40;
  const MAX_AMOUNT = 1e9;
  const NEW_CATEGORY_VALUE = "__new__";
  const DEFAULT_CATEGORY = "general";
  // Built-in categories are stored as keys and translated for display.
  const BUILT_IN_CATEGORIES = ["general", "groceries", "drinks", "electronics", "clothing", "household", "stationery"];

  /* ============================================================
     2) TRANSLATIONS (single dictionary; HTML uses data-i18n attributes)
     ============================================================ */
  const translations = {
    en: {
      "meta.title": "StockFlow | Stock management",
      "a11y.skip": "Skip to content",
      "brand.tagline": "Stock management",
      "nav.toggle": "Toggle menu", "nav.label": "Main navigation", "nav.home": "Home", "nav.features": "Features", "nav.inventory": "Inventory",
      "lang.label": "Language",
      "cta.open": "Open Inventory", "cta.features": "See features",
      "hero.eyebrow": "Built for small local stores",
      "hero.title": "Know exactly what is on your shelves.",
      "hero.text": "StockFlow helps you track products, quantities and prices, and warns you before an item runs out. No account and no server: it runs right in your browser.",
      "hero.trust": "Arabic and English · Works offline · Data stays on your device",
      "hero.art": "Illustration of a store shelf full of stocked boxes",
      "features.title": "Everything a small store needs",
      "features.subtitle": "Three simple benefits, no learning curve.",
      "f1.title": "See your stock at a glance",
      "f1.text": "Live cards show your products, total units and the full inventory value in MAD, updated after every change.",
      "f2.title": "Low-stock warnings",
      "f2.text": "Products at or below your threshold (5 units by default) are highlighted, and sold-out items are flagged separately.",
      "f3.title": "Saved in your browser",
      "f3.text": "Your inventory stays after a refresh or restart. Search, filter by category or status, and switch between Arabic and English.",
      "footer.nav": "Footer navigation",
      "footer.text": "A simple inventory tool built with HTML, CSS and JavaScript.",
      "footer.note": "Data is stored only in this browser (localStorage).",

      "app.title": "Inventory dashboard", "app.subtitle": "A clear view of your products and stock levels.",
      "btn.add": "Add product", "btn.export": "Export CSV",
      "stats.label": "Inventory statistics",
      "stats.products": "Total products", "stats.productsFoot": "Distinct items",
      "stats.units": "Total units", "stats.unitsFoot": "Sum of all quantities",
      "stats.value": "Inventory value", "stats.valueFoot": "Price × quantity",
      "stats.low": "Low stock", "stats.lowFoot": "At or below the threshold",
      "stats.out": "Out of stock", "stats.outFoot": "Quantity is zero",
      "banner.title": "Products needing attention: {n}",
      "banner.text": "{low} low on stock and {out} out of stock. Current threshold: {threshold}.",
      "banner.show": "Show them",
      "inv.title": "Products and stock", "inv.subtitle": "Manage your products and update quantities in one place.",
      "search.label": "Search products by name", "search.placeholder": "Search by product name…",
      "filter.category": "Category", "filter.categoryAll": "All categories",
      "filter.status": "Stock status", "filter.statusAll": "All statuses", "filter.attention": "Needs attention",
      "filter.clear": "Clear filters", "threshold.label": "Low-stock threshold",
      "status.in": "In stock", "status.low": "Low stock", "status.out": "Out of stock",
      "table.label": "Products table",
      "th.product": "Product", "th.category": "Category", "th.price": "Unit price", "th.quantity": "Quantity",
      "th.value": "Stock value", "th.status": "Status", "th.actions": "Actions",
      "row.edit": "Edit {name}", "row.delete": "Delete {name}",
      "row.inc": "Increase quantity of {name}", "row.dec": "Decrease quantity of {name}",
      "empty.noneTitle": "No products yet",
      "empty.noneText": "Add your first product, or load the sample data to see how it works.",
      "empty.add": "Add first product",
      "empty.noMatchTitle": "No matching products",
      "empty.noMatchText": "Try a different search or clear the filters.",
      "results.count": "Showing {shown} of {total}",
      "data.currency": "Currency: Moroccan dirham (MAD)", "currency.short": "MAD",
      "data.title": "Data tools",
      "data.note": "Your inventory is stored only in this browser. It is not synced between devices.",
      "data.sample": "Load sample data", "data.reset": "Reset inventory",

      "form.eyebrow": "Product details", "form.addTitle": "Add a new product", "form.editTitle": "Edit product",
      "form.desc": "Fields marked * are required.", "form.close": "Close",
      "form.name": "Product name", "form.namePh": "e.g. Olive oil 1L",
      "form.category": "Category", "form.categoryNew": "Other (type a new category)…", "form.customCategory": "New category name",
      "form.price": "Unit price (MAD)", "form.quantity": "Quantity",
      "form.cancel": "Cancel", "form.saveAdd": "Save product", "form.saveEdit": "Save changes",
      "cat.general": "General", "cat.groceries": "Groceries", "cat.drinks": "Drinks", "cat.electronics": "Electronics",
      "cat.clothing": "Clothing", "cat.household": "Household", "cat.stationery": "Stationery",

      "err.nameRequired": "Please enter the product name.",
      "err.nameLong": "The name must be {max} characters or fewer.",
      "err.nameDuplicate": "A product with this name already exists. Edit it instead of adding it again.",
      "err.categoryRequired": "Please choose or enter a category.",
      "err.categoryLong": "The category must be {max} characters or fewer.",
      "err.priceInvalid": "Enter a valid price of 0 or more.",
      "err.quantityInvalid": "Enter a whole quantity of 0 or more.",
      "err.thresholdInvalid": "The threshold must be a whole number of 0 or more.",
      "err.notFound": "That product could not be found. It may have been deleted.",
      "err.unexpected": "Something went wrong. Please try again.",

      "confirm.cancel": "Cancel",
      "confirm.deleteTitle": "Delete this product?",
      "confirm.deleteText": "Delete “{name}” from your inventory? This cannot be undone.",
      "confirm.deleteBtn": "Delete product",
      "confirm.resetTitle": "Reset the inventory?",
      "confirm.resetText": "This permanently removes all products saved in this browser.",
      "confirm.resetBtn": "Reset everything",
      "confirm.sampleTitle": "Load the sample data?",
      "confirm.sampleText": "This replaces your current inventory with the sample products.",
      "confirm.sampleBtn": "Replace with sample",

      "toast.added": "Product added successfully.",
      "toast.updated": "Product updated successfully.",
      "toast.deleted": "“{name}” was deleted.",
      "toast.qtyUp": "Quantity increased.", "toast.qtyDown": "Quantity decreased.",
      "toast.qtyMin": "Quantity cannot go below zero.",
      "toast.threshold": "Low-stock threshold updated.",
      "toast.exported": "CSV file is ready to download.", "toast.exportEmpty": "There are no products to export.",
      "toast.saveFail": "Could not save to this browser. Check your storage settings.",
      "toast.reset": "Inventory has been reset.", "toast.sample": "Sample data loaded.",
      "toast.corrupt": "Saved data could not be read, so the inventory started empty. A backup copy was kept.",
      "csv.id": "ID",

      "err.nameMustContainLetter": "The product name must contain at least one letter."
    },

    ar: {
      "meta.title": "StockFlow | إدارة المخزون",
      "a11y.skip": "انتقل إلى المحتوى",
      "brand.tagline": "إدارة المخزون",
      "nav.toggle": "فتح القائمة أو إغلاقها", "nav.label": "التنقل الرئيسي", "nav.home": "الرئيسية", "nav.features": "المزايا", "nav.inventory": "المخزون",
      "lang.label": "اللغة",
      "cta.open": "افتح المخزون", "cta.features": "اكتشف المزايا",
      "hero.eyebrow": "مصمم للمتاجر المحلية الصغيرة",
      "hero.title": "اعرف بالضبط ما على رفوفك.",
      "hero.text": "يساعدك StockFlow على تتبع المنتجات والكميات والأسعار، وينبهك قبل نفاد أي منتج. بلا حساب وبلا خادم: يعمل مباشرة في متصفحك.",
      "hero.trust": "بالعربية والإنجليزية · يعمل دون اتصال · بياناتك تبقى على جهازك",
      "hero.art": "رسم توضيحي لرف متجر مليء بالصناديق",
      "features.title": "كل ما يحتاجه متجر صغير",
      "features.subtitle": "ثلاث فوائد بسيطة دون تعقيد.",
      "f1.title": "مخزونك في لمحة",
      "f1.text": "بطاقات مباشرة تعرض عدد المنتجات وإجمالي الوحدات وقيمة المخزون بالدرهم، وتتحدث بعد كل تعديل.",
      "f2.title": "تنبيهات المخزون المنخفض",
      "f2.text": "تُبرز المنتجات التي بلغت حد التنبيه أو أقل (5 وحدات افتراضياً)، وتُعرض المنتجات النافدة بحالة مستقلة.",
      "f3.title": "محفوظ في متصفحك",
      "f3.text": "يبقى مخزونك بعد تحديث الصفحة أو إعادة التشغيل. ابحث وصنّف حسب الفئة أو الحالة، وبدّل بين العربية والإنجليزية.",
      "footer.nav": "روابط التذييل",
      "footer.text": "أداة بسيطة لإدارة المخزون مبنية بـ HTML وCSS وJavaScript.",
      "footer.note": "تُحفظ البيانات في هذا المتصفح فقط (localStorage).",

      "app.title": "لوحة إدارة المخزون", "app.subtitle": "نظرة واضحة على منتجاتك ومستويات مخزونك.",
      "btn.add": "إضافة منتج", "btn.export": "تصدير CSV",
      "stats.label": "إحصائيات المخزون",
      "stats.products": "إجمالي المنتجات", "stats.productsFoot": "عدد الأصناف المسجلة",
      "stats.units": "إجمالي الوحدات", "stats.unitsFoot": "مجموع الكميات المتوفرة",
      "stats.value": "قيمة المخزون", "stats.valueFoot": "السعر × الكمية",
      "stats.low": "مخزون منخفض", "stats.lowFoot": "عند حد التنبيه أو أقل",
      "stats.out": "نفد المخزون", "stats.outFoot": "الكمية تساوي صفراً",
      "banner.title": "منتجات تحتاج إلى انتباه: {n}",
      "banner.text": "{low} منها مخزونها منخفض و{out} نفد مخزونها. حد التنبيه الحالي: {threshold}.",
      "banner.show": "عرضها",
      "inv.title": "المنتجات والمخزون", "inv.subtitle": "أدر منتجاتك وحدّث كمياتها من مكان واحد.",
      "search.label": "البحث عن منتج بالاسم", "search.placeholder": "ابحث عن اسم المنتج…",
      "filter.category": "الفئة", "filter.categoryAll": "كل الفئات",
      "filter.status": "حالة المخزون", "filter.statusAll": "كل الحالات", "filter.attention": "يحتاج إلى انتباه",
      "filter.clear": "مسح التصفية", "threshold.label": "حد تنبيه المخزون",
      "status.in": "متوفر", "status.low": "مخزون منخفض", "status.out": "نفد المخزون",
      "table.label": "جدول المنتجات",
      "th.product": "المنتج", "th.category": "الفئة", "th.price": "سعر الوحدة", "th.quantity": "الكمية",
      "th.value": "قيمة المخزون", "th.status": "الحالة", "th.actions": "الإجراءات",
      "row.edit": "تعديل {name}", "row.delete": "حذف {name}",
      "row.inc": "زيادة كمية {name}", "row.dec": "إنقاص كمية {name}",
      "empty.noneTitle": "لا توجد منتجات بعد",
      "empty.noneText": "أضف أول منتج، أو حمّل البيانات التجريبية لترى كيف يعمل التطبيق.",
      "empty.add": "إضافة أول منتج",
      "empty.noMatchTitle": "لا توجد منتجات مطابقة",
      "empty.noMatchText": "جرّب بحثاً مختلفاً أو امسح التصفية.",
      "results.count": "عرض {shown} من {total}",
      "data.currency": "العملة: الدرهم المغربي (MAD)", "currency.short": "د.م",
      "data.title": "أدوات البيانات",
      "data.note": "يُحفظ مخزونك في هذا المتصفح فقط ولا تتم مزامنته بين الأجهزة.",
      "data.sample": "تحميل بيانات تجريبية", "data.reset": "إعادة ضبط المخزون",

      "form.eyebrow": "بيانات المنتج", "form.addTitle": "إضافة منتج جديد", "form.editTitle": "تعديل المنتج",
      "form.desc": "الحقول المعلّمة بـ * مطلوبة.", "form.close": "إغلاق",
      "form.name": "اسم المنتج", "form.namePh": "مثال: زيت زيتون 1 لتر",
      "form.category": "الفئة", "form.categoryNew": "أخرى (اكتب فئة جديدة)…", "form.customCategory": "اسم الفئة الجديدة",
      "form.price": "سعر الوحدة (د.م)", "form.quantity": "الكمية",
      "form.cancel": "إلغاء", "form.saveAdd": "حفظ المنتج", "form.saveEdit": "حفظ التعديلات",
      "cat.general": "عام", "cat.groceries": "مواد غذائية", "cat.drinks": "مشروبات", "cat.electronics": "إلكترونيات",
      "cat.clothing": "ملابس", "cat.household": "مستلزمات منزلية", "cat.stationery": "أدوات مكتبية",

      "err.nameRequired": "يرجى إدخال اسم المنتج.",
      "err.nameLong": "يجب ألا يتجاوز الاسم {max} حرفاً.",
      "err.nameDuplicate": "يوجد منتج بهذا الاسم بالفعل. عدّله بدلاً من إضافته مرة أخرى.",
      "err.categoryRequired": "يرجى اختيار فئة أو كتابتها.",
      "err.categoryLong": "يجب ألا تتجاوز الفئة {max} حرفاً.",
      "err.priceInvalid": "أدخل سعراً صحيحاً يساوي 0 أو أكثر.",
      "err.quantityInvalid": "أدخل كمية صحيحة كاملة تساوي 0 أو أكثر.",
      "err.thresholdInvalid": "يجب أن يكون حد التنبيه عدداً صحيحاً يساوي 0 أو أكثر.",
      "err.notFound": "تعذر العثور على المنتج. ربما تم حذفه.",
      "err.unexpected": "حدث خطأ ما. يرجى المحاولة مرة أخرى.",

      "confirm.cancel": "إلغاء",
      "confirm.deleteTitle": "حذف هذا المنتج؟",
      "confirm.deleteText": "هل تريد حذف «{name}» من المخزون؟ لا يمكن التراجع عن هذا الإجراء.",
      "confirm.deleteBtn": "حذف المنتج",
      "confirm.resetTitle": "إعادة ضبط المخزون؟",
      "confirm.resetText": "سيؤدي هذا إلى حذف كل المنتجات المحفوظة في هذا المتصفح نهائياً.",
      "confirm.resetBtn": "إعادة ضبط كل شيء",
      "confirm.sampleTitle": "تحميل البيانات التجريبية؟",
      "confirm.sampleText": "سيؤدي هذا إلى استبدال مخزونك الحالي بالمنتجات التجريبية.",
      "confirm.sampleBtn": "الاستبدال بالتجريبية",

      "toast.added": "تمت إضافة المنتج بنجاح.",
      "toast.updated": "تم تحديث المنتج بنجاح.",
      "toast.deleted": "تم حذف «{name}».",
      "toast.qtyUp": "تمت زيادة الكمية.", "toast.qtyDown": "تم إنقاص الكمية.",
      "toast.qtyMin": "لا يمكن أن تصبح الكمية أقل من صفر.",
      "toast.threshold": "تم تحديث حد تنبيه المخزون.",
      "toast.exported": "ملف CSV جاهز للتنزيل.", "toast.exportEmpty": "لا توجد منتجات لتصديرها.",
      "toast.saveFail": "تعذر الحفظ في هذا المتصفح. تحقق من إعدادات التخزين.",
      "toast.reset": "تمت إعادة ضبط المخزون.", "toast.sample": "تم تحميل البيانات التجريبية.",
      "toast.corrupt": "تعذرت قراءة البيانات المحفوظة، لذلك بدأ المخزون فارغاً. تم الاحتفاظ بنسخة احتياطية.",
      "csv.id": "المعرّف",
      "err.nameMustContainLetter": "يجب أن يحتوي اسم المنتج على حرف واحد على الأقل."
    }
  };

  const SAMPLE_PRODUCTS = [
    { name: "Olive Oil 1L", category: "groceries", price: 38.5, quantity: 24 },
    { name: "Mint Tea 100g", category: "groceries", price: 12, quantity: 5 },
    { name: "Orange Juice 1L", category: "drinks", price: 11, quantity: 6 },
    { name: "USB-C Cable", category: "electronics", price: 45, quantity: 12 },
    { name: "T-Shirt (M)", category: "clothing", price: 79, quantity: 3 },
    { name: "Dish Soap", category: "household", price: 14, quantity: 18 },
    { name: "Notebook A5", category: "stationery", price: 8, quantity: 0 },
    { name: "Pens (box of 10)", category: "stationery", price: 25, quantity: 40 }
  ];

  /* ============================================================
     3) STORAGE (every call is guarded: storage can be blocked or full)
     ============================================================ */
  const storage = {
    read(key) {
      try { return localStorage.getItem(key); } catch (error) { return null; }
    },
    write(key, value) {
      try { localStorage.setItem(key, value); return true; } catch (error) { console.error("Storage write failed:", error); return false; }
    }
  };

  /* ============================================================
     4) STATE & DATA OPERATIONS
     ============================================================ */
  const state = {
    products: [],
    threshold: DEFAULT_THRESHOLD,
    lang: DEFAULT_LANG,
    filters: { search: "", category: "all", status: "all" },
    confirmAction: null
  };

  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => Array.from(document.querySelectorAll(selector));

  function createId() {
    if (window.crypto && typeof window.crypto.randomUUID === "function") return window.crypto.randomUUID();
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  function isValidMoney(value) {
    return typeof value === "number" && Number.isFinite(value) && value >= 0 && value <= MAX_AMOUNT;
  }

  function isValidQuantity(value) {
    return Number.isInteger(value) && value >= 0 && value <= MAX_AMOUNT;
  }

  /** Turns stored data into a safe product, or null if it is unusable. */
  function normalizeProduct(raw) {
    if (!raw || typeof raw !== "object") return null;
    const name = typeof raw.name === "string" ? raw.name.trim() : "";
    if (!name || !isValidMoney(raw.price) || !isValidQuantity(raw.quantity)) return null;
    const category = typeof raw.category === "string" && raw.category.trim() ? raw.category.trim() : DEFAULT_CATEGORY;
    const id = typeof raw.id === "string" || typeof raw.id === "number" ? String(raw.id) : createId();
    return { id, name, category, price: raw.price, quantity: raw.quantity };
  }

  function createSampleProducts() {
    return SAMPLE_PRODUCTS.map((item) => ({ id: createId(), ...item }));
  }

  /**
   * Loads products. Sample data is created ONLY when nothing has ever been saved.
   * Unreadable data is backed up and never silently overwritten with samples.
   */
  function loadProducts() {
    const raw = storage.read(KEYS.products);
    if (raw === null) return { products: createSampleProducts(), seeded: true, corrupt: false };
    try {
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) throw new Error("Stored inventory is not a list");
      return { products: parsed.map(normalizeProduct).filter(Boolean), seeded: false, corrupt: false };
    } catch (error) {
      console.warn("Stored inventory is unreadable:", error);
      storage.write(`${KEYS.products}-corrupt-backup`, raw);
      return { products: [], seeded: false, corrupt: true };
    }
  }

  function loadThreshold() {
    const raw = storage.read(KEYS.threshold);
    if (raw === null || raw.trim() === "") return DEFAULT_THRESHOLD;
    const value = Number(raw);
    return Number.isInteger(value) && value >= 0 ? value : DEFAULT_THRESHOLD;
  }

  function loadLang() {
    const saved = storage.read(KEYS.lang);
    return saved === "en" || saved === "ar" ? saved : DEFAULT_LANG;
  }

  function saveProducts() {
    const ok = storage.write(KEYS.products, JSON.stringify(state.products));
    if (!ok) showToast(t("toast.saveFail"), "error");
    return ok;
  }

  function findProduct(id) {
    return state.products.find((product) => product.id === id);
  }

  function getStockStatus(product) {
    if (product.quantity === 0) return "out";
    if (product.quantity <= state.threshold) return "low";
    return "in";
  }

  /** Total value is summed in cents to avoid floating point drift. */
  function calculateStats() {
    let units = 0, cents = 0, low = 0, out = 0;
    state.products.forEach((product) => {
      units += product.quantity;
      cents += Math.round(product.price * 100) * product.quantity;
      const status = getStockStatus(product);
      if (status === "low") low += 1;
      if (status === "out") out += 1;
    });
    return { products: state.products.length, units, value: cents / 100, low, out };
  }

  function getAllCategories() {
    const set = new Set(BUILT_IN_CATEGORIES);
    state.products.forEach((product) => set.add(product.category));
    return Array.from(set);
  }

  function categoryLabel(category) {
    const key = `cat.${category}`;
    return Object.prototype.hasOwnProperty.call(translations[state.lang], key) ? t(key) : category;
  }

  /** Reuses an existing category if the typed text matches one (any language, any case). */
  function resolveCategory(text) {
    const wanted = text.trim().toLocaleLowerCase();
    const match = getAllCategories().find((category) => {
      if (category.toLocaleLowerCase() === wanted) return true;
      return Object.keys(translations).some((lang) => (translations[lang][`cat.${category}`] || "").toLocaleLowerCase() === wanted);
    });
    return match || text.trim();
  }

  function addProduct(values) {
    state.products.unshift({ id: createId(), ...values });
  }

  function updateProduct(id, values) {
    const product = findProduct(id);
    if (!product) return false;
    Object.assign(product, values); // updates the existing record, never duplicates
    return true;
  }

  function removeProduct(id) {
    state.products = state.products.filter((product) => product.id !== id);
  }

  /* ============================================================
     5) VALIDATION
     ============================================================ */
  /** Returns { values, errors } where errors maps field -> translation key (+params). */
  function validateProductForm(input, editingId) {
    const errors = {};
    const name = input.name.trim();
    const priceText = input.price.trim();
    const quantityText = input.quantity.trim();
    let category = input.category === NEW_CATEGORY_VALUE ? input.customCategory.trim() : input.category;

    if (!name) errors.name = { key: "err.nameRequired" };
     else if (!/\p{L}/u.test(name)) {
  errors.name = { key: "err.nameMustContainLetter" };
     }else if (name.length > MAX_NAME) errors.name = { key: "err.nameLong", params: { max: MAX_NAME } };
    else {
      const duplicate = state.products.some((p) => p.id !== editingId && p.name.toLocaleLowerCase() === name.toLocaleLowerCase());
      if (duplicate) errors.name = { key: "err.nameDuplicate" };
    }

    if (!category) errors.category = { key: "err.categoryRequired" };
    else if (category.length > MAX_CATEGORY) errors.category = { key: "err.categoryLong", params: { max: MAX_CATEGORY } };
    else if (input.category === NEW_CATEGORY_VALUE) category = resolveCategory(category);

    const price = Number(priceText);
    if (priceText === "" || !Number.isFinite(price) || price < 0 || price > MAX_AMOUNT) errors.price = { key: "err.priceInvalid" };

    const quantity = Number(quantityText);
    if (quantityText === "" || !Number.isInteger(quantity) || quantity < 0 || quantity > MAX_AMOUNT) errors.quantity = { key: "err.quantityInvalid" };

    return { values: { name, category, price: Math.round(price * 100) / 100, quantity }, errors };
  }

  /* ============================================================
     6) TRANSLATION + RENDERING
     ============================================================ */
  function t(key, params) {
    const dictionary = translations[state.lang];
    let text = Object.prototype.hasOwnProperty.call(dictionary, key) ? dictionary[key] : translations.en[key] || key;
    if (params) Object.keys(params).forEach((name) => { text = text.split(`{${name}}`).join(params[name]); });
    return text;
  }

  const numberLocale = () => (state.lang === "ar" ? "ar-MA-u-nu-latn" : "en-US");
  const formatNumber = (value) => new Intl.NumberFormat(numberLocale(), { maximumFractionDigits: 0 }).format(value);
  const formatMoney = (value) =>
    `${new Intl.NumberFormat(numberLocale(), { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value)} ${t("currency.short")}`;

  function setLanguage(lang, { persist = true } = {}) {
    state.lang = lang;
    if (persist) storage.write(KEYS.lang, lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.title = t("meta.title");
    $$("[data-i18n]").forEach((el) => { el.textContent = t(el.dataset.i18n); });
    $$("[data-i18n-placeholder]").forEach((el) => { el.placeholder = t(el.dataset.i18nPlaceholder); });
    $$("[data-i18n-aria-label]").forEach((el) => { el.setAttribute("aria-label", t(el.dataset.i18nAriaLabel)); });
    $$("[data-lang]").forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.lang === lang)));
    renderAll();
  }

  function renderAll() {
    renderCategoryFilter();
    renderStats();
    renderTable();
    renderFormCategoryOptions();
    refreshDialogTexts();
  }

  function renderCategoryFilter() {
    const select = $("#categoryFilter");
    const used = Array.from(new Set(state.products.map((p) => p.category))).sort((a, b) => categoryLabel(a).localeCompare(categoryLabel(b), state.lang));
    // If the selected category no longer exists (e.g. product deleted), fall back to "all".
    if (state.filters.category !== "all" && !used.includes(state.filters.category)) state.filters.category = "all";
    select.replaceChildren(new Option(t("filter.categoryAll"), "all"));
    used.forEach((category) => select.appendChild(new Option(categoryLabel(category), category)));
    select.value = state.filters.category;
  }

  function renderStats() {
    const stats = calculateStats();
    $("#statProducts").textContent = formatNumber(stats.products);
    $("#statUnits").textContent = formatNumber(stats.units);
    $("#statValue").textContent = formatMoney(stats.value);
    $("#statLow").textContent = formatNumber(stats.low);
    $("#statOut").textContent = formatNumber(stats.out);

    const needAttention = stats.low + stats.out;
    $("#alertBanner").hidden = needAttention === 0;
    if (needAttention > 0) {
      $("#alertTitle").textContent = t("banner.title", { n: formatNumber(needAttention) });
      $("#alertText").textContent = t("banner.text", { low: formatNumber(stats.low), out: formatNumber(stats.out), threshold: formatNumber(state.threshold) });
    }
    $("#thresholdInput").value = String(state.threshold);
  }

  function getVisibleProducts() {
    const search = state.filters.search.trim().toLocaleLowerCase();
    return state.products.filter((product) => {
      const status = getStockStatus(product);
      const matchesSearch = product.name.toLocaleLowerCase().includes(search);
      const matchesCategory = state.filters.category === "all" || product.category === state.filters.category;
      const filter = state.filters.status;
      const matchesStatus = filter === "all" || filter === status || (filter === "attention" && status !== "in");
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }

  function createEl(tag, className, text) {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (text !== undefined) el.textContent = text; // textContent keeps user input safe
    return el;
  }

  function createIcon(name) {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("class", "icon");
    svg.setAttribute("aria-hidden", "true");
    const use = document.createElementNS("http://www.w3.org/2000/svg", "use");
    use.setAttribute("href", `#i-${name}`);
    svg.appendChild(use);
    return svg;
  }

  function createActionButton(className, action, id, label, iconName, disabled = false) {
    const button = createEl("button", className);
    button.type = "button";
    button.dataset.action = action;
    button.dataset.id = id;
    button.setAttribute("aria-label", label);
    button.title = label;
    button.disabled = disabled;
    button.appendChild(createIcon(iconName));
    return button;
  }

  function createProductRow(product) {
    const status = getStockStatus(product);
    const row = createEl("tr", status === "low" ? "row-low" : status === "out" ? "row-out" : "");

    row.appendChild(createEl("td")).appendChild(createEl("span", "product-name", product.name));
    row.appendChild(createEl("td")).appendChild(createEl("span", "category-tag", categoryLabel(product.category)));
    row.appendChild(createEl("td", "num", formatMoney(product.price)));

    const quantityCell = createEl("td", "num");
    const stepper = createEl("div", "stock-stepper");
    stepper.append(
      createActionButton("", "dec", product.id, t("row.dec", { name: product.name }), "minus", product.quantity === 0),
      createEl("span", "stock-number", formatNumber(product.quantity)),
      createActionButton("", "inc", product.id, t("row.inc", { name: product.name }), "plus")
    );
    quantityCell.appendChild(stepper);
    row.appendChild(quantityCell);

    row.appendChild(createEl("td", "num", formatMoney(Math.round(product.price * 100) * product.quantity / 100)));

    // Status uses an icon AND text, never colour alone.
    const badge = createEl("span", `stock-badge ${status}`);
    badge.append(createIcon(status === "in" ? "check" : status === "low" ? "alert" : "xcircle"), document.createTextNode(t(`status.${status}`)));
    row.appendChild(createEl("td")).appendChild(badge);

    const actions = createEl("div", "row-actions");
    actions.append(
      createActionButton("icon-button", "edit", product.id, t("row.edit", { name: product.name }), "edit"),
      createActionButton("icon-button delete", "delete", product.id, t("row.delete", { name: product.name }), "trash")
    );
    row.appendChild(createEl("td")).appendChild(actions);
    return row;
  }

  function renderTable() {
    const visible = getVisibleProducts();
    $("#productsBody").replaceChildren(...visible.map(createProductRow));

    const hasProducts = state.products.length > 0;
    $("#emptyState").hidden = visible.length > 0;
    if (visible.length === 0) {
      $("#emptyTitle").textContent = t(hasProducts ? "empty.noMatchTitle" : "empty.noneTitle");
      $("#emptyText").textContent = t(hasProducts ? "empty.noMatchText" : "empty.noneText");
      $("#emptyActions").hidden = hasProducts;
    }
    $("#resultsCount").textContent = t("results.count", { shown: formatNumber(visible.length), total: formatNumber(state.products.length) });
    const filtersActive = state.filters.search.trim() !== "" || state.filters.category !== "all" || state.filters.status !== "all";
    $("#clearFiltersBtn").disabled = !filtersActive;
  }

  /** Rebuilds the form's category <select>, preserving the current choice. */
  function renderFormCategoryOptions(selected) {
    const select = $("#productCategory");
    const current = selected !== undefined ? selected : select.value;
    select.replaceChildren();
    getAllCategories().forEach((category) => select.appendChild(new Option(categoryLabel(category), category)));
    select.appendChild(new Option(t("form.categoryNew"), NEW_CATEGORY_VALUE));
    const exists = Array.from(select.options).some((option) => option.value === current);
    select.value = exists ? current : DEFAULT_CATEGORY;
    toggleCustomCategory();
  }

  function toggleCustomCategory() {
    const isNew = $("#productCategory").value === NEW_CATEGORY_VALUE;
    $("#customCategory").hidden = !isNew;
  }

  /* ============================================================
     7) DIALOGS, FORM ERRORS & TOAST
     ============================================================ */
  let toastTimer = null;
  function showToast(message, type = "success") {
    const toast = $("#toast");
    window.clearTimeout(toastTimer);
    toast.textContent = message;
    toast.classList.toggle("error", type === "error");
    toast.classList.add("show");
    toastTimer = window.setTimeout(() => toast.classList.remove("show"), 3500);
  }

  const FIELD_MAP = {
    name: { input: "#productName", error: "#nameError" },
    category: { input: "#productCategory", error: "#categoryError" },
    price: { input: "#productPrice", error: "#priceError" },
    quantity: { input: "#productQuantity", error: "#quantityError" }
  };

  function clearFormErrors() {
    Object.values(FIELD_MAP).forEach(({ input, error }) => {
      $(input).removeAttribute("aria-invalid");
      $(error).textContent = "";
    });
    $("#customCategory").removeAttribute("aria-invalid");
    $("#formNotice").hidden = true;
  }

  function showFormErrors(errors) {
    clearFormErrors();
    let firstInvalid = null;
    Object.keys(FIELD_MAP).forEach((field) => {
      if (!errors[field]) return;
      const { input, error } = FIELD_MAP[field];
      let target = $(input);
      if (field === "category" && !$("#customCategory").hidden) target = $("#customCategory");
      target.setAttribute("aria-invalid", "true");
      $(error).textContent = t(errors[field].key, errors[field].params);
      if (!firstInvalid) firstInvalid = target;
    });
    if (firstInvalid) firstInvalid.focus();
  }

  /** Titles/buttons set from JS must follow the language too. */
  function refreshDialogTexts() {
    const editing = $("#productId").value !== "";
    $("#dialogTitle").textContent = t(editing ? "form.editTitle" : "form.addTitle");
    $("#saveProductBtn").textContent = t(editing ? "form.saveEdit" : "form.saveAdd");
    if (state.confirmAction) {
      const { title, text, button } = state.confirmAction;
      $("#confirmTitle").textContent = t(title.key, title.params);
      $("#confirmText").textContent = t(text.key, text.params);
      $("#confirmOkBtn").textContent = t(button);
    }
  }

  function openProductDialog(productId) {
    const form = $("#productForm");
    form.reset();
    clearFormErrors();
    const product = productId ? findProduct(productId) : null;
    if (productId && !product) { showToast(t("err.notFound"), "error"); return; }

    $("#productId").value = product ? product.id : "";
    $("#productName").value = product ? product.name : "";
    $("#productPrice").value = product ? String(product.price) : "";
    $("#productQuantity").value = product ? String(product.quantity) : "";
    $("#customCategory").value = "";
    renderFormCategoryOptions(product ? product.category : DEFAULT_CATEGORY);
    refreshDialogTexts();
    $("#productDialog").showModal();
    $("#productName").focus();
  }

  function closeProductDialog() {
    $("#productDialog").close();
  }

  function openConfirm({ title, text, button, onConfirm }) {
    state.confirmAction = { title, text, button, onConfirm };
    refreshDialogTexts();
    $("#confirmDialog").showModal();
  }

  function closeConfirm() {
    state.confirmAction = null;
    if ($("#confirmDialog").open) $("#confirmDialog").close();
  }

  /* ============================================================
     8) EVENT HANDLERS
     ============================================================ */
  function handleProductSubmit(event) {
    event.preventDefault();
    const editingId = $("#productId").value;
    const { values, errors } = validateProductForm({
      name: $("#productName").value,
      category: $("#productCategory").value,
      customCategory: $("#customCategory").value,
      price: $("#productPrice").value,
      quantity: $("#productQuantity").value
    }, editingId);

    if (Object.keys(errors).length > 0) { showFormErrors(errors); return; } // invalid form never touches inventory

    if (editingId) {
      if (!updateProduct(editingId, values)) {
        $("#formNotice").textContent = t("err.notFound");
        $("#formNotice").hidden = false;
        return;
      }
    }
     else {
      addProduct(values);
    }
    saveProducts();
    closeProductDialog();
    renderAll();
    showToast(t(editingId ? "toast.updated" : "toast.added"));
  }

  function changeQuantity(id, amount) {
    const product = findProduct(id);
    if (!product) return;
    const next = product.quantity + amount;
    if (next < 0) { showToast(t("toast.qtyMin"), "error"); return; }
    if (next > MAX_AMOUNT) return;
    product.quantity = next;
    saveProducts();
    renderAll();
    showToast(t(amount > 0 ? "toast.qtyUp" : "toast.qtyDown"));
  }

  function askDeleteProduct(id) {
    const product = findProduct(id);
    if (!product) return;
    openConfirm({
      title: { key: "confirm.deleteTitle" },
      text: { key: "confirm.deleteText", params: { name: product.name } },
      button: "confirm.deleteBtn",
      onConfirm: () => {
        removeProduct(id);
        saveProducts();
        renderAll();
        showToast(t("toast.deleted", { name: product.name }));
      }
    });
  }

  function handleTableClick(event) {
    const button = event.target.closest("button[data-action]");
    if (!button) return;
    const { action, id } = button.dataset;
    if (action === "edit") openProductDialog(id);
    else if (action === "delete") askDeleteProduct(id);
    else if (action === "inc") changeQuantity(id, 1);
    else if (action === "dec") changeQuantity(id, -1);
  }

  function handleThresholdChange(event) {
    const input = event.target;
    const value = Number(input.value);
    if (input.value.trim() === "" || !Number.isInteger(value) || value < 0 || value > MAX_AMOUNT) {
      input.value = String(state.threshold);
      showToast(t("err.thresholdInvalid"), "error");
      return;
    }
    state.threshold = value;
    storage.write(KEYS.threshold, String(value));
    renderAll();
    showToast(t("toast.threshold"));
  }

  function clearFilters() {
    state.filters = { search: "", category: "all", status: "all" };
    $("#searchInput").value = "";
    $("#statusFilter").value = "all";
    renderCategoryFilter();
    renderTable();
  }

  function showAttentionProducts() {
    state.filters = { search: "", category: "all", status: "attention" };
    $("#searchInput").value = "";
    $("#statusFilter").value = "attention";
    renderCategoryFilter();
    renderTable();
    $("#inventory").scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function askLoadSample() {
    const apply = () => {
      state.products = createSampleProducts();
      saveProducts();
      renderAll();
      showToast(t("toast.sample"));
    };
    if (state.products.length === 0) { apply(); return; } // nothing to overwrite, no confirmation needed
    openConfirm({ title: { key: "confirm.sampleTitle" }, text: { key: "confirm.sampleText" }, button: "confirm.sampleBtn", onConfirm: apply });
  }

  function askReset() {
    openConfirm({
      title: { key: "confirm.resetTitle" },
      text: { key: "confirm.resetText" },
      button: "confirm.resetBtn",
      onConfirm: () => {
        state.products = [];
        clearFilters();
        saveProducts(); // saves "[]" so sample data is not re-created on the next visit
        renderAll();
        showToast(t("toast.reset"));
      }
    });
  }

  /** CSV cells starting with = + - @ could run as formulas in Excel, so they are neutralised. */
  function csvCell(value) {
    let text = String(value);
    if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
    return `"${text.replace(/"/g, '""')}"`;
  }

  function exportCsv() {
    if (state.products.length === 0) { showToast(t("toast.exportEmpty"), "error"); return; }
    const headers = [t("csv.id"), t("th.product"), t("th.category"), `${t("th.price")} (MAD)`, t("th.quantity"), `${t("th.value")} (MAD)`, t("th.status")];
    const rows = state.products.map((p) => [
      p.id, p.name, categoryLabel(p.category), p.price.toFixed(2), p.quantity,
      (Math.round(p.price * 100) * p.quantity / 100).toFixed(2), t(`status.${getStockStatus(p)}`)
    ]);
    const csv = "﻿" + [headers, ...rows].map((row) => row.map(csvCell).join(",")).join("\r\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "stockflow-inventory.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    showToast(t("toast.exported"));
  }

  /* ---------- Navigation (landing page <-> inventory app, via URL hash) ---------- */
  function closeMenu() {
    $("#siteNav").classList.remove("open");
    $("#menuToggle").setAttribute("aria-expanded", "false");
  }

  function route() {
    const hash = window.location.hash;
    const view = hash === "#app" ? "app" : "home";
    $("#homeView").hidden = view !== "home";
    $("#appView").hidden = view !== "app";
    document.body.dataset.view = view;
    $$("[data-nav]").forEach((link) => {
      const active = link.dataset.nav === (hash === "#features" ? "features" : view);
      if (active) link.setAttribute("aria-current", "page"); else link.removeAttribute("aria-current");
    });
    closeMenu();
    if (hash === "#features") $("#features").scrollIntoView(); else window.scrollTo(0, 0);
  }

  function bindEvents() {
    $("#productForm").addEventListener("submit", handleProductSubmit);
    $("#openAddBtn").addEventListener("click", () => openProductDialog());
    $("#emptyAddBtn").addEventListener("click", () => openProductDialog());
    $("#emptySampleBtn").addEventListener("click", askLoadSample);
    $("#sampleBtn").addEventListener("click", askLoadSample);
    $("#resetBtn").addEventListener("click", askReset);
    $("#exportBtn").addEventListener("click", exportCsv);
    $("#closeDialogBtn").addEventListener("click", closeProductDialog);
    $("#cancelDialogBtn").addEventListener("click", closeProductDialog);
    $("#productCategory").addEventListener("change", () => { toggleCustomCategory(); if (!$("#customCategory").hidden) $("#customCategory").focus(); });
    $("#productsBody").addEventListener("click", handleTableClick); // event delegation

    $("#searchInput").addEventListener("input", (e) => { state.filters.search = e.target.value; renderTable(); });
    $("#categoryFilter").addEventListener("change", (e) => { state.filters.category = e.target.value; renderTable(); });
    $("#statusFilter").addEventListener("change", (e) => { state.filters.status = e.target.value; renderTable(); });
    $("#clearFiltersBtn").addEventListener("click", clearFilters);
    $("#showAttentionBtn").addEventListener("click", showAttentionProducts);
    $("#thresholdInput").addEventListener("change", handleThresholdChange);

    $("#confirmCancelBtn").addEventListener("click", closeConfirm);
    $("#confirmOkBtn").addEventListener("click", () => {
      const action = state.confirmAction;
      closeConfirm();
      if (action) action.onConfirm();
    });
    // Closing with Esc also clears the pending action.
    $("#confirmDialog").addEventListener("close", () => { state.confirmAction = null; });
    // Click on the backdrop closes the dialogs.
    $("#productDialog").addEventListener("click", (e) => { if (e.target === e.currentTarget) closeProductDialog(); });
    $("#confirmDialog").addEventListener("click", (e) => { if (e.target === e.currentTarget) closeConfirm(); });

    $$("[data-lang]").forEach((button) => button.addEventListener("click", () => setLanguage(button.dataset.lang)));
    $("#menuToggle").addEventListener("click", () => {
      const open = $("#siteNav").classList.toggle("open");
      $("#menuToggle").setAttribute("aria-expanded", String(open));
    });
    window.addEventListener("hashchange", route);
    // Unexpected errors should be visible, not silent.
    window.addEventListener("error", (event) => { console.error(event.error || event.message); showToast(t("err.unexpected"), "error"); });
  }

  /* ============================================================
     9) INIT
     ============================================================ */
  function init() {
    const loaded = loadProducts();
    state.products = loaded.products;
    state.threshold = loadThreshold();
    if (loaded.seeded) saveProducts(); // first run only: persist the sample products
    bindEvents();
    setLanguage(loadLang(), { persist: false });
    route();
    if (loaded.corrupt) showToast(t("toast.corrupt"), "error");
  }

  init();
})();
