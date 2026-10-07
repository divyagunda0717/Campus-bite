import React, { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';

const REASON_PRESETS = [
  'Food unavailable / out of stock',
  'Stall closed for maintenance / prep',
  'Unable to prepare order within requested slot',
  'Special ingredients unavailable',
  'Other custom reason'
];

export default function RejectionModal({ isOpen, onClose, onConfirm, orderId }) {
  const [selectedPreset, setSelectedPreset] = useState(REASON_PRESETS[0]);
  const [customText, setCustomText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const finalReason = selectedPreset === 'Other custom reason' && customText.trim()
      ? customText.trim()
      : selectedPreset;

    setSubmitting(true);
    await onConfirm(finalReason);
    setSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-rose-600">
              <AlertCircle className="w-5 h-5" />
              <h3 className="text-lg font-bold text-slate-900">Reject Order {orderId}</h3>
            </div>
            <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>

          <p className="text-xs text-slate-600 mb-4 leading-relaxed">
            Please provide a specific reason for rejecting this order. The customer will immediately receive this notification on their live tracking screen.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700">Select Rejection Reason</label>
              {REASON_PRESETS.map((reason) => (
                <label
                  key={reason}
                  className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition ${
                    selectedPreset === reason
                      ? 'bg-rose-50 border-rose-300 text-rose-900 font-medium'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="rejectionReason"
                    value={reason}
                    checked={selectedPreset === reason}
                    onChange={(e) => setSelectedPreset(e.target.value)}
                    className="text-rose-600 focus:ring-rose-500"
                  />
                  <span>{reason}</span>
                </label>
              ))}
            </div>

            {selectedPreset === 'Other custom reason' && (
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Custom Explanation</label>
                <textarea
                  rows={3}
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  placeholder="Explain why the order could not be fulfilled..."
                  required
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
                />
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="w-1/2 py-2.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="w-1/2 py-2.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition shadow-md shadow-rose-500/20"
              >
                {submitting ? 'Rejecting...' : 'Confirm Rejection'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
