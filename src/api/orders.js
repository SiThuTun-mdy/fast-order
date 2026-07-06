import client from './client';
import { menuItems, categories } from '../data/mockMenu';

export async function getMenuItems(category) {
  try {
    const params = category && category !== 'all' ? { category } : {};
    return await client.get('/menu', { params });
  } catch {
    if (category && category !== 'all') {
      return menuItems.filter((item) => item.category === category);
    }
    return menuItems;
  }
}

export async function getCategories() {
  try {
    return await client.get('/categories');
  } catch {
    return categories;
  }
}

export async function createOrder(orderData) {
  try {
    return await client.post('/orders', orderData);
  } catch {
    // Offline fallback: build a local order and simulate status via timestamps
    const mockOrder = {
      id: `ORD-${Date.now()}`,
      ...orderData,
      status: 'confirmed',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    sessionStorage.setItem(`order-${mockOrder.id}`, JSON.stringify(mockOrder));
    return mockOrder;
  }
}

function simulatedStatus(createdAt) {
  const elapsed = Date.now() - new Date(createdAt).getTime();
  if (elapsed > 45000) return 'ready';
  if (elapsed > 15000) return 'kitchen';
  return 'confirmed';
}

export async function getOrder(id) {
  try {
    return await client.get(`/orders/${id}`);
  } catch {
    const stored = sessionStorage.getItem(`order-${id}`);
    if (stored) {
      const order = JSON.parse(stored);
      return { ...order, status: simulatedStatus(order.createdAt) };
    }
    throw new Error('Order not found');
  }
}
