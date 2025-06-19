import React from 'react';
import ReactDOM from 'react-dom/client';
import App from '@/App';
import '@/index.css';

// --- TEMPORARY DEBUGGING LINE ---
console.log(
  'VITE_SUPABASE_URL from inside the app:', 
  import.meta.env.VITE_SUPABASE_URL
);
// --------------------------------

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
