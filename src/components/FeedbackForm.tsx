'use client';

import { useState } from 'react';
import { submitFeedback } from '@/lib/api';

interface FeedbackFormProps {
  formId: string;
  questions: any[];
  onSubmitSuccess?: () => void;
}

export function FeedbackForm({
  formId,
  questions,
  onSubmitSuccess,
}: FeedbackFormProps) {
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await submitFeedback(formId, responses, email, name);
      setSubmitted(true);
      onSubmitSuccess?.();
    } catch (error) {
      console.error('Submission error:', error);
      alert('Failed to submit feedback');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
        <h3 className="text-lg font-semibold text-green-900 mb-2">
          Thank you for your feedback!
        </h3>
        <p className="text-green-700">
          Your response has been recorded successfully.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Name (optional)
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Email (optional)
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {questions.map((question, idx) => (
        <div key={idx}>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {question.text}
            {question.required && <span className="text-red-500">*</span>}
          </label>

          {question.type === 'text' && (
            <input
              type="text"
              required={question.required}
              onChange={(e) =>
                setResponses({ ...responses, [idx]: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          )}

          {question.type === 'textarea' && (
            <textarea
              required={question.required}
              onChange={(e) =>
                setResponses({ ...responses, [idx]: e.target.value })
              }
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          )}

          {question.type === 'rating' && (
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  type="button"
                  onClick={() =>
                    setResponses({ ...responses, [idx]: rating })
                  }
                  className={`w-10 h-10 rounded-lg font-semibold transition ${
                    responses[idx] === rating
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {rating}
                </button>
              ))}
            </div>
          )}

          {question.type === 'select' && (
            <select
              required={question.required}
              onChange={(e) =>
                setResponses({ ...responses, [idx]: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select an option</option>
              {question.options?.map((option: string) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          )}
        </div>
      ))}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Submitting...' : 'Submit Feedback'}
      </button>
    </form>
  );
}
