(function () {
  // If already logged in, skip straight to the right module.
  var existing = ET.getSession();
  if (existing) {
    window.location.href = existing.role === 'admin' ? 'admin.html' : 'user.html';
    return;
  }

  var form = document.getElementById('loginForm');
  var errEl = document.getElementById('formErr');

  form.addEventListener('submit', function (ev) {
    ev.preventDefault();
    var username = document.getElementById('username').value.trim();
    var password = document.getElementById('password').value;

    var users = ET.loadUsers();
    var match = users.find(function (u) {
      return u.username.toLowerCase() === username.toLowerCase() && u.password === password;
    });

    if (!match) {
      errEl.textContent = 'Invalid username or password.';
      return;
    }
    errEl.textContent = '';
    ET.setSession({ username: match.username, role: match.role });
    window.location.href = match.role === 'admin' ? 'admin.html' : 'user.html';
  });
})();
