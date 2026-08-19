import React, { useState, useEffect } from 'react';
import { Order } from '../types';
import api from '../services/api';
import { History, Search, Printer, X, RefreshCw } from 'lucide-react';

interface ReceiptHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectOrder: (order: Order) => void;
}

export const ReceiptHistoryModal: React.FC<ReceiptHistoryModalProps> = ({
  isOpen,
  onClose,
  onSelectOrder,
}) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get('/orders', {
        params: { search: search.trim() || undefined, limit: 30 },
      });
      if (res.data.success) {
        setOrders(res.data.orders);
      }
    } catch (error) {
      console.error('Failed to load past orders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchOrders();
    }
  }, [isOpen, search]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-[#FFFDF9] rounded-3xl max-w-2xl w-full border border-[#F5E6CC] shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in duration-150">
        {/* Header */}
        <div className="p-5 bg-[#FAF3E7] border-b border-[#F5E6CC] flex items-center justify-between">
          <div className="flex items-center gap-2 text-[#92400E]">
            <History className="w-5 h-5" />
            <h3 className="font-bold text-lg">Recent Order Bills</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-[#F5E6CC] text-stone-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 bg-[#FFFDF9] border-b border-[#F5E6CC] flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Bill Number (e.g. #ORD-1001)..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-[#F5E6CC] rounded-2xl text-xs focus:ring-2 focus:ring-[#C68A4C] text-[#1E1B18]"
            />
          </div>
          <button
            onClick={fetchOrders}
            className="p-2 rounded-xl bg-[#FAF3E7] hover:bg-[#F5E6CC] text-[#78350F] border border-[#F5E6CC]"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Orders List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {loading ? (
            <div className="py-12 text-center text-stone-400">
              <div className="w-5 h-5 border-2 border-[#C68A4C] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <span>Fetching transactions...</span>
            </div>
          ) : orders.length === 0 ? (
            <div className="py-12 text-center text-stone-400 text-sm">
              No orders found matching search.
            </div>
          ) : (
            orders.map((order) => (
              <div
                key={order.id}
                className="p-3.5 rounded-2xl bg-white border border-[#F5E6CC] flex items-center justify-between hover:bg-[#FAF3E7]/40 transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sm text-[#92400E]">
                      {order.orderNumber}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase ${
                        order.paymentMode === 'UPI'
                          ? 'bg-purple-100 text-purple-800'
                          : order.paymentMode === 'CARD'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {order.paymentMode}
                    </span>
                  </div>
                  <p className="text-xs text-stone-500 mt-1">
                    Cashier: <span className="font-semibold text-black">{order.cashier?.name}</span> •{' '}
                    {new Date(order.createdAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}{' '}
                    on {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="font-serif font-bold text-base text-[#1E1B18]">
                      ₹{Number(order.total).toFixed(2)}
                    </p>
                    <p className="text-[10px] text-stone-400">{order.items?.length || 0} items</p>
                  </div>

                  <button
                    onClick={() => {
                      onSelectOrder(order);
                      onClose();
                    }}
                    className="px-3 py-2 rounded-xl bg-[#FAF3E7] hover:bg-[#DFB870] hover:text-white text-[#78350F] font-bold text-xs border border-[#F5E6CC] flex items-center gap-1.5 transition-colors"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>View Bill</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
