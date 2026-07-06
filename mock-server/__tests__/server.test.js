// @vitest-environment node
import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach, vi } from 'vitest';
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import request from 'supertest';
import app from '../server.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_PATH = join(__dirname, '..', 'data.json');

// data-builders: obviously-fake fixture data only — never real/realistic PII.
// This intentionally overwrites mock-server/data.json for the duration of the
// test run and restores the original bytes afterward (iso-cleanup), so tests
// never leak state into each other (iso-no-shared-state) and never leave
// fixture data committed in place of the real file.
function buildFixtureData(overrides = {}) {
  return {
    categories: [{ id: 'all', name: 'All Items', icon: '🍽️' }],
    menuItems: [
      { id: 101, name: 'Fixture Burger', category: 'burgers', price: 5, emoji: '🍔' },
      { id: 102, name: 'Fixture Soda', category: 'drinks', price: 2, emoji: '🥤' },
    ],
    orders: [
      {
        id: 'ORD-FIXTURE-1',
        customerName: 'Test Customer',
        phone: '+10000000000',
        orderType: 'takeaway',
        items: [{ id: 101, name: 'Fixture Burger', price: 5, quantity: 1, emoji: '🍔' }],
        subtotal: 5,
        tax: 0.5,
        total: 5.5,
        status: 'confirmed',
        createdAt: '2020-01-01T00:00:00.000Z',
        updatedAt: '2020-01-01T00:00:00.000Z',
      },
    ],
    ...overrides,
  };
}

function readDataFile() {
  return JSON.parse(readFileSync(DATA_PATH, 'utf-8'));
}

function writeDataFile(data) {
  writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
}

let originalDataFileContents;

describe('mock-server routes', () => {
  beforeAll(() => {
    originalDataFileContents = readFileSync(DATA_PATH, 'utf-8');
  });

  afterAll(() => {
    writeFileSync(DATA_PATH, originalDataFileContents);
  });

  beforeEach(() => {
    writeDataFile(buildFixtureData());
    // Fake timers so the setTimeout(15s)/setTimeout(45s) auto-advance in
    // POST /api/orders never actually fires a real timer during the test run
    // (which would otherwise write to data.json after we've restored it).
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  describe('GET /api/menu', () => {
    it('returns every menu item when no category filter is given', async () => {
      const res = await request(app).get('/api/menu');

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(2);
    });

    it('filters items by category when a category query param is given', async () => {
      const res = await request(app).get('/api/menu').query({ category: 'drinks' });

      expect(res.status).toBe(200);
      expect(res.body).toEqual([
        expect.objectContaining({ id: 102, name: 'Fixture Soda', category: 'drinks' }),
      ]);
    });
  });

  describe('POST /api/orders', () => {
    it('creates a new order with status "confirmed" and an ORD- id', async () => {
      const payload = {
        customerName: 'Fixture Customer',
        phone: '+19999999999',
        items: [{ id: 101, name: 'Fixture Burger', price: 5, quantity: 2 }],
        subtotal: 10,
        tax: 1,
        total: 11,
      };

      const res = await request(app).post('/api/orders').send(payload);

      expect(res.status).toBe(201);
      expect(res.body).toEqual(
        expect.objectContaining({
          id: expect.stringMatching(/^ORD-\d+$/),
          customerName: 'Fixture Customer',
          status: 'confirmed',
        })
      );
    });

    it('persists the created order so it is retrievable by GET /api/orders/:id', async () => {
      const payload = { customerName: 'Fixture Customer', items: [], subtotal: 0, tax: 0, total: 0 };
      const created = await request(app).post('/api/orders').send(payload);

      const res = await request(app).get(`/api/orders/${created.body.id}`);

      expect(res.status).toBe(200);
      expect(res.body.id).toBe(created.body.id);
    });
  });

  describe('PATCH /api/orders/:id/status', () => {
    it('updates the status of an existing order', async () => {
      const res = await request(app)
        .patch('/api/orders/ORD-FIXTURE-1/status')
        .send({ status: 'kitchen' });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('kitchen');
      expect(readDataFile().orders[0].status).toBe('kitchen');
    });

    it('returns 404 for an order id that does not exist', async () => {
      const res = await request(app)
        .patch('/api/orders/ORD-DOES-NOT-EXIST/status')
        .send({ status: 'kitchen' });

      expect(res.status).toBe(404);
      expect(res.body).toEqual({ error: 'Order not found' });
    });

    it('returns 400 for a status value outside the allowed set', async () => {
      const res = await request(app)
        .patch('/api/orders/ORD-FIXTURE-1/status')
        .send({ status: 'cancelled' });

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/status must be one of/);
    });
  });
});
