const API_BASE = '/api';

const notificationEl = document.getElementById('notification');
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const userLoginTab = document.getElementById('userLoginTab');
const adminLoginTab = document.getElementById('adminLoginTab');

let selectedLoginRole = 'user';

const showNotification = (message, type = 'success') => {
  notificationEl.textContent = message;
  notificationEl.className = `notification show ${type}`;
  setTimeout(() => {
    notificationEl.className = 'notification';
    notificationEl.textContent = '';
  }, 4000);
};

const saveSession = ({ token, user }) => {
  localStorage.setItem('smartcanteen_token', token);
  localStorage.setItem('smartcanteen_user', JSON.stringify(user));
};

const redirectToDashboard = (role) => {
  if (role === 'admin') {
    window.location.href = '/admin-dashboard.html';
  } else {
    window.location.href = '/user-dashboard.html';
  }
};

const existingToken = localStorage.getItem('smartcanteen_token');
const existingUser = localStorage.getItem('smartcanteen_user');

if (existingToken && existingUser) {
  try {
    const user = JSON.parse(existingUser);
    redirectToDashboard(user.role);
  } catch (error) {
    localStorage.removeItem('smartcanteen_token');
    localStorage.removeItem('smartcanteen_user');
  }
}

const setActiveTab = (role) => {
  selectedLoginRole = role;
  if (role === 'admin') {
    adminLoginTab.classList.add('active');
    userLoginTab.classList.remove('active');
  } else {
    userLoginTab.classList.add('active');
    adminLoginTab.classList.remove('active');
  }
};

userLoginTab?.addEventListener('click', () => setActiveTab('user'));
adminLoginTab?.addEventListener('click', () => setActiveTab('admin'));

loginForm?.addEventListener('submit', async (event) => {
  event.preventDefault();
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value.trim();

  try {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Login failed');
    }

    if (data.user.role !== selectedLoginRole) {
      throw new Error('Role mismatch. Please ensure you selected the correct login option.');
    }

    saveSession(data);
    showNotification('Login successful! Redirecting...', 'success');
    setTimeout(() => redirectToDashboard(data.user.role), 800);
  } catch (error) {
    showNotification(error.message, 'error');
  }
});

signupForm?.addEventListener('submit', async (event) => {
  event.preventDefault();
  const name = document.getElementById('signupName').value.trim();
  const email = document.getElementById('signupEmail').value.trim();
  const password = document.getElementById('signupPassword').value.trim();
  const role = document.getElementById('signupRole').value;

  try {
    const response = await fetch(`${API_BASE}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, role })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Sign up failed');
    }

    saveSession(data);
    showNotification('Account created successfully! Redirecting...', 'success');
    setTimeout(() => redirectToDashboard(data.user.role), 800);
  } catch (error) {
    showNotification(error.message, 'error');
  }
});
