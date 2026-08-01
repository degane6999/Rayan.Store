import { useEffect, useState } from 'react';
import { ShoppingCart, Star, ChevronLeft, Heart, Share2, Shield, Truck, RotateCcw, Package, Check } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Product } from '../lib/supabase';
import { useCart } from '../contexts/CartContext';
import type { Page } from '../App';

interface Props {
  slug: string;
  navigate: (page: Page, params?: { slug?: string; category?: string }) => void;
}

export default function ProductDetailPage({ slug, navigate }: Props) {
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [selectedImg, setSelectedImg] = useState(0);
  const [addedToCart, setAddedToCart] = useState(false);
  const { addToCart } = useCart();

  useEffect(() => {
    async function load() {
      setLoading(true);
      const { data } = await supabase.from('products').select('*').eq('slug', slug).maybeSingle();
      setProduct(data);
      if (data?.category_id) {
        const { data: rel } = await supabase
          .from('products')
          .select('*')
          .eq('category_id', data.category_id)
          .neq('id', data.id)
          .eq('active', true)
          .limit(4);
        setRelated(rel || []);
      }
      setLoading(false);
    }
    load();
  }, [slug]);

  async function handleAddToCart() {
    if (!product) return;
    await addToCart(product.id, qty);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  }

  if (loading) return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="animate-pulse grid md:grid-cols-2 gap-8">
        <div className="aspect-square bg-gray-100 rounded-2xl" />
        <div className="space-y-4">
          <div className="h-8 bg-gray-100 rounded w-3/4" />
          <div className="h-4 bg-gray-100 rounded w-1/2" />
          <div className="h-12 bg-gray-100 rounded w-1/3" />
        </div>
      </div>
    </div>
  );

  if (!product) return (
    <div className="max-w-7xl mx-auto px-4 py-16 text-center">
      <div className="text-5xl mb-4">😕</div>
      <h2 className="text-xl font-bold text-gray-900 mb-2">Produit introuvable</h2>
      <button onClick={() => navigate('products', { category: null })} className="text-blue-600 hover:underline text-sm">
        Retour aux produits
      </button>
    </div>
  );

  const images = product.images?.length ? product.images : [product.image_url];
  const discount = product.original_price && product.original_price > product.price
    ? Math.round((1 - product.price / product.original_price) * 100) : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Breadcrumb */}
      <button
        onClick={() => navigate('products', { category: null })}
        className="flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" /> Retour aux produits
      </button>

      {/* Main */}
      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        {/* Images */}
        <div className="space-y-3">
          <div className="aspect-square rounded-2xl overflow-hidden bg-gray-50">
            <img
              src={images[selectedImg] || 'https://images.pexels.com/photos/1779487/pexels-photo-1779487.jpeg'}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
          {images.length > 1 && (
            <div className="flex gap-2">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImg(i)}
                  className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-colors ${i === selectedImg ? 'border-blue-500' : 'border-gray-100 hover:border-gray-300'}`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="space-y-5">
          <div>
            <p className="text-sm font-semibold text-blue-600 uppercase tracking-wide mb-1">{product.brand}</p>
            <h1 className="text-3xl font-bold text-gray-900 leading-tight">{product.name}</h1>
            {product.rating > 0 && (
              <div className="flex items-center gap-2 mt-2">
                <div className="flex">
                  {[1,2,3,4,5].map(s => (
                    <Star key={s} className={`w-4 h-4 ${s <= Math.round(product.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'}`} />
                  ))}
                </div>
                <span className="text-sm font-semibold text-gray-700">{product.rating}</span>
                <span className="text-sm text-gray-400">({product.review_count} avis)</span>
              </div>
            )}
          </div>

          <div className="flex items-end gap-3">
            <span className="text-4xl font-bold text-gray-900">{product.price.toFixed(2)} €</span>
            {product.original_price && product.original_price > product.price && (
              <>
                <span className="text-xl text-gray-400 line-through mb-0.5">{product.original_price.toFixed(2)} €</span>
                <span className="px-2 py-0.5 bg-red-100 text-red-600 text-sm font-bold rounded-full">-{discount}%</span>
              </>
            )}
          </div>

          {/* Stock */}
          <div className={`flex items-center gap-1.5 text-sm font-medium ${product.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
            <Package className="w-4 h-4" />
            {product.stock > 10 ? 'En stock' : product.stock > 0 ? `Plus que ${product.stock} en stock` : 'Rupture de stock'}
          </div>

          {/* Description */}
          <p className="text-gray-600 text-sm leading-relaxed">{product.description}</p>

          {/* Qty + Cart */}
          {product.stock > 0 && (
            <div className="flex items-center gap-3">
              <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                <button onClick={() => setQty(q => Math.max(1, q - 1))} className="w-10 h-10 text-gray-600 hover:bg-gray-50 text-lg font-medium transition-colors">−</button>
                <span className="w-10 text-center text-sm font-semibold">{qty}</span>
                <button onClick={() => setQty(q => Math.min(product.stock, q + 1))} className="w-10 h-10 text-gray-600 hover:bg-gray-50 text-lg font-medium transition-colors">+</button>
              </div>
              <button
                onClick={handleAddToCart}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-white font-semibold transition-all ${addedToCart ? 'bg-green-500' : 'bg-blue-600 hover:bg-blue-700'}`}
              >
                {addedToCart ? <><Check className="w-5 h-5" /> Ajouté !</> : <><ShoppingCart className="w-5 h-5" /> Ajouter au panier</>}
              </button>
              <button className="w-12 h-12 border border-gray-200 rounded-xl flex items-center justify-center hover:bg-gray-50 transition-colors">
                <Heart className="w-5 h-5 text-gray-500 hover:text-red-500 transition-colors" />
              </button>
            </div>
          )}

          {/* Guarantees */}
          <div className="grid grid-cols-3 gap-3 pt-2">
            {[
              { icon: Truck, label: 'Livraison 24-48h' },
              { icon: Shield, label: 'Garantie 2 ans' },
              { icon: RotateCcw, label: 'Retours 30 j' },
            ].map((g, i) => (
              <div key={i} className="flex flex-col items-center gap-1.5 p-3 bg-gray-50 rounded-xl text-center">
                <g.icon className="w-5 h-5 text-blue-600" />
                <span className="text-xs text-gray-600 font-medium">{g.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Specs */}
      {product.specs && Object.keys(product.specs).length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Caractéristiques techniques</h2>
          <div className="grid sm:grid-cols-2 gap-0 divide-y sm:divide-y-0 sm:divide-x-0">
            {Object.entries(product.specs as Record<string, string>).map(([key, val]) => (
              <div key={key} className="flex justify-between py-3 border-b border-gray-50 last:border-0">
                <span className="text-sm text-gray-500 capitalize">{key.replace(/_/g, ' ')}</span>
                <span className="text-sm font-medium text-gray-900">{val}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Related */}
      {related.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Produits similaires</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {related.map(p => (
              <div
                key={p.id}
                onClick={() => navigate('product-detail', { slug: p.slug })}
                className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition-all cursor-pointer"
              >
                <div className="aspect-square overflow-hidden bg-gray-50">
                  <img src={p.image_url} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                </div>
                <div className="p-3">
                  <p className="text-xs text-blue-600 font-medium">{p.brand}</p>
                  <p className="text-sm font-semibold text-gray-900 line-clamp-2 mt-0.5">{p.name}</p>
                  <p className="text-base font-bold text-gray-900 mt-1">{p.price.toFixed(2)} €</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
