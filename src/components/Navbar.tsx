import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, User, LogOut, Menu, X, Leaf } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { cn } from '../lib/utils';

export default function Navbar() {
  const { user, profile, signOut, isAdmin } = useAuth();
  const { items } = useCart();
  const [isOpen, setIsOpen] = React.useState(false);
  const location = useLocation();

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Shop', href: '/shop' },
    { name: 'About', href: '/about' },
  ];

  if (isAdmin) {
    navLinks.push({ name: 'Admin', href: '/admin' });
  }

  return (
    <nav className="sticky top-0 z-50 w-full glass border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-12 h-12 rounded-lg overflow-hidden group-hover:scale-105 transition-transform shrink-0 shadow-sm border border-slate-100">
                <img src="/logo.png" alt="Nature Cures Initiative Logo" className="w-full h-full object-cover" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold text-brand-green tracking-tight leading-none">Nature Cures</span>
                <span className="text-[10px] uppercase tracking-widest text-brand-gold font-semibold">Initiative</span>
              </div>
            </Link>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-brand-green",
                  location.pathname === link.href ? "text-brand-green" : "text-slate-600"
                )}
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-4">
            <Link to="/cart" className="relative p-2 text-slate-600 hover:text-brand-green transition-colors">
              <ShoppingCart className="w-6 h-6" />
              {items.length > 0 && (
                <span className="absolute top-0 right-0 bg-brand-gold text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                  {items.length}
                </span>
              )}
            </Link>

            {user ? (
              <div className="flex items-center gap-4">
                <Link to="/dashboard" className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-brand-green">
                  <User className="w-5 h-5" />
                  <span>{profile?.full_name?.split(' ')[0]}</span>
                </Link>
                <button
                  onClick={() => signOut()}
                  className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="bg-brand-green text-white px-6 py-2 rounded-full text-sm font-medium hover:bg-emerald-900 transition-all shadow-md hover:shadow-lg"
              >
                Login
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-4">
            <Link to="/cart" className="relative p-2 text-slate-600">
              <ShoppingCart className="w-6 h-6" />
              {items.length > 0 && (
                <span className="absolute top-0 right-0 bg-brand-gold text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {items.length}
                </span>
              )}
            </Link>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-slate-600"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-slate-100 animate-in slide-in-from-top duration-300">
          <div className="px-4 pt-2 pb-6 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                onClick={() => setIsOpen(false)}
                className="block px-3 py-4 text-base font-medium text-slate-600 hover:text-brand-green hover:bg-slate-50 rounded-lg"
              >
                {link.name}
              </Link>
            ))}
            {!user && (
              <Link
                to="/login"
                onClick={() => setIsOpen(false)}
                className="block px-3 py-4 text-base font-medium text-brand-green"
              >
                Login
              </Link>
            )}
            {user && (
              <>
                <Link
                  to="/dashboard"
                  onClick={() => setIsOpen(false)}
                  className="block px-3 py-4 text-base font-medium text-slate-600"
                >
                  Dashboard
                </Link>
                <button
                  onClick={() => {
                    signOut();
                    setIsOpen(false);
                  }}
                  className="block w-full text-left px-3 py-4 text-base font-medium text-red-500"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
