import { useState, useEffect } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import Header from './components/Header';
import Footer from './components/Footer';
import { isSupabaseConfigured } from './lib/supabase';
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import AuthPage from './pages/AuthPage';
import ProfilePage from './pages/ProfilePage';
import OrdersPage from './pages/OrdersPage';

export type Page =
  | 'home'
  | 'products'
  | 'product-detail'
  | 'cart'
  | 'checkout'
  | 'auth'
  | 'profile'
  | 'orders';

function AppContent() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [selectedProductSlug, setSelectedProductSlug] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  function navigate(page: Page, params?: { slug?: string; category?: string; query?: string }) {
    setCurrentPage(page);
    if (params?.slug !== undefined) setSelectedProductSlug(params.slug);
    if (params?.category !== undefined) setSelectedCategory(params.category);
    if (params?.query !== undefined) setSearchQuery(params.query);
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header
        currentPage={currentPage}
        navigate={navigate}
        onSearch={(q) => navigate('products', { query: q, category: null })}
      />
      <main className="flex-1">
        {currentPage === 'home' && (
          <HomePage
            navigate={navigate}
          />
        )}
        {currentPage === 'products' && (
          <ProductsPage
            navigate={navigate}
            initialCategory={selectedCategory}
            initialSearch={searchQuery}
          />
        )}
        {currentPage === 'product-detail' && selectedProductSlug && (
          <ProductDetailPage
            slug={selectedProductSlug}
            navigate={navigate}
          />
        )}
        {currentPage === 'cart' && <CartPage navigate={navigate} />}
        {currentPage === 'checkout' && <CheckoutPage navigate={navigate} />}
        {currentPage === 'auth' && <AuthPage navigate={navigate} />}
        {currentPage === 'profile' && <ProfilePage navigate={navigate} />}
        {currentPage === 'orders' && <OrdersPage navigate={navigate} />}
      </main>
      <Footer navigate={navigate} />
    </div>
  );
}

export default function App() {
  if (!isSupabaseConfigured) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">
        <div className="w-full max-w-2xl rounded-3xl border border-slate-800 bg-slate-900/90 p-8 shadow-2xl">
          <p className="text-sm uppercase tracking-[0.3em] text-cyan-400">Configuration requise</p>
          <h1 className="mt-3 text-3xl font-bold text-white">L'application ne peut pas se connecter a Supabase</h1>
          <p className="mt-4 text-base leading-7 text-slate-300">
            Ajoute un fichier <code>.env</code> a la racine du projet avec les variables ci-dessous,
            puis redemarre le serveur Vite.
          </p>
          <pre className="mt-6 overflow-x-auto rounded-2xl bg-slate-950 p-5 text-sm text-cyan-200">
{`VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre_cle_anon_publique`}
          </pre>
          <p className="mt-6 text-sm text-slate-400">
            Le projet reference deja ces variables dans la documentation embarquee.
          </p>
        </div>
      </div>
    );
  }

  return (
    <AuthProvider>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </AuthProvider>
  );
}
