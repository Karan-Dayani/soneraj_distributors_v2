// app/context/CartContext.tsx
"use client";

import {
  createContext,
  useContext,
  useSyncExternalStore,
  ReactNode,
  useCallback,
} from "react";

// --- Types ---
export type CartItem = {
  productStockId: number;
  productId: number;
  productName: string;
  sizeName: string;
  quantity: number;
  maxStock: number;
};

type CartState = Record<number, CartItem>;

type CartContextType = {
  cart: CartState;
  addToCart: (item: CartItem) => void;
  addManyToCart: (items: CartItem[]) => void; // <--- NEW FUNCTION
  removeFromCart: (stockId: number) => void;
  clearCart: () => void;
  totalItems: number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

// --- HELPER: The Store Subscriber ---
const cartStore = {
  subscribe(callback: () => void) {
    window.addEventListener("storage", callback);
    window.addEventListener("local-storage-cart-update", callback);
    return () => {
      window.removeEventListener("storage", callback);
      window.removeEventListener("local-storage-cart-update", callback);
    };
  },
  getSnapshot() {
    if (typeof window === "undefined") return "{}";
    return localStorage.getItem("liquor_app_cart") || "{}";
  },
  getServerSnapshot() {
    return "{}";
  },
};

export function CartProvider({ children }: { children: ReactNode }) {
  const cartJson = useSyncExternalStore(
    cartStore.subscribe,
    cartStore.getSnapshot,
    cartStore.getServerSnapshot
  );

  const cart: CartState = JSON.parse(cartJson);

  const saveCart = useCallback((newCart: CartState) => {
    const json = JSON.stringify(newCart);
    localStorage.setItem("liquor_app_cart", json);
    window.dispatchEvent(new Event("local-storage-cart-update"));
  }, []);

  // --- ACTIONS ---

  // 1. Add Single Item
  const addToCart = (item: CartItem) => {
    const prev = cart;
    if (item.quantity <= 0) {
      const newCart = { ...prev };
      delete newCart[item.productStockId];
      saveCart(newCart);
    } else {
      const newCart = { ...prev, [item.productStockId]: item };
      saveCart(newCart);
    }
  };

  // 2. Add MANY Items (Batch Update) <--- THIS FIXES YOUR ISSUE
  const addManyToCart = (items: CartItem[]) => {
    const newCart = { ...cart }; // Clone current cart

    items.forEach((item) => {
      if (item.quantity <= 0) {
        delete newCart[item.productStockId];
      } else {
        newCart[item.productStockId] = item;
      }
    });

    saveCart(newCart); // Save only ONCE
  };

  const removeFromCart = (stockId: number) => {
    const newCart = { ...cart };
    delete newCart[stockId];
    saveCart(newCart);
  };

  const clearCart = () => {
    saveCart({});
  };

  const totalItems = Object.values(cart).reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        addManyToCart,
        removeFromCart,
        clearCart,
        totalItems,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
