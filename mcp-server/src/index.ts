import express from "express";
import cors from "cors";
import { randomUUID } from "node:crypto";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { z } from "zod";

const app = express();
const PORT = Number(process.env.PORT || 3001);

app.use(cors());
app.use(express.json());

type Product = {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  image: string;
  rating: number;
  delivery: string;
  tags: string[];
};

const products: Product[] = [
  { id:"p1", name:"A4 Copy Paper", category:"Stationery", description:"Premium 75 GSM A4 office printing paper. Pack of 500 sheets.", price:250, image:"https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&w=900&q=80", rating:4.7, delivery:"Today", tags:["paper","printing","stationery"] },
  { id:"p2", name:"Blue Ball Pens", category:"Stationery", description:"Smooth-writing blue ball pens. Pack of 10.", price:120, image:"https://images.unsplash.com/photo-1585336261022-680e295ce9fe?auto=format&fit=crop&w=900&q=80", rating:4.6, delivery:"Today", tags:["pens","writing","stationery"] },
  { id:"p3", name:"Sticky Notes", category:"Stationery", description:"Assorted-color sticky notes for reminders and desk organization.", price:99, image:"https://images.unsplash.com/photo-1586282391129-76a6df230234?auto=format&fit=crop&w=900&q=80", rating:4.5, delivery:"Today", tags:["notes","sticky","stationery"] },
  { id:"p4", name:"Desk Organizer", category:"Office Supplies", description:"Compact multi-compartment organizer for a clean workstation.", price:299, image:"https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=900&q=80", rating:4.8, delivery:"Tomorrow", tags:["desk","organizer","office"] },
  { id:"p5", name:"Wireless Mouse", category:"IT Accessories", description:"Ergonomic 2.4 GHz wireless mouse suitable for office work.", price:799, image:"https://images.unsplash.com/photo-1527814050087-3793815479db?auto=format&fit=crop&w=900&q=80", rating:4.6, delivery:"Tomorrow", tags:["mouse","computer","it","accessories"] },
  { id:"p6", name:"USB-C Cable", category:"IT Accessories", description:"1.5 meter USB-C charging and data cable.", price:349, image:"https://images.unsplash.com/photo-1587033411391-5d9e51cce126?auto=format&fit=crop&w=900&q=80", rating:4.4, delivery:"Today", tags:["usb","cable","charging","it"] },
  { id:"p7", name:"Office Coffee", category:"Pantry", description:"Instant office coffee supply. Pack of 100 cups.", price:899, image:"https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=900&q=80", rating:4.7, delivery:"Today", tags:["coffee","pantry","beverage"] },
  { id:"p8", name:"Tissue Box", category:"Cleaning", description:"Soft facial tissues. 100 pulls per box.", price:89, image:"https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&w=900&q=80", rating:4.3, delivery:"Today", tags:["tissue","cleaning","office"] }
];

const cart: { productId: string; quantity: number }[] = [];
const orders: any[] = [];

function findProduct(id: string) { return products.find(p => p.id === id); }
function viewCart() {
  return cart.map(i => {
    const product = findProduct(i.productId)!;
    return { ...i, product, lineTotal: product.price * i.quantity };
  });
}
function total() { return viewCart().reduce((s, i) => s + i.lineTotal, 0); }

