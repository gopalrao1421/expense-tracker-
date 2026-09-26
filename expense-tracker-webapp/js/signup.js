(function () {
  var form = document.getElementById('signupForm');
  var errEl = document.getElementById('formErr');

  form.addEventListener('submit', function (ev) {
    ev.preventDefault();
    var username = document.getElementById('username').value.trim();
    var password = document.getElementById('password').value;
    var confirm = document.getElementById('confirm').value;

    if (!username) { errEl.textContent = 'Enter a username.'; return; }
    if (password.length < 4) { errEl.textContent = 'Password must be at least 4 characters.'; return; }
    if (password !== confirm) { errEl.textContent = 'Passwords do not match.'; return; }

    var users = ET.loadUsers();
    var taken = users.some(function (u) { return u.username.toLowerCase() === username.toLowerCase(); });
    if (taken) { errEl.textContent = 'That username is already taken.'; return; }

    users.push({ username: username, password: password, role: 'user' });
    ET.saveUsers(users);
    ET.setSession({ username: username, role: 'user' });
    window.location.href = 'user.html';
  });
})();
