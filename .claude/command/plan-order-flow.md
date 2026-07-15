# Food Ordering Web Application: Tech Stack & Skills

This document outlines the required skills, technologies, and tooling necessary to build the food ordering web application based on the defined architecture.

Read 

- doc/db-schema/schema.md
- doc/UI/ui-design.md

## 1. Frontend Development
*   **React:** Component-based architecture, hooks (useState, useEffect, useContext), and state management for managing the cart and order statuses.
*   **React Router:** Declarative routing for single-page applications, handling protected routes for role-based access (Cashier, Chef, Admin) and public routes (Menu).
*   **Tailwind CSS:** Utility-first CSS framework for rapid UI development, responsive design, and consistent styling across menus, dashboards, and checkout forms.
*   **Axios:** Promise-based HTTP client for making API requests to the Express backend (e.g., fetching menus, submitting orders, updating statuses).
*   **Vite:** Next-generation frontend tooling for fast development servers and optimized production builds.

## 2. Backend Development
*   **Node.js & Express:** Setting up a RESTful API server, defining routes for user authentication, menu management, and order processing.
*   **CORS:** Middleware configuration to safely allow cross-origin requests from the React frontend to the Express backend.

## 3. Testing & Quality Assurance
*   **Vitest:** Blazing fast unit testing framework powered by Vite for testing JavaScript/TypeScript logic.
*   **React Testing Library:** Testing React components from a user's perspective, ensuring UI elements render correctly and respond to interactions (e.g., "Add to Cart" clicks).
*   **jsdom:** Simulating a browser environment within Node.js to run React tests without a physical browser.
*   **Supertest:** High-level abstraction for testing HTTP assertions, used to test the Express REST API endpoints comprehensively.

## 4. Automation, Integration & MCP
*   **Playwright:** End-to-end (E2E) testing to automate real browser interactions, verifying the full user journey from ordering to kitchen fulfillment.
*   **Context7 (MCP Server):** Leveraging Model Context Protocol for contextual AI integrations, agentic workflows, or automated context management within the application ecosystem.

## 5. System Architecture & Concepts
*   **Role-Based Access Control (RBAC):** Managing permissions for Admin, Customer, Cashier, and Chef roles.
*   **State Machine / Workflow Logic:** Handling the sequential transition of order statuses: `Order Placed` -> `Confirm` -> `In Kitchen` -> `Ready`.