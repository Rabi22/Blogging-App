import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer style={styles.footer}>
      <div className="container" style={styles.inner}>
        <div style={styles.left}>
          <span style={styles.logo}>✦ Inkwell</span>
          <p style={styles.tagline}>Stories worth reading.</p>
        </div>
        <div style={styles.links}>
          <Link to="/" style={styles.link}>Home</Link>
          <a href="#top" style={styles.link}>Top</a>
        </div>
        <p style={styles.copy}>© {new Date().getFullYear()} Inkwell. All rights reserved.</p>
      </div>
    </footer>
  );
}

const styles = {
  footer: {
    marginTop: 'auto',
    borderTop: '1px solid rgba(99,102,241,0.1)',
    background: '#07070d', padding: '40px 0 24px',
  },
  inner: {
    display: 'flex', flexWrap: 'wrap', alignItems: 'center',
    justifyContent: 'space-between', gap: '20px',
  },
  left: { display: 'flex', flexDirection: 'column', gap: '4px' },
  logo: {
    fontFamily: "'Playfair Display', serif",
    fontSize: '18px', fontWeight: 700, color: '#f1f5f9',
  },
  tagline: { fontSize: '13px', color: '#475569' },
  links: { display: 'flex', gap: '20px' },
  link: { textDecoration: 'none', fontSize: '14px', color: '#475569', transition: 'color 0.2s' },
  copy: { fontSize: '12px', color: '#334155', width: '100%', textAlign: 'center' },
};
