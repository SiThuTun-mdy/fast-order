import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, useAuthDispatch } from '../context/AuthContext';
import { SidebarTrigger } from './ui/sidebar';

function initials(username) {
  if (!username) return '?';
  return username.slice(0, 2).toUpperCase();
}

export default function AppHeader({ showSidebarTrigger = false }) {
  const { user } = useAuth();
  const dispatch = useAuthDispatch();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [notifOpen, setNotifOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const notifRef = useRef(null);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) setNotifOpen(false);
      if (menuRef.current && !menuRef.current.contains(event.target)) setMenuOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    dispatch({ type: 'LOGOUT' });
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center gap-4">
        {showSidebarTrigger && <SidebarTrigger />}
        <Link to="/" className="font-bold text-xl text-yellow-500 shrink-0">
          FastOrder
        </Link>

        {user && (
          <div className="hidden sm:block flex-1 max-w-md">
            <div className="relative">
              <svg
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" />
              </svg>
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-9 pr-3 text-sm text-gray-700 placeholder-gray-400 focus:border-yellow-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-yellow-100"
              />
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 ml-auto">
          {user && (
            <div className="relative" ref={notifRef}>
              <button
                type="button"
                onClick={() => setNotifOpen((o) => !o)}
                aria-label="Notifications"
                className="relative rounded-lg p-2 text-gray-500 hover:bg-yellow-50 hover:text-yellow-600 transition-colors"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.8}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
              </button>
              {notifOpen && (
                <div className="absolute right-0 mt-2 w-72 rounded-xl border border-gray-100 bg-white p-3 shadow-lg">
                  <p className="px-1 pb-2 text-sm font-semibold text-gray-900">Notifications</p>
                  <p className="px-1 py-4 text-center text-sm text-gray-400">No new notifications</p>
                </div>
              )}
            </div>
          )}

          {user ? (
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuOpen((o) => !o)}
                className="flex items-center gap-2 rounded-lg p-1.5 hover:bg-yellow-50 transition-colors"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-500 text-xs font-semibold text-white">
                  {initials(user.username)}
                </span>
                <span className="text-sm font-medium text-gray-700 hidden sm:inline">{user.username}</span>
              </button>
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-44 rounded-xl border border-gray-100 bg-white p-1 shadow-lg">
                  <Link
                    to="/profile"
                    onClick={() => setMenuOpen(false)}
                    className="block w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-gray-700 hover:bg-yellow-50 hover:text-yellow-600 transition-colors"
                  >
                    My Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-gray-700 hover:bg-yellow-50 hover:text-yellow-600 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className="text-sm font-medium text-gray-700 hover:text-yellow-500 transition-colors px-3 py-2 rounded-lg hover:bg-yellow-50"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
