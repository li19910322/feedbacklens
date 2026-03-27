import { supabase } from './supabase';

export async function analyzeFeedbackWithAI(text: string): Promise<{
  sentiment: number;
  summary: string;
  themes: string[];
}> {
  const response = await fetch('/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });

  if (!response.ok) throw new Error('Failed to analyze feedback');
  return response.json();
}

export async function getUserForms(userId: string) {
  const { data, error } = await supabase
    .from('feedback_forms')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function getFormResponses(formId: string) {
  const { data, error } = await supabase
    .from('feedback_responses')
    .select('*')
    .eq('form_id', formId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function submitFeedback(
  formId: string,
  responses: Record<string, any>,
  respondentEmail?: string,
  respondentName?: string
) {
  const { data, error } = await supabase
    .from('feedback_responses')
    .insert({
      form_id: formId,
      responses,
      respondent_email: respondentEmail,
      respondent_name: respondentName,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function createFeedbackForm(
  userId: string,
  title: string,
  description: string,
  questions: any[]
) {
  const { data, error } = await supabase
    .from('feedback_forms')
    .insert({
      user_id: userId,
      title,
      description,
      questions,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateFormSettings(
  formId: string,
  settings: Record<string, any>
) {
  const { data, error } = await supabase
    .from('feedback_forms')
    .update({ settings, updated_at: new Date() })
    .eq('id', formId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getAnalytics(formId: string) {
  const { data, error } = await supabase
    .from('analytics')
    .select('*')
    .eq('form_id', formId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

export async function getFormById(formId: string) {
  const { data, error } = await supabase
    .from('feedback_forms')
    .select('*')
    .eq('id', formId)
    .single();

  if (error) throw error;
  return data;
}
