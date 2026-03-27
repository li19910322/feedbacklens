import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import Papa from 'papaparse';

export async function POST(request: NextRequest) {
  try {
    const { formId, userId, fileName, csvData } = await request.json();

    if (!formId || !csvData) {
      return NextResponse.json(
        { error: 'Form ID and CSV data are required' },
        { status: 400 }
      );
    }

    // Parse CSV data
    const parsed = Papa.parse(csvData, {
      header: true,
      skipEmptyLines: true,
    });

    const rows = parsed.data as Record<string, string>[];
    let importedCount = 0;
    const errors: string[] = [];

    for (const row of rows) {
      try {
        const responses: Record<string, any> = {};
        Object.keys(row).forEach((key, idx) => {
          responses[idx.toString()] = row[key];
        });

        const { error } = await supabaseAdmin.from('feedback_responses').insert({
          form_id: formId,
          responses,
          respondent_email: row['email'] || row['Email'] || row['EMAIL'] || null,
          respondent_name: row['name'] || row['Name'] || row['NAME'] || null,
        });

        if (error) throw error;
        importedCount++;
      } catch (err: any) {
        errors.push(`Row ${importedCount + 1}: ${err.message}`);
      }
    }

    // Record the import
    await supabaseAdmin.from('csv_imports').insert({
      user_id: userId,
      filename: fileName,
      row_count: importedCount,
      import_status: errors.length === 0 ? 'completed' : 'partial',
    });

    return NextResponse.json({
      success: true,
      imported: importedCount,
      total: rows.length,
      errors: errors.slice(0, 10), // Return first 10 errors
    });
  } catch (error: any) {
    console.error('CSV import error:', error);
    return NextResponse.json(
      { error: error.message || 'Import failed' },
      { status: 500 }
    );
  }
}
