import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { POSDesk } from './components/POSDesk';
import { InventoryManager } from './components/InventoryManager';
import { WorkerManager } from './components/WorkerManager';
import { SalesReports } from './components/SalesReports';
import { ThermalReceipt } from './components/ThermalReceipt';
import { ReceiptHistoryModal } from './components/ReceiptHistoryModal';
import { LoginModal } from './components/LoginModal';
import { Order } from './types';

export const App: React.FC = () => {
  const { isAuthenticated, loading, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<'pos' | 'inventory' | 'workers' | 'reports'>('pos');
  const [activeReceiptOrder, setActiveReceiptOrder] = useState<Order | null>(null);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState<boolean>(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFFDF9] flex flex-col items-center justify-center space-y-4">
        <div className="w-16 h-16 rounded-full border-4 border-[#DFB870] border-t-transparent animate-spin" />
        <p className="font-serif font-bold text-lg text-[#92400E]">Loading Monarc POS...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginModal />;
  }

  // Enforce worker tab restriction
  const currentTab = !isAdmin && activeTab !== 'pos' ? 'pos' : activeTab;

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col selection:bg-[#F7E2D8] selection:text-[#78350F]">
      {/* Top Brand Navbar */}
      <Navbar
        activeTab={currentTab}
        setActiveTab={setActiveTab}
        onOpenHistory={() => setIsHistoryModalOpen(true)}
      />

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentTab === 'pos' && (
          <POSDesk onOrderSuccess={(order) => setActiveReceiptOrder(order)} />
        )}

        {currentTab === 'inventory' && isAdmin && <InventoryManager />}

        {currentTab === 'workers' && isAdmin && <WorkerManager />}

        {currentTab === 'reports' && isAdmin && (
          <SalesReports onViewOrderReceipt={(order) => setActiveReceiptOrder(order)} />
        )}
      </main>

      {/* 80mm Thermal Printable Bill Modal */}
      {activeReceiptOrder && (
        <ThermalReceipt
          order={activeReceiptOrder}
          onClose={() => setActiveReceiptOrder(null)}
        />
      )}

      {/* Order History Lookup Modal */}
      <ReceiptHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        onSelectOrder={(order) => setActiveReceiptOrder(order)}
      />
    </div>
  );
};

export default App;
