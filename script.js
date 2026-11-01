/* ==========================================================
   EEYO Collections — shared script
   One source of truth for: header/footer, product data, cart,
   shop filters, product page, checkout and forms.
   ========================================================== */
(() => {
  "use strict";

  /* ---------- Helpers ---------- */
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const naira = (n) => "\u20a6" + Number(n).toLocaleString("en-NG");
  const imgSrc = (path) => encodeURI(path); // handles filenames with spaces
  const esc = (s) =>
    String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  /* ---------- Config ---------- */
  const CART_KEY = "crownwears_cart_v2";
  const DELIVERY_FEE = 2000;
  const FREE_DELIVERY_MIN = 50000;
  const SIZES = ["S", "M", "L", "XL"];

  const categoryLabels = {
    tshirt: "T-Shirts",
    hoodie: "Hoodies",
    polo: "Polos",
    shorts: "Shorts",
    jacket: "Jackets",
  };

  /* ---------- Product database (single source of truth) ---------- */
  const products = [
    { id: 1, name: "Oversized T-Shirt", price: 12000, image: "images/t-shirt7.jpeg", category: "tshirt", description: "Premium oversized cotton t-shirt designed for comfort and everyday style." },
    { id: 2, name: "Luxury Hoodie", price: 18000, image: "images/hoodie7.jpeg", category: "hoodie", description: "Soft luxury hoodie with relaxed fit and modern streetwear style." },
    { id: 3, name: "Classic Polo", price: 10000, image: "images/polo4.jpeg", category: "polo", description: "Timeless classic polo shirt made with breathable cotton." },
    { id: 4, name: "Summer Shorts", price: 9000, image: "images/summer short6.jpeg", category: "shorts", description: "Lightweight summer shorts for a comfortable casual look." },
    { id: 5, name: "Oversized T-Shirt", price: 15000, image: "images/t-shirt1.jpeg", category: "tshirt", isNew: true, description: "Premium oversized cotton t-shirt, modern design." },
    { id: 6, name: "Luxury Hoodie", price: 17000, image: "images/hoodie2.jpeg", category: "hoodie", isNew: true, description: "Soft luxury hoodie, perfect for streetwear." },
    { id: 7, name: "Classic Polo", price: 9000, image: "images/polo3.jpeg", category: "polo", isNew: true, description: "Breathable classic polo shirt, casual style." },
    { id: 8, name: "Summer Shorts", price: 10000, image: "images/summer short1.jpeg", category: "shorts", description: "Comfortable summer shorts, easy-going fit." },
    { id: 9, name: "Oversized T-Shirt", price: 12000, image: "images/t-shirt2.jpeg", category: "tshirt", description: "Modern oversized cotton t-shirt for daily wear." },
    { id: 10, name: "Luxury Hoodie", price: 14000, image: "images/hoodie3.jpeg", category: "hoodie", isNew: true, description: "Soft hoodie, sleek design for streetwear." },
    { id: 11, name: "Classic Polo", price: 13000, image: "images/polo2.jpeg", category: "polo", description: "Classic polo shirt, durable and breathable." },
    { id: 12, name: "Summer Shorts", price: 10000, image: "images/summer short5.jpeg", category: "shorts", isNew: true, description: "Summer-ready shorts, lightweight cotton." },
    { id: 13, name: "Oversized T-Shirt", price: 10000, image: "images/t-shirt6.jpeg", category: "tshirt", description: "Soft oversized t-shirt, everyday comfort." },
    { id: 14, name: "Luxury Hoodie", price: 15000, image: "images/hoodie6.jpeg", category: "hoodie", isNew: true, description: "Premium hoodie, modern streetwear style." },
    { id: 15, name: "Classic Polo", price: 12000, image: "images/polo1.jpeg", category: "polo", description: "Durable classic polo shirt for casual wear." },
    // Added from the old New Arrivals page, which used images that were not in the database
    { id: 16, name: "Casual Jacket", price: 22000, image: "images/jacket2.jpeg", category: "jacket", isNew: true, description: "Lightweight casual jacket that layers over anything." },
    { id: 17, name: "Summer Shorts", price: 15000, image: "images/summer short4.jpeg", category: "shorts", isNew: true, description: "Relaxed summer shorts with a roomier, resort-ready fit." },
  ];

  const productById = (id) => products.find((p) => p.id === Number(id));

  /* ---------- Cart state ---------- */
  function loadCart() {
    try {
      const raw = JSON.parse(localStorage.getItem(CART_KEY));
      if (!Array.isArray(raw)) return [];
      // Re-sync with the product database so prices/images never go stale
      return raw
        .map((item) => {
          const p = productById(item && item.id);
          if (!p || !(item.quantity > 0)) return null;
          return { key: item.key, id: p.id, name: p.name, price: p.price, image: p.image, size: item.size || "M", quantity: Math.floor(item.quantity) };
        })
        .filter(Boolean);
    } catch {
      return [];
    }
  }

  let cart = loadCart();

  function saveCart() {
    try { localStorage.setItem(CART_KEY, JSON.stringify(cart)); } catch { /* storage unavailable */ }
    updateCartCount();
  }

  function updateCartCount() {
    const badge = $("#cart-count");
    if (!badge) return;
    const total = cart.reduce((sum, i) => sum + i.quantity, 0);
    badge.textContent = total;
    badge.classList.toggle("hidden", total === 0);
  }

  function totals() {
    const subtotal = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const delivery = subtotal === 0 || subtotal >= FREE_DELIVERY_MIN ? 0 : DELIVERY_FEE;
    return { subtotal, delivery, total: subtotal + delivery };
  }

  function addToCart(product, size, quantity) {
    const key = `${product.id}-${size}`;
    const existing = cart.find((i) => i.key === key);
    if (existing) existing.quantity += quantity;
    else cart.push({ key, id: product.id, name: product.name, price: product.price, image: product.image, size, quantity });
    saveCart();
    toast(`${quantity} \u00d7 ${product.name} (${size}) added to cart`);
  }

  /* ---------- Toast ---------- */
  let toastTimer;
  function toast(message) {
    let el = $("#toast");
    if (!el) {
      el = document.createElement("div");
      el.id = "toast";
      el.className = "toast";
      el.setAttribute("role", "status");
      document.body.appendChild(el);
    }
    el.textContent = message;
    requestAnimationFrame(() => el.classList.add("show"));
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove("show"), 2600);
  }

  /* ---------- Shared header + footer ---------- */
  const NAV = [
    ["index.html", "Home"],
    ["shop.html", "Shop"],
    ["new-arrivals.html", "New Arrivals"],
    ["contact.html", "Contact"],
  ];

  function renderChrome() {
    const page = location.pathname.split("/").pop() || "index.html";

    const header = $("#site-header");
    if (header) {
      header.outerHTML = `
        <div class="announce">Free Lagos delivery on orders above ${naira(FREE_DELIVERY_MIN)}</div>
        <header class="header" id="header">
          <nav class="navbar" aria-label="Main">
            <button class="menu-toggle" type="button" aria-label="Open menu" aria-expanded="false" aria-controls="nav-links">&#9776;</button>
            <a href="index.html" class="brand" aria-label="Eeyo Collections home">
              <img src="images/logo.png" alt="Eeyo" class="logo-image"
                onerror="this.replaceWith(Object.assign(document.createElement('span'),{className:'wordmark',textContent:'EEYO'}))">
            </a>
            <ul class="nav-links" id="nav-links">
              ${NAV.map(([href, label]) => `<li><a href="${href}"${page === href ? ' class="active" aria-current="page"' : ""}>${label}</a></li>`).join("")}
            </ul>
            <a href="cart.html" class="cart-icon" aria-label="View cart">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 8h14l-1.2 11.2a1.5 1.5 0 0 1-1.5 1.3H7.7a1.5 1.5 0 0 1-1.5-1.3L5 8Z"/><path d="M9 8V6.5a3 3 0 0 1 6 0V8"/></svg>
              <span id="cart-count" class="hidden">0</span>
            </a>
          </nav>
        </header>`;
    }

    const footer = $("#site-footer");
    if (footer) {
      footer.outerHTML = `
        <footer class="footer">
          <div class="footer-container">
            <div>
              <h3>EEYO</h3>
              <p>Modern fashion pieces designed for everyday confidence and style.</p>
            </div>
            <div>
              <h4>Shop</h4>
              <a href="shop.html">All Products</a>
              <a href="new-arrivals.html">New Arrivals</a>
              <a href="shop.html?cat=hoodie">Hoodies</a>
            </div>
            <div>
              <h4>Support</h4>
              <a href="contact.html">Contact</a>
              <a href="contact.html#shipping">Shipping</a>
              <a href="contact.html#returns">Returns</a>
            </div>
          </div>
          <p class="copyright">&copy; ${new Date().getFullYear()} Eeyo Collections</p>
        </footer>`;
    }

    // Mobile menu
    const toggle = $(".menu-toggle");
    const links = $("#nav-links");
    if (toggle && links) {
      toggle.addEventListener("click", () => {
        const open = links.classList.toggle("open");
        toggle.setAttribute("aria-expanded", String(open));
      });
    }

    // Header shadow on scroll
    const bar = $("#header");
    const onScroll = () => bar && bar.classList.toggle("scrolled", window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    updateCartCount();
  }

  /* ---------- Scroll reveal ---------- */
  let revealObserver = null;
  function initReveal() {
    const items = $$(".reveal:not(.in-view)");
    if (!("IntersectionObserver" in window)) {
      items.forEach((el) => el.classList.add("in-view"));
      return;
    }
    if (!revealObserver) {
      revealObserver = new IntersectionObserver(
        (entries, obs) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("in-view");
            obs.unobserve(entry.target);
          });
        },
        { threshold: 0.1, rootMargin: "0px 0px -30px 0px" }
      );
    }
    items.forEach((el) => revealObserver.observe(el));
  }

  /* ---------- Product card ---------- */
  function cardHTML(p, index = 0, withDescription = false) {
    return `
      <a class="card reveal" href="product.html?id=${p.id}" style="--reveal-delay:${Math.min(index * 50, 350)}ms">
        <div class="card-media">
          <img src="${imgSrc(p.image)}" alt="${esc(p.name)}" loading="lazy" onerror="this.classList.add('img-missing')">
          ${p.isNew ? '<span class="badge">New</span>' : ""}
        </div>
        <div class="card-body">
          <p class="card-cat">${categoryLabels[p.category] || ""}</p>
          <h3>${esc(p.name)}</h3>
          ${withDescription ? `<p class="card-desc">${esc(p.description)}</p>` : ""}
          <p class="price">${naira(p.price)}</p>
        </div>
      </a>`;
  }

  /* ---------- Home ---------- */
  function initHome() {
    const grid = $("#featured-grid");
    if (!grid) return;
    grid.innerHTML = [1, 2, 3, 14].map((id, i) => cardHTML(productById(id), i)).join("");
  }

  /* ---------- Newsletter ---------- */
  function initNewsletter() {
    const form = $("#newsletter-form");
    if (!form) return;
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      // TODO: connect to your email provider (Mailchimp, Brevo, etc.)
      form.reset();
      toast("Thanks for subscribing!");
    });
  }

  /* ---------- New arrivals ---------- */
  function initNewArrivals() {
    const grid = $("#arrivals-grid");
    if (!grid) return;
    grid.innerHTML = products.filter((p) => p.isNew).map((p, i) => cardHTML(p, i)).join("");
  }

  /* ---------- Shop ---------- */
  function initShop() {
    const grid = $("#product-grid");
    if (!grid) return;

    const search = $("#shop-search");
    const sort = $("#sort-products");
    const count = $("#result-count");
    const chips = $$(".filters button");

    let active = new URLSearchParams(location.search).get("cat") || "all";
    if (active !== "all" && !categoryLabels[active]) active = "all";
    chips.forEach((b) => b.classList.toggle("active", b.dataset.filter === active));

    function render() {
      const q = search.value.trim().toLowerCase();
      const list = products
        .filter((p) => {
          const inCategory = active === "all" || p.category === active;
          const matches =
            !q ||
            p.name.toLowerCase().includes(q) ||
            p.description.toLowerCase().includes(q) ||
            (categoryLabels[p.category] || "").toLowerCase().includes(q);
          return inCategory && matches;
        })
        .sort((a, b) => {
          switch (sort.value) {
            case "price-low": return a.price - b.price;
            case "price-high": return b.price - a.price;
            case "name": return a.name.localeCompare(b.name) || a.price - b.price;
            default: return a.id - b.id;
          }
        });

      count.textContent =
        list.length === products.length ? `Showing all ${products.length} products` : `Showing ${list.length} of ${products.length} products`;

      grid.innerHTML = list.length
        ? list.map((p, i) => cardHTML(p, i, true)).join("")
        : `<div class="empty-state"><h3>No products found</h3><p>Try a different search or category.</p></div>`;
      initReveal();
    }

    chips.forEach((button) =>
      button.addEventListener("click", () => {
        chips.forEach((b) => b.classList.remove("active"));
        button.classList.add("active");
        active = button.dataset.filter;
        render();
      })
    );
    search.addEventListener("input", render);
    sort.addEventListener("change", render);
    render();
  }

  /* ---------- Product page ---------- */
  function initProductPage() {
    const root = $("#product-view");
    if (!root) return;

    const params = new URLSearchParams(location.search);
    const product = productById(params.has("id") ? params.get("id") : products[0].id);

    if (!product) {
      document.title = "Product not found | Eeyo Collections";
      root.innerHTML = `
        <div class="product-not-found">
          <h1>Product not found</h1>
          <p class="muted">This item may have moved or is no longer available.</p>
          <a href="shop.html" class="btn btn-primary">Back to shop</a>
        </div>`;
      return;
    }

    document.title = `${product.name} | Eeyo Collections`;
    let size = "M";

    root.innerHTML = `
      <nav class="crumbs" aria-label="Breadcrumb">
        <a href="index.html">Home</a> / <a href="shop.html?cat=${product.category}">${categoryLabels[product.category]}</a> / ${esc(product.name)}
      </nav>
      <div class="pdp">
        <div class="pdp-media">
          <img src="${imgSrc(product.image)}" alt="${esc(product.name)}" onerror="this.classList.add('img-missing')">
        </div>
        <div class="pdp-info">
          <p class="eyebrow">${categoryLabels[product.category]}</p>
          <h1>${esc(product.name)}</h1>
          <p class="pdp-price">${naira(product.price)}</p>
          <p class="pdp-desc">${esc(product.description)}</p>
          <ul class="perks">
            <li>Premium everyday wear</li>
            <li>Ships from Lagos</li>
            <li>Easy size exchange</li>
          </ul>

          <fieldset class="field">
            <legend>Size</legend>
            <div class="sizes" role="radiogroup" aria-label="Size">
              ${SIZES.map((s) => `<button type="button" role="radio" aria-checked="${s === size}" data-size="${s}">${s}</button>`).join("")}
            </div>
          </fieldset>

          <div class="field">
            <label for="qty">Quantity</label>
            <div class="qty-box">
              <button type="button" data-qty="-1" aria-label="Decrease quantity">&minus;</button>
              <input id="qty" type="number" value="1" min="1" max="20" inputmode="numeric">
              <button type="button" data-qty="1" aria-label="Increase quantity">+</button>
            </div>
          </div>

          <button type="button" class="btn btn-primary add-to-cart">Add to cart</button>
        </div>
      </div>`;

    const qty = $("#qty");
    const readQty = () => Math.min(Math.max(parseInt(qty.value, 10) || 1, 1), 20);

    $$(".sizes button", root).forEach((btn) =>
      btn.addEventListener("click", () => {
        size = btn.dataset.size;
        $$(".sizes button", root).forEach((b) => b.setAttribute("aria-checked", String(b === btn)));
      })
    );
    $$("[data-qty]", root).forEach((btn) =>
      btn.addEventListener("click", () => {
        qty.value = Math.min(Math.max(readQty() + Number(btn.dataset.qty), 1), 20);
      })
    );
    qty.addEventListener("change", () => (qty.value = readQty()));
    $(".add-to-cart", root).addEventListener("click", () => addToCart(product, size, readQty()));

    // Related products
    const related = $("#related-grid");
    if (related) {
      const same = products.filter((p) => p.id !== product.id && p.category === product.category);
      const others = products.filter((p) => p.id !== product.id && p.category !== product.category);
      related.innerHTML = [...same, ...others].slice(0, 4).map((p, i) => cardHTML(p, i)).join("");
    }
  }

  /* ---------- Totals (cart + checkout) ---------- */
  function fillTotals() {
    const t = totals();
    const fmtDelivery = t.delivery === 0 && t.subtotal > 0 ? "Free" : naira(t.delivery);
    $$("[data-total='subtotal']").forEach((el) => (el.textContent = naira(t.subtotal)));
    $$("[data-total='delivery']").forEach((el) => (el.textContent = fmtDelivery));
    $$("[data-total='total']").forEach((el) => (el.textContent = naira(t.total)));

    const note = $("#free-note");
    const bar = $("#free-bar span");
    if (note && bar) {
      const remaining = FREE_DELIVERY_MIN - t.subtotal;
      note.textContent =
        remaining > 0 ? `Add ${naira(remaining)} more for free delivery` : "You've unlocked free delivery \ud83c\udf89";
      bar.style.width = Math.min(100, (t.subtotal / FREE_DELIVERY_MIN) * 100) + "%";
    }
  }

  /* ---------- Cart page ---------- */
  function initCartPage() {
    const list = $("#cart-items");
    const summary = $("#cart-summary");
    if (!list || !summary) return;

    function render() {
      if (!cart.length) {
        list.innerHTML = `
          <div class="empty-state">
            <h3>Your cart is empty</h3>
            <p>Looks like you haven't added anything yet.</p>
            <a href="shop.html" class="btn btn-primary">Start shopping</a>
          </div>`;
        summary.classList.add("hidden");
        return;
      }
      summary.classList.remove("hidden");
      list.innerHTML = cart
        .map(
          (i) => `
        <article class="cart-item" data-key="${esc(i.key)}">
          <a href="product.html?id=${i.id}" class="cart-thumb"><img src="${imgSrc(i.image)}" alt="${esc(i.name)}" onerror="this.classList.add('img-missing')"></a>
          <div class="cart-details">
            <h3><a href="product.html?id=${i.id}">${esc(i.name)}</a></h3>
            <p class="muted">Size: ${esc(i.size)}</p>
            <p class="price">${naira(i.price)}</p>
            <div class="qty-box small">
              <button type="button" data-action="dec" aria-label="Decrease quantity">&minus;</button>
              <input type="number" min="1" max="20" value="${i.quantity}" data-action="qty" aria-label="Quantity">
              <button type="button" data-action="inc" aria-label="Increase quantity">+</button>
            </div>
          </div>
          <div class="cart-line-total">
            <strong>${naira(i.price * i.quantity)}</strong>
            <button type="button" class="link-btn" data-action="remove">Remove</button>
          </div>
        </article>`
        )
        .join("");
      fillTotals();
    }

    function setQty(key, qty) {
      const item = cart.find((i) => i.key === key);
      if (!item) return;
      item.quantity = Math.min(Math.max(parseInt(qty, 10) || 1, 1), 20);
      saveCart();
      render();
    }

    list.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-action]");
      const row = e.target.closest(".cart-item");
      if (!btn || !row) return;
      const item = cart.find((i) => i.key === row.dataset.key);
      if (!item) return;
      if (btn.dataset.action === "inc") setQty(item.key, item.quantity + 1);
      if (btn.dataset.action === "dec") setQty(item.key, item.quantity - 1);
      if (btn.dataset.action === "remove") {
        cart = cart.filter((i) => i.key !== item.key);
        saveCart();
        render();
      }
    });
    list.addEventListener("change", (e) => {
      const input = e.target.closest("input[data-action='qty']");
      const row = e.target.closest(".cart-item");
      if (input && row) setQty(row.dataset.key, input.value);
    });

    render();
  }

  /* ---------- Checkout ---------- */
  function initCheckout() {
    const root = $("#checkout-root");
    if (!root) return;

    if (!cart.length) {
      root.innerHTML = `
        <div class="confirm">
          <h1>Your cart is empty</h1>
          <p>Add something to your cart before checking out.</p>
          <a href="shop.html" class="btn btn-primary">Browse the shop</a>
        </div>`;
      return;
    }

    $("#order-lines").innerHTML = cart
      .map(
        (i) => `
      <div class="order-line">
        <span>${esc(i.name)} <small>Size ${esc(i.size)} \u00d7 ${i.quantity}</small></span>
        <span>${naira(i.price * i.quantity)}</span>
      </div>`
      )
      .join("");
    fillTotals();

    const form = $("#checkout-form");
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!form.reportValidity()) return;

      // TODO: send the order to your backend and take payment (e.g. Paystack or Flutterwave).
      const ref = "EY-" + Math.random().toString(36).slice(2, 8).toUpperCase();
      const name = form.elements.fullname.value.trim().split(" ")[0];
      cart = [];
      saveCart();

      root.innerHTML = `
        <div class="confirm">
          <div class="tick" aria-hidden="true">\u2713</div>
          <h1>Thank you, ${esc(name)}!</h1>
          <p>Your order <strong>${ref}</strong> has been received.</p>
          <p>We'll contact you on the details you provided to confirm delivery.</p>
          <a href="shop.html" class="btn btn-primary">Continue shopping</a>
        </div>`;
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* ---------- Contact ---------- */
  function initContact() {
    const form = $("#contact-form");
    if (!form) return;
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      // TODO: connect to a form service (Formspree, Netlify Forms) or your backend.
      form.reset();
      toast("Message sent. We'll get back to you soon.");
    });
  }

  /* ---------- Boot ---------- */
  function boot() {
    renderChrome();
    initHome();
    initNewArrivals();
    initShop();
    initProductPage();
    initCartPage();
    initCheckout();
    initContact();
    initNewsletter();
    initReveal();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
