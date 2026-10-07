import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth, DEMO_PRESETS } from '../context/AuthContext';
import { Utensils, Lock, Mail, AlertCircle, Sparkles, ArrowRight } from 'lucide-react';

export default function Login() {
  const { login, switchDemoRole, role } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    const res = await login(email, password);
    setLoading(false);

    if (res.success) {
      redirectUser(email);
    } else {
      setErrorMsg(res.error || 'Invalid credentials.');
    }
  };

  const handleQuickLogin = async (roleKey) => {
    await switchDemoRole(roleKey);
    const p = DEMO_PRESETS.find(x => x.roleKey === roleKey);
    redirectUser(p?.email, p?.role);
  };

  const redirectUser = (userEmail, userRole) => {
    const r = userRole || (userEmail.includes('admin') && !userEmail.includes('tiffin') && !userEmail.includes('fastfood') ? 'super_admin' : userEmail.includes('tiffin') || userEmail.includes('fastfood') ? 'stall_admin' : 'student');
    if (r === 'super_admin') {
      navigate('/super-admin');
    } else if (r === 'stall_admin') {
      navigate('/stall-admin');
    } else {
      navigate('/');
    }
  };

  return (
    <div className="max-w-md mx-auto py-8 space-y-6">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center text-white shadow-md shadow-orange-500/20 mx-auto">
          <Utensils className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Sign In to CampusBite</h1>
        <p className="text-xs text-slate-500">Access your food pre-orders or canteen station</p>
      </div>

      {/* Quick 1-Click Demo Login Box (For Hackathon Review) */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-5 rounded-3xl shadow-lg border border-slate-700 space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
          <Sparkles className="w-4 h-4" />
          <span>Hackathon Demo — 1-Click Quick Login</span>
        </div>
        <p className="text-[11px] text-slate-300 leading-relaxed">
          Select any persona to immediately sign in and evaluate that role's interface:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
          {DEMO_PRESETS.map((p) => (
            <button
              key={p.roleKey}
              type="button"
              onClick={() => handleQuickLogin(p.roleKey)}
              className="p-2.5 rounded-xl bg-slate-800/90 hover:bg-orange-600 border border-slate-700 hover:border-orange-500 text-left transition flex items-center gap-2 group text-xs"
            >
              <span className="text-base">{p.avatar}</span>
              <div className="overflow-hidden">
                <span className="font-bold block truncate group-hover:text-white text-slate-200">{p.label}</span>
                <span className="text-[10px] text-slate-400 group-hover:text-orange-200 truncate block">{p.email}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Standard Form */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-5">
        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs text-rose-700 font-medium">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Campus Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@campusbite.demo"
                className="w-full pl-9 pr-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="CampusBite@123"
                className="w-full pl-9 pr-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl text-xs transition shadow-md shadow-orange-500/20 flex items-center justify-center gap-1.5"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
          Don't have an account?{' '}
          <Link to="/register" className="font-bold text-orange-600 hover:underline">
            Register as Student / Faculty
          </Link>
        </div>
      </div>
    </div>
  );
}
