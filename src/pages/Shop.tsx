import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Product } from '../types';
import ProductCard from '../components/ProductCard';
import { Search, Filter, Loader2 } from 'lucide-react';

export default function Shop() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');

  const categories = ['All', 'Herbal Tea', 'Supplements', 'Essential Oils', 'Tinctures'];

  useEffect(() => {
    fetchProducts();
  }, [category]);

  async function fetchProducts() {
    setLoading(true);
    try {
      let query = supabase.from('products').select('*');
      
      if (category !== 'All') {
        query = query.eq('category', category);
      }

      const { data, error } = await query;
      if (data) {
        setProducts(data);
      }
    } catch (err) {
      // Silent error
    } finally {
      setLoading(false);
    }
  }

  const filteredProducts = products.filter(p => {
    const nameMatch = p.name?.toLowerCase().includes(search.toLowerCase());
    const descMatch = p.short_description?.toLowerCase().includes(search.toLowerCase());
    return nameMatch || descMatch;
  });

  return (
    <div className="pt-4 pb-12 bg-brand-neutral min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-4 sm:mb-6">
          <h1 className="text-2xl sm:text-4xl font-bold text-slate-900 mb-1">Shop Collection</h1>
          <p className="text-[10px] sm:text-base text-slate-500">Natural remedies and wellness products.</p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-brand-green/20 border-t-brand-green rounded-full animate-spin"></div>
              <Loader2 className="w-8 h-8 text-brand-green animate-spin absolute inset-0 m-auto" />
            </div>
            <p className="mt-6 text-sm text-slate-500 font-bold uppercase tracking-widest animate-pulse">Pulling products...</p>
          </div>
        ) : (
          <>
            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-2 sm:gap-6 mb-4 sm:mb-8">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 sm:py-4 bg-white border border-slate-100 rounded-xl sm:rounded-2xl focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green outline-none transition-all shadow-sm text-sm"
                />
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0 no-scrollbar">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={`px-4 py-2 sm:py-4 rounded-xl sm:rounded-2xl font-bold whitespace-nowrap transition-all shadow-sm text-[10px] sm:text-sm ${
                      category === cat 
                        ? 'bg-brand-green text-white' 
                        : 'bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-8">
                {filteredProducts.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-10 bg-white rounded-2xl border border-dashed border-slate-200">
                <p className="text-xs text-slate-400 font-medium">No products found.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
