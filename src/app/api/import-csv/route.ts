import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import Papa from 'papaparse';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const formId = formData.get('formId') as string;
    const userId = formData.get('userId') as string;

    if (!file || !formId || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const text = await file.text();
    const parsed = Papa.parse(text, { header: true });

    if (!parsed.data || parsed.data.length === 0) {
      return NextResponse.json(
        { error: 'CSV file is empty' },
        { status: 400 }
      );
    }

    const responses = parsed.data.map((row: any) => ({
      form_id: formId,
      respondent_email: row.email || row.respondent_email,
      respondent_name: row.name || row.respondent_name,
      responses: row,
      created_at: new Date(),
    }));

    const { error } = await supabaseAdmin
      .from('feedback_responses')
      .insert(responses);

    if (error) throw error;

    await supabaseAdmin.from('csv_imports').insert({
      user_id: userId,
      filename: file.name,
      row_count: responses.length,
      import_status: 'completed',
    });

    return NextResponse.json({
      success: true,
      imported: responses.length,
    });
  } catch (error) {
    console.error('CSV import error:', error);
    return NextResponse.json(
      { error: 'Failed to import CSV' },
      { status: 500 }
    );
  }
}
