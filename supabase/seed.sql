-- Lookup data required before any order can be created (FK constraints).
insert into order_status (id, label, sort_order) values
  ('confirmed', 'Pay at Counter', 1),
  ('kitchen',   'In Kitchen',     2),
  ('ready',     'Ready for Pickup', 3),
  ('canceled',  'Canceled',       4);

insert into order_type (id, label) values
  ('dine-in', 'Dine In'),
  ('takeout', 'Takeout');

-- Categories (excludes the UI-only 'all' pseudo-category; the frontend
-- prepends a synthetic "All Items" entry client-side).
insert into category (id, name, icon, sort_order) values
  ('burgers',  'Burgers',  '🍔', 1),
  ('pizza',    'Pizza',    '🍕', 2),
  ('drinks',   'Drinks',   '🥤', 3),
  ('desserts', 'Desserts', '🍰', 4),
  ('sides',    'Sides',    '🍟', 5);

-- Menu items, explicit ids 1..15 to stay compatible with existing cart/order_item references.
insert into menu (id, category_id, name, description, unit_price, emoji, popular) values
  (1,  'burgers',  'Classic Cheeseburger', 'Beef patty with cheddar, lettuce, tomato & pickles', 8.99,  '🍔', true),
  (2,  'burgers',  'BBQ Bacon Burger',     'Smoky BBQ sauce, crispy bacon & caramelized onions', 10.99, '🥓', false),
  (3,  'burgers',  'Veggie Burger',        'Plant-based patty with avocado & fresh sprouts',     9.49,  '🥑', false),
  (4,  'pizza',    'Margherita',           'San Marzano tomato, fresh mozzarella & basil',       11.99, '🍕', true),
  (5,  'pizza',    'Pepperoni',            'Classic pepperoni with aged mozzarella',             13.99, '🍕', true),
  (6,  'pizza',    'BBQ Chicken',          'BBQ sauce, grilled chicken, red onion & cilantro',   14.49, '🍕', false),
  (7,  'drinks',   'Cola',                 'Classic cola served ice cold',                       2.49,  '🥤', false),
  (8,  'drinks',   'Fresh Lemonade',       'House-made with real squeezed lemons',               3.49,  '🍋', true),
  (9,  'drinks',   'Iced Tea',             'Sweetened black iced tea with mint',                 2.99,  '🧊', false),
  (10, 'desserts', 'Chocolate Cake',       'Rich double-chocolate layer cake with ganache',      5.99,  '🍰', true),
  (11, 'desserts', 'Vanilla Ice Cream',    'Two generous scoops of creamy vanilla',              4.49,  '🍦', false),
  (12, 'desserts', 'Fudge Brownie',        'Warm chocolate brownie with powdered sugar',         3.99,  '🍫', false),
  (13, 'sides',    'Crispy Fries',         'Golden fries seasoned with sea salt',                3.49,  '🍟', true),
  (14, 'sides',    'Onion Rings',          'Beer-battered onion rings with dipping sauce',       4.49,  '🧅', false),
  (15, 'sides',    'Coleslaw',             'Creamy homemade coleslaw with apple',                2.99,  '🥗', false);

-- Keep the identity sequence ahead of the explicitly-inserted ids above.
select setval(pg_get_serial_sequence('menu', 'id'), (select max(id) from menu));

-- RBAC scaffolding: roles only, per schema.md's intent. No permissions/users seeded yet.
insert into role (role_name) values
  ('Admin'), ('Customer'), ('Cashier'), ('Chef');

-- Existing mock-server/data.json orders are stale test fixtures — deliberately not migrated.
