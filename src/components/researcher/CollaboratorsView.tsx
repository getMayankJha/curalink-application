import { useState, useEffect } from 'react';
import { Search, UserPlus, MapPin } from 'lucide-react';
import { supabase, Profile, ResearcherProfile } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

type CollaboratorProfile = Profile & {
  researcher_profiles: ResearcherProfile;
};

export default function CollaboratorsView() {
  const { profile } = useAuth();
  const [collaborators, setCollaborators] = useState<CollaboratorProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCollaborators();
  }, []);

  const fetchCollaborators = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('profiles')
      .select('*, researcher_profiles(*)')
      .eq('role', 'researcher')
      .not('researcher_profiles', 'is', null)
      .neq('id', profile?.id || '');

    if (data) {
      setCollaborators(data as CollaboratorProfile[]);
    }
    setLoading(false);
  };

  const sendConnectionRequest = async (recipientId: string) => {
    if (!profile) return;

    await supabase.from('connections').insert({
      requester_id: profile.id,
      recipient_id: recipientId,
      status: 'pending',
    });

    alert('Connection request sent!');
  };

  const filteredCollaborators = collaborators.filter((collab) => {
    if (!searchQuery) return true;

    const query = searchQuery.toLowerCase();
    return (
      collab.full_name?.toLowerCase().includes(query) ||
      collab.researcher_profiles?.specialties?.some((s) =>
        s.toLowerCase().includes(query)
      ) ||
      collab.researcher_profiles?.research_interests?.some((i) =>
        i.toLowerCase().includes(query)
      )
    );
  });

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
        <p className="text-gray-600 mt-4">Loading collaborators...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Find Collaborators
        </h2>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, specialty, or research interest..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredCollaborators.map((collab) => (
          <div
            key={collab.id}
            className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
          >
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                {collab.full_name || 'Anonymous Researcher'}
              </h3>
              {collab.location && (
                <p className="text-sm text-gray-500 flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {collab.location}
                </p>
              )}
            </div>

            {collab.researcher_profiles?.specialties && (
              <div className="mb-3">
                <p className="text-xs text-gray-500 mb-2">Specialties:</p>
                <div className="flex flex-wrap gap-2">
                  {collab.researcher_profiles.specialties.map((specialty) => (
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

            {collab.researcher_profiles?.research_interests && (
              <div className="mb-4">
                <p className="text-xs text-gray-500 mb-2">Research Interests:</p>
                <div className="flex flex-wrap gap-2">
                  {collab.researcher_profiles.research_interests.map((interest) => (
                    <span
                      key={interest}
                      className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={() => sendConnectionRequest(collab.id)}
              className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              Connect
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
