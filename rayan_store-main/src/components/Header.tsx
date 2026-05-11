import { useState, useRef, useEffect } from 'react';
import {
  ShoppingCart, Search, User, Menu, X, Zap,
  ChevronDown, Package, LogOut
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import type { Page } from '../App';

interface Props {
  currentPage: Page;
  navigate: (page: Page, params?: { slug?: string; category?: string; query?: string }) => void;
  onSearch: (q: string) => void;
}

const CATEGORIES = [
  { label: 'Smartphones', slug: 'smartphones' },
  { label: 'Laptops', slug: 'laptops' },
  { label: 'Tablettes', slug: 'tablettes' },
  { label: 'Accessoires', slug: 'accessoires' },
  { label: 'Composants PC', slug: 'composants' },
  { label: 'Gaming', slug: 'gaming' },
];

export default function Header({ currentPage, navigate, onSearch }: Props) {
  const { user, profile, signOut } = useAuth();
  const { totalItems } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [catMenuOpen, setCatMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (searchValue.trim()) {
      onSearch(searchValue.trim());
      setSearchOpen(false);
      setMobileOpen(false);
    }
  }

  async function handleSignOut() {
    await signOut();
    setUserMenuOpen(false);
    navigate('home');
  }

  return (
    <header className={`sticky top-0 z-50 transition-all duration-200 ${scrolled ? 'bg-white shadow-md' : 'bg-white border-b border-gray-100'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <button
            onClick={() => navigate('home')}
            className="flex items-center gap-2 group"
          >
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center group-hover:bg-blue-700 transition-colors">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl text-gray-900" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Rayan<span className="text-blue-600">.store</span>
            </span>
          </button>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              onClick={() => navigate('home')}
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${currentPage === 'home' ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`}
            >
              Accueil
            </button>
            {/* Categories dropdown */}
            <div className="relative">
              <button
                onClick={() => setCatMenuOpen(!catMenuOpen)}
                onBlur={() => setTimeout(() => setCatMenuOpen(false), 150)}
                className={`flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${currentPage === 'products' ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`}
              >
                Produits <ChevronDown className={`w-4 h-4 transition-transform ${catMenuOpen ? 'rotate-180' : ''}`} />
              </button>
              {catMenuOpen && (
                <div className="absolute left-0 top-full mt-1 w-48 bg-white border border-gray-100 rounded-xl shadow-lg py-1 animate-slide-down">
                  <button
                    onClick={() => { navigate('products', { category: null }); setCatMenuOpen(false); }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Tous les produits
                  </button>
                  <hr className="my-1 border-gray-100" />
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat.slug}
                      onClick={() => { navigate('products', { category: cat.slug }); setCatMenuOpen(false); }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {/* Search */}
            {searchOpen ? (
              <form onSubmit={handleSearch} className="hidden md:flex items-center gap-2">
                <input
                  ref={searchRef}
                  value={searchValue}
                  onChange={e => setSearchValue(e.target.value)}
                  placeholder="Rechercher..."
                  className="w-48 px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button type="button" onClick={() => setSearchOpen(false)} className="p-1.5 text-gray-500 hover:text-gray-700">
                  <X className="w-4 h-4" />
                </button>
              </form>
            ) : (
              <button
                onClick={() => setSearchOpen(true)}
                className="hidden md:flex p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Search className="w-5 h-5" />
              </button>
            )}

            {/* Cart */}
            <button
              onClick={() => navigate('cart')}
              className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ShoppingCart className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center font-medium">
                  {totalItems > 9 ? '9+' : totalItems}
                </span>
              )}
            </button>

            {/* User menu */}
            {user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-xs font-semibold text-blue-700">
                      {(profile?.full_name || user.email || 'U').charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="hidden md:block text-sm font-medium text-gray-700 max-w-24 truncate">
                    {profile?.full_name || 'Mon compte'}
                  </span>
                  <ChevronDown className="hidden md:block w-3 h-3 text-gray-500" />
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-100 rounded-xl shadow-lg py-1 animate-slide-down">
                    <button
                      onClick={() => { navigate('profile'); setUserMenuOpen(false); }}
                      className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <User className="w-4 h-4" /> Mon profil
                    </button>
                    <button
                      onClick={() => { navigate('orders'); setUserMenuOpen(false); }}
                      className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <Package className="w-4 h-4" /> Mes commandes
                    </button>
                    <hr className="my-1 border-gray-100" />
                    <button
                      onClick={handleSignOut}
                      className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="w-4 h-4" /> Se déconnecter
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => navigate('auth')}
                className="hidden md:flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                <User className="w-4 h-4" /> Connexion
              </button>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white animate-slide-down">
          <div className="px-4 py-3 space-y-1">
            <form onSubmit={handleSearch} className="flex gap-2 mb-3">
              <input
                value={searchValue}
                onChange={e => setSearchValue(e.target.value)}
                placeholder="Rechercher un produit..."
                className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button type="submit" className="px-3 py-2 bg-blue-600 text-white rounded-lg">
                <Search className="w-4 h-4" />
              </button>
            </form>
            <button onClick={() => { navigate('home'); setMobileOpen(false); }} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">Accueil</button>
            <button onClick={() => { navigate('products', { category: null }); setMobileOpen(false); }} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">Tous les produits</button>
            {CATEGORIES.map(cat => (
              <button key={cat.slug} onClick={() => { navigate('products', { category: cat.slug }); setMobileOpen(false); }} className="flex items-center gap-2 w-full px-3 py-2.5 pl-6 text-sm text-gray-600 hover:bg-gray-50 rounded-lg">
                {cat.label}
              </button>
            ))}
            {!user && (
              <button onClick={() => { navigate('auth'); setMobileOpen(false); }} className="flex items-center gap-2 w-full px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg">
                <User className="w-4 h-4" /> Connexion / Inscription
              </button>
            )}
            {user && (
              <>
                <button onClick={() => { navigate('profile'); setMobileOpen(false); }} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">
                  <User className="w-4 h-4" /> Mon profil
                </button>
                <button onClick={() => { navigate('orders'); setMobileOpen(false); }} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">
                  <Package className="w-4 h-4" /> Mes commandes
                </button>
                <button onClick={handleSignOut} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg">
                  <LogOut className="w-4 h-4" /> Déconnexion
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
