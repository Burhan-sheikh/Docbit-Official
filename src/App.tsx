import React, { Suspense, lazy, useEffect, useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './components/Home';
import { TOOLS } from './constants/tools';
import ScrollToTop from './components/ScrollToTop';
import { SplashScreen } from './components/SplashScreen';
import { AnimatePresence } from 'motion/react';

// Lazy load tools
const MergeTool = lazy(() => import('./components/tools/MergeTool'));
const SplitTool = lazy(() => import('./components/tools/SplitTool'));
const PdfToImgTool = lazy(() => import('./components/tools/PdfToImgTool'));
const ImgToPdfTool = lazy(() => import('./components/tools/ImgToPdfTool'));
const PrivacyPolicy = lazy(() => import('./components/PrivacyPolicy'));
const Terms = lazy(() => import('./components/Terms'));
const About = lazy(() => import('./components/About'));
const Contact = lazy(() => import('./components/Contact'));
const Help = lazy(() => import('./components/Help'));
const NotFound = lazy(() => import('./components/NotFound'));

export default function App() {
  const [isLaunching, setIsLaunching] = useState(true);
  const location = useLocation();
  const activeTool = TOOLS.find(t => t.href === location.pathname);

  // Prevention of accidental refresh/data loss
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Only prompt if we are in a tool page (not home)
      if (location.pathname !== '/') {
        e.preventDefault();
        e.returnValue = 'Data loss may occur. Are you sure you want to leave?';
        return e.returnValue;
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [location.pathname]);

  return (
    <>
      <AnimatePresence mode="wait">
        {isLaunching && (
          <SplashScreen key="splash" onComplete={() => setIsLaunching(false)} />
        )}
      </AnimatePresence>

      {!isLaunching && (
        <Layout activeToolName={activeTool?.name}>
          <ScrollToTop />
          <Suspense fallback={
            <div className="flex items-center justify-center h-full">
              <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm font-medium text-neutral-500 animate-pulse">Initializing engine...</p>
              </div>
            </div>
          }>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/tool/merge" element={<MergeTool />} />
              <Route path="/tool/split" element={<SplitTool />} />
              <Route path="/tool/pdf-to-img" element={<PdfToImgTool />} />
              <Route path="/tool/img-to-pdf" element={<ImgToPdfTool />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/help" element={<Help />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </Layout>
      )}
    </>
  );
}

