import { useState, useEffect } from 'react';
import { Star, Trash2 } from 'lucide-react';
import { supabase, Favorite, ClinicalTrial, Publication, Profile } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

type FavoriteWithItem = Favorite & {
  trial?: ClinicalTrial;
  publication?: Publication;
  expert?: Profile;
};

export default function FavoritesView() {
  const { profile } = useAuth();
  const [favorites, setFavorites] = useState<FavoriteWithItem[]>([]);
  const [filter, setFilter] = useState<'all' | 'trial' | 'publication' | 'expert'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFavorites();
  }, [profile]);

  const fetchFavorites = async () => {
    if (!profile) return;

    setLoading(true);
    const { data } = await supabase
      .from('favorites')
      .select('*')
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false });

    if (data) {
      const enrichedFavorites = await Promise.all(
        data.map(async (fav) => {
          if (fav.item_type === 'trial') {
            const { data: trial } = await supabase
              .from('clinical_trials')
              .select('*')
              .eq('id', fav.item_id)
              .maybeSingle();
            return { ...fav, trial: trial || undefined };
          } else if (fav.item_type === 'publication') {
            const { data: pub } = await supabase
              .from('publications')
              .select('*')
              .eq('id', fav.item_id)
              .maybeSingle();
            return { ...fav, publication: pub || undefined };
          } else if (fav.item_type === 'expert') {
            const { data: expert } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', fav.item_id)
              .maybeSingle();
            return { ...fav, expert: expert || undefined };
          }
          return fav;
        })
      );

      setFavorites(enrichedFavorites);
    }
    setLoading(false);
  };

  const removeFavorite = async (favoriteId: string) => {
    await supabase.from('favorites').delete().eq('id', favoriteId);
    setFavorites(favorites.filter((f) => f.id !== favoriteId));
  };

  const filteredFavorites = favorites.filter(
    (fav) => filter === 'all' || fav.item_type === filter
  );

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-gray-600 mt-4">Loading favorites...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">My Favorites</h2>

        <div className="flex gap-2">
          {[
            { value: 'all', label: 'All' },
            { value: 'trial', label: 'Clinical Trials' },
            { value: 'publication', label: 'Publications' },
            { value: 'expert', label: 'Health Experts' },
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => setFilter(option.value as typeof filter)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === option.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {filteredFavorites.length === 0 ? (
        <div className="text-center py-12">
          <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600">
            No favorites yet. Start adding items to your favorites!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredFavorites.map((favorite) => (
            <div
              key={favorite.id}
              className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  {favorite.item_type === 'trial' && favorite.trial && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                          Clinical Trial
                        </span>
                        {favorite.trial.status && (
                          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                            {favorite.trial.status}
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {favorite.trial.title}
                      </h3>
                      {favorite.trial.summary && (
                        <p className="text-sm text-gray-700">
                          {favorite.trial.summary}
                        </p>
                      )}
                    </div>
                  )}

                  {favorite.item_type === 'publication' && favorite.publication && (
                    <div>
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded mb-2 inline-block">
                        Publication
                      </span>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {favorite.publication.title}
                      </h3>
                      {favorite.publication.journal && (
                        <p className="text-sm text-gray-600 mb-2">
                          {favorite.publication.journal}
                        </p>
                      )}
                      {favorite.publication.summary && (
                        <p className="text-sm text-gray-700">
                          {favorite.publication.summary}
                        </p>
                      )}
                    </div>
                  )}

                  {favorite.item_type === 'expert' && favorite.expert && (
                    <div>
                      <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded mb-2 inline-block">
                        Health Expert
                      </span>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {favorite.expert.full_name || 'Anonymous Researcher'}
                      </h3>
                      {favorite.expert.location && (
                        <p className="text-sm text-gray-600">
                          {favorite.expert.location}
                        </p>
                      )}
                    </div>
                  )}

                  <p className="text-xs text-gray-500 mt-2">
                    Saved on {new Date(favorite.created_at).toLocaleDateString()}
                  </p>
                </div>

                <button
                  onClick={() => removeFavorite(favorite.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Remove from favorites"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
