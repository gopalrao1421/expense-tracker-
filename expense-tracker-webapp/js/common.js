// common.js — shared across all pages: user accounts, session, and the
// master category list that Admin manages and User consumes.
(function () {
  var USERS_KEY = 'et_users';
  var SESSION_KEY = 'et_session';
  var CATS_KEY = 'et_categories';
  var DEFAULT_CATS = ['Food', 'Transport', 'Bills', 'Entertainment', 'Shopping', 'Other'];

  function loadJSON(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) { return fallback; }
  }
  function saveJSON(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) {}
  }

  function loadUsers() { return loadJSON(USERS_KEY, []); }
  function saveUsers(users) { saveJSON(USERS_KEY, users); }

  // Seed one default admin account so the Admin Module is reachable
  // without building a separate "create admin" flow.
  function seedAdmin() {
    var users = loadUsers();
    if (!users.some(function (u) { return u.role === 'admin'; })) {
      users.push({ username: 'admin', password: 'admin123', role: 'admin' });
      saveUsers(users);
    }
  }
  seedAdmin();

  function seedCategories() {
    if (!localStorage.getItem(CATS_KEY)) saveJSON(CATS_KEY, DEFAULT_CATS.slice());
  }
  seedCategories();
  function loadCategories() { return loadJSON(CATS_KEY, DEFAULT_CATS.slice()); }
  function saveCategories(cats) { saveJSON(CATS_KEY, cats); }

  function getSession() { return loadJSON(SESSION_KEY, null); }
  function setSession(session) { saveJSON(SESSION_KEY, session); }
  function clearSession() { try { localStorage.removeItem(SESSION_KEY); } catch (e) {} }

  // Redirects to index.html unless the current session matches `role`.
  // Returns the session object so pages can read the username.
  function requireRole(role) {
    var s = getSession();
    if (!s || s.role !== role) { window.location.href = 'index.html'; return null; }
    return s;
  }

  function logout() { clearSession(); window.location.href = 'index.html'; }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  window.ET = {
    loadUsers: loadUsers, saveUsers: saveUsers,
    loadCategories: loadCategories, saveCategories: saveCategories,
    getSession: getSession, setSession: setSession, clearSession: clearSession,
    requireRole: requireRole, logout: logout,
    loadJSON: loadJSON, saveJSON: saveJSON, escapeHtml: escapeHtml
  };
})();
