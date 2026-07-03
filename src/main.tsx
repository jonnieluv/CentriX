import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { AuthProvider } from './context/AuthContext';
import { getDb } from './lib/firebase';
import { doc, getDocFromServer } from 'firebase/firestore';

async function testConnection() {
  const db = getDb();
  try {
    await getDocFromServer(doc(db, 'system', 'connection'));
    console.log("Firebase Cloud Storage connected.");
  } catch (error: any) {
    if (error.message && error.message.includes('offline')) {
      console.warn("Cloud connection offline, system may be operating in local-only mode.");
    }
  }
}

testConnection();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>,
);
