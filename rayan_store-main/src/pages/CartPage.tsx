import { Trash2, ShoppingBag, ArrowRight, Tag } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import type { Page } from '../App';

interface Props {
  navigate: (page: Page) => void;
}

export default function CartPage({ navigate }: Props) {
  const { items, removeFromCart, updateQuantity, totalItems, totalPrice, loading } = useCart();

  const shipping = totalPrice >= 49 ? 0 : 5.99;
  const total = totalPrice + shipping;

  if (loading) return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="animate-pulse space-y-4">
        {[1,2,3].map(i => <div key={i} className="h-24 bg-gray-100 rounded-2xl" />)}
      </div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Mon panier
        {totalItems > 0 && <span className="ml-2 text-lg text-gray-400 font-normal">({totalItems} article{totalItems > 1 ? 's' : ''})</span>}
      </h1>

      {items.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-20 h-20 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ShoppingBag className="w-10 h-10 text-blue-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Votre panier est vide</h2>
          <p className="text-gray-500 text-sm mb-6">Découvrez notre sélection de produits tech</p>
          <button
            onClick={() => navigate('products')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors"
          >
            Commencer mes achats <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Items */}
          <div className="lg:col-span-2 space-y-3">
            {items.map(item => (
              <div key={item.id} className="flex gap-4 bg-white rounded-2xl border border-gray-100 p-4">
                <div
                  onClick={() => navigate('product-detail' as Page)}
                  className="w-20 h-20 rounded-xl overflow-hidden bg-gray-50 flex-shrink-0 cursor-pointer"
                >
                  <img
                    src={item.product.image_url || 'https://images.pexels.com/photos/1779487/pexels-photo-1779487.jpeg'}
                    alt={item.product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-blue-600 font-medium">{(item.product as Record<string, unknown>)['brand'] as string}</p>
                  <p className="text-sm font-semibold text-gray-900 line-clamp-2">{item.product.name}</p>
                  <p className="text-base font-bold text-gray-900 mt-1">{item.product.price.toFixed(2)} €</p>
                </div>
                <div className="flex flex-col items-end justify-between">
                  <button
                    onClick={() => removeFromCart(item.product_id)}
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                    <button
                      onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                      className="w-8 h-8 text-gray-600 hover:bg-gray-50 text-sm font-medium transition-colors"
                    >
                      −
                    </button>
                    <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                      className="w-8 h-8 text-gray-600 hover:bg-gray-50 text-sm font-medium transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-gray-100 p-5 sticky top-20 space-y-4">
              <h2 className="font-bold text-gray-900 text-lg">Récapitulatif</h2>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Sous-total ({totalItems} art.)</span>
                  <span>{totalPrice.toFixed(2)} €</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Livraison</span>
                  <span className={shipping === 0 ? 'text-green-600 font-medium' : ''}>
                    {shipping === 0 ? 'Gratuite' : `${shipping.toFixed(2)} €`}
                  </span>
                </div>
                {shipping > 0 && (
                  <p className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded-lg">
                    Encore {(49 - totalPrice).toFixed(2)} € pour la livraison gratuite
                  </p>
                )}
              </div>

              <hr className="border-gray-100" />

              <div className="flex justify-between font-bold text-gray-900">
                <span>Total TTC</span>
                <span className="text-xl">{total.toFixed(2)} €</span>
              </div>

              {/* Promo code */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                  <input placeholder="Code promo" className="w-full pl-8 pr-2 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <button className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-xs font-medium rounded-xl transition-colors">
                  Appliquer
                </button>
              </div>

              <button
                onClick={() => navigate('checkout')}
                className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors"
              >
                Passer la commande <ArrowRight className="w-4 h-4" />
              </button>

              <p className="text-center text-xs text-gray-400">
                Paiement 100% sécurisé — SSL/TLS
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
