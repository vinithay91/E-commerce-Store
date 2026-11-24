const API = "/api";
let allProducts = [];
let activeCategory = "All";

function money(value) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(Number(value));
}
function showToast(message) {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2600);
}
async function api(path, options = {}) {
  const response = await fetch(`${API}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || "Something went wrong.");
  return data;
}
function getCart() {
  try { return JSON.parse(localStorage.getItem("shopease-cart") || "[]"); }
  catch { return []; }
}
function saveCart(cart) {
  localStorage.setItem("shopease-cart", JSON.stringify(cart));
  updateCartCount();
}
function updateCartCount() {
  const count = getCart().reduce((sum, item) => sum + item.quantity, 0);
  document.querySelectorAll("#cart-count").forEach(el => el.textContent = count);
}
async function updateAccountArea() {
  const area = document.getElementById("account-area");
  if (!area) return;
  try {
    const { user } = await api("/auth/me");
    if (user) {
      area.innerHTML = `<span class="welcome-user">Hi, ${escapeHtml(user.name.split(" ")[0])}</span> <button class="btn btn-outline btn-small" id="logout-btn">Log out</button>`;
      document.getElementById("logout-btn").addEventListener("click", async () => {
        try { await api("/auth/logout", { method: "POST" }); showToast("Logged out successfully."); setTimeout(() => location.reload(), 500); }
        catch (e) { showToast(e.message); }
      });
    }
  } catch { /* keep guest navigation */ }
}
function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[char]));
}
function productCard(product) {
  return `<article class="product-card">
    <a class="product-image" href="product.html?id=${product.id}"><img src="${escapeHtml(product.image || "")}" alt="${escapeHtml(product.name)}" loading="lazy"><span class="product-category">${escapeHtml(product.category || "Find")}</span></a>
    <div class="product-info"><div><h3><a href="product.html?id=${product.id}">${escapeHtml(product.name)}</a></h3><p>${escapeHtml(product.description || "")}</p></div>
    <div class="product-bottom"><strong>${money(product.price)}</strong><button class="add-button" data-add="${product.id}" aria-label="Add ${escapeHtml(product.name)} to cart">+</button></div></div>
  </article>`;
}
async function loadProducts() {
  const grid = document.getElementById("product-grid");
  if (!grid) return;
  try {
    const params = new URLSearchParams();
    const search = document.getElementById("search-input")?.value.trim();
    if (search) params.set("search", search);
    if (activeCategory !== "All") params.set("category", activeCategory);
    const { products } = await api(`/products?${params}`);
    allProducts = products;
    grid.innerHTML = products.length ? products.map(productCard).join("") : `<div class="empty-state"><span>🌼</span><h3>No finds just yet</h3><p>Try another search or category.</p></div>`;
    grid.querySelectorAll("[data-add]").forEach(button => button.addEventListener("click", () => addToCart(Number(button.dataset.add))));
  } catch (error) {
    grid.innerHTML = `<div class="empty-state"><h3>We couldn't load the collection</h3><p>${escapeHtml(error.message)}</p><p>Check that the server and MySQL are running.</p></div>`;
  }
}
function addToCart(id) {
  const product = allProducts.find(item => Number(item.id) === id);
  if (!product) return;
  const cart = getCart();
  const existing = cart.find(item => item.productId === id);
  if (existing) existing.quantity += 1;
  else cart.push({ productId: id, quantity: 1, name: product.name, price: Number(product.price), image: product.image });
  saveCart(cart);
  showToast(`${product.name} added to your cart 💛`);
}
async function loadProductDetail() {
  const container = document.getElementById("product-detail");
  if (!container) return;
  const id = new URLSearchParams(location.search).get("id");
  if (!id) { container.innerHTML = `<div class="empty-state">No product selected.</div>`; return; }
  try {
    const { product } = await api(`/products/${encodeURIComponent(id)}`);
    container.innerHTML = `<div class="detail-image"><img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.name)}"></div><div class="detail-copy"><span class="eyebrow">${escapeHtml(product.category || "SHOP THE FIND")}</span><h1>${escapeHtml(product.name)}</h1><div class="detail-price">${money(product.price)}</div><p>${escapeHtml(product.description || "")}</p><p class="stock-note">${product.stock > 0 ? `✓ ${product.stock} available` : "Currently out of stock"}</p><button class="btn btn-primary" id="detail-add" ${product.stock < 1 ? "disabled" : ""}>Add to cart <span>→</span></button></div>`;
    document.getElementById("detail-add")?.addEventListener("click", () => {
      const cart = getCart();
      const existing = cart.find(item => item.productId === Number(product.id));
      if (existing) existing.quantity += 1;
      else cart.push({ productId: Number(product.id), quantity: 1, name: product.name, price: Number(product.price), image: product.image });
      saveCart(cart); showToast("Added to your cart 💛");
    });
  } catch (error) { container.innerHTML = `<div class="empty-state">${escapeHtml(error.message)}</div>`; }
}
function renderCart() {
  const container = document.getElementById("cart-content");
  if (!container) return;
  const cart = getCart();
  if (!cart.length) {
    container.innerHTML = `<div class="empty-state cart-empty"><span>🛍️</span><h2>Your cart is taking a little break.</h2><p>There are plenty of lovely finds waiting for you.</p><a class="btn btn-primary" href="/#shop">Explore the shop</a></div>`;
    return;
  }
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  container.innerHTML = `<div class="cart-layout"><section class="cart-items">${cart.map(item => `<article class="cart-item"><img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.name)}"><div class="cart-item-info"><h3>${escapeHtml(item.name)}</h3><strong>${money(item.price)}</strong><div class="quantity-control"><button data-minus="${item.productId}">−</button><span>${item.quantity}</span><button data-plus="${item.productId}">+</button><button class="remove-link" data-remove="${item.productId}">Remove</button></div></div><b>${money(item.price * item.quantity)}</b></article>`).join("")}</section><aside class="cart-summary"><h2>Order summary</h2><div class="summary-line"><span>Subtotal</span><b>${money(total)}</b></div><div class="summary-line"><span>Delivery</span><b>${total >= 2000 ? "FREE" : money(99)}</b></div><div class="summary-total"><span>Total</span><strong>${money(total + (total >= 2000 ? 0 : 99))}</strong></div><label class="address-label" for="delivery-address">Delivery address</label><textarea id="delivery-address" placeholder="House no., street, city, PIN code"></textarea><button class="btn btn-primary btn-full" id="checkout-btn">Place order <span>→</span></button><p class="secure-note">🔒 Your order details are handled securely.</p></aside></div>`;
  container.querySelectorAll("[data-minus]").forEach(b => b.addEventListener("click", () => changeQuantity(Number(b.dataset.minus), -1)));
  container.querySelectorAll("[data-plus]").forEach(b => b.addEventListener("click", () => changeQuantity(Number(b.dataset.plus), 1)));
  container.querySelectorAll("[data-remove]").forEach(b => b.addEventListener("click", () => { saveCart(getCart().filter(i => i.productId !== Number(b.dataset.remove))); renderCart(); }));
  document.getElementById("checkout-btn").addEventListener("click", checkout);
}
function changeQuantity(id, change) {
  const cart = getCart();
  const item = cart.find(i => i.productId === id);
  if (item) item.quantity += change;
  saveCart(cart.filter(i => i.quantity > 0));
  renderCart();
}
async function checkout() {
  const address = document.getElementById("delivery-address").value.trim();
  if (!address) return showToast("Please enter your delivery address.");
  const button = document.getElementById("checkout-btn");
  button.disabled = true;
  try {
    const result = await api("/orders", { method: "POST", body: JSON.stringify({ items: getCart().map(({ productId, quantity }) => ({ productId, quantity })), address }) });
    localStorage.removeItem("shopease-cart");
    updateCartCount();
    document.getElementById("cart-content").innerHTML = `<div class="success-state"><span>🎉</span><h2>Your order is on its way!</h2><p>Order #${result.orderId} has been placed successfully.</p><a class="btn btn-primary" href="/">Continue shopping</a></div>`;
  } catch (error) {
    if (error.message.toLowerCase().includes("log in")) location.href = "login.html?next=cart.html";
    else showToast(error.message);
    button.disabled = false;
  }
}
document.addEventListener("DOMContentLoaded", () => {
  updateCartCount();
  updateAccountArea();
  document.getElementById("year") && (document.getElementById("year").textContent = new Date().getFullYear());
  loadProducts();
  loadProductDetail();
  renderCart();
  document.getElementById("search-input")?.addEventListener("input", loadProducts);
  document.getElementById("category-row")?.querySelectorAll("button").forEach(button => button.addEventListener("click", () => {
    activeCategory = button.dataset.category;
    document.querySelectorAll(".category-chip").forEach(chip => chip.classList.toggle("selected", chip === button));
    loadProducts();
  }));
});
