const toggle = document.querySelector(".menu-toggle");
const nav = document.querySelector(".nav-links");

if (toggle && nav) {
  toggle.addEventListener("click", () => {
    nav.classList.toggle("show");
  });
}

window.addEventListener("scroll", () => {
  const header = document.querySelector(".header") || document.querySelector("header");
  if (header) {
    header.classList.toggle("scrolled", window.scrollY > 50);
  }
});

const revealItems = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window && revealItems.length) {
  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        const delay = entry.target.dataset.delay || "0";
        entry.target.style.setProperty("--reveal-delay", `${delay}ms`);
        entry.target.classList.add("in-view");
        obs.unobserve(entry.target);
      });
    },
    {
      threshold: 0.15,
      rootMargin: "0px 0px -40px 0px",
    }
  );

  revealItems.forEach((item) => observer.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("in-view"));
}

const formatNaira = (price) => "\u20a6" + Number(price).toLocaleString();

// CART SYSTEM
let cart = JSON.parse(localStorage.getItem("cart")) || [];

function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
}

function updateCartCount() {
  const count = document.getElementById("cart-count");
  if (!count) return;

  let total = 0;
  cart.forEach(item => total += item.quantity);
  count.textContent = total;
}

updateCartCount();

// PRODUCT DATABASE
const products = [
  { id: 1, name: "Oversized T-Shirt", price: 12000, image: "images/t-shirt7.jpeg", category: "tshirt", description: "Premium oversized cotton t-shirt designed for comfort and everyday style." },
  { id: 2, name: "Luxury Hoodie", price: 18000, image: "images/hoodie7.jpeg", category: "hoodie", description: "Soft luxury hoodie with relaxed fit and modern streetwear style." },
  { id: 3, name: "Classic Polo", price: 10000, image: "images/polo4.jpeg", category: "polo", description: "Timeless classic polo shirt made with breathable cotton." },
  { id: 4, name: "Summer Shorts", price: 9000, image: "images/summer short6.jpeg", category: "shorts", description: "Lightweight summer shorts for a comfortable casual look." },
  { id: 5, name: "Oversized T-Shirt", price: 15000, image: "images/t-shirt1.jpeg", category: "tshirt", description: "Premium oversized cotton t-shirt, modern design." },
  { id: 6, name: "Luxury Hoodie", price: 17000, image: "images/hoodie2.jpeg", category: "hoodie", description: "Soft luxury hoodie, perfect for streetwear." },
  { id: 7, name: "Classic Polo", price: 9000, image: "images/polo3.jpeg", category: "polo", description: "Breathable classic polo shirt, casual style." },
  { id: 8, name: "Summer Shorts", price: 10000, image: "images/summer short1.jpeg", category: "shorts", description: "Comfortable summer shorts, easy-going fit." },
  { id: 9, name: "Oversized T-Shirt", price: 12000, image: "images/t-shirt2.jpeg", category: "tshirt", description: "Modern oversized cotton t-shirt for daily wear." },
  { id: 10, name: "Luxury Hoodie", price: 14000, image: "images/hoodie3.jpeg", category: "hoodie", description: "Soft hoodie, sleek design for streetwear." },
  { id: 11, name: "Classic Polo", price: 13000, image: "images/polo2.jpeg", category: "polo", description: "Classic polo shirt, durable and breathable." },
  { id: 12, name: "Summer Shorts", price: 10000, image: "images/summer short5.jpeg", category: "shorts", description: "Summer-ready shorts, lightweight cotton." },
  { id: 13, name: "Oversized T-Shirt", price: 10000, image: "images/t-shirt6.jpeg", category: "tshirt", description: "Soft oversized t-shirt, everyday comfort." },
  { id: 14, name: "Luxury Hoodie", price: 15000, image: "images/hoodie6.jpeg", category: "hoodie", description: "Premium hoodie, modern streetwear style." },
  { id: 15, name: "Classic Polo", price: 12000, image: "images/polo1.jpeg", category: "polo", description: "Durable classic polo shirt for casual wear." }
];

// ADD TO CART
const addButtons = document.querySelectorAll(".add-to-cart");

