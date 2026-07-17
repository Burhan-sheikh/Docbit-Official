import { StrictMode, Suspense, lazy } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { registerSW } from 'virtual:pwa-register';
import { HelmetProvider } from 'react-helmet-async';
import App from './App.tsx';
import { Home } from './components/Home';
import './index.css';

const ToolPage = lazy(() => import('./components/ToolPage'));
const CategoryPage = lazy(() => import('./components/CategoryPage'));
const PrivacyPolicy = lazy(() => import('./components/PrivacyPolicy'));
const Terms = lazy(() => import('./components/Terms'));
const About = lazy(() => import('./components/About'));
const Contact = lazy(() => import('./components/Contact'));
const NotFound = lazy(() => import('./components/NotFound'));
const LoginPage = lazy(() => import('./components/auth/LoginPage'));
const SignupPage = lazy(() => import('./components/auth/SignupPage'));
const ForgotPasswordPage = lazy(() => import('./components/auth/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./components/auth/ResetPasswordPage'));
const DashboardPage = lazy(() => import('./components/dashboard/DashboardPage'));

registerSW({ immediate: true });

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Home /> },
      { path: 'tools/:toolSlug', element: <ToolPage /> },
      { path: 'category/:categoryId', element: <CategoryPage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'signup', element: <SignupPage /> },
      { path: 'forgot-password', element: <ForgotPasswordPage /> },
      { path: 'reset-password', element: <ResetPasswordPage /> },
      { path: 'dashboard', element: <DashboardPage /> },
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
