// main.js — lightweight client-side auth & navigation for FlowTrack
// Provides mock signup/login (localStorage-based) and redirects to notes.html on success.

(function () {
  const USER_KEY = 'currentUser';  // Changed to match profile.js

  // Auth protection for protected pages
  function checkAuth() {
    const publicPages = ['index.html', 'login.html', 'signup.html'];
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    // Always allow public pages
    if (publicPages.includes(currentPage)) {
      return true;
    }

    try {
      // Check both storage locations for consistency
      const user = JSON.parse(localStorage.getItem('currentUser'));
      if (!user || !user.email) {
        throw new Error('No valid user data');
      }
      return true;
    } catch (error) {
      console.error('Auth check failed:', error);
      window.location.href = 'login.html';
      return false;
    }
  }

  function qs(sel) { return document.querySelector(sel); }

  function showMessage(container, text, isError) {
    if (!container) return;
    container.textContent = text;
    container.style.color = isError ? '#fb7185' : 'var(--color-accent)';
    // auto-clear after 4s
    if (text) {
      setTimeout(() => {
        if (container.textContent === text) container.textContent = '';
      }, 4000);
    }
  }

  function saveUser(user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  function loadUser() {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      console.error('Error loading user:', e);
      return null;
    }
  }

  function handleSignup(e) {
    e.preventDefault();
    const name = qs('#name') ? qs('#name').value.trim() : '';
    const email = qs('#email') ? qs('#email').value.trim().toLowerCase() : '';
    const password = qs('#password') ? qs('#password').value : '';
    const msg = qs('#auth-message');

    if (!name || !email || !password) {
      showMessage(msg, 'Please fill all fields.', true);
      return;
    }

    const existing = loadUser();
    if (existing && existing.email === email) {
      showMessage(msg, 'An account with that email already exists. Please login.', true);
      return;
    }

    // Create user object with additional information
    const newUser = {
      name,
      email,
      password, // In a real app, this should be hashed
      joinDate: new Date().toISOString(),
      theme: 'light',
      lastActive: new Date().toISOString(),
      isAuthenticated: true
    };

    // Save both to maintain consistency
    localStorage.setItem('currentUser', JSON.stringify(newUser));
    saveUser(newUser);
    
    showMessage(msg, 'Account created! Redirecting...');

    setTimeout(() => {
      window.location.href = 'tasks.html';
    }, 800);
  }

  function handleLogin(e) {
    e.preventDefault();
    const email = qs('#email') ? qs('#email').value.trim().toLowerCase() : '';
    const password = qs('#password') ? qs('#password').value : '';
    const msg = qs('#auth-message');

    if (!email || !password) {
      showMessage(msg, 'Please enter email and password.', true);
      return;
    }

    const user = loadUser();
    if (!user || user.email !== email || user.password !== password) {
      showMessage(msg, 'Invalid credentials. Try again.', true);
      return;
    }

    // Update user data with all required fields
    const updatedUser = {
      ...user,
      lastActive: new Date().toISOString(),
      joinDate: user.joinDate || new Date().toISOString(),
      isAuthenticated: true
    };
    
    // Save to both storage locations for consistency
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    saveUser(updatedUser);

    showMessage(msg, 'Login successful! Redirecting...');
    setTimeout(() => {
      window.location.href = 'tasks.html';
    }, 600);
  }

  document.addEventListener('DOMContentLoaded', function () {
    // Check auth status first
    if (!checkAuth()) return;

    const signupForm = qs('#signup-form');
    const loginForm = qs('#login-form');

    if (signupForm) signupForm.addEventListener('submit', handleSignup);
    if (loginForm) loginForm.addEventListener('submit', handleLogin);

    // Set up logout handlers
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        // Clear all auth-related storage
        localStorage.removeItem('currentUser');
        localStorage.removeItem(USER_KEY);
        window.location.href = 'login.html';
      });
    }

    // If user is already logged (exists in localStorage), optionally auto-redirect from login/signup to app
    const user = loadUser();
    // We won't auto-redirect from index (landing) but if user visits login/signup and is present, allow shortcut
    if (user && (loginForm || signupForm)) {
      const msg = qs('#auth-message');
      showMessage(msg, 'Detected account — redirecting to app...');
      setTimeout(() => { window.location.href = 'notes.html'; }, 800);
    }
  });
})();
