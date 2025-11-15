const API_BASE = '/api';

const getToken = () => localStorage.getItem('smartcanteen_token');
const getUser = () => JSON.parse(localStorage.getItem('smartcanteen_user') || '{}');

const user = getUser();

if (!getToken() || !user.id || user.role !== 'user') {
  window.location.href = '/';
}

const notificationEl = document.getElementById('notification');
const menuList = document.getElementById('menuList');
const cartList = document.getElementById('cartList');
const cartTotal = document.getElementById('cartTotal');
const ordersList = document.getElementById('ordersList');
const userName = document.getElementById('userName');
const logoutBtn = document.getElementById('logoutBtn');
const placeOrderBtn = document.getElementById('placeOrderBtn');
const viewOrdersBtn = document.getElementById('viewOrdersBtn');

userName.textContent = user.name || 'User';

let cart = [];
let menuItems = [];

const showNotification = (message, type = 'success') => {
  notificationEl.textContent = message;
  notificationEl.className = `notification show ${type}`;
  setTimeout(() => {
    notificationEl.className = 'notification';
    notificationEl.textContent = '';
  }, 4000);
};

const apiRequest = async (url, options = {}) => {
  const token = getToken();
  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Request failed');
  }

  return data;
};

const calculateTotal = () => {
  return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
};

const renderCart = () => {
  if (!cart.length) {
    cartList.innerHTML = '<p style="color: rgba(30, 27, 75, 0.5);">Your cart is empty.</p>';
    cartTotal.textContent = '₹0';
    placeOrderBtn.disabled = true;
    return;
  }

  cartList.innerHTML = cart
    .map((item, index) => `
      <div class="cart-item">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <strong>${item.name}</strong>
            <p style="margin-top: 0.25rem; color: rgba(30, 27, 75, 0.6);">₹${item.price} × ${item.quantity}</p>
          </div>
          <div style="display: flex; gap: 0.5rem; align-items: center;">
            <button class="btn-secondary" onclick="updateQuantity(${index}, -1)" style="padding: 0.4rem 0.75rem;">-</button>
            <span style="font-weight: 600;">${item.quantity}</span>
            <button class="btn-secondary" onclick="updateQuantity(${index}, 1)" style="padding: 0.4rem 0.75rem;">+</button>
            <button class="btn-secondary" onclick="removeFromCart(${index})" style="padding: 0.4rem 0.75rem; background: rgba(239, 68, 68, 0.15); color: #ef4444;">Remove</button>
          </div>
        </div>
      </div>
    `)
    .join('');

  cartTotal.textContent = `₹${calculateTotal()}`;
  placeOrderBtn.disabled = false;
};

const addToCart = (menuItem) => {
  const existingItem = cart.find((item) => item.menuItemId === menuItem._id);

  if (existingItem) {
    existingItem.quantity++;
  } else {
    cart.push({
      menuItemId: menuItem._id,
      name: menuItem.name,
      price: menuItem.price,
      quantity: 1
    });
  }

  renderCart();
  showNotification(`${menuItem.name} added to cart`, 'success');
};

window.updateQuantity = (index, delta) => {
  if (cart[index]) {
    cart[index].quantity += delta;
    if (cart[index].quantity <= 0) {
      cart.splice(index, 1);
    }
    renderCart();
  }
};

window.removeFromCart = (index) => {
  cart.splice(index, 1);
  renderCart();
};

const renderMenu = () => {
  if (!menuItems.length) {
    menuList.innerHTML = '<p style="color: rgba(30, 27, 75, 0.5);">No menu items available.</p>';
    return;
  }

  menuList.innerHTML = menuItems
    .map((item) => `
      <div class="menu-item">
        <div class="item-header">
          <div>
            <strong style="font-size: 1.1rem;">${item.name}</strong>
            <p style="margin-top: 0.25rem; color: rgba(30, 27, 75, 0.7);">${item.description || ''}</p>
          </div>
          <span class="badge badge-category">${item.category || 'General'}</span>
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 1rem;">
          <strong style="font-size: 1.2rem; color: #7c3aed;">₹${item.price}</strong>
          <button class="btn-primary add-to-cart-btn" data-id="${item._id}" style="padding: 0.5rem 1rem;">Add to Cart</button>
        </div>
      </div>
    `)
    .join('');

  document.querySelectorAll('.add-to-cart-btn').forEach((button) => {
    button.addEventListener('click', () => {
      const menuItem = menuItems.find((item) => item._id === button.dataset.id);
      if (menuItem) {
        addToCart(menuItem);
      }
    });
  });
};

const renderOrders = (orders) => {
  if (!orders.length) {
    ordersList.innerHTML = '<p style="color: rgba(30, 27, 75, 0.5);">No orders yet.</p>';
    return;
  }

  ordersList.innerHTML = orders
    .map((order) => `
      <div class="order-item">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <strong style="font-size: 1.3rem; color: #7c3aed;">Token #${order.token}</strong>
            <span class="badge badge-status ${order.status}" style="margin-left: 0.5rem;">${order.status.toUpperCase()}</span>
          </div>
          <strong>₹${order.totalAmount}</strong>
        </div>
        <div style="margin-top: 0.75rem;">
          ${order.items.map((item) => `<p style="color: rgba(30, 27, 75, 0.7);">${item.name} × ${item.quantity}</p>`).join('')}
        </div>
        <p style="margin-top: 0.5rem; font-size: 0.85rem; color: rgba(30, 27, 75, 0.5);">Placed on ${new Date(order.createdAt).toLocaleString()}</p>
      </div>
    `)
    .join('');
};

const fetchMenu = async () => {
  try {
    menuItems = await apiRequest(`${API_BASE}/menu`);
    renderMenu();
  } catch (error) {
    showNotification(error.message, 'error');
  }
};

const fetchOrders = async () => {
  try {
    const orders = await apiRequest(`${API_BASE}/orders/my`);
    renderOrders(orders);
  } catch (error) {
    showNotification(error.message, 'error');
  }
};

placeOrderBtn?.addEventListener('click', async () => {
  if (!cart.length) {
    return;
  }

  try {
    const items = cart.map((item) => ({
      menuItemId: item.menuItemId,
      quantity: item.quantity
    }));

    const order = await apiRequest(`${API_BASE}/orders`, {
      method: 'POST',
      body: JSON.stringify({ items })
    });

    showNotification(`Order placed successfully! Your token is #${order.token}`, 'success');
    cart = [];
    renderCart();
    fetchOrders();
  } catch (error) {
    showNotification(error.message, 'error');
  }
});

viewOrdersBtn?.addEventListener('click', () => {
  fetchOrders();
});

logoutBtn?.addEventListener('click', () => {
  localStorage.removeItem('smartcanteen_token');
  localStorage.removeItem('smartcanteen_user');
  window.location.href = '/';
});

fetchMenu();
fetchOrders();
renderCart();
