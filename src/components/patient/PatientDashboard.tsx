import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase, PatientProfile } from '../../lib/supabase';
import { FileText, Users, Beaker, MessageSquare, Star, LogOut } from 'lucide-react';
import ClinicalTrialsView from './ClinicalTrialsView';
import HealthExpertsView from './HealthExpertsView';
import PublicationsView from './PublicationsView';
import ForumsView from './ForumsView';
import FavoritesView from './FavoritesView';

type View = 'trials' | 'experts' | 'publications' | 'forums' | 'favorites';

export default function PatientDashboard() {
  const { profile, signOut } = useAuth();
  const [currentView, setCurrentView] = useState<View>('trials');
  const [patientProfile, setPatientProfile] = useState<PatientProfile | null>(null);

  useEffect(() => {
    const fetchPatientProfile = async () => {
      if (!profile) return;

      const { data } = await supabase
        .from('patient_profiles')
        .select('*')
        .eq('user_id', profile.id)
        .maybeSingle();

      if (data) {
        setPatientProfile(data);
      }
    };

    fetchPatientProfile();
  }, [profile]);

  const menuItems = [
    { id: 'trials' as View, icon: Beaker, label: 'Clinical Trials' },
    { id: 'experts' as View, icon: Users, label: 'Health Experts' },
    { id: 'publications' as View, icon: FileText, label: 'Publications' },
    { id: 'forums' as View, icon: MessageSquare, label: 'Forums' },
    { id: 'favorites' as View, icon: Star, label: 'Favorites' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="bg-blue-600 p-2 rounded-lg mr-3">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">CuraLink</h1>
                <p className="text-xs text-gray-500">Patient Dashboard</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {profile?.full_name || 'Patient'}
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
        {patientProfile && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              Your Conditions
            </h2>
            <div className="flex flex-wrap gap-2">
              {patientProfile.conditions.map((condition) => (
                <span
                  key={condition}
                  className="bg-blue-100 text-blue-800 px-3 py-1.5 rounded-full text-sm"
                >
                  {condition}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-5 gap-4 mb-6">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={`p-4 rounded-lg text-center transition-all ${
                currentView === item.id
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-50 shadow-sm'
              }`}
            >
              <item.icon
                className={`w-6 h-6 mx-auto mb-2 ${
                  currentView === item.id ? 'text-white' : 'text-blue-600'
                }`}
              />
              <span className="text-sm font-medium">{item.label}</span>
            </button>
          ))}
        </div>

        <div className="bg-white rounded-lg shadow-sm">
          {currentView === 'trials' && (
            <ClinicalTrialsView conditions={patientProfile?.conditions || []} />
          )}
          {currentView === 'experts' && (
            <HealthExpertsView conditions={patientProfile?.conditions || []} />
          )}
          {currentView === 'publications' && (
            <PublicationsView conditions={patientProfile?.conditions || []} />
          )}
          {currentView === 'forums' && <ForumsView />}
          {currentView === 'favorites' && <FavoritesView />}
        </div>
      </div>
    </div>
  );
}
