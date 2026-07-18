import { Link } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import anime from 'animejs';

export default function NotFound() {
  const ref = useRef(null);
  useEffect(() => {
    anime({ targets: ref.current, translateY:[30,0], opacity:[0,1], duration:700, easing:'easeOutExpo' });
    anime({ targets: '#notfound-code', scale:[0.8,1], opacity:[0,1], duration:900, easing:'easeOutElastic(1,0.6)' });
  }, []);

  return (
    <main style={styles.page}>
      <div ref={ref} style={{ ...styles.inner, opacity:0 }}>
        <div id="notfound-code" style={{ opacity:0, ...styles.code }}>404</div>
        <h1 style={styles.title}>Page Not Found</h1>
        <p style={styles.text}>The page you're looking for doesn't exist or has been moved.</p>
        <Link to="/" className="btn btn-primary" id="go-home-btn">← Back to Home</Link>
      </div>
    </main>
  );
}

const styles = {
  page: { minHeight:'70vh', display:'flex', alignItems:'center', justifyContent:'center' },
  inner: { textAlign:'center', display:'flex', flexDirection:'column', alignItems:'center', gap:'20px' },
  code: { fontFamily:"'Playfair Display',serif", fontSize:'120px', fontWeight:700, lineHeight:1, background:'linear-gradient(135deg,#6366f1,#8b5cf6)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' },
  title: { fontFamily:"'Playfair Display',serif", fontSize:'28px', fontWeight:700, color:'#f1f5f9' },
  text: { color:'#475569', fontSize:'15px', maxWidth:'360px' },
};
