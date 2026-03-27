import { NextRequest, NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/supabase';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const url = new URL(request.url);
    const formId = url.searchParams.get('form_id');
    const feedbackId = url.searchParams.get('id');

    if (feedbackId) {
      // Get single feedback
      const { data, error } = await supabase
        .from('feedback_responses')
        .select('*')
        .eq('id', feedbackId)
        .single();

      if (error) return NextResponse.json({ error: error.message }, { status: 404 });
      return NextResponse.json(data);
    }

    if (!formId) {
      return NextResponse.json({ error: 'form_id is required' }, { status: 400 });
    }

    // Get all feedback for a form
    const { data, error } = await supabase
      .from('feedback_responses')
      .select('*')
      .eq('form_id', formId)
      .order('created_at', { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { form_id, responses, respondent_email, respondent_name } = body;

    if (!form_id || !responses) {
      return NextResponse.json({ error: 'form_id and responses are required' }, { status: 400 });
    }

    // Check if form exists and is active
    const { data: form, error: formError } = await supabase
      .from('feedback_forms')
      .select('id, is_active')
      .eq('id', form_id)
      .single();

    if (formError || !form) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 });
    }

    if (!form.is_active) {
      return NextResponse.json({ error: 'Form is no longer accepting responses' }, { status: 400 });
    }

    // Insert feedback response
    const { data, error } = await supabase
      .from('feedback_responses')
      .insert({
        form_id,
        responses,
        respondent_email,
        respondent_name,
      })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    // Update form response count
    await supabase.rpc('increment_response_count', { form_id });

    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const { feedbackId } = await request.json();

    if (!feedbackId) {
      return NextResponse.json({ error: 'feedbackId is required' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('feedback_responses')
      .delete()
      .eq('id', feedbackId);

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    return NextResponse.json({ message: 'Feedback deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
