import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { blogAPI } from '../api/api';
import { useAuth } from '../context/AuthContext';
import anime from 'animejs';

const CATEGORIES = ['Technology','Design','Science','Culture','Business','Lifestyle','Other'];

export default function CreateBlog() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.role === 'admin';
  const [form,setForm] = useState({ title:'', subTitle:'', description:'', category:'Technology', isPublished: false });
  const [image,setImage] = useState(null);
  const [preview,setPreview] = useState(null);
  const [error,setError] = useState('');
  const [loading,setLoading] = useState(false);
  const [success,setSuccess] = useState(false);
  const pageRef = useRef(null);

  useEffect(() => {
    anime({ targets: pageRef.current, translateY:[24,0], opacity:[0,1], duration:700, easing:'easeOutExpo' });
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be smaller than 5MB.');
      return;
    }
    setImage(file);
    setPreview(URL.createObjectURL(file));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { setError('Please enter a title.'); return; }
    if (!form.description.trim()) { setError('Please enter a description.'); return; }
    if (!image) { setError('Please select a cover image.'); return; }
    setError(''); setLoading(true);

    const fd = new FormData();
    fd.append('blog', JSON.stringify(form));
    fd.append('image', image);

    const { ok, data, status } = await blogAPI.create(fd);
    setLoading(false);

    if (status === 401 || status === 403) {
      setError('Session expired or access denied. Please login again.');
      return;
    }

    if (ok) {
      setSuccess(true);
      anime({ targets: '#success-banner', scale:[0.9,1], opacity:[0,1], duration:500, easing:'easeOutBack' });
      const redirectPath = isAdmin ? '/admin/dashboard' : '/my-posts';
      setTimeout(() => navigate(redirectPath), 2000);
    } else {
      setError(data.message || 'Failed to create blog. Try again.');
    }
  };

  return (
    <main className="page-enter">
      <div className="container" style={styles.wrapper}>
        <div ref={pageRef} style={{ opacity:0, maxWidth:'740px', margin:'0 auto' }}>
          <div style={styles.header}>
            <span className="badge">✦ New Article</span>
            <h1 style={styles.title}>Write Your Story</h1>
            <p style={styles.subtitle}>Share your ideas with the world</p>
          </div>

          {success && (
            <div id="success-banner" className="alert alert-success" style={{opacity:0,marginBottom:'20px',fontSize:'15px'}}>
              {isAdmin
                ? '✅ Blog created successfully! Redirecting to dashboard…'
                : '✅ Blog submitted for review! An admin will publish it soon. Redirecting…'}
            </div>
          )}
          {error && <div className="alert alert-error" style={{marginBottom:'20px'}}>{error}</div>}

          <form onSubmit={handleSubmit} style={styles.form}>
            {/* Cover image upload */}
            <div style={styles.uploadArea} onClick={() => document.getElementById('img-input').click()}>
              {preview
                ? <img src={preview} alt="Preview" style={styles.previewImg} />
                : (
                  <div style={styles.uploadPlaceholder}>
                    <span style={styles.uploadIcon}>🖼️</span>
                    <span style={styles.uploadText}>Click to upload cover image</span>
                    <span style={styles.uploadHint}>JPG, PNG, WEBP — max 5MB</span>
                  </div>
                )
              }
              <input id="img-input" type="file" accept="image/*" onChange={handleImage} style={{display:'none'}} />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="blog-title">Title *</label>
              <input id="blog-title" name="title" className="form-input"
                value={form.title} onChange={handleChange}
                placeholder="An Interesting Title…" required maxLength={200} />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="blog-subtitle">Subtitle</label>
              <input id="blog-subtitle" name="subTitle" className="form-input"
                value={form.subTitle} onChange={handleChange}
                placeholder="A brief intro line…" maxLength={300} />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="blog-desc">Description *</label>
              <textarea id="blog-desc" name="description" className="form-input"
                value={form.description} onChange={handleChange}
                placeholder="Write your full article content here…" required rows={8} />
            </div>

            <div style={styles.row}>
              <div className="form-group" style={{flex:1}}>
                <label className="form-label" htmlFor="blog-category">Category *</label>
                <select id="blog-category" name="category" className="form-input"
                  value={form.category} onChange={handleChange}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              {isAdmin ? (
                <div style={styles.publishToggle}>
                  <label className="form-label">Publish Now?</label>
                  <label style={styles.toggle}>
                    <input type="checkbox" name="isPublished"
                      checked={form.isPublished} onChange={handleChange} style={{display:'none'}} />
                    <div style={{ ...styles.toggleTrack, ...(form.isPublished ? styles.toggleActive : {}) }}>
                      <div style={{ ...styles.toggleThumb, ...(form.isPublished ? styles.thumbActive : {}) }} />
                    </div>
                    <span style={{fontSize:'13px',color: form.isPublished ? '#6ee7b7' : '#475569'}}>
                      {form.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </label>
                </div>
              ) : (
                <div style={styles.publishToggle}>
                  <label className="form-label" style={{color:'#fbbf24', fontSize:'12px'}}>📋 Your post will be reviewed by an admin before publishing</label>
                </div>
              )}
            </div>

            <div style={styles.actions}>
              <button type="button" className="btn btn-outline" onClick={() => navigate(-1)}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={loading || success} id="create-blog-btn">
                {loading ? <><span className="spinner" style={{width:16,height:16}} /> Creating…</> : '🚀 Publish'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}

const styles = {
  wrapper: { padding:'60px 24px 80px' },
  header: { textAlign:'center', marginBottom:'36px', display:'flex', flexDirection:'column', alignItems:'center', gap:'12px' },
  title: { fontFamily:"'Playfair Display',serif", fontSize:'clamp(28px,4vw,42px)', fontWeight:700, color:'#f1f5f9' },
  subtitle: { color:'#64748b', fontSize:'15px' },
  form: { display:'flex', flexDirection:'column', gap:'22px' },
  uploadArea: { border:'2px dashed rgba(99,102,241,0.25)', borderRadius:'14px', cursor:'pointer', overflow:'hidden', minHeight:'200px', display:'flex', alignItems:'center', justifyContent:'center', transition:'border-color 0.2s', background:'#0c0c16' },
  uploadPlaceholder: { display:'flex', flexDirection:'column', alignItems:'center', gap:'10px', padding:'40px' },
  uploadIcon: { fontSize:'40px' },
  uploadText: { color:'#94a3b8', fontSize:'15px', fontWeight:500 },
  uploadHint: { color:'#475569', fontSize:'12px' },
  previewImg: { width:'100%', height:'240px', objectFit:'cover' },
  row: { display:'flex', gap:'20px', flexWrap:'wrap' },
  publishToggle: { display:'flex', flexDirection:'column', gap:'8px', justifyContent:'center' },
  toggle: { display:'flex', alignItems:'center', gap:'10px', cursor:'pointer' },
  toggleTrack: { width:'44px', height:'24px', borderRadius:'12px', background:'#1a1a2e', border:'1px solid rgba(99,102,241,0.2)', position:'relative', transition:'all 0.25s' },
  toggleActive: { background:'rgba(99,102,241,0.25)', borderColor:'rgba(99,102,241,0.5)' },
  toggleThumb: { position:'absolute', top:'3px', left:'3px', width:'16px', height:'16px', borderRadius:'50%', background:'#475569', transition:'all 0.25s' },
  thumbActive: { left:'23px', background:'#6366f1' },
  actions: { display:'flex', gap:'12px', justifyContent:'flex-end', paddingTop:'8px' },
};
