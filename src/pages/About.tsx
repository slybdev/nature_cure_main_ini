import React from 'react';
import { Leaf, ShieldCheck, Heart, Sparkles, Target, Users } from 'lucide-react';
import { motion } from 'motion/react';

export default function About() {
  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="relative py-32 bg-brand-green overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img
            src="https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80"
            alt="Herbal background"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span className="text-[10px] uppercase tracking-widest text-brand-gold font-bold mb-4 block">Our Story</span>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-8">Nature Cures Initiative</h1>
            <p className="text-xl text-emerald-100/70 max-w-2xl mx-auto leading-relaxed">
              We are dedicated to bridging the gap between ancient herbal wisdom and modern wellness needs.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-brand-neutral p-12 rounded-[3rem]"
            >
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-8 shadow-sm">
                <Target className="w-8 h-8 text-brand-green" />
              </div>
              <h2 className="text-3xl font-bold text-slate-900 mb-6">Our Mission</h2>
              <p className="text-slate-600 leading-relaxed text-lg">
                To empower individuals on their journey to optimal health by providing premium, evidence-based herbal support and comprehensive natural health education. We strive to make holistic wellness accessible and trustworthy for everyone.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-brand-green p-12 rounded-[3rem] text-white"
            >
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-8 backdrop-blur-md">
                <Sparkles className="w-8 h-8 text-brand-gold" />
              </div>
              <h2 className="text-3xl font-bold mb-6">Our Vision</h2>
              <p className="text-emerald-100/70 leading-relaxed text-lg">
                To be the global leader in natural wellness, recognized for our commitment to purity, potency, and the preservation of traditional herbal knowledge. We envision a world where nature is the first choice for preventive care and vitality.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 bg-brand-neutral">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <span className="text-[10px] uppercase tracking-widest text-brand-gold font-bold mb-4 block">Our Values</span>
            <h2 className="text-4xl font-bold text-slate-900">What Drives Us</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              {
                icon: ShieldCheck,
                title: 'Uncompromising Purity',
                desc: 'We source only the finest organic ingredients, free from synthetic fillers or harmful chemicals.'
              },
              {
                icon: Users,
                title: 'Community Education',
                desc: 'We believe knowledge is power. We provide the tools and information to help you understand your health.'
              },
              {
                icon: Heart,
                title: 'Ethical Sourcing',
                desc: 'We work directly with local farmers to ensure fair trade and sustainable harvesting practices.'
              }
            ].map((value, i) => (
              <div key={i} className="text-center">
                <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-sm">
                  <value.icon className="w-10 h-10 text-brand-green" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-4">{value.title}</h3>
                <p className="text-slate-500 leading-relaxed">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team/Founder */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-[3rem] border border-slate-100 shadow-2xl overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2">
              <div className="aspect-square lg:aspect-auto">
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80"
                  alt="Founder"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="p-12 md:p-20 flex flex-col justify-center">
                <span className="text-[10px] uppercase tracking-widest text-brand-gold font-bold mb-4 block">The Founder</span>
                <h2 className="text-4xl font-bold text-slate-900 mb-8">A Vision for Holistic Health</h2>
                <div className="space-y-6 text-slate-600 leading-relaxed italic text-lg">
                  <p>
                    "Nature Cures Initiative was born from a personal journey of healing. I saw how the power of plants could transform lives when used with intention and respect. Our goal is to bring that same transformation to you."
                  </p>
                  <div className="pt-8">
                    <div className="text-xl font-bold text-slate-900 not-italic">Dr. Samuel Adebayo</div>
                    <div className="text-sm text-brand-gold font-bold uppercase tracking-widest not-italic">Chief Herbalist & Founder</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
