import React, { useState, useEffect } from 'react';
import { Item, Category } from '../types';
import api from '../services/api';
import {
  Package,
  Plus,
  Edit2,
  Trash2,
  RefreshCw,
  Search,
  AlertTriangle,
  Layers,
  X,
  PlusCircle,
  TrendingUp,
} from 'lucide-react';

export const InventoryManager: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [filterLowStockOnly, setFilterLowStockOnly] = useState<boolean>(false);

  // Modal States
  const [isItemModalOpen, setIsItemModalOpen] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState<boolean>(false);
  const [isRestockModalOpen, setIsRestockModalOpen] = useState<boolean>(false);
  const [restockTargetItem, setRestockTargetItem] = useState<Item | null>(null);
  const [restockQty, setRestockQty] = useState<number>(20);

  // Form States
  const [itemName, setItemName] = useState<string>('');
  const [itemCategoryId, setItemCategoryId] = useState<number | ''>('');
  const [itemPrice, setItemPrice] = useState<string>('');
  const [itemUnit, setItemUnit] = useState<string>('scoop');
  const [itemStock, setItemStock] = useState<number>(0);
  const [categoryName, setCategoryName] = useState<string>('');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );

  const fetchInventory = async () => {
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
    } catch (error: any) {
      console.error('Failed to load inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const showNotification = (type: 'success' | 'error', text: string) => {
    setStatusMessage({ type, text });
    setTimeout(() => setStatusMessage(null), 4000);
  };

  const openCreateItemModal = () => {
    setEditingItem(null);
    setItemName('');
    setItemCategoryId(categories[0]?.id || '');
    setItemPrice('');
    setItemUnit('scoop');
    setItemStock(30);
    setIsItemModalOpen(true);
  };

  const openEditItemModal = (item: Item) => {
    setEditingItem(item);
    setItemName(item.name);
    setItemCategoryId(item.categoryId);
    setItemPrice(String(item.price));
    setItemUnit(item.unit);
    setItemStock(item.stock);
    setIsItemModalOpen(true);
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName || !itemCategoryId || !itemPrice || !itemUnit) {
      showNotification('error', 'Please fill all required fields');
      return;
    }

    try {
      if (editingItem) {
        const res = await api.put(`/items/${editingItem.id}`, {
          name: itemName,
          categoryId: Number(itemCategoryId),
          price: Number(itemPrice),
          unit: itemUnit,
          stock: Number(itemStock),
        });
        if (res.data.success) {
          showNotification('success', `Item "${itemName}" updated successfully.`);
          setIsItemModalOpen(false);
          fetchInventory();
        }
      } else {
        const res = await api.post('/items', {
          name: itemName,
          categoryId: Number(itemCategoryId),
          price: Number(itemPrice),
          unit: itemUnit,
          stock: Number(itemStock),
        });
        if (res.data.success) {
          showNotification('success', `New dessert "${itemName}" added to menu.`);
          setIsItemModalOpen(false);
          fetchInventory();
        }
      }
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Failed to save item.';
      showNotification('error', msg);
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryName.trim()) return;

    try {
      const res = await api.post('/items/categories', { name: categoryName.trim() });
      if (res.data.success) {
        showNotification('success', `Category "${categoryName}" created.`);
        setCategoryName('');
        setIsCategoryModalOpen(false);
        fetchInventory();
      }
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Failed to create category.';
      showNotification('error', msg);
    }
  };

  const handleQuickRestock = async (item: Item, qty: number) => {
    try {
      const res = await api.patch(`/items/${item.id}/restock`, { quantity: qty });
      if (res.data.success) {
        showNotification('success', `Restocked +${qty} units of ${item.name}.`);
        setIsRestockModalOpen(false);
        fetchInventory();
      }
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Restock failed.';
      showNotification('error', msg);
    }
  };

  const handleDeleteItem = async (item: Item) => {
    if (!confirm(`Are you sure you want to delete "${item.name}"?`)) return;

    try {
      const res = await api.delete(`/items/${item.id}`);
      if (res.data.success) {
        showNotification('success', `Item "${item.name}" deleted.`);
        fetchInventory();
      }
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Failed to delete item.';
      showNotification('error', msg);
    }
  };

  // Metrics
  const totalItems = items.length;
  const lowStockItems = items.filter((i) => i.stock > 0 && i.stock <= 10).length;
  const outOfStockItems = items.filter((i) => i.stock === 0).length;

  const filteredItems = items.filter((item) => {
    const matchesCat = selectedCategory === null || item.categoryId === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLowStock = !filterLowStockOnly || item.stock <= 10;
    return matchesCat && matchesSearch && matchesLowStock;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner & Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#FFFDF9] p-5 rounded-3xl border border-[#F5E6CC] shadow-sm flex items-center gap-4">
          <div className="p-3.5 bg-[#FAF0CF] text-[#92400E] rounded-2xl">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-[#78350F]/70">Total Menu Items</p>
            <h3 className="font-serif font-bold text-2xl text-[#1E1B18]">{totalItems}</h3>
          </div>
        </div>

        <div className="bg-[#FFFDF9] p-5 rounded-3xl border border-[#F5E6CC] shadow-sm flex items-center gap-4">
          <div className="p-3.5 bg-amber-100 text-amber-800 rounded-2xl">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-amber-800/80">Low Stock Alert</p>
            <h3 className="font-serif font-bold text-2xl text-amber-900">{lowStockItems} items</h3>
          </div>
        </div>

        <div className="bg-[#FFFDF9] p-5 rounded-3xl border border-[#F5E6CC] shadow-sm flex items-center gap-4">
          <div className="p-3.5 bg-rose-100 text-rose-800 rounded-2xl">
            <Trash2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-rose-800/80">Out of Stock</p>
            <h3 className="font-serif font-bold text-2xl text-rose-900">{outOfStockItems} items</h3>
          </div>
        </div>

        <div className="bg-[#FFFDF9] p-5 rounded-3xl border border-[#F5E6CC] shadow-sm flex items-center gap-4">
          <div className="p-3.5 bg-[#FAF3E7] text-[#92400E] rounded-2xl">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-[#78350F]/70">Active Categories</p>
            <h3 className="font-serif font-bold text-2xl text-[#1E1B18]">{categories.length}</h3>
          </div>
        </div>
      </div>

      {/* Notification Toast */}
      {statusMessage && (
        <div
          className={`p-4 rounded-2xl border text-sm flex items-center justify-between ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          <span>{statusMessage.text}</span>
          <button
            onClick={() => setStatusMessage(null)}
            className="text-xs font-bold px-2 py-1 hover:opacity-75"
          >
            ✕
          </button>
        </div>
      )}

      {/* Controls Bar: Search, Category Filter, Buttons */}
      <div className="bg-[#FFFDF9] p-5 rounded-3xl border border-[#F5E6CC] shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Search & Low-Stock Toggle */}
          <div className="flex flex-1 items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search catalog items..."
                className="w-full pl-10 pr-4 py-2.5 bg-[#FAF3E7]/60 border border-[#F5E6CC] rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#C68A4C] text-[#1E1B18]"
              />
            </div>

            <button
              onClick={() => setFilterLowStockOnly(!filterLowStockOnly)}
              className={`px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                filterLowStockOnly
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-[#FAF3E7] text-[#78350F] border border-[#F5E6CC] hover:bg-[#F5E6CC]'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Low Stock ({lowStockItems + outOfStockItems})</span>
            </button>
          </div>

          {/* Action Buttons: Add Item, Add Category, Refresh */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsCategoryModalOpen(true)}
              className="px-4 py-2.5 rounded-2xl bg-[#FAF3E7] hover:bg-[#F5E6CC] text-[#78350F] font-bold text-xs border border-[#F5E6CC] flex items-center gap-1.5 transition-colors"
            >
              <PlusCircle className="w-4 h-4 text-[#B45309]" />
              <span>New Category</span>
            </button>

            <button
              onClick={openCreateItemModal}
              className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#DFB870] to-[#C68A4C] hover:opacity-95 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition-transform active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Add Menu Item</span>
            </button>

            <button
              onClick={fetchInventory}
              title="Refresh"
              className="p-2.5 rounded-2xl bg-[#FAF3E7] hover:bg-[#F5E6CC] text-[#78350F] border border-[#F5E6CC] transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedCategory === null
                ? 'bg-[#C68A4C] text-white shadow-sm'
                : 'bg-[#FAF3E7] text-[#78350F] hover:bg-[#F5E6CC]'
            }`}
          >
            All Categories
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === c.id
                  ? 'bg-[#C68A4C] text-white shadow-sm'
                  : 'bg-[#FAF3E7] text-[#78350F] hover:bg-[#F5E6CC]'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-[#FFFDF9] rounded-3xl border border-[#F5E6CC] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-[#1E1B18]">
            <thead className="bg-[#FAF3E7] text-xs uppercase font-bold text-[#78350F] border-b border-[#F5E6CC]">
              <tr>
                <th className="py-4 px-6">Dessert / Item</th>
                <th className="py-4 px-6">Category</th>
                <th className="py-4 px-6">Price</th>
                <th className="py-4 px-6">Serving Unit</th>
                <th className="py-4 px-6">Stock Level</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F5E6CC]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-stone-400">
                    <div className="flex justify-center items-center gap-2">
                      <div className="w-5 h-5 border-2 border-[#C68A4C] border-t-transparent rounded-full animate-spin" />
                      <span>Loading inventory...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-stone-400">
                    No items matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-[#FAF3E7]/40 transition-colors">
                    {/* Item Name */}
                    <td className="py-4 px-6">
                      <div className="font-bold text-[#1E1B18]">{item.name}</div>
                      <div className="text-[11px] text-stone-400">ID: #{item.id}</div>
                    </td>

                    {/* Category */}
                    <td className="py-4 px-6">
                      <span className="px-2.5 py-1 rounded-lg bg-[#FAF0CF] text-[#92400E] text-xs font-semibold border border-[#DFB870]/40">
                        {item.category?.name || 'Unassigned'}
                      </span>
                    </td>

                    {/* Price */}
                    <td className="py-4 px-6">
                      <span className="font-serif font-bold text-[#92400E]">
                        ₹{Number(item.price).toFixed(2)}
                      </span>
                    </td>

                    {/* Unit */}
                    <td className="py-4 px-6">
                      <span className="capitalize text-stone-600 text-xs font-medium bg-stone-100 px-2 py-0.5 rounded-md">
                        {item.unit}
                      </span>
                    </td>

                    {/* Stock Level */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-bold text-sm ${
                            item.stock === 0
                              ? 'text-rose-600'
                              : item.stock <= 10
                              ? 'text-amber-600'
                              : 'text-emerald-700'
                          }`}
                        >
                          {item.stock} {item.unit}s
                        </span>
                        {item.stock <= 10 && (
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                              item.stock === 0
                                ? 'bg-rose-100 text-rose-700'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {item.stock === 0 ? 'Empty' : 'Low'}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 text-right space-x-2">
                      {/* Quick Restock Trigger */}
                      <button
                        onClick={() => {
                          setRestockTargetItem(item);
                          setRestockQty(20);
                          setIsRestockModalOpen(true);
                        }}
                        title="Restock Stock"
                        className="px-2.5 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-colors inline-flex items-center gap-1"
                      >
                        <TrendingUp className="w-3.5 h-3.5" />
                        <span>+Stock</span>
                      </button>

                      {/* Edit Button */}
                      <button
                        onClick={() => openEditItemModal(item)}
                        title="Edit Item"
                        className="p-1.5 text-[#78350F] bg-[#FAF3E7] hover:bg-[#F5E6CC] rounded-xl border border-[#F5E6CC] transition-colors inline-flex items-center"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      {/* Delete Button */}
                      <button
                        onClick={() => handleDeleteItem(item)}
                        title="Delete Item"
                        className="p-1.5 text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl border border-rose-200 transition-colors inline-flex items-center"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal 1: Create / Edit Item */}
      {isItemModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-[#FFFDF9] rounded-3xl max-w-lg w-full border border-[#F5E6CC] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-150">
            <div className="p-5 bg-[#FAF3E7] border-b border-[#F5E6CC] flex items-center justify-between">
              <h3 className="font-bold text-lg text-[#1E1B18]">
                {editingItem ? `Edit "${editingItem.name}"` : 'Add New Dessert Item'}
              </h3>
              <button
                onClick={() => setIsItemModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-[#F5E6CC] text-stone-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#78350F] uppercase mb-1">
                  Item Name *
                </label>
                <input
                  type="text"
                  required
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  placeholder="e.g. Royal Belgian Dark Chocolate"
                  className="w-full px-4 py-2.5 bg-white border border-[#F5E6CC] rounded-2xl text-sm focus:ring-2 focus:ring-[#C68A4C] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#78350F] uppercase mb-1">
                    Category *
                  </label>
                  <select
                    required
                    value={itemCategoryId}
                    onChange={(e) => setItemCategoryId(Number(e.target.value))}
                    className="w-full px-4 py-2.5 bg-white border border-[#F5E6CC] rounded-2xl text-sm focus:ring-2 focus:ring-[#C68A4C] focus:outline-none"
                  >
                    <option value="" disabled>Select category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#78350F] uppercase mb-1">
                    Serving Unit *
                  </label>
                  <select
                    value={itemUnit}
                    onChange={(e) => setItemUnit(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-[#F5E6CC] rounded-2xl text-sm focus:ring-2 focus:ring-[#C68A4C] focus:outline-none capitalize"
                  >
                    <option value="scoop">Scoop</option>
                    <option value="piece">Piece / Sundae / Waffle</option>
                    <option value="glass">Glass / Shake</option>
                    <option value="slice">Slice</option>
                    <option value="tub">Family Tub</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#78350F] uppercase mb-1">
                    Price (₹) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={itemPrice}
                    onChange={(e) => setItemPrice(e.target.value)}
                    placeholder="120.00"
                    className="w-full px-4 py-2.5 bg-white border border-[#F5E6CC] rounded-2xl text-sm focus:ring-2 focus:ring-[#C68A4C] focus:outline-none font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#78350F] uppercase mb-1">
                    Available Stock *
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={itemStock}
                    onChange={(e) => setItemStock(Number(e.target.value))}
                    className="w-full px-4 py-2.5 bg-white border border-[#F5E6CC] rounded-2xl text-sm focus:ring-2 focus:ring-[#C68A4C] focus:outline-none font-semibold"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsItemModalOpen(false)}
                  className="px-4 py-2.5 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-[#DFB870] to-[#C68A4C] hover:opacity-95 text-white font-bold text-xs shadow-md"
                >
                  {editingItem ? 'Update Item' : 'Save Dessert'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Create Category */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-[#FFFDF9] rounded-3xl max-w-md w-full border border-[#F5E6CC] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-150">
            <div className="p-5 bg-[#FAF3E7] border-b border-[#F5E6CC] flex items-center justify-between">
              <h3 className="font-bold text-lg text-[#1E1B18]">Add New Menu Category</h3>
              <button
                onClick={() => setIsCategoryModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-[#F5E6CC] text-stone-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCategory} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#78350F] uppercase mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  placeholder="e.g. Sizzling Brownies & Crepes"
                  className="w-full px-4 py-2.5 bg-white border border-[#F5E6CC] rounded-2xl text-sm focus:ring-2 focus:ring-[#C68A4C] focus:outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="px-4 py-2.5 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-[#DFB870] to-[#C68A4C] hover:opacity-95 text-white font-bold text-xs shadow-md"
                >
                  Create Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 3: Quick Restock */}
      {isRestockModalOpen && restockTargetItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-[#FFFDF9] rounded-3xl max-w-md w-full border border-[#F5E6CC] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-150">
            <div className="p-5 bg-emerald-50 border-b border-emerald-100 flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-800 font-bold">
                <TrendingUp className="w-5 h-5" />
                <span>Restock Inventory</span>
              </div>
              <button
                onClick={() => setIsRestockModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-emerald-100 text-stone-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <p className="text-xs text-stone-500">Target Item:</p>
                <h4 className="font-bold text-base text-[#1E1B18]">{restockTargetItem.name}</h4>
                <p className="text-xs text-stone-500 mt-1">
                  Current Stock: <span className="font-bold text-[#1E1B18]">{restockTargetItem.stock}</span> {restockTargetItem.unit}s
                </p>
              </div>

              {/* Quick Preset Buttons */}
              <div>
                <label className="block text-xs font-bold text-[#78350F] uppercase mb-2">
                  Quick Add Batch
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[10, 25, 50].map((qty) => (
                    <button
                      key={qty}
                      type="button"
                      onClick={() => handleQuickRestock(restockTargetItem, qty)}
                      className="py-2 px-3 rounded-xl bg-[#FAF3E7] hover:bg-[#DFB870] hover:text-white border border-[#F5E6CC] font-bold text-xs text-[#92400E] transition-colors"
                    >
                      +{qty} Units
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Quantity */}
              <div>
                <label className="block text-xs font-bold text-[#78350F] uppercase mb-1">
                  Or Enter Custom Quantity
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="1"
                    value={restockQty}
                    onChange={(e) => setRestockQty(Number(e.target.value))}
                    className="flex-1 px-4 py-2 bg-white border border-[#F5E6CC] rounded-2xl text-sm font-semibold focus:ring-2 focus:ring-[#C68A4C] focus:outline-none"
                  />
                  <button
                    onClick={() => handleQuickRestock(restockTargetItem, restockQty)}
                    className="px-5 py-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md"
                  >
                    Add Stock
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
