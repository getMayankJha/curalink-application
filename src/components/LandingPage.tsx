import { useState } from 'react';
import { Heart, Users } from 'lucide-react';
import AuthModal from './AuthModal';

export default function LandingPage() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'patient' | 'researcher' | null>(null);

  const handleRoleSelect = (role: 'patient' | 'researcher') => {
    setSelectedRole(role);
    setShowAuthModal(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <div className="flex justify-center mb-8">
            <div className="bg-blue-600 p-4 rounded-2xl">
              <Heart className="w-12 h-12 text-white" />
            </div>
          </div>

          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Welcome to CuraLink
          </h1>

          <p className="text-xl text-gray-600 mb-12 leading-relaxed">
            Connecting patients and researchers to discover clinical trials,
            medical publications, and health experts. Your journey to better
            health outcomes starts here.
          </p>

          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto mt-16">
            <button
              onClick={() => handleRoleSelect('patient')}
              className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-blue-500"
            >
              <div className="bg-blue-100 w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-500 transition-colors">
                <Heart className="w-8 h-8 text-blue-600 group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-3">
                I am a Patient or Caregiver
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Find clinical trials, connect with health experts, and discover
                relevant medical research for your condition
              </p>
            </button>

            <button
              onClick={() => handleRoleSelect('researcher')}
              className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-green-500"
            >
              <div className="bg-green-100 w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-6 group-hover:bg-green-500 transition-colors">
                <Users className="w-8 h-8 text-green-600 group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-3">
                I am a Researcher
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Manage clinical trials, collaborate with peers, and engage
                with patients seeking medical expertise
              </p>
            </button>
          </div>

          <div className="mt-16 text-sm text-gray-500">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </div>
        </div>
      </div>

      {showAuthModal && selectedRole && (
        <AuthModal
          role={selectedRole}
          onClose={() => {
            setShowAuthModal(false);
            setSelectedRole(null);
          }}
        />
      )}
    </div>
  );
}
