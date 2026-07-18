import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../api/api';
import { useAuth } from '../context/AuthContext';
import anime from 'animejs';

function ErrorModal({ message, onClose }) {
  const ref = useRef(null);
  useEffect(() => {
    anime({ targets: ref.current, scale:[0.85,1], opacity:[0,1], duration:350, easing:'easeOutBack' });
  }, []);
  const close = () => {
    anime({ targets: ref.current, scale:[1,0.85], opacity:[1,0], duration:220, easing:'easeInBack', complete: onClose });
  };
  return (
    <div style={s.overlay} onClick={close}>
      <div ref={ref} style={{...s.modal, opacity:0}} onClick={e=>e.stopPropagation()}>
        <div style={s.mIcon}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/>
            <circle cx="12" cy="16" r="0.5" fill="#ef4444"/>
          </svg>
        </div>
        <h3 style={s.mTitle}>Login Failed</h3>
        <p style={s.mMsg}>{message}</p>
        <button className="btn btn-primary" onClick={close} id="close-error-modal" style={{width:'100%',justifyContent:'center'}}>
          Try Again
        </button>
      </div>
    </div>
  );
}

export default function Login() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [fields, setFields] = useState({ email:'', password:'' });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const cardRef = useRef(null);
  const formRef = useRef(null);

  useEffect(() => { if (user) navigate('/admin/dashboard'); }, [user]);
  useEffect(() => {
    anime({ targets: cardRef.current, translateY:[50,0], opacity:[0,1], duration:700, easing:'easeOutExpo' });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    const { ok, data, status } = await authAPI.login(fields.email, fields.password);
    setLoading(false);
    if (ok && data.user) {
      login(data.user);
      navigate('/admin/dashboard');
    } else {
      // error handling for login/reg page
      let errorMsg = 'Invalid email or password.';
      if (status === 0) {
        errorMsg = 'Cannot reach the server. Please make sure the backend is running.';
      } else if (data.message) {
        errorMsg = data.message;
      }
      setError(errorMsg);
      anime({ targets: formRef.current, translateX:[0,-12,12,-8,8,-4,4,0], duration:500, easing:'linear' });
    }
  };

  return (
    <main style={s.page}>
      <div style={s.bg} />
      {error && <ErrorModal message={error} onClose={() => setError('')} />}
      <div ref={cardRef} style={{...s.card, opacity:0}}>
        <div style={s.head}>
          <Link to="/" style={s.back}>← Home</Link>
          <div style={s.icon}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </div>
          <h1 style={s.title}>Admin Login</h1>
          <p style={s.sub}>Sign in to manage your blog</p>
        </div>
        <form ref={formRef} onSubmit={handleSubmit} style={s.form}>
          <div className="form-group">
            <label className="form-label" htmlFor="login-email">Email</label>
            <input id="login-email" type="email" className="form-input" value={fields.email}
              onChange={e=>setFields(p=>({...p,email:e.target.value}))} placeholder="admin@example.com" required autoFocus />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="login-password">Password</label>
            <input id="login-password" type="password" className="form-input" value={fields.password}
              onChange={e=>setFields(p=>({...p,password:e.target.value}))} placeholder="••••••••" required />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading} id="login-submit-btn" style={{width:'100%',justifyContent:'center'}}>
            {loading ? <><span className="spinner" style={{width:16,height:16}}/> Signing in…</> : 'Sign In'}
          </button>
        </form>
        <p style={s.foot}>Don't have an account? <Link to="/admin/register" style={s.link}>Register</Link></p>
      </div>
    </main>
  );
}

const s = {
  page: {minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',padding:'40px 20px',position:'relative'},
  bg: {position:'fixed',inset:0,background:'radial-gradient(ellipse 70% 60% at 50% 0%,rgba(99,102,241,0.15) 0%,transparent 65%)',pointerEvents:'none',zIndex:0},
  card: {position:'relative',zIndex:1,width:'100%',maxWidth:'420px',background:'#10101e',border:'1px solid rgba(99,102,241,0.18)',borderRadius:'20px',overflow:'hidden',boxShadow:'0 20px 60px rgba(0,0,0,0.6)'},
  head: {padding:'36px 36px 0',textAlign:'center',display:'flex',flexDirection:'column',alignItems:'center',gap:'12px'},
  back: {alignSelf:'flex-start',fontSize:'13px',color:'#475569',textDecoration:'none',marginBottom:'4px'},
  icon: {width:'52px',height:'52px',borderRadius:'14px',background:'rgba(99,102,241,0.12)',border:'1px solid rgba(99,102,241,0.25)',display:'flex',alignItems:'center',justifyContent:'center'},
  title: {fontFamily:"'Playfair Display',serif",fontSize:'26px',fontWeight:700,color:'#f1f5f9'},
  sub: {fontSize:'14px',color:'#475569',marginBottom:'8px'},
  form: {padding:'28px 36px',display:'flex',flexDirection:'column',gap:'18px'},
  foot: {textAlign:'center',fontSize:'13px',color:'#475569',padding:'0 36px 28px'},
  link: {color:'#6366f1',textDecoration:'none',fontWeight:500},
  overlay: {position:'fixed',inset:0,background:'rgba(0,0,0,0.75)',backdropFilter:'blur(8px)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:999,padding:'20px'},
  modal: {background:'#10101e',border:'1px solid rgba(239,68,68,0.3)',borderRadius:'18px',padding:'32px 28px',maxWidth:'360px',width:'100%',display:'flex',flexDirection:'column',alignItems:'center',gap:'16px',boxShadow:'0 20px 60px rgba(0,0,0,0.8)'},
  mIcon: {width:'60px',height:'60px',borderRadius:'50%',background:'rgba(239,68,68,0.1)',border:'1px solid rgba(239,68,68,0.25)',display:'flex',alignItems:'center',justifyContent:'center'},
  mTitle: {fontFamily:"'Playfair Display',serif",fontSize:'20px',fontWeight:700,color:'#f1f5f9'},
  mMsg: {fontSize:'14px',color:'#94a3b8',textAlign:'center',lineHeight:1.65},
};
