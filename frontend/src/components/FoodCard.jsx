import React from 'react';
import { Plus, Minus, Ban } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function FoodCard({ food, stall }) {
  const { items, addToCart, updateQuantity } = useCart();

  const isAvailable = food.is_available;
  const isStallOpen = stall?.is_open ?? true;
  const canOrder = isAvailable && isStallOpen;

  const cartItem = items.find(i => i.food.id === food.id);
  const quantity = cartItem ? cartItem.quantity : 0;

  return (
    <div className={`bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition duration-200 overflow-hidden flex flex-col justify-between ${!canOrder ? 'opacity-80' : ''}`}>
      {/* Food Image */}
      <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
        <img
          src={food.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80'}
          alt={food.name}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
        />

        {/* Category Badge */}
        <span className="absolute top-3 left-3 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-white/95 text-slate-800 shadow-sm backdrop-blur-xs">
          {food.category}
        </span>

        {/* Veg Symbol */}
        <div className="absolute top-3 right-3 w-5 h-5 bg-white rounded-md flex items-center justify-center border border-slate-200 shadow-sm">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
        </div>

        {/* Unavailable Ribbon */}
        {!isAvailable && (
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-600 text-white flex items-center gap-1 shadow-md">
              <Ban className="w-3.5 h-3.5" />
              Unavailable
            </span>
          </div>
        )}
      </div>

      {/* Details */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start gap-2 mb-1">
            <h4 className="font-bold text-slate-900 text-base leading-snug">{food.name}</h4>
            <span className="font-extrabold text-slate-900 text-base text-right shrink-0">₹{food.price}</span>
          </div>

          <p className="text-slate-500 text-xs leading-relaxed line-clamp-2 mb-4">
            {food.description || 'Prepared fresh with high quality campus ingredients.'}
          </p>
        </div>

        {/* Action Button */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
          {!isStallOpen ? (
            <span className="text-xs text-rose-500 font-medium">Stall currently closed</span>
          ) : !isAvailable ? (
            <span className="text-xs text-slate-400 font-medium">Out of stock today</span>
          ) : quantity > 0 ? (
            <div className="w-full flex items-center justify-between bg-orange-50 border border-orange-200 rounded-xl p-1">
              <button
                onClick={() => updateQuantity(food.id, -1)}
                className="w-8 h-7 flex items-center justify-center rounded-lg bg-white text-orange-600 font-bold hover:bg-orange-100 transition shadow-xs"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="text-xs font-bold text-orange-950 px-2">{quantity} in cart</span>
              <button
                onClick={() => updateQuantity(food.id, 1)}
                className="w-8 h-7 flex items-center justify-center rounded-lg bg-orange-600 text-white font-bold hover:bg-orange-700 transition shadow-xs"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => addToCart(food, stall)}
              className="w-full py-2 px-3 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1.5 shadow-md shadow-orange-500/20 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              Add to Cart
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
