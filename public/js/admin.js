const API_BASE = '/api';

const getToken = () => localStorage.getItem('smartcanteen_token');
const getUser = () => JSON.parse(localStorage.getItem('smartcanteen_user') || '{}');

const user = getUser();

if (!getToken() || !user.id || user.role !== 'admin') {
  window.location.href = '/';
}

const notificationEl = document.getElementById('notification');
const menuList = document.getElementById('menuList');
const ordersList = document.getElementById('ordersList');
const adminName = document.getElementById('adminName');
const salesSummary = document.getElementById('salesSummary');
const logoutBtn = document.getElementById('logoutBtn');
const addMenuForm = document.getElementById('addMenuForm');

let menuItems = [];

adminName.textContent = user.name || 'Admin';

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

const renderMenu = (items) => {
  if (!items.length) {
    menuList.innerHTML = '<p style="color: rgba(30, 27, 75, 0.5);">No menu items found.</p>';
    return;
  }

  menuList.innerHTML = items
    .map((item) => `
      <div class="menu-item">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <strong style="font-size: 1.1rem;">${item.name}</strong>
            <p style="margin-top: 0.25rem; color: rgba(30, 27, 75, 0.7);">₹${item.price} - ${item.category || 'General'}</p>
            ${item.description ? `<p style="margin-top: 0.25rem; color: rgba(30, 27, 75, 0.6);">${item.description}</p>` : ''}
            <p style="margin-top: 0.35rem; font-size: 0.85rem; color: ${item.isAvailable ? '#10b981' : '#ef4444'};">${item.isAvailable ? 'Available' : 'Unavailable'}</p>
          </div>
          <div style="display: flex; gap: 0.5rem;">
            <button class="btn-secondary" onclick='editMenuItem("${item._id}")' style="padding: 0.4rem 0.75rem;">Edit</button>
            <button class="btn-secondary" onclick='deleteMenuItem("${item._id}")' style="background: rgba(239, 68, 68, 0.15); color: #ef4444; padding: 0.4rem 0.75rem;">Delete</button>
          </div>
        </div>
      </div>
    `)
    .join('');
};

const renderOrders = (orders) => {
  if (!orders.length) {
    ordersList.innerHTML = '<p style="color: rgba(30, 27, 75, 0.5);">No orders found.</p>';
    return;
  }

  ordersList.innerHTML = orders
    .map((order) => `
      <div class="order-item">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem;">
          <div>
            <strong style="font-size: 1.3rem; color: #7c3aed;">Token #${order.token}</strong>
            <p style="margin-top: 0.25rem; color: rgba(30, 27, 75, 0.7);">${order.userId?.name || 'Unknown'} - ${order.userId?.email || ''}</p>
          </div>
          <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; align-items: center;">
            <span class="badge badge-status ${order.status}">${order.status.toUpperCase()}</span>
            <select onchange='updateOrderStatus("${order._id}", this.value)' class="btn-secondary" style="padding: 0.4rem;">
              <option value="">Change Status</option>
              <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Pending</option>
              <option value="in-progress" ${order.status === 'in-progress' ? 'selected' : ''}>In Progress</option>
              <option value="completed" ${order.status === 'completed' ? 'selected' : ''}>Completed</option>
              <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
            </select>
          </div>
        </div>
        <div style="margin-top: 0.75rem;">
          ${order.items.map((item) => `<p style="color: rgba(30, 27, 75, 0.7);">${item.name} × ${item.quantity} - ₹${item.price * item.quantity}</p>`).join('')}
        </div>
        <p style="margin-top: 0.5rem; font-weight: 700; color: #7c3aed;">Total: ₹${order.totalAmount}</p>
        <p style="margin-top: 0.5rem; font-size: 0.85rem; color: rgba(30, 27, 75, 0.5);">Placed on ${new Date(order.createdAt).toLocaleString()}</p>
      </div>
    `)
    .join('');
};

const renderSalesSummary = (summary) => {
  salesSummary.innerHTML = `
    <div class="summary-card">
      <h4>Total Sales</h4>
      <strong>₹${summary.totalSales || 0}</strong>
    </div>
    <div class="summary-card">
      <h4>Total Orders</h4>
      <strong>${summary.totalOrders || 0}</strong>
    </div>
    <div class="summary-card">
      <h4>Average Order Value</h4>
      <strong>₹${summary.averageOrderValue?.toFixed(2) || 0}</strong>
    </div>
  `;
};

