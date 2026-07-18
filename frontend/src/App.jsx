import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider }   from './context/AuthContext';
import Navbar             from './components/layout/Navbar';
import Footer             from './components/layout/Footer';
import ProtectedRoute     from './components/ui/ProtectedRoute';
import Home               from './pages/Home';
import BlogDetail         from './pages/BlogDetail';
import Login              from './pages/Login';
import Register           from './pages/Register';
import UserLogin          from './pages/UserLogin';
import UserRegister       from './pages/UserRegister';
import CreateBlog         from './pages/CreateBlog';
import MyPosts            from './pages/MyPosts';
import AdminDashboard     from './pages/AdminDashboard';
import NotFound           from './pages/NotFound';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/"               element={<Home />} />
          <Route path="/blog/:id"       element={<BlogDetail />} />

          {/* Normal user auth */}
          <Route path="/login"          element={<UserLogin />} />
          <Route path="/register"       element={<UserRegister />} />

          {/* Admin auth */}
          <Route path="/admin/login"    element={<Login />} />
          <Route path="/admin/register" element={<Register />} />

          {/* Any logged-in user */}
          <Route path="/create"         element={<ProtectedRoute><CreateBlog /></ProtectedRoute>} />
          <Route path="/my-posts"       element={<ProtectedRoute><MyPosts /></ProtectedRoute>} />

          {/* Admin only */}
          <Route path="/admin/dashboard" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />

          <Route path="*"               element={<NotFound />} />
        </Routes>
        <Footer />
      </BrowserRouter>
    </AuthProvider>
  );
}

