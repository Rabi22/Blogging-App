import { useState, useEffect, useRef } from 'react';
import { blogAPI } from '../../api/api';
import anime from 'animejs';

export default function CommentSection({ blogId }) {
  const [comments, setComments] = useState([]);
  const [name, setName] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState(null);
  const formRef = useRef(null);

  useEffect(() => {
    if (!blogId) return;
    setLoading(true);
    blogAPI.getComments(blogId)
      .then(({ data }) => setComments(data.comments || []))
      .finally(() => setLoading(false));
  }, [blogId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !content.trim()) return;
    setSubmitting(true);
    const { ok } = await blogAPI.addComment(blogId, name.trim(), content.trim());
    setSubmitting(false);
    if (ok) {
      setMsg({ type: 'success', text: 'Comment submitted! It will appear after review.' });
      setName(''); setContent('');
      anime({ targets: formRef.current, translateX: [0, 8, -8, 4, -4, 0], duration: 400, easing: 'linear' });
    } else {
      setMsg({ type: 'error', text: 'Failed to submit comment. Try again.' });
    }
    setTimeout(() => setMsg(null), 4000);
  };

  return (
    <section style={styles.section}>
      <h3 style={styles.heading}>
        <span style={styles.headingAccent}>✦</span> Comments
        {comments.length > 0 && <span style={styles.count}>{comments.length}</span>}
      </h3>

      {/* Comment list */}
      {loading ? (
        <p style={styles.empty}>Loading comments…</p>
      ) : comments.length === 0 ? (
        <p style={styles.empty}>No comments yet. Be the first!</p>
      ) : (
        <div style={styles.list}>
          {comments.map((c) => (
            <div key={c._id} style={styles.commentCard}>
              <div style={styles.commentHeader}>
                <span style={styles.avatar}>{c.name[0]?.toUpperCase()}</span>
                <div>
                  <strong style={styles.commenterName}>{c.name}</strong>
                  <span style={styles.commentDate}>
                    {new Date(c.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
              </div>
              <p style={styles.commentText}>{c.content}</p>
            </div>
          ))}
        </div>
      )}

      {/* Submit form */}
      <form ref={formRef} onSubmit={handleSubmit} style={styles.form}>
        <h4 style={styles.formTitle}>Leave a Comment</h4>
        {msg && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}
        <div className="form-group">
          <label className="form-label">Your Name</label>
          <input className="form-input" value={name} onChange={e => setName(e.target.value)}
            placeholder="John Doe" required maxLength={50} />
        </div>
        <div className="form-group">
          <label className="form-label">Comment</label>
          <textarea className="form-input" value={content} onChange={e => setContent(e.target.value)}
            placeholder="Share your thoughts…" required maxLength={800} rows={4} />
        </div>
        <button type="submit" className="btn btn-primary" disabled={submitting} id="submit-comment-btn">
          {submitting ? <><span className="spinner" style={{ width: 14, height: 14 }} /> Sending…</> : 'Post Comment'}
        </button>
      </form>
    </section>
  );
}

const styles = {
  section: { marginTop: '60px' },
  heading: { fontFamily: "'Playfair Display',serif", fontSize: '24px', fontWeight: 700, color: '#f1f5f9', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '28px' },
  headingAccent: { color: '#6366f1', fontSize: '16px' },
  count: { fontSize: '14px', fontWeight: 500, background: 'rgba(99,102,241,0.12)', color: '#818cf8', padding: '2px 10px', borderRadius: '999px' },
  empty: { color: '#475569', fontStyle: 'italic', marginBottom: '32px' },
  list: { display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '40px' },
  commentCard: { background: '#10101e', border: '1px solid rgba(99,102,241,0.1)', borderRadius: '12px', padding: '18px 20px' },
  commentHeader: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' },
  avatar: { width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '15px', flexShrink: 0 },
  commenterName: { display: 'block', color: '#e2e8f0', fontSize: '14px', fontWeight: 600 },
  commentDate: { display: 'block', color: '#475569', fontSize: '12px', marginTop: '2px' },
  commentText: { color: '#94a3b8', fontSize: '14px', lineHeight: 1.65 },
  form: { background: '#10101e', border: '1px solid rgba(99,102,241,0.12)', borderRadius: '14px', padding: '28px', display: 'flex', flexDirection: 'column', gap: '18px' },
  formTitle: { fontFamily: "'Playfair Display',serif", fontSize: '18px', fontWeight: 700, color: '#f1f5f9' },
};