addButtons.forEach(button => {
  button.addEventListener("click", () => {
    const name = button.dataset.name;
    const price = Number(button.dataset.price);
    const image = button.dataset.image;

    if (!name || !price || !image) {
      alert("Please choose a valid product before adding it to cart.");
      return;
    }

    const qtyInput = document.getElementById("qty");
    const quantity = qtyInput ? Math.max(Number(qtyInput.value), 1) : 1;
    const existing = cart.find(item => item.name === name);

    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.push({
        name,
        price,
        image,
        quantity
      });
    }

    saveCart();
    updateCartCount();

    alert(`${quantity} x ${name} added to cart!`);
  });
});

// LOAD CART PAGE
const cartContainer = document.querySelector(".cart-items");

if (cartContainer) {
  cartContainer.innerHTML = "";

  cart.forEach((item, index) => {
    cartContainer.innerHTML += `
      <div class="cart-item">
        <img src="${item.image}" alt="${item.name}">

        <div class="cart-details">
          <h3>${item.name}</h3>
          <p>${formatNaira(item.price)}</p>

          <input type="number" value="${item.quantity}" min="1"
          onchange="updateQuantity(${index}, this.value)">

          <button onclick="removeItem(${index})" class="remove-btn">
            Remove
          </button>
        </div>
      </div>
    `;
  });

  updateTotal();
}

function updateQuantity(index, qty) {
  cart[index].quantity = Math.max(Number(qty), 1);
  saveCart();
  updateTotal();
  updateCartCount();
}

function removeItem(index) {
  cart.splice(index, 1);
  saveCart();
  location.reload();
}

function updateTotal() {
  const subtotalEl = document.querySelector(".cart-total span");
  if (!subtotalEl) return;

  let subtotal = 0;

  cart.forEach(item => {
    subtotal += item.price * item.quantity;
  });

  const delivery = 2000;
  const total = subtotal + delivery;

  document.querySelector(".cart-total p span").textContent = formatNaira(subtotal);
  document.querySelector(".cart-total h4 span").textContent = formatNaira(total);
}

function changeImage(element) {
  const mainImage = document.getElementById("mainProductImage");
  if (mainImage) {
    mainImage.src = element.src;
    mainImage.alt = element.alt;
  }
}

function increaseQty() {
  const qty = document.getElementById("qty");
  qty.value = Number(qty.value) + 1;
}

function decreaseQty() {
  const qty = document.getElementById("qty");
  if (qty.value > 1) {
    qty.value = Number(qty.value) - 1;
  }
}

// LOAD PRODUCT PAGE
const params = new URLSearchParams(window.location.search);
const productId = params.get("id") || (document.getElementById("product-details") ? "1" : null);

if (productId) {
  const product = products.find(p => p.id == productId);
  const details = document.getElementById("product-details");

  if (product) {
    const mainImage = document.getElementById("mainProductImage");
    const title = document.querySelector(".product-info h2");
    const price = document.querySelector(".product-info .price");
    const description = document.querySelector(".product-info .description");
    const button = document.querySelector(".add-to-cart");

    mainImage.src = product.image;
    mainImage.alt = product.name;
    title.textContent = product.name;
    price.textContent = formatNaira(product.price);
    description.textContent = product.description;

    button.dataset.name = product.name;
    button.dataset.price = product.price;
    button.dataset.image = product.image;

    document.title = product.name + " | Eeyo Collections";
  } else if (details) {
    details.innerHTML = `
      <div class="product-not-found">
        <h2>Product not found</h2>
        <p>This item may have moved or is no longer available.</p>
        <a href="shop.html" class="btn">Back to Shop</a>
      </div>
    `;
  }
}

const relatedContainer = document.querySelector(".related-products");

if (relatedContainer && productId) {
  relatedContainer.innerHTML = "";

  const currentProduct = products.find(p => p.id == productId);
  const sameCategory = products.filter(p => p.id != productId && currentProduct && p.category === currentProduct.category);
  const fallbackProducts = products.filter(p => p.id != productId);
  const related = (sameCategory.length ? sameCategory : fallbackProducts).slice(0, 3);

  related.forEach(p => {
    const productLink = document.createElement("a");
    productLink.href = `product.html?id=${p.id}`;
    productLink.className = "product-card";
    productLink.innerHTML = `
      <div class="product-img">
        <img src="${p.image}" alt="${p.name}">
      </div>
      <h3>${p.name}</h3>
      <p>${formatNaira(p.price)}</p>
    `;
    relatedContainer.appendChild(productLink);
  });
}
