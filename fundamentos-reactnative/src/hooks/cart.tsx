import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const storedProducts =
        (await AsyncStorage.getItem('@Cart:products')) || null;

      if (storedProducts) {
        setProducts(JSON.parse(storedProducts));
      }
    }

    loadProducts();
  }, []);

  const increment = useCallback(
    async id => {
      const product = products.find(prod => prod.id === id);
      if (product) {
        product.quantity += 1;
      }

      setProducts([...products]);
      await AsyncStorage.setItem('@Cart:products', JSON.stringify(products));
    },
    [products],
  );

  const addToCart = useCallback(
    async product => {
      const productExists =
        products.find(prod => prod.id === product.id) || null;

      if (productExists) {
        increment(product.id);
      } else {
        setProducts([...products, { ...product, quantity: 1 }]);
        await AsyncStorage.setItem(
          '@Cart:products',
          JSON.stringify([...products, { ...product, quantity: 1 }]),
        );
      }
    },
    [products, increment],
  );

  const decrement = useCallback(
    async id => {
      const product = products.find(prod => prod.id === id);
      if (product && product.quantity > 1) {
        product.quantity -= 1;
        setProducts([...products]);
      } else {
        setProducts([...products.filter((prod: Product) => prod.id !== id)]);
      }

      await AsyncStorage.setItem('@Cart:products', JSON.stringify(products));
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
