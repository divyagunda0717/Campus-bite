import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Utensils, Lock, Mail, AlertCircle, ArrowRight, ShieldCheck, Clock } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [accountStatus, setAccountStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setAccountStatus(null);
    setLoading(true);

    const res = await login(email, password);
    setLoading(false);

    if (res.success) {
      redirectByRole(res.role);
    } else {
      if (res.status) {
        setAccountStatus(res.status);
      }
      setErrorMsg(res.error || 'Invalid email or password.');
    }
  };

  const redirectByRole = (role) => {
    const r = (role || 'STUDENT').toUpperCase();
    if (r === 'SUPER_ADMIN') {
      navigate('/super-admin');
    } else if (r === 'STALL_ADMIN') {
      navigate('/stall-admin');
    } else if (r === 'STAFF_MEMBER') {
      navigate('/staff-dashboard');
    } else if (r === 'FACULTY') {
      navigate('/faculty');
    } else {
      navigate('/');
    }
  };

  return (
    <div className="max-w-md mx-auto py-12 px-4 space-y-6">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center text-white shadow-md shadow-orange-500/20 mx-auto">
          <Utensils className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Sign In to CampusBite
        </h1>
        <p className="text-xs text-slate-500">
          Enter your campus credentials to access your dashboard
        </p>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-5">
        {/* Specific Account Status Warning Messages (Requirement 8) */}
        {accountStatus === 'PENDING' && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3 text-xs text-amber-900 font-medium">
            <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong className="block text-sm font-bold text-amber-950">Approval Pending</strong>
              <span>Your account is awaiting Super Admin approval.</span>
            </div>
          </div>
        )}

        {accountStatus === 'REJECTED' && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3 text-xs text-rose-900 font-medium">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <strong className="block text-sm font-bold text-rose-950">Registration Not Approved</strong>
              <span>Your registration request was not approved.</span>
            </div>
          </div>
        )}

        {accountStatus === 'DEACTIVATED' && (
          <div className="p-4 bg-slate-100 border border-slate-300 rounded-2xl flex items-start gap-3 text-xs text-slate-800 font-medium">
            <AlertCircle className="w-5 h-5 text-slate-600 shrink-0 mt-0.5" />
            <div>
              <strong className="block text-sm font-bold text-slate-900">Account Deactivated</strong>
              <span>Your account has been deactivated. Please contact the administrator.</span>
            </div>
          </div>
        )}

        {errorMsg && !accountStatus && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs text-rose-700 font-medium">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@campus.edu"
                className="w-full pl-9 pr-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full pl-9 pr-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl text-xs transition shadow-md shadow-orange-500/20 flex items-center justify-center gap-1.5"
          >
            {loading ? 'Verifying...' : 'Sign In'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center text-xs text-slate-500 pt-3 border-t border-slate-100">
          Don't have an account?{' '}
          <Link to="/register" className="font-bold text-orange-600 hover:underline">
            Register as Student / Faculty / Staff
          </Link>
        </div>
      </div>
    </div>
  );
}
