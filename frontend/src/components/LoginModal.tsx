import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Lock, User, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';

export const LoginModal: React.FC = () => {
  const { login } = useAuth();
  const [username, setUsername] = useState<string>('admin');
  const [password, setPassword] = useState<string>('Admin@123');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setErrorMsg('Please enter both username and password');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    const res = await login({ username, password });
    setIsLoading(false);

    if (!res.success) {
      setErrorMsg(res.message || 'Login failed. Please check credentials.');
    }
  };

  const handleQuickFill = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-gradient-to-br from-[#FFFDF9] via-[#FAF3E7] to-[#F7E2D8] relative overflow-hidden">
      {/* Background Decorative Accents */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-[#DFB870]/15 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#F7E2D8]/80 rounded-full blur-3xl translate-x-1/3 translate-y-1/3 pointer-events-none" />

      <div className="w-full max-w-md bg-[#FFFDF9]/95 backdrop-blur-md rounded-3xl border border-[#F5E6CC] shadow-2xl p-8 relative z-10 space-y-6">
        {/* Monarc Royal Crest & Heading */}
        <div className="text-center space-y-2">
          <div className="w-24 h-24 mx-auto rounded-full overflow-hidden border-3 border-[#DFB870] shadow-gold bg-white p-1">
            <img
              src="/monarc-logo.jpg"
              alt="Monarc Ice Creams Crest"
              className="w-full h-full object-contain"
            />
          </div>
          <h1 className="font-serif font-extrabold text-3xl tracking-wider text-[#92400E]">
            MONARC
          </h1>
          <p className="text-xs font-bold tracking-[0.25em] text-[#B45309]/80 uppercase">
            Ice-Creams & Desserts
          </p>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF0CF] border border-[#DFB870]/50 text-[#92400E] text-xs font-semibold mt-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>POS Kiosk & Enterprise Portal</span>
          </div>
        </div>

        {/* Quick Demo Access Pills */}
        <div className="space-y-1.5 bg-[#FAF3E7] p-3 rounded-2xl border border-[#F5E6CC]">
          <p className="text-[11px] font-bold text-[#78350F] uppercase tracking-wider text-center mb-1">
            Quick Role Demo
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => handleQuickFill('admin', 'Admin@123')}
              className={`p-2 rounded-xl border text-center transition-all font-semibold ${
                username === 'admin'
                  ? 'bg-[#DFB870] text-white border-[#C68A4C] shadow-sm'
                  : 'bg-white text-[#78350F] border-[#F5E6CC] hover:bg-[#F5E6CC]'
              }`}
            >
              👑 Store Admin
            </button>

            <button
              type="button"
              onClick={() => handleQuickFill('cashier1', 'Worker@123')}
              className={`p-2 rounded-xl border text-center transition-all font-semibold ${
                username === 'cashier1'
                  ? 'bg-[#DFB870] text-white border-[#C68A4C] shadow-sm'
                  : 'bg-white text-[#78350F] border-[#F5E6CC] hover:bg-[#F5E6CC]'
              }`}
            >
              🍦 Cashier #1
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#78350F] uppercase tracking-wider mb-1.5">
              Username
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. admin or cashier1"
                className="w-full pl-10 pr-4 py-3 bg-white border border-[#F5E6CC] rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#C68A4C] text-[#1E1B18]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#78350F] uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 bg-white border border-[#F5E6CC] rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#C68A4C] text-[#1E1B18]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 px-6 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 text-white bg-gradient-to-r from-[#DFB870] via-[#C68A4C] to-[#B45309] hover:opacity-95 shadow-lg shadow-[#C68A4C]/30 transition-transform active:scale-98"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Sign In to Terminal</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="text-center text-[11px] text-stone-400">
          <p>Monarc POS Enterprise v1.0 • admin.monarcicecreams.com</p>
        </div>
      </div>
    </div>
  );
};
