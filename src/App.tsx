import React, { Suspense, lazy, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './components/Home';
import { TOOLS } from './constants/tools';

// Lazy load tools
const OrganizerTool = lazy(() => import('./components/tools/OrganizerTool'));
const MergeTool = lazy(() => import('./components/tools/MergeTool'));
const SplitTool = lazy(() => import('./components/tools/SplitTool'));
const PdfToImgTool = lazy(() => import('./components/tools/PdfToImgTool'));
const ImgToPdfTool = lazy(() => import('./components/tools/ImgToPdfTool'));
const CompressTool = lazy(() => import('./components/tools/CompressTool'));
const ResizeTool = lazy(() => import('./components/tools/ResizeTool'));

export default function App() {
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
    <Layout activeToolName={activeTool?.name}>
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
          <Route path="/tool/organize" element={<OrganizerTool />} />
          <Route path="/tool/merge" element={<MergeTool />} />
          <Route path="/tool/split" element={<SplitTool />} />
          <Route path="/tool/pdf-to-img" element={<PdfToImgTool />} />
          <Route path="/tool/img-to-pdf" element={<ImgToPdfTool />} />
          <Route path="/tool/compress" element={<CompressTool />} />
          <Route path="/tool/resize" element={<ResizeTool />} />
        </Routes>
      </Suspense>
    </Layout>
  );
}

