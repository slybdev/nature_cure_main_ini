import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Phone, ArrowRight, Leaf, Loader2, Eye, EyeOff } from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

export default function Signup() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          fullName: formData.fullName,
          phone: formData.phone,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to create account');

      toast.success('Account created! Please check your email for verification.');
      navigate('/login');
    } catch (error: any) {
      toast.error(error.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-8 sm:py-20 bg-brand-neutral">
      <div className="max-w-md w-full bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-slate-100">
        <div className="p-6 sm:p-10">
          <div className="flex flex-col items-center mb-6 sm:mb-10">
            <div className="p-3 sm:p-4 bg-brand-green rounded-2xl mb-4 sm:mb-6">
              <Leaf className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-1 sm:mb-2 text-center">Join the Initiative</h1>
            <p className="text-sm sm:text-base text-slate-500 text-center">Start your journey to natural wellness.</p>
          </div>

          <form onSubmit={handleSignup} className="space-y-4 sm:space-y-6">
            <div className="space-y-1 sm:space-y-2">
              <label className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full pl-10 sm:pl-12 pr-4 py-3 sm:py-4 bg-slate-50 border border-slate-100 rounded-xl sm:rounded-2xl focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green outline-none transition-all text-sm sm:text-base"
                  placeholder="John Doe"
                />
              </div>
            </div>

            <div className="space-y-1 sm:space-y-2">
              <label className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-10 sm:pl-12 pr-4 py-3 sm:py-4 bg-slate-50 border border-slate-100 rounded-xl sm:rounded-2xl focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green outline-none transition-all text-sm sm:text-base"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div className="space-y-1 sm:space-y-2">
              <label className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full pl-10 sm:pl-12 pr-4 py-3 sm:py-4 bg-slate-50 border border-slate-100 rounded-xl sm:rounded-2xl focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green outline-none transition-all text-sm sm:text-base"
                  placeholder="+234 ..."
                />
              </div>
            </div>

            <div className="space-y-1 sm:space-y-2">
              <label className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-10 sm:pl-12 pr-12 py-3 sm:py-4 bg-slate-50 border border-slate-100 rounded-xl sm:rounded-2xl focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green outline-none transition-all text-sm sm:text-base"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-brand-green transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 sm:py-4 bg-brand-green text-white rounded-xl sm:rounded-2xl font-bold hover:bg-emerald-900 transition-all shadow-lg hover:shadow-brand-green/20 flex items-center justify-center gap-2 group disabled:opacity-70 text-sm sm:text-base"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                <>
                  Create Account
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 sm:mt-10 pt-6 sm:pt-10 border-t border-slate-100 text-center">
            <p className="text-slate-500 text-xs sm:text-sm">
              Already have an account?{' '}
              <Link to="/login" className="text-brand-green font-bold hover:underline">
                Login here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
