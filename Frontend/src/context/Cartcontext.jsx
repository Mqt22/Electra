import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";

import { useAuth } from "./AuthContext.jsx";

const CartContext = createContext(null);

const CartProvider = ({ children }) => {
  const { user } = useAuth();

  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);

  const userId = user?.user_id ?? null;

  const refreshCart = useCallback(async () => {
    try {
      if (!userId) {
        console.log("No user ID found. Cart is empty.");
        setCart([]);
        return;
      }

      console.log("Fetching cart for user ID:", userId);

      const response = await fetch(
        `http://localhost:8000/cart?user_id=${userId}`
      );

      if (!response.ok) {
        throw new Error(
          `Failed to fetch cart. Status: ${response.status}`
        );
      }

      const data = await response.json();

      console.log("Cart fetched:", data);

      setCart(Array.isArray(data) ? data : []);

    } catch (error) {
      console.error("Cart fetch error:", error);
      setCart([]);

    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    setLoading(true);
    refreshCart();
  }, [refreshCart]);

  const cartCount = cart.reduce(
    (total, item) =>
      total + (item.quantity || 0),
    0
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        setCart,
        cartCount,
        loading,
        refreshCart,
        userId,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export default CartProvider;

export const useCart = () => {
  const context = useContext(CartContext);

  if (context === null) {
    throw new Error(
      "useCart must be used within a CartProvider"
    );
  }

  return context;
};