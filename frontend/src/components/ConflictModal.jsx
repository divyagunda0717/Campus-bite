import React from 'react';
import { AlertTriangle, Trash2, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function ConflictModal() {
  const { conflictModalOpen, pendingItemToAdd, cartStall, cancelConflict, confirmClearAndAdd } = useCart();

  if (!conflictModalOpen || !pendingItemToAdd) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
        <div className="p-6">
          <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center mb-4">
            <AlertTriangle className="w-6 h-6" />
          </div>

          <h3 className="text-xl font-bold text-slate-900 mb-2">
            Items from another stall in cart
          </h3>

          <p className="text-slate-600 text-sm leading-relaxed mb-4">
            Your cart contains items from <strong className="text-slate-800">{cartStall?.name || 'another stall'}</strong>.
            CampusBite orders can only be placed from one stall at a time to ensure smooth pickup coordination.
          </p>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 mb-6 flex items-center justify-between text-xs text-slate-500">
            <span>New item: <strong className="text-slate-700">{pendingItemToAdd.food.name}</strong></span>
            <span>Stall: <strong className="text-orange-600">{pendingItemToAdd.stall.name}</strong></span>
          </div>

          <div className="flex flex-col-reverse sm:flex-row gap-3">
            <button
              onClick={cancelConflict}
              className="w-full sm:w-1/2 px-4 py-2.5 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              onClick={confirmClearAndAdd}
              className="w-full sm:w-1/2 px-4 py-2.5 text-sm font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-xl transition flex items-center justify-center gap-1.5 shadow-md shadow-orange-500/20"
            >
              <Trash2 className="w-4 h-4" />
              Clear Cart & Add Item
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
