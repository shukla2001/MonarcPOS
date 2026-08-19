import React, { createContext, useContext, useState, useMemo } from 'react';
import { CartItem, Item } from '../types';

interface CartContextType {
  cart: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
  totalItemCount: number;
  addToCart: (item: Item, quantity?: number) => { success: boolean; message?: string };
  updateQuantity: (itemId: number, quantity: number) => { success: boolean; message?: string };
  removeFromCart: (itemId: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);

  const addToCart = (item: Item, quantity: number = 1) => {
    if (item.stock <= 0) {
      return { success: false, message: `"${item.name}" is currently out of stock.` };
    }

    let addedSuccessfully = true;
    let feedbackMessage = '';

    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex((ci) => ci.item.id === item.id);

      if (existingIndex > -1) {
        const existing = prevCart[existingIndex];
        const newQty = existing.quantity + quantity;

        if (newQty > item.stock) {
          addedSuccessfully = false;
          feedbackMessage = `Cannot add more. Only ${item.stock} in stock.`;
          return prevCart;
        }

        const newCart = [...prevCart];
        newCart[existingIndex] = { ...existing, quantity: newQty };
        return newCart;
      } else {
        if (quantity > item.stock) {
          addedSuccessfully = false;
          feedbackMessage = `Only ${item.stock} in stock.`;
          return prevCart;
        }

        return [...prevCart, { item, quantity }];
      }
    });

    return { success: addedSuccessfully, message: feedbackMessage };
  };

  const updateQuantity = (itemId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return { success: true };
    }

    let updatedSuccessfully = true;
    let feedbackMessage = '';

    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex((ci) => ci.item.id === itemId);
      if (existingIndex === -1) return prevCart;

      const currentItem = prevCart[existingIndex];
      if (quantity > currentItem.item.stock) {
        updatedSuccessfully = false;
        feedbackMessage = `Cannot exceed stock limit (${currentItem.item.stock}).`;
        return prevCart;
      }

      const newCart = [...prevCart];
      newCart[existingIndex] = { ...currentItem, quantity };
      return newCart;
    });

    return { success: updatedSuccessfully, message: feedbackMessage };
  };

  const removeFromCart = (itemId: number) => {
    setCart((prevCart) => prevCart.filter((ci) => ci.item.id !== itemId));
  };

  const clearCart = () => {
    setCart([]);
  };

  // Calculations
  const { subtotal, tax, total, totalItemCount } = useMemo(() => {
    const rawSubtotal = cart.reduce((sum, ci) => {
      const price = typeof ci.item.price === 'string' ? parseFloat(ci.item.price) : ci.item.price;
      return sum + price * ci.quantity;
    }, 0);

    const subtotalFormatted = Math.round(rawSubtotal * 100) / 100;
    // 5% GST
    const taxFormatted = Math.round(subtotalFormatted * 0.05 * 100) / 100;
    const totalFormatted = Math.round((subtotalFormatted + taxFormatted) * 100) / 100;
    const count = cart.reduce((sum, ci) => sum + ci.quantity, 0);

    return {
      subtotal: subtotalFormatted,
      tax: taxFormatted,
      total: totalFormatted,
      totalItemCount: count,
    };
  }, [cart]);

  return (
    <CartContext.Provider
      value={{
        cart,
        subtotal,
        tax,
        total,
        totalItemCount,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
