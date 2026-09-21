const API = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

export async function getProducts(q = "", category = "") {
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (category) params.set("category", category);
  const res = await fetch(`${API}/products?${params}`);
  return res.json();
}

export async function getProduct(id: string) {
  const res = await fetch(`${API}/products/${id}`);
  return res.json();
}

export async function getCategories() {
  const res = await fetch(`${API}/categories`);
  return res.json();
}

export async function getCart() {
  const res = await fetch(`${API}/cart`);
  return res.json();
}

export async function addToCart(productId: string, quantity = 1) {
  const res = await fetch(`${API}/cart/items`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ productId, quantity })
  });
  return res.json();
}

export async function updateCartItem(productId: string, quantity: number) {
  const res = await fetch(`${API}/cart/items/${productId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ quantity })
  });
  return res.json();
}

export async function removeCartItem(productId: string) {
  const res = await fetch(`${API}/cart/items/${productId}`, { method: "DELETE" });
  return res.json();
}

export async function createOrder(deliveryLocation: string, notes: string) {
  const res = await fetch(`${API}/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ deliveryLocation, notes })
  });
  return res.json();
}

export async function getOrder(id: string) {
  const res = await fetch(`${API}/orders/${id}`);
  return res.json();
}
