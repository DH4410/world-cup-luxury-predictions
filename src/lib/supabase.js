import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://pekufecajyzrqqjhxsfh.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBla3VmZWNhanl6cnFxamh4c2ZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE1NDE4NTgsImV4cCI6MjA5NzExNzg1OH0.NrBgJQ-Bz9VsjJ21WA9j-Ci2TLvrSVIzHModq92XHXc';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
