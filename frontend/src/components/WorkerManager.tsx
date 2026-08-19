import React, { useState, useEffect } from 'react';
import { User, Role } from '../types';
import api from '../services/api';
import {
  Users,
  UserPlus,
  ShieldCheck,
  UserCheck,
  KeyRound,
  Edit2,
  RefreshCw,
  Search,
  X,
  Crown,
} from 'lucide-react';

export const WorkerManager: React.FC = () => {
  const [workers, setWorkers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [selectedWorker, setSelectedWorker] = useState<User | null>(null);

  // Form State
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [role, setRole] = useState<Role>('WORKER');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );

  const fetchWorkers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/workers');
      if (res.data.success) {
        setWorkers(res.data.workers);
      }
    } catch (error: any) {
      console.error('Failed to load staff list:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkers();
  }, []);

  const showNotification = (type: 'success' | 'error', text: string) => {
    setStatusMessage({ type, text });
    setTimeout(() => setStatusMessage(null), 4000);
  };

  const handleCreateWorker = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password || !name) {
      showNotification('error', 'Please fill all required fields');
      return;
    }

    try {
      const res = await api.post('/workers', {
        username: username.trim().toLowerCase(),
        password,
        name: name.trim(),
        role,
      });

      if (res.data.success) {
        showNotification('success', `Staff account for ${name} created successfully.`);
        setUsername('');
        setPassword('');
        setName('');
        setRole('WORKER');
        setIsCreateModalOpen(false);
        fetchWorkers();
      }
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Failed to create staff account.';
      showNotification('error', msg);
    }
  };

  const handleUpdateWorker = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWorker) return;

    try {
      const payload: any = {
        name: name.trim(),
        role,
      };
      if (password) {
        payload.password = password;
      }

      const res = await api.put(`/workers/${selectedWorker.id}`, payload);
      if (res.data.success) {
        showNotification('success', `Account for ${name} updated.`);
        setIsEditModalOpen(false);
        fetchWorkers();
      }
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Failed to update account.';
      showNotification('error', msg);
    }
  };

  const handleToggleStatus = async (worker: User) => {
    try {
      const res = await api.patch(`/workers/${worker.id}/toggle`);
      if (res.data.success) {
        showNotification('success', res.data.message);
        fetchWorkers();
      }
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Failed to change status.';
      showNotification('error', msg);
    }
  };

  const openEditModal = (worker: User) => {
    setSelectedWorker(worker);
    setName(worker.name);
    setRole(worker.role);
    setPassword('');
    setIsEditModalOpen(true);
  };

  const filteredWorkers = workers.filter(
    (w) =>
      w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Banner Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#FFFDF9] p-5 rounded-3xl border border-[#F5E6CC] shadow-sm flex items-center gap-4">
          <div className="p-3.5 bg-[#FAF0CF] text-[#92400E] rounded-2xl">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-[#78350F]/70">Total Staff Accounts</p>
            <h3 className="font-serif font-bold text-2xl text-[#1E1B18]">{workers.length}</h3>
          </div>
        </div>

        <div className="bg-[#FFFDF9] p-5 rounded-3xl border border-[#F5E6CC] shadow-sm flex items-center gap-4">
          <div className="p-3.5 bg-emerald-100 text-emerald-800 rounded-2xl">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-emerald-800/80">Active Cashiers / Staff</p>
            <h3 className="font-serif font-bold text-2xl text-emerald-900">
              {workers.filter((w) => w.isActive).length}
            </h3>
          </div>
        </div>

        <div className="bg-[#FFFDF9] p-5 rounded-3xl border border-[#F5E6CC] shadow-sm flex items-center gap-4">
          <div className="p-3.5 bg-[#FAF3E7] text-[#92400E] rounded-2xl">
            <Crown className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-[#78350F]/70">Store Administrators</p>
            <h3 className="font-serif font-bold text-2xl text-[#1E1B18]">
              {workers.filter((w) => w.role === 'ADMIN').length}
            </h3>
          </div>
        </div>
      </div>

      {/* Notifications */}
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

      {/* Action & Filter Bar */}
      <div className="bg-[#FFFDF9] p-5 rounded-3xl border border-[#F5E6CC] shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name or username..."
            className="w-full pl-10 pr-4 py-2.5 bg-[#FAF3E7]/60 border border-[#F5E6CC] rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#C68A4C] text-[#1E1B18]"
          />
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              setUsername('');
              setPassword('');
              setName('');
              setRole('WORKER');
              setIsCreateModalOpen(true);
            }}
            className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#DFB870] to-[#C68A4C] hover:opacity-95 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition-transform active:scale-95"
          >
            <UserPlus className="w-4 h-4" />
            <span>Create Staff Account</span>
          </button>

          <button
            onClick={fetchWorkers}
            title="Refresh Staff List"
            className="p-2.5 rounded-2xl bg-[#FAF3E7] hover:bg-[#F5E6CC] text-[#78350F] border border-[#F5E6CC] transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Staff Table */}
      <div className="bg-[#FFFDF9] rounded-3xl border border-[#F5E6CC] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-[#1E1B18]">
            <thead className="bg-[#FAF3E7] text-xs uppercase font-bold text-[#78350F] border-b border-[#F5E6CC]">
              <tr>
                <th className="py-4 px-6">Employee Name</th>
                <th className="py-4 px-6">Username</th>
                <th className="py-4 px-6">System Role</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6">Orders Handled</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F5E6CC]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-stone-400">
                    <div className="flex justify-center items-center gap-2">
                      <div className="w-5 h-5 border-2 border-[#C68A4C] border-t-transparent rounded-full animate-spin" />
                      <span>Loading staff accounts...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredWorkers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-stone-400">
                    No staff accounts match your search.
                  </td>
                </tr>
              ) : (
                filteredWorkers.map((worker) => (
                  <tr key={worker.id} className="hover:bg-[#FAF3E7]/40 transition-colors">
                    {/* Name */}
                    <td className="py-4 px-6">
                      <div className="font-bold text-[#1E1B18] flex items-center gap-2">
                        <span>{worker.name}</span>
                        {worker.role === 'ADMIN' && (
                          <Crown className="w-3.5 h-3.5 text-[#B45309]" />
                        )}
                      </div>
                      <div className="text-[10px] text-stone-400 font-mono">{worker.id}</div>
                    </td>

                    {/* Username */}
                    <td className="py-4 px-6">
                      <span className="font-mono text-xs text-stone-700 bg-stone-100 px-2 py-0.5 rounded-md">
                        @{worker.username}
                      </span>
                    </td>

                    {/* Role */}
                    <td className="py-4 px-6">
                      <span
                        className={`text-xs font-bold px-2.5 py-1 rounded-xl uppercase tracking-wider inline-flex items-center gap-1 ${
                          worker.role === 'ADMIN'
                            ? 'bg-[#FAF0CF] text-[#92400E] border border-[#DFB870]'
                            : 'bg-stone-100 text-stone-700 border border-stone-200'
                        }`}
                      >
                        {worker.role === 'ADMIN' ? (
                          <>
                            <ShieldCheck className="w-3 h-3 text-[#B45309]" />
                            <span>Store Admin</span>
                          </>
                        ) : (
                          <>
                            <UserCheck className="w-3 h-3 text-stone-500" />
                            <span>Cashier / Worker</span>
                          </>
                        )}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-4 px-6">
                      <button
                        onClick={() => handleToggleStatus(worker)}
                        title="Click to toggle active status"
                        className={`text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 transition-all ${
                          worker.isActive
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            worker.isActive ? 'bg-emerald-600' : 'bg-rose-600'
                          }`}
                        />
                        <span>{worker.isActive ? 'Active' : 'Deactivated'}</span>
                      </button>
                    </td>

                    {/* Orders Handled */}
                    <td className="py-4 px-6 font-semibold text-stone-700">
                      {worker._count?.orders ?? 0} bills
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 text-right space-x-2">
                      <button
                        onClick={() => openEditModal(worker)}
                        className="px-3 py-1.5 text-xs font-bold text-[#78350F] bg-[#FAF3E7] hover:bg-[#F5E6CC] rounded-xl border border-[#F5E6CC] transition-colors inline-flex items-center gap-1"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Edit / Reset</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal 1: Create Worker */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-[#FFFDF9] rounded-3xl max-w-md w-full border border-[#F5E6CC] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-150">
            <div className="p-5 bg-[#FAF3E7] border-b border-[#F5E6CC] flex items-center justify-between">
              <h3 className="font-bold text-lg text-[#1E1B18]">Register Staff Account</h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-[#F5E6CC] text-stone-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateWorker} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#78350F] uppercase mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Vikram Verma"
                  className="w-full px-4 py-2.5 bg-white border border-[#F5E6CC] rounded-2xl text-sm focus:ring-2 focus:ring-[#C68A4C] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#78350F] uppercase mb-1">
                  Username *
                </label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. cashier_vikram"
                  className="w-full px-4 py-2.5 bg-white border border-[#F5E6CC] rounded-2xl text-sm focus:ring-2 focus:ring-[#C68A4C] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#78350F] uppercase mb-1">
                  Password * (Min 6 chars)
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 bg-white border border-[#F5E6CC] rounded-2xl text-sm focus:ring-2 focus:ring-[#C68A4C] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#78350F] uppercase mb-1">
                  Role Assignment *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label
                    className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-1 cursor-pointer transition-all ${
                      role === 'WORKER'
                        ? 'bg-[#FAF0CF] text-[#92400E] border-[#DFB870] ring-2 ring-[#DFB870]/40'
                        : 'bg-white text-stone-600 border-[#F5E6CC]'
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value="WORKER"
                      checked={role === 'WORKER'}
                      onChange={() => setRole('WORKER')}
                      className="sr-only"
                    />
                    <UserCheck className="w-5 h-5 text-[#B45309]" />
                    <span className="text-xs font-bold">Cashier (POS Only)</span>
                  </label>

                  <label
                    className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-1 cursor-pointer transition-all ${
                      role === 'ADMIN'
                        ? 'bg-[#FAF0CF] text-[#92400E] border-[#DFB870] ring-2 ring-[#DFB870]/40'
                        : 'bg-white text-stone-600 border-[#F5E6CC]'
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value="ADMIN"
                      checked={role === 'ADMIN'}
                      onChange={() => setRole('ADMIN')}
                      className="sr-only"
                    />
                    <Crown className="w-5 h-5 text-[#B45309]" />
                    <span className="text-xs font-bold">Store Admin (Full)</span>
                  </label>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2.5 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-[#DFB870] to-[#C68A4C] hover:opacity-95 text-white font-bold text-xs shadow-md"
                >
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Edit Worker & Password Reset */}
      {isEditModalOpen && selectedWorker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-[#FFFDF9] rounded-3xl max-w-md w-full border border-[#F5E6CC] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-150">
            <div className="p-5 bg-[#FAF3E7] border-b border-[#F5E6CC] flex items-center justify-between">
              <h3 className="font-bold text-lg text-[#1E1B18]">
                Edit Account: @{selectedWorker.username}
              </h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-[#F5E6CC] text-stone-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateWorker} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#78350F] uppercase mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-[#F5E6CC] rounded-2xl text-sm focus:ring-2 focus:ring-[#C68A4C] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#78350F] uppercase mb-1">
                  Role Assignment
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as Role)}
                  className="w-full px-4 py-2.5 bg-white border border-[#F5E6CC] rounded-2xl text-sm focus:ring-2 focus:ring-[#C68A4C] focus:outline-none"
                >
                  <option value="WORKER">Cashier (POS Desk Access Only)</option>
                  <option value="ADMIN">Store Administrator (Full Control)</option>
                </select>
              </div>

              <div className="border-t border-[#F5E6CC] pt-3">
                <label className="block text-xs font-bold text-[#78350F] uppercase mb-1 flex items-center gap-1">
                  <KeyRound className="w-3.5 h-3.5 text-[#B45309]" />
                  <span>Reset Password (Optional)</span>
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Leave blank to keep existing password"
                  className="w-full px-4 py-2.5 bg-white border border-[#F5E6CC] rounded-2xl text-sm focus:ring-2 focus:ring-[#C68A4C] focus:outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2.5 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-[#DFB870] to-[#C68A4C] hover:opacity-95 text-white font-bold text-xs shadow-md"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
