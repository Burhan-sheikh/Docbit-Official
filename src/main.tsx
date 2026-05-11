import { StrictMode, Suspense, lazy } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { registerSW } from 'virtual:pwa-register';
import { HelmetProvider } from 'react-helmet-async';
import App from './App.tsx';
import { Home } from './components/Home';
import './index.css';

// Lazy load components for the router
const MergeTool = lazy(() => import('./components/tools/MergeTool'));
const SplitTool = lazy(() => import('./components/tools/SplitTool'));
const PdfToImgTool = lazy(() => import('./components/tools/PdfToImgTool'));
const ImgToPdfTool = lazy(() => import('./components/tools/ImgToPdfTool'));
const GrayscaleTool = lazy(() => import('./components/tools/GrayscaleTool'));
const PrivacyPolicy = lazy(() => import('./components/PrivacyPolicy'));
const Terms = lazy(() => import('./components/Terms'));
const About = lazy(() => import('./components/About'));
const Contact = lazy(() => import('./components/Contact'));
const NotFound = lazy(() => import('./components/NotFound'));

// Register service worker for PWA
registerSW({ immediate: true });

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Home /> },
      { path: 'tools/merge-pdf', element: <MergeTool /> },
      { path: 'tools/split-pdf', element: <SplitTool /> },
      { path: 'tools/pdf-to-images', element: <PdfToImgTool /> },
      { path: 'tools/image-to-pdf', element: <ImgToPdfTool /> },
      { path: 'tools/grayscale-pdf', element: <GrayscaleTool /> },
      { path: 'privacy', element: <PrivacyPolicy /> },
      { path: 'terms', element: <Terms /> },
      { path: 'about', element: <About /> },
      { path: 'contact', element: <Contact /> },
      { path: '*', element: <NotFound /> },
    ],
  },
]);

const container = document.getElementById('root')!;

if (container.hasChildNodes()) {
  hydrateRoot(
    container,
    <StrictMode>
      <HelmetProvider>
        <RouterProvider router={router} />
      </HelmetProvider>
    </StrictMode>
  );
} else {
  createRoot(container).render(
    <StrictMode>
      <HelmetProvider>
        <RouterProvider router={router} />
      </HelmetProvider>
    </StrictMode>
  );
}
