import { useState, useEffect } from 'react';
import { Search, MapPin, Star } from 'lucide-react';
import { supabase, ClinicalTrial } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

type ClinicalTrialsViewProps = {
  conditions: string[];
};

export default function ClinicalTrialsView({ conditions }: ClinicalTrialsViewProps) {
  const { profile } = useAuth();
  const [trials, setTrials] = useState<ClinicalTrial[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchTrials();
    fetchFavorites();
  }, [conditions]);

  const fetchTrials = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('clinical_trials')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) {
      setTrials(data);
    }
    setLoading(false);
  };

  const fetchFavorites = async () => {
    if (!profile) return;

    const { data } = await supabase
      .from('favorites')
      .select('item_id')
      .eq('user_id', profile.id)
      .eq('item_type', 'trial');

    if (data) {
      setFavorites(new Set(data.map((f) => f.item_id)));
    }
  };

  const toggleFavorite = async (trialId: string) => {
    if (!profile) return;

    if (favorites.has(trialId)) {
      await supabase
        .from('favorites')
        .delete()
        .eq('user_id', profile.id)
        .eq('item_id', trialId)
        .eq('item_type', 'trial');
      setFavorites((prev) => {
        const next = new Set(prev);
        next.delete(trialId);
        return next;
      });
    } else {
      await supabase.from('favorites').insert({
        user_id: profile.id,
        item_type: 'trial',
        item_id: trialId,
      });
      setFavorites((prev) => new Set(prev).add(trialId));
    }
  };

  const filteredTrials = trials.filter((trial) => {
    const matchesSearch =
      !searchQuery ||
      trial.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trial.description?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' ||
      trial.status?.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-gray-600 mt-4">Loading clinical trials...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Clinical Trials
        </h2>

        <div className="flex gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search clinical trials..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Statuses</option>
            <option value="recruiting">Recruiting</option>
            <option value="completed">Completed</option>
            <option value="active">Active</option>
          </select>
        </div>
      </div>

      {filteredTrials.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600">
            No clinical trials found. Try adjusting your search criteria.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTrials.map((trial) => (
            <div
              key={trial.id}
              className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {trial.title}
                  </h3>
                  {trial.nct_id && (
                    <p className="text-sm text-gray-500 mb-2">
                      NCT ID: {trial.nct_id}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => toggleFavorite(trial.id)}
                  className={`p-2 rounded-lg transition-colors ${
                    favorites.has(trial.id)
                      ? 'bg-yellow-100 text-yellow-600'
                      : 'bg-gray-100 text-gray-400 hover:text-yellow-600'
                  }`}
                >
                  <Star
                    className={`w-5 h-5 ${
                      favorites.has(trial.id) ? 'fill-current' : ''
                    }`}
                  />
                </button>
              </div>

              <div className="flex flex-wrap gap-2 mb-3">
                {trial.phase && (
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                    {trial.phase}
                  </span>
                )}
                {trial.status && (
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                    {trial.status}
                  </span>
                )}
                {trial.location && (
                  <span className="text-gray-600 text-xs flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {trial.location}
                  </span>
                )}
              </div>

              {trial.summary && (
                <p className="text-gray-700 mb-3 text-sm leading-relaxed">
                  {trial.summary}
                </p>
              )}

              {trial.conditions && trial.conditions.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs text-gray-500 mb-1">Conditions:</p>
                  <div className="flex flex-wrap gap-1">
                    {trial.conditions.map((condition) => (
                      <span
                        key={condition}
                        className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded"
                      >
                        {condition}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {trial.contact_email && (
                <a
                  href={`mailto:${trial.contact_email}`}
                  className="inline-block mt-3 text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  Contact for more information
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
