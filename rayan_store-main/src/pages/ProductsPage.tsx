import { useEffect, useState } from 'react';
import { Search, SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Product, Category } from '../lib/supabase';
import ProductCard from '../components/ProductCard';
import type { Page } from '../App';

interface Props {
  navigate: (page: Page, params?: { slug?: string; category?: string }) => void;
  initialCategory: string | null;
  initialSearch: string;
}

type SortOption = 'relevance' | 'price-asc' | 'price-desc' | 'rating' | 'newest';

export default function ProductsPage({ navigate, initialCategory, initialSearch }: Props) {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(initialSearch || '');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(initialCategory);
  const [sort, setSort] = useState<SortOption>('relevance');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const PER_PAGE = 12;

  useEffect(() => {
    setSelectedCategory(initialCategory);
    setSearch(initialSearch || '');
    setPage(1);
  }, [initialCategory, initialSearch]);

  useEffect(() => {
    supabase.from('categories').select('*').then(({ data }) => setCategories(data || []));
  }, []);

  useEffect(() => {
    async function load() {
      setLoading(true);
      let query = supabase.from('products').select('*').eq('active', true);

      if (selectedCategory) {
        const { data: cat } = await supabase.from('categories').select('id').eq('slug', selectedCategory).maybeSingle();
        if (cat) query = query.eq('category_id', cat.id);
      }
      if (search) {
        query = query.ilike('name', `%${search}%`);
      }
      if (minPrice) query = query.gte('price', parseFloat(minPrice));
      if (maxPrice) query = query.lte('price', parseFloat(maxPrice));

      if (sort === 'price-asc') query = query.order('price', { ascending: true });
      else if (sort === 'price-desc') query = query.order('price', { ascending: false });
      else if (sort === 'rating') query = query.order('rating', { ascending: false });
      else if (sort === 'newest') query = query.order('created_at', { ascending: false });
      else query = query.order('featured', { ascending: false });

      const { data } = await query;
      setProducts(data || []);
      setLoading(false);
    }
    load();
  }, [selectedCategory, search, sort, minPrice, maxPrice]);

  const paginated = products.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const totalPages = Math.ceil(products.length / PER_PAGE);

  const currentCatName = categories.find(c => c.slug === selectedCategory)?.name;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {currentCatName || (search ? `Résultats pour "${search}"` : 'Tous les produits')}
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {loading ? 'Chargement...' : `${products.length} produit${products.length !== 1 ? 's' : ''} trouvé${products.length !== 1 ? 's' : ''}`}
        </p>
      </div>

      <div className="flex gap-6">
        {/* Sidebar filters */}
        <aside className={`${showFilters ? 'block' : 'hidden'} lg:block w-64 flex-shrink-0 space-y-6`}>
          <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-4">
            <h3 className="font-semibold text-gray-900">Catégories</h3>
            <div className="space-y-1">
              <button
                onClick={() => { setSelectedCategory(null); setPage(1); }}
                className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${!selectedCategory ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                Tous les produits
              </button>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => { setSelectedCategory(cat.slug); setPage(1); }}
                  className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${selectedCategory === cat.slug ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-4">
            <h3 className="font-semibold text-gray-900">Prix (€)</h3>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Min"
                value={minPrice}
                onChange={e => { setMinPrice(e.target.value); setPage(1); }}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="number"
                placeholder="Max"
                value={maxPrice}
                onChange={e => { setMaxPrice(e.target.value); setPage(1); }}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {(minPrice || maxPrice) && (
              <button
                onClick={() => { setMinPrice(''); setMaxPrice(''); }}
                className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1"
              >
                <X className="w-3 h-3" /> Effacer le filtre prix
              </button>
            )}
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            {/* Search */}
            <div className="flex-1 min-w-48 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
                placeholder="Rechercher dans les produits..."
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {/* Sort */}
            <div className="relative">
              <select
                value={sort}
                onChange={e => { setSort(e.target.value as SortOption); setPage(1); }}
                className="appearance-none pl-3 pr-8 py-2 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                <option value="relevance">Pertinence</option>
                <option value="price-asc">Prix croissant</option>
                <option value="price-desc">Prix décroissant</option>
                <option value="rating">Meilleures notes</option>
                <option value="newest">Nouveautés</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
            {/* Mobile filter toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden flex items-center gap-1.5 px-3 py-2 text-sm border border-gray-200 rounded-xl bg-white hover:bg-gray-50"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filtres
            </button>
          </div>

          {/* Active filters */}
          {(selectedCategory || search || minPrice || maxPrice) && (
            <div className="flex flex-wrap gap-2 mb-4">
              {selectedCategory && (
                <span className="flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full">
                  {currentCatName}
                  <button onClick={() => setSelectedCategory(null)}><X className="w-3 h-3" /></button>
                </span>
              )}
              {search && (
                <span className="flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full">
                  "{search}"
                  <button onClick={() => setSearch('')}><X className="w-3 h-3" /></button>
                </span>
              )}
            </div>
          )}

          {/* Grid */}
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Array.from({ length: PER_PAGE }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
                  <div className="aspect-square bg-gray-100" />
                  <div className="p-4 space-y-2">
                    <div className="h-3 bg-gray-100 rounded w-16" />
                    <div className="h-4 bg-gray-100 rounded" />
                    <div className="h-6 bg-gray-100 rounded w-1/2 mt-2" />
                  </div>
                </div>
              ))}
            </div>
          ) : paginated.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun produit trouvé</h3>
              <p className="text-gray-500 text-sm">Essayez de modifier vos critères de recherche</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {paginated.map(p => (
                  <ProductCard key={p.id} product={p} navigate={navigate} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-8">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 text-sm border border-gray-200 rounded-xl disabled:opacity-40 hover:bg-gray-50 transition-colors"
                  >
                    Précédent
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-10 h-10 text-sm rounded-xl transition-colors ${p === page ? 'bg-blue-600 text-white' : 'border border-gray-200 hover:bg-gray-50'}`}
                    >
                      {p}
                    </button>
                  ))}
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-4 py-2 text-sm border border-gray-200 rounded-xl disabled:opacity-40 hover:bg-gray-50 transition-colors"
                  >
                    Suivant
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
