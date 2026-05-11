import { useState } from 'react';
import { CreditCard, MapPin, Check, ShoppingBag, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import type { Page } from '../App';

interface Props {
  navigate: (page: Page) => void;
}

export default function CheckoutPage({ navigate }: Props) {
  const { items, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const [step, setStep] = useState<'shipping' | 'payment' | 'success'>('shipping');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [shipping, setShipping] = useState({
    full_name: '', address: '', city: '', postal_code: '', country: 'France', phone: '',
  });
  const [payment, setPayment] = useState({
    cardNumber: '', expiry: '', cvv: '', cardName: '',
  });

  const shippingCost = totalPrice >= 49 ? 0 : 5.99;
  const total = totalPrice + shippingCost;

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <AlertCircle className="w-12 h-12 text-orange-400 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Connexion requise</h2>
        <p className="text-gray-500 text-sm mb-6">Vous devez être connecté pour passer commande.</p>
        <button onClick={() => navigate('auth')} className="px-6 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors">
          Se connecter
        </button>
      </div>
    );
  }

  if (items.length === 0 && step !== 'success') {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Panier vide</h2>
        <button onClick={() => navigate('products')} className="px-6 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors">
          Continuer mes achats
        </button>
      </div>
    );
  }

  async function handleOrder() {
    if (!user) return;
    setLoading(true);
    setError('');
    try {
      const { data: order, error: orderErr } = await supabase.from('orders').insert({
        user_id: user.id,
        status: 'confirmed',
        total_amount: total,
        shipping_address: shipping,
        payment_method: 'card',
        payment_status: 'paid',
      }).select().single();

      if (orderErr) throw orderErr;

      const orderItems = items.map(item => ({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.product.price,
        product_name: item.product.name,
        product_image: item.product.image_url || '',
      }));

      const { error: itemsErr } = await supabase.from('order_items').insert(orderItems);
      if (itemsErr) throw itemsErr;

      await clearCart();
      setStep('success');
    } catch (e: unknown) {
      setError((e as Error).message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  }

  if (step === 'success') {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Check className="w-10 h-10 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Commande confirmée !</h2>
        <p className="text-gray-500 mb-8">Merci pour votre achat. Vous recevrez un email de confirmation.</p>
        <div className="flex gap-3 justify-center">
          <button onClick={() => navigate('orders')} className="px-6 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors">
            Voir mes commandes
          </button>
          <button onClick={() => navigate('home')} className="px-6 py-3 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors">
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Finaliser la commande</h1>

      {/* Steps */}
      <div className="flex items-center gap-2 mb-8">
        {['Livraison', 'Paiement'].map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
              (i === 0 && step === 'shipping') || (i === 1 && step === 'payment')
                ? 'bg-blue-600 text-white'
                : i === 0 && step === 'payment' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-400'
            }`}>
              {i === 0 && step === 'payment' ? <Check className="w-4 h-4" /> : i + 1}
            </div>
            <span className={`text-sm font-medium ${
              (i === 0 && step === 'shipping') || (i === 1 && step === 'payment') ? 'text-gray-900' : 'text-gray-400'
            }`}>{s}</span>
            {i < 1 && <div className="w-8 h-px bg-gray-200 mx-1" />}
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {step === 'shipping' && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
              <h2 className="font-bold text-gray-900 flex items-center gap-2"><MapPin className="w-5 h-5 text-blue-600" /> Adresse de livraison</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Nom complet</label>
                  <input value={shipping.full_name} onChange={e => setShipping(s => ({ ...s, full_name: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Jean Dupont" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Adresse</label>
                  <input value={shipping.address} onChange={e => setShipping(s => ({ ...s, address: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="12 rue de la Paix" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Code postal</label>
                  <input value={shipping.postal_code} onChange={e => setShipping(s => ({ ...s, postal_code: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="75001" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Ville</label>
                  <input value={shipping.city} onChange={e => setShipping(s => ({ ...s, city: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Paris" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Téléphone</label>
                  <input value={shipping.phone} onChange={e => setShipping(s => ({ ...s, phone: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="+33 6 12 34 56 78" />
                </div>
              </div>
              <button
                onClick={() => setStep('payment')}
                disabled={!shipping.full_name || !shipping.address || !shipping.city || !shipping.postal_code}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors"
              >
                Continuer vers le paiement
              </button>
            </div>
          )}

          {step === 'payment' && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
              <h2 className="font-bold text-gray-900 flex items-center gap-2"><CreditCard className="w-5 h-5 text-blue-600" /> Informations de paiement</h2>
              <div className="bg-blue-50 text-blue-700 text-xs px-3 py-2 rounded-xl">
                Mode démo — aucune transaction réelle n'est effectuée
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Nom sur la carte</label>
                  <input value={payment.cardName} onChange={e => setPayment(p => ({ ...p, cardName: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="JEAN DUPONT" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Numéro de carte</label>
                  <input value={payment.cardNumber} onChange={e => setPayment(p => ({ ...p, cardNumber: e.target.value }))}
                    maxLength={19}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono" placeholder="4242 4242 4242 4242" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Expiration</label>
                  <input value={payment.expiry} onChange={e => setPayment(p => ({ ...p, expiry: e.target.value }))}
                    maxLength={5}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono" placeholder="12/27" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">CVV</label>
                  <input value={payment.cvv} onChange={e => setPayment(p => ({ ...p, cvv: e.target.value }))}
                    maxLength={4} type="password"
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="•••" />
                </div>
              </div>
              {error && <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-xl">{error}</p>}
              <div className="flex gap-3">
                <button onClick={() => setStep('shipping')} className="px-4 py-3 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors">
                  Retour
                </button>
                <button
                  onClick={handleOrder}
                  disabled={loading || !payment.cardName || !payment.cardNumber}
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors"
                >
                  {loading ? 'Traitement...' : `Payer ${total.toFixed(2)} €`}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Order summary */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4 h-fit">
          <h3 className="font-bold text-gray-900">Récapitulatif</h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {items.map(item => (
              <div key={item.id} className="flex items-center gap-2">
                <img src={item.product.image_url || ''} alt="" className="w-10 h-10 rounded-lg object-cover bg-gray-50" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-700 truncate">{item.product.name}</p>
                  <p className="text-xs text-gray-400">x{item.quantity}</p>
                </div>
                <span className="text-xs font-semibold">{(item.product.price * item.quantity).toFixed(2)} €</span>
              </div>
            ))}
          </div>
          <hr className="border-gray-100" />
          <div className="space-y-1 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Sous-total</span><span>{totalPrice.toFixed(2)} €</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Livraison</span>
              <span className={shippingCost === 0 ? 'text-green-600 font-medium' : ''}>{shippingCost === 0 ? 'Gratuite' : `${shippingCost.toFixed(2)} €`}</span>
            </div>
          </div>
          <hr className="border-gray-100" />
          <div className="flex justify-between font-bold text-gray-900">
            <span>Total</span><span>{total.toFixed(2)} €</span>
          </div>
        </div>
      </div>
    </div>
  );
}
