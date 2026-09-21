import express from "express";
import cors from "cors";
import { cart, cartTotal, orders, productById, products, cartView, type Order } from "./data.js";

const app = express();
const PORT = Number(process.env.PORT || 4000);

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "logistiq-ordering-backend" });
});

app.get("/api/categories", (_req, res) => {
  const categories = [...new Set(products.map((p) => p.category))];
  res.json(categories);
});

app.get("/api/products", (req, res) => {
  const q = String(req.query.q || "").trim().toLowerCase();
  const category = String(req.query.category || "").trim().toLowerCase();

  let result = products;

  if (q) {
    result = result.filter((p) =>
      [p.name, p.category, p.description, ...p.tags]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }

  if (category) {
    result = result.filter((p) => p.category.toLowerCase() === category);
  }

  res.json(result);
});

app.get("/api/products/:id", (req, res) => {
  const product = productById(req.params.id);
  if (!product) return res.status(404).json({ error: "Product not found" });
  res.json(product);
});

app.get("/api/cart", (_req, res) => {
  res.json({
    items: cartView(),
    total: cartTotal(),
    itemCount: cart.reduce((sum, item) => sum + item.quantity, 0)
  });
});

app.post("/api/cart/items", (req, res) => {
  const productId = String(req.body.productId || "");
  const quantity = Math.max(1, Number(req.body.quantity || 1));
  if (!productById(productId)) return res.status(404).json({ error: "Product not found" });

  const existing = cart.find((item) => item.productId === productId);
  if (existing) existing.quantity += quantity;
  else cart.push({ productId, quantity });

  res.status(201).json({ items: cartView(), total: cartTotal() });
});

app.patch("/api/cart/items/:id", (req, res) => {
  const item = cart.find((x) => x.productId === req.params.id);
  if (!item) return res.status(404).json({ error: "Cart item not found" });

  const quantity = Number(req.body.quantity);
  if (!Number.isFinite(quantity) || quantity < 1) {
    return res.status(400).json({ error: "Quantity must be at least 1" });
  }

  item.quantity = Math.floor(quantity);
  res.json({ items: cartView(), total: cartTotal() });
});

app.delete("/api/cart/items/:id", (req, res) => {
  const index = cart.findIndex((x) => x.productId === req.params.id);
  if (index === -1) return res.status(404).json({ error: "Cart item not found" });

  cart.splice(index, 1);
  res.json({ items: cartView(), total: cartTotal() });
});

app.delete("/api/cart", (_req, res) => {
  cart.splice(0, cart.length);
  res.json({ items: [], total: 0 });
});

app.post("/api/orders", (req, res) => {
  if (!cart.length) return res.status(400).json({ error: "Cart is empty" });

  const order: Order = {
    id: `LG-${Math.floor(10000 + Math.random() * 90000)}`,
    items: cart.map((x) => ({ ...x })),
    total: cartTotal(),
    deliveryLocation: String(req.body.deliveryLocation || "Main Office"),
    notes: String(req.body.notes || ""),
    status: "Order Confirmed",
    eta: "Today, 4:30 PM",
    createdAt: new Date().toISOString()
  };

  orders.unshift(order);
  cart.splice(0, cart.length);

  res.status(201).json(order);
});

app.get("/api/orders", (_req, res) => {
  res.json(orders);
});

app.get("/api/orders/:id", (req, res) => {
  const order = orders.find((x) => x.id === req.params.id);
  if (!order) return res.status(404).json({ error: "Order not found" });
  res.json(order);
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Logistiq backend running at http://localhost:${PORT}`);
});
