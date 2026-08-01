import { useEffect, useState } from 'react';
import { Package, ChevronRight, ShoppingBag, AlertCircle, Clock, CheckCircle, Truck, XCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Order } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { Page } from '../App';

interface Props {
  navigate: (page: Page) => void;
}

interface OrderWithItems extends Order {
  order_items: {
    id: string;
    product_name: string;
    product_image: string;
    quantity: number;
    unit_price: number;
  }[];
}

const statusConfig: Record<string, { label: string; color: string; icon: React.ComponentType<{ className?: string }> }> = {
  pending:    { label: 'En attente',    color: 'text-yellow-600 bg-yellow-50',  icon: Clock },
  confirmed:  { label: 'Confirmée',     color: 'text-blue-600 bg-blue-50',      icon: CheckCircle },
  shipped:    { label: 'Expédiée',      color: 'text-cyan-600 bg-cyan-50',      icon: Truck },
  delivered:  { label: 'Livrée',        color: 'text-green-600 bg-green-50',    icon: CheckCircle },
  cancelled:  { label: 'Annulée',       color: 'text-red-600 bg-red-50',        icon: XCircle },
};

export default function OrdersPage({ navigate }: Props) {
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    if (!user) { setLoading(false); return; }

    async function load() {
      setLoading(true);
      const { data } = await supabase
        .from('orders')
        .select(`*, order_items(id, product_name, product_image, quantity, unit_price)`)
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });

      setOrders((data as OrderWithItems[]) || []);
      setLoading(false);
    }

    load();
  }, [user]);

  if (authLoading || loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          {[1,2,3].map(i => <div key={i} className="h-28 bg-gray-100 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <AlertCircle className="w-12 h-12 text-orange-400 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Connexion requise</h2>
        <p className="text-gray-500 text-sm mb-6">Vous devez être connecté pour voir vos commandes.</p>
        <button onClick={() => navigate('auth')} className="px-6 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors">
          Se connecter
        </button>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <div className="w-20 h-20 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <ShoppingBag className="w-10 h-10 text-blue-400" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Aucune commande</h2>
        <p className="text-gray-500 text-sm mb-6">Vous n'avez pas encore passé de commande.</p>
        <button onClick={() => navigate('products')} className="px-6 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors">
          Découvrir nos produits
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">Mes commandes</h1>
      <p className="text-sm text-gray-500">{orders.length} commande{orders.length > 1 ? 's' : ''} au total</p>

      {orders.map(order => {
        const status = statusConfig[order.status] || statusConfig.pending;
        const StatusIcon = status.icon;
        const isExpanded = expanded === order.id;
        const date = new Date(order.created_at).toLocaleDateString('fr-FR', {
          day: 'numeric', month: 'long', year: 'numeric',
        });

        return (
          <div key={order.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <button
              onClick={() => setExpanded(isExpanded ? null : order.id)}
              className="w-full flex items-center gap-4 p-5 hover:bg-gray-50 transition-colors text-left"
            >
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <Package className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-semibold text-gray-900">Commande #{order.id.slice(0, 8).toUpperCase()}</p>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
                    <StatusIcon className="w-3 h-3" />
                    {status.label}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">{date}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-bold text-gray-900">{order.total_amount.toFixed(2)} €</p>
                <p className="text-xs text-gray-400">{order.order_items.length} article{order.order_items.length > 1 ? 's' : ''}</p>
              </div>
              <ChevronRight className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
            </button>

            {isExpanded && (
              <div className="border-t border-gray-100 px-5 pb-5 pt-4 space-y-3">
                {order.order_items.map(item => (
                  <div key={item.id} className="flex items-center gap-3">
                    <img
                      src={item.product_image || 'https://images.pexels.com/photos/1779487/pexels-photo-1779487.jpeg'}
                      alt={item.product_name}
                      className="w-12 h-12 rounded-xl object-cover bg-gray-50 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 line-clamp-1">{item.product_name}</p>
                      <p className="text-xs text-gray-400">Qté : {item.quantity}</p>
                    </div>
                    <span className="text-sm font-semibold text-gray-900 flex-shrink-0">
                      {(item.unit_price * item.quantity).toFixed(2)} €
                    </span>
                  </div>
                ))}

                <hr className="border-gray-100" />

                <div className="flex items-center justify-between">
                  <div className="text-xs text-gray-500 space-y-0.5">
                    {order.shipping_address && typeof order.shipping_address === 'object' && (
                      <p>
                        Livraison : {(order.shipping_address as Record<string, string>).full_name},{' '}
                        {(order.shipping_address as Record<string, string>).city}
                      </p>
                    )}
                    <p>Paiement : {order.payment_method === 'card' ? 'Carte bancaire' : order.payment_method}</p>
                  </div>
                  <p className="text-base font-bold text-gray-900">Total : {order.total_amount.toFixed(2)} €</p>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
