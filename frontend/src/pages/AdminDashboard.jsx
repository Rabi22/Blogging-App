import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { adminAPI, blogAPI } from '../api/api';
import { useAuth } from '../context/AuthContext';
import anime from 'animejs';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats]         = useState(null);
  const [blogs, setBlogs]         = useState([]);
  const [comments, setComments]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [msg, setMsg]             = useState(null);
  const [actionId, setActionId]   = useState(null); // tracking loading state for single item actions
  
  const headerRef = useRef(null);
  const contentRef = useRef(null);

  useEffect(() => {
    anime({ targets: headerRef.current, translateY:[-20,0], opacity:[0,1], duration:600, easing:'easeOutExpo' });
    fetchData();
  }, []);

  useEffect(() => {
    // Animate tab content change
    if (contentRef.current) {
      anime({
        targets: contentRef.current,
        opacity: [0, 1],
        translateY: [15, 0],
        duration: 400,
        easing: 'easeOutQuad'
      });
    }
  }, [activeTab, loading]);

  const handleAuthError = (status) => {
    if (status === 401 || status === 403) {
      showMsg('error', 'Session expired or access denied. Please login again.');
      logout();
      setTimeout(() => navigate('/admin/login'), 1500);
      return true;
    }
    return false;
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [dashRes, blogRes, commRes] = await Promise.all([
        adminAPI.getDashboard(),
        adminAPI.getAllBlogs(),
        adminAPI.getAllComments()
      ]);

      // Check for auth errors on any of the responses
      if (handleAuthError(dashRes.status) || handleAuthError(blogRes.status) || handleAuthError(commRes.status)) {
        setLoading(false);
        return;
      }

      if (dashRes.ok && dashRes.data.dashBoardData) setStats(dashRes.data.dashBoardData);
      if (blogRes.ok && blogRes.data.blogs) setBlogs(blogRes.data.blogs);
      if (commRes.ok && commRes.data.comments) setComments(commRes.data.comments);
    } catch (err) {
      showMsg('error', 'Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  const showMsg = (type, text) => {
    setMsg({ type, text });
    setTimeout(() => setMsg(null), 3500);
  };

  // --- Blog Actions ---
  const handleTogglePublish = async (blog) => {
    setActionId(`toggle-${blog._id}`);
    const { ok, data, status } = await blogAPI.togglePublish(blog._id);
    setActionId(null);
    if (handleAuthError(status)) return;
    if (ok && data.blog) {
      setBlogs(prev => prev.map(b => b._id === blog._id ? { ...b, isPublished: data.blog.isPublished } : b));
      showMsg('success', `Blog ${data.blog.isPublished ? 'published' : 'unpublished'}.`);
      // Refresh stats
      const dashRes = await adminAPI.getDashboard();
      if (dashRes.ok && dashRes.data.dashBoardData) setStats(dashRes.data.dashBoardData);
    } else if (ok) {
      // Fallback: response OK but no blog data — toggle locally
      setBlogs(prev => prev.map(b => b._id === blog._id ? { ...b, isPublished: !b.isPublished } : b));
      showMsg('success', `Blog ${!blog.isPublished ? 'published' : 'unpublished'}.`);
      const dashRes = await adminAPI.getDashboard();
      if (dashRes.ok && dashRes.data.dashBoardData) setStats(dashRes.data.dashBoardData);
    } else {
      showMsg('error', data.message || 'Failed to update publish status.');
    }
  };

  const handleDeleteBlog = async (blog) => {
    if (!window.confirm(`Delete "${blog.title}"? This cannot be undone.`)) return;
    setActionId(`del-blog-${blog._id}`);
    const { ok, data, status } = await blogAPI.remove(blog._id);
    setActionId(null);
    if (handleAuthError(status)) return;
    if (ok) {
      setBlogs(prev => prev.filter(b => b._id !== blog._id));
      showMsg('success', 'Blog deleted successfully.');
      // Refresh stats
      const dashRes = await adminAPI.getDashboard();
      if (dashRes.ok && dashRes.data.dashBoardData) setStats(dashRes.data.dashBoardData);
    } else {
      showMsg('error', data.message || 'Failed to delete blog.');
    }
  };

  // --- Comment Actions ---
  const handleApproveComment = async (comment) => {
    setActionId(`app-comm-${comment._id}`);
    const { ok, status } = await adminAPI.approveComment(comment._id);
    setActionId(null);
    if (handleAuthError(status)) return;
    if (ok) {
      // Backend has a known bug: it always sends a misleading "Published : True" message,
      // but the actual approval (findByIdAndUpdate isApproved:true) DOES execute.
      // So we treat any 200 response as success and update locally.
      setComments(prev => prev.map(c => c._id === comment._id ? { ...c, isApproved: true } : c));
      showMsg('success', 'Comment approved.');
      // Refresh stats
      const dashRes = await adminAPI.getDashboard();
      if (dashRes.ok && dashRes.data.dashBoardData) setStats(dashRes.data.dashBoardData);
    } else {
      showMsg('error', 'Failed to approve comment.');
    }
  };

  const handleDeleteComment = async (comment) => {
    if (!window.confirm('Delete this comment?')) return;
    setActionId(`del-comm-${comment._id}`);
    const { ok, data, status } = await adminAPI.deleteComment(comment._id);
    setActionId(null);
    if (handleAuthError(status)) return;
    if (ok) {
      setComments(prev => prev.filter(c => c._id !== comment._id));
      showMsg('success', 'Comment deleted.');
      // Refresh stats
      const dashRes = await adminAPI.getDashboard();
      if (dashRes.ok && dashRes.data.dashBoardData) setStats(dashRes.data.dashBoardData);
    } else {
      showMsg('error', data.message || 'Failed to delete comment.');
    }
  };

  // --- Sub-components ---
  const renderOverview = () => {
    if (!stats) return <p style={s.empty}>No stats available.</p>;
    return (
      <>
        <div style={s.statsGrid}>
          <StatCard title="Total Blogs" value={stats.blogs} icon="📝" />
          <StatCard title="Published" value={stats.publishedBlogs} icon="🌐" color="#10b981" />
          <StatCard title="Drafts" value={stats.drafts} icon="🔒" color="#f59e0b" />
          <StatCard title="Comments" value={stats.comments} icon="💬" color="#6366f1" />
        </div>
        {/* Recent blogs */}
        {stats.recentBlogs && stats.recentBlogs.length > 0 && (
          <div style={{ marginTop: '32px' }}>
            <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:'20px', fontWeight:700, color:'#f1f5f9', marginBottom:'16px' }}>
              Recent Posts
            </h3>
            <div style={s.tableWrap}>
              {stats.recentBlogs.slice(0, 5).map(blog => (
                <div key={blog._id} style={s.row}>
                  <div style={s.titleCell}>
                    <img src={blog.image} alt="" style={s.thumb} onError={e => { e.target.onerror = null; e.target.src=`https://picsum.photos/seed/${blog._id}/80/60`; }} />
                    <div>
                      <p style={s.blogTitle}>{blog.title}</p>
                      <p style={s.blogSub}>{blog.category}</p>
                    </div>
                  </div>
                  <span style={s.cell}>
                    <span style={{ ...s.statusDot, background: blog.isPublished ? '#10b981' : '#ef4444' }} />
                    <span style={{ fontSize:'13px', color: blog.isPublished ? '#6ee7b7' : '#fca5a5' }}>
                      {blog.isPublished ? 'Live' : 'Draft'}
                    </span>
                  </span>
                  <span style={{...s.cell, color:'#475569', fontSize:'12px'}}>
                    {new Date(blog.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </>
    );
  };

  const renderBlogs = () => {
    if (blogs.length === 0) return <p style={s.empty}>No blogs found.</p>;
    return (
      <div style={s.tableWrap}>
        <div style={s.thead}>
          <span style={{flex:1}}>Title</span>
          <span style={s.thCell}>Status</span>
          <span style={s.thCell}>Date</span>
          <span style={{...s.thCell, textAlign:'right'}}>Actions</span>
        </div>
        {blogs.map(blog => (
          <div key={blog._id} style={s.row}>
            <div style={s.titleCell}>
              <img src={blog.image} alt="" style={s.thumb} onError={e => { e.target.onerror = null; e.target.src=`https://picsum.photos/seed/${blog._id}/80/60`; }} />
              <div>
                <p style={s.blogTitle}>{blog.title}</p>
                <p style={s.blogSub}>{blog.category}</p>
              </div>
            </div>
            <span style={s.cell}>
              <span style={{ ...s.statusDot, background: blog.isPublished ? '#10b981' : '#ef4444' }} />
              <span style={{ fontSize:'13px', color: blog.isPublished ? '#6ee7b7' : '#fca5a5' }}>
                {blog.isPublished ? 'Live' : 'Draft'}
              </span>
            </span>
            <span style={{...s.cell, color:'#475569', fontSize:'12px'}}>
              {new Date(blog.createdAt).toLocaleDateString()}
            </span>
            <div style={s.actions}>
              <button className="btn btn-outline btn-sm" onClick={() => handleTogglePublish(blog)} disabled={actionId === `toggle-${blog._id}`}>
                {actionId === `toggle-${blog._id}` ? <span className="spinner" style={{width:12,height:12}}/> : (blog.isPublished ? 'Unpublish' : 'Publish')}
              </button>
              <button className="btn btn-danger btn-sm" onClick={() => handleDeleteBlog(blog)} disabled={actionId === `del-blog-${blog._id}`}>
                {actionId === `del-blog-${blog._id}` ? <span className="spinner" style={{width:12,height:12}}/> : '🗑 Delete'}
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderComments = () => {
    if (comments.length === 0) return <p style={s.empty}>No comments found.</p>;
    const pendingComments = comments.filter(c => !c.isApproved);
    const approvedComments = comments.filter(c => c.isApproved);

    return (
      <div style={s.tableWrap}>
        {/* Pending section */}
        {pendingComments.length > 0 && (
          <>
            <h4 style={{ color:'#fbbf24', fontSize:'14px', fontWeight:600, marginBottom:'8px', display:'flex', alignItems:'center', gap:'6px' }}>
              ⏳ Pending Review ({pendingComments.length})
            </h4>
            {pendingComments.map(c => (
              <div key={c._id} style={{ ...s.row, alignItems:'flex-start', borderColor:'rgba(245,158,11,0.2)' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'6px', flexWrap:'wrap' }}>
                    <strong style={{ color:'#f1f5f9' }}>{c.name}</strong>
                    <span style={{ fontSize:'12px', color:'#64748b' }}>on {c.blog?.title || 'Unknown Blog'}</span>
                    <span className="badge" style={{background:'rgba(245,158,11,0.1)', color:'#fbbf24', borderColor:'rgba(245,158,11,0.2)'}}>Pending</span>
                  </div>
                  <p style={{ color:'#94a3b8', fontSize:'14px', lineHeight:1.5 }}>{c.content}</p>
                  <p style={{ color:'#475569', fontSize:'11px', marginTop:'4px' }}>
                    {new Date(c.createdAt).toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' })}
                  </p>
                </div>
                <div style={{ ...s.actions, marginTop:'0' }}>
                  <button className="btn btn-outline btn-sm" style={{borderColor:'#10b981', color:'#10b981'}} onClick={() => handleApproveComment(c)} disabled={actionId === `app-comm-${c._id}`}>
                    {actionId === `app-comm-${c._id}` ? <span className="spinner" style={{width:12,height:12}}/> : '✓ Approve'}
                  </button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDeleteComment(c)} disabled={actionId === `del-comm-${c._id}`}>
                    {actionId === `del-comm-${c._id}` ? <span className="spinner" style={{width:12,height:12}}/> : '🗑 Delete'}
                  </button>
                </div>
              </div>
            ))}
          </>
        )}

        {/* Approved section */}
        {approvedComments.length > 0 && (
          <>
            <h4 style={{ color:'#6ee7b7', fontSize:'14px', fontWeight:600, margin: pendingComments.length > 0 ? '20px 0 8px' : '0 0 8px', display:'flex', alignItems:'center', gap:'6px' }}>
              ✓ Approved ({approvedComments.length})
            </h4>
            {approvedComments.map(c => (
              <div key={c._id} style={{ ...s.row, alignItems:'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'6px', flexWrap:'wrap' }}>
                    <strong style={{ color:'#f1f5f9' }}>{c.name}</strong>
                    <span style={{ fontSize:'12px', color:'#64748b' }}>on {c.blog?.title || 'Unknown Blog'}</span>
                    <span className="badge" style={{background:'rgba(16,185,129,0.1)', color:'#6ee7b7', borderColor:'rgba(16,185,129,0.2)'}}>Approved</span>
                  </div>
                  <p style={{ color:'#94a3b8', fontSize:'14px', lineHeight:1.5 }}>{c.content}</p>
                  <p style={{ color:'#475569', fontSize:'11px', marginTop:'4px' }}>
                    {new Date(c.createdAt).toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' })}
                  </p>
                </div>
                <div style={{ ...s.actions, marginTop:'0' }}>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDeleteComment(c)} disabled={actionId === `del-comm-${c._id}`}>
                    {actionId === `del-comm-${c._id}` ? <span className="spinner" style={{width:12,height:12}}/> : '🗑 Delete'}
                  </button>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    );
  };

  return (
    <main className="page-enter">
      <div className="container" style={s.wrap}>
        {/* Header */}
        <div ref={headerRef} style={{ opacity:0, ...s.header }}>
          <div>
            <span className="badge">⚙️ Admin Dashboard</span>
            <h1 style={s.title}>Admin Control Panel</h1>
            <p style={s.sub}>Manage blogs, comments, and site analytics.</p>
          </div>
          <div style={{ display:'flex', gap:'10px', flexWrap:'wrap' }}>
            <button className="btn btn-outline btn-sm" onClick={fetchData} disabled={loading}>
              {loading ? <span className="spinner" style={{width:12,height:12}}/> : '🔄'} Refresh
            </button>
            <Link to="/create" className="btn btn-primary">
              ✏️ New Post
            </Link>
          </div>
        </div>

        {/* Tabs */}
        <div style={s.tabs}>
          <button style={activeTab === 'overview' ? s.activeTab : s.tab} onClick={() => setActiveTab('overview')}>Overview</button>
          <button style={activeTab === 'blogs' ? s.activeTab : s.tab} onClick={() => setActiveTab('blogs')}>
            Manage Blogs {blogs.length > 0 && <span style={s.countBadge}>{blogs.length}</span>}
          </button>
          <button style={activeTab === 'comments' ? s.activeTab : s.tab} onClick={() => setActiveTab('comments')}>
            Comments {comments.filter(c=>!c.isApproved).length > 0 && <span style={s.notiBadge}>{comments.filter(c=>!c.isApproved).length}</span>}
          </button>
        </div>

        {/* Toast */}
        {msg && <div className={`alert alert-${msg.type}`} style={s.toast}>{msg.text}</div>}

        {/* Content */}
        <div ref={contentRef} style={{ minHeight:'400px' }}>
          {loading ? (
             <div style={s.loadWrap}>
               <span className="spinner" style={{width:32,height:32,borderWidth:3}} />
               <p style={{ color:'#475569', marginTop:'16px' }}>Loading dashboard…</p>
             </div>
          ) : (
            <>
              {activeTab === 'overview' && renderOverview()}
              {activeTab === 'blogs'    && renderBlogs()}
              {activeTab === 'comments' && renderComments()}
            </>
          )}
        </div>
      </div>
    </main>
  );
}

const StatCard = ({ title, value, icon, color = '#f1f5f9' }) => (
  <div style={s.statCard}>
    <div style={{ fontSize:'28px' }}>{icon}</div>
    <div>
      <h3 style={{ fontSize:'24px', fontWeight:700, color, lineHeight:1.2 }}>{value ?? '—'}</h3>
      <p style={{ color:'#64748b', fontSize:'14px' }}>{title}</p>
    </div>
  </div>
);

const s = {
  wrap:      { padding:'48px 24px 80px' },
  header:    { display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'32px', flexWrap:'wrap', gap:'16px' },
  title:     { fontFamily:"'Playfair Display',serif", fontSize:'clamp(26px,4vw,38px)', fontWeight:700, color:'#f1f5f9', marginTop:'10px' },
  sub:       { color:'#475569', fontSize:'14px', marginTop:'4px' },
  toast:     { marginBottom:'20px', fontSize:'14px' },
  loadWrap:  { display:'flex', flexDirection:'column', alignItems:'center', padding:'80px 0' },
  empty:     { textAlign:'center', color:'#475569', padding:'60px 0' },
  
  tabs:      { display:'flex', gap:'8px', borderBottom:'1px solid rgba(99,102,241,0.1)', marginBottom:'24px', overflowX:'auto' },
  tab:       { background:'transparent', border:'none', padding:'10px 16px', color:'#64748b', fontSize:'15px', fontWeight:500, cursor:'pointer', borderBottom:'2px solid transparent', transition:'all 0.2s', display:'flex', alignItems:'center', gap:'6px', whiteSpace:'nowrap' },
  activeTab: { background:'transparent', border:'none', padding:'10px 16px', color:'#6366f1', fontSize:'15px', fontWeight:600, cursor:'pointer', borderBottom:'2px solid #6366f1', display:'flex', alignItems:'center', gap:'6px', whiteSpace:'nowrap' },
  notiBadge: { background:'#ef4444', color:'#fff', fontSize:'11px', padding:'2px 6px', borderRadius:'10px', fontWeight:700 },
  countBadge:{ background:'rgba(99,102,241,0.15)', color:'#818cf8', fontSize:'11px', padding:'2px 6px', borderRadius:'10px', fontWeight:700 },

  statsGrid: { display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))', gap:'20px' },
  statCard:  { background:'#10101e', border:'1px solid rgba(99,102,241,0.1)', borderRadius:'16px', padding:'24px', display:'flex', alignItems:'center', gap:'16px', boxShadow:'0 4px 20px rgba(0,0,0,0.2)' },
  
  tableWrap: { display:'flex', flexDirection:'column', gap:'10px' },
  thead:     { display:'flex', alignItems:'center', gap:'12px', padding:'0 16px 10px', borderBottom:'1px solid rgba(99,102,241,0.12)', fontSize:'12px', fontWeight:600, color:'#475569', letterSpacing:'0.05em', textTransform:'uppercase' },
  thCell:    { width:'110px', flexShrink:0 },
  row:       { display:'flex', alignItems:'center', gap:'12px', padding:'14px 16px', background:'#10101e', border:'1px solid rgba(99,102,241,0.1)', borderRadius:'12px', flexWrap:'wrap' },
  titleCell: { flex:1, display:'flex', alignItems:'center', gap:'14px', minWidth:'200px' },
  thumb:     { width:'60px', height:'44px', objectFit:'cover', borderRadius:'6px', flexShrink:0 },
  blogTitle: { fontSize:'14px', fontWeight:600, color:'#e2e8f0', lineHeight:1.4 },
  blogSub:   { fontSize:'12px', color:'#475569', marginTop:'2px' },
  cell:      { width:'110px', flexShrink:0, display:'flex', alignItems:'center', gap:'6px' },
  statusDot: { width:'7px', height:'7px', borderRadius:'50%', flexShrink:0 },
  actions:   { display:'flex', gap:'8px', flexWrap:'wrap', justifyContent:'flex-end' },
};
