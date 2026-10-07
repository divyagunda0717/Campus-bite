import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { createOrder, getStallQR, getStallById } from '../lib/dataService';
import SlotPicker from '../components/SlotPicker';
import { ArrowLeft, Clock, ShoppingBag, Banknote, QrCode, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function Checkout() {
  const { cartStall, items, totalAmount, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [selectedSlot, setSelectedSlot] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('cash'); // 'cash' or 'online'
  const [stallQR, setStallQR] = useState(null);
  const [onlinePaidVerified, setOnlinePaidVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    async function fetchQR() {
      if (cartStall?.id) {
        const qr = await getStallQR(cartStall.id);
        setStallQR(qr);
      }
    }
    fetchQR();
  }, [cartStall]);

  if (!cartStall || items.length === 0) {
    return (
      <div className="py-20 text-center bg-white rounded-3xl border border-slate-200 max-w-lg mx-auto p-8 shadow-xs">
        <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-slate-800">Your cart is empty</h2>
        <p className="text-xs text-slate-500 mt-1 mb-6">Add dishes from any campus stall before proceeding to checkout.</p>
        <Link to="/" className="px-5 py-2.5 bg-orange-600 text-white rounded-xl text-xs font-semibold">
          Explore Canteen Stalls
        </Link>
      </div>
    );
  }

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!selectedSlot) {
      setErrorMsg('Please select a 10-minute pickup window for your order.');
      return;
    }

    if (paymentMethod === 'online' && !onlinePaidVerified) {
      setErrorMsg('Please scan the stall QR code and click "I Have Completed Payment".');
      return;
    }

    setLoading(true);
    try {
      const order = await createOrder({
        userId: user?.id || 'guest-student',
        customerName: user?.name || 'Campus Student',
        customerEmail: user?.email || '',
        stallId: cartStall.id,
        stallName: cartStall.name,
        pickupSlotId: selectedSlot.id,
        pickupTime: selectedSlot.slot_label,
        totalAmount,
        paymentMethod,
        items
      });

      // Clear cart
      clearCart();

      // Navigate to Order Confirmation screen (Requirement 15)
      navigate(`/order-confirmation/${order.order_id}`);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div>
        <Link to={`/stall/${cartStall.id}`} className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition">
          <ArrowLeft className="w-4 h-4" />
          Back to {cartStall.name} Menu
        </Link>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-2">
          Checkout & Pickup Scheduling
        </h1>
        <p className="text-xs text-slate-500">
          Ordering from: <strong className="text-orange-600">{cartStall.name}</strong> • {cartStall.location}
        </p>
      </div>

      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2.5 text-xs text-rose-700 font-medium">
          <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Slot Picker & Payment */}
        <div className="lg:col-span-2 space-y-6">
          {/* 1. Pickup Slot Picker (Requirement 12) */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-orange-100 text-orange-600 text-xs font-black flex items-center justify-center">1</span>
              Pickup Slot Selection
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Select your expected pickup time. Food will be prepared fresh for your arrival. Slots have a max capacity of 10 orders per window.
            </p>

            <SlotPicker
              stallId={cartStall.id}
              selectedSlot={selectedSlot}
              onSelectSlot={(slot) => {
                setSelectedSlot(slot);
                setErrorMsg('');
              }}
            />
          </div>

          {/* 2. Payment Selection (Requirement 13) */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-5">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-orange-100 text-orange-600 text-xs font-black flex items-center justify-center">2</span>
              Payment Method
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Cash on Pickup */}
              <label
                className={`p-4 rounded-2xl border-2 cursor-pointer transition flex items-start gap-3 ${
                  paymentMethod === 'cash'
                    ? 'border-orange-500 bg-orange-50/30'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cash"
                  checked={paymentMethod === 'cash'}
                  onChange={() => {
                    setPaymentMethod('cash');
                    setOnlinePaidVerified(false);
                  }}
                  className="mt-0.5 text-orange-600 focus:ring-orange-500"
                />
                <div>
                  <div className="flex items-center gap-1.5 font-bold text-slate-900 text-sm">
                    <Banknote className="w-4 h-4 text-emerald-600" />
                    Cash on Pickup
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Pay in cash directly at the counter during your pickup window.
                  </p>
                </div>
              </label>

              {/* Online Payment (Stall UPI QR) */}
              <label
                className={`p-4 rounded-2xl border-2 cursor-pointer transition flex items-start gap-3 ${
                  paymentMethod === 'online'
                    ? 'border-orange-500 bg-orange-50/30'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="online"
                  checked={paymentMethod === 'online'}
                  onChange={() => setPaymentMethod('online')}
                  className="mt-0.5 text-orange-600 focus:ring-orange-500"
                />
                <div>
                  <div className="flex items-center gap-1.5 font-bold text-slate-900 text-sm">
                    <QrCode className="w-4 h-4 text-orange-600" />
                    Online Payment (Stall QR)
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Scan {cartStall.name}'s dedicated UPI QR code (Simulated for hackathon).
                  </p>
                </div>
              </label>
            </div>

            {/* Online Payment QR Display (Requirement 13) */}
            {paymentMethod === 'online' && (
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4 animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{cartStall.name} Payment QR</h4>
                    <p className="text-xs text-slate-500 font-mono mt-0.5">UPI ID: {stallQR?.upi_id || 'canteen@upi'}</p>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 bg-amber-100 text-amber-800 rounded-lg">
                    Amount: ₹{totalAmount.toFixed(2)}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-6 p-4 bg-white rounded-xl border border-slate-200/80">
                  <div className="p-2 bg-white rounded-xl border border-slate-200 shadow-sm shrink-0">
                    <img
                      src={stallQR?.qr_image_url || `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi://pay?pa=campusbite@upi`}
                      alt={`${cartStall.name} QR`}
                      className="w-36 h-36 object-contain"
                    />
                  </div>

                  <div className="space-y-3 text-center sm:text-left">
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Scan with any UPI app (GPay, PhonePe, Paytm) to pay directly to this stall's account.
                    </p>

                    <button
                      type="button"
                      onClick={() => setOnlinePaidVerified(true)}
                      className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm ${
                        onlinePaidVerified
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-900 hover:bg-slate-800 text-white'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      {onlinePaidVerified ? 'Payment Verified (Simulated)' : 'I Have Completed Payment'}
                    </button>
                    {onlinePaidVerified && (
                      <p className="text-[11px] text-emerald-600 font-medium">
                        ✓ Payment confirmed for this order. Ready to place order.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Order Summary & Place Order */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4 sticky top-28">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
              Order Summary
            </h3>

            {/* Stall Info */}
            <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200/60">
              <span className="font-semibold text-slate-900 block">{cartStall.name}</span>
              <span className="text-slate-500">{cartStall.location}</span>
            </div>

            {/* Items */}
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {items.map(({ food, quantity }) => (
                <div key={food.id} className="flex justify-between items-center text-xs">
                  <div className="flex-1 pr-2">
                    <span className="font-semibold text-slate-800">{food.name}</span>
                    <span className="text-slate-400 ml-1.5 font-medium">× {quantity}</span>
                  </div>
                  <span className="font-bold text-slate-900 shrink-0">
                    ₹{(food.price * quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-100 pt-3 space-y-2 text-xs">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal</span>
                <span>₹{totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Campus Convenience Fee</span>
                <span className="text-emerald-600 font-semibold">FREE</span>
              </div>
              <div className="flex justify-between text-base font-black text-slate-900 border-t border-slate-100 pt-2">
                <span>Total Amount</span>
                <span className="text-orange-600 text-lg">₹{totalAmount.toFixed(2)}</span>
              </div>
            </div>

            {/* Place Order CTA */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-orange-600 hover:bg-orange-700 disabled:bg-slate-300 text-white font-bold rounded-2xl text-sm transition shadow-lg shadow-orange-500/25 active:scale-98 flex items-center justify-center gap-2"
            >
              {loading ? (
                <span>Placing Order...</span>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4" />
                  <span>Place Order • ₹{totalAmount.toFixed(2)}</span>
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Direct stall routing • Zero queue guarantee</span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
