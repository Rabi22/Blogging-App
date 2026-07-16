import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'60vh' }}>
      <span className="spinner" style={{ width:32, height:32, borderWidth:3 }} />
    </div>
  );

  if (!user) return <Navigate to="/admin/login" replace />;

  // Check admin role for admin-only pages
  if (user.role !== 'admin') {
    return (
      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:'60vh', gap:'16px', padding:'40px 20px', textAlign:'center' }}>
        <span style={{ fontSize:'48px' }}>🔒</span>
        <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:'24px', fontWeight:700, color:'#f1f5f9' }}>
          Admin Access Required
        </h2>
        <p style={{ color:'#64748b', fontSize:'15px', maxWidth:'400px', lineHeight:1.6 }}>
          Your account has the role <strong style={{color:'#fbbf24'}}>"{user.role}"</strong>. 
          Admin privileges are required to access this page. 
          Please contact the site administrator or register with an admin bootstrap token.
        </p>
        <a href="/admin/login" className="btn btn-outline" style={{ marginTop:'8px' }}>
          ← Back to Login
        </a>
      </div>
    );
  }

  return children;
}
