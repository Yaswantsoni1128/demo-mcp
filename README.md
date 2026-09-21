# Logistiq Zomato-Style MCP Ordering Demo

A local testing project that mimics a Zomato-style ordering experience for Logistiq office products.

## Architecture

React frontend (5173)
        |
        v
Express mock backend (4000)
        |
        v
MCP server (3001/mcp)
        |
        v
In-memory catalog/cart/orders

No login, database, payment gateway, or production infrastructure is required.

## Requirements

- Node.js 18+
- npm

## Start

### Terminal 1 - Backend

```bash
cd backend
npm install
npm run dev
```

Runs on http://localhost:4000

### Terminal 2 - MCP Server

```bash
cd mcp-server
npm install
npm run dev
```

Runs on http://localhost:3001
MCP endpoint: http://localhost:3001/mcp

### Terminal 3 - Frontend

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173

## Demo flow

1. Open Home
2. Search for a product or category
3. Open product details
4. Add items to cart
5. Review cart
6. Checkout
7. Place a mock order
8. Track the order

## MCP tools

- search_products
- get_product_details
- get_cart
- add_to_cart
- remove_from_cart
- clear_cart
- create_order
- get_order

## Important

This is deliberately a mock/demo system. Data is stored in memory and resets when the backend/MCP process restarts.
