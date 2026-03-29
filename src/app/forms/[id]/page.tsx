'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { ShareFormModal } from '@/components/ShareFormModal';
import { supabase } from '@/lib/supabase';
import { getFormById, getFormResponses } from '@/lib/api';

export default function FormDetailPage() {
  const router = useRouter();
  const params = useParams();
  const formId = params.id as string;
  
  const [form, setForm] = useState<any>(null);
  const [responses, setResponses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showShareModal, setShowShareModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'responses' | 'settings'>('responses');
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');

  const checkAuth = useCallback(async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      router.push('/login');
      return;
    }

    await loadForm(formId);
  }, [router, formId]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const loadForm = async (id: string) => {
    try {
      const formData = await getFormById(id);
      if (!formData) {
        router.push('/forms');
        return;
      }
      setForm(formData);
      setEditTitle(formData.title);
      setEditDescription(formData.description || '');
      
      const formResponses = await getFormResponses(id);
      setResponses(formResponses);
    } catch (error) {
      console.error('Error loading form:', error);
      router.push('/forms');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateForm = async () => {
    try {
      const { error } = await supabase
        .from('feedback_forms')
        .update({
          title: editTitle,
          description: editDescription,
        })
        .eq('id', formId);

      if (error) throw error;

      setForm({ ...form, title: editTitle, description: editDescription });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating form:', error);
      alert('Failed to update form');
    }
  };

  const handleDeleteForm = async () => {
    if (!confirm('Are you sure you want to delete this form? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('feedback_forms')
        .delete()
        .eq('id', formId);

      if (error) throw error;

      router.push('/forms');
    } catch (error) {
      console.error('Error deleting form:', error);
      alert('Failed to delete form');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getSentimentBadge = (text: string) => {
    if (!text) return null;
    const positive = (text.match(/\b(great|excellent|amazing|love|perfect|awesome)\b/gi) || []).length;
    const negative = (text.match(/\b(bad|poor|terrible|hate|awful|worst)\b/gi) || []).length;
    
    if (positive > negative) {
      return <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">Positive</span>;
    } else if (negative > positive) {
      return <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800">Negative</span>;
    }
    return <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800">Neutral</span>;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Form not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <ol className="flex items-center gap-2 text-sm">
            <li>
              <Link href="/forms" className="text-gray-500 hover:text-gray-700">
                Forms
              </Link>
            </li>
            <li className="text-gray-400">/</li>
            <li className="text-gray-900 font-medium">{form.title}</li>
          </ol>
        </nav>

        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              {isEditing ? (
                <div className="space-y-4">
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="text-2xl font-bold w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  />
                  <textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    placeholder="Form description"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    rows={2}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleUpdateForm}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        setEditTitle(form.title);
                        setEditDescription(form.description || '');
                      }}
                      className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-2xl font-bold text-gray-900">{form.title}</h1>
                    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${form.is_public ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {form.is_public ? 'Public' : 'Private'}
                    </span>
                  </div>
                  {form.description && (
                    <p className="text-gray-600">{form.description}</p>
                  )}
                  <p className="text-sm text-gray-500 mt-2">
                    Created {formatDate(form.created_at)} • {responses.length} responses
                  </p>
                </>
              )}
            </div>

            {!isEditing && (
              <div className="flex gap-2">
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 font-medium flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit
                </button>
                <button
                  onClick={() => setShowShareModal(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                  Share
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex gap-8">
            <button
              onClick={() => setActiveTab('responses')}
              className={`pb-4 font-medium border-b-2 ${
                activeTab === 'responses'
                  ? 'text-blue-600 border-blue-600'
                  : 'text-gray-500 border-transparent hover:text-gray-700'
              }`}
            >
              Responses ({responses.length})
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`pb-4 font-medium border-b-2 ${
                activeTab === 'settings'
                  ? 'text-blue-600 border-blue-600'
                  : 'text-gray-500 border-transparent hover:text-gray-700'
              }`}
            >
              Settings
            </button>
          </nav>
        </div>

        {/* Content */}
        {activeTab === 'responses' && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {responses.length === 0 ? (
              <div className="p-12 text-center">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No responses yet</h3>
                <p className="text-gray-600">Share your form to start collecting feedback</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rating
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Feedback
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Sentiment
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {responses.map((response) => (
                      <tr key={response.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(response.created_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {response.rating && (
                            <div className="flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <svg
                                  key={star}
                                  className={`w-5 h-5 ${star <= response.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              ))}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 max-w-md truncate">
                          {response.feedback_text || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getSentimentBadge(response.feedback_text)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-6">Form Settings</h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Form URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={`${window.location.origin}/form/${formId}`}
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 bg-gray-50 text-gray-600"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/form/${formId}`);
                      alert('Copied to clipboard!');
                    }}
                    className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 font-medium"
                  >
                    Copy
                  </button>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-200">
                <h4 className="text-sm font-medium text-gray-700 mb-4">Danger Zone</h4>
                <button
                  onClick={handleDeleteForm}
                  className="bg-red-100 text-red-700 px-4 py-2 rounded-lg hover:bg-red-200 font-medium"
                >
                  Delete this form
                </button>
                <p className="text-sm text-gray-500 mt-2">
                  Once deleted, this form and all its responses will be permanently removed.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {showShareModal && (
        <ShareFormModal
          formId={formId}
          formTitle={form.title}
          onClose={() => setShowShareModal(false)}
        />
      )}
    </div>
  );
}
