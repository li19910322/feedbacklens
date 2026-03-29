'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function AnalyzePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const formId = searchParams.get('form_id');
  
  const [forms, setForms] = useState<any[]>([]);
  const [selectedFormId, setSelectedFormId] = useState<string | null>(formId);
  const [responses, setResponses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<any>(null);

  const checkAuth = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push('/login');
      return;
    }
    loadForms(session.user.id);
  }, [router]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const loadForms = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('feedback_forms')
        .select('id, title, responses_count')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setForms(data);
        if (formId) {
          setSelectedFormId(formId);
          loadResponses(formId);
        } else if (data.length > 0) {
          setSelectedFormId(data[0].id);
          loadResponses(data[0].id);
        }
      }
    } catch (error) {
      console.error('Error loading forms:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadResponses = async (fid: string) => {
    try {
      const { data, error } = await supabase
        .from('feedback_responses')
        .select('*')
        .eq('form_id', fid)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setResponses(data);
      }
    } catch (error) {
      console.error('Error loading responses:', error);
    }
  };

  const handleFormChange = (fid: string) => {
    setSelectedFormId(fid);
    loadResponses(fid);
    setAnalysisResults(null);
  };

  const runAnalysis = async () => {
    if (responses.length === 0) {
      alert('No feedback to analyze');
      return;
    }

    setAnalyzing(true);
    try {
      // Combine all feedback text
      const feedbackTexts = responses
        .map(r => {
          const answers = Object.values(r.responses || {});
          return answers.filter((a: any) => typeof a === 'string').join(' ');
        })
        .filter(t => t.trim())
        .join('\n\n---\n\n');

      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: feedbackTexts }),
      });

      if (!response.ok) throw new Error('Analysis failed');
      const results = await response.json();
      setAnalysisResults(results);
    } catch (error) {
      console.error('Analysis error:', error);
      alert('Failed to analyze feedback. Please try again.');
    } finally {
      setAnalyzing(false);
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
      <header className="bg-white shadow">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-blue-600">FeedbackLens</Link>
          <div className="flex gap-4">
            <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">Dashboard</Link>
            <Link href="/settings" className="text-gray-600 hover:text-gray-900">Settings</Link>
            <button onClick={() => supabase.auth.signOut().then(() => router.push('/'))} className="text-gray-600 hover:text-gray-900">
              Logout
            </button>
          </div>
        </nav>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">AI Feedback Analysis</h1>

          {/* Form Selector */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Form</label>
            <select
              value={selectedFormId || ''}
              onChange={(e) => handleFormChange(e.target.value)}
              className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {forms.length === 0 ? (
                <option value="">No forms available</option>
              ) : (
                forms.map(form => (
                  <option key={form.id} value={form.id}>
                    {form.title} ({form.responses_count || 0} responses)
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-blue-600 font-medium">Total Responses</p>
              <p className="text-3xl font-bold text-blue-900">{responses.length}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-sm text-green-600 font-medium">This Month</p>
              <p className="text-3xl font-bold text-green-900">
                {responses.filter(r => {
                  const d = new Date(r.created_at);
                  const now = new Date();
                  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
                }).length}
              </p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <p className="text-sm text-purple-600 font-medium">Analysis Status</p>
              <p className="text-lg font-bold text-purple-900">
                {analysisResults ? 'Completed' : analyzing ? 'Analyzing...' : 'Ready'}
              </p>
            </div>
          </div>

          {/* Run Analysis Button */}
          <button
            onClick={runAnalysis}
            disabled={analyzing || responses.length === 0}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {analyzing ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Analyzing...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                Run AI Analysis
              </>
            )}
          </button>

          {/* Analysis Results */}
          {analysisResults && (
            <div className="mt-8 space-y-6">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Sentiment Analysis</h3>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${
                          analysisResults.sentiment > 0.3
                            ? 'bg-green-500'
                            : analysisResults.sentiment > -0.3
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                        }`}
                        style={{ width: `${(analysisResults.sentiment + 1) * 50}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-2xl font-bold text-gray-900">
                    {(analysisResults.sentiment * 100).toFixed(0)}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  {analysisResults.sentiment > 0.3
                    ? '🟢 Overall Positive'
                    : analysisResults.sentiment > -0.3
                    ? '🟡 Mixed Sentiment'
                    : '🔴 Overall Negative'}
                </p>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Summary</h3>
                <p className="text-gray-700 leading-relaxed">{analysisResults.summary}</p>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Themes</h3>
                <div className="flex flex-wrap gap-2">
                  {analysisResults.themes?.map((theme: string, idx: number) => (
                    <span
                      key={idx}
                      className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
                    >
                      {theme}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Recent Feedback */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Feedback</h3>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {responses.slice(0, 10).map((response, idx) => (
                <div key={idx} className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-500 mb-1">
                    {new Date(response.created_at).toLocaleDateString()}
                    {response.respondent_email && ` • ${response.respondent_email}`}
                  </p>
                  <div className="text-gray-700">
                    {Object.entries(response.responses || {}).map(([key, value]: [string, any]) => (
                      <p key={key} className="text-sm">
                        <span className="font-medium">{key}:</span> {String(value).slice(0, 100)}
                        {String(value).length > 100 && '...'}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
