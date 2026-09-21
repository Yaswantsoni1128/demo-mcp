export type Product = {
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

export type CartItem = {
  productId: string;
  quantity: number;
};

export type Order = {
  id: string;
  items: CartItem[];
  total: number;
  deliveryLocation: string;
  notes: string;
  status: string;
  eta: string;
  createdAt: string;
};

export const products: Product[] = [
  {
    id: "p1",
    name: "A4 Copy Paper",
    category: "Stationery",
    description: "Premium 75 GSM A4 office printing paper. Pack of 500 sheets.",
    price: 250,
    image: "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&w=900&q=80",
    rating: 4.7,
    delivery: "Today",
    tags: ["paper", "printing", "stationery"]
  },
  {
    id: "p2",
    name: "Blue Ball Pens",
    category: "Stationery",
    description: "Smooth-writing blue ball pens. Pack of 10.",
    price: 120,
    image: "https://images.unsplash.com/photo-1585336261022-680e295ce9fe?auto=format&fit=crop&w=900&q=80",
    rating: 4.6,
    delivery: "Today",
    tags: ["pens", "writing", "stationery"]
  },
  {
    id: "p3",
    name: "Sticky Notes",
    category: "Stationery",
    description: "Assorted-color sticky notes for reminders and desk organization.",
    price: 99,
    image: "https://images.unsplash.com/photo-1586282391129-76a6df230234?auto=format&fit=crop&w=900&q=80",
    rating: 4.5,
    delivery: "Today",
    tags: ["notes", "sticky", "stationery"]
  },
  {
    id: "p4",
    name: "Desk Organizer",
    category: "Office Supplies",
    description: "Compact multi-compartment organizer for a clean workstation.",
    price: 299,
    image: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=900&q=80",
    rating: 4.8,
    delivery: "Tomorrow",
    tags: ["desk", "organizer", "office"]
  },
  {
    id: "p5",
    name: "Wireless Mouse",
    category: "IT Accessories",
    description: "Ergonomic 2.4 GHz wireless mouse suitable for office work.",
    price: 799,
    image: "https://images.unsplash.com/photo-1527814050087-3793815479db?auto=format&fit=crop&w=900&q=80",
    rating: 4.6,
    delivery: "Tomorrow",
    tags: ["mouse", "computer", "it", "accessories"]
  },
  {
    id: "p6",
    name: "USB-C Cable",
    category: "IT Accessories",
    description: "1.5 meter USB-C charging and data cable.",
    price: 349,
    image: "https://images.unsplash.com/photo-1587033411391-5d9e51cce126?auto=format&fit=crop&w=900&q=80",
    rating: 4.4,
    delivery: "Today",
    tags: ["usb", "cable", "charging", "it"]
  },
  {
    id: "p7",
    name: "Office Coffee",
    category: "Pantry",
    description: "Instant office coffee supply. Pack of 100 cups.",
    price: 899,
    image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=900&q=80",
    rating: 4.7,
    delivery: "Today",
    tags: ["coffee", "pantry", "beverage"]
  },
  {
    id: "p8",
    name: "Tissue Box",
    category: "Cleaning",
    description: "Soft facial tissues. 100 pulls per box.",
    price: 89,
    image: "https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&w=900&q=80",
    rating: 4.3,
    delivery: "Today",
    tags: ["tissue", "cleaning", "office"]
  }
];

export const cart: CartItem[] = [];
export const orders: Order[] = [];

export function productById(id: string) {
  return products.find((p) => p.id === id);
}

export function cartView() {
  return cart.map((item) => {
    const product = productById(item.productId)!;
    return {
      ...item,
      product,
      lineTotal: product.price * item.quantity
    };
  });
}

export function cartTotal() {
  return cartView().reduce((sum, item) => sum + item.lineTotal, 0);
}
