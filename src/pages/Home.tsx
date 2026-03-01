import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Leaf, Heart, Sparkles } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Product } from '../types';
import ProductCard from '../components/ProductCard';
import { motion } from 'motion/react';

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFeatured() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('is_featured', true)
          .limit(4);
        
        if (data) {
          setFeaturedProducts(data);
        }
      } catch (err) {
        // Silent error
      } finally {
        setLoading(false);
      }
    }
    fetchFeatured();
  }, []);

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative h-[90vh] flex items-center overflow-hidden bg-brand-green">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&q=80"
            alt="Herbal background"
            className="w-full h-full object-cover opacity-40"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-brand-green via-brand-green/80 to-transparent" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-2xl"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-8">
              <Sparkles className="w-4 h-4 text-brand-gold" />
              <span className="text-xs font-bold uppercase tracking-widest text-brand-gold">Purity Guaranteed</span>
            </div>
            <h1 className="text-6xl md:text-7xl font-bold text-white mb-6 leading-[1.1] tracking-tight">
              Empowering <span className="text-brand-gold">Wellness</span> Through Nature
            </h1>
            <p className="text-xl text-emerald-100/80 mb-10 leading-relaxed max-w-lg">
              Discover the ancient wisdom of herbal support, meticulously crafted for the modern lifestyle. Pure, potent, and proven.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/shop"
                className="px-8 py-4 bg-brand-gold text-white rounded-full font-bold hover:bg-yellow-600 transition-all shadow-xl hover:shadow-brand-gold/20 flex items-center gap-2 group"
              >
                Shop Collection
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/about"
                className="px-8 py-4 bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-full font-bold hover:bg-white/20 transition-all"
              >
                Our Story
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Floating Stats */}
        <div className="absolute bottom-12 right-12 hidden lg:flex gap-8">
          {[
            { label: 'Natural Products', value: '50+' },
            { label: 'Happy Clients', value: '10k+' },
            { label: 'Years Experience', value: '15+' },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + i * 0.1 }}
              className="text-right"
            >
              <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-[10px] uppercase tracking-widest text-brand-gold font-bold">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              {
                icon: Leaf,
                title: '100% Organic',
                desc: 'Every ingredient is sourced from sustainable, organic farms across Africa.'
              },
              {
                icon: ShieldCheck,
                title: 'Expert Verified',
                desc: 'Our formulations are developed by leading herbalists and wellness experts.'
              },
              {
                icon: Heart,
                title: 'Holistic Care',
                desc: 'We focus on the root cause, not just symptoms, for long-term vitality.'
              }
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="flex flex-col items-center text-center group"
              >
                <div className="w-16 h-16 bg-brand-neutral rounded-2xl flex items-center justify-center mb-6 group-hover:bg-brand-green transition-colors duration-500">
                  <feature.icon className="w-8 h-8 text-brand-green group-hover:text-white transition-colors duration-500" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-4">{feature.title}</h3>
                <p className="text-slate-500 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-24 bg-brand-neutral">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-16">
            <div>
              <span className="text-[10px] uppercase tracking-widest text-brand-gold font-bold mb-4 block">Our Best Sellers</span>
              <h2 className="text-4xl font-bold text-slate-900">Featured Remedies</h2>
            </div>
            <Link to="/shop" className="text-brand-green font-bold flex items-center gap-2 hover:gap-4 transition-all">
              View All Products <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-[250px] sm:h-[400px] bg-slate-200 animate-pulse rounded-2xl" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
              {featuredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* About Section */}
      <section className="py-24 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="relative">
              <div className="aspect-square rounded-3xl overflow-hidden shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80"
                  alt="Herbal preparation"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="absolute -bottom-10 -right-10 bg-brand-gold p-8 rounded-3xl shadow-2xl hidden md:block max-w-xs">
                <p className="text-white font-medium italic leading-relaxed">
                  "Nature itself is the best physician, and our mission is to bring its healing power to your doorstep."
                </p>
              </div>
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-widest text-brand-gold font-bold mb-4 block">Our Mission</span>
              <h2 className="text-4xl font-bold text-slate-900 mb-8 leading-tight">
                Empowering Wellness Through Nature's Ancient Wisdom
              </h2>
              <div className="space-y-6 text-slate-600 leading-relaxed">
                <p>
                  Nature Cures Initiative was born from a deep respect for the healing properties of the natural world. We believe that true wellness comes from a balanced relationship between our bodies and the environment.
                </p>
                <p>
                  Our focus is on preventive wellness and herbal education. We don't just sell products; we provide the knowledge and support you need to take control of your health journey naturally.
                </p>
                <div className="pt-8 grid grid-cols-2 gap-8">
                  <div>
                    <div className="text-2xl font-bold text-brand-green mb-1">Pure</div>
                    <div className="text-xs uppercase tracking-widest text-slate-400 font-bold">No synthetic additives</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-brand-green mb-1">Potent</div>
                    <div className="text-xs uppercase tracking-widest text-slate-400 font-bold">High concentration</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-brand-green rounded-[3rem] p-12 md:p-20 relative overflow-hidden text-center">
            <div className="absolute inset-0 opacity-10">
              <img
                src="https://www.transparenttextures.com/patterns/leaf.png"
                alt="Pattern"
                className="w-full h-full object-repeat"
              />
            </div>
            <div className="relative z-10 max-w-3xl mx-auto">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-8">Ready to Start Your Natural Healing Journey?</h2>
              <p className="text-xl text-emerald-100/70 mb-12">
                Join thousands of others who have transformed their lives through the power of nature.
              </p>
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 px-10 py-5 bg-white text-brand-green rounded-full font-bold hover:bg-brand-gold hover:text-white transition-all shadow-2xl"
              >
                Explore the Shop <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
