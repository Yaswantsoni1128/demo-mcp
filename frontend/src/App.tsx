import { useEffect, useState } from "react";
import { Link, Route, Routes, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2, ChevronRight, Clock3, MapPin, Minus, Plus, Search, ShoppingBag, Star, Truck } from "lucide-react";
import * as api from "./api";

type Product = {
  id: string; name: string; category: string; description: string; price: number;
  image: string; rating: number; delivery: string; tags: string[];
};

function Header() {
  const [cart, setCart] = useState<any>({ itemCount: 0 });
  useEffect(() => { api.getCart().then(setCart); }, []);
  return (
    <header className="header">
      <Link to="/" className="brand">logistiq<span>+</span></Link>
      <nav>
        <Link to="/">Order</Link>
        <Link to="/orders">My Orders</Link>
        <Link to="/cart" className="cartLink"><ShoppingBag size={19}/> Cart {cart.itemCount ? <b>{cart.itemCount}</b> : null}</Link>
      </nav>
    </header>
  );
}

function ProductCard({ p, onAdded }: { p: Product; onAdded?: () => void }) {
  const [adding, setAdding] = useState(false);
  async function add() {
    setAdding(true);
    await api.addToCart(p.id, 1);
    setAdding(false);
    onAdded?.();
  }
  return (
    <article className="productCard">
      <Link to={`/product/${p.id}`} className="imageWrap"><img src={p.image} /><span>{p.delivery}</span></Link>
      <div className="productBody">
        <div className="rating"><Star size={14} fill="currentColor"/> {p.rating}</div>
        <Link to={`/product/${p.id}`}><h3>{p.name}</h3></Link>
        <p>{p.category}</p>
        <div className="productBottom"><strong>₹{p.price}</strong><button onClick={add}>{adding ? "Adding..." : "+ Add"}</button></div>
      </div>
    </article>
  );
}

function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [q, setQ] = useState("");

  async function load(query = q, category = "") {
    setProducts(await api.getProducts(query, category));
  }

  useEffect(() => { api.getCategories().then(setCategories); load(""); }, []);

  return (
    <>
      <section className="hero">
        <div className="heroContent">
          <div className="eyebrow">LOGISTIQ OFFICE STORE</div>
          <h1>Everything your team needs,<br/><em>delivered to your desk.</em></h1>
          <p>Order stationery, IT accessories, pantry supplies and more with one simple assistant.</p>
          <div className="searchBox">
            <Search size={21}/>
            <input value={q} onChange={e => setQ(e.target.value)} onKeyDown={e => e.key === "Enter" && load()} placeholder="Search mouse, paper, coffee..." />
            <button onClick={() => load()}>Search</button>
          </div>
        </div>
      </section>

      <main className="container">
        <section className="assistantBanner">
          <div>
            <div className="assistantDot">✦</div>
            <div><strong>Try the Logistiq Assistant</strong><p>Say: “I need some stationery for my desk.”</p></div>
          </div>
          <button onClick={() => { setQ("stationery"); load("stationery"); }}>Try it <ChevronRight size={18}/></button>
        </section>

        <section>
          <div className="sectionTitle"><div><span className="eyebrow">BROWSE</span><h2>Shop by category</h2></div></div>
          <div className="categories">
            {categories.map(c => <button key={c} onClick={() => load("", c)}>{c}<ChevronRight size={16}/></button>)}
          </div>
        </section>

        <section className="productsSection">
          <div className="sectionTitle"><div><span className="eyebrow">RECOMMENDED</span><h2>Popular around the office</h2></div><span>{products.length} items</span></div>
          <div className="productGrid">{products.map(p => <ProductCard key={p.id} p={p}/>)}</div>
        </section>
      </main>
    </>
  );
}

function ProductPage() {
  const { id = "" } = useParams();
  const [p, setP] = useState<Product | null>(null);
  const [qty, setQty] = useState(1);
  const navigate = useNavigate();

  useEffect(() => { api.getProduct(id).then(setP); }, [id]);
  if (!p) return <main className="container page"><p>Loading...</p></main>;

  return (
    <main className="container page">
      <Link to="/" className="back"><ArrowLeft size={18}/> Back to store</Link>
      <div className="detail">
        <div className="detailImage"><img src={p.image}/></div>
        <div className="detailInfo">
          <span className="pill">{p.category}</span>
          <h1>{p.name}</h1>
          <div className="bigRating"><Star size={17} fill="currentColor"/> {p.rating} <span>•</span> {p.delivery} delivery</div>
          <p className="description">{p.description}</p>
          <div className="price">₹{p.price}</div>
          <div className="quantity"><button onClick={() => setQty(Math.max(1, qty-1))}><Minus/></button><strong>{qty}</strong><button onClick={() => setQty(qty+1)}><Plus/></button></div>
          <button className="primaryBtn" onClick={async () => { await api.addToCart(p.id, qty); navigate("/cart"); }}>Add {qty} to cart • ₹{p.price*qty}</button>
        </div>
      </div>
    </main>
  );
}

