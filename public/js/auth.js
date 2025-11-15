const API_URL = window.location.origin + '/api';

const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const switchToSignupBtn = document.getElementById('switchToSignup');
const switchToLoginBtn = document.getElementById('switchToLogin');
const signupPrompt = document.getElementById('signupPrompt');
const loginPrompt = document.getElementById('loginPrompt');
const authAlert = document.getElementById('authAlert');
const roleOptions = document.querySelectorAll('.role-option');

let isSignupMode = false;

function setMode(mode) {
  isSignupMode = mode === 'signup';
  loginForm.classList.toggle('hidden', isSignupMode);
  signupForm.classList.toggle('hidden', !isSignupMode);
  signupPrompt.classList.toggle('hidden', isSignupMode);
  loginPrompt.classList.toggle('hidden', !isSignupMode);
  authAlert.classList.add('hidden');
}

switchToSignupBtn.addEventListener('click', () => setMode('signup'));
switchToLoginBtn.addEventListener('click', () => setMode('login'));

setMode('login');

roleOptions.forEach(option => {
  option.addEventListener('click', () => {
    roleOptions.forEach(opt => opt.classList.remove('active'));
    option.classList.add('active');
    option.querySelector('input[type="radio"]').checked = true;
  });
});

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;

  const loginButton = document.getElementById('loginButton');
  loginButton.disabled = true;
  loginButton.textContent = 'Logging in...';

  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (response.ok) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      showAlert('Login successful! Redirecting...', 'success');
      
      setTimeout(() => {
        if (data.user.role === 'admin') {
          window.location.href = '/admin-dashboard.html';
        } else {
          window.location.href = '/user-dashboard.html';
        }
      }, 1000);
    } else {
      showAlert(data.message || 'Login failed. Please try again.', 'error');
      loginButton.disabled = false;
      loginButton.innerHTML = '<span role="img" aria-label="login">🔐</span> Log In';
    }
  } catch (error) {
    console.error('Login error:', error);
    showAlert('An error occurred. Please try again.', 'error');
    loginButton.disabled = false;
    loginButton.innerHTML = '<span role="img" aria-label="login">🔐</span> Log In';
  }
});

signupForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = document.getElementById('signupName').value;
  const email = document.getElementById('signupEmail').value;
  const password = document.getElementById('signupPassword').value;
  const role = document.querySelector('input[name="role"]:checked').value;

  const signupButton = document.getElementById('signupButton');
  signupButton.disabled = true;
  signupButton.textContent = 'Creating account...';

  try {
    const response = await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, role })
    });

    const data = await response.json();

    if (response.ok) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      showAlert('Account created successfully! Redirecting...', 'success');
      
      setTimeout(() => {
        if (data.user.role === 'admin') {
          window.location.href = '/admin-dashboard.html';
        } else {
          window.location.href = '/user-dashboard.html';
        }
      }, 1000);
    } else {
      showAlert(data.message || 'Signup failed. Please try again.', 'error');
      signupButton.disabled = false;
      signupButton.innerHTML = '<span role="img" aria-label="spark">✨</span> Create Account';
    }
  } catch (error) {
    console.error('Signup error:', error);
    showAlert('An error occurred. Please try again.', 'error');
    signupButton.disabled = false;
    signupButton.innerHTML = '<span role="img" aria-label="spark">✨</span> Create Account';
  }
});

function showAlert(message, type) {
  authAlert.textContent = message;
  authAlert.className = `alert alert-${type}`;
  authAlert.classList.remove('hidden');
}
