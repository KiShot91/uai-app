import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ndfysiuxtwpqlmcipixg.supabase.co';
const supabaseKey = 'sb_publishable_TZad2zA6vmEJNoGbjF-l-g_793hSvvC';

export const supabase = createClient(supabaseUrl, supabaseKey);