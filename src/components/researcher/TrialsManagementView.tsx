import { useState, useEffect } from 'react';
import { Plus, Edit, MapPin } from 'lucide-react';
import { supabase, ClinicalTrial } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

export default function TrialsManagementView() {
  const { profile } = useAuth();
  const [trials, setTrials] = useState<ClinicalTrial[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingTrial, setEditingTrial] = useState<ClinicalTrial | null>(null);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    summary: '',
    phase: '',
    status: 'recruiting',
    location: '',
    contact_email: '',
    eligibility: '',
    nct_id: '',
    conditions: [] as string[],
  });
  const [conditionInput, setConditionInput] = useState('');

  useEffect(() => {
    fetchTrials();
  }, [profile]);

  const fetchTrials = async () => {
    if (!profile) return;

    setLoading(true);
    const { data } = await supabase
      .from('clinical_trials')
      .select('*')
      .eq('created_by', profile.id)
      .order('created_at', { ascending: false });

    if (data) {
      setTrials(data);
    }
    setLoading(false);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      summary: '',
      phase: '',
      status: 'recruiting',
      location: '',
      contact_email: '',
      eligibility: '',
      nct_id: '',
      conditions: [],
    });
    setConditionInput('');
    setEditingTrial(null);
    setShowForm(false);
  };

  const addCondition = () => {
    if (conditionInput.trim() && !formData.conditions.includes(conditionInput.trim())) {
      setFormData({
        ...formData,
        conditions: [...formData.conditions, conditionInput.trim()],
      });
      setConditionInput('');
    }
  };

  const removeCondition = (condition: string) => {
    setFormData({
      ...formData,
      conditions: formData.conditions.filter((c) => c !== condition),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    if (editingTrial) {
      await supabase
        .from('clinical_trials')
        .update({
          ...formData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', editingTrial.id);
    } else {
      await supabase.from('clinical_trials').insert({
        ...formData,
        created_by: profile.id,
      });
    }

    resetForm();
    fetchTrials();
  };

  const editTrial = (trial: ClinicalTrial) => {
    setFormData({
      title: trial.title,
      description: trial.description || '',
      summary: trial.summary || '',
      phase: trial.phase || '',
      status: trial.status || 'recruiting',
      location: trial.location || '',
      contact_email: trial.contact_email || '',
      eligibility: trial.eligibility || '',
      nct_id: trial.nct_id || '',
      conditions: trial.conditions || [],
    });
    setEditingTrial(trial);
    setShowForm(true);
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
        <p className="text-gray-600 mt-4">Loading clinical trials...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Manage Clinical Trials</h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Trial
        </button>
      </div>

      {trials.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600">
            No clinical trials yet. Add your first trial!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {trials.map((trial) => (
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
                  onClick={() => editTrial(trial)}
                  className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                >
                  <Edit className="w-5 h-5" />
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
                <p className="text-sm text-gray-700 mb-3">{trial.summary}</p>
              )}

              {trial.conditions && trial.conditions.length > 0 && (
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
              )}
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-8 my-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              {editingTrial ? 'Edit Clinical Trial' : 'Add New Clinical Trial'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Trial Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    NCT ID
                  </label>
                  <input
                    type="text"
                    value={formData.nct_id}
                    onChange={(e) =>
                      setFormData({ ...formData, nct_id: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.contact_email}
                    onChange={(e) =>
                      setFormData({ ...formData, contact_email: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phase
                  </label>
                  <input
                    type="text"
                    value={formData.phase}
                    onChange={(e) =>
                      setFormData({ ...formData, phase: e.target.value })
                    }
                    placeholder="e.g., Phase 2, Phase 3"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status *
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="recruiting">Recruiting</option>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                    placeholder="e.g., Boston, MA, USA"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Conditions
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={conditionInput}
                      onChange={(e) => setConditionInput(e.target.value)}
                      onKeyPress={(e) =>
                        e.key === 'Enter' && (e.preventDefault(), addCondition())
                      }
                      placeholder="Add condition"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={addCondition}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.conditions.map((condition) => (
                      <span
                        key={condition}
                        className="bg-green-100 text-green-800 px-3 py-1.5 rounded-full text-sm flex items-center gap-2"
                      >
                        {condition}
                        <button
                          type="button"
                          onClick={() => removeCondition(condition)}
                          className="hover:text-green-900"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Summary
                  </label>
                  <textarea
                    value={formData.summary}
                    onChange={(e) =>
                      setFormData({ ...formData, summary: e.target.value })
                    }
                    rows={2}
                    placeholder="Brief summary for easy reading"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Eligibility Criteria
                  </label>
                  <textarea
                    value={formData.eligibility}
                    onChange={(e) =>
                      setFormData({ ...formData, eligibility: e.target.value })
                    }
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  {editingTrial ? 'Update Trial' : 'Add Trial'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
