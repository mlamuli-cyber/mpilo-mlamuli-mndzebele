# Help Desk — Interactive Demo

A self-contained, fully interactive demo of the Help Desk ticketing platform, built to run entirely as static files (no server needed) so it can be deployed straight to Netlify.

## Why this exists

The real app (`/backend` in this repo) is a full Node/Express + SQLite backend with server-side sessions. Static hosts like Netlify can't run that directly, so this demo re-implements the same logic — auth, role-based access, ticket auto-assignment, department/user management — entirely in client-side JavaScript, persisted to your browser's localStorage.

## Try it

Open `index.html` → **Log In** → pick any of the four demo accounts on the login screen:

| Role | Username | Password |
|---|---|---|
| Admin | `admin` | `admin123` |
| Technician | `sipho.t` | `demo123` |
| User (employee) | `thabo.s` | `demo123` |
| Client | `amanda.client` | `demo123` |

Each visitor's changes are local to their own browser — nothing is shared between visitors, and there's a **Reset demo data** link in the banner at the top of every page if you want to start over.

## Structure

```
demo/
  index.html               Landing page
  login.html                Sign in + quick demo logins
  dashboard.html             User/Client "My Tickets" view
  admin.html                  Admin/Technician overview
  admin-tickets.html           All tickets (staff), with filters
  admin-departments.html        Manage departments (admin only)
  admin-users.html               Manage users (admin only)
  ticket-new.html                  Log a new ticket
  ticket.html                       Ticket detail — comments, status, assignment
  error.html / 404.html              Fallback pages
  css/style.css                      Ported from the real app's stylesheet
  css/demo.css                        Demo-only additions (banner, quick-login cards)
  js/demo-data.js                      The "fake backend" — auth, CRUD, auto-assignment
  js/ui.js                              Shared nav/topbar/footer chrome
  js/app.js                              Password toggles, table search, theme toggle
```

## Deploying

Point Netlify's publish directory at this `demo/` folder — it's plain static files, no build step required.
