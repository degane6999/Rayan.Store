import { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Save, AlertCircle, Check, LogOut, ShoppingBag } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import type { Page } from '../App';

interface Props {
  navigate: (page: Page) => void;
}

export default function ProfilePage({ navigate }: Props) {
  const { user, profile, updateProfile, signOut, loading } = useAuth();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    full_name: '',
    phone: '',
    address: '',
    city: '',
    postal_code: '',
    country: 'France',
    avatar_url: '',
  });

  useEffect(() => {
    if (profile) {
      setForm({
        full_name: profile.full_name || '',
        phone: (profile as Record<string, unknown>).phone as string || '',
        address: (profile as Record<string, unknown>).address as string || '',
        city: (profile as Record<string, unknown>).city as string || '',
        postal_code: (profile as Record<string, unknown>).postal_code as string || '',
        country: (profile as Record<string, unknown>).country as string || 'France',
        avatar_url: profile.avatar_url || '',
      });
    }
  }, [profile]);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-gray-100 rounded-2xl" />
          <div className="h-64 bg-gray-100 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <AlertCircle className="w-12 h-12 text-orange-400 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Connexion requise</h2>
        <p className="text-gray-500 text-sm mb-6">Vous devez être connecté pour accéder à votre profil.</p>
        <button onClick={() => navigate('auth')} className="px-6 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors">
          Se connecter
        </button>
      </div>
    );
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await updateProfile(form as Parameters<typeof updateProfile>[0]);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: unknown) {
      setError((err as Error).message || 'Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  }

  async function handleSignOut() {
    await signOut();
    navigate('home');
  }

  const initials = form.full_name
    ? form.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : user.email?.[0].toUpperCase() || 'U';

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Mon profil</h1>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-red-600 border border-gray-200 hover:border-red-200 hover:bg-red-50 rounded-xl transition-all"
        >
          <LogOut className="w-4 h-4" />
          Déconnexion
        </button>
      </div>

      {/* Avatar + account info */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 flex items-center gap-5">
        <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
          {form.avatar_url ? (
            <img src={form.avatar_url} alt="" className="w-full h-full object-cover rounded-2xl" />
          ) : initials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-lg font-bold text-gray-900">{form.full_name || 'Utilisateur'}</p>
          <p className="text-sm text-gray-500">{user.email}</p>
          <p className="text-xs text-gray-400 mt-1">
            Membre depuis {new Date(user.created_at).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
          </p>
        </div>
        <button
          onClick={() => navigate('orders')}
          className="flex items-center gap-2 px-4 py-2 text-sm text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors"
        >
          <ShoppingBag className="w-4 h-4" />
          Mes commandes
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSave} className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
        <h2 className="font-bold text-gray-900">Informations personnelles</h2>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-gray-700 mb-1">Nom complet</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                value={form.full_name}
                onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
                className="w-full pl-10 pr-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Jean Dupont"
              />
            </div>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                value={user.email || ''}
                disabled
                className="w-full pl-10 pr-3 py-2.5 text-sm border border-gray-100 rounded-xl bg-gray-50 text-gray-400 cursor-not-allowed"
              />
            </div>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-gray-700 mb-1">Téléphone</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                className="w-full pl-10 pr-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="+33 6 12 34 56 78"
              />
            </div>
          </div>
        </div>

        <hr className="border-gray-100" />
        <h2 className="font-bold text-gray-900">Adresse par défaut</h2>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-gray-700 mb-1">Adresse</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                value={form.address}
                onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                className="w-full pl-10 pr-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="12 rue de la Paix"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Code postal</label>
            <input
              value={form.postal_code}
              onChange={e => setForm(f => ({ ...f, postal_code: e.target.value }))}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="75001"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Ville</label>
            <input
              value={form.city}
              onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Paris"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-gray-700 mb-1">Pays</label>
            <input
              value={form.country}
              onChange={e => setForm(f => ({ ...f, country: e.target.value }))}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="France"
            />
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 px-3 py-2.5 rounded-xl">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={saving}
          className={`w-full flex items-center justify-center gap-2 py-3 font-semibold rounded-xl transition-all ${
            saved ? 'bg-green-500 text-white' : 'bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white'
          }`}
        >
          {saved ? (
            <><Check className="w-5 h-5" /> Profil sauvegardé</>
          ) : (
            <><Save className="w-5 h-5" /> {saving ? 'Sauvegarde...' : 'Sauvegarder les modifications'}</>
          )}
        </button>
      </form>
    </div>
  );
}
