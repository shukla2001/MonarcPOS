import React from 'react';
import { Order } from '../types';
import { Printer, X, CheckCircle2, QrCode } from 'lucide-react';

interface ThermalReceiptProps {
  order: Order | null;
  onClose: () => void;
}

export const ThermalReceipt: React.FC<ThermalReceiptProps> = ({ order, onClose }) => {
  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  const formattedDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const formattedTime = new Date(order.createdAt).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in duration-150">
        {/* Modal Top Bar (Hidden during window.print()) */}
        <div className="p-4 bg-[#FAF3E7] border-b border-[#F5E6CC] flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2 text-[#92400E]">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span className="font-bold text-sm">Order Placed Successfully</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-[#F5E6CC] text-[#78350F] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Thermal Receipt Canvas (Standard 80mm Layout) */}
        <div className="p-6 overflow-y-auto bg-stone-50 flex justify-center">
          <div
            id="thermal-receipt-print-area"
            className="bg-white p-5 rounded-xl border border-dashed border-stone-300 shadow-sm w-full max-w-[320px] text-stone-900 font-mono text-xs leading-relaxed"
          >
            {/* Monarc Logo & Header */}
            <div className="text-center space-y-1 pb-3 border-b border-dashed border-stone-300">
              <div className="w-14 h-14 mx-auto mb-1">
                <img
                  src="/monarc-logo.jpg"
                  alt="Monarc Crest"
                  className="w-full h-full object-contain mx-auto"
                />
              </div>
              <h1 className="font-serif font-black text-base tracking-wider text-black">
                MONARC ICE CREAMS
              </h1>
              <p className="text-[10px] tracking-widest text-stone-500 uppercase">
                Premium Parlour & Desserts
              </p>
              <p className="text-[9px] text-stone-500">
                GSTIN: 27AAAPM1042N1Z8 | FSSAI: 11521008000492
              </p>
              <p className="text-[9px] text-stone-500">Flagship Parlour, High Street</p>
            </div>

            {/* Receipt Meta */}
            <div className="py-2.5 border-b border-dashed border-stone-300 text-[11px] space-y-0.5">
              <div className="flex justify-between">
                <span className="font-bold">Bill No:</span>
                <span className="font-bold">{order.orderNumber}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Date:</span>
                <span>{formattedDate} {formattedTime}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Cashier:</span>
                <span className="font-semibold text-black">{order.cashier?.name || 'Staff'}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Payment Mode:</span>
                <span className="font-bold uppercase text-black">
                  {order.paymentMode}
                </span>
              </div>
            </div>

            {/* Line Items Table */}
            <div className="py-2.5 border-b border-dashed border-stone-300 space-y-2">
              <div className="flex justify-between font-bold text-[10px] uppercase text-stone-500 border-b pb-1">
                <span className="w-1/2">Item Description</span>
                <span className="w-1/6 text-center">Qty</span>
                <span className="w-1/3 text-right">Amount</span>
              </div>

              {order.items.map((orderItem, idx) => (
                <div key={idx} className="space-y-0.5 text-[11px]">
                  <div className="flex justify-between font-semibold">
                    <span className="w-1/2 truncate">{orderItem.item?.name || 'Dessert Item'}</span>
                    <span className="w-1/6 text-center">{orderItem.quantity}</span>
                    <span className="w-1/3 text-right">
                      ₹{(Number(orderItem.unitPrice) * orderItem.quantity).toFixed(2)}
                    </span>
                  </div>
                  <div className="text-[9px] text-stone-400 pl-1">
                    @{Number(orderItem.unitPrice).toFixed(2)} / {orderItem.item?.unit || 'unit'}
                  </div>
                </div>
              ))}
            </div>

            {/* Financial Summary */}
            <div className="py-2.5 border-b-2 border-stone-800 space-y-1 text-[11px]">
              <div className="flex justify-between text-stone-600">
                <span>Subtotal:</span>
                <span>₹{Number(order.subtotal).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>CGST (2.5%):</span>
                <span>₹{(Number(order.tax) / 2).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>SGST (2.5%):</span>
                <span>₹{(Number(order.tax) / 2).toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-extrabold text-sm pt-1 border-t border-dashed border-stone-300 text-black">
                <span>GRAND TOTAL:</span>
                <span>₹{Number(order.total).toFixed(2)}</span>
              </div>
            </div>

            {/* Footer / QR / Thank You */}
            <div className="pt-3 text-center space-y-1.5">
              <p className="text-[10px] font-bold text-stone-800">
                🍦 Thank you for visiting Monarc! 🍨
              </p>
              <p className="text-[9px] text-stone-500">
                Follow us @MonarcIceCreams | www.monarcicecreams.com
              </p>
              <div className="pt-1 flex justify-center">
                <div className="p-1 bg-stone-100 rounded border border-stone-200">
                  <QrCode className="w-12 h-12 text-stone-700" />
                </div>
              </div>
              <p className="text-[8px] text-stone-400">Scan for Invoice & Loyalty Points</p>
              <p className="text-[8px] text-stone-400 font-sans mt-2">
                --- Computer Generated Tax Invoice ---
              </p>
            </div>
          </div>
        </div>

        {/* Modal Bottom Actions (Hidden during print) */}
        <div className="p-4 bg-white border-t border-stone-200 flex items-center gap-3 print:hidden">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-sm transition-colors"
          >
            New Order (Done)
          </button>

          <button
            onClick={handlePrint}
            className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-[#DFB870] to-[#C68A4C] hover:opacity-95 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-transform active:scale-95"
          >
            <Printer className="w-4 h-4" />
            <span>Print 80mm Bill</span>
          </button>
        </div>
      </div>
    </div>
  );
};
