import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getStallQR, updateStallQR, getStallById } from '../../lib/dataService';
import { QrCode, CheckCircle2, AlertTriangle, ShieldCheck, Save, Sparkles } from 'lucide-react';

export default function StallQR() {
  const { assignedStallId } = useAuth();
  const stallId = assignedStallId || '22222222-2222-2222-2222-222222222222';

  const [stall, setStall] = useState(null);
  const [upiId, setUpiId] = useState('');
  const [qrImageUrl, setQrImageUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const s = await getStallById(stallId);
      setStall(s);
      const qr = await getStallQR(stallId);
      if (qr) {
        setUpiId(qr.upi_id || '');
        setQrImageUrl(qr.qr_image_url || '');
      }
      setLoading(false);
    }
    load();
  }, [stallId]);

  const handleGenerateFromUpi = () => {
    if (!upiId) return;
    const cleanUpi = encodeURIComponent(upiId.trim());
    const generatedUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=upi://pay?pa=${cleanUpi}%26pn=${encodeURIComponent(stall?.name || 'Campus Canteen')}%26am=0`;
    setQrImageUrl(generatedUrl);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    await updateStallQR(stallId, {
      upi_id: upiId,
      qr_image_url: qrImageUrl
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        <p className="text-xs text-slate-500">Loading payment QR...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-20">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-orange-600">UPI Payment Setup</span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-0.5">
          Payment QR Code — {stall?.name || 'Assigned Stall'}
        </h1>
        <p className="text-xs text-slate-500">
          Upload or update the dedicated UPI QR code shown to students choosing Online Payment at checkout.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2 text-xs text-emerald-800 font-bold">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          Stall Payment QR updated successfully! New students will see this QR immediately.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Form */}
        <form onSubmit={handleSave} className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-xs space-y-5">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <QrCode className="w-5 h-5 text-orange-600" />
            Configure Stall QR
          </h3>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Stall UPI VPA ID *</label>
            <div className="flex gap-2">
              <input
                type="text"
                required
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="e.g. tiffinstall@campusbite or stall@okhdfcbank"
                className="flex-1 px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-hidden font-mono"
              />
              <button
                type="button"
                onClick={handleGenerateFromUpi}
                className="px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1 shrink-0"
                title="Generate standard UPI QR code"
              >
                <Sparkles className="w-3.5 h-3.5 text-orange-600" />
                Generate
              </button>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Enter your UPI ID and click Generate to automatically create the QR.</p>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Direct QR Image URL</label>
            <input
              type="url"
              value={qrImageUrl}
              onChange={(e) => setQrImageUrl(e.target.value)}
              placeholder="https://..."
              className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-hidden text-xs"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl text-xs transition shadow-md shadow-orange-500/20 flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save & Publish Stall QR
          </button>
        </form>

        {/* Live Preview */}
        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-xs flex flex-col items-center justify-center text-center space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Student Checkout Preview</span>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl shadow-inner">
            {qrImageUrl ? (
              <img
                src={qrImageUrl}
                alt="Payment QR"
                className="w-48 h-48 object-contain rounded-xl"
              />
            ) : (
              <div className="w-48 h-48 flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-300 rounded-xl">
                <QrCode className="w-12 h-12 mb-2" />
                <span className="text-xs">No QR Configured</span>
              </div>
            )}
          </div>

          <div className="space-y-1">
            <span className="font-bold text-slate-900 text-sm block">{stall?.name}</span>
            <span className="text-xs font-mono text-slate-500 block">{upiId || 'No UPI ID set'}</span>
          </div>

          <div className="text-[11px] text-slate-400 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Direct stall bank routing verification</span>
          </div>
        </div>
      </div>
    </div>
  );
}
