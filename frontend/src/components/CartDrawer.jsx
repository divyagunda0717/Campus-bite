import React from 'react';
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export default function CartDrawer() {
  const { isDrawerOpen, setIsDrawerOpen, cartStall, items, updateQuantity, removeItem, clearCart, totalAmount, totalCount } = useCart();
  const navigate = useNavigate();

  if (!isDrawerOpen) return null;

  const handleCheckout = () => {
    setIsDrawerOpen(false);
    navigate('/checkout');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        onClick={() => setIsDrawerOpen(false)}
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
            <div>
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-orange-600" />
                <h2 className="text-lg font-bold text-slate-900">Your Campus Cart</h2>
              </div>
              {cartStall && (
                <p className="text-xs text-slate-500 mt-0.5">
                  Ordering from: <strong className="text-slate-700">{cartStall.name}</strong>
                </p>
              )}
            </div>
            <button
              onClick={() => setIsDrawerOpen(false)}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/50 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                  <ShoppingBag className="w-8 h-8 text-slate-300" />
                </div>
                <h3 className="font-semibold text-slate-700 text-base mb-1">Your cart is empty</h3>
                <p className="text-xs text-slate-500 max-w-xs mb-6">
                  Browse through our campus stalls and pick your favorite snacks, meals, and drinks.
                </p>
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="px-4 py-2 text-sm font-semibold text-orange-600 bg-orange-50 hover:bg-orange-100 rounded-xl transition"
                >
                  Explore Stalls
                </button>
              </div>
            ) : (
              items.map(({ food, quantity }) => (
                <div
                  key={food.id}
                  className="p-3.5 bg-slate-50/70 border border-slate-200/70 rounded-2xl flex items-center gap-3.5 hover:shadow-sm transition"
                >
                  {food.image_url ? (
                    <img
                      src={food.image_url}
                      alt={food.name}
                      className="w-16 h-16 object-cover rounded-xl border border-slate-200"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600 font-bold">
                      {food.name[0]}
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-slate-900 text-sm truncate">{food.name}</h4>
                    <p className="text-xs text-slate-500 font-medium">₹{food.price} each</p>
                    <p className="text-xs font-bold text-slate-800 mt-1">₹{(food.price * quantity).toFixed(2)}</p>
                  </div>

                  <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
                    <button
                      onClick={() => updateQuantity(food.id, -1)}
                      className="w-6 h-6 flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-6 text-center text-xs font-bold text-slate-800">{quantity}</span>
                    <button
                      onClick={() => updateQuantity(food.id, 1)}
                      className="w-6 h-6 flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    onClick={() => removeItem(food.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Footer with Checkout CTA */}
          {items.length > 0 && (
            <div className="p-5 border-t border-slate-100 bg-slate-50 space-y-3">
              <div className="flex justify-between items-center text-xs text-slate-500">
                <span>Items ({totalCount})</span>
                <span>₹{totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-base font-bold text-slate-900">
                <span>To Pay</span>
                <span className="text-orange-600 text-lg">₹{totalAmount.toFixed(2)}</span>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  onClick={clearCart}
                  className="px-3 py-2.5 text-xs font-medium text-slate-500 hover:text-rose-600 bg-white border border-slate-200 hover:border-rose-200 rounded-xl transition"
                >
                  Clear
                </button>
                <button
                  onClick={handleCheckout}
                  className="flex-1 py-3 px-4 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-xl transition shadow-md shadow-orange-500/20 flex items-center justify-center gap-2 text-sm"
                >
                  Select Pickup Time
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
