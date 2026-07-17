import { Suspense, useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Layout } from './components/Layout';
import { TOOLS } from './constants/tools';
import ScrollToTop from './components/ScrollToTop';
import { SplashScreen } from './components/SplashScreen';
import { AnimatePresence } from 'motion/react';
import { AuthProvider } from './hooks/useAuth';
import { getToolBySlug } from './tools/registry';

export default function App() {
  const [isLaunching, setIsLaunching] = useState(() => {
    if (typeof window !== 'undefined') {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                          (window.navigator as any).standalone === true;
      return isStandalone;
    }
    return false;
  });
  const location = useLocation();

  const pathSegments = location.pathname.split('/');
  const toolSlug = pathSegments[1] === 'tools' ? pathSegments[2] : undefined;
  const activeTool = toolSlug ? getToolBySlug(toolSlug) : undefined;

  return (
    <AuthProvider>
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
              <div className="flex items-center justify-center h-full min-h-[60vh]">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm font-medium text-neutral-500 animate-pulse">Initializing engine...</p>
                </div>
              </div>
            }>
              <Outlet />
            </Suspense>
          </Layout>
        )}
      </>
    </AuthProvider>
  );
}
