# Frontend — Lost and Found (React + TypeScript + Vite)

SPA frontend for the Lost and Found Management System. Talks to the backend
at `/api/*` via Vite's proxy in dev, or whatever `VITE_API_TARGET` points to.

## Setup

```bash
cd frontend
npm install
npm run dev       # http://localhost:5173  (proxies /api → :5000)
# or
npm run build && npm run preview
```

## Structure

```
src/
  api/            fetch wrapper + typed endpoint helpers
  context/        AuthContext (login/register/logout, JWT in localStorage)
  components/     Navbar, ProtectedRoute, ItemCard
  pages/          LoginPage, RegisterPage, HomePage, ReportItemPage,
                  ItemDetailPage, MyItemsPage, MyClaimsPage, InboxPage, AdminPage
  types/          shared DTO types matching the backend
  styles/         global CSS
```
