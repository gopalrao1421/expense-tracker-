# Expense Tracker

A multi-page Expense Tracker built with **only HTML, CSS and JavaScript** (no frameworks, no backend). Data is stored entirely in the browser's LocalStorage.

## Modules

- **Admin Module** (`admin.html`) — manage the master list of expense categories, and view every registered user with their transaction count and total spend. Admin can also remove a user.
- **User Module** (`user.html`) — sign up, add group members, log expenses (amount, category, who paid, date, note), and see live totals, a category breakdown, and a per-person spending breakdown.

## Pages

| File | Purpose |
|---|---|
| `index.html` | Login |
| `signup.html` | Create a new User account |
| `user.html` | User Module (expense tracker) |
| `admin.html` | Admin Module (category + user management) |
| `css/style.css` | All styling (CSS Grid for page layout, Flexbox for components) |
| `js/common.js` | Shared: accounts, session, categories |
| `js/login.js`, `js/signup.js`, `js/user.js`, `js/admin.js` | Page-specific logic |

## Running it

No build step or server needed — just open `index.html` in a browser (or use VS Code's "Live Server" extension for auto-reload).

**Demo admin login:** username `admin`, password `admin123` (seeded automatically on first load).
**User accounts:** created via the Sign Up page.

Navigation between modules is handled entirely in JavaScript: after login, `login.js` checks the account's role and redirects with `window.location.href` to `user.html` or `admin.html`; both pages guard themselves on load and bounce back to `index.html` if there's no valid session.

## Pushing to GitHub

From inside this project folder:

```bash
git init
git add .
git commit -m "Expense Tracker - Admin and User modules"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo-name>.git
git push -u origin main
```

Create the empty repository on GitHub first (no README/license, so it stays empty) and swap in its URL above.
