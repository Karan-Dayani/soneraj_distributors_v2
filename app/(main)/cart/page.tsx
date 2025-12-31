"use client";

import { useCart } from "@/app/context/CartContext";

export default function CheckoutPage() {
  const { cart, removeFromCart, clearCart } = useCart();
  const items = Object.values(cart);

  console.log("Cart Items:", items);

  if (items.length === 0) return <div className="p-10">Cart is empty</div>;

  return (
    <div className="p-10">
      <h1 className="text-2xl font-bold mb-4">Your Cart</h1>

      {/* LIST ITEMS */}
      <div className="space-y-2">
        {items.map((item) => (
          <div
            key={item.productStockId}
            className="flex justify-between border p-4 rounded bg-white"
          >
            <div>
              <div className="font-bold">{item.sizeName}</div>
              <div>Qty: {item.quantity}</div>
            </div>
            <button
              onClick={() => removeFromCart(item.productStockId)}
              className="text-red-500 font-bold"
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      {/* DEBUG BUTTON: Clear Cart */}
      <button
        onClick={clearCart}
        className="mt-6 bg-red-600 text-white px-4 py-2 rounded"
      >
        Clear Cart
      </button>
    </div>
  );
}
