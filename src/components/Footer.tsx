import { Zap, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Youtube } from 'lucide-react';
import type { Page } from '../App';

interface Props {
  navigate: (page: Page, params?: { slug?: string; category?: string | null }) => void;
}

export default function Footer({ navigate }: Props) {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">

          {/* Brand */}
          <div className="space-y-4">
            <button onClick={() => navigate('home')} className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                Rayan<span className="text-blue-400">.store</span>
              </span>
            </button>
            <p className="text-sm text-gray-400 leading-relaxed">
              Votre boutique tech de confiance. Les meilleurs produits informatiques et mobiles au meilleur prix.
            </p>
            <div className="flex gap-3">
              {[Facebook, Twitter, Instagram, Youtube].map((Icon, i) => (
                <button key={i} className="w-8 h-8 bg-gray-800 hover:bg-blue-600 rounded-lg flex items-center justify-center transition-colors">
                  <Icon className="w-4 h-4" />
                </button>
              ))}
            </div>
          </div>

          {/* Catégories */}
          <div>
            <h3 className="text-white font-semibold mb-4">Catégories</h3>
            <ul className="space-y-2 text-sm">
              {[
                { label: 'Smartphones', slug: 'smartphones' },
                { label: 'Laptops', slug: 'laptops' },
                { label: 'Tablettes', slug: 'tablettes' },
                { label: 'Accessoires', slug: 'accessoires' },
                { label: 'Composants PC', slug: 'composants' },
                { label: 'Gaming', slug: 'gaming' },
              ].map(cat => (
                <li key={cat.slug}>
                  <button
                    onClick={() => navigate('products', { category: cat.slug })}
                    className="hover:text-white hover:translate-x-1 transition-all inline-block"
                  >
                    {cat.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Liens utiles */}
          <div>
            <h3 className="text-white font-semibold mb-4">Liens utiles</h3>
            <ul className="space-y-2 text-sm">
              <li><button onClick={() => navigate('home')} className="hover:text-white transition-colors">Accueil</button></li>
              <li><button onClick={() => navigate('products', { category: null })} className="hover:text-white transition-colors">Tous les produits</button></li>
              <li><button onClick={() => navigate('orders')} className="hover:text-white transition-colors">Mes commandes</button></li>
              <li><button onClick={() => navigate('profile')} className="hover:text-white transition-colors">Mon profil</button></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contact</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-400 flex-shrink-0" />
                <span>contact@rayan.store</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-blue-400 flex-shrink-0" />
                <span>+33 1 23 45 67 89</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                <span>12 Rue de la Tech<br />75001 Paris, France</span>
              </li>
            </ul>
          </div>
        </div>

        <hr className="border-gray-800 my-8" />
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-gray-500">
          <p>© 2026 Rayan.store — Tous droits réservés</p>
          <div className="flex gap-4">
            <span className="hover:text-gray-300 cursor-pointer">Mentions légales</span>
            <span className="hover:text-gray-300 cursor-pointer">Politique de confidentialité</span>
            <span className="hover:text-gray-300 cursor-pointer">CGV</span>
            <span className="hover:text-gray-300 cursor-pointer">RGPD</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
