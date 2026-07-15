import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import MenuPage from './pages/MenuPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderStatusPage from './pages/OrderStatusPage';
import CashierPage from './pages/CashierPage';
import KitchenPage from './pages/KitchenPage';
import LoginPage from './pages/LoginPage';
import SysAdminPage from './pages/SysAdminPage';
import TenantPage from './pages/TenantPage';
import UserPage from './pages/UserPage';

export default function App() {
  const location = useLocation();
  const hideNavbar = location.pathname === '/login';

  return (
    <div className="min-h-screen bg-gray-50">
      {!hideNavbar && <Navbar />}
      <main>
        <Routes>
          <Route path="/" element={<MenuPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/order/:orderId" element={<OrderStatusPage />} />
          <Route path="/cashier" element={<CashierPage />} />
          <Route path="/kitchen" element={<KitchenPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/sysadmin"
            element={
              <ProtectedRoute requireRole="SysAdmin">
                <SysAdminPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tenant"
            element={
              <ProtectedRoute requireRole="SysAdmin">
                <TenantPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/user"
            element={
              <ProtectedRoute requireRole="SysAdmin">
                <UserPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
    </div>
  );
}
