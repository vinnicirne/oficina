import { createClient } from '@supabase/supabase-js';

// No Vite, as variáveis de ambiente com import.meta.env requerem o prefixo VITE_
// Como as chaves estão no .env da raiz, pode ser necessário certificar-se de que o Vite as enxerga
// Mas podemos usar um fallback temporário caso não queira renomear no .env

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ppymmsdivmmlqxbzdjky.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBweW1tc2Rpdm1tbHF4Ynpkamt5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ4NDM5MjQsImV4cCI6MjEwMDQxOTkyNH0.Dfb10Y5M8_KFeQfLpILwmBZzOmr0_ZHwM47j5ISjuX0';

export const supabase = createClient(supabaseUrl, supabaseKey);
