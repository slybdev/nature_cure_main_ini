import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Product } from '../types';
import { formatPrice } from '../lib/utils';
import { useCart } from '../contexts/CartContext';
import { ShoppingCart, ArrowLeft, ShieldCheck, Leaf, Truck, RotateCcw, Plus, Minus, Loader2, Star } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProductData() {
      try {
        const { data: productData, error: productError } = await supabase
          .from('products')
          .select('*')
          .eq('slug', slug)
          .single();
        
        if (productError || !productData) {
          toast.error('Product not found');
          navigate('/shop');
          return;
        }

        setProduct(productData);
        setActiveImage(productData.images?.[0] || productData.image_url || 'https://picsum.photos/seed/herbal/1000/1000');

        // Fetch reviews with profiles
        const { data: reviewsData, error: reviewsError } = await supabase
          .from('reviews')
          .select('*, profiles(full_name)')
          .eq('product_id', productData.id)
          .order('created_at', { ascending: false });

        if (!reviewsError) {
          setReviews(reviewsData || []);
        } else {
          // Fallback: fetch reviews without profiles if join fails
          const { data: simpleReviews } = await supabase
            .from('reviews')
            .select('*')
            .eq('product_id', productData.id)
            .order('created_at', { ascending: false });
          
          if (simpleReviews && simpleReviews.length > 0) {
            // Manually fetch profiles for these reviews
            const userIds = [...new Set(simpleReviews.map(r => r.user_id))];
            const { data: profilesData } = await supabase
              .from('profiles')
              .select('id, full_name')
              .in('id', userIds);
            
            const reviewsWithProfiles = simpleReviews.map(r => ({
              ...r,
              profiles: profilesData?.find(p => p.id === r.user_id)
            }));
            setReviews(reviewsWithProfiles);
          } else {
            setReviews([]);
          }
        }
      } catch (err) {
        // Silent error in production
      } finally {
        setLoading(false);
      }
    }
    fetchProductData();
  }, [slug]);

  if (loading || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-brand-green animate-spin" />
      </div>
    );
  }

  const allImages = product.images && product.images.length > 0 
    ? product.images 
    : [product.image_url || 'https://picsum.photos/seed/herbal/1000/1000'];

  return (
    <div className="min-h-screen py-6 sm:py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-500 hover:text-brand-green mb-8 sm:mb-12 transition-colors group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          Back to Collection
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
          {/* Images Section */}
          <div className="space-y-4">
            <div className="relative aspect-square rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden bg-brand-neutral shadow-2xl">
              <img
                src={activeImage || allImages[0]}
                alt={product.name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            {allImages.length > 1 && (
              <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(img)}
                    className={`w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                      activeImage === img ? 'border-brand-green shadow-lg scale-105' : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex flex-col">
            <div className="mb-6 sm:mb-8">
              <span className="text-[10px] uppercase tracking-widest text-brand-gold font-bold mb-2 sm:mb-4 block">
                {product.category}
              </span>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 mb-4 sm:mb-6 leading-tight">
                {product.name}
              </h1>
              <div className="text-2xl sm:text-3xl font-bold text-brand-green mb-6 sm:mb-8">
                {formatPrice(product.price)}
              </div>
              <p className="text-slate-600 leading-relaxed text-base sm:text-lg mb-6 sm:mb-8">
                {product.short_description}
              </p>
            </div>

            {/* Quantity & Add to Cart */}
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 mb-8 sm:mb-12">
              <div className="flex items-center justify-between sm:justify-start bg-brand-neutral rounded-2xl p-2">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-3 hover:bg-white rounded-xl transition-colors"
                >
                  <Minus className="w-5 h-5" />
                </button>
                <span className="w-12 text-center font-bold text-lg">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-3 hover:bg-white rounded-xl transition-colors"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              <button
                onClick={() => addToCart(product, quantity)}
                className="flex-1 px-8 py-4 bg-brand-green text-white rounded-2xl font-bold hover:bg-emerald-900 transition-all shadow-xl hover:shadow-brand-green/20 flex items-center justify-center gap-3 group"
              >
                <ShoppingCart className="w-6 h-6" />
                Add to Cart
              </button>
            </div>

            {/* Features List */}
            <div className="grid grid-cols-2 gap-4 sm:gap-6 mb-8 sm:mb-12">
              <div className="flex items-center gap-3 text-xs sm:text-sm font-medium text-slate-600">
                <div className="p-2 bg-emerald-50 rounded-lg">
                  <Leaf className="w-4 h-4 sm:w-5 sm:h-5 text-brand-green" />
                </div>
                100% Organic
              </div>
              <div className="flex items-center gap-3 text-xs sm:text-sm font-medium text-slate-600">
                <div className="p-2 bg-emerald-50 rounded-lg">
                  <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-brand-green" />
                </div>
                Expert Verified
              </div>
              <div className="flex items-center gap-3 text-xs sm:text-sm font-medium text-slate-600">
                <div className="p-2 bg-emerald-50 rounded-lg">
                  <Truck className="w-4 h-4 sm:w-5 sm:h-5 text-brand-green" />
                </div>
                Fast Delivery
              </div>
              <div className="flex items-center gap-3 text-xs sm:text-sm font-medium text-slate-600">
                <div className="p-2 bg-emerald-50 rounded-lg">
                  <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5 text-brand-green" />
                </div>
                Easy Returns
              </div>
            </div>

            {/* Tabs */}
            <div className="space-y-6 sm:space-y-8">
              <div className="border-b border-slate-100 pb-6 sm:pb-8">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-brand-gold mb-3 sm:mb-4">Description</h3>
                <p className="text-slate-600 leading-relaxed text-sm sm:text-base">{product.full_description}</p>
              </div>
              <div className="border-b border-slate-100 pb-6 sm:pb-8">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-brand-gold mb-3 sm:mb-4">Ingredients</h3>
                <p className="text-slate-600 leading-relaxed text-sm sm:text-base">{product.ingredients}</p>
              </div>
              <div className="border-b border-slate-100 pb-6 sm:pb-8">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-brand-gold mb-3 sm:mb-4">Usage Instructions</h3>
                <p className="text-slate-600 leading-relaxed text-sm sm:text-base">{product.usage_instructions}</p>
              </div>

              {/* Reviews Section */}
              <div>
                <div className="flex items-center justify-between mb-6 sm:mb-8">
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-brand-gold">Customer Reviews</h3>
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-brand-gold fill-brand-gold" />
                    <span className="text-sm font-bold text-slate-900">
                      {reviews.length > 0 
                        ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
                        : 'No reviews yet'}
                    </span>
                    <span className="text-xs text-slate-400">({reviews.length})</span>
                  </div>
                </div>

                {reviews.length > 0 ? (
                  <div className="space-y-6">
                    {reviews.map((review) => (
                      <div key={review.id} className="bg-brand-neutral p-6 rounded-2xl border border-slate-100">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <div className="font-bold text-slate-900 text-sm mb-1">{review.profiles?.full_name || 'Verified Customer'}</div>
                            <div className="text-[10px] text-slate-400 uppercase tracking-widest">{format(new Date(review.created_at), 'PPP')}</div>
                          </div>
                          <div className="flex gap-0.5">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star
                                key={s}
                                className={`w-3 h-3 ${s <= review.rating ? 'text-brand-gold fill-brand-gold' : 'text-slate-200'}`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-slate-600 text-sm leading-relaxed italic">"{review.comment}"</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-brand-neutral rounded-2xl border border-dashed border-slate-200">
                    <p className="text-slate-400 text-sm">Be the first to review this product!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
