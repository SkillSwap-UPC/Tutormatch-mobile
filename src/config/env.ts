// Configuración de entorno para React Native

// Supabase
export const SUPABASE_URL = "https://xdqnuesrahrusfnxcwvm.supabase.co";
export const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhkcW51ZXNyYWhydXNmbnhjd3ZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ1OTk3NjAsImV4cCI6MjA2MDE3NTc2MH0.g9-gdoeMUw60904DqQRqI2VI97MPVmAkvwCuoAH7ToA";

// Backend
export const API_URL = "https://tutormatch-backend.onrender.com";
//export const API_URL  = "http://localhost:3000";

// Archivo de configuración de entorno
console.log('API_URL:', API_URL);
console.log('SUPABASE_URL:', SUPABASE_URL);
// No imprimas la clave anónima completa por seguridad
console.log('SUPABASE_ANON_KEY (primeros 8 caracteres):', SUPABASE_ANON_KEY?.substring(0, 8));
