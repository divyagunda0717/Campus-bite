import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Utensils,
  Lock,
  Mail,
  User,
  Phone,
  AlertCircle,
  ArrowRight,
  GraduationCap,
  School,
  ChefHat,
  ShieldCheck,
  CheckCircle2,
  Clock
} from 'lucide-react';

const ROLES = [
  {
    id: 'STUDENT',
    title: 'Student',
    description: 'Students who want to order food.',
    icon: GraduationCap,
    badgeColor: 'border-blue-500 bg-blue-50/50 text-blue-900',
    selectedStyle: 'border-orange-500 bg-orange-50/40 ring-2 ring-orange-500 shadow-md'
  },
  {
    id: 'FACULTY',
    title: 'Faculty',
    description: 'Faculty members who want to order food.',
    icon: School,
    badgeColor: 'border-emerald-500 bg-emerald-50/50 text-emerald-900',
    selectedStyle: 'border-orange-500 bg-orange-50/40 ring-2 ring-orange-500 shadow-md'
  },
  {
    id: 'STAFF_MEMBER',
    title: 'Staff Member',
    description: 'Staff members who manage stall operations and orders.',
    icon: ChefHat,
    badgeColor: 'border-purple-500 bg-purple-50/50 text-purple-900',
    selectedStyle: 'border-orange-500 bg-orange-50/40 ring-2 ring-orange-500 shadow-md'
  },
  {
    id: 'STALL_ADMIN',
    title: 'Stall Admin',
    description: 'Administrators responsible for a particular stall.',
    icon: ShieldCheck,
    badgeColor: 'border-amber-500 bg-amber-50/50 text-amber-900',
    selectedStyle: 'border-orange-500 bg-orange-50/40 ring-2 ring-orange-500 shadow-md'
  }
];

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [selectedRole, setSelectedRole] = useState('STUDENT');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Pending approval modal/screen for Staff & Stall Admin
  const [pendingNotice, setPendingNotice] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!selectedRole) {
      setErrorMsg('Please select a role before completing registration.');
      return;
    }

    setLoading(true);
    const res = await register({
      name,
      email,
      password,
      role: selectedRole,
      phone
    });
    setLoading(false);

    if (res.success) {
      if (res.status === 'PENDING') {
        setPendingNotice({
          role: selectedRole,
          email
        });
      } else {
        // Redirect to role-specific dashboard
        if (selectedRole === 'FACULTY') {
          navigate('/faculty');
        } else if (selectedRole === 'STALL_ADMIN') {
          navigate('/stall-admin');
        } else {
          navigate('/');
        }
      }
    } else {
      setErrorMsg(res.error || 'Failed to complete registration.');
    }
  };

  if (pendingNotice) {
    return (
      <div className="max-w-md mx-auto py-12 px-4 space-y-6">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl text-center space-y-5 animate-in fade-in duration-300">
          <div className="w-16 h-16 rounded-3xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto shadow-inner">
            <Clock className="w-8 h-8 animate-pulse" />
          </div>

          <div className="space-y-2">
            <span className="text-[11px] font-black uppercase tracking-wider bg-amber-100 text-amber-800 px-3 py-1 rounded-full">
              Registration Received
            </span>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Awaiting Approval
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed max-w-sm mx-auto">
              Your account has been created with role <strong className="text-slate-900">{pendingNotice.role.replace('_', ' ')}</strong>.
            </p>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-left text-xs space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-800">
              <ShieldCheck className="w-4 h-4 text-orange-600 shrink-0" />
              <span>Next Steps:</span>
            </div>
            <ul className="list-disc list-inside text-slate-500 space-y-1 pl-1">
              <li>Super Admin will verify your registration.</li>
              <li>You will be assigned to your specific campus food stall.</li>
              <li>Once approved, you will have access to your stall dashboard.</li>
            </ul>
          </div>

          <div className="pt-2">
            <Link
              to="/login"
              className="w-full py-3 px-4 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl text-xs transition shadow-md shadow-orange-500/20 inline-flex items-center justify-center gap-2"
            >
              <span>Back to Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto py-8 px-4 space-y-6">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center text-white shadow-md shadow-orange-500/20 mx-auto">
          <Utensils className="w-6 h-6" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Create Campus Account
        </h1>
        <p className="text-xs text-slate-500">
          Pre-order food, manage stall menus, or fulfill kitchen orders
        </p>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-sm space-y-6">
        {errorMsg && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2 text-xs text-rose-700 font-medium">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Role Selection Cards */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black uppercase tracking-wider text-slate-700">
                Register as *
              </label>
              <span className="text-[11px] text-slate-400">Select exactly one role</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {ROLES.map((r) => {
                const isSelected = selectedRole === r.id;
                const Icon = r.icon;

                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setSelectedRole(r.id)}
                    className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between gap-3 group relative ${
                      isSelected
                        ? r.selectedStyle
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition ${
                        isSelected
                          ? 'bg-orange-600 text-white shadow-sm'
                          : 'bg-slate-100 text-slate-600 group-hover:bg-slate-200'
                      }`}>
                        <Icon className="w-5 h-5" />
                      </div>

                      {isSelected && (
                        <CheckCircle2 className="w-5 h-5 text-orange-600 animate-in zoom-in" />
                      )}
                    </div>

                    <div>
                      <span className={`font-bold text-sm block ${
                        isSelected ? 'text-orange-950 font-black' : 'text-slate-900'
                      }`}>
                        {r.title}
                      </span>
                      <p className="text-[11px] text-slate-500 leading-snug mt-0.5">
                        {r.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 2: Input Details */}
          <div className="space-y-4 pt-2 border-t border-slate-100">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Full Name *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full pl-9 pr-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Campus Email *
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    className="w-full pl-9 pr-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Phone Number (optional)
                </label>
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
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl text-xs transition shadow-md shadow-orange-500/20 flex items-center justify-center gap-2"
          >
            {loading ? 'Creating Account...' : `Register as ${selectedRole.replace('_', ' ')}`}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center text-xs text-slate-500 pt-3 border-t border-slate-100">
          Already registered?{' '}
          <Link to="/login" className="font-bold text-orange-600 hover:underline">
            Sign In here
          </Link>
        </div>
      </div>
    </div>
  );
}
