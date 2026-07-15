# Food Ordering Web Application: Database Schema

This document outlines the relational database schema required to support the application's users, roles, menu, and order processing logic.

## Tenant

### 0. `Restaurant` Table
Top-level entity that owns all other data. One restaurant has many users (staff) and many rows of every application entity (Menu, Customer, Order, Order_Item).
| Column Name   | Data Type    | Constraints                  |
| :------------ | :----------- | :--------------------------- |
| `id`          | UUID         | Primary Key                  |
| `name`        | VARCHAR(255) | Not Null                     |
| `address`     | TEXT         |                              |
| `phone`       | VARCHAR(50)  |                              |
| `created_at`  | TIMESTAMP    | Default: CURRENT_TIMESTAMP   |

---

## User & Access Control (RBAC)

### 1. `User` Table
Stores authentication and basic user details for system staff (Admin, Cashier, Chef).
| Column Name     | Data Type    | Constraints                  |
| :-------------- | :----------- | :--------------------------- |
| `id`            | UUID/Int     | Primary Key                  |
| `restaurant_id` | UUID         | Foreign Key (`Restaurant.id`), Not Null |
| `username`      | VARCHAR(255) | Unique, Not Null             |
| `password`      | VARCHAR(255) | Hashed, Not Null             |

### 2. `Role` Table
Defines the available roles: Admin, Customer, Cashier, Chef.
| Column Name   | Data Type    | Constraints                  |
| :------------ | :----------- | :--------------------------- |
| `id`          | Int          | Primary Key                  |
| `role_name`   | VARCHAR(50)  | Unique, Not Null             |

### 3. `User_Roles` Table
Mapping table linking Users to their respective Roles.
| Column Name   | Data Type    | Constraints                  |
| :------------ | :----------- | :--------------------------- |
| `user_id`     | UUID/Int     | Foreign Key (`User.id`)      |
| `role_id`     | Int          | Foreign Key (`Role.id`)      |

### 4. `Permissions` Table
Defines specific actions that can be performed (e.g., `update_order_status`, `manage_menu`).
| Column Name       | Data Type    | Constraints                  |
| :---------------- | :----------- | :--------------------------- |
| `id`              | Int          | Primary Key                  |
| `permission_name` | VARCHAR(100) | Unique, Not Null             |

### 5. `Role_Permission` Table
Mapping table linking Roles to their Permissions.
| Column Name     | Data Type    | Constraints                  |
| :-------------- | :----------- | :--------------------------- |
| `role_id`       | Int          | Foreign Key (`Role.id`)      |
| `permission_id` | Int          | Foreign Key (`Permissions.id`)|

---

## Application Data

All application tables carry a `restaurant_id` foreign key: one restaurant has many of each entity below.

### 6. `Menu` Table
Stores details of the food items available for order.
| Column Name     | Data Type    | Constraints                  |
| :-------------- | :----------- | :--------------------------- |
| `id`            | Int          | Primary Key                  |
| `restaurant_id` | UUID         | Foreign Key (`Restaurant.id`), Not Null |
| `name`          | VARCHAR(255) | Not Null                     |
| `description`   | TEXT         |                              |
| `unit_price`    | DECIMAL(10,2)| Not Null                     |

### 7. `Customer` Table
Stores guest customer details provided during checkout.
| Column Name     | Data Type    | Constraints                  |
| :-------------- | :----------- | :--------------------------- |
| `id`            | UUID/Int     | Primary Key                  |
| `restaurant_id` | UUID         | Foreign Key (`Restaurant.id`), Not Null |
| `name`          | VARCHAR(255) | Not Null                     |
| `email`         | VARCHAR(255) |                              |
| `mobile`        | VARCHAR(50)  |                              |

### 8. `Order` Table
Stores the main order record.
| Column Name    | Data Type    | Constraints                                      |
| :------------- | :----------- | :----------------------------------------------- |
| `id`           | UUID/Int     | Primary Key                                      |
| `restaurant_id`| UUID         | Foreign Key (`Restaurant.id`), Not Null          |
| `customer_id`  | UUID/Int     | Foreign Key (`Customer.id`)                      |
| `order_type`   | VARCHAR(50)  | Enum: 'Dine In', 'Take Away'                     |
| `table_number` | VARCHAR(20)  | Nullable (Only if Dine In)                       |
| `total_price`  | DECIMAL(10,2)| Not Null                                         |
| `status`       | VARCHAR(50)  | Enum: 'Confirm', 'In Kitchen', 'Ready'           |
| `created_at`   | TIMESTAMP    | Default: CURRENT_TIMESTAMP                       |

### 9. `Order_Item` Table
Stores the individual menu items associated with an order.
| Column Name   | Data Type    | Constraints                  |
| :------------ | :----------- | :--------------------------- |
| `id`            | UUID/Int     | Primary Key                  |
| `restaurant_id` | UUID         | Foreign Key (`Restaurant.id`), Not Null (denormalized from `Order`) |
| `order_id`      | UUID/Int     | Foreign Key (`Order.id`)     |
| `menu_id`       | Int          | Foreign Key (`Menu.id`)      |
| `unit_price`  | DECIMAL(10,2)| Snapshot of price at order   |
| `quantity`    | Int          | Not Null, Default: 1         |
