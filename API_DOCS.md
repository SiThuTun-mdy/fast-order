# Fast-Order API Documentation

Mock server runs on **http://localhost:3001**. The Vite dev server proxies `/api/*` to it automatically.

---

## Base URL

```
http://localhost:3001/api
```

---

## Endpoints

### Menu

#### `GET /api/categories`

Returns all menu categories.

**Response `200`**
```json
[
  { "id": "all",      "name": "All Items", "icon": "🍽️" },
  { "id": "burgers",  "name": "Burgers",   "icon": "🍔" },
  { "id": "pizza",    "name": "Pizza",     "icon": "🍕" },
  { "id": "drinks",   "name": "Drinks",    "icon": "🥤" },
  { "id": "desserts", "name": "Desserts",  "icon": "🍰" },
  { "id": "sides",    "name": "Sides",     "icon": "🍟" }
]
```

---

#### `GET /api/menu`

Returns menu items. Filter by category with a query param.

**Query params**

| Param      | Type   | Description                                      |
|------------|--------|--------------------------------------------------|
| `category` | string | Optional. One of: `burgers`, `pizza`, `drinks`, `desserts`, `sides`. Omit (or `all`) for everything. |

**Example**
```
GET /api/menu?category=burgers
```

**Response `200`**
```json
[
  {
    "id": 1,
    "name": "Classic Cheeseburger",
    "category": "burgers",
    "price": 8.99,
    "description": "Beef patty with cheddar, lettuce, tomato & pickles",
    "emoji": "🍔",
    "popular": true
  }
]
```

**MenuItem schema**

| Field         | Type    | Description                          |
|---------------|---------|--------------------------------------|
| `id`          | number  | Unique identifier                    |
| `name`        | string  | Display name                         |
| `category`    | string  | Category slug                        |
| `price`       | number  | Price in USD                         |
| `description` | string  | Short description                    |
| `emoji`       | string  | Emoji icon for display               |
| `popular`     | boolean | Whether to show a "Popular" badge    |

---

### Orders

#### `POST /api/orders`

Places a new order. The server auto-advances status for demo:
- **+15 s** → `kitchen`
- **+45 s** → `ready`

**Request body**
```json
{
  "customerName": "Jane Smith",
  "phone": "555-0100",
  "orderType": "dine-in",
  "tableNumber": "7",
  "notes": "No onions please",
  "items": [
    { "id": 1, "name": "Classic Cheeseburger", "price": 8.99, "quantity": 2, "emoji": "🍔" },
    { "id": 13, "name": "Crispy Fries", "price": 3.49, "quantity": 1, "emoji": "🍟" }
  ],
  "subtotal": 21.47,
  "tax": 2.15,
  "total": 23.62
}
```

**Request fields**

| Field         | Type   | Required | Description                              |
|---------------|--------|----------|------------------------------------------|
| `customerName`| string | Yes      | Full name                                |
| `phone`       | string | Yes      | Contact phone number                     |
| `orderType`   | string | Yes      | `"dine-in"` or `"takeout"`              |
| `tableNumber` | string | No       | Required when `orderType` is `"dine-in"` |
| `notes`       | string | No       | Special instructions                     |
| `items`       | array  | Yes      | Array of ordered items                   |
| `subtotal`    | number | Yes      | Pre-tax total                            |
| `tax`         | number | Yes      | Tax amount                               |
| `total`       | number | Yes      | Grand total                              |

**Response `201`**
```json
{
  "id": "ORD-1719484800000",
  "customerName": "Jane Smith",
  "phone": "555-0100",
  "orderType": "dine-in",
  "tableNumber": "7",
  "notes": "",
  "items": [...],
  "subtotal": 21.47,
  "tax": 2.15,
  "total": 23.62,
  "status": "confirmed",
  "createdAt": "2026-06-27T10:00:00.000Z",
  "updatedAt": "2026-06-27T10:00:00.000Z"
}
```

---

#### `GET /api/orders/:id`

Fetch a single order's current status.

**Example**
```
GET /api/orders/ORD-1719484800000
```

**Response `200`** — same Order schema as above.

**Response `404`**
```json
{ "error": "Order not found" }
```

---

#### `PATCH /api/orders/:id/status`

Manually update an order's status (kitchen display / admin use).

**Request body**
```json
{ "status": "kitchen" }
```

| `status` value | Meaning                  |
|----------------|--------------------------|
| `confirmed`    | Order received           |
| `kitchen`      | Being prepared           |
| `ready`        | Ready for pickup         |

**Response `200`** — full Order object with updated status.

---

#### `GET /api/orders`

Admin endpoint — returns all orders.

**Response `200`** — array of Order objects.

---

## Order Status Flow

```
POST /api/orders
        │
        ▼
   [ confirmed ]  ──── auto +15s ────►  [ kitchen ]  ──── auto +30s ────►  [ ready ]
        │                                     │                                  │
   Order placed                     Meal being prepared               Ready for pickup
```

The frontend polls `GET /api/orders/:id` every **5 seconds** and stops once status is `ready`.

---

## Offline / Fallback Behavior

If the mock server is not running:

- **Menu & categories** fall back to local `src/data/mockMenu.js` data automatically.
- **Order creation** stores the order in `sessionStorage` and simulates status progression based on elapsed time (same 15 s / 45 s thresholds).
- The app remains fully functional for demos without the server.

---

## Running Locally

```bash
# Install dependencies
npm install

# Run both frontend and mock server together
npm start

# Or run separately
npm run server   # mock API  → http://localhost:3001
npm run dev      # React app → http://localhost:5173
```

---

## Connecting a Real Backend

Replace the Axios base URL in `src/api/client.js` and mirror these endpoints in your backend:

```js
// src/api/client.js
const client = axios.create({
  baseURL: 'https://your-api.example.com/api',
  ...
});
```

No other frontend changes are needed — the API contract is the same.
