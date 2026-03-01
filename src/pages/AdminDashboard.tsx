import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Order, Product } from '../types';
import { formatPrice } from '../lib/utils';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingBag, 
  Users, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Loader2,
  X,
  Image as ImageIcon,
  ChevronRight,
  Upload,
  Eye
} from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'motion/react';

export default function AdminDashboard() {
  const { isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<'orders' | 'products' | 'stats'>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Product Modal State
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Delete Confirmation State
  const [productToDelete, setProductToDelete] = useState<string | null>(null);

  // Order Details Modal State
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (isAdmin) {
      fetchData();
    }
  }, [isAdmin]);

  async function fetchData() {
    setLoading(true);
    try {
      const [ordersRes, productsRes] = await Promise.all([
        supabase.from('orders').select('*, profiles(full_name), order_items(*, product:products(*))').order('created_at', { ascending: false }),
        supabase.from('products').select('*').order('created_at', { ascending: false })
      ]);

      if (ordersRes.error) throw ordersRes.error;
      if (productsRes.error) throw productsRes.error;

      setOrders(ordersRes.data || []);
      setProducts(productsRes.data || []);
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }

  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    const loadingToast = toast.loading(`Updating order to ${status}...`);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch('/api/admin/update-order-status', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({
          orderId,
          status,
          userId: order.user_id,
          email: (order as any).profiles?.email,
          orderNumber: order.order_number
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to update order');

      toast.success(`Order updated and email sent!`, { id: loadingToast });
      fetchData();
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(prev => prev ? { ...prev, status: status as any } : null);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update order', { id: loadingToast });
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const newUrls: string[] = [...(editingProduct?.images || [])];

    try {
      const fileArray = Array.from(files) as File[];
      for (const file of fileArray) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('product-images')
          .getPublicUrl(filePath);

        newUrls.push(publicUrl);
      }

      setEditingProduct(prev => ({
        ...prev,
        images: newUrls,
        image_url: prev?.image_url || newUrls[0] // Set first image as main if none exists
      }));
      toast.success('Images uploaded successfully');
    } catch (error: any) {
      toast.error(`Upload failed: ${error.message || 'Check storage bucket and RLS'}`);
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    const newImages = [...(editingProduct?.images || [])];
    newImages.splice(index, 1);
    setEditingProduct(prev => ({
      ...prev,
      images: newImages,
      image_url: prev?.image_url === editingProduct?.images?.[index] ? newImages[0] || '' : prev?.image_url
    }));
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const productData = { ...editingProduct };
      delete (productData as any).created_at;

      // Ensure slug is URL-friendly
      if (productData.slug) {
        productData.slug = productData.slug.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      }

      if (editingProduct?.id) {
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingProduct.id);
        if (error) throw error;
        toast.success('Product updated');
      } else {
        const { error } = await supabase
          .from('products')
          .insert([productData]);
        if (error) throw error;
        toast.success('Product created');
      }
      setIsProductModalOpen(false);
      fetchData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save product');
    }
  };

  const handleDeleteProduct = async (id: string) => {
    setLoading(true);
    try {
      // 1. Delete associated records first to avoid foreign key constraints
      await Promise.all([
        supabase.from('order_items').delete().eq('product_id', id),
        supabase.from('cart_items').delete().eq('product_id', id)
      ]);

      // 2. Delete the product
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
      
      toast.success('Product and associated records deleted');
      fetchData();
    } catch (error: any) {
      toast.error(`Failed to delete product: ${error.message}`);
    } finally {
      setLoading(false);
      setProductToDelete(null);
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-900">Access Denied</h1>
          <p className="text-slate-500">You do not have permission to view this page.</p>
        </div>
      </div>
    );
  }

  const filteredOrders = orders.filter(o => 
    o.order_number.toLowerCase().includes(search.toLowerCase()) ||
    o.phone_number.includes(search)
  );

  const stats = {
    totalRevenue: orders.filter(o => o.status !== 'cancelled').reduce((sum, o) => sum + Number(o.total_amount), 0),
    pendingPayments: orders.filter(o => o.status === 'pending_payment').length,
    totalOrders: orders.length,
    lowStock: products.filter(p => p.stock_quantity < 10).length
  };

  return (
    <div className="min-h-screen py-6 sm:py-12 bg-brand-neutral">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8 sm:mb-12">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">Admin Dashboard</h1>
            <p className="text-slate-500 text-sm sm:text-base">Manage products, orders, and site analytics.</p>
          </div>
          <div className="flex w-full lg:w-auto bg-white p-1 rounded-2xl shadow-sm border border-slate-100 overflow-x-auto no-scrollbar">
            {[
              { id: 'orders', icon: ShoppingBag, label: 'Orders' },
              { id: 'products', icon: Package, label: 'Products' },
              { id: 'stats', icon: LayoutDashboard, label: 'Stats' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 sm:px-6 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap flex-1 lg:flex-none justify-center ${
                  activeTab === tab.id ? 'bg-brand-green text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-brand-green animate-spin" />
          </div>
        ) : (
          <div className="space-y-8">
            {/* Stats Overview */}
            {activeTab === 'stats' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
                {[
                  { label: 'Total Revenue', value: formatPrice(stats.totalRevenue), icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                  { label: 'Pending Payments', value: stats.pendingPayments, icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50' },
                  { label: 'Total Orders', value: stats.totalOrders, icon: ShoppingBag, color: 'text-brand-green', bg: 'bg-brand-neutral' },
                  { label: 'Low Stock Items', value: stats.lowStock, icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50' }
                ].map((stat, i) => (
                  <div key={i} className="bg-white p-6 sm:p-8 rounded-[2rem] border border-slate-100 shadow-sm">
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 ${stat.bg} rounded-2xl flex items-center justify-center mb-4 sm:mb-6`}>
                      <stat.icon className={`w-5 h-5 sm:w-6 sm:h-6 ${stat.color}`} />
                    </div>
                    <div className="text-2xl sm:text-3xl font-bold text-slate-900 mb-1">{stat.value}</div>
                    <div className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">{stat.label}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Orders Management */}
            {activeTab === 'orders' && (
              <div className="space-y-6">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by Order # or Phone..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-white border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-brand-green/20 text-sm sm:text-base"
                  />
                </div>

                <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[600px] lg:min-w-full">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-100">
                          <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-slate-400">Order</th>
                          <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-slate-400">Customer</th>
                          <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-slate-400">Total</th>
                          <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-slate-400">Status</th>
                          <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-slate-400">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {filteredOrders.map(order => (
                          <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-6 py-4">
                              <div className="font-bold text-slate-900">{order.order_number}</div>
                              <div className="text-xs text-slate-400">{format(new Date(order.created_at), 'MMM d, yyyy')}</div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm font-medium text-slate-700">{(order as any).profiles?.full_name}</div>
                              <div className="text-xs text-slate-400">{order.phone_number}</div>
                            </td>
                            <td className="px-6 py-4 font-bold text-brand-green">
                              {formatPrice(order.total_amount)}
                            </td>
                            <td className="px-6 py-4">
                              <select
                                value={order.status}
                                onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                                className="text-[10px] font-bold uppercase tracking-widest bg-brand-neutral border-none rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-green/20"
                              >
                                <option value="pending_payment">Pending</option>
                                <option value="payment_confirmed">Paid</option>
                                <option value="processing">Processing</option>
                                <option value="shipped">Shipped</option>
                                <option value="delivered">Delivered</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                              </select>
                            </td>
                            <td className="px-6 py-4">
                              <button 
                                onClick={() => setSelectedOrder(order)}
                                className="p-2 text-slate-400 hover:text-brand-green transition-colors"
                              >
                                <Eye className="w-5 h-5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Products Management */}
            {activeTab === 'products' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search products..."
                      className="w-full pl-12 pr-4 py-4 bg-white border border-slate-100 rounded-2xl outline-none text-sm sm:text-base"
                    />
                  </div>
                  <button
                    onClick={() => {
                      setEditingProduct({ images: [] });
                      setIsProductModalOpen(true);
                    }}
                    className="px-6 sm:px-8 py-4 bg-brand-green text-white rounded-2xl font-bold hover:bg-emerald-900 transition-all shadow-lg flex items-center justify-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    Add Product
                  </button>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-8">
                  {products.map(product => (
                    <div key={product.id} className="bg-white rounded-[1.5rem] sm:rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden group">
                      <div className="aspect-[4/3] sm:aspect-video relative overflow-hidden">
                        <img
                          src={product.image_url || 'https://picsum.photos/seed/herbal/400/200'}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute top-2 right-2 sm:top-4 sm:right-4 flex gap-2 z-50 pointer-events-auto">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setEditingProduct({ ...product, images: product.images || [] });
                              setIsProductModalOpen(true);
                            }}
                            className="p-3 bg-white/95 backdrop-blur-sm rounded-xl text-slate-600 hover:text-brand-green transition-all shadow-xl cursor-pointer border border-slate-200 active:scale-90"
                            title="Edit Product"
                          >
                            <Edit className="w-4 h-4 sm:w-5 sm:h-5" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setProductToDelete(product.id);
                            }}
                            className="p-3 bg-white/95 backdrop-blur-sm rounded-xl text-slate-600 hover:text-red-500 transition-all shadow-xl cursor-pointer border border-slate-200 active:scale-90"
                            title="Delete Product"
                          >
                            <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                          </button>
                        </div>
                      </div>
                      <div className="p-4 sm:p-6">
                        <div className="flex justify-between items-start mb-1 sm:mb-2">
                          <span className="text-[8px] sm:text-[10px] uppercase tracking-widest text-brand-gold font-bold">{product.category}</span>
                          <span className={`text-[8px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded ${product.stock_quantity < 10 ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}`}>
                            {product.stock_quantity}
                          </span>
                        </div>
                        <h3 className="font-bold text-slate-900 mb-1 sm:mb-2 text-xs sm:text-base line-clamp-1">{product.name}</h3>
                        <div className="text-brand-green font-bold text-xs sm:text-base">{formatPrice(product.price)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedOrder(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 sm:p-10">
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">Order Details</h2>
                    <p className="text-slate-500 text-sm font-mono">{selectedOrder.order_number}</p>
                  </div>
                  <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-slate-100 rounded-full">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-2">Customer Info</h3>
                      <div className="bg-brand-neutral p-4 rounded-2xl">
                        <p className="font-bold text-slate-900">{(selectedOrder as any).profiles?.full_name}</p>
                        <p className="text-sm text-slate-600">{selectedOrder.phone_number}</p>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-2">Shipping Address</h3>
                      <div className="bg-brand-neutral p-4 rounded-2xl">
                        <p className="text-sm text-slate-700 leading-relaxed">{selectedOrder.shipping_address}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h3 className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-2">Order Status</h3>
                      <select
                        value={selectedOrder.status}
                        onChange={(e) => handleUpdateOrderStatus(selectedOrder.id, e.target.value)}
                        className="w-full px-4 py-3 bg-brand-neutral border-none rounded-2xl font-bold uppercase tracking-widest text-xs focus:ring-2 focus:ring-brand-green/20"
                      >
                        <option value="pending_payment">Pending Payment</option>
                        <option value="payment_confirmed">Payment Confirmed</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                    <div>
                      <h3 className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-2">Buyer's Notes</h3>
                      <div className="bg-brand-neutral p-4 rounded-2xl min-h-[80px]">
                        <p className="text-sm text-slate-600 italic">
                          {selectedOrder.notes || 'No notes provided.'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mb-10">
                  <h3 className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-4">Order Items</h3>
                  <div className="space-y-4">
                    {selectedOrder.order_items?.map((item) => (
                      <div key={item.id} className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl">
                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-white shrink-0">
                          <img
                            src={item.product?.image_url || 'https://picsum.photos/seed/herbal/100/100'}
                            alt={item.product?.name}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-bold text-slate-900">{item.product?.name}</p>
                          <p className="text-xs text-slate-500">Qty: {item.quantity} × {formatPrice(item.price_at_purchase)}</p>
                        </div>
                        <div className="font-bold text-slate-900">
                          {formatPrice(item.quantity * item.price_at_purchase)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between items-center p-6 bg-brand-green rounded-3xl text-white">
                  <span className="font-bold uppercase tracking-widest text-xs opacity-80">Total Amount</span>
                  <span className="text-2xl font-bold">{formatPrice(selectedOrder.total_amount)}</span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Product Modal */}
      <AnimatePresence>
        {isProductModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsProductModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-4xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 sm:p-10 md:p-12">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-2xl font-bold text-slate-900">
                    {editingProduct?.id ? 'Edit Product' : 'Add New Product'}
                  </h2>
                  <button onClick={() => setIsProductModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={handleSaveProduct} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Product Name</label>
                      <input
                        type="text"
                        required
                        value={editingProduct?.name || ''}
                        onChange={(e) => {
                          const name = e.target.value;
                          const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                          setEditingProduct({ 
                            ...editingProduct, 
                            name, 
                            slug: editingProduct?.slug ? editingProduct.slug : slug 
                          });
                        }}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-brand-green/20"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Slug</label>
                      <input
                        type="text"
                        required
                        value={editingProduct?.slug || ''}
                        onChange={(e) => setEditingProduct({ ...editingProduct, slug: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-brand-green/20"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Price (NGN)</label>
                      <input
                        type="number"
                        required
                        value={editingProduct?.price || ''}
                        onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-brand-green/20"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Stock Quantity</label>
                      <input
                        type="number"
                        required
                        value={editingProduct?.stock_quantity || ''}
                        onChange={(e) => setEditingProduct({ ...editingProduct, stock_quantity: Number(e.target.value) })}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-brand-green/20"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Category</label>
                      <select
                        value={editingProduct?.category || ''}
                        onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-brand-green/20"
                      >
                        <option value="">Select Category</option>
                        <option value="Herbal Tea">Herbal Tea</option>
                        <option value="Supplements">Supplements</option>
                        <option value="Essential Oils">Essential Oils</option>
                        <option value="Tinctures">Tinctures</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Main Image URL (Optional)</label>
                      <input
                        type="text"
                        value={editingProduct?.image_url || ''}
                        onChange={(e) => setEditingProduct({ ...editingProduct, image_url: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-brand-green/20"
                        placeholder="Or upload images below"
                      />
                    </div>
                  </div>

                  {/* Image Upload Section */}
                  <div className="space-y-4">
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Product Images</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
                      {editingProduct?.images?.map((url, index) => (
                        <div key={index} className="relative aspect-square rounded-xl overflow-hidden border border-slate-100 group">
                          <img src={url} alt="" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="aspect-square rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-2 hover:border-brand-green hover:bg-brand-neutral transition-all group"
                      >
                        {uploading ? (
                          <Loader2 className="w-6 h-6 text-brand-green animate-spin" />
                        ) : (
                          <>
                            <Upload className="w-6 h-6 text-slate-400 group-hover:text-brand-green" />
                            <span className="text-[10px] font-bold text-slate-400 group-hover:text-brand-green uppercase tracking-widest">Upload</span>
                          </>
                        )}
                      </button>
                    </div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageUpload}
                      multiple
                      accept="image/*"
                      className="hidden"
                    />
                    <p className="text-[10px] text-slate-400 italic">Recommended: Square images, max 2MB each.</p>
                  </div>

                  <div className="grid grid-cols-1 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Short Description</label>
                      <input
                        type="text"
                        value={editingProduct?.short_description || ''}
                        onChange={(e) => setEditingProduct({ ...editingProduct, short_description: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-brand-green/20"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Full Description</label>
                      <textarea
                        value={editingProduct?.full_description || ''}
                        onChange={(e) => setEditingProduct({ ...editingProduct, full_description: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-brand-green/20 min-h-[120px]"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Ingredients</label>
                      <textarea
                        value={editingProduct?.ingredients || ''}
                        onChange={(e) => setEditingProduct({ ...editingProduct, ingredients: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-brand-green/20 min-h-[80px]"
                        placeholder="List the ingredients..."
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Usage Instructions</label>
                      <textarea
                        value={editingProduct?.usage_instructions || ''}
                        onChange={(e) => setEditingProduct({ ...editingProduct, usage_instructions: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-brand-green/20 min-h-[80px]"
                        placeholder="How to use the product..."
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="is_featured"
                      checked={editingProduct?.is_featured || false}
                      onChange={(e) => setEditingProduct({ ...editingProduct, is_featured: e.target.checked })}
                      className="w-5 h-5 rounded border-slate-300 text-brand-green focus:ring-brand-green"
                    />
                    <label htmlFor="is_featured" className="text-sm font-bold text-slate-700">Featured Product</label>
                  </div>

                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={uploading}
                      className="w-full py-4 bg-brand-green text-white rounded-2xl font-bold hover:bg-emerald-900 transition-all shadow-xl disabled:opacity-50"
                    >
                      {editingProduct?.id ? 'Update Product' : 'Create Product'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {productToDelete && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setProductToDelete(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-white rounded-[2rem] shadow-2xl p-8 text-center"
            >
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Trash2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Delete Product?</h3>
              <p className="text-slate-500 mb-8">This action cannot be undone. It will also remove the product from all orders and carts.</p>
              <div className="flex gap-4">
                <button
                  onClick={() => setProductToDelete(null)}
                  className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteProduct(productToDelete)}
                  className="flex-1 py-4 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-all shadow-lg shadow-red-500/20"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
