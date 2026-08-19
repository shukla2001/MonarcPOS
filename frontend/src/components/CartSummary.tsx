import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { PaymentMode, Order } from '../types';
import api from '../services/api';
import confetti from 'canvas-confetti';
import {
  Trash2,
  Plus,
  Minus,
  Banknote,
  QrCode,
  CreditCard,
  Printer,
  ShoppingBag,
  AlertCircle,
} from 'lucide-react';

interface CartSummaryProps {
  onOrderSuccess: (order: Order) => void;
}

export const CartSummary: React.FC<CartSummaryProps> = ({ onOrderSuccess }) => {
  const { cart, subtotal, tax, total, totalItemCount, updateQuantity, removeFromCart, clearCart } =
    useCart();

  const [paymentMode, setPaymentMode] = useState<PaymentMode>('UPI');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleCheckout = async () => {
    if (cart.length === 0) return;

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const payload = {
        paymentMode,
        items: cart.map((ci) => ({
          itemId: ci.item.id,
          quantity: ci.quantity,
        })),
      };

      const res = await api.post('/orders', payload);

      if (res.data.success) {
        // Trigger celebratory confetti for parlour cashier experience
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#DFB870', '#C68A4C', '#B45309', '#F7E2D8'],
          });
        } catch (e) {
          // ignore if canvas not supported
        }

        const newOrder = res.data.order;
        clearCart();
        onOrderSuccess(newOrder);
      }
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Checkout failed. Please try again.';
      setErrorMessage(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-[#FFFDF9] rounded-3xl border border-[#F5E6CC] shadow-sm flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-[#F5E6CC] bg-gradient-to-r from-[#FFFDF9] to-[#FAF3E7] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-[#FAF0CF] text-[#92400E]">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-base text-[#1E1B18]">Current Order</h2>
            <p className="text-xs text-[#78350F]/70">{totalItemCount} items selected</p>
          </div>
        </div>
        {cart.length > 0 && (
          <button
            onClick={clearCart}
            className="text-xs text-rose-600 hover:text-rose-800 font-semibold px-2.5 py-1 rounded-lg hover:bg-rose-50 transition-colors"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Cart Items List */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3 min-h-[220px]">
        {cart.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-stone-400">
            <div className="w-16 h-16 rounded-full bg-[#FAF3E7] flex items-center justify-center mb-3">
              <ShoppingBag className="w-8 h-8 text-[#DFB870]" />
            </div>
            <p className="font-medium text-stone-600 text-sm">Cart is empty</p>
            <p className="text-xs text-stone-400 mt-1 max-w-[200px]">
              Tap items from the menu to build your customer's order.
            </p>
          </div>
        ) : (
          cart.map((ci) => (
            <div
              key={ci.item.id}
              className="bg-[#FAF3E7]/60 p-3 rounded-2xl border border-[#F5E6CC] flex items-center justify-between gap-3 group transition-all hover:bg-[#FAF3E7]"
            >
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-sm text-[#1E1B18] truncate">{ci.item.name}</h4>
                <div className="flex items-center gap-2 text-xs text-[#78350F]/80 mt-0.5">
                  <span className="font-semibold text-[#92400E]">
                    ₹{Number(ci.item.price).toFixed(2)}
                  </span>
                  <span>•</span>
                  <span className="capitalize">{ci.item.unit}</span>
                </div>
              </div>

              {/* Quantity Controls */}
              <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-[#F5E6CC] shadow-inner">
                <button
                  onClick={() => updateQuantity(ci.item.id, ci.quantity - 1)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg bg-[#FAF3E7] hover:bg-[#F5E6CC] text-[#78350F] active:scale-95 transition-transform"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-7 text-center font-bold text-xs text-[#1E1B18]">
                  {ci.quantity}
                </span>
                <button
                  onClick={() => {
                    const res = updateQuantity(ci.item.id, ci.quantity + 1);
                    if (!res.success && res.message) {
                      setErrorMessage(res.message);
                      setTimeout(() => setErrorMessage(null), 3000);
                    }
                  }}
                  className="w-7 h-7 flex items-center justify-center rounded-lg bg-[#DFB870] hover:bg-[#C68A4C] text-white active:scale-95 transition-transform"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Line Total & Remove */}
              <div className="text-right flex items-center gap-2">
                <div className="font-bold text-sm text-[#92400E]">
                  ₹{(Number(ci.item.price) * ci.quantity).toFixed(2)}
                </div>
                <button
                  onClick={() => removeFromCart(ci.item.id)}
                  className="text-stone-400 hover:text-rose-600 p-1 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Error alert */}
      {errorMessage && (
        <div className="mx-4 mb-2 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-700 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Footer / Calculation & Checkout */}
      <div className="p-5 border-t border-[#F5E6CC] bg-[#FFFDF9] space-y-4">
        {/* Cost Summary */}
        <div className="space-y-1.5 text-xs text-[#78350F]">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span className="font-medium">₹{subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center text-[#78350F]/80">
            <span className="flex items-center gap-1">
              <span>GST (5%)</span>
              <span className="text-[10px] bg-[#FAF0CF] text-[#92400E] px-1.5 py-0.5 rounded-full font-mono">
                Standard
              </span>
            </span>
            <span className="font-medium">₹{tax.toFixed(2)}</span>
          </div>
          <div className="border-t border-[#F5E6CC] pt-2 flex justify-between items-baseline">
            <span className="font-bold text-base text-[#1E1B18]">Total Payable</span>
            <span className="font-serif font-extrabold text-2xl text-[#92400E]">
              ₹{total.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Payment Mode Selector */}
        <div>
          <label className="block text-[11px] font-bold text-[#78350F] uppercase tracking-wider mb-2">
            Payment Mode
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setPaymentMode('CASH')}
              className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 text-xs font-bold transition-all ${
                paymentMode === 'CASH'
                  ? 'bg-emerald-600 text-white border-emerald-700 shadow-md ring-2 ring-emerald-300'
                  : 'bg-[#FAF3E7] text-stone-700 border-[#F5E6CC] hover:bg-[#F5E6CC]'
              }`}
            >
              <Banknote className="w-4 h-4" />
              <span>Cash</span>
            </button>

            <button
              type="button"
              onClick={() => setPaymentMode('UPI')}
              className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 text-xs font-bold transition-all ${
                paymentMode === 'UPI'
                  ? 'bg-purple-600 text-white border-purple-700 shadow-md ring-2 ring-purple-300'
                  : 'bg-[#FAF3E7] text-stone-700 border-[#F5E6CC] hover:bg-[#F5E6CC]'
              }`}
            >
              <QrCode className="w-4 h-4" />
              <span>UPI / QR</span>
            </button>

            <button
              type="button"
              onClick={() => setPaymentMode('CARD')}
              className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 text-xs font-bold transition-all ${
                paymentMode === 'CARD'
                  ? 'bg-blue-600 text-white border-blue-700 shadow-md ring-2 ring-blue-300'
                  : 'bg-[#FAF3E7] text-stone-700 border-[#F5E6CC] hover:bg-[#F5E6CC]'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              <span>Card / POS</span>
            </button>
          </div>
        </div>

        {/* Checkout Button */}
        <button
          onClick={handleCheckout}
          disabled={cart.length === 0 || isProcessing}
          className={`w-full py-4 px-6 rounded-2xl font-bold text-base flex items-center justify-center gap-2 text-white shadow-lg transition-all transform active:scale-98 ${
            cart.length === 0 || isProcessing
              ? 'bg-stone-300 cursor-not-allowed shadow-none'
              : 'bg-gradient-to-r from-[#DFB870] via-[#C68A4C] to-[#B45309] hover:opacity-95 shadow-[#C68A4C]/30 hover:shadow-[#C68A4C]/50'
          }`}
        >
          {isProcessing ? (
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Processing Order...</span>
            </div>
          ) : (
            <>
              <Printer className="w-5 h-5" />
              <span>Pay & Print Thermal Bill (₹{total.toFixed(2)})</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
