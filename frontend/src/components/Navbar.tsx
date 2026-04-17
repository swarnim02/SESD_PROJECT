import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? '';
  const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
  return (first + last).toUpperCase() || '?';
}

export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <nav className="nav">
      <Link to="/" className="brand">
        <span className="brand-logo">LF</span>
        <span>Lost &amp; Found</span>
      </Link>
      <NavLink to="/browse">Browse</NavLink>
      {user && <NavLink to="/report-lost">Report Lost</NavLink>}
      {user && <NavLink to="/report-found">Report Found</NavLink>}
      {user && <NavLink to="/my-items">My Items</NavLink>}
      {user && <NavLink to="/my-claims">My Claims</NavLink>}
      {user && <NavLink to="/inbox">Inbox</NavLink>}
      {user?.role === 'admin' && <NavLink to="/admin">Admin</NavLink>}
      <div className="spacer" />
      {user ? (
        <>
          <span className="user-chip">
            <span className="avatar">{initials(user.name)}</span>
            <span>{user.name}</span>
            {user.role === 'admin' && <span className="pill open" style={{ padding: '1px 8px' }}>admin</span>}
          </span>
          <button className="btn ghost small" onClick={handleLogout}>Logout</button>
        </>
      ) : (
        <>
          <NavLink to="/login">Login</NavLink>
          <Link to="/register" className="btn small">Sign up</Link>
        </>
      )}
    </nav>
  );
}
