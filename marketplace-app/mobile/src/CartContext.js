import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useState } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      const stored = await AsyncStorage.getItem('cart');
      if (stored) setItems(JSON.parse(stored));
      setLoaded(true);
    })();
  }, []);

  useEffect(() => {
    if (loaded) AsyncStorage.setItem('cart', JSON.stringify(items));
  }, [items, loaded]);

  function addToCart(product, quantity = 1) {
    setItems((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        return prev.map((i) => (i.product.id === product.id ? { ...i, quantity: i.quantity + quantity } : i));
      }
      return [...prev, { product, quantity }];
    });
  }

  function removeFromCart(productId) {
    setItems((prev) => prev.filter((i) => i.product.id !== productId));
  }

  function clearStore(storeId) {
    setItems((prev) => prev.filter((i) => i.product.store_id !== storeId));
  }

  const groupedByStore = Object.values(
    items.reduce((acc, item) => {
      const key = item.product.store_id;
      if (!acc[key]) {
        acc[key] = {
          storeId: item.product.store_id,
          storeName: item.product.store_name,
          storeType: item.product.store_type,
          items: [],
          total: 0,
        };
      }
      acc[key].items.push(item);
      acc[key].total += item.product.price * item.quantity;
      return acc;
    }, {})
  );

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, clearStore, groupedByStore }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
