import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Utensils, Lock, Mail, User, Phone, AlertCircle, ArrowRight } from 'lucide-react';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [phone, setPhone] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    const res = await register({ name, email, password, role, phone });
    setLoading(false);

    if (res.success) {
      navigate('/');
    } else {
      setErrorMsg(res.error || 'Failed to register. Please check details.');
    }
  };

  return (
    <div className="max-w-md mx-auto py-8 space-y-6">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center text-white shadow-md shadow-orange-500/20 mx-auto">
          <Utensils className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Create Campus Account</h1>
        <p className="text-xs text-slate-500">Register to pre-order food & skip canteen lines</p>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-5">
        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs text-rose-700 font-medium">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Full Name *</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Aditya Sharma"
                className="w-full pl-9 pr-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Campus Email *</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="aditya@campus.edu"
                className="w-full pl-9 pr-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Campus Role *</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-3 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
              >
                <option value="student">Student</option>
                <option value="faculty">Faculty Member</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Phone Number</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765..."
                  className="w-full pl-9 pr-3 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Password *</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                className="w-full pl-9 pr-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl text-xs transition shadow-md shadow-orange-500/20 flex items-center justify-center gap-1.5"
          >
            {loading ? 'Creating Account...' : 'Complete Registration'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
          Already registered?{' '}
          <Link to="/login" className="font-bold text-orange-600 hover:underline">
            Sign In here
          </Link>
        </div>
      </div>
    </div>
  );
}
