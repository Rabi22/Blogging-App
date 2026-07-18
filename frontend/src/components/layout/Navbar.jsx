import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authAPI, userAuthAPI } from '../../api/api';
import anime from 'animejs';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const navRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const isAdmin = user?.role === 'admin';

  // Slide-down entrance animation
  useEffect(() => {
    anime({
      targets: navRef.current,
      translateY: [-60, 0],
      opacity: [0, 1],
      duration: 700,
      easing: 'easeOutExpo',
    });
  }, []);

  // Shadow on scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close mobile menu on navigation
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      // Use the correct logout API based on user role
      if (isAdmin) {
        await authAPI.logout();
      } else {
        await userAuthAPI.logout();
      }
    } catch {
      // Even if the server call fails, clear local state
    }
    logout();
    setLoggingOut(false);
    navigate('/');
    setMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav ref={navRef} style={{ ...styles.nav, ...(scrolled ? styles.navScrolled : {}) }}>
      <div className="container" style={styles.inner}>
        {/* Logo */}
        <Link to="/" style={styles.logo}>
          <span style={styles.logoIcon}>✦</span>
          <span style={styles.logoText}>Inkwell</span>
        </Link>

        {/* Desktop links */}
        <div style={styles.links} className="desktop-links">
          <NavLink to="/" active={isActive('/')}>Home</NavLink>
          {user && <NavLink to="/create" active={isActive('/create')}>Write</NavLink>}
          {user && <NavLink to="/my-posts" active={isActive('/my-posts')}>My Posts</NavLink>}
          {isAdmin && <NavLink to="/admin/dashboard" active={isActive('/admin/dashboard')}>Dashboard</NavLink>}
        </div>

        {/* Right side */}
        <div style={styles.right}>
          {user ? (
            <div className="user-profile" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={styles.username}>
                <span style={{...styles.avatarSmall, background: isAdmin ? 'linear-gradient(135deg,#6366f1,#8b5cf6)' : 'linear-gradient(135deg,#10b981,#059669)'}}>
                  {user.username?.[0]?.toUpperCase() || '?'}
                </span>
                {user.username}
                <span style={{
                  ...styles.roleBadge,
                  color: isAdmin ? '#818cf8' : '#34d399',
                  background: isAdmin ? 'rgba(99,102,241,0.12)' : 'rgba(16,185,129,0.12)',
                }}>
                  {isAdmin ? 'Admin' : 'Author'}
                </span>
              </span>
              <button className="btn btn-outline btn-sm" onClick={handleLogout} disabled={loggingOut}>
                {loggingOut ? <span className="spinner" style={{ width: 12, height: 12 }} /> : 'Logout'}
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Link
                to="/login"
                style={styles.loginBtn}
                id="user-login-btn"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                style={styles.signupBtn}
                id="user-signup-btn"
              >
                Sign Up
              </Link>
            </div>
          )}

          {/* Mobile hamburger */}
          <button className="hamburger-btn" style={styles.hamburger} onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
            <span style={{ ...styles.bar, ...(menuOpen ? styles.bar1Open : {}) }} />
            <span style={{ ...styles.bar, opacity: menuOpen ? 0 : 1 }} />
            <span style={{ ...styles.bar, ...(menuOpen ? styles.bar3Open : {}) }} />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={styles.mobileMenu}>
          <Link to="/" style={styles.mobileLink} onClick={() => setMenuOpen(false)}>Home</Link>
          {user && <Link to="/create" style={styles.mobileLink} onClick={() => setMenuOpen(false)}>✏️ Write</Link>}
          {user && <Link to="/my-posts" style={styles.mobileLink} onClick={() => setMenuOpen(false)}>📄 My Posts</Link>}
          {isAdmin && <Link to="/admin/dashboard" style={styles.mobileLink} onClick={() => setMenuOpen(false)}>⚙️ Dashboard</Link>}
          {user
            ? <button style={{ ...styles.mobileLink, border: 'none', cursor: 'pointer', background: 'none', textAlign: 'left', width: '100%' }} onClick={handleLogout} disabled={loggingOut}>
              {loggingOut ? 'Logging out…' : '🚪 Logout'}
            </button>
            : <>
              <Link to="/login" style={styles.mobileLink} onClick={() => setMenuOpen(false)}>🔑 Sign In</Link>
              <Link to="/register" style={styles.mobileLink} onClick={() => setMenuOpen(false)}>📝 Sign Up</Link>
            </>
          }
        </div>
      )}
    </nav>
  );
}

