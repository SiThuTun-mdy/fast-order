# Food Ordering Web Application: UI Pages & Flow

This document details the user interface structure, routing, and access control for the application.

## 1. Public / Customer Interface
No login is required for standard browsing and ordering.

*   **Menu Page (`/`)**
    *   **Description:** The landing page displaying all available menu items.
    *   **Features:** List of dishes with descriptions and unit prices. "Add to Cart" functionality for each item.
*   **Cart Page (`/cart`)**
    *   **Description:** Review selected items before checkout.
    *   **Features:** Display item list, quantities, unit prices, and calculate the running total. Options to edit quantities or remove items.
*   **Checkout Page (`/checkout`)**
    *   **Description:** Finalize the order details.
    *   **Features:** 
        *   Form for customer details: Name, Email, Mobile.
        *   Order Type Selection: "Dine In" or "Take Away".
        *   Conditional Field: "Table Number" (if Dine In is selected).
        *   "Confirm Order" button to submit the payload to the backend.

## 2. Cashier Interface
Requires login with `Cashier` role.

*   **Order List Page (`/cashier/orders`)**
    *   **Description:** Dashboard for managing incoming orders.
    *   **Features:** 
        *   Real-time list of newly placed orders waiting for confirmation.
        *   Action: **"Confirm"** button for each order. Clicking this transitions the order status to `In Kitchen` and alerts the Chef.

## 3. Kitchen / Chef Interface
Requires login with `Chef` role.

*   **Kitchen Dashboard (`/kitchen/orders`)**
    *   **Description:** Display of orders that are currently being prepared.
    *   **Features:** 
        *   Lists all orders with the `In Kitchen` status.
        *   Displays order details, specific items, quantities, and order type (Dine In / Take away).
        *   Action: **"Ready"** button to mark an order as complete and ready for pickup or serving.

## 4. Admin Interface
Requires login with `Admin` role.

*   **Admin Dashboard (`/admin`)**
    *   **Description:** Central hub for management.
    *   **Features:** User management, role assignments, menu management (CRUD operations on dishes), and reporting.

## User Journey Flow
1.  **Customer:** Menu -> Cart -> Checkout (Selects Dine-in/Take-away, inputs details) -> Submits Order.
2.  **Cashier:** Sees pending order -> Clicks "Confirm" -> Status becomes `In Kitchen`.
3.  **Chef:** Sees `In Kitchen` order -> Prepares food -> Clicks "Ready" -> Status becomes `Ready`.