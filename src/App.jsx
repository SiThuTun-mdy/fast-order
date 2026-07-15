import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import MenuPage from './pages/MenuPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderStatusPage from './pages/OrderStatusPage';
import CashierPage from './pages/CashierPage';
import KitchenPage from './pages/KitchenPage';

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<MenuPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/order/:orderId" element={<OrderStatusPage />} />
          <Route path="/cashier" element={<CashierPage />} />
          <Route path="/kitchen" element={<KitchenPage />} />
        </Routes>
      </main>
    </div>
  );
}
