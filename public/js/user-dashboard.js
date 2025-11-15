const API_URL = window.location.origin + '/api';

const token = localStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('user') || '{}');

if (!token || !user) {
  window.location.href = '/';
}

if (user.role !== 'user') {
  window.location.href = '/admin-dashboard.html';
}

const headers = {
  'Content-Type': 'application/json',
  Authorization: `Bearer ${token}`,
};

const userNameEl = document.getElementById('userName');
const menuGrid = document.getElementById('menuGrid');
const categoryFilter = document.getElementById('categoryFilter');
const cartItemsEl = document.getElementById('cartItems');
const cartTotalEl = document.getElementById('cartTotal');
const totalAmountEl = document.getElementById('totalAmount');
const placeOrderBtn = document.getElementById('placeOrderBtn');
const clearCartBtn = document.getElementById('clearCartBtn');
const refreshOrdersBtn = document.getElementById('refreshOrdersBtn');
const ordersContainer = document.getElementById('ordersContainer');
const alertBox = document.getElementById('alertBox');
const logoutBtn = document.getElementById('logoutBtn');
const tokenModal = document.getElementById('tokenModal');
const tokenNumberEl = document.getElementById('tokenNumber');
const closeTokenModalBtn = document.getElementById('closeTokenModal');
const okTokenBtn = document.getElementById('okTokenBtn');

let menuItems = [];
let cart = {};

userNameEl.textContent = `Hello, ${user.name}!`;

async function fetchMenu() {
  try {
    const response = await fetch(`${API_URL}/menu`);
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to load menu');
    }
    menuItems = data.menu;
    renderMenu(menuItems);
    populateCategories(menuItems);
  } catch (error) {
    menuGrid.innerHTML = `<div class="alert alert-error">${error.message}</div>`;
  }
}

function renderMenu(items) {
  if (!items.length) {
    menuGrid.innerHTML = '<div class="empty-state">No menu items available</div>';
    return;
  }

  menuGrid.innerHTML = items
    .map(
      (item) => `
        <div class="menu-item" data-id="${item._id}">
          <h3>${item.name}</h3>
          <div class="category">${item.category || 'General'}</div>
          <div class="price">₹${item.price}</div>
          <div class="description">${item.description || 'Delicious and freshly prepared.'}</div>
          <div class="actions">
            <div class="quantity-control">
              <button class="decrease">-</button>
              <input type="number" min="1" value="${cart[item._id]?.quantity || 1}" class="quantity" readonly>
              <button class="increase">+</button>
            </div>
            <button class="btn btn-secondary btn-sm add-to-cart" ${!item.isAvailable ? 'disabled' : ''}>
              ${item.isAvailable ? 'Add to cart' : 'Unavailable'}
            </button>
          </div>
        </div>`
    )
    .join('');

  menuGrid.querySelectorAll('.menu-item').forEach((card) => {
    const id = card.dataset.id;
    const quantityInput = card.querySelector('.quantity');
    const decreaseBtn = card.querySelector('.decrease');
    const increaseBtn = card.querySelector('.increase');
    const addToCartBtn = card.querySelector('.add-to-cart');

    decreaseBtn.addEventListener('click', () => {
      const current = Number(quantityInput.value);
      if (current > 1) {
        quantityInput.value = current - 1;
      }
    });

    increaseBtn.addEventListener('click', () => {
      quantityInput.value = Number(quantityInput.value) + 1;
    });

    addToCartBtn.addEventListener('click', () => {
      const quantity = Number(quantityInput.value);
      addItemToCart(id, quantity);
    });
  });
}

function populateCategories(items) {
  const categories = Array.from(new Set(items.map((item) => item.category).filter(Boolean)));
  categoryFilter.innerHTML = '<option value="">All Categories</option>';
  categories.forEach((category) => {
    const option = document.createElement('option');
    option.value = category;
    option.textContent = category;
    categoryFilter.appendChild(option);
  });
}

categoryFilter.addEventListener('change', (event) => {
  const value = event.target.value;
  if (!value) {
    renderMenu(menuItems);
  } else {
    renderMenu(menuItems.filter((item) => item.category === value));
  }
});

function addItemToCart(id, quantity) {
  const menuItem = menuItems.find((item) => item._id === id);
  if (!menuItem) return;

  if (cart[id]) {
    cart[id].quantity += quantity;
  } else {
    cart[id] = {
      menuItemId: id,
      name: menuItem.name,
      price: menuItem.price,
      quantity,
    };
  }

  showAlert(`${menuItem.name} added to cart!`, 'success');
  updateCartUI();
}

