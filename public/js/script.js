const STORAGE_KEY = "stockflow-products-v1";
const THRESHOLD_KEY = "stockflow-low-stock-threshold-v1";

const productsTableBody = document.querySelector("#productsTableBody");
const totalProducts = document.querySelector("#totalProducts");
const totalUnits = document.querySelector("#totalUnits");
const lowStockCount = document.querySelector("#lowStockCount");
const inventoryValue = document.querySelector("#inventoryValue");
const lowStockBanner = document.querySelector("#lowStockBanner");
const lowStockBannerTitle = document.querySelector("#lowStockBannerTitle");
const lowStockBannerText = document.querySelector("#lowStockBannerText");
const showLowStockBtn = document.querySelector("#showLowStockBtn");
const searchInput = document.querySelector("#searchInput");
const stockFilter = document.querySelector("#stockFilter");
const thresholdInput = document.querySelector("#thresholdInput");
const resultsCount = document.querySelector("#resultsCount");
const emptyState = document.querySelector("#emptyState");
const emptyTitle = document.querySelector("#emptyTitle");
const emptyText = document.querySelector("#emptyText");
const productDialog = document.querySelector("#productDialog");
const productForm = document.querySelector("#productForm");
const productIdInput = document.querySelector("#productId");
const productNameInput = document.querySelector("#productName");
const productPriceInput = document.querySelector("#productPrice");
const productQuantityInput = document.querySelector("#productQuantity");
const dialogTitle = document.querySelector("#dialogTitle");
const saveProductBtn = document.querySelector("#saveProductBtn");
const formNotice = document.querySelector("#formNotice");
const confirmDialog = document.querySelector("#confirmDialog");
const confirmText = document.querySelector("#confirmText");
const toast = document.querySelector("#toast");

let products = loadProducts();
let lowStockThreshold = loadThreshold();
let pendingDeleteId = null;
let toastTimeout = null;

const currencyFormatter = new Intl.NumberFormat("fr-MA", {
  style: "currency",
  currency: "MAD",
  maximumFractionDigits: 2
});
const numberFormatter = new Intl.NumberFormat("fr-MA", {
  maximumFractionDigits: 0
});

function loadProducts() {
  try {
    const savedProducts = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    if (!Array.isArray(savedProducts)) return [];
    return savedProducts.filter((product) =>
      product &&
      (typeof product.id === "string" || typeof product.id === "number") &&
      typeof product.name === "string" &&
      Number.isFinite(product.price) && product.price >= 0 &&
      Number.isInteger(product.quantity) && product.quantity >= 0
    );
  } catch (error) {
    console.warn("تعذر تحميل بيانات المخزون:", error);
    return [];
  }
}

function loadThreshold() {
  const savedThreshold = Number(localStorage.getItem(THRESHOLD_KEY));
  return Number.isInteger(savedThreshold) && savedThreshold >= 0 ? savedThreshold : 5;
}

function saveProducts() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
    return true;
  } catch (error) {
    showToast("تعذر حفظ البيانات في المتصفح. تحقق من مساحة التخزين.", "error");
    console.error("تعذر حفظ بيانات المخزون:", error);
    return false;
  }
}

function saveThreshold() {
  try {
    localStorage.setItem(THRESHOLD_KEY, String(lowStockThreshold));
  } catch (error) {
    showToast("تعذر حفظ حد التنبيه في المتصفح.", "error");
  }
}

function formatCurrency(value) {
  return currencyFormatter.format(value);
}

function formatNumber(value) {
  return numberFormatter.format(value);
}

function getStockStatus(product) {
  if (product.quantity === 0) return { key: "out", label: "نفد المخزون" };
  if (product.quantity <= lowStockThreshold) return { key: "low", label: "مخزون منخفض" };
  return { key: "in", label: "متوفر" };
}

function createElement(tagName, className, text) {
  const element = document.createElement(tagName);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}