function createServer() {
  const server = new McpServer({ name: "logistiq-ordering-mcp", version: "1.0.0" });

  server.registerTool(
    "search_products",
    {
      description: "Search Logistiq office products by keyword or category.",
      inputSchema: {
        query: z.string().optional(),
        category: z.string().optional()
      }
    },
    async ({ query = "", category = "" }) => {
      const q = query.toLowerCase();
      const c = category.toLowerCase();
      const result = products.filter(p =>
        (!q || [p.name,p.category,p.description,...p.tags].join(" ").toLowerCase().includes(q)) &&
        (!c || p.category.toLowerCase() === c)
      );
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.registerTool(
    "get_product_details",
    {
      description: "Get details for a specific Logistiq product.",
      inputSchema: { productId: z.string() }
    },
    async ({ productId }) => {
      const product = findProduct(productId);
      if (!product) return { isError: true, content: [{ type: "text", text: "Product not found" }] };
      return { content: [{ type: "text", text: JSON.stringify(product, null, 2) }] };
    }
  );

  server.registerTool(
    "get_cart",
    { description: "Get the current shopping cart.", inputSchema: {} },
    async () => ({
      content: [{ type: "text", text: JSON.stringify({ items: viewCart(), total: total() }, null, 2) }]
    })
  );

  server.registerTool(
    "add_to_cart",
    {
      description: "Add a product to the shopping cart.",
      inputSchema: { productId: z.string(), quantity: z.number().int().min(1).default(1) }
    },
    async ({ productId, quantity }) => {
      if (!findProduct(productId)) return { isError: true, content: [{ type: "text", text: "Product not found" }] };
      const existing = cart.find(i => i.productId === productId);
      if (existing) existing.quantity += quantity;
      else cart.push({ productId, quantity });
      return { content: [{ type: "text", text: JSON.stringify({ items: viewCart(), total: total() }, null, 2) }] };
    }
  );

  server.registerTool(
    "remove_from_cart",
    {
      description: "Remove a product from the shopping cart.",
      inputSchema: { productId: z.string() }
    },
    async ({ productId }) => {
      const index = cart.findIndex(i => i.productId === productId);
      if (index >= 0) cart.splice(index, 1);
      return { content: [{ type: "text", text: JSON.stringify({ items: viewCart(), total: total() }, null, 2) }] };
    }
  );

  server.registerTool(
    "clear_cart",
    { description: "Clear all items from the shopping cart.", inputSchema: {} },
    async () => {
      cart.splice(0, cart.length);
      return { content: [{ type: "text", text: JSON.stringify({ items: [], total: 0 }) }] };
    }
  );

  server.registerTool(
    "create_order",
    {
      description: "Create a mock order from the current cart.",
      inputSchema: {
        deliveryLocation: z.string().default("Main Office"),
        notes: z.string().optional()
      }
    },
    async ({ deliveryLocation, notes = "" }) => {
      if (!cart.length) return { isError: true, content: [{ type: "text", text: "Cart is empty" }] };
      const order = {
        id: `LG-${Math.floor(10000 + Math.random() * 90000)}`,
        items: cart.map(x => ({ ...x })),
        total: total(),
        deliveryLocation,
        notes,
        status: "Order Confirmed",
        eta: "Today, 4:30 PM",
        createdAt: new Date().toISOString()
      };
      orders.unshift(order);
      cart.splice(0, cart.length);
      return { content: [{ type: "text", text: JSON.stringify(order, null, 2) }] };
    }
  );

  server.registerTool(
    "get_order",
    {
      description: "Get a previously created mock order.",
      inputSchema: { orderId: z.string() }
    },
    async ({ orderId }) => {
      const order = orders.find(o => o.id === orderId);
      if (!order) return { isError: true, content: [{ type: "text", text: "Order not found" }] };
      return { content: [{ type: "text", text: JSON.stringify(order, null, 2) }] };
    }
  );

  return server;
}

app.get("/health", (_req, res) => res.json({ ok: true, service: "logistiq-mcp" }));

app.post("/mcp", async (req, res) => {
  const server = createServer();
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: () => randomUUID()
  });

  res.on("close", () => {
    transport.close().catch(() => {});
    server.close().catch(() => {});
  });

  await server.connect(transport);
  await transport.handleRequest(req, res);
});

app.get("/mcp", (_req, res) => {
  res.status(405).json({ error: "Use POST for the MCP endpoint." });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Logistiq MCP server running at http://localhost:${PORT}`);
  console.log(`MCP endpoint: http://localhost:${PORT}/mcp`);
});
