const API_URL = window.location.origin + '/api';

const token = localStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('user') || '{}');

if (!token || !user) {
  window.location.href = '/';
}

if (user.role !== 'admin') {
  window.location.href = '/user-dashboard.html';
}

const headers = {
  'Content-Type': 'application/json',
  Authorization: `Bearer ${token}`,
};

const adminNameEl = document.getElementById('adminName');
const logoutBtn = document.getElementById('logoutBtn');
const totalOrdersEl = document.getElementById('totalOrders');
const pendingOrdersEl = document.getElementById('pendingOrders');
const inProgressOrdersEl = document.getElementById('inProgressOrders');
const totalRevenueEl = document.getElementById('totalRevenue');
const menuTableContainer = document.getElementById('menuTableContainer');
const ordersTableContainer = document.getElementById('ordersTableContainer');
const showMenuModalBtn = document.getElementById('showMenuModal');
const menuModal = document.getElementById('menuModal');
const closeMenuModalBtn = document.getElementById('closeMenuModal');
const cancelMenuModalBtn = document.getElementById('cancelMenuModal');
const menuForm = document.getElementById('menuForm');
const refreshOrdersBtn = document.getElementById('refreshOrdersBtn');
const adminAlert = document.getElementById('adminAlert');

let currentEditItemId = null;
let menuItems = [];

adminNameEl.textContent = `Hello, ${user.name}!`;

async function fetchSalesSummary() {
  try {
    const response = await fetch(`${API_URL}/admin/sales-summary`, { headers });
    const data = await response.json();
    if (response.ok) {
      totalOrdersEl.textContent = data.totalOrders;
      pendingOrdersEl.textContent = data.pendingOrders;
      inProgressOrdersEl.textContent = data.inProgressOrders;
      totalRevenueEl.textContent = `₹${data.totalRevenue}`;
    }
  } catch (error) {
    console.error('Sales summary error:', error);
  }
}

async function fetchMenu() {
  try {
    const response = await fetch(`${API_URL}/menu`);
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to load menu');
    }
    menuItems = data.menu || [];
    renderMenuTable(menuItems);
  } catch (error) {
    menuTableContainer.innerHTML = `<div class="alert alert-error">${error.message}</div>`;
  }
}

function renderMenuTable(items) {
  if (!items.length) {
    menuTableContainer.innerHTML = '<div class="empty-state">No menu items yet</div>';
    return;
  }

  menuTableContainer.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Price</th>
          <th>Category</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        ${items.map((item) => `
          <tr data-id="${item._id}">
            <td>${item.name}</td>
            <td>₹${item.price}</td>
            <td>${item.category || 'N/A'}</td>
            <td>
              <span class="status-badge ${item.isAvailable ? 'status-completed' : 'status-cancelled'}">
                ${item.isAvailable ? 'Available' : 'Unavailable'}
              </span>
            </td>
            <td>
              <button class="btn btn-sm btn-secondary edit-btn" data-id="${item._id}">Edit</button>
              <button class="btn btn-sm btn-danger delete-btn" data-id="${item._id}">Delete</button>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;

  menuTableContainer.querySelectorAll('.edit-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      openEditModal(id);
    });
  });

  menuTableContainer.querySelectorAll('.delete-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      deleteMenuItem(id);
    });
  });
}

async function fetchOrders() {
  try {
    const response = await fetch(`${API_URL}/admin/orders`, { headers });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to load orders');
    }
    renderOrdersTable(data.orders || []);
  } catch (error) {
    ordersTableContainer.innerHTML = `<div class="alert alert-error">${error.message}</div>`;
  }
}

function renderOrdersTable(orders) {
  if (!orders.length) {
    ordersTableContainer.innerHTML = '<div class="empty-state">No orders yet</div>';
    return;
  }

  ordersTableContainer.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>Token</th>
          <th>Customer</th>
          <th>Total</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        ${orders.map((order) => `
          <tr data-id="${order._id}">
            <td><strong>#${order.token}</strong></td>
            <td>${order.userName}</td>
            <td>₹${order.totalAmount}</td>
            <td>
              <select class="form-control status-select" data-id="${order._id}">
                <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Pending</option>
                <option value="in-progress" ${order.status === 'in-progress' ? 'selected' : ''}>In Progress</option>
                <option value="completed" ${order.status === 'completed' ? 'selected' : ''}>Completed</option>
                <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
              </select>
            </td>
            <td>
              <button class="btn btn-sm btn-primary update-status-btn" data-id="${order._id}">Update</button>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;

  ordersTableContainer.querySelectorAll('.update-status-btn').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const orderId = btn.dataset.id;
      const statusSelect = ordersTableContainer.querySelector(`.status-select[data-id="${orderId}"]`);
      const status = statusSelect.value;
      await updateOrderStatus(orderId, status);
    });
  });
}

