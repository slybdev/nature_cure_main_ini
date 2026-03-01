import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { CartItem, Product } from '../types';
import toast from 'react-hot-toast';

type CartContextType = {
  items: CartItem[];
  loading: boolean;
  addToCart: (product: Product, quantity?: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  total: number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [cartId, setCartId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchCart();
    } else {
      setItems([]);
      setLoading(false);
    }
  }, [user]);

  async function fetchCart() {
    try {
      setLoading(true);
      // Get cart
      const { data: cartData, error: cartError } = await supabase
        .from('carts')
        .select('id')
        .eq('user_id', user?.id)
        .single();

      if (cartError) throw cartError;
      setCartId(cartData.id);

      // Get items
      const { data: itemsData, error: itemsError } = await supabase
        .from('cart_items')
        .select('*, product:products(*)')
        .eq('cart_id', cartData.id);

      if (itemsError) throw itemsError;
      setItems(itemsData || []);
    } catch (error) {
      // Silent error
    } finally {
      setLoading(false);
    }
  }

  const addToCart = async (product: Product, quantity = 1) => {
    if (!user) {
      toast.error('Please login to add items to cart');
      return;
    }

    try {
      const existingItem = items.find(item => item.product_id === product.id);

      if (existingItem) {
        const { error } = await supabase
          .from('cart_items')
          .update({ quantity: existingItem.quantity + quantity })
          .eq('id', existingItem.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('cart_items')
          .insert({
            cart_id: cartId,
            product_id: product.id,
            quantity
          });
        if (error) throw error;
      }

      await fetchCart();
      toast.success('Added to cart');
    } catch (error) {
      toast.error('Failed to add to cart');
    }
  };

  const removeFromCart = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', itemId);
      if (error) throw error;
      await fetchCart();
      toast.success('Removed from cart');
    } catch (error) {
      toast.error('Failed to remove item');
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (quantity < 1) return;
    try {
      const { error } = await supabase
        .from('cart_items')
        .update({ quantity })
        .eq('id', itemId);
      if (error) throw error;
      await fetchCart();
    } catch (error) {
      // Silent error
    }
  };

  const clearCart = async () => {
    if (!cartId) return;
    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('cart_id', cartId);
      if (error) throw error;
      setItems([]);
    } catch (error) {
      // Silent error
    }
  };

  const total = items.reduce((sum, item) => {
    return sum + (item.product?.price || 0) * item.quantity;
  }, 0);

  return (
    <CartContext.Provider value={{ items, loading, addToCart, removeFromCart, updateQuantity, clearCart, total }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
