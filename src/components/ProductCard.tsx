import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, ArrowRight, Star } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Product } from '../types';
import { formatPrice } from '../lib/utils';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion } from 'motion/react';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: any) {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [ratingData, setRatingData] = React.useState({ avg: 0, count: 0 });

  React.useEffect(() => {
    async function fetchRating() {
      const { data, error } = await supabase
        .from('reviews')
        .select('rating')
        .eq('product_id', product.id);
      
      if (!error && data && data.length > 0) {
        const avg = data.reduce((acc, r) => acc + r.rating, 0) / data.length;
        setRatingData({ avg, count: data.length });
      }
    }
    fetchRating();
  }, [product.id]);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      toast.error('Please login to add items to your cart');
      navigate('/login');
      return;
    }
    addToCart(product);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="group bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500"
    >
      <Link to={`/product/${product.slug}`} className="block relative aspect-[4/5] overflow-hidden">
        <img
          src={(product.images && product.images.length > 0) ? product.images[0] : (product.image_url || 'https://picsum.photos/seed/herbal/800/1000')}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          referrerPolicy="no-referrer"
        />
        {product.is_featured && (
          <div className="absolute top-4 left-4 bg-brand-gold text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full shadow-lg">
            Featured
          </div>
        )}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
          <div className="bg-white/90 backdrop-blur-sm p-4 rounded-full transform translate-y-10 group-hover:translate-y-0 transition-transform duration-500">
            <ArrowRight className="w-6 h-6 text-brand-green" />
          </div>
        </div>
      </Link>

      <div className="p-3 sm:p-6">
        <div className="flex justify-between items-start mb-1 sm:mb-2">
          <span className="text-[8px] sm:text-[10px] uppercase tracking-widest text-brand-gold font-bold">
            {product.category}
          </span>
          <div className="flex items-center gap-1">
            <Star className={`w-2 h-2 sm:w-3 sm:h-3 ${ratingData.count > 0 ? 'text-brand-gold fill-brand-gold' : 'text-slate-200'}`} />
            <span className="text-[10px] sm:text-xs font-medium text-slate-400">
              {ratingData.count > 0 ? ratingData.avg.toFixed(1) : 'New'}
            </span>
          </div>
        </div>
        
        <Link to={`/product/${product.slug}`}>
          <h3 className="text-sm sm:text-lg font-bold text-slate-900 mb-1 sm:mb-2 group-hover:text-brand-green transition-colors line-clamp-1 sm:line-clamp-none">
            {product.name}
          </h3>
        </Link>
        
        <p className="text-slate-500 text-[10px] sm:text-sm line-clamp-1 sm:line-clamp-2 mb-3 sm:mb-6 leading-relaxed">
          {product.short_description}
        </p>
 
        <div className="flex items-center justify-between">
          <span className="text-sm sm:text-xl font-bold text-brand-green">
            {formatPrice(product.price)}
          </span>
          <button
            onClick={handleAddToCart}
            className="p-2 sm:p-3 bg-brand-neutral hover:bg-brand-green hover:text-white text-brand-green rounded-lg sm:rounded-xl transition-all duration-300"
          >
            <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
