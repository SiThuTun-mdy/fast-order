import { Link, useNavigate } from "react-router-dom";
import { useCartCount } from "../context/CartContext";
import { useAuth, useAuthDispatch, useHasRole } from "../context/AuthContext";

export default function Navbar() {
  const count = useCartCount();
  const { user } = useAuth();
  const dispatch = useAuthDispatch();
  const isSysAdmin = useHasRole("SysAdmin");
  const isAdmin = useHasRole("Admin");
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    dispatch({ type: "LOGOUT" });
    navigate("/login");
  };

  return (
    <nav className="sticky top-0 z-40 bg-white shadow-sm">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link
          to="/"
          className="flex items-center gap-2 font-bold text-xl text-orange-500"
        >
          🍽️ <span>FastOrder</span>
        </Link>

        <div className="flex items-center gap-1">
          <Link
            to="/cashier"
            className="text-sm font-medium text-gray-700 hover:text-orange-500 transition-colors p-2 rounded-lg hover:bg-orange-50"
          >
            Cashier
          </Link>

          <Link
            to="/kitchen"
            className="text-sm font-medium text-gray-700 hover:text-orange-500 transition-colors p-2 rounded-lg hover:bg-orange-50"
          >
            Kitchen
          </Link>

          {isSysAdmin && (
            <Link
              to="/sysadmin"
              className="text-sm font-medium text-gray-700 hover:text-orange-500 transition-colors p-2 rounded-lg hover:bg-orange-50"
            >
              SysAdmin
            </Link>
          )}

          {isAdmin && (
            <Link
              to="/admin"
              className="text-sm font-medium text-gray-700 hover:text-orange-500 transition-colors p-2 rounded-lg hover:bg-orange-50"
            >
              Admin
            </Link>
          )}

          {user ? (
            <button
              onClick={handleLogout}
              className="text-sm font-medium text-gray-700 hover:text-orange-500 transition-colors p-2 rounded-lg hover:bg-orange-50"
            >
              Logout
            </button>
          ) : (
            <Link
              to="/login"
              className="text-sm font-medium text-gray-700 hover:text-orange-500 transition-colors p-2 rounded-lg hover:bg-orange-50"
            >
              Login
            </Link>
          )}

          <Link
            to="/cart"
            className="relative flex items-center gap-1.5 text-sm font-medium text-gray-700 hover:text-orange-500 transition-colors p-2 rounded-lg hover:bg-orange-50"
            aria-label={`Cart (${count} items)`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.35 2.7A1 1 0 007 17h10m-7 2a1 1 0 100 2 1 1 0 000-2zm7 0a1 1 0 100 2 1 1 0 000-2z"
              />
            </svg>
            <span className="hidden sm:inline">Cart</span>
            {count > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-orange-500 text-white text-xs font-bold rounded-full min-w-[1.25rem] h-5 flex items-center justify-center px-1">
                {count > 99 ? "99+" : count}
              </span>
            )}
          </Link>
        </div>
      </div>
    </nav>
  );
}
