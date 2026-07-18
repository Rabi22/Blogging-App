import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { blogAPI } from '../api/api';
import { useAuth } from '../context/AuthContext';
import anime from 'animejs';

export default function MyPosts() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const pageRef = useRef(null);

  useEffect(() => {
    anime({ targets: pageRef.current, translateY:[24,0], opacity:[0,1], duration:700, easing:'easeOutExpo' });
    fetchMyBlogs();
  }, []);

  const fetchMyBlogs = async () => {
    setLoading(true);
    const { ok, data, status } = await blogAPI.getMyBlogs();
    setLoading(false);
    if (ok && data.blogs) {
      setBlogs(data.blogs);
    } else if (status === 401) {
      setError('Please log in to view your posts.');
    } else {
      setError(data.message || 'Failed to load your posts.');
    }
  };

  const published = blogs.filter(b => b.isPublished);
  const drafts = blogs.filter(b => !b.isPublished);

  return (
    <main className="page-enter">
      <div className="container" style={s.wrapper}>
        <div ref={pageRef} style={{ opacity: 0 }}>
          {/* Header */}
          <div style={s.header}>
            <span className="badge">✦ My Posts</span>
            <h1 style={s.title}>Your Stories</h1>
            <p style={s.subtitle}>Track and manage your blog submissions</p>
          </div>

          {/* Stats */}
          <div style={s.statsRow}>
            <div style={s.statCard}>
              <span style={s.statNumber}>{blogs.length}</span>
              <span style={s.statLabel}>Total Posts</span>
            </div>
            <div style={{...s.statCard, borderColor:'rgba(16,185,129,0.2)'}}>
              <span style={{...s.statNumber, color:'#10b981'}}>{published.length}</span>
              <span style={s.statLabel}>Published</span>
            </div>
            <div style={{...s.statCard, borderColor:'rgba(251,191,36,0.2)'}}>
              <span style={{...s.statNumber, color:'#fbbf24'}}>{drafts.length}</span>
              <span style={s.statLabel}>Under Review</span>
            </div>
          </div>

          {/* Action */}
          <div style={s.actionRow}>
            <Link to="/create" className="btn btn-primary" style={{background:'linear-gradient(135deg,#10b981,#059669)'}}>
              ✏️ Write New Post
            </Link>
          </div>

          {/* Loading */}
          {loading && (
            <div style={s.center}>
              <span className="spinner" style={{ width: 32, height: 32, borderWidth: 3 }} />
            </div>
          )}

          {/* Error */}
          {error && <div className="alert alert-error" style={{ marginBottom: '20px' }}>{error}</div>}

          {/* Empty */}
          {!loading && !error && blogs.length === 0 && (
            <div style={s.empty}>
              <span style={{ fontSize: '48px' }}>📝</span>
              <h3 style={s.emptyTitle}>No posts yet</h3>
              <p style={s.emptyText}>Start writing your first blog post and share your ideas with the world!</p>
              <Link to="/create" className="btn btn-primary" style={{background:'linear-gradient(135deg,#10b981,#059669)', marginTop:'8px'}}>
                Write Your First Post
              </Link>
            </div>
          )}

          {/* Published Posts */}
          {published.length > 0 && (
            <section style={s.section}>
              <h2 style={s.sectionTitle}>
                <span style={{...s.dot, background:'#10b981'}} />
                Published
              </h2>
              <div style={s.grid}>
                {published.map(blog => (
                  <BlogCard key={blog._id} blog={blog} status="published" />
                ))}
              </div>
            </section>
          )}

          {/* Drafts / Under Review */}
          {drafts.length > 0 && (
            <section style={s.section}>
              <h2 style={s.sectionTitle}>
                <span style={{...s.dot, background:'#fbbf24'}} />
                Under Review
              </h2>
              <div style={s.grid}>
                {drafts.map(blog => (
                  <BlogCard key={blog._id} blog={blog} status="review" />
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </main>
  );
}

function BlogCard({ blog, status }) {
  const cardRef = useRef(null);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    anime({ targets: cardRef.current, translateY:[20,0], opacity:[0,1], duration:500, delay: Math.random() * 200, easing:'easeOutExpo' });
  }, []);

  const statusConfig = {
    published: { color: '#10b981', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.25)', label: '✓ Published' },
    review:    { color: '#fbbf24', bg: 'rgba(251,191,36,0.1)', border: 'rgba(251,191,36,0.25)', label: '⏳ Under Review' },
  };
  const cfg = statusConfig[status];

  return (
    <div ref={cardRef} style={{ ...s.card, opacity: 0 }}>
      <div style={s.cardImgWrap}>
        {!imgError ? (
          <img
            src={blog.image}
            alt={blog.title}
            style={s.cardImg}
            onError={() => setImgError(true)}
          />
        ) : (
          <div style={s.cardImgFallback}>📷</div>
        )}
        <span style={{ ...s.statusBadge, color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.border}` }}>
          {cfg.label}
        </span>
      </div>
      <div style={s.cardBody}>
        <span style={s.cardCategory}>{blog.category}</span>
        <h3 style={s.cardTitle}>{blog.title}</h3>
        {blog.subTitle && <p style={s.cardSub}>{blog.subTitle}</p>}
        <div style={s.cardMeta}>
          <span style={s.cardDate}>{new Date(blog.createdAt).toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' })}</span>
          {status === 'published' && (
            <Link to={`/blog/${blog._id}`} style={s.viewLink}>View →</Link>
          )}
        </div>
      </div>
    </div>
  );
}

const s = {
  wrapper:    { padding: '60px 24px 80px' },
  header:     { textAlign: 'center', marginBottom: '36px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' },
  title:      { fontFamily: "'Playfair Display',serif", fontSize: 'clamp(28px,4vw,42px)', fontWeight: 700, color: '#f1f5f9' },
  subtitle:   { color: '#64748b', fontSize: '15px' },

  statsRow:   { display: 'flex', gap: '16px', justifyContent: 'center', marginBottom: '32px', flexWrap: 'wrap' },
  statCard:   { background: '#10101e', border: '1px solid rgba(99,102,241,0.15)', borderRadius: '14px', padding: '20px 28px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', minWidth: '120px' },
  statNumber: { fontFamily: "'Playfair Display',serif", fontSize: '28px', fontWeight: 700, color: '#f1f5f9' },
  statLabel:  { fontSize: '12px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' },

  actionRow:  { display: 'flex', justifyContent: 'center', marginBottom: '40px' },

  center:     { display: 'flex', justifyContent: 'center', padding: '60px 0' },
  empty:      { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', padding: '60px 20px', textAlign: 'center' },
  emptyTitle: { fontFamily: "'Playfair Display',serif", fontSize: '22px', fontWeight: 700, color: '#f1f5f9' },
  emptyText:  { color: '#64748b', fontSize: '14px', maxWidth: '400px', lineHeight: 1.65 },

  section:      { marginBottom: '40px' },
  sectionTitle: { fontFamily: "'Playfair Display',serif", fontSize: '20px', fontWeight: 700, color: '#f1f5f9', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' },
  dot:          { width: '8px', height: '8px', borderRadius: '50%', display: 'inline-block' },

  grid:       { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' },

  card:       { background: '#10101e', border: '1px solid rgba(99,102,241,0.12)', borderRadius: '16px', overflow: 'hidden', transition: 'border-color 0.25s, transform 0.25s', cursor: 'default' },
  cardImgWrap: { position: 'relative', height: '180px', overflow: 'hidden', background: '#0c0c16' },
  cardImg:     { width: '100%', height: '100%', objectFit: 'cover' },
  cardImgFallback: { width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px', background: '#0c0c16' },
  statusBadge: { position: 'absolute', top: '12px', right: '12px', fontSize: '11px', fontWeight: 600, padding: '4px 10px', borderRadius: '999px' },

  cardBody:    { padding: '18px 20px' },
  cardCategory: { fontSize: '11px', fontWeight: 600, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.06em' },
  cardTitle:    { fontFamily: "'Playfair Display',serif", fontSize: '18px', fontWeight: 700, color: '#f1f5f9', margin: '6px 0 4px', lineHeight: 1.35 },
  cardSub:      { fontSize: '13px', color: '#64748b', lineHeight: 1.5, marginBottom: '8px' },
  cardMeta:     { display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid rgba(99,102,241,0.08)' },
  cardDate:     { fontSize: '12px', color: '#475569' },
  viewLink:     { fontSize: '13px', color: '#10b981', textDecoration: 'none', fontWeight: 500 },
};
