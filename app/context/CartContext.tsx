"use client";

import {
  createContext,
  useContext,
  useSyncExternalStore,
  ReactNode,
  useCallback,
} from "react";

// --- 1. NEW TYPES (Nested Structure) ---

export type CartVariant = {
  stockId: number; // Unique ID for the specific size
  sizeName: string;
  quantity: number;
  maxStock: number;
  price: number;
};

// A "CartProduct" groups multiple sizes under one Brand Name
export type CartProduct = {
  productId: number;
  productName: string;
  // We use a Record here so we can easily update specific sizes without looping
  variants: Record<number, CartVariant>;
};

// Key = productId (Not stockId anymore!)
type CartState = Record<number, CartProduct>;

type CartContextType = {
  cart: CartState;
  // Instead of adding items one by one, we update the whole product
  updateProductInCart: (
    productId: number,
    name: string,
    variants: CartVariant[]
  ) => void;
  removeProduct: (productId: number) => void;
  removeVariant: (productId: number, stockId: number) => void;
  clearCart: () => void;
  totalItems: number;
  getUniqueSizes: () => string[];
};

const CartContext = createContext<CartContextType | undefined>(undefined);

// --- STORAGE HELPER (Same as before) ---
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
    localStorage.setItem("liquor_app_cart", JSON.stringify(newCart));
    window.dispatchEvent(new Event("local-storage-cart-update"));
  }, []);

  // --- ACTIONS ---

  // 1. UPDATE PRODUCT (Handles Adding & Updating multiple sizes at once)
  const updateProductInCart = (
    productId: number,
    name: string,
    newVariants: CartVariant[]
  ) => {
    const newCart = { ...cart };

    // Get existing product or create new one
    const productEntry = newCart[productId] || {
      productId,
      productName: name,
      variants: {},
    };

    // Create a mutable copy of variants
    const updatedVariants = { ...productEntry.variants };

    // Loop through the new inputs
    newVariants.forEach((v) => {
      if (v.quantity > 0) {
        // Add/Update
        updatedVariants[v.stockId] = v;
      } else {
        // If quantity is 0, remove it
        delete updatedVariants[v.stockId];
      }
    });

    // If no variants left, remove the whole product
    if (Object.keys(updatedVariants).length === 0) {
      delete newCart[productId];
    } else {
      // Save the updates
      newCart[productId] = {
        ...productEntry,
        variants: updatedVariants,
      };
    }

    saveCart(newCart);
  };

  // 2. REMOVE ENTIRE PRODUCT
  const removeProduct = (productId: number) => {
    const newCart = { ...cart };
    delete newCart[productId];
    saveCart(newCart);
  };

  // 3. REMOVE SINGLE VARIANT (e.g., from Checkout Page)
  const removeVariant = (productId: number, stockId: number) => {
    const newCart = { ...cart };
    const product = newCart[productId];

    if (product) {
      const newVariants = { ...product.variants };
      delete newVariants[stockId];

      // If that was the last variant, remove the product entirely
      if (Object.keys(newVariants).length === 0) {
        delete newCart[productId];
      } else {
        newCart[productId] = { ...product, variants: newVariants };
      }
      saveCart(newCart);
    }
  };

  const clearCart = () => saveCart({});

  // 4. CALCULATE TOTAL (Double Loop needed now)
  const totalItems = Object.values(cart).reduce((sum, product) => {
    const productTotal = Object.values(product.variants).reduce(
      (pSum, v) => pSum + v.quantity,
      0
    );
    return sum + productTotal;
  }, 0);

  // 5. GET UNIQUE SIZES
  const getUniqueSizes = useCallback(() => {
    const uniqueSizes = new Set<string>();

    Object.values(cart).forEach((product) => {
      // Safety check for old data to prevent crashes
      if (!product || !product.variants) return;

      Object.values(product.variants).forEach((variant) => {
        uniqueSizes.add(variant.sizeName);
      });
    });

    // Convert Set -> Array and Sort (180ml -> 750ml -> 1L)
    return Array.from(uniqueSizes).sort((a, b) => {
      const quantityA = parseInt(a.match(/\d+/)?.[0] || "0", 10);
      const quantityB = parseInt(b.match(/\d+/)?.[0] || "0", 10);
      return quantityB - quantityA;
    });
  }, [cart]);

  return (
    <CartContext.Provider
      value={{
        cart,
        updateProductInCart,
        removeProduct,
        removeVariant,
        clearCart,
        totalItems,
        getUniqueSizes,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
}
