import { useState, useEffect } from 'react';
import { Search, Star, ExternalLink } from 'lucide-react';
import { supabase, Publication } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

type PublicationsViewProps = {
  conditions: string[];
};

export default function PublicationsView({ conditions }: PublicationsViewProps) {
  const { profile } = useAuth();
  const [publications, setPublications] = useState<Publication[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchPublications();
    fetchFavorites();
  }, []);

  const fetchPublications = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('publications')
      .select('*')
      .order('publication_date', { ascending: false });

    if (data) {
      setPublications(data);
    }
    setLoading(false);
  };

  const fetchFavorites = async () => {
    if (!profile) return;

    const { data } = await supabase
      .from('favorites')
      .select('item_id')
      .eq('user_id', profile.id)
      .eq('item_type', 'publication');

    if (data) {
      setFavorites(new Set(data.map((f) => f.item_id)));
    }
  };

  const toggleFavorite = async (publicationId: string) => {
    if (!profile) return;

    if (favorites.has(publicationId)) {
      await supabase
        .from('favorites')
        .delete()
        .eq('user_id', profile.id)
        .eq('item_id', publicationId)
        .eq('item_type', 'publication');
      setFavorites((prev) => {
        const next = new Set(prev);
        next.delete(publicationId);
        return next;
      });
    } else {
      await supabase.from('favorites').insert({
        user_id: profile.id,
        item_type: 'publication',
        item_id: publicationId,
      });
      setFavorites((prev) => new Set(prev).add(publicationId));
    }
  };

  const filteredPublications = publications.filter((pub) => {
    if (!searchQuery) return true;

    const query = searchQuery.toLowerCase();
    return (
      pub.title.toLowerCase().includes(query) ||
      pub.abstract?.toLowerCase().includes(query) ||
      pub.keywords?.some((k) => k.toLowerCase().includes(query))
    );
  });

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-gray-600 mt-4">Loading publications...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Publications</h2>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search publications by title, keywords, or abstract..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {filteredPublications.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600">
            No publications found. Try adjusting your search criteria.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPublications.map((publication) => (
            <div
              key={publication.id}
              className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {publication.title}
                  </h3>
                  {publication.authors && publication.authors.length > 0 && (
                    <p className="text-sm text-gray-600 mb-2">
                      {publication.authors.join(', ')}
                    </p>
                  )}
                  {publication.journal && (
                    <p className="text-sm text-gray-500 mb-2">
                      {publication.journal}
                      {publication.publication_date && (
                        <span>
                          {' '}
                          • {new Date(publication.publication_date).getFullYear()}
                        </span>
                      )}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => toggleFavorite(publication.id)}
                  className={`p-2 rounded-lg transition-colors ${
                    favorites.has(publication.id)
                      ? 'bg-yellow-100 text-yellow-600'
                      : 'bg-gray-100 text-gray-400 hover:text-yellow-600'
                  }`}
                >
                  <Star
                    className={`w-5 h-5 ${
                      favorites.has(publication.id) ? 'fill-current' : ''
                    }`}
                  />
                </button>
              </div>

              {publication.summary && (
                <div className="mb-3 bg-blue-50 p-4 rounded-lg">
                  <p className="text-xs text-blue-800 font-medium mb-1">
                    AI Summary
                  </p>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {publication.summary}
                  </p>
                </div>
              )}

              {publication.abstract && (
                <p className="text-sm text-gray-700 mb-3 line-clamp-3">
                  {publication.abstract}
                </p>
              )}

              {publication.keywords && publication.keywords.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs text-gray-500 mb-2">Keywords:</p>
                  <div className="flex flex-wrap gap-2">
                    {publication.keywords.map((keyword) => (
                      <span
                        key={keyword}
                        className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3 mt-4">
                {publication.url && (
                  <a
                    href={publication.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Read Full Paper
                  </a>
                )}
                {publication.doi && (
                  <span className="text-gray-500 text-sm">
                    DOI: {publication.doi}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
