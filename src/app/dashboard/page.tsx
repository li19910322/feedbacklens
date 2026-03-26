'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { AnalyticsDashboard } from '@/components/AnalyticsDashboard';
import { supabase } from '@/lib/supabase';
import { getUserForms, getFormResponses } from '@/lib/api';

export default function Dashboard() {
  const router = useRouter();
  const [forms, setForms] = useState<any[]>([]);
  const [selectedForm, setSelectedForm] = useState<any>(null);
  const [responses, setResponses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.push('/login');
        return;
      }

      loadForms(session.user.id);
    };

    checkAuth();
  }, [router]);

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
                  <p className="text-gray-600 text-sm">No forms yet</p>
                ) : (
                  forms.map((form) => (
                    <button
                      key={form.id}
                      onClick={() => handleFormSelect(form)}
                      className={`w-full text-left px-4 py-2 rounded-lg transition ${
                        selectedForm?.id === form.id
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                      }`}
                    >
                      <p className="font-medium truncate">{form.title}</p>
                      <p className="text-xs opacity-75">
                        {responses.length} responses
                      </p>
                    </button>
                  ))
                )}
              </div>

              <button className="w-full mt-6 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-semibold">
                + New Form
              </button>
            </div>
          </div>

          <div className="lg:col-span-3">
            {selectedForm ? (
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-2xl font-bold mb-2">{selectedForm.title}</h2>
                  <p className="text-gray-600">{selectedForm.description}</p>
                </div>

                {responses.length > 0 ? (
                  <AnalyticsDashboard responses={responses} />
                ) : (
                  <div className="bg-white rounded-lg shadow p-12 text-center">
                    <p className="text-gray-600 mb-4">
                      No responses yet. Share your form to start collecting feedback.
                    </p>
                    <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
                      Share Form
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <p className="text-gray-600 mb-4">Create your first feedback form</p>
                <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
                  Create Form
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
