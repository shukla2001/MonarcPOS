import React, { useState, useEffect } from 'react';
import { Item, Category, Order } from '../types';
import { useCart } from '../context/CartContext';
import { CartSummary } from './CartSummary';
import api from '../services/api';
import {
  Search,
  IceCream,
  Layers,
  AlertTriangle,
  Plus,
  Check,
  RefreshCw,
} from 'lucide-react';

interface POSDeskProps {
  onOrderSuccess: (order: Order) => void;
}

export const POSDesk: React.FC<POSDeskProps> = ({ onOrderSuccess }) => {
  const { cart, addToCart } = useCart();
  const [items, setItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [justAddedId, setJustAddedId] = useState<number | null>(null);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);

  const fetchCatalog = async () => {
    try {
      setLoading(true);
      const [itemsRes, catRes] = await Promise.all([
        api.get('/items'),
        api.get('/items/categories'),
      ]);

      if (itemsRes.data.success) {
        setItems(itemsRes.data.items);
      }
      if (catRes.data.success) {
        setCategories(catRes.data.categories);
      }
    } catch (error) {
      console.error('Failed to load menu items:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalog();
  }, []);

  const filteredItems = items.filter((item) => {
    const matchesCat = selectedCategory === null || item.categoryId === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleItemClick = (item: Item) => {
    if (item.stock <= 0) return;

    const result = addToCart(item, 1);
    if (result.success) {
      setJustAddedId(item.id);
      setTimeout(() => setJustAddedId(null), 600);
    } else if (result.message) {
      setFeedbackError(result.message);
      setTimeout(() => setFeedbackError(null), 3000);
    }
  };

  const getItemCartQuantity = (itemId: number) => {
    const found = cart.find((ci) => ci.item.id === itemId);
    return found ? found.quantity : 0;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Left Column: Menu Catalog & Categories (8 cols on large screens) */}
      <div className="lg:col-span-8 space-y-4">
        {/* Search & Category Filter Bar */}
        <div className="bg-[#FFFDF9] p-4 rounded-3xl border border-[#F5E6CC] shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search flavours, sundaes, shakes..."
                className="w-full pl-10 pr-4 py-2.5 bg-[#FAF3E7]/60 border border-[#F5E6CC] rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#C68A4C] focus:bg-white transition-all text-[#1E1B18]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-stone-400 hover:text-stone-600"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Refresh & Items count */}
            <div className="flex items-center gap-2 self-end sm:self-auto text-xs text-[#78350F]">
              <span className="font-semibold">{filteredItems.length} items</span>
              <button
                onClick={fetchCatalog}
                title="Refresh Inventory"
                className="p-2 rounded-xl bg-[#FAF3E7] hover:bg-[#F5E6CC] text-[#78350F] transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Category Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                selectedCategory === null
                  ? 'bg-gradient-to-r from-[#DFB870] to-[#C68A4C] text-white shadow-md'
                  : 'bg-[#FAF3E7] text-[#78350F] hover:bg-[#F5E6CC] border border-[#F5E6CC]'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>All Flavours</span>
            </button>

            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  selectedCategory === cat.id
                    ? 'bg-gradient-to-r from-[#DFB870] to-[#C68A4C] text-white shadow-md'
                    : 'bg-[#FAF3E7] text-[#78350F] hover:bg-[#F5E6CC] border border-[#F5E6CC]'
                }`}
              >
                <IceCream className="w-3.5 h-3.5" />
                <span>{cat.name}</span>
                {cat._count?.items !== undefined && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      selectedCategory === cat.id
                        ? 'bg-white/20 text-white'
                        : 'bg-[#FAF0CF] text-[#92400E]'
                    }`}
                  >
                    {cat._count.items}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Global Feedback Banner */}
        {feedbackError && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{feedbackError}</span>
          </div>
        )}

        {/* Catalog Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-white/60 animate-pulse rounded-3xl h-44 border border-[#F5E6CC] p-4"
              />
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="bg-[#FFFDF9] rounded-3xl border border-[#F5E6CC] p-12 text-center text-stone-500 space-y-2">
            <IceCream className="w-12 h-12 mx-auto text-[#DFB870]" />
            <h3 className="font-bold text-base text-[#1E1B18]">No items found</h3>
            <p className="text-xs text-stone-400">
              Try adjusting your category selection or search keyword.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {filteredItems.map((item) => {
              const inCartQty = getItemCartQuantity(item.id);
              const isOutOfStock = item.stock <= 0;
              const isLowStock = item.stock > 0 && item.stock <= 10;
              const isJustAdded = justAddedId === item.id;

              return (
                <div
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  className={`group relative bg-[#FFFDF9] rounded-3xl p-4 border transition-all duration-200 select-none flex flex-col justify-between cursor-pointer ${
                    isOutOfStock
                      ? 'border-stone-200 opacity-60 cursor-not-allowed bg-stone-50'
                      : inCartQty > 0
                      ? 'border-[#DFB870] shadow-gold bg-[#FFFDF9] ring-2 ring-[#DFB870]/40'
                      : 'border-[#F5E6CC] hover:border-[#DFB870] hover:shadow-gold hover:-translate-y-0.5'
                  }`}
                >
                  {/* Top Badges: Category & Stock Indicator */}
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-[#FAF3E7] text-[#92400E] border border-[#F5E6CC] uppercase tracking-wider truncate max-w-[120px]">
                      {item.category?.name || 'Dessert'}
                    </span>

                    {/* Stock Status Badge */}
                    {isOutOfStock ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700">
                        Out of Stock
                      </span>
                    ) : isLowStock ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 flex items-center gap-1">
                        <span>Only {item.stock} left</span>
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold text-stone-400">
                        {item.stock} in stock
                      </span>
                    )}
                  </div>

                  {/* Item Name & Details */}
                  <div className="my-3">
                    <h3 className="font-bold text-sm text-[#1E1B18] group-hover:text-[#92400E] line-clamp-2 transition-colors">
                      {item.name}
                    </h3>
                    <p className="text-xs text-[#78350F]/70 mt-1 capitalize flex items-center gap-1">
                      <span>Serving:</span>
                      <span className="font-semibold text-[#1E1B18]">{item.unit}</span>
                    </p>
                  </div>

                  {/* Price & Add Action */}
                  <div className="pt-2 border-t border-[#F5E6CC]/80 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-stone-400 uppercase font-medium">Price</span>
                      <p className="font-serif font-extrabold text-lg text-[#92400E]">
                        ₹{Number(item.price).toFixed(2)}
                      </p>
                    </div>

                    {/* Action Button */}
                    <div
                      className={`w-9 h-9 rounded-2xl flex items-center justify-center transition-all ${
                        isOutOfStock
                          ? 'bg-stone-200 text-stone-400'
                          : isJustAdded
                          ? 'bg-emerald-500 text-white scale-110'
                          : inCartQty > 0
                          ? 'bg-gradient-to-r from-[#DFB870] to-[#C68A4C] text-white shadow-sm'
                          : 'bg-[#FAF3E7] text-[#92400E] group-hover:bg-[#DFB870] group-hover:text-white'
                      }`}
                    >
                      {isJustAdded ? (
                        <Check className="w-4 h-4" />
                      ) : inCartQty > 0 ? (
                        <span className="font-bold text-xs">x{inCartQty}</span>
                      ) : (
                        <Plus className="w-4 h-4" />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Right Column: Live Cart Summary (4 cols on large screens, sticky) */}
      <div className="lg:col-span-4 lg:sticky lg:top-24 h-[calc(100vh-7rem)]">
        <CartSummary onOrderSuccess={onOrderSuccess} />
      </div>
    </div>
  );
};