function renderProducts() {
  const searchTerm = searchInput.value.trim().toLocaleLowerCase();
  const filterValue = stockFilter.value;

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLocaleLowerCase().includes(searchTerm);
    const status = getStockStatus(product).key;
    const matchesFilter = filterValue === "all" || status === filterValue || (filterValue === "attention" && status !== "in");
    return matchesSearch && matchesFilter;
  });

  productsTableBody.replaceChildren();

  filteredProducts.forEach((product) => {
    productsTableBody.appendChild(createProductRow(product));
  });

  const noProductsAtAll = products.length === 0;
  const noFilteredResults = products.length > 0 && filteredProducts.length === 0;
  emptyState.hidden = filteredProducts.length > 0;
  if (noProductsAtAll) {
    emptyTitle.textContent = "لا توجد منتجات بعد";
    emptyText.textContent = "أضف أول منتج لتبدأ في إدارة مخزون متجرك.";
    document.querySelector("#emptyAddBtn").hidden = false;
  } else if (noFilteredResults) {
    emptyTitle.textContent = "لا توجد نتائج مطابقة";
    emptyText.textContent = "جرّب تغيير كلمات البحث أو اختيار حالة مخزون أخرى.";
    document.querySelector("#emptyAddBtn").hidden = true;
  }

  resultsCount.textContent = `عرض ${formatNumber(filteredProducts.length)} من ${formatNumber(products.length)} منتج`;
  updateStatistics();
}

function createProductRow(product) {
  const row = document.createElement("tr");
  const productCell = createElement("td");
  const productInfo = createElement("div", "product-cell");
  const avatar = createElement("span", "product-avatar", product.name.trim().charAt(0).toLocaleUpperCase() || "?");
  avatar.setAttribute("aria-hidden", "true");
  const productText = createElement("div");
  const productName = createElement("span", "product-name", product.name);
  const productId = createElement("span", "product-id", `ID: ${String(product.id).slice(-8)}`);
  productText.append(productName, productId);
  productInfo.append(avatar, productText);
  productCell.appendChild(productInfo);

  const priceCell = createElement("td", "numeric", formatCurrency(product.price));
  const quantityCell = createElement("td");
  const quantityControl = createElement("div", "quantity-cell");
  const stepper = createElement("div", "stock-stepper");
  const decreaseButton = createElement("button", "", "−");
  decreaseButton.type = "button";
  decreaseButton.setAttribute("aria-label", `إنقاص كمية ${product.name}`);
  decreaseButton.disabled = product.quantity === 0;
  decreaseButton.addEventListener("click", () => changeQuantity(product.id, -1));

  const quantityNumber = createElement("span", "stock-number", formatNumber(product.quantity));
  const increaseButton = createElement("button", "", "+");
  increaseButton.type = "button";
  increaseButton.setAttribute("aria-label", `زيادة كمية ${product.name}`);
  increaseButton.addEventListener("click", () => changeQuantity(product.id, 1));
  stepper.append(decreaseButton, quantityNumber, increaseButton);
  quantityControl.appendChild(stepper);
  quantityCell.appendChild(quantityControl);

  const valueCell = createElement("td", "numeric", formatCurrency(product.price * product.quantity));
  const statusCell = createElement("td");
  const status = getStockStatus(product);
  statusCell.appendChild(createElement("span", `stock-badge ${status.key}`, status.label));

  const actionsCell = createElement("td");
  const actions = createElement("div", "row-actions");
  const editButton = createElement("button", "icon-button", "✎");
  editButton.type = "button";
  editButton.title = "تعديل المنتج";
  editButton.setAttribute("aria-label", `تعديل ${product.name}`);
  editButton.addEventListener("click", () => openEditDialog(product.id));
  const deleteButton = createElement("button", "icon-button delete", "⌫");
  deleteButton.type = "button";
  deleteButton.title = "حذف المنتج";
  deleteButton.setAttribute("aria-label", `حذف ${product.name}`);
  deleteButton.addEventListener("click", () => openDeleteDialog(product.id));
  actions.append(editButton, deleteButton);
  actionsCell.appendChild(actions);

  row.append(productCell, priceCell, quantityCell, valueCell, statusCell, actionsCell);
  return row;
}

function updateStatistics() {
  const units = products.reduce((sum, product) => sum + product.quantity, 0);
  const value = products.reduce((sum, product) => sum + product.price * product.quantity, 0);
  const lowProducts = products.filter((product) => product.quantity > 0 && product.quantity <= lowStockThreshold);
  const outOfStock = products.filter((product) => product.quantity === 0);

  totalProducts.textContent = formatNumber(products.length);
  totalUnits.textContent = formatNumber(units);
  lowStockCount.textContent = formatNumber(lowProducts.length + outOfStock.length);
  inventoryValue.textContent = formatCurrency(value);

  const needsAttention = lowProducts.length + outOfStock.length;
  lowStockBanner.hidden = needsAttention === 0;
  if (needsAttention > 0) {
    lowStockBannerTitle.textContent = `${formatNumber(needsAttention)} منتج بحاجة إلى الانتباه`;
    lowStockBannerText.textContent =
      `${formatNumber(lowProducts.length)} مخزونها منخفض و${formatNumber(outOfStock.length)} نفد من مخزونها. حد التنبيه الحالي ${formatNumber(lowStockThreshold)} وحدات.`;
  }
}

