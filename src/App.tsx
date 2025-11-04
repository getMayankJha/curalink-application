import { useEffect, useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LandingPage from './components/LandingPage';
import PatientOnboarding from './components/PatientOnboarding';
import ResearcherOnboarding from './components/ResearcherOnboarding';
import PatientDashboard from './components/patient/PatientDashboard';
import ResearcherDashboard from './components/researcher/ResearcherDashboard';
import { supabase } from './lib/supabase';

function AppContent() {
  const { user, profile, loading } = useAuth();
  const [hasProfile, setHasProfile] = useState(false);

  useEffect(() => {
    const checkProfile = async () => {
      if (!user || !profile) return;

      if (profile.role === 'patient') {
        const { data } = await supabase
          .from('patient_profiles')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle();
        setHasProfile(!!data);
      } else if (profile.role === 'researcher') {
        const { data } = await supabase
          .from('researcher_profiles')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle();
        setHasProfile(!!data);
      }
    };

    checkProfile();
  }, [user, profile]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user || !profile) {
    return <LandingPage />;
  }

  if (!hasProfile) {
    if (profile.role === 'patient') {
      return <PatientOnboarding />;
    } else {
      return <ResearcherOnboarding />;
    }
  }

  if (profile.role === 'patient') {
    return <PatientDashboard />;
  } else {
    return <ResearcherDashboard />;
  }
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
