import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface Product {
  id: string;
  name: string;
  price: number;
  image_url: string | null;
  slug: string;
  [key: string]: unknown;
}

export interface CartItem {
  id: string;
  product_id: string;
  quantity: number;
}

export interface CartItemWithProduct extends CartItem {
  product: Product;
}

// Shape stored in localStorage when the user is logged out.
interface LocalCartItem {
  product_id: string;
  quantity: number;
}

const LOCAL_CART_KEY = 'rayan_store_cart';

// ---------------------------------------------------------------------------
// Context definition
// ---------------------------------------------------------------------------

interface CartContextValue {
  items: CartItemWithProduct[];
  loading: boolean;
  addToCart: (productId: string, qty?: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, qty: number) => Promise<void>;
  clearCart: () => Promise<void>;
  totalItems: number;
  totalPrice: number;
}

export const CartContext = createContext<CartContextValue | undefined>(undefined);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function readLocalCart(): LocalCartItem[] {
  try {
    const raw = localStorage.getItem(LOCAL_CART_KEY);
    return raw ? (JSON.parse(raw) as LocalCartItem[]) : [];
  } catch {
    return [];
  }
}

function writeLocalCart(items: LocalCartItem[]): void {
  localStorage.setItem(LOCAL_CART_KEY, JSON.stringify(items));
}

function clearLocalCart(): void {
  localStorage.removeItem(LOCAL_CART_KEY);
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItemWithProduct[]>([]);
  const [loading, setLoading] = useState(false);

  // -------------------------------------------------------------------------
  // DB helpers
  // -------------------------------------------------------------------------

  async function fetchDbCart(userId: string): Promise<CartItemWithProduct[]> {
    const { data, error } = await supabase
      .from('cart_items')
      .select('id, product_id, quantity, products(*)')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching cart:', error.message);
      return [];
    }

    return (data ?? []).map((row: Record<string, unknown>) => ({
      id: row.id as string,
      product_id: row.product_id as string,
      quantity: row.quantity as number,
      product: row.products as unknown as Product,
    }));
  }

  // -------------------------------------------------------------------------
  // LocalStorage helpers (guest cart)
  // -------------------------------------------------------------------------

  async function resolveLocalCart(): Promise<CartItemWithProduct[]> {
    const local = readLocalCart();
    if (local.length === 0) return [];

    const ids = local.map((i) => i.product_id);
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .in('id', ids);

    if (error) {
      console.error('Error fetching products for local cart:', error.message);
      return [];
    }

    const productMap = new Map<string, Product>(
      (data ?? []).map((p: Product) => [p.id, p])
    );

    return local
      .filter((item) => productMap.has(item.product_id))
      .map((item) => ({
        id: `local-${item.product_id}`,
        product_id: item.product_id,
        quantity: item.quantity,
        product: productMap.get(item.product_id)!,
      }));
  }

  // -------------------------------------------------------------------------
  // Merge localStorage cart into DB when user signs in
  // -------------------------------------------------------------------------

  async function mergeLocalCartIntoDb(userId: string): Promise<void> {
    const local = readLocalCart();
    if (local.length === 0) return;

    for (const item of local) {
      const { data: existing } = await supabase
        .from('cart_items')
        .select('id, quantity')
        .eq('user_id', userId)
        .eq('product_id', item.product_id)
        .maybeSingle();

      if (existing) {
        await supabase
          .from('cart_items')
          .update({ quantity: existing.quantity + item.quantity })
          .eq('id', existing.id);
      } else {
        await supabase.from('cart_items').insert({
          user_id: userId,
          product_id: item.product_id,
          quantity: item.quantity,
        });
      }
    }

    clearLocalCart();
  }

  // -------------------------------------------------------------------------
  // Load cart on auth change
  // -------------------------------------------------------------------------

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      setLoading(true);
      try {
        if (user) {
          await mergeLocalCartIntoDb(user.id);
          const dbItems = await fetchDbCart(user.id);
          if (!cancelled) setItems(dbItems);
        } else {
          const localItems = await resolveLocalCart();
          if (!cancelled) setItems(localItems);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // -------------------------------------------------------------------------
  // addToCart
  // -------------------------------------------------------------------------

  const addToCart = useCallback(
    async (productId: string, qty = 1): Promise<void> => {
      if (user) {
        const existing = items.find((i) => i.product_id === productId);

        if (existing) {
          const newQty = existing.quantity + qty;
          const { error } = await supabase
            .from('cart_items')
            .update({ quantity: newQty })
            .eq('id', existing.id);
          if (error) throw error;
        } else {
          const { error } = await supabase.from('cart_items').insert({
            user_id: user.id,
            product_id: productId,
            quantity: qty,
          });
          if (error) throw error;
        }

        const refreshed = await fetchDbCart(user.id);
        setItems(refreshed);
      } else {
        const local = readLocalCart();
        const idx = local.findIndex((i) => i.product_id === productId);

        if (idx >= 0) {
          local[idx].quantity += qty;
        } else {
          local.push({ product_id: productId, quantity: qty });
        }

        writeLocalCart(local);
        const resolved = await resolveLocalCart();
        setItems(resolved);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user, items]
  );

  // -------------------------------------------------------------------------
  // removeFromCart
  // -------------------------------------------------------------------------

  const removeFromCart = useCallback(
    async (productId: string): Promise<void> => {
      if (user) {
        const { error } = await supabase
          .from('cart_items')
          .delete()
          .eq('user_id', user.id)
          .eq('product_id', productId);
        if (error) throw error;

        setItems((prev) => prev.filter((i) => i.product_id !== productId));
      } else {
        const local = readLocalCart().filter((i) => i.product_id !== productId);
        writeLocalCart(local);
        const resolved = await resolveLocalCart();
        setItems(resolved);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user]
  );

  // -------------------------------------------------------------------------
  // updateQuantity
  // -------------------------------------------------------------------------

  const updateQuantity = useCallback(
    async (productId: string, qty: number): Promise<void> => {
      if (qty <= 0) {
        return removeFromCart(productId);
      }

      if (user) {
        const existing = items.find((i) => i.product_id === productId);
        if (!existing) return;

        const { error } = await supabase
          .from('cart_items')
          .update({ quantity: qty })
          .eq('id', existing.id);
        if (error) throw error;

        setItems((prev) =>
          prev.map((i) =>
            i.product_id === productId ? { ...i, quantity: qty } : i
          )
        );
      } else {
        const local = readLocalCart().map((i) =>
          i.product_id === productId ? { ...i, quantity: qty } : i
        );
        writeLocalCart(local);
        setItems((prev) =>
          prev.map((i) =>
            i.product_id === productId ? { ...i, quantity: qty } : i
          )
        );
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user, items, removeFromCart]
  );

  // -------------------------------------------------------------------------
  // clearCart
  // -------------------------------------------------------------------------

  const clearCart = useCallback(async (): Promise<void> => {
    if (user) {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id);
      if (error) throw error;
    } else {
      clearLocalCart();
    }
    setItems([]);
  }, [user]);

  // -------------------------------------------------------------------------
  // Derived values
  // -------------------------------------------------------------------------

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = items.reduce(
    (sum, i) => sum + i.product.price * i.quantity,
    0
  );

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  const value: CartContextValue = {
    items,
    loading,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    totalItems,
    totalPrice,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
