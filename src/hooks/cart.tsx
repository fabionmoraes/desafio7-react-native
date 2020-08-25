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
      const product = await AsyncStorage.getItem('@goMarketplace:products');

      if (product) {
        const parseproduct = JSON.parse(product);

        setProducts([...parseproduct]);
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async product => {
      const productExist = products.find(item => item.id === product.id);

      if (productExist) {
        setProducts(
          products.map(p =>
            p.id === product.id ? { ...product, quantity: p.quantity + 1 } : p,
          ),
        );
      } else {
        setProducts([...products, { ...product, quantity: 1 }]);
      }

      await AsyncStorage.setItem(
        '@goMarketplace:products',
        JSON.stringify(products),
      );
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      const percorre = products.map(item => ({
        ...item,
        quantity: item.id === id ? item.quantity + 1 : item.quantity,
      }));
      setProducts(percorre);

      await AsyncStorage.setItem(
        '@goMarketplace:products',
        JSON.stringify(percorre),
      );
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const percorre = products.map(item => ({
        ...item,
        quantity:
          item.id === id && item.quantity > 0
            ? item.quantity - 1
            : item.quantity,
      }));
      setProducts(percorre);

      await AsyncStorage.setItem(
        '@goMarketplace:products',
        JSON.stringify(percorre),
      );
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
