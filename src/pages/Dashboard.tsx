import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Order } from '../types';
import { formatPrice } from '../lib/utils';
import { ShoppingBag, Package, Clock, CheckCircle2, ChevronRight, MessageCircle, Star, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';
import toast from 'react-hot-toast';
import { X } from 'lucide-react';

export default function Dashboard() {
  const { user, profile, isVerified } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedProductForReview, setSelectedProductForReview] = useState<{id: string, name: string} | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  async function fetchOrders() {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(*, product:products(*))')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      // Silent error
    } finally {
      setLoading(false);
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending_payment': return 'bg-yellow-100 text-yellow-700';
      case 'payment_confirmed': return 'bg-blue-100 text-blue-700';
      case 'processing': return 'bg-purple-100 text-purple-700';
      case 'shipped': return 'bg-indigo-100 text-indigo-700';
      case 'delivered': return 'bg-emerald-100 text-emerald-700';
      case 'completed': return 'bg-brand-green text-white';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const handleConfirmDelivery = async (orderId: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: 'completed' })
        .eq('id', orderId);
      
      if (error) throw error;
      toast.success('Delivery confirmed! Thank you.');
      fetchOrders();
    } catch (error) {
      toast.error('Failed to confirm delivery');
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedProductForReview) return;

    setIsSubmittingReview(true);
    try {
      const { error } = await supabase
        .from('reviews')
        .insert({
          user_id: user.id,
          product_id: selectedProductForReview.id,
          rating: reviewRating,
          comment: reviewComment
        });

      if (error) throw error;

      toast.success('Review submitted successfully! Thank you.');
      setIsReviewModalOpen(false);
      setReviewComment('');
      setReviewRating(5);
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit review');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleResendEmail = async () => {
    if (!user?.email) return;
    const loadingToast = toast.loading('Resending verification email...');
    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to resend email');

      toast.success('Verification email resent! Please check your inbox.', { id: loadingToast });
    } catch (error: any) {
      toast.error(error.message || 'Failed to resend email', { id: loadingToast });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-brand-green animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 bg-brand-neutral">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {!isVerified && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-6 bg-yellow-50 border border-yellow-100 rounded-[2rem] flex flex-col md:flex-row items-center justify-between gap-6"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-2xl flex items-center justify-center shrink-0">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <h3 className="font-bold text-yellow-900">Verify Your Email</h3>
                <p className="text-sm text-yellow-700">Please check your inbox to verify your email and unlock all features.</p>
              </div>
            </div>
            <button
              onClick={handleResendEmail}
              className="px-6 py-3 bg-yellow-600 text-white rounded-xl text-sm font-bold hover:bg-yellow-700 transition-all whitespace-nowrap"
            >
              Resend Email
            </button>
          </motion.div>
        )}

        <div className="mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Welcome, {profile?.full_name}</h1>
          <p className="text-slate-500">Manage your orders and wellness journey.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Stats */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-brand-neutral rounded-2xl flex items-center justify-center">
                  <Package className="w-6 h-6 text-brand-green" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-900">{orders.length}</div>
                  <div className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Total Orders</div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-900">
                    {orders.filter(o => o.status === 'completed').length}
                  </div>
                  <div className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Completed</div>
                </div>
              </div>
            </div>

            <div className="bg-brand-green p-8 rounded-[2rem] text-white shadow-xl">
              <h3 className="text-brand-gold font-bold uppercase tracking-widest text-[10px] mb-4">Need Help?</h3>
              <p className="text-sm text-emerald-100/70 mb-6 leading-relaxed">
                Our wellness experts are available via WhatsApp for any questions about your order or products.
              </p>
              <a
                href="https://wa.me/2348133481447"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 bg-white/10 hover:bg-white/20 rounded-xl font-bold transition-all"
              >
                <MessageCircle className="w-5 h-5" />
                Contact Support
              </a>
            </div>
          </div>

          {/* Orders List */}
          <div className="lg:col-span-3 space-y-8">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              Recent Orders
              <ChevronRight className="w-5 h-5 text-slate-300" />
            </h2>

            {orders.length > 0 ? (
              <div className="space-y-6">
                {orders.map((order) => (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={order.id}
                    className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden"
                  >
                    <div className="p-6 md:p-8 border-b border-slate-50 flex flex-wrap justify-between items-center gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-brand-neutral rounded-xl flex items-center justify-center">
                          <Clock className="w-6 h-6 text-slate-400" />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-slate-900">{order.order_number}</div>
                          <div className="text-xs text-slate-400">{format(new Date(order.created_at), 'PPP')}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <div className="text-xs uppercase tracking-widest text-slate-400 font-bold mb-1">Total</div>
                          <div className="font-bold text-brand-green">{formatPrice(order.total_amount)}</div>
                        </div>
                        <span className={`px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest ${getStatusColor(order.status)}`}>
                          {order.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>

                    <div className="p-6 md:p-8">
                      <div className="space-y-4 mb-8">
                        {order.order_items?.map((item) => (
                          <div key={item.id} className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-lg overflow-hidden bg-brand-neutral shrink-0">
                              <img
                                src={item.product?.image_url || 'https://picsum.photos/seed/herbal/100/100'}
                                alt={item.product?.name}
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                              />
                            </div>
                            <div className="flex-1">
                              <div className="text-sm font-bold text-slate-900">{item.product?.name}</div>
                              <div className="text-xs text-slate-500">Qty: {item.quantity} × {formatPrice(item.price_at_purchase)}</div>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="flex flex-wrap gap-4 pt-6 border-t border-slate-50">
                        {order.status === 'pending_payment' && (
                          <a
                            href={`https://wa.me/2348133481447?text=Hello, I'm confirming payment for order ${order.order_number}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-6 py-3 bg-[#25D366] text-white rounded-xl text-sm font-bold hover:bg-[#128C7E] transition-all flex items-center gap-2"
                          >
                            <MessageCircle className="w-4 h-4" />
                            Confirm Payment
                          </a>
                        )}
                        {order.status === 'delivered' && (
                          <button
                            onClick={() => handleConfirmDelivery(order.id)}
                            className="px-6 py-3 bg-brand-green text-white rounded-xl text-sm font-bold hover:bg-emerald-900 transition-all"
                          >
                            Confirm Delivery
                          </button>
                        )}
                        {order.status === 'completed' && (
                          <div className="flex flex-col gap-4 w-full">
                            <p className="text-xs font-medium text-slate-500">How was your experience? Leave a review for the products:</p>
                            <div className="flex flex-wrap gap-2">
                              {order.order_items?.map((item) => (
                                <button
                                  key={item.id}
                                  onClick={() => {
                                    setSelectedProductForReview({ id: item.product_id, name: item.product?.name || '' });
                                    setIsReviewModalOpen(true);
                                  }}
                                  className="px-4 py-2 bg-brand-neutral text-brand-green rounded-xl text-xs font-bold hover:bg-brand-green hover:text-white transition-all flex items-center gap-2 border border-brand-green/10"
                                >
                                  <Star className="w-3 h-3" />
                                  Review {item.product?.name}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="bg-white p-20 rounded-[2rem] border border-dashed border-slate-200 text-center">
                <ShoppingBag className="w-12 h-12 text-slate-200 mx-auto mb-6" />
                <p className="text-slate-400 font-medium mb-8">You haven't placed any orders yet.</p>
                <Link to="/shop" className="text-brand-green font-bold hover:underline">Start Shopping</Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Review Modal */}
      <AnimatePresence>
        {isReviewModalOpen && selectedProductForReview && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsReviewModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-8 md:p-12">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-2xl font-bold text-slate-900">Leave a Review</h2>
                  <button onClick={() => setIsReviewModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmitReview} className="space-y-6">
                  <div className="text-center mb-8">
                    <p className="text-slate-500 mb-4">How would you rate <span className="font-bold text-slate-900">{selectedProductForReview.name}</span>?</p>
                    <div className="flex justify-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewRating(star)}
                          className="p-1 transition-transform hover:scale-110"
                        >
                          <Star
                            className={`w-10 h-10 ${
                              star <= reviewRating ? 'text-brand-gold fill-brand-gold' : 'text-slate-200'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Your Feedback</label>
                    <textarea
                      required
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      className="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green outline-none transition-all min-h-[120px] text-base"
                      placeholder="Share your experience with this product..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingReview}
                    className="w-full py-5 bg-brand-green text-white rounded-2xl font-bold hover:bg-emerald-900 transition-all shadow-xl flex items-center justify-center gap-2 disabled:opacity-70"
                  >
                    {isSubmittingReview ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Submit Review'}
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
