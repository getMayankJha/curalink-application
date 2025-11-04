import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase, ResearcherProfile } from '../../lib/supabase';
import { Beaker, Users, MessageSquare, Star, LogOut, FileText } from 'lucide-react';
import TrialsManagementView from './TrialsManagementView';
import CollaboratorsView from './CollaboratorsView';
import ResearcherForumsView from './ResearcherForumsView';
import ResearcherFavoritesView from './ResearcherFavoritesView';

type View = 'trials' | 'collaborators' | 'forums' | 'favorites';

export default function ResearcherDashboard() {
  const { profile, signOut } = useAuth();
  const [currentView, setCurrentView] = useState<View>('trials');
  const [researcherProfile, setResearcherProfile] = useState<ResearcherProfile | null>(null);

  useEffect(() => {
    const fetchResearcherProfile = async () => {
      if (!profile) return;

      const { data } = await supabase
        .from('researcher_profiles')
        .select('*')
        .eq('user_id', profile.id)
        .maybeSingle();

      if (data) {
        setResearcherProfile(data);
      }
    };

    fetchResearcherProfile();
  }, [profile]);

  const menuItems = [
    { id: 'trials' as View, icon: Beaker, label: 'Clinical Trials' },
    { id: 'collaborators' as View, icon: Users, label: 'Collaborators' },
    { id: 'forums' as View, icon: MessageSquare, label: 'Forums' },
    { id: 'favorites' as View, icon: Star, label: 'Favorites' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="bg-green-600 p-2 rounded-lg mr-3">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">CuraLink</h1>
                <p className="text-xs text-gray-500">Researcher Dashboard</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {profile?.full_name || 'Researcher'}
                </p>
                <p className="text-xs text-gray-500">{profile?.location}</p>
              </div>
              <button
                onClick={signOut}
                className="text-gray-600 hover:text-gray-900 p-2"
                title="Sign Out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {researcherProfile && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              Your Profile
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 mb-2">Specialties:</p>
                <div className="flex flex-wrap gap-2">
                  {researcherProfile.specialties.map((specialty) => (
                    <span
                      key={specialty}
                      className="bg-green-100 text-green-800 px-3 py-1.5 rounded-full text-sm"
                    >
                      {specialty}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-2">Research Interests:</p>
                <div className="flex flex-wrap gap-2">
                  {researcherProfile.research_interests.map((interest) => (
                    <span
                      key={interest}
                      className="bg-blue-100 text-blue-800 px-3 py-1.5 rounded-full text-sm"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-4 gap-4 mb-6">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={`p-4 rounded-lg text-center transition-all ${
                currentView === item.id
                  ? 'bg-green-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-50 shadow-sm'
              }`}
            >
              <item.icon
                className={`w-6 h-6 mx-auto mb-2 ${
                  currentView === item.id ? 'text-white' : 'text-green-600'
                }`}
              />
              <span className="text-sm font-medium">{item.label}</span>
            </button>
          ))}
        </div>

        <div className="bg-white rounded-lg shadow-sm">
          {currentView === 'trials' && <TrialsManagementView />}
          {currentView === 'collaborators' && <CollaboratorsView />}
          {currentView === 'forums' && <ResearcherForumsView />}
          {currentView === 'favorites' && <ResearcherFavoritesView />}
        </div>
      </div>
    </div>
  );
}
