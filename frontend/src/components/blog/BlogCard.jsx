import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import anime from 'animejs';

export default function BlogCard({ blog, index = 0 }) {
  const ref = useRef(null);

  useEffect(() => {
    anime({
      targets: ref.current,
      translateY: [40, 0],
      opacity: [0, 1],
      duration: 600,
      delay: index * 80,
      easing: 'easeOutExpo',
    });
  }, [index]);

  const date = new Date(blog.createdAt).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });

  return (
    <Link to={`/blog/${blog._id}`} ref={ref} style={styles.card} className="card">
      <div style={styles.imageWrap}>
        <img
          src={blog.image}
          alt={blog.title}
          style={styles.image}
          onError={(e) => { e.target.onerror = null; e.target.src = `https://picsum.photos/seed/${blog._id}/600/340`; }}
        />
        <span className="badge" style={styles.badge}>{blog.category}</span>
      </div>
      <div style={styles.body}>
        <h3 style={styles.title}>{blog.title}</h3>
        {blog.subTitle && <p style={styles.subtitle}>{blog.subTitle}</p>}
        <div style={styles.meta}>
          <span style={styles.date}>{date}</span>
          <span style={styles.readMore}>Read →</span>
        </div>
      </div>
    </Link>
  );
}

const styles = {
  card: {
    display: 'block', textDecoration: 'none',
    background: '#10101e', border: '1px solid rgba(99,102,241,0.12)',
    borderRadius: '16px', overflow: 'hidden',
    transition: 'all 0.25s ease', opacity: 0,
  },
  imageWrap: { position: 'relative', overflow: 'hidden', aspectRatio: '16/9' },
  image: {
    width: '100%', height: '100%', objectFit: 'cover',
    transition: 'transform 0.4s ease', display: 'block',
  },
  badge: { position: 'absolute', top: '12px', left: '12px' },
  body: { padding: '20px 22px 22px' },
  title: {
    fontFamily: "'Playfair Display', serif",
    fontSize: '19px', fontWeight: 700,
    color: '#f1f5f9', lineHeight: 1.35, marginBottom: '8px',
    display: '-webkit-box', WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical', overflow: 'hidden',
  },
  subtitle: {
    fontSize: '14px', color: '#64748b', lineHeight: 1.55,
    marginBottom: '14px',
    display: '-webkit-box', WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical', overflow: 'hidden',
  },
  meta: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  date: { fontSize: '12px', color: '#475569' },
  readMore: { fontSize: '13px', color: '#6366f1', fontWeight: 500 },
};