const fetchMenu = async () => {
  try {
    menuItems = await apiRequest(`${API_BASE}/menu/all`);
    renderMenu(menuItems);
  } catch (error) {
    showNotification(error.message, 'error');
  }
};

const fetchOrders = async () => {
  try {
    const orders = await apiRequest(`${API_BASE}/orders`);
    renderOrders(orders);
  } catch (error) {
    showNotification(error.message, 'error');
  }
};

const fetchSalesSummary = async () => {
  try {
    const summary = await apiRequest(`${API_BASE}/orders/summary/sales`);
    renderSalesSummary(summary);
  } catch (error) {
    showNotification(error.message, 'error');
  }
};

window.editMenuItem = async (id) => {
  const item = menuItems.find((menuItem) => menuItem._id === id);

  if (!item) {
    showNotification('Menu item not found', 'error');
    return;
  }

  const updatedName = prompt('Update item name', item.name);
  if (updatedName === null) {
    return;
  }

  const updatedPriceInput = prompt('Update item price', item.price);
  if (updatedPriceInput === null) {
    return;
  }
  const updatedPrice = parseFloat(updatedPriceInput);
  if (Number.isNaN(updatedPrice) || updatedPrice < 0) {
    showNotification('Please enter a valid price', 'error');
    return;
  }

  const updatedCategory = prompt('Update category', item.category || '');
  if (updatedCategory === null) {
    return;
  }

  const updatedDescription = prompt('Update description', item.description || '');
  if (updatedDescription === null) {
    return;
  }

  const availabilityInput = prompt('Is this item available? (yes/no)', item.isAvailable ? 'yes' : 'no');
  if (availabilityInput === null) {
    return;
  }
  const isAvailable = availabilityInput.trim().toLowerCase() !== 'no';

  try {
    await apiRequest(`${API_BASE}/menu/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        name: updatedName.trim(),
        price: updatedPrice,
        category: updatedCategory.trim(),
        description: updatedDescription.trim(),
        isAvailable
      })
    });

    showNotification('Menu item updated successfully', 'success');
    fetchMenu();
  } catch (error) {
    showNotification(error.message, 'error');
  }
};

window.deleteMenuItem = async (id) => {
  if (!confirm('Are you sure you want to delete this menu item?')) {
    return;
  }

  try {
    await apiRequest(`${API_BASE}/menu/${id}`, {
      method: 'DELETE'
    });
    showNotification('Menu item deleted successfully', 'success');
    fetchMenu();
  } catch (error) {
    showNotification(error.message, 'error');
  }
};

window.updateOrderStatus = async (orderId, newStatus) => {
  if (!newStatus) {
    return;
  }

  try {
    await apiRequest(`${API_BASE}/orders/${orderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status: newStatus })
    });
    showNotification('Order status updated successfully', 'success');
    fetchOrders();
    fetchSalesSummary();
  } catch (error) {
    showNotification(error.message, 'error');
  }
};

addMenuForm?.addEventListener('submit', async (event) => {
  event.preventDefault();

  const name = document.getElementById('menuName').value.trim();
  const price = parseFloat(document.getElementById('menuPrice').value);
  const category = document.getElementById('menuCategory').value.trim();
  const description = document.getElementById('menuDescription').value.trim();

  if (!name || !price) {
    showNotification('Please provide item name and price', 'error');
    return;
  }

  try {
    await apiRequest(`${API_BASE}/menu`, {
      method: 'POST',
      body: JSON.stringify({ name, price, category, description, isAvailable: true })
    });

    showNotification('Menu item added successfully', 'success');
    addMenuForm.reset();
    fetchMenu();
  } catch (error) {
    showNotification(error.message, 'error');
  }
});

logoutBtn?.addEventListener('click', () => {
  localStorage.removeItem('smartcanteen_token');
  localStorage.removeItem('smartcanteen_user');
  window.location.href = '/';
});

fetchMenu();
fetchOrders();
fetchSalesSummary();
