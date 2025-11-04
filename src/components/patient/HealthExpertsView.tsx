import { useState, useEffect } from 'react';
import { Search, MapPin, Star, Mail } from 'lucide-react';
import { supabase, Profile, ResearcherProfile } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

type HealthExpertsViewProps = {
  conditions: string[];
};

type ExpertProfile = Profile & {
  researcher_profiles: ResearcherProfile;
};

export default function HealthExpertsView({ conditions }: HealthExpertsViewProps) {
  const { profile } = useAuth();
  const [experts, setExperts] = useState<ExpertProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [showMeetingModal, setShowMeetingModal] = useState(false);
  const [selectedExpert, setSelectedExpert] = useState<ExpertProfile | null>(null);
  const [meetingMessage, setMeetingMessage] = useState('');

  useEffect(() => {
    fetchExperts();
    fetchFavorites();
  }, []);

  const fetchExperts = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('profiles')
      .select('*, researcher_profiles(*)')
      .eq('role', 'researcher')
      .not('researcher_profiles', 'is', null);

    if (data) {
      setExperts(data as ExpertProfile[]);
    }
    setLoading(false);
  };

  const fetchFavorites = async () => {
    if (!profile) return;

    const { data } = await supabase
      .from('favorites')
      .select('item_id')
      .eq('user_id', profile.id)
      .eq('item_type', 'expert');

    if (data) {
      setFavorites(new Set(data.map((f) => f.item_id)));
    }
  };

  const toggleFavorite = async (expertId: string) => {
    if (!profile) return;

    if (favorites.has(expertId)) {
      await supabase
        .from('favorites')
        .delete()
        .eq('user_id', profile.id)
        .eq('item_id', expertId)
        .eq('item_type', 'expert');
      setFavorites((prev) => {
        const next = new Set(prev);
        next.delete(expertId);
        return next;
      });
    } else {
      await supabase.from('favorites').insert({
        user_id: profile.id,
        item_type: 'expert',
        item_id: expertId,
      });
      setFavorites((prev) => new Set(prev).add(expertId));
    }
  };

  const requestMeeting = async () => {
    if (!profile || !selectedExpert) return;

    await supabase.from('meeting_requests').insert({
      requester_id: profile.id,
      researcher_id: selectedExpert.id,
      message: meetingMessage,
      status: 'pending',
    });

    setShowMeetingModal(false);
    setMeetingMessage('');
    setSelectedExpert(null);
    alert('Meeting request sent successfully!');
  };

  const filteredExperts = experts.filter((expert) => {
    if (!searchQuery) return true;

    const query = searchQuery.toLowerCase();
    return (
      expert.full_name?.toLowerCase().includes(query) ||
      expert.researcher_profiles?.specialties?.some((s) =>
        s.toLowerCase().includes(query)
      ) ||
      expert.researcher_profiles?.research_interests?.some((i) =>
        i.toLowerCase().includes(query)
      )
    );
  });

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-gray-600 mt-4">Loading health experts...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Health Experts</h2>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, specialty, or research interest..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {filteredExperts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600">No health experts found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredExperts.map((expert) => (
            <div
              key={expert.id}
              className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {expert.full_name || 'Anonymous Researcher'}
                  </h3>
                  {expert.location && (
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {expert.location}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => toggleFavorite(expert.id)}
                  className={`p-2 rounded-lg transition-colors ${
                    favorites.has(expert.id)
                      ? 'bg-yellow-100 text-yellow-600'
                      : 'bg-gray-100 text-gray-400 hover:text-yellow-600'
                  }`}
                >
                  <Star
                    className={`w-5 h-5 ${
                      favorites.has(expert.id) ? 'fill-current' : ''
                    }`}
                  />
                </button>
              </div>

              {expert.researcher_profiles?.specialties && (
                <div className="mb-3">
                  <p className="text-xs text-gray-500 mb-2">Specialties:</p>
                  <div className="flex flex-wrap gap-2">
                    {expert.researcher_profiles.specialties.map((specialty) => (
                      <span
                        key={specialty}
                        className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                      >
                        {specialty}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {expert.researcher_profiles?.research_interests && (
                <div className="mb-3">
                  <p className="text-xs text-gray-500 mb-2">Research Interests:</p>
                  <div className="flex flex-wrap gap-2">
                    {expert.researcher_profiles.research_interests.map(
                      (interest) => (
                        <span
                          key={interest}
                          className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full"
                        >
                          {interest}
                        </span>
                      )
                    )}
                  </div>
                </div>
              )}

              {expert.researcher_profiles?.bio && (
                <p className="text-sm text-gray-700 mb-4 line-clamp-3">
                  {expert.researcher_profiles.bio}
                </p>
              )}

              {expert.researcher_profiles?.available_for_meetings && (
                <button
                  onClick={() => {
                    setSelectedExpert(expert);
                    setShowMeetingModal(true);
                  }}
                  className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Mail className="w-4 h-4" />
                  Request Meeting
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {showMeetingModal && selectedExpert && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Request Meeting with {selectedExpert.full_name}
            </h3>

            <textarea
              value={meetingMessage}
              onChange={(e) => setMeetingMessage(e.target.value)}
              rows={4}
              placeholder="Please introduce yourself and explain why you'd like to meet..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
            />

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowMeetingModal(false);
                  setMeetingMessage('');
                  setSelectedExpert(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={requestMeeting}
                disabled={!meetingMessage.trim()}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Send Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
