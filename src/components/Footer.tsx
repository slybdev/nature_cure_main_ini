import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Mail, Phone, MapPin, Leaf } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-brand-green text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-6">
              <div className="p-2 bg-white/10 rounded-lg">
                <Leaf className="w-6 h-6 text-brand-gold" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold tracking-tight leading-none">Nature Cures</span>
                <span className="text-[10px] uppercase tracking-widest text-brand-gold font-semibold">Initiative</span>
              </div>
            </Link>
            <p className="text-emerald-100/70 text-sm leading-relaxed mb-6">
              Empowering wellness through nature. We provide premium herbal support and natural health education for a better quality of life.
            </p>
            <div className="flex gap-4">
              <a href="https://facebook.com" className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="mailto:naturecuresinitiative@gmail.com" className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors">
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-brand-gold font-bold uppercase tracking-widest text-xs mb-6">Quick Links</h3>
            <ul className="space-y-4 text-sm text-emerald-100/70">
              <li><Link to="/shop" className="hover:text-white transition-colors">Shop Products</Link></li>
              <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link to="/education" className="hover:text-white transition-colors">Herbal Education</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">Contact Support</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-brand-gold font-bold uppercase tracking-widest text-xs mb-6">Contact Us</h3>
            <ul className="space-y-4 text-sm text-emerald-100/70">
              <li className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-brand-gold shrink-0" />
                <span>+234 813 348 1447</span>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-brand-gold shrink-0" />
                <span>naturecuresinitiative@gmail.com</span>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-brand-gold shrink-0" />
                <span>Lagos, Nigeria</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-brand-gold font-bold uppercase tracking-widest text-xs mb-6">Legal</h3>
            <p className="text-[10px] text-emerald-100/50 leading-relaxed italic">
              Disclaimer: These products are not intended to diagnose, treat, cure, or prevent any disease. Always consult with a healthcare professional before starting any new herbal supplement.
            </p>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] uppercase tracking-widest text-emerald-100/30 font-medium">
          <p>© {new Date().getFullYear()} Nature Cures Initiative. All Rights Reserved.</p>
          <div className="flex gap-8">
            <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
