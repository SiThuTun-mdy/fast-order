import { Routes, Route, useLocation } from "react-router-dom";
import AppLayout from "./components/AppLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import MenuPage from "./pages/MenuPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import OrderStatusPage from "./pages/OrderStatusPage";
import CashierPage from "./pages/CashierPage";
import KitchenPage from "./pages/KitchenPage";
import LoginPage from "./pages/LoginPage";
import SysAdminPage from "./pages/SysAdminPage";
import TenantPage from "./pages/TenantPage";
import UserPage from "./pages/UserPage";
import AdminPage from "./pages/AdminPage";
import AdminUserPage from "./pages/AdminUserPage";
import AdminMenuPage from "./pages/AdminMenuPage";
import AdminCategoryPage from "./pages/AdminCategoryPage";
import MyProfilePage from "./pages/MyProfilePage";

export default function App() {
  const location = useLocation();
  const isLoginRoute = location.pathname === "/login";
  const isPublicMenuRoute = location.pathname === "/";
  const routes = (
    <Routes>
      <Route path="/" element={<MenuPage />} />
      <Route path="/cart" element={<CartPage />} />
      <Route path="/checkout" element={<CheckoutPage />} />
      <Route path="/order/:orderId" element={<OrderStatusPage />} />
      <Route path="/cashier" element={<CashierPage />} />
      <Route path="/kitchen" element={<KitchenPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <MyProfilePage />
          </ProtectedRoute>
        }
      />
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
      <Route
        path="/admin"
        element={
          <ProtectedRoute requireRole="Admin">
            <AdminPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/:tenantId/user"
        element={
          <ProtectedRoute requireRole="Admin" requireTenantMatch>
            <AdminUserPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/:tenantId/menu"
        element={
          <ProtectedRoute requireRole="Admin" requireTenantMatch>
            <AdminMenuPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/:tenantId/category"
        element={
          <ProtectedRoute requireRole="Admin" requireTenantMatch>
            <AdminCategoryPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/cashier"
        element={
          <ProtectedRoute requireRole="cashier" requireTenantMatch>
            <CashierPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/kitchen"
        element={
          <ProtectedRoute requireRole="kitchen" requireTenantMatch>
            <KitchenPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  );

  if (isLoginRoute) {
    return (
      <div className="min-h-screen bg-gray-50">
        <main>{routes}</main>
      </div>
    );
  }

  return <AppLayout showSidebar={!isPublicMenuRoute}>{routes}</AppLayout>;
}
