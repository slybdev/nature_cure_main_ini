import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { formatPrice, generateOrderNumber } from '../lib/utils';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Phone, MessageCircle, X, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'motion/react';

export default function Cart() {
  const { items, total, updateQuantity, removeFromCart, clearCart } = useCart();
  const { user, profile, isVerified } = useAuth();
  const navigate = useNavigate();
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [orderData, setOrderData] = useState<any>(null);

  const [shippingInfo, setShippingInfo] = useState({
    address: '',
    phone: profile?.phone || '',
    notes: ''
  });

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please login to checkout');
      navigate('/login');
      return;
    }

    if (!isVerified) {
      toast.error('Please verify your email address to complete your order.');
      return;
    }

    setLoading(true);
    try {
      const orderNumber = generateOrderNumber();

      // 1. Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          order_number: orderNumber,
          total_amount: total,
          shipping_address: shippingInfo.address,
          phone_number: shippingInfo.phone,
          notes: shippingInfo.notes,
          status: 'pending_payment'
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // 2. Create order items
      const orderItems = items.map(item => ({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price_at_purchase: item.product?.price || 0
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // 3. Clear cart
      await clearCart();

      setOrderData(order);
      setIsCheckoutModalOpen(false);
      setIsSuccessModalOpen(true);
      toast.success('Order created successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to create order');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0 && !isSuccessModalOpen) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4">
        <div className="w-24 h-24 bg-brand-neutral rounded-full flex items-center justify-center mb-8">
          <ShoppingBag className="w-10 h-10 text-slate-300" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-4">Your cart is empty</h1>
        <p className="text-slate-500 mb-10 text-center max-w-md">
          Looks like you haven't added any natural remedies to your cart yet.
        </p>
        <Link
          to="/shop"
          className="px-8 py-4 bg-brand-green text-white rounded-full font-bold hover:bg-emerald-900 transition-all shadow-xl"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 bg-brand-neutral">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-slate-900 mb-12">Shopping Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Items List */}
          <div className="lg:col-span-2 space-y-6">
            {items.map((item) => (
              <motion.div
                layout
                key={item.id}
                className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col sm:flex-row gap-6 items-center"
              >
                <div className="w-24 h-24 rounded-2xl overflow-hidden bg-brand-neutral shrink-0">
                  <img
                    src={item.product?.image_url || 'https://picsum.photos/seed/herbal/200/200'}
                    alt={item.product?.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <h3 className="text-lg font-bold text-slate-900 mb-1">{item.product?.name}</h3>
                  <p className="text-sm text-slate-500 mb-4">{item.product?.category}</p>
                  <div className="text-brand-green font-bold">{formatPrice(item.product?.price || 0)}</div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center bg-brand-neutral rounded-xl p-1">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="p-2 hover:bg-white rounded-lg transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center font-bold">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="p-2 hover:bg-white rounded-lg transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="p-3 text-slate-300 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-xl sticky top-32">
              <h2 className="text-xl font-bold text-slate-900 mb-8">Order Summary</h2>
              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal</span>
                  <span>{formatPrice(total)}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Shipping</span>
                  <span className="text-emerald-600 font-medium">Calculated at checkout</span>
                </div>
                <div className="pt-4 border-t border-slate-100 flex justify-between items-end">
                  <span className="text-lg font-bold text-slate-900">Total</span>
                  <div className="text-2xl font-bold text-brand-green">{formatPrice(total)}</div>
                </div>
              </div>
              <button
                onClick={() => setIsCheckoutModalOpen(true)}
                className="w-full py-4 bg-brand-green text-white rounded-2xl font-bold hover:bg-emerald-900 transition-all shadow-lg hover:shadow-brand-green/20 flex items-center justify-center gap-2 group"
              >
                Proceed to Checkout
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <p className="mt-6 text-[10px] text-slate-400 text-center uppercase tracking-widest font-bold">
                Manual Payment via WhatsApp
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Checkout Modal */}
      <AnimatePresence>
        {isCheckoutModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCheckoutModalOpen(false)}
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
                  <h2 className="text-2xl font-bold text-slate-900">Shipping Details</h2>
                  <button onClick={() => setIsCheckoutModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={handleCheckout} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Delivery Address</label>
                    <textarea
                      required
                      value={shippingInfo.address}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, address: e.target.value })}
                      className="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green outline-none transition-all min-h-[100px]"
                      placeholder="Enter your full delivery address..."
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Phone Number</label>
                    <input
                      type="tel"
                      required
                      value={shippingInfo.phone}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, phone: e.target.value })}
                      className="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green outline-none transition-all"
                      placeholder="+234 ..."
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Order Notes (Optional)</label>
                    <input
                      type="text"
                      value={shippingInfo.notes}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, notes: e.target.value })}
                      className="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green outline-none transition-all"
                      placeholder="Special instructions..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-5 bg-brand-green text-white rounded-2xl font-bold hover:bg-emerald-900 transition-all shadow-xl flex items-center justify-center gap-2 disabled:opacity-70"
                  >
                    {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Confirm & Create Order'}
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Success Modal */}
      <AnimatePresence>
        {isSuccessModalOpen && orderData && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 bg-brand-green/95 backdrop-blur-xl"
            />
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative w-full max-w-2xl bg-white rounded-[3rem] shadow-2xl overflow-hidden"
            >
              <div className="p-12 text-center">
                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-8">
                  <ShoppingBag className="w-10 h-10 text-brand-green" />
                </div>
                <h2 className="text-4xl font-bold text-slate-900 mb-4">Order Created!</h2>
                <p className="text-slate-500 mb-10">Your order has been registered successfully. Please follow the steps below to complete your payment.</p>

                <div className="bg-brand-neutral rounded-3xl p-8 mb-10 text-left space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Order Number</span>
                    <span className="font-bold text-slate-900">{orderData.order_number}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Total Amount</span>
                    <span className="font-bold text-brand-green text-xl">{formatPrice(orderData.total_amount)}</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <p className="text-sm font-medium text-slate-600">Contact us via WhatsApp to confirm payment:</p>
                  <a
                    href={`https://wa.me/2349153227253?text=Hello Nature Cures Initiative, I would like to pay for my order ${orderData.order_number}. Total: ${formatPrice(orderData.total_amount)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-5 bg-[#25D366] text-white rounded-2xl font-bold hover:bg-[#128C7E] transition-all shadow-xl flex items-center justify-center gap-3 text-lg"
                  >
                    <MessageCircle className="w-6 h-6" />
                    Chat on WhatsApp
                  </a>
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="w-full py-4 text-slate-500 font-bold hover:text-brand-green transition-colors"
                  >
                    View Order in Dashboard
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
