import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useState } from 'react';

const FavoritesContext = createContext(null);

export function FavoritesProvider({ children }) {
  const [ids, setIds] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      const stored = await AsyncStorage.getItem('favorites');
      if (stored) setIds(JSON.parse(stored));
      setLoaded(true);
    })();
  }, []);

  useEffect(() => {
    if (loaded) AsyncStorage.setItem('favorites', JSON.stringify(ids));
  }, [ids, loaded]);

  function toggleFavorite(productId) {
    setIds((prev) => (prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]));
  }

  function isFavorite(productId) {
    return ids.includes(productId);
  }

  return (
    <FavoritesContext.Provider value={{ ids, toggleFavorite, isFavorite }}>{children}</FavoritesContext.Provider>
  );
}

export function useFavorites() {
  return useContext(FavoritesContext);
}
