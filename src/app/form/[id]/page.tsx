'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { FeedbackForm } from '@/components/FeedbackForm';
import Link from 'next/link';

export default function FormPage() {
  const params = useParams();
  const formId = params.id as string;
  
  const [form, setForm] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadForm = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('feedback_forms')
        .select('*')
        .eq('id', formId)
        .eq('is_active', true)
        .single();

      if (error) throw error;
      setForm(data);
    } catch (err: any) {
      setError('Form not found or no longer available');
    } finally {
      setLoading(false);
    }
  }, [formId]);

  useEffect(() => {
    loadForm();
  }, [loadForm]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  if (error || !form) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Form Not Found</h1>
          <p className="text-gray-600 mb-6">{error || 'This form does not exist or has been deactivated.'}</p>
          <Link href="/" className="text-blue-600 hover:underline">
            Go to Homepage
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{form.title}</h1>
            {form.description && (
              <p className="text-gray-600">{form.description}</p>
            )}
          </div>
          
          <FeedbackForm 
            formId={formId} 
            questions={form.questions || []} 
          />
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Powered by{' '}
            <Link href="/" className="text-blue-600 hover:underline font-semibold">
              FeedbackLens
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
