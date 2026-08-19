import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, renderHook, act } from '@testing-library/react';
import React from 'react';
import { CartProvider, useCart } from '../src/context/CartContext';
import { Navbar } from '../src/components/Navbar';
import { AuthProvider, useAuth } from '../src/context/AuthContext';
import { Item } from '../src/types';

const mockItem1: Item = {
  id: 1,
  name: 'Royal Belgian Dark Chocolate',
  categoryId: 1,
  price: 120.0,
  unit: 'scoop',
  stock: 20,
};

const mockItem2: Item = {
  id: 2,
  name: 'Monarc Crown Jewel Sundae',
  categoryId: 2,
  price: 280.0,
  unit: 'piece',
  stock: 10,
};

describe('Monarc POS Cart & Calculations Test Suite', () => {
  it('should initialize with an empty cart and zero totals', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <CartProvider>{children}</CartProvider>
    );
    const { result } = renderHook(() => useCart(), { wrapper });

    expect(result.current.cart).toEqual([]);
    expect(result.current.subtotal).toBe(0);
    expect(result.current.tax).toBe(0);
    expect(result.current.total).toBe(0);
    expect(result.current.totalItemCount).toBe(0);
  });

  it('should calculate accurate subtotal, 5% GST, and grand total when items are added', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <CartProvider>{children}</CartProvider>
    );
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      // Add 2 scoops of Belgian Chocolate (120 * 2 = 240)
      result.current.addToCart(mockItem1, 2);
      // Add 1 Crown Jewel Sundae (280 * 1 = 280)
      result.current.addToCart(mockItem2, 1);
    });

    // Subtotal = 240 + 280 = 520
    expect(result.current.subtotal).toBe(520);
    // 5% GST = 520 * 0.05 = 26
    expect(result.current.tax).toBe(26);
    // Total = 520 + 26 = 546
    expect(result.current.total).toBe(546);
    expect(result.current.totalItemCount).toBe(3);
  });

  it('should prevent adding more items than available stock', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <CartProvider>{children}</CartProvider>
    );
    const { result } = renderHook(() => useCart(), { wrapper });

    let response: any;
    act(() => {
      // Try adding 15 sundaes when only 10 are in stock
      response = result.current.addToCart(mockItem2, 15);
    });

    expect(response.success).toBe(false);
    expect(response.message).toContain('stock');
    expect(result.current.cart.length).toBe(0);
  });

  it('should remove item when quantity is decremented to 0', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <CartProvider>{children}</CartProvider>
    );
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addToCart(mockItem1, 1);
    });
    expect(result.current.cart.length).toBe(1);

    act(() => {
      result.current.updateQuantity(mockItem1.id, 0);
    });
    expect(result.current.cart.length).toBe(0);
    expect(result.current.total).toBe(0);
  });
});
