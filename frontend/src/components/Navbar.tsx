import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Package,
  Users,
  BarChart3,
  LogOut,
  Clock,
  Crown,
  History,
  Store,
  UserCheck,
} from 'lucide-react';

interface NavbarProps {
  activeTab: 'pos' | 'inventory' | 'workers' | 'reports';
  setActiveTab: (tab: 'pos' | 'inventory' | 'workers' | 'reports') => void;
  onOpenHistory: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, onOpenHistory }) => {
  const { user, isAdmin, logout } = useAuth();
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-[#FFFDF9]/95 backdrop-blur-md border-b border-[#F5E6CC] shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#DFB870] shadow-sm bg-white flex items-center justify-center p-0.5">
              <img
                src="/monarc-logo.jpg"
                alt="Monarc Crest"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif font-bold text-2xl tracking-wider text-[#92400E]">
                  MONARC
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#FAF0CF] text-[#92400E] border border-[#DFB870]/50 uppercase tracking-widest">
                  Parlour
                </span>
              </div>
              <p className="text-[10px] tracking-[0.2em] font-medium text-[#B45309]/80 uppercase">
                Ice-Creams & Desserts
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-[#FAF3E7] p-1.5 rounded-2xl border border-[#F5E6CC]">
            <button
              onClick={() => setActiveTab('pos')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                activeTab === 'pos'
                  ? 'bg-gradient-to-r from-[#DFB870] to-[#C68A4C] text-white shadow-md'
                  : 'text-[#78350F] hover:bg-[#F5E6CC]/60'
              }`}
            >
              <Store className="w-4 h-4" />
              <span>POS Desk</span>
            </button>

            {/* Admin Only Tabs */}
            {isAdmin && (
              <>
                <button
                  onClick={() => setActiveTab('inventory')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    activeTab === 'inventory'
                      ? 'bg-gradient-to-r from-[#DFB870] to-[#C68A4C] text-white shadow-md'
                      : 'text-[#78350F] hover:bg-[#F5E6CC]/60'
                  }`}
                >
                  <Package className="w-4 h-4" />
                  <span>Inventory & Menu</span>
                </button>

                <button
                  onClick={() => setActiveTab('workers')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    activeTab === 'workers'
                      ? 'bg-gradient-to-r from-[#DFB870] to-[#C68A4C] text-white shadow-md'
                      : 'text-[#78350F] hover:bg-[#F5E6CC]/60'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span>Staff Manager</span>
                </button>

                <button
                  onClick={() => setActiveTab('reports')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    activeTab === 'reports'
                      ? 'bg-gradient-to-r from-[#DFB870] to-[#C68A4C] text-white shadow-md'
                      : 'text-[#78350F] hover:bg-[#F5E6CC]/60'
                  }`}
                >
                  <BarChart3 className="w-4 h-4" />
                  <span>Sales & Reports</span>
                </button>
              </>
            )}
          </nav>

          {/* Right Action Area: Clock, Order History, User Info & Logout */}
          <div className="flex items-center gap-3">
            {/* Live Clock */}
            <div className="hidden lg:flex items-center gap-1.5 text-xs font-mono font-medium text-[#78350F] bg-[#FAF3E7] px-3 py-1.5 rounded-xl border border-[#F5E6CC]">
              <Clock className="w-3.5 h-3.5 text-[#B45309]" />
              <span>{currentTime}</span>
            </div>

            {/* Order History Button */}
            <button
              onClick={onOpenHistory}
              title="Recent Orders & Reprint"
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#78350F] bg-[#FAF3E7] hover:bg-[#F5E6CC] rounded-xl border border-[#F5E6CC] transition-colors"
            >
              <History className="w-4 h-4 text-[#B45309]" />
              <span className="hidden sm:inline">Orders</span>
            </button>

            {/* User Profile Badge */}
            <div className="flex items-center gap-2.5 pl-2 border-l border-[#F5E6CC]">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-[#1E1B18] leading-tight flex items-center justify-end gap-1">
                  {user?.name}
                  {isAdmin ? (
                    <Crown className="w-3.5 h-3.5 text-[#B45309]" />
                  ) : (
                    <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                  )}
                </p>
                <div className="flex items-center justify-end gap-1 mt-0.5">
                  <span
                    className={`inline-block w-1.5 h-1.5 rounded-full ${
                      isAdmin ? 'bg-[#C68A4C]' : 'bg-emerald-500'
                    }`}
                  />
                  <span className="text-[10px] uppercase tracking-wider font-semibold text-[#78350F]/70">
                    {isAdmin ? 'Store Admin' : 'Cashier'}
                  </span>
                </div>
              </div>

              {/* Logout Button */}
              <button
                onClick={logout}
                title="Logout"
                className="p-2 rounded-xl text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Tabs */}
        <div className="md:hidden flex items-center justify-around py-2 border-t border-[#F5E6CC] overflow-x-auto gap-2">
          <button
            onClick={() => setActiveTab('pos')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap ${
              activeTab === 'pos'
                ? 'bg-[#C68A4C] text-white'
                : 'text-[#78350F] bg-[#FAF3E7]'
            }`}
          >
            <Store className="w-3.5 h-3.5" />
            <span>POS Desk</span>
          </button>
          {isAdmin && (
            <>
              <button
                onClick={() => setActiveTab('inventory')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap ${
                  activeTab === 'inventory'
                    ? 'bg-[#C68A4C] text-white'
                    : 'text-[#78350F] bg-[#FAF3E7]'
                }`}
              >
                <Package className="w-3.5 h-3.5" />
                <span>Inventory</span>
              </button>
              <button
                onClick={() => setActiveTab('workers')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap ${
                  activeTab === 'workers'
                    ? 'bg-[#C68A4C] text-white'
                    : 'text-[#78350F] bg-[#FAF3E7]'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Staff</span>
              </button>
              <button
                onClick={() => setActiveTab('reports')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap ${
                  activeTab === 'reports'
                    ? 'bg-[#C68A4C] text-white'
                    : 'text-[#78350F] bg-[#FAF3E7]'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Reports</span>
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
