import { ShoppingCart, Star, Heart } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import type { Product } from '../lib/supabase';
import type { Page } from '../App';

interface Props {
  product: Product;
  navigate: (page: Page, params?: { slug?: string; category?: string | null }) => void;
}

export default function ProductCard({ product, navigate }: Props) {
  const { addToCart } = useCart();
  const discount = product.original_price && product.original_price > product.price
    ? Math.round((1 - product.price / product.original_price) * 100)
    : null;

  async function handleAddToCart(e: React.MouseEvent) {
    e.stopPropagation();
    await addToCart(product.id, 1);
  }

  return (
    <div
      onClick={() => navigate('product-detail', { slug: product.slug })}
      className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg hover:border-gray-200 transition-all duration-200 cursor-pointer"
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-gray-50">
        <img
          src={product.image_url || 'https://images.pexels.com/photos/1779487/pexels-photo-1779487.jpeg'}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        {discount && (
          <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
            -{discount}%
          </span>
        )}
        {product.stock < 5 && product.stock > 0 && (
          <span className="absolute top-2 right-2 bg-orange-100 text-orange-700 text-xs font-medium px-2 py-0.5 rounded-full">
            Presque épuisé
          </span>
        )}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-gray-900/50 flex items-center justify-center">
            <span className="bg-white text-gray-800 text-sm font-semibold px-3 py-1 rounded-full">
              Rupture de stock
            </span>
          </div>
        )}
        <button
          onClick={e => e.stopPropagation()}
          className="absolute top-2 right-2 w-8 h-8 bg-white/90 hover:bg-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
        >
          <Heart className="w-4 h-4 text-gray-500 hover:text-red-500 transition-colors" />
        </button>
      </div>

      {/* Info */}
      <div className="p-4 space-y-2">
        <p className="text-xs font-medium text-blue-600 uppercase tracking-wide">{product.brand}</p>
        <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors">
          {product.name}
        </h3>

        {/* Rating */}
        {product.rating > 0 && (
          <div className="flex items-center gap-1">
            <div className="flex">
              {[1,2,3,4,5].map(s => (
                <Star
                  key={s}
                  className={`w-3 h-3 ${s <= Math.round(product.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'}`}
                />
              ))}
            </div>
            <span className="text-xs text-gray-400">({product.review_count})</span>
          </div>
        )}

        {/* Price */}
        <div className="flex items-end justify-between pt-1">
          <div>
            <span className="text-lg font-bold text-gray-900">{product.price.toFixed(2)} €</span>
            {product.original_price && product.original_price > product.price && (
              <span className="ml-1.5 text-sm text-gray-400 line-through">{product.original_price.toFixed(2)} €</span>
            )}
          </div>
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:cursor-not-allowed text-white text-xs font-medium rounded-lg transition-colors"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            Ajouter
          </button>
        </div>
      </div>
    </div>
  );
}