function changeQuantity(productId, amount) {
  const product = products.find((item) => item.id === productId);
  if (!product) return;
  const nextQuantity = product.quantity + amount;
  if (nextQuantity < 0) {
    showToast("لا يمكن أن تصبح الكمية أقل من صفر.", "error");
    return;
  }
  product.quantity = nextQuantity;
  saveProducts();
  renderProducts();
  showToast(amount > 0 ? "تمت زيادة كمية المنتج." : "تم إنقاص كمية المنتج.");
}

function openAddDialog() {
  productForm.reset();
  productIdInput.value = "";
  dialogTitle.textContent = "إضافة منتج جديد";
  saveProductBtn.textContent = "حفظ المنتج";
  clearFormErrors();
  formNotice.hidden = true;
  productDialog.showModal();
  productNameInput.focus();
}

function openEditDialog(productId) {
  const product = products.find((item) => item.id === productId);
  if (!product) return;
  productForm.reset();
  productIdInput.value = String(product.id);
  productNameInput.value = product.name;
  productPriceInput.value = String(product.price);
  productQuantityInput.value = String(product.quantity);
  dialogTitle.textContent = "تعديل بيانات المنتج";
  saveProductBtn.textContent = "حفظ التعديلات";
  clearFormErrors();
  formNotice.hidden = true;
  productDialog.showModal();
  productNameInput.focus();
}

function closeProductDialog() {
  productDialog.close();
  productForm.reset();
  clearFormErrors();
  formNotice.hidden = true;
}

function clearFormErrors() {
  document.querySelector("#nameError").textContent = "";
  document.querySelector("#priceError").textContent = "";
  document.querySelector("#quantityError").textContent = "";
  [productNameInput, productPriceInput, productQuantityInput].forEach((input) => {
    input.removeAttribute("aria-invalid");
  });
}

function validateProduct() {
  clearFormErrors();
  formNotice.hidden = true;
  let isValid = true;
  const name = productNameInput.value.trim();
  const priceText = productPriceInput.value.trim();
  const quantityText = productQuantityInput.value.trim();
  const price = Number(priceText);
  const quantity = Number(quantityText);

  if (!name) {
    document.querySelector("#nameError").textContent = "يرجى إدخال اسم المنتج.";
    productNameInput.setAttribute("aria-invalid", "true");
    isValid = false;
  } else if (name.length > 80) {
    document.querySelector("#nameError").textContent = "يجب ألا يتجاوز الاسم 80 حرفاً.";
    productNameInput.setAttribute("aria-invalid", "true");
    isValid = false;
  }

  if (priceText === "" || !Number.isFinite(price) || price < 0) {
    document.querySelector("#priceError").textContent = "أدخل سعراً صحيحاً يساوي صفراً أو أكثر.";
    productPriceInput.setAttribute("aria-invalid", "true");
    isValid = false;
  }

  if (quantityText === "" || !Number.isFinite(quantity) || !Number.isInteger(quantity) || quantity < 0) {
    document.querySelector("#quantityError").textContent = "أدخل كمية صحيحة كاملة تساوي صفراً أو أكثر.";
    productQuantityInput.setAttribute("aria-invalid", "true");
    isValid = false;
  }

  const currentId = productIdInput.value;
  const duplicate = products.some((product) =>
    product.name.toLocaleLowerCase() === name.toLocaleLowerCase() &&
    String(product.id) !== currentId
  );
  if (name && duplicate) {
    document.querySelector("#nameError").textContent = "يوجد منتج بهذا الاسم بالفعل.";
    productNameInput.setAttribute("aria-invalid", "true");
    isValid = false;
  }

  return isValid ? { name, price, quantity } : null;
}

productForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const values = validateProduct();
  if (!values) return;

  const currentId = productIdInput.value;
  if (currentId) {
    const product = products.find((item) => String(item.id) === currentId);
    if (!product) {
      formNotice.textContent = "لم يتم العثور على المنتج المطلوب تعديله.";
      formNotice.hidden = false;
      return;
    }
    product.name = values.name;
    product.price = values.price;
    product.quantity = values.quantity;
    saveProducts();
    closeProductDialog();
    renderProducts();
    showToast("تم تحديث بيانات المنتج بنجاح.");
    return;
  }

  const newProduct = {
    id: createProductId(),
    name: values.name,
    price: values.price,
    quantity: values.quantity
  };
  products.unshift(newProduct);
  saveProducts();
  closeProductDialog();
  renderProducts();
  showToast("تمت إضافة المنتج بنجاح.");
});

function createProductId() {
  if (window.crypto && typeof window.crypto.randomUUID === "function") {
    return window.crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function openDeleteDialog(productId) {
  const product = products.find((item) => item.id === productId);
  if (!product) return;
  pendingDeleteId = productId;
  confirmText.textContent = `هل تريد حذف «${product.name}» من المخزون؟ لا يمكن التراجع عن هذا الإجراء.`;
  confirmDialog.showModal();
}

function deleteProduct() {
  if (pendingDeleteId === null) return;
  const product = products.find((item) => item.id === pendingDeleteId);
  products = products.filter((item) => item.id !== pendingDeleteId);
  saveProducts();
  pendingDeleteId = null;
  confirmDialog.close();
  renderProducts();
  showToast(product ? `تم حذف «${product.name}».` : "تم حذف المنتج.");
}

function showToast(message, type = "success") {
  window.clearTimeout(toastTimeout);
  toast.textContent = message;
  toast.classList.toggle("error", type === "error");
  toast.classList.add("show");
  toastTimeout = window.setTimeout(() => toast.classList.remove("show"), 3000);
}

function exportCsv() {
  if (products.length === 0) {
    showToast("لا توجد منتجات لتصديرها.", "error");
    return;
  }
  const headers = ["ID", "Product", "Unit Price (MAD)", "Quantity", "Stock Value (MAD)", "Status"];
  const rows = products.map((product) => [
    product.id,
    product.name,
    product.price,
    product.quantity,
    (product.price * product.quantity).toFixed(2),
    getStockStatus(product).label
  ]);
  const escapeCsv = (value) => `"${String(value).replace(/"/g, '""')}"`;
  const csv = "\uFEFF" + [headers, ...rows].map((row) => row.map(escapeCsv).join(",")).join("\r\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "stockflow-inventory.csv";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  showToast("تم تجهيز ملف CSV للتنزيل.");
}

document.querySelector("#openAddBtn").addEventListener("click", openAddDialog);
document.querySelector("#emptyAddBtn").addEventListener("click", openAddDialog);
document.querySelector("#closeDialogBtn").addEventListener("click", closeProductDialog);
document.querySelector("#cancelDialogBtn").addEventListener("click", closeProductDialog);
document.querySelector("#cancelDeleteBtn").addEventListener("click", () => {
  pendingDeleteId = null;
  confirmDialog.close();
});
document.querySelector("#confirmDeleteBtn").addEventListener("click", deleteProduct);
document.querySelector("#exportBtn").addEventListener("click", exportCsv);
searchInput.addEventListener("input", renderProducts);
stockFilter.addEventListener("change", renderProducts);
showLowStockBtn.addEventListener("click", () => {
  searchInput.value = "";
  stockFilter.value = "attention";
  renderProducts();
  document.querySelector("#inventory").scrollIntoView({ behavior: "smooth", block: "start" });
});
thresholdInput.addEventListener("change", () => {
  const value = Number(thresholdInput.value);
  if (thresholdInput.value.trim() === "" || !Number.isInteger(value) || value < 0) {
    thresholdInput.value = String(lowStockThreshold);
    showToast("يجب أن يكون حد التنبيه عدداً صحيحاً غير سالب.", "error");
    return;
  }
  lowStockThreshold = value;
  saveThreshold();
  renderProducts();
  showToast("تم تحديث حد تنبيه المخزون.");
});

productDialog.addEventListener("click", (event) => {
  if (event.target === productDialog) closeProductDialog();
});
confirmDialog.addEventListener("click", (event) => {
  if (event.target === confirmDialog) {
    pendingDeleteId = null;
    confirmDialog.close();
  }
});

const today = new Intl.DateTimeFormat("ar-MA", { day: "numeric", month: "long", year: "numeric" });
document.querySelector("#todayLabel").textContent = today.format(new Date());

thresholdInput.value = String(lowStockThreshold);
renderProducts();
// Start coding here
