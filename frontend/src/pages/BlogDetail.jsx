import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { blogAPI } from '../api/api';
import { useAuth } from '../context/AuthContext';
import CommentSection from '../components/blog/CommentSection';
import anime from 'animejs';

export default function BlogDetail() {
  const { id }        = useParams();
  const { user }      = useAuth();
  const navigate      = useNavigate();
  const [blog, setBlog]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [actionMsg, setActionMsg] = useState(null);
  const heroRef  = useRef(null);
  const titleRef = useRef(null);

  useEffect(() => {
    setLoading(true);
    blogAPI.getById(id)
      .then(({ ok, data }) => {
        if (ok && data.blog) setBlog(data.blog);
        else navigate('/');
      })
      .finally(() => setLoading(false));
  }, [id]);

  // Entrance animation
  useEffect(() => {
    if (!blog) return;
    anime.timeline({ easing: 'easeOutExpo' })
      .add({ targets: heroRef.current,  scale: [1.04, 1], opacity: [0, 1], duration: 900 })
      .add({ targets: titleRef.current, translateY: [30, 0], opacity: [0, 1], duration: 700 }, '-=500');
  }, [blog]);

  const showActionMsg = (type, text) => {
    setActionMsg({ type, text });
    setTimeout(() => setActionMsg(null), 3000);
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this blog permanently?')) return;
    setDeleting(true);
    const { ok, data } = await blogAPI.remove(id);
    setDeleting(false);
    if (ok) {
      showActionMsg('success', 'Blog deleted! Redirecting…');
      setTimeout(() => navigate('/'), 1200);
    } else {
      showActionMsg('error', data.message || 'Failed to delete blog. Try again.');
    }
  };

  const handleToggle = async () => {
    setToggling(true);
    const { ok, data } = await blogAPI.togglePublish(id);
    setToggling(false);
    if (ok) {
      const newStatus = data.blog?.isPublished ?? !blog.isPublished;
      setBlog(prev => ({ ...prev, isPublished: newStatus }));
      showActionMsg('success', `Blog ${newStatus ? 'published' : 'unpublished'} successfully!`);
    } else {
      showActionMsg('error', data.message || 'Failed to update publish status.');
    }
  };

  if (loading) return (
    <main style={styles.loadWrap}>
      <div style={{ display:'flex',flexDirection:'column',alignItems:'center',gap:'16px' }}>
        <span className="spinner" style={{ width:36,height:36,borderWidth:3 }} />
        <p style={{ color:'#475569' }}>Loading article…</p>
      </div>
    </main>
  );

  if (!blog) return null;

  const date = new Date(blog.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  return (
    <main className="page-enter">
      {/* Hero Image */}
      <div ref={heroRef} style={styles.hero}>
        <img src={blog.image} alt={blog.title} style={styles.heroImg}
          onError={e => { e.target.onerror = null; e.target.src = `https://picsum.photos/seed/${blog._id}/1200/500`; }} />
        <div style={styles.heroOverlay} />
      </div>

      <div className="container">
        <article style={styles.article}>
          {/* Header */}
          <header ref={titleRef} style={{ opacity:0 }}>
            <div style={styles.metaRow}>
              <span className="badge">{blog.category}</span>
              <span style={styles.date}>{date}</span>
              {user?.role === 'admin' && blog.isPublished !== undefined && (
                <span style={{
                  fontSize:'12px', fontWeight:500,
                  color: blog.isPublished ? '#6ee7b7' : '#fca5a5',
                  display:'flex', alignItems:'center', gap:'4px'
                }}>
                  <span style={{ width:'6px', height:'6px', borderRadius:'50%', background: blog.isPublished ? '#10b981' : '#ef4444' }} />
                  {blog.isPublished ? 'Published' : 'Draft'}
                </span>
              )}
            </div>
            <h1 style={styles.title}>{blog.title}</h1>
            {blog.subTitle && <p style={styles.subtitle}>{blog.subTitle}</p>}

            {/* Admin actions — only visible to admin role */}
            {user?.role === 'admin' && (
              <div style={styles.adminActions}>
                {actionMsg && (
                  <span className={`alert alert-${actionMsg.type}`} style={{fontSize:'13px',padding:'8px 12px'}}>
                    {actionMsg.text}
                  </span>
                )}
                <button className="btn btn-outline btn-sm" onClick={handleToggle} disabled={toggling} id="toggle-publish-btn">
                  {toggling ? <><span className="spinner" style={{width:12,height:12}}/> Updating…</> : (blog.isPublished ? '🔒 Unpublish' : '🌐 Publish')}
                </button>
                <Link to="/create" className="btn btn-outline btn-sm">✏️ New Post</Link>
                <button className="btn btn-danger btn-sm" onClick={handleDelete} disabled={deleting} id="delete-blog-btn">
                  {deleting ? <><span className="spinner" style={{width:12,height:12}}/> Deleting…</> : '🗑 Delete'}
                </button>
              </div>
            )}
          </header>

          <div className="divider" />

          {/* Content */}
          <div style={styles.contentBlock}>
            <p style={styles.contentNote}>
              {blog.description || blog.subTitle || 'No additional content available for this article.'}
            </p>
          </div>

          <div className="divider" />
          <CommentSection blogId={id} />
        </article>
      </div>
    </main>
  );
}

const styles = {
  loadWrap: { display:'flex', alignItems:'center', justifyContent:'center', minHeight:'60vh' },
  hero: { position:'relative', height:'420px', overflow:'hidden', marginBottom:'0' },
  heroImg: { width:'100%', height:'100%', objectFit:'cover', display:'block' },
  heroOverlay: { position:'absolute', inset:0, background:'linear-gradient(to bottom, rgba(7,7,13,0) 30%, rgba(7,7,13,1) 100%)' },
  article: { maxWidth:'780px', margin:'0 auto', padding:'40px 0 80px' },
  metaRow: { display:'flex', alignItems:'center', gap:'14px', marginBottom:'18px', flexWrap:'wrap' },
  date:    { fontSize:'13px', color:'#475569' },
  title:   { fontFamily:"'Playfair Display',serif", fontSize:'clamp(28px,5vw,46px)', fontWeight:700, color:'#f1f5f9', lineHeight:1.2, marginBottom:'16px' },
  subtitle:{ fontSize:'18px', color:'#64748b', lineHeight:1.7, marginBottom:'20px' },
  adminActions: { display:'flex', flexWrap:'wrap', gap:'10px', padding:'16px 0', borderTop:'1px solid rgba(99,102,241,0.1)', borderBottom:'1px solid rgba(99,102,241,0.1)', alignItems:'center' },
  contentBlock: { padding:'8px 0 24px' },
  contentNote:  { fontSize:'17px', color:'#94a3b8', lineHeight:1.8, whiteSpace:'pre-wrap' },
};
