import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jjsdgsdbrmwlbcfndgbf.supabase.co/';
const supabaseAnonKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlhdCI6MTYzMjI3MDkzOSwiZXhwIjoxOTQ3ODQ2OTM5fQ.Kb1nDa-68v-oXN6zIaw0vBbByw3ABhGIuJX-4xIjIKI';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
