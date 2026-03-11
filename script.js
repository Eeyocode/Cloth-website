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


// ADD TO CART
const addButtons = document.querySelectorAll(".add-to-cart");

addButtons.forEach(button => {
  button.addEventListener("click", () => {

    const name = button.dataset.name;
    const price = Number(button.dataset.price);
    const image = button.dataset.image;

    // Get the quantity from the input
    let qtyInput = document.getElementById("qty");
    let quantity = qtyInput ? Number(qtyInput.value) : 1;

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
        <img src="${item.image}">

        <div class="cart-details">
          <h3>${item.name}</h3>
          <p>₦${item.price}</p>

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
  cart[index].quantity = Number(qty);
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

  document.querySelector(".cart-total p span").textContent = "₦" + subtotal;
  document.querySelector(".cart-total h4 span").textContent = "₦" + total;
}
function changeImage(element) {
  const mainImage = document.getElementById("mainProductImage");
  mainImage.src = element.src;
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


// LOAD PRODUCT PAGE
const params = new URLSearchParams(window.location.search);
const productId = params.get("id");

if (productId) {
  const product = products.find(p => p.id == productId);

  if (product) {
    // Update main product info
    document.getElementById("mainProductImage").src = product.image;
    document.querySelector(".product-info h2").textContent = product.name;
    document.querySelector(".product-info .price").textContent = "₦" + product.price;
    document.querySelector(".product-info .description").textContent = product.description;

    // Set add-to-cart button data
    const button = document.querySelector(".add-to-cart");
    button.dataset.name = product.name;
    button.dataset.price = product.price;
    button.dataset.image = product.image;

    // Optional: update document title
    document.title = product.name + " | Eeyo Collections";
  }
}
const relatedContainer = document.querySelector(".related-products");

if (relatedContainer && productId) {
  relatedContainer.innerHTML = "";

  // Show 3 related products (different from current)
  const related = products.filter(p => p.id != productId).slice(0, 3);

  related.forEach(p => {
    const div = document.createElement("div");
    div.className = "product-card";
    div.innerHTML = `
      <div class="product-img">
        <a href="product.html?id=${p.id}">
          <img src="${p.image}" alt="${p.name}">
        </a>
      </div>
      <h3>${p.name}</h3>
      <p>₦${p.price}</p>
    `;
    relatedContainer.appendChild(div);
  });
}



