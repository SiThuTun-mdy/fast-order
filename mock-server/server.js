import express from 'express';
import cors from 'cors';
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_PATH = join(__dirname, 'data.json');

const app = express();
app.use(cors());
app.use(express.json());

function getData() {
  return JSON.parse(readFileSync(DATA_PATH, 'utf-8'));
}

function saveData(data) {
  writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
}

function advanceStatus(id, status) {
  const data = getData();
  const idx = data.orders.findIndex((o) => o.id === id);
  if (idx !== -1 && data.orders[idx].status !== 'ready') {
    data.orders[idx].status = status;
    data.orders[idx].updatedAt = new Date().toISOString();
    saveData(data);
    console.log(`[order] ${id} → ${status}`);
  }
}

// GET /api/menu?category=burgers
app.get('/api/menu', (req, res) => {
  const { category } = req.query;
  const { menuItems } = getData();
  const result =
    category && category !== 'all'
      ? menuItems.filter((item) => item.category === category)
      : menuItems;
  res.json(result);
});

// GET /api/categories
app.get('/api/categories', (req, res) => {
  res.json(getData().categories);
});

// POST /api/orders
app.post('/api/orders', (req, res) => {
  const data = getData();
  const order = {
    id: `ORD-${Date.now()}`,
    ...req.body,
    status: 'confirmed',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  data.orders.push(order);
  saveData(data);

  // Auto-advance: confirmed → kitchen → ready for demo purposes
  setTimeout(() => advanceStatus(order.id, 'kitchen'), 15_000);
  setTimeout(() => advanceStatus(order.id, 'ready'), 45_000);

  console.log(`[order] created ${order.id}`);
  res.status(201).json(order);
});

// GET /api/orders/:id
app.get('/api/orders/:id', (req, res) => {
  const order = getData().orders.find((o) => o.id === req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  res.json(order);
});

// PATCH /api/orders/:id/status  (admin / kitchen display)
app.patch('/api/orders/:id/status', (req, res) => {
  const data = getData();
  const idx = data.orders.findIndex((o) => o.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Order not found' });

  const { status } = req.body;
  const valid = ['confirmed', 'kitchen', 'ready'];
  if (!valid.includes(status)) {
    return res.status(400).json({ error: `status must be one of: ${valid.join(', ')}` });
  }

  data.orders[idx].status = status;
  data.orders[idx].updatedAt = new Date().toISOString();
  saveData(data);
  res.json(data.orders[idx]);
});

// GET /api/orders  (admin list)
app.get('/api/orders', (_req, res) => {
  res.json(getData().orders);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () =>
  console.log(`Mock API server running → http://localhost:${PORT}`)
);
