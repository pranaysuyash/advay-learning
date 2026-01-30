import { Routes, Route } from 'react-router-dom';
import { Layout } from './components/ui/Layout';
import { ProtectedRoute } from './components/ui/ProtectedRoute';
import { ToastProvider } from './components/ui/Toast';
import { ConfirmProvider } from './components/ui/ConfirmDialog';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { AlphabetGame } from './pages/AlphabetGame';
import { Games } from './pages/Games';
import { ConnectTheDots } from './pages/ConnectTheDots';
import { LetterHunt } from './pages/LetterHunt';
import { Progress } from './pages/Progress';
import { Settings } from './pages/Settings';
import { StyleTest } from './components/StyleTest';
import { FingerNumberShow } from './games/FingerNumberShow';

function App() {
  return (
    <ToastProvider>
      <ConfirmProvider>
        <Layout>
          <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/game" element={
          <ProtectedRoute>
            <AlphabetGame />
          </ProtectedRoute>
        } />
        <Route path="/games" element={
          <ProtectedRoute>
            <Games />
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
            <Progress />
          </ProtectedRoute>
        } />
        <Route path="/settings" element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        } />
        <Route path="/style-test" element={<StyleTest />} />
      </Routes>
        </Layout>
      </ConfirmProvider>
    </ToastProvider>
  );
}

export default App;
