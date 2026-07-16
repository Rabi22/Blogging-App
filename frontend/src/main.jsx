import { StrictMode, useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import LoadingScreen from './components/ui/LoadingScreen.jsx';
import './styles/globals.css';

function Root() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Show loading screen for a minimum of 1.8s for the pencil animation to shine
    const timer = setTimeout(() => setReady(true), 1800);
    return () => clearTimeout(timer);
  }, []);

  if (!ready) return <LoadingScreen />;
  return <App />;
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Root />
  </StrictMode>
);