function NavLink({ to, children, active }) {
  return (
    <Link to={to} style={{ ...styles.navLink, ...(active ? styles.navLinkActive : {}) }}>
      {children}
      {active && <span style={styles.activeDot} />}
    </Link>
  );
}

const styles = {
  nav: {
    position: 'sticky', top: 0, zIndex: 100,
    background: 'rgba(7,7,13,0.75)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    borderBottomWidth: '1px',
    borderBottomStyle: 'solid',
    borderBottomColor: 'rgba(99,102,241,0.08)',
    transition: 'box-shadow 0.3s ease, border-bottom-color 0.3s ease',
  },
  navScrolled: {
    boxShadow: '0 4px 32px rgba(0,0,0,0.5)',
    borderBottomColor: 'rgba(99,102,241,0.15)',
  },
  inner: {
    display: 'flex', alignItems: 'center',
    justifyContent: 'space-between', height: '64px',
  },
  logo: {
    display: 'flex', alignItems: 'center', gap: '8px',
    textDecoration: 'none',
  },
  logoIcon: { fontSize: '18px', color: '#6366f1' },
  logoText: {
    fontFamily: "'Playfair Display', serif",
    fontSize: '22px', fontWeight: 700, color: '#f1f5f9',
    letterSpacing: '-0.02em',
  },
  links: { display: 'flex', alignItems: 'center', gap: '4px' },
  navLink: {
    position: 'relative', display: 'flex', flexDirection: 'column',
    alignItems: 'center', gap: '3px',
    padding: '6px 14px', borderRadius: '8px',
    textDecoration: 'none', fontSize: '14px', fontWeight: 500,
    color: '#94a3b8', transition: 'all 0.2s ease',
  },
  navLinkActive: { color: '#f1f5f9', background: 'rgba(99,102,241,0.1)' },
  activeDot: {
    position: 'absolute', bottom: '-2px',
    width: '4px', height: '4px', borderRadius: '50%',
    background: '#6366f1',
  },
  right: { display: 'flex', alignItems: 'center', gap: '12px' },
  username: { fontSize: '13px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '8px' },
  avatarSmall: {
    width: '24px', height: '24px', borderRadius: '50%',
    background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#fff', fontWeight: 700, fontSize: '11px',
  },
  roleBadge: {
    fontSize: '10px', fontWeight: 600, color: '#818cf8',
    background: 'rgba(99,102,241,0.12)', padding: '1px 6px',
    borderRadius: '999px', textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
  loginBtn: {
    display: 'inline-flex', alignItems: 'center', gap: '6px',
    padding: '6px 14px', borderRadius: '7px',
    textDecoration: 'none', fontSize: '13px', fontWeight: 500,
    color: '#94a3b8',
    transition: 'all 0.2s ease',
  },
  signupBtn: {
    display: 'inline-flex', alignItems: 'center', gap: '6px',
    padding: '6px 14px', borderRadius: '7px',
    textDecoration: 'none', fontSize: '13px', fontWeight: 600,
    color: '#fff', background: 'linear-gradient(135deg,#10b981,#059669)',
    transition: 'all 0.2s ease',
  },
  hamburger: {
    display: 'none', flexDirection: 'column', gap: '5px',
    background: 'none', border: 'none', cursor: 'pointer', padding: '4px',
  },
  bar: {
    display: 'block', width: '22px', height: '2px',
    background: '#94a3b8', borderRadius: '2px',
    transition: 'all 0.25s ease',
  },
  bar1Open: { transform: 'translateY(7px) rotate(45deg)' },
  bar3Open: { transform: 'translateY(-7px) rotate(-45deg)' },
  mobileMenu: {
    display: 'flex', flexDirection: 'column',
    padding: '12px 24px 20px',
    borderTop: '1px solid rgba(99,102,241,0.08)',
  },
  mobileLink: {
    padding: '12px 0', textDecoration: 'none',
    color: '#94a3b8', fontSize: '15px',
    borderBottom: '1px solid rgba(99,102,241,0.06)',
  },
};

