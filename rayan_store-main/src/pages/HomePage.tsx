import { useEffect, useState } from 'react';
import { ArrowRight, Shield, Truck, RefreshCw, Headphones, Star, ChevronRight, Zap } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Product, Category } from '../lib/supabase';
import ProductCard from '../components/ProductCard';
import type { Page } from '../App';

interface Props {
  navigate: (page: Page, params?: { slug?: string; category?: string }) => void;
}

const HERO_SLIDES = [
  {
    title: 'iPhone 15 Pro Max',
    subtitle: 'La puissance ultime dans votre poche',
    badge: 'Nouveau',
    image: 'https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg',
    cta: 'Découvrir',
    category: 'smartphones',
    bg: 'from-slate-900 to-blue-900',
  },
  {
    title: 'MacBook Pro M3 Pro',
    subtitle: 'Performant. Léger. Révolutionnaire.',
    badge: 'Best-seller',
    image: 'https://images.pexels.com/photos/303383/pexels-photo-303383.jpeg',
    cta: 'En savoir plus',
    category: 'laptops',
    bg: 'from-gray-900 to-slate-800',
  },
  {
    title: 'PS5 Slim',
    subtitle: 'La nouvelle génération est arrivée',
    badge: 'Gaming',
    image: 'https://images.pexels.com/photos/3165335/pexels-photo-3165335.jpeg',
    cta: 'Commander',
    category: 'gaming',
    bg: 'from-blue-950 to-gray-900',
  },
];

const FEATURES = [
  { icon: Truck, title: 'Livraison gratuite', desc: 'Dès 49€ d\'achat, livraison express en 24-48h', color: 'text-blue-600 bg-blue-50' },
  { icon: Shield, title: 'Paiement sécurisé', desc: 'Transactions chiffrées SSL — 100% sécurisé', color: 'text-green-600 bg-green-50' },
  { icon: RefreshCw, title: 'Retours 30 jours', desc: 'Satisfait ou remboursé sans condition', color: 'text-orange-600 bg-orange-50' },
  { icon: Headphones, title: 'Support 7j/7', desc: 'Experts disponibles par chat, email ou téléphone', color: 'text-teal-600 bg-teal-50' },
];

const CAT_ICONS: Record<string, string> = {
  smartphones: '📱',
  laptops: '💻',
  tablettes: '📐',
  accessoires: '🎧',
  composants: '🔧',
  gaming: '🎮',
};

export default function HomePage({ navigate }: Props) {
  const [heroIdx, setHeroIdx] = useState(0);
  const [featured, setFeatured] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => setHeroIdx(i => (i + 1) % HERO_SLIDES.length), 5000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    async function load() {
      const [{ data: prods }, { data: cats }] = await Promise.all([
        supabase.from('products').select('*').eq('featured', true).eq('active', true).limit(8),
        supabase.from('categories').select('*').limit(6),
      ]);
      setFeatured(prods || []);
      setCategories(cats || []);
      setLoading(false);
    }
    load();
  }, []);

  const slide = HERO_SLIDES[heroIdx];

  return (
    <div className="space-y-12 pb-12">
      {/* Hero */}
      <section className={`relative bg-gradient-to-r ${slide.bg} text-white overflow-hidden transition-all duration-700`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-6 animate-fade-in">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-500/20 border border-blue-400/30 text-blue-300 text-sm font-medium rounded-full">
                <Zap className="w-3.5 h-3.5" /> {slide.badge}
              </span>
              <h1 className="text-4xl md:text-5xl font-bold leading-tight">{slide.title}</h1>
              <p className="text-lg text-gray-300">{slide.subtitle}</p>
              <div className="flex gap-3">
                <button
                  onClick={() => navigate('products', { category: slide.category })}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-colors"
                >
                  {slide.cta} <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => navigate('products', { category: null })}
                  className="px-6 py-3 border border-white/20 hover:bg-white/10 text-white font-medium rounded-xl transition-colors"
                >
                  Voir tout
                </button>
              </div>
            </div>
            <div className="relative flex justify-center">
              <div className="w-72 h-72 md:w-96 md:h-96 rounded-2xl overflow-hidden shadow-2xl">
                <img src={slide.image} alt={slide.title} className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </div>
        {/* Slide indicators */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {HERO_SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setHeroIdx(i)}
              className={`w-2 h-2 rounded-full transition-all ${i === heroIdx ? 'w-6 bg-white' : 'bg-white/40'}`}
            />
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {FEATURES.map((f, i) => (
            <div key={i} className="flex items-start gap-3 p-4 bg-white rounded-2xl border border-gray-100 hover:shadow-md transition-shadow">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${f.color}`}>
                <f.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{f.title}</p>
                <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Nos catégories</h2>
            <p className="text-sm text-gray-500 mt-1">Explorez notre sélection tech</p>
          </div>
          <button
            onClick={() => navigate('products', { category: null })}
            className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            Tout voir <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => navigate('products', { category: cat.slug })}
              className="flex flex-col items-center gap-2 p-4 bg-white rounded-2xl border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all group"
            >
              <span className="text-3xl group-hover:scale-110 transition-transform">
                {CAT_ICONS[cat.slug] || '📦'}
              </span>
              <span className="text-xs font-medium text-gray-700 text-center leading-tight">{cat.name}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Featured products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Produits vedettes</h2>
            <p className="text-sm text-gray-500 mt-1">Notre sélection premium du moment</p>
          </div>
          <button
            onClick={() => navigate('products', { category: null })}
            className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            Voir tout <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
                <div className="aspect-square bg-gray-100" />
                <div className="p-4 space-y-2">
                  <div className="h-3 bg-gray-100 rounded w-16" />
                  <div className="h-4 bg-gray-100 rounded" />
                  <div className="h-4 bg-gray-100 rounded w-3/4" />
                  <div className="h-6 bg-gray-100 rounded w-1/2 mt-2" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {featured.map(p => (
              <ProductCard key={p.id} product={p} navigate={navigate} />
            ))}
          </div>
        )}
      </section>

      {/* Banner CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-3xl p-8 md:p-12 text-white text-center">
          <div className="flex justify-center mb-4">
            {[Star, Star, Star, Star, Star].map((S, i) => (
              <S key={i} className="w-5 h-5 text-yellow-300 fill-yellow-300" />
            ))}
          </div>
          <h2 className="text-3xl font-bold mb-3">Livraison express offerte</h2>
          <p className="text-blue-200 mb-6 max-w-lg mx-auto">
            Profitez de la livraison gratuite sur toutes vos commandes dès 49€. Disponible partout en France métropolitaine.
          </p>
          <button
            onClick={() => navigate('products', { category: null })}
            className="inline-flex items-center gap-2 px-8 py-3 bg-white text-blue-700 font-semibold rounded-xl hover:bg-blue-50 transition-colors"
          >
            Shopper maintenant <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>
    </div>
  );
}
