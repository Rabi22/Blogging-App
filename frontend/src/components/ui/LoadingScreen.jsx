import { useEffect, useRef } from 'react';
import Loader from '../../utils/loading';

export default function LoadingScreen() {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.opacity = '0';
    requestAnimationFrame(() => {
      el.style.transition = 'opacity 0.5s ease';
      el.style.opacity = '1';
    });
  }, []);

  return (
    <div ref={ref} style={styles.wrapper}>
      <div style={styles.inner}>
        <Loader />
        <p style={styles.tagline}>
          <span style={styles.dot} /> Loading your stories…
        </p>
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    position: 'fixed', inset: 0,
    background: '#07070d',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 9999,
  },
  inner: {
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', gap: '28px',
  },
  tagline: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '15px', fontWeight: 400,
    color: '#64748b', letterSpacing: '0.04em',
    display: 'flex', alignItems: 'center', gap: '8px',
  },
  dot: {
    display: 'inline-block', width: '6px', height: '6px',
    borderRadius: '50%', background: '#6366f1',
    animation: 'pulse 1.4s ease-in-out infinite',
  },
};