showMenuModalBtn.addEventListener('click', () => {
  currentEditItemId = null;
  menuForm.reset();
  document.getElementById('menuModalTitle').textContent = 'Add Menu Item';
  menuModal.classList.add('active');
});

closeMenuModalBtn.addEventListener('click', () => {
  menuModal.classList.remove('active');
});

cancelMenuModalBtn.addEventListener('click', () => {
  menuModal.classList.remove('active');
});

function openEditModal(id) {
  const item = menuItems.find((m) => m._id === id);
  if (!item) return;

  currentEditItemId = id;
  document.getElementById('menuModalTitle').textContent = 'Edit Menu Item';
  document.getElementById('menuItemId').value = id;
  document.getElementById('menuName').value = item.name;
  document.getElementById('menuDescription').value = item.description || '';
  document.getElementById('menuPrice').value = item.price;
  document.getElementById('menuCategory').value = item.category || '';
  document.getElementById('menuAvailability').checked = item.isAvailable;
  menuModal.classList.add('active');
}

menuForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = document.getElementById('menuName').value;
  const description = document.getElementById('menuDescription').value;
  const price = Number(document.getElementById('menuPrice').value);
  const category = document.getElementById('menuCategory').value;
  const isAvailable = document.getElementById('menuAvailability').checked;

  try {
    let response;
    if (currentEditItemId) {
      response = await fetch(`${API_URL}/menu/${currentEditItemId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ name, description, price, category, isAvailable }),
      });
    } else {
      response = await fetch(`${API_URL}/menu`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ name, description, price, category, isAvailable }),
      });
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to save menu item');
    }

    showAlert(data.message, 'success');
    menuModal.classList.remove('active');
    fetchMenu();
  } catch (error) {
    showAlert(error.message, 'error');
  }
});

async function deleteMenuItem(id) {
  if (!confirm('Are you sure you want to delete this menu item?')) return;

  try {
    const response = await fetch(`${API_URL}/menu/${id}`, {
      method: 'DELETE',
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to delete menu item');
    }

    showAlert(data.message, 'success');
    fetchMenu();
  } catch (error) {
    showAlert(error.message, 'error');
  }
}

async function updateOrderStatus(orderId, status) {
  try {
    const response = await fetch(`${API_URL}/admin/orders/${orderId}/status`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ status }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to update order status');
    }

    showAlert(data.message, 'success');
    fetchOrders();
    fetchSalesSummary();
  } catch (error) {
    showAlert(error.message, 'error');
  }
}

function showAlert(message, type = 'info') {
  adminAlert.textContent = message;
  adminAlert.className = `alert alert-${type}`;
  adminAlert.classList.remove('hidden');
  setTimeout(() => {
    adminAlert.classList.add('hidden');
  }, 3000);
}

logoutBtn.addEventListener('click', () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/';
});

refreshOrdersBtn.addEventListener('click', () => {
  fetchOrders();
  fetchSalesSummary();
});

fetchSalesSummary();
fetchMenu();
fetchOrders();
