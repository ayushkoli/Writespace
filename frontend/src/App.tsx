import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import PostDetail from './pages/PostDetail';
import Saved from './pages/Saved';
import Compose from './pages/Compose';
import Settings from './pages/Settings';
import About from './pages/About';
import NotFound from './pages/NotFound';
import Landing from './pages/Landing';
import GuestRoute from './components/GuestRoute';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            <Route
              path="/"
              element={
                <GuestRoute>
                  <Landing />
                </GuestRoute>
              }
            />
            <Route
              path="/login"
              element={
                <GuestRoute>
                  <Login />
                </GuestRoute>
              }
            />
            <Route
              path="/register"
              element={
                <GuestRoute>
                  <Register />
                </GuestRoute>
              }
            />

            <Route
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route path="home" element={<Home />} />
              <Route path="profile/:username" element={<Profile />} />
              <Route path="post/:postId" element={<PostDetail />} />
              <Route path="saved" element={<Saved />} />
              <Route path="compose" element={<Compose />} />
              <Route path="settings" element={<Settings />} />
              <Route path="about" element={<About />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
