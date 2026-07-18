import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { userAuthAPI } from '../api/api';
import { useAuth } from '../context/AuthContext';
import anime from 'animejs';

export default function UserRegister() {
  const { login,user } = useAuth();
  const navigate = useNavigate();
  const [form,setForm] = useState({ username:'', email:'', password:'' });
  const [error,setError] = useState('');
  const [loading,setLoading] = useState(false);
  const cardRef = useRef(null);
  const formRef = useRef(null);

  useEffect(() => {
    if (user) navigate('/'); 
  }, [user]);

  useEffect(() => {
    anime({ targets: cardRef.current, translateY:[50,0], opacity:[0,1], duration:700, easing:'easeOutExpo' });
  }, []);

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    const { ok, data, status } = await userAuthAPI.register(
      form.username,
      form.email,
      form.password
    );
    setLoading(false);
    if (ok && data.user) {
      login(data.user);
      navigate('/');
    } else {
      let errorMsg = 'Registration failed. Please try again.';
      if (status === 0) {
        errorMsg = 'Cannot reach the server. Please make sure the backend is running.';
      } else if (data.message) {
        errorMsg = data.message;
      }
      setError(errorMsg);
      anime({ targets: formRef.current, translateX:[0,-10,10,-8,8,-4,4,0], duration:500, easing:'linear' });
    }
  };

  return (
    <main style={styles.page}>
      <div style={styles.bg} aria-hidden="true" />
      <div ref={cardRef} style={{ ...styles.card, opacity: 0 }}>
        <div style={styles.cardHeader}>
          <Link to="/login" style={styles.backLink}>← Back to Login</Link>
          <div style={styles.iconWrap}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </div>
          <h1 style={styles.title}>Join Inkwell</h1>
          <p style={styles.subtitle}>Create an account to start writing</p>
        </div>

        <form ref={formRef} onSubmit={handleSubmit} style={styles.form}>
          {error && <div className="alert alert-error">{error}</div>}

          <div className="form-group">
            <label className="form-label" htmlFor="user-reg-username">Username</label>
            <input id="user-reg-username" name="username" className="form-input"
              value={form.username} onChange={handleChange}
              placeholder="johndoe" required minLength={3} maxLength={10}
              pattern="[a-zA-Z][a-zA-Z0-9_]{2,15}"
              title="3-10 chars, start with letter, letters/numbers/underscore only" />
            <span style={styles.hint}>3–10 characters, letters and numbers only</span>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="user-reg-email">Email</label>
            <input id="user-reg-email" name="email" type="email" className="form-input"
              value={form.email} onChange={handleChange}
              placeholder="you@example.com" required />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="user-reg-password">Password</label>
            <input id="user-reg-password" name="password" type="password" className="form-input"
              value={form.password} onChange={handleChange}
              placeholder="••••••••" required minLength={8} />
            <span style={styles.hint}>Min 8 chars with uppercase, lowercase, number & symbol</span>
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}
            id="user-register-submit-btn"
            style={{ width:'100%', justifyContent:'center', background:'linear-gradient(135deg,#10b981,#059669)' }}>
            {loading ? <><span className="spinner" style={{width:16,height:16}} /> Creating…</> : 'Create Account'}
          </button>
        </form>

        <p style={styles.footer}>
          Already have an account?{' '}
          <Link to="/login" style={styles.footerLink}>Sign In</Link>
        </p>
        <p style={{...styles.footer, paddingTop: 0, paddingBottom: '28px'}}>
          <Link to="/admin/register" style={{...styles.footerLink, color:'#475569', fontSize:'12px'}}>Admin Registration →</Link>
        </p>
      </div>
    </main>
  );
}

const styles = {
  page: { minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:'40px 20px', position:'relative' },
  bg: { position:'fixed', inset:0, background:'radial-gradient(ellipse 70% 60% at 50% 0%, rgba(16,185,129,0.12) 0%, transparent 65%)', pointerEvents:'none', zIndex:0 },
  card: { position:'relative', zIndex:1, width:'100%', maxWidth:'440px', background:'#10101e', border:'1px solid rgba(16,185,129,0.18)', borderRadius:'20px', overflow:'hidden', boxShadow:'0 20px 60px rgba(0,0,0,0.6)' },
  cardHeader: { padding:'36px 36px 0', textAlign:'center', display:'flex', flexDirection:'column', alignItems:'center', gap:'12px' },
  backLink: { alignSelf:'flex-start', fontSize:'13px', color:'#475569', textDecoration:'none', marginBottom:'4px' },
  iconWrap: { width:'52px', height:'52px', borderRadius:'14px', background:'rgba(16,185,129,0.12)', border:'1px solid rgba(16,185,129,0.25)', display:'flex', alignItems:'center', justifyContent:'center' },
  title: { fontFamily:"'Playfair Display',serif", fontSize:'26px', fontWeight:700, color:'#f1f5f9' },
  subtitle: { fontSize:'14px', color:'#475569', marginBottom:'8px' },
  form: { padding:'28px 36px', display:'flex', flexDirection:'column', gap:'18px' },
  hint: { fontSize:'11px', color:'#475569' },
  footer: { textAlign:'center', fontSize:'13px', color:'#475569', padding:'0 36px 12px' },
  footerLink: { color:'#10b981', textDecoration:'none', fontWeight:500 },
};
