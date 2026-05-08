import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { registerSW } from 'virtual:pwa-register';
import { HelmetProvider } from 'react-helmet-async';
import App from './App.tsx';
import './index.css';

// Register service worker for PWA
registerSW({ immediate: true });

const container = document.getElementById('root')!;

if (container.hasChildNodes()) {
  hydrateRoot(
    container,
    <StrictMode>
      <HelmetProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </HelmetProvider>
    </StrictMode>
  );
} else {
  createRoot(container).render(
    <StrictMode>
      <HelmetProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </HelmetProvider>
    </StrictMode>
  );
}
