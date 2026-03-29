'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { AnalyticsDashboard } from '@/components/AnalyticsDashboard';
import { CreateFormModal } from '@/components/CreateFormModal';
import { ShareFormModal } from '@/components/ShareFormModal';
import { supabase } from '@/lib/supabase';
import { getUserForms, getFormResponses } from '@/lib/api';

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [forms, setForms] = useState<any[]>([]);
  const [selectedForm, setSelectedForm] = useState<any>(null);
  const [responses, setResponses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  const checkAuth = useCallback(async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      router.push('/login');
      return;
    }

    setUser(session.user);
    loadForms(session.user.id);
  }, [router]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const loadForms = async (userId: string) => {
    try {
      const userForms = await getUserForms(userId);
      setForms(userForms);
      if (userForms.length > 0) {
        setSelectedForm(userForms[0]);
        loadResponses(userForms[0].id);
      }
    } catch (error) {
      console.error('Error loading forms:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadResponses = async (formId: string) => {
    try {
      const formResponses = await getFormResponses(formId);
      setResponses(formResponses);
    } catch (error) {
      console.error('Error loading responses:', error);
    }
  };

  const handleFormSelect = (form: any) => {
    setSelectedForm(form);
    loadResponses(form.id);
  };

  const handleFormCreated = () => {
    if (user) {
      loadForms(user.id);
    }
  };

  const handleDeleteForm = async (formId: string) => {
    if (!confirm('Are you sure you want to delete this form? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('feedback_forms')
        .delete()
        .eq('id', formId);

      if (error) throw error;

      setForms(forms.filter(f => f.id !== formId));
      if (selectedForm?.id === formId) {
        setSelectedForm(forms.length > 1 ? forms.find(f => f.id !== formId) : null);
      }
    } catch (error) {
      console.error('Error deleting form:', error);
      alert('Failed to delete form');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Your Forms</h3>
              <div className="space-y-2">
                {forms.length === 0 ? (
                  <p className="text-gray-600 text-sm">No forms yet. Create your first form to get started!</p>
                ) : (
                  forms.map((form) => (
                    <div
                      key={form.id}
                      className={`p-3 rounded-lg transition cursor-pointer ${
                        selectedForm?.id === form.id
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                      onClick={() => handleFormSelect(form)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{form.title}</p>
                          <p className={`text-xs ${selectedForm?.id === form.id ? 'text-blue-100' : 'text-gray-500'}`}>
                            {form.responses_count || 0} responses
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteForm(form.id);
                          }}
                          className={`ml-2 p-1 rounded hover:bg-red-500 hover:text-white ${
                            selectedForm?.id === form.id ? 'text-white' : 'text-gray-400'
                          }`}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <button
                onClick={() => setShowCreateModal(true)}
                className="w-full mt-6 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-semibold flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                New Form
              </button>
            </div>
          </div>

          <div className="lg:col-span-3">
            {selectedForm ? (
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-2xl font-bold mb-2">{selectedForm.title}</h2>
                      {selectedForm.description && (
                        <p className="text-gray-600">{selectedForm.description}</p>
                      )}
                    </div>
                    <button
                      onClick={() => setShowShareModal(true)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                      </svg>
                      Share
                    </button>
                  </div>
                </div>

                {responses.length > 0 ? (
                  <AnalyticsDashboard responses={responses} />
                ) : (
                  <div className="bg-white rounded-lg shadow p-12 text-center">
                    <div className="max-w-sm mx-auto">
                      <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                      </svg>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No responses yet</h3>
                      <p className="text-gray-600 mb-6">
                        Share your form to start collecting feedback from your customers.
                      </p>
                      <button
                        onClick={() => setShowShareModal(true)}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium"
                      >
                        Share Form
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <div className="max-w-sm mx-auto">
                  <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Create your first feedback form</h3>
                  <p className="text-gray-600 mb-6">
                    Build custom feedback forms and start collecting insights from your customers.
                  </p>
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium"
                  >
                    Create Form
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {showCreateModal && user && (
        <CreateFormModal
          userId={user.id}
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleFormCreated}
        />
      )}

      {showShareModal && selectedForm && (
        <ShareFormModal
          formId={selectedForm.id}
          formTitle={selectedForm.title}
          onClose={() => setShowShareModal(false)}
        />
      )}
    </div>
  );
}
