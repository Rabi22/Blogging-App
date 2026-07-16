import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider }   from './context/AuthContext';
import Navbar             from './components/layout/Navbar';
import Footer             from './components/layout/Footer';
import ProtectedRoute     from './components/ui/ProtectedRoute';
import Home               from './pages/Home';
import BlogDetail         from './pages/BlogDetail';
import Login              from './pages/Login';
import Register           from './pages/Register';
import CreateBlog         from './pages/CreateBlog';
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
          <Route path="/admin/login"    element={<Login />} />
          <Route path="/admin/register" element={<Register />} />
          <Route path="/create"         element={<ProtectedRoute><CreateBlog /></ProtectedRoute>} />
          <Route path="/admin/dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
          <Route path="*"               element={<NotFound />} />
        </Routes>
        <Footer />
      </BrowserRouter>
    </AuthProvider>
  );
}
