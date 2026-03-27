'use client';

import { useState, useRef } from 'react';
import Papa from 'papaparse';
import { supabase } from '@/lib/supabase';

interface ImportCSVProps {
  formId: string;
  userId: string;
  onImportComplete: (count: number) => void;
}

export function ImportCSV({ formId, userId, onImportComplete }: ImportCSVProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith('.csv')) {
      setError('Please select a CSV file');
      return;
    }

    setFile(selectedFile);
    setError('');
    setSuccess('');

    Papa.parse(selectedFile, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setPreview(results.data.slice(0, 5));
      },
      error: (err) => {
        setError(`Failed to parse CSV: ${err.message}`);
      },
    });
  };

  const handleImport = async () => {
    if (!file) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/import-csv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formId,
          userId,
          fileName: file.name,
        }),
      });

      // For now, do direct import
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
          const rows = results.data as Record<string, string>[];
          let importedCount = 0;

          for (const row of rows) {
            try {
              const responses: Record<string, any> = {};
              Object.keys(row).forEach((key, idx) => {
                responses[idx.toString()] = row[key];
              });

              await supabase.from('feedback_responses').insert({
                form_id: formId,
                responses,
                respondent_email: row['email'] || row['Email'] || null,
                respondent_name: row['name'] || row['Name'] || null,
              });

              importedCount++;
            } catch (err) {
              console.error('Failed to import row:', err);
            }
          }

          setSuccess(`Successfully imported ${importedCount} responses!`);
          onImportComplete(importedCount);
          
          // Record the import
          await supabase.from('csv_imports').insert({
            user_id: userId,
            filename: file.name,
            row_count: importedCount,
            import_status: 'completed',
          });
        },
        error: (err) => {
          setError(`Failed to import: ${err.message}`);
        },
      });
    } catch (err: any) {
      setError(err.message || 'Import failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Import from CSV</h3>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
          {success}
        </div>
      )}

      <div
        className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition cursor-pointer"
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileSelect}
          className="hidden"
        />
        <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        <p className="text-gray-600 mb-2">
          {file ? file.name : 'Click to select a CSV file'}
        </p>
        <p className="text-sm text-gray-500">
          CSV files should have headers: name, email, and response columns
        </p>
      </div>

      {preview.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Preview (first 5 rows)</h4>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  {Object.keys(preview[0]).map((key) => (
                    <th key={key} className="px-4 py-2 text-left text-gray-600">{key}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {preview.map((row, idx) => (
                  <tr key={idx} className="border-t">
                    {Object.values(row).map((val, i) => (
                      <td key={i} className="px-4 py-2 text-gray-900 truncate max-w-xs">{val as string}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {file && (
        <div className="mt-4 flex gap-4">
          <button
            onClick={handleImport}
            disabled={loading}
            className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Importing...' : 'Import Data'}
          </button>
          <button
            onClick={() => {
              setFile(null);
              setPreview([]);
              setError('');
              setSuccess('');
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
