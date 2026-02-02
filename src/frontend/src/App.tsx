import { Routes, Route } from 'react-router-dom';
import { Layout } from './components/ui/Layout';
import { ProtectedRoute } from './components/ui/ProtectedRoute';
import { ToastProvider } from './components/ui/Toast';
import { ConfirmProvider } from './components/ui/ConfirmDialog';
import { Suspense, lazy } from 'react';

// Lazy load pages for code splitting
const Home = lazy(() => import('./pages/Home').then(module => ({ default: module.Home })));
const Login = lazy(() => import('./pages/Login').then(module => ({ default: module.Login })));
const Register = lazy(() => import('./pages/Register').then(module => ({ default: module.Register })));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword').then(module => ({ default: module.ForgotPassword })));
const ResetPassword = lazy(() => import('./pages/ResetPassword').then(module => ({ default: module.ResetPassword })));
const Dashboard = lazy(() => import('./pages/Dashboard').then(module => ({ default: module.Dashboard })));
const AlphabetGame = lazy(() => import('./pages/AlphabetGame').then(module => ({ default: module.default })));
const Games = lazy(() => import('./pages/Games').then(module => ({ default: module.Games })));
const ConnectTheDots = lazy(() => import('./pages/ConnectTheDots').then(module => ({ default: module.ConnectTheDots })));
const LetterHunt = lazy(() => import('./pages/LetterHunt').then(module => ({ default: module.LetterHunt })));
const Progress = lazy(() => import('./pages/Progress').then(module => ({ default: module.Progress })));
const Settings = lazy(() => import('./pages/Settings').then(module => ({ default: module.Settings })));
const StyleTest = lazy(() => import('./components/StyleTest').then(module => ({ default: module.StyleTest })));
const FingerNumberShow = lazy(() => import('./games/FingerNumberShow').then(module => ({ default: module.FingerNumberShow })));
const MediaPipeTest = lazy(() => import('./pages/MediaPipeTest').then(module => ({ default: module.MediaPipeTest })));

// Loading component for suspense boundaries
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
  </div>
);

function App() {
  return (
    <ToastProvider>
      <ConfirmProvider>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Auth pages - no Layout wrapper (minimal UI for trust) */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* All other pages use Layout */}
            <Route path="/" element={<Layout><Home /></Layout>} />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Layout><Dashboard /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/game" element={
              <ProtectedRoute>
                <AlphabetGame />
              </ProtectedRoute>
            } />
            <Route path="/games" element={
              <ProtectedRoute>
                <Layout><Games /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/games/finger-number-show" element={
              <ProtectedRoute>
                <FingerNumberShow />
              </ProtectedRoute>
            } />
            <Route path="/games/connect-the-dots" element={
              <ProtectedRoute>
                <ConnectTheDots />
              </ProtectedRoute>
            } />
            <Route path="/games/letter-hunt" element={
              <ProtectedRoute>
                <LetterHunt />
              </ProtectedRoute>
            } />
            <Route path="/progress" element={
              <ProtectedRoute>
                <Layout><Progress /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute>
                <Layout><Settings /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/style-test" element={<Layout><StyleTest /></Layout>} />
            <Route path="/test/mediapipe" element={<Layout><MediaPipeTest /></Layout>} />
          </Routes>
        </Suspense>
      </ConfirmProvider>
    </ToastProvider>
  );
}

export default App;
