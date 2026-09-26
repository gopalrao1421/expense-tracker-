(function () {
  var session = ET.requireRole('admin');
  if (!session) return;

  document.getElementById('whoami').textContent = session.username;
  document.getElementById('logoutBtn').addEventListener('click', ET.logout);

  var catInput = document.getElementById('catInput');
  var addCatBtn = document.getElementById('addCatBtn');
  var catChipsEl = document.getElementById('catChips');
  var usersBody = document.getElementById('usersBody');

  function renderCategories() {
    var cats = ET.loadCategories();
    catChipsEl.innerHTML = cats.length === 0
      ? '<p class="empty">No categories yet.</p>'
      : cats.map(function (c) {
          return '<span class="chip">' + c + '<button data-cat="' + c + '" aria-label="Remove ' + c + '">✕</button></span>';
        }).join('');
  }

  function addCategory() {
    var name = ET.escapeHtml(catInput.value.trim());
    if (!name) return;
    var cats = ET.loadCategories();
    var exists = cats.some(function (c) { return c.toLowerCase() === name.toLowerCase(); });
    if (!exists) { cats.push(name); ET.saveCategories(cats); renderCategories(); }
    catInput.value = '';
    catInput.focus();
  }
  addCatBtn.addEventListener('click', addCategory);
  catInput.addEventListener('keydown', function (ev) { if (ev.key === 'Enter') { ev.preventDefault(); addCategory(); } });
  catChipsEl.addEventListener('click', function (ev) {
    var btn = ev.target.closest('button[data-cat]');
    if (!btn) return;
    var name = btn.getAttribute('data-cat');
    var cats = ET.loadCategories().filter(function (c) { return c !== name; });
    ET.saveCategories(cats);
    renderCategories();
  });

  function fmt(n) { return '₹' + n.toLocaleString('en-IN', { maximumFractionDigits: 2 }); }

  function renderUsers() {
    var users = ET.loadUsers();
    var allTotal = 0, allTxns = 0;

    document.getElementById('userCount').textContent = users.length;

    usersBody.innerHTML = users.map(function (u) {
      var d = ET.loadJSON('et_data_' + u.username, { members: [], expenses: [] });
      var total = d.expenses.reduce(function (sum, e) { return sum + e.amount; }, 0);
      allTotal += total;
      allTxns += d.expenses.length;
      var delBtn = u.role === 'admin' ? '' : '<button class="del" data-user="' + u.username + '" aria-label="Remove user">✕</button>';
      return '<tr><td>' + u.username + '</td><td>' + u.role + '</td><td>' + d.expenses.length + '</td><td>' + fmt(total) + '</td><td>' + delBtn + '</td></tr>';
    }).join('');

    document.getElementById('allTxnCount').textContent = allTxns;
    document.getElementById('allTotal').textContent = fmt(allTotal);
  }

  usersBody.addEventListener('click', function (ev) {
    var btn = ev.target.closest('button[data-user]');
    if (!btn) return;
    var username = btn.getAttribute('data-user');
    if (!confirm('Remove user "' + username + '" and all their expense data?')) return;
    var users = ET.loadUsers().filter(function (u) { return u.username !== username; });
    ET.saveUsers(users);
    try { localStorage.removeItem('et_data_' + username); } catch (e) {}
    renderUsers();
  });

  renderCategories();
  renderUsers();
})();
