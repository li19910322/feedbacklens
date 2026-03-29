'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { CreateFormModal } from '@/components/CreateFormModal';

export default function FormsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [forms, setForms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const checkAuth = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
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
      const { data, error } = await supabase
        .from('feedback_forms')
        .select('*, responses_count:feedback_responses(count)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setForms(data);
      }
    } catch (error) {
      console.error('Error loading forms:', error);
    } finally {
      setLoading(false);
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
    } catch (error) {
      console.error('Error deleting form:', error);
      alert('Failed to delete form');
    }
  };

  const handleToggleActive = async (formId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('feedback_forms')
        .update({ is_active: !currentStatus, updated_at: new Date() })
        .eq('id', formId);

      if (error) throw error;
      setForms(forms.map(f => 
        f.id === formId ? { ...f, is_active: !currentStatus } : f
      ));
    } catch (error) {
      console.error('Error updating form:', error);
      alert('Failed to update form status');
    }
  };

  const handleCopyLink = (formId: string) => {
    const url = `${window.location.origin}/form/${formId}`;
    navigator.clipboard.writeText(url);
    alert('Link copied to clipboard!');
  };

  const filteredForms = forms.filter(form => 
    form.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-blue-600">FeedbackLens</Link>
          <div className="flex gap-4">
            <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">Dashboard</Link>
            <Link href="/analyze" className="text-gray-600 hover:text-gray-900">Analyze</Link>
            <Link href="/settings" className="text-gray-600 hover:text-gray-900">Settings</Link>
            <button onClick={() => supabase.auth.signOut().then(() => router.push('/'))} className="text-gray-600 hover:text-gray-900">
              Logout
            </button>
          </div>
        </nav>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Form Management</h1>
            <p className="text-gray-600 mt-1">Create and manage your feedback forms</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Form
          </button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search forms..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Forms Grid */}
        {filteredForms.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {searchQuery ? 'No forms found' : 'No forms yet'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchQuery ? 'Try a different search term' : 'Create your first feedback form to get started'}
            </p>
            {!searchQuery && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium"
              >
                Create Form
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredForms.map((form) => (
              <div key={form.id} className="bg-white rounded-lg shadow hover:shadow-md transition">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">{form.title}</h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      form.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {form.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  
                  {form.description && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{form.description}</p>
                  )}

                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                      </svg>
                      {form.responses_count?.[0]?.count || 0} responses
                    </span>
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {new Date(form.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Link
                      href={`/forms/${form.id}`}
                      className="flex-1 bg-blue-600 text-white px-3 py-2 rounded text-sm font-medium hover:bg-blue-700 text-center"
                    >
                      View Details
                    </Link>
                    <button
                      onClick={() => handleCopyLink(form.id)}
                      className="px-3 py-2 border border-gray-300 rounded text-sm font-medium hover:bg-gray-50"
                      title="Copy Link"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleToggleActive(form.id, form.is_active)}
                      className={`px-3 py-2 rounded text-sm font-medium ${
                        form.is_active
                          ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                          : 'bg-green-100 text-green-800 hover:bg-green-200'
                      }`}
                      title={form.is_active ? 'Deactivate' : 'Activate'}
                    >
                      {form.is_active ? '⏸' : '▶'}
                    </button>
                    <button
                      onClick={() => handleDeleteForm(form.id)}
                      className="px-3 py-2 bg-red-100 text-red-800 rounded text-sm font-medium hover:bg-red-200"
                      title="Delete"
                    >
                      🗑
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Stats Summary */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600">Total Forms</p>
            <p className="text-3xl font-bold text-gray-900">{forms.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600">Active Forms</p>
            <p className="text-3xl font-bold text-green-600">{forms.filter(f => f.is_active).length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600">Total Responses</p>
            <p className="text-3xl font-bold text-blue-600">
              {forms.reduce((sum, f) => sum + (f.responses_count?.[0]?.count || 0), 0)}
            </p>
          </div>
        </div>
      </div>

      {showCreateModal && user && (
        <CreateFormModal
          userId={user.id}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            loadForms(user.id);
          }}
        />
      )}
    </div>
  );
}