function Cart() {
  const [cart, setCart] = useState<any>(null);
  const navigate = useNavigate();
  async function refresh() { setCart(await api.getCart()); }
  useEffect(() => { refresh(); }, []);
  if (!cart) return <main className="container page"><p>Loading cart...</p></main>;

  return (
    <main className="container page narrow">
      <div className="pageHeading"><div><span className="eyebrow">YOUR BAG</span><h1>Shopping Cart</h1></div></div>
      {!cart.items.length ? <div className="empty"><ShoppingBag size={42}/><h2>Your cart is empty</h2><p>Add something useful for your workspace.</p><Link to="/" className="primaryBtn">Browse products</Link></div> :
      <div className="cartLayout">
        <div className="cartItems">
          {cart.items.map((item:any) => <div className="cartItem" key={item.productId}>
            <img src={item.product.image}/>
            <div className="cartMain"><h3>{item.product.name}</h3><p>{item.product.category}</p><div className="qtySmall"><button onClick={async()=>{await api.updateCartItem(item.productId, Math.max(1,item.quantity-1));refresh();}}><Minus size={14}/></button>{item.quantity}<button onClick={async()=>{await api.updateCartItem(item.productId,item.quantity+1);refresh();}}><Plus size={14}/></button></div></div>
            <strong>₹{item.lineTotal}</strong>
            <button className="remove" onClick={async()=>{await api.removeCartItem(item.productId);refresh();}}>Remove</button>
          </div>)}
        </div>
        <aside className="summary"><h3>Order summary</h3><div><span>Items</span><span>₹{cart.total}</span></div><div><span>Delivery</span><span>Free</span></div><hr/><div className="grand"><span>Total</span><strong>₹{cart.total}</strong></div><button className="primaryBtn" onClick={()=>navigate("/checkout")}>Proceed to checkout</button></aside>
      </div>}
    </main>
  );
}

function Checkout() {
  const [location, setLocation] = useState("Main Office");
  const [notes, setNotes] = useState("");
  const [cart, setCart] = useState<any>(null);
  const navigate = useNavigate();
  useEffect(() => { api.getCart().then(setCart); }, []);
  async function place() {
    const order = await api.createOrder(location, notes);
    navigate(`/confirmation/${order.id}`);
  }
  return (
    <main className="container page narrow">
      <Link to="/cart" className="back"><ArrowLeft size={18}/> Back to cart</Link>
      <div className="pageHeading"><span className="eyebrow">FINAL STEP</span><h1>Delivery details</h1></div>
      <div className="checkout">
        <div className="formCard">
          <label><MapPin size={17}/> Delivery location</label>
          <select value={location} onChange={e=>setLocation(e.target.value)}>
            <option>Main Office</option><option>Warehouse</option><option>Gurugram Office</option><option>Reception</option>
          </select>
          <label>Delivery instructions</label>
          <textarea value={notes} onChange={e=>setNotes(e.target.value)} placeholder="e.g. Leave at reception desk..."/>
          <button className="primaryBtn" disabled={!cart?.items?.length} onClick={place}>Place order • ₹{cart?.total || 0}</button>
        </div>
        <div className="trust"><Truck/><div><strong>Fast internal delivery</strong><p>Your mock order will be confirmed instantly for this demo.</p></div></div>
      </div>
    </main>
  );
}

function Confirmation() {
  const { id = "" } = useParams();
  const [order, setOrder] = useState<any>(null);
  useEffect(() => { api.getOrder(id).then(setOrder); }, [id]);
  if (!order) return <main className="container page"><p>Loading order...</p></main>;
  return <main className="container page narrow"><div className="confirmation"><div className="success"><CheckCircle2 size={58}/></div><span className="eyebrow">ORDER CONFIRMED</span><h1>You're all set.</h1><p>Your order <strong>{order.id}</strong> has been placed successfully.</p><div className="orderCard"><div><span>Status</span><strong>{order.status}</strong></div><div><span>Delivery</span><strong>{order.deliveryLocation}</strong></div><div><span>ETA</span><strong><Clock3 size={16}/> {order.eta}</strong></div><div><span>Total</span><strong>₹{order.total}</strong></div></div><Link to={`/orders`} className="primaryBtn">Track my orders</Link></div></main>;
}

function Orders() {
  const [orders, setOrders] = useState<any[]>([]);
  useEffect(() => { fetch("http://localhost:4000/api/orders").then(r=>r.json()).then(setOrders); }, []);
  return <main className="container page narrow"><div className="pageHeading"><span className="eyebrow">HISTORY</span><h1>My Orders</h1></div>{!orders.length?<div className="empty"><Truck size={42}/><h2>No orders yet</h2><Link to="/" className="primaryBtn">Start shopping</Link></div>:<div className="orders">{orders.map(o=><div className="orderRow" key={o.id}><div className="orderIcon"><Truck/></div><div><strong>{o.id}</strong><p>{o.items.length} item(s) • {o.deliveryLocation}</p></div><span>{o.status}</span><strong>₹{o.total}</strong></div>)}</div>}</main>;
}

export default function App() {
  return <><Header/><Routes><Route path="/" element={<Home/>}/><Route path="/product/:id" element={<ProductPage/>}/><Route path="/cart" element={<Cart/>}/><Route path="/checkout" element={<Checkout/>}/><Route path="/confirmation/:id" element={<Confirmation/>}/><Route path="/orders" element={<Orders/>}/></Routes></>;
}
