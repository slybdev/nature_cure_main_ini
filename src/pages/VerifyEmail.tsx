import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, XCircle, Loader2, ArrowRight, Leaf } from 'lucide-react';
import { motion } from 'motion/react';

export default function VerifyEmail() {
  const { token } = useParams<{ token: string }>();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (token) {
      verifyToken();
    }
  }, [token]);

  async function verifyToken() {
    try {
      const response = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Verification failed');

      setStatus('success');
      setMessage(data.message);
    } catch (error: any) {
      setStatus('error');
      setMessage(error.message || 'Something went wrong during verification.');
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-20 bg-brand-neutral">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-slate-100 p-10 text-center"
      >
        <div className="flex flex-col items-center">
          <div className="p-4 bg-brand-green rounded-2xl mb-8">
            <Leaf className="w-8 h-8 text-white" />
          </div>

          {status === 'loading' && (
            <>
              <Loader2 className="w-12 h-12 text-brand-green animate-spin mb-6" />
              <h1 className="text-2xl font-bold text-slate-900 mb-2">Verifying Your Email</h1>
              <p className="text-slate-500">Please wait while we confirm your registration...</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
                <CheckCircle2 className="w-8 h-8 text-emerald-600" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900 mb-2">Email Verified!</h1>
              <p className="text-slate-500 mb-8">{message}</p>
              <Link
                to="/login"
                className="w-full py-4 bg-brand-green text-white rounded-2xl font-bold hover:bg-emerald-900 transition-all shadow-lg flex items-center justify-center gap-2 group"
              >
                Continue to Login
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900 mb-2">Verification Failed</h1>
              <p className="text-slate-500 mb-8">{message}</p>
              <Link
                to="/signup"
                className="text-brand-green font-bold hover:underline"
              >
                Try signing up again
              </Link>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