function updateCartUI() {
  const cartEntries = Object.values(cart);
  if (!cartEntries.length) {
    cartItemsEl.innerHTML = '<div class="empty-state"><p>🛒 Your cart is empty</p></div>';
    cartTotalEl.classList.add('hidden');
    placeOrderBtn.disabled = true;
    return;
  }

  const total = cartEntries.reduce((sum, item) => sum + item.price * item.quantity, 0);

  cartItemsEl.innerHTML = cartEntries
    .map(
      (item) => `
        <div class="cart-item" data-id="${item.menuItemId}">
          <div class="cart-item-info">
            <h4>${item.name}</h4>
            <p>Qty: ${item.quantity} × ₹${item.price}</p>
          </div>
          <div>
            <button class="btn btn-outline btn-sm update" data-action="decrease">-</button>
            <button class="btn btn-outline btn-sm update" data-action="increase">+</button>
            <button class="btn btn-danger btn-sm remove">Remove</button>
          </div>
        </div>`
    )
    .join('');

  cartItemsEl.querySelectorAll('.update').forEach((btn) => {
    btn.addEventListener('click', () => {
      const parent = btn.closest('.cart-item');
      const id = parent.dataset.id;
      const action = btn.dataset.action;
      if (action === 'increase') {
        cart[id].quantity += 1;
      } else if (action === 'decrease') {
        cart[id].quantity = Math.max(1, cart[id].quantity - 1);
      }
      updateCartUI();
    });
  });

  cartItemsEl.querySelectorAll('.remove').forEach((btn) => {
    btn.addEventListener('click', () => {
      const parent = btn.closest('.cart-item');
      const id = parent.dataset.id;
      delete cart[id];
      updateCartUI();
    });
  });

  totalAmountEl.textContent = `₹${total}`;
  cartTotalEl.classList.remove('hidden');
  placeOrderBtn.disabled = false;
}

clearCartBtn.addEventListener('click', () => {
  cart = {};
  updateCartUI();
});

placeOrderBtn.addEventListener('click', async () => {
  const items = Object.values(cart).map(({ menuItemId, quantity }) => ({ menuItemId, quantity }));
  if (!items.length) return;

  placeOrderBtn.disabled = true;
  placeOrderBtn.textContent = 'Placing order...';

  try {
    const response = await fetch(`${API_URL}/orders`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ items }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to place order');
    }

    tokenNumberEl.textContent = data.token;
    tokenModal.classList.add('active');
    cart = {};
    updateCartUI();
    fetchOrders();
  } catch (error) {
    showAlert(error.message, 'error');
  } finally {
    placeOrderBtn.disabled = false;
    placeOrderBtn.textContent = 'Place Order';
  }
});

closeTokenModalBtn.addEventListener('click', () => {
  tokenModal.classList.remove('active');
});
okTokenBtn.addEventListener('click', () => {
  tokenModal.classList.remove('active');
});

async function fetchOrders() {
  try {
    const response = await fetch(`${API_URL}/orders/my-orders`, { headers });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to load orders');
    }
    renderOrders(data.orders || []);
  } catch (error) {
    ordersContainer.innerHTML = `<div class="alert alert-error">${error.message}</div>`;
  }
}

function renderOrders(orders) {
  if (!orders.length) {
    ordersContainer.innerHTML = '<div class="empty-state">No orders yet. Place your first order!</div>';
    return;
  }

  ordersContainer.innerHTML = orders
    .map((order) => {
      const itemsList = order.items
        .map((item) => `<li>${item.name} × ${item.quantity} - ₹${item.price * item.quantity}</li>`) 
        .join('');
      return `
        <div class="order-card">
          <div class="order-header">
            <div>
              <div class="order-token">Token #${order.token}</div>
              <div style="color: var(--text-light);">Placed on ${new Date(order.createdAt).toLocaleString()}</div>
            </div>
            <div class="status-badge status-${order.status.replace(' ', '-')}">${formatStatus(order.status)}</div>
          </div>
          <div class="order-items">
            <h4>Items</h4>
            <ul>${itemsList}</ul>
          </div>
          <div class="order-footer">
            <div class="order-total">Total: ₹${order.totalAmount}</div>
            <div style="color: var(--text-light);">Status: ${formatStatus(order.status)}</div>
          </div>
        </div>`;
    })
    .join('');
}

function formatStatus(status) {
  return status
    .replace('-', ' ')
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function showAlert(message, type = 'info') {
  alertBox.textContent = message;
  alertBox.className = `alert alert-${type}`;
  alertBox.classList.remove('hidden');
  setTimeout(() => {
    alertBox.classList.add('hidden');
  }, 3000);
}

refreshOrdersBtn.addEventListener('click', fetchOrders);
logoutBtn.addEventListener('click', () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/';
});

fetchMenu();
fetchOrders();
