(function () {
  var session = ET.requireRole('user');
  if (!session) return; // already redirected

  var PERSON_COLORS = ['#028090', '#B08968', '#02C39A', '#5B7B9A', '#00A896', '#9C6B9E', '#8A8F8E', '#C97B4A'];
  var CAT_COLORS = ['#028090', '#00A896', '#02C39A', '#6FB9B3', '#B08968', '#8A8F8E'];
  var DATA_KEY = 'et_data_' + session.username;

  document.getElementById('whoami').textContent = session.username;
  document.getElementById('logoutBtn').addEventListener('click', ET.logout);

  var form = document.getElementById('expenseForm');
  var listEl = document.getElementById('list');
  var barsEl = document.getElementById('bars');
  var personBarsEl = document.getElementById('personBars');
  var errEl = document.getElementById('formErr');
  var memberInput = document.getElementById('memberInput');
  var addMemberBtn = document.getElementById('addMemberBtn');
  var memberChipsEl = document.getElementById('memberChips');
  var paidBySelect = document.getElementById('paidBy');
  var categorySelect = document.getElementById('category');

  function loadData() { return ET.loadJSON(DATA_KEY, { members: [], expenses: [] }); }
  function saveData(d) { ET.saveJSON(DATA_KEY, d); }
  var data = loadData();

  document.getElementById('date').valueAsDate = new Date();

  function fmt(n) { return '₹' + n.toLocaleString('en-IN', { maximumFractionDigits: 2 }); }
  function catColor(cats, name) { return CAT_COLORS[cats.indexOf(name) % CAT_COLORS.length]; }

  function renderCategories() {
    var cats = ET.loadCategories();
    var prev = categorySelect.value;
    categorySelect.innerHTML = cats.map(function (c) { return '<option value="' + c + '">' + c + '</option>'; }).join('');
    if (cats.indexOf(prev) !== -1) categorySelect.value = prev;
  }

  function renderMembers() {
    if (data.members.length === 0) {
      memberChipsEl.innerHTML = '<p class="empty" style="width:100%">Add the people in your group to start splitting expenses.</p>';
    } else {
      memberChipsEl.innerHTML = data.members.map(function (m) {
        return '<span class="chip">' + m + '<button data-member="' + m + '" aria-label="Remove ' + m + '">✕</button></span>';
      }).join('');
    }
    var prev = paidBySelect.value;
    paidBySelect.innerHTML = data.members.length === 0
      ? '<option value="">Add a member first</option>'
      : data.members.map(function (m) { return '<option value="' + m + '">' + m + '</option>'; }).join('');
    if (data.members.indexOf(prev) !== -1) paidBySelect.value = prev;
  }

  function render() {
    var cats = ET.loadCategories();
    var total = 0, byCat = {}, byPerson = {};
    data.expenses.forEach(function (e) {
      total += e.amount;
      byCat[e.category] = (byCat[e.category] || 0) + e.amount;
      if (e.paidBy) byPerson[e.paidBy] = (byPerson[e.paidBy] || 0) + e.amount;
    });

    document.getElementById('totalSpent').textContent = fmt(total);
    document.getElementById('txnCount').textContent = data.expenses.length;
    var topCat = Object.keys(byCat).sort(function (a, b) { return byCat[b] - byCat[a]; })[0];
    document.getElementById('topCat').textContent = topCat || '—';

    if (data.expenses.length === 0) {
      barsEl.innerHTML = '<p class="empty">Add an expense to see the breakdown.</p>';
      personBarsEl.innerHTML = '<p class="empty">Add an expense to see who\'s spending.</p>';
    } else {
      var catNames = Object.keys(byCat).sort(function (a, b) { return byCat[b] - byCat[a]; });
      barsEl.innerHTML = catNames.map(function (c) {
        var pct = Math.round((byCat[c] / total) * 100);
        return '<div class="bar-row"><div class="top"><span>' + c + '</span><span>' + fmt(byCat[c]) + ' · ' + pct + '%</span></div>' +
          '<div class="bar-track"><div class="bar-fill" style="width:' + pct + '%;background:' + catColor(cats, c) + '"></div></div></div>';
      }).join('');

      var people = Object.keys(byPerson).sort(function (a, b) { return byPerson[b] - byPerson[a]; });
      personBarsEl.innerHTML = people.map(function (name, i) {
        var pct = Math.round((byPerson[name] / total) * 100);
        return '<div class="bar-row"><div class="top"><span>' + name + '</span><span>' + fmt(byPerson[name]) + ' · ' + pct + '%</span></div>' +
          '<div class="bar-track"><div class="bar-fill" style="width:' + pct + '%;background:' + PERSON_COLORS[i % PERSON_COLORS.length] + '"></div></div></div>';
      }).join('');
    }

    if (data.expenses.length === 0) {
      listEl.innerHTML = '<p class="empty">No expenses yet — add your first one above.</p>';
    } else {
      var sorted = data.expenses.slice().sort(function (a, b) { return b.date.localeCompare(a.date) || b.id - a.id; });
      listEl.innerHTML = sorted.map(function (e) {
        var d = new Date(e.date + 'T00:00:00');
        var dateLabel = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
        return '<li><span class="cat-dot" style="background:' + catColor(cats, e.category) + '"></span>' +
          '<div class="item-main"><div class="desc">' + (e.desc || e.category) + '</div>' +
          '<div class="meta">' + e.category + (e.paidBy ? ' · Paid by ' + e.paidBy : '') + ' · ' + dateLabel + '</div></div>' +
          '<div class="amt">' + fmt(e.amount) + '</div>' +
          '<button class="del" data-id="' + e.id + '" aria-label="Delete expense">✕</button></li>';
      }).join('');
    }
  }

  function addMember() {
    var name = ET.escapeHtml(memberInput.value.trim());
    if (!name) return;
    var exists = data.members.some(function (m) { return m.toLowerCase() === name.toLowerCase(); });
    if (!exists) { data.members.push(name); saveData(data); renderMembers(); }
    memberInput.value = '';
    memberInput.focus();
  }
  addMemberBtn.addEventListener('click', addMember);
  memberInput.addEventListener('keydown', function (ev) { if (ev.key === 'Enter') { ev.preventDefault(); addMember(); } });
  memberChipsEl.addEventListener('click', function (ev) {
    var btn = ev.target.closest('button[data-member]');
    if (!btn) return;
    var name = btn.getAttribute('data-member');
    data.members = data.members.filter(function (m) { return m !== name; });
    saveData(data);
    renderMembers();
  });

  form.addEventListener('submit', function (ev) {
    ev.preventDefault();
    var amount = parseFloat(document.getElementById('amount').value);
    var paidBy = paidBySelect.value;
    var category = categorySelect.value;
    var desc = ET.escapeHtml(document.getElementById('desc').value.trim());
    var date = document.getElementById('date').value;

    if (!amount || amount <= 0) { errEl.textContent = 'Enter an amount greater than 0.'; return; }
    if (!paidBy) { errEl.textContent = 'Add a group member above and pick who paid.'; return; }
    if (!date) { errEl.textContent = 'Pick a date.'; return; }
    errEl.textContent = '';

    data.expenses.push({ id: Date.now(), amount: amount, paidBy: paidBy, category: category, desc: desc, date: date });
    saveData(data);
    render();
    form.reset();
    document.getElementById('date').valueAsDate = new Date();
    document.getElementById('amount').focus();
  });

  listEl.addEventListener('click', function (ev) {
    var btn = ev.target.closest('.del');
    if (!btn) return;
    var id = Number(btn.getAttribute('data-id'));
    data.expenses = data.expenses.filter(function (e) { return e.id !== id; });
    saveData(data);
    render();
  });

  renderCategories();
  renderMembers();
  render();
})();
