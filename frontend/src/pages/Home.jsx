import { useState, useEffect, useRef } from 'react';
import { blogAPI } from '../api/api';
import BlogCard from '../components/blog/BlogCard';
import anime from 'animejs';

const CATEGORIES = ['All', 'Technology', 'Design', 'Science', 'Culture', 'Business', 'Lifestyle'];

export default function Home() {
  const [blogs, setBlogs] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const heroRef  = useRef(null);
  const titleRef = useRef(null);

  useEffect(() => {
    blogAPI.getAll()
      .then(({ data }) => {
        const list = data.blogs || [];
        setBlogs(list);
        setFiltered(list);
      })
      .finally(() => setLoading(false));
  }, []);

  // Hero entrance animation
  useEffect(() => {
    anime.timeline({ easing: 'easeOutExpo' })
      .add({ targets: heroRef.current,  opacity: [0,1], translateY: [30,0], duration: 800 })
      .add({ targets: '.hero-word',     opacity: [0,1], translateY: [20,0], delay: anime.stagger(80), duration: 600 }, '-=400');
  }, []);

  // Filter logic
  useEffect(() => {
    let list = blogs;
    if (category !== 'All') list = list.filter(b => b.category?.toLowerCase() === category.toLowerCase());
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(b => b.title?.toLowerCase().includes(q) || b.subTitle?.toLowerCase().includes(q));
    }
    setFiltered(list);
  }, [category, search, blogs]);

  const heroWords = ['Discover.', 'Read.', 'Think.'];

  return (
    <main className="page-enter">
      {/* Hero */}
      <section ref={heroRef} style={styles.hero}>
        <div className="container" style={styles.heroInner}>
          <div style={styles.heroBadge}><span className="badge">✦ Inkwell Blog</span></div>
          <h1 style={styles.heroTitle}>
            {heroWords.map((w, i) => (
              <span key={i} className="hero-word" style={{ ...styles.heroWord, opacity: 0 }}>{w} </span>
            ))}
          </h1>
          <p style={styles.heroSub}>
            Curated stories on technology, design, culture, and everything in between.
          </p>
        </div>
        <div style={styles.heroBg} aria-hidden="true" />
      </section>

      {/* Controls */}
      <section style={styles.controls}>
        <div className="container" style={styles.controlsInner}>
          <input
            id="search-blogs"
            className="form-input"
            style={styles.searchInput}
            placeholder="🔍  Search articles…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <div style={styles.categoryRow}>
            {CATEGORIES.map(c => (
              <button
                key={c}
                style={{ ...styles.catBtn, ...(category === c ? styles.catBtnActive : {}) }}
                onClick={() => setCategory(c)}
                id={`cat-${c.toLowerCase()}`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Grid */}
      <section style={styles.grid}>
        <div className="container">
          {loading ? (
            <div style={styles.loadingState}>
              {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : filtered.length === 0 ? (
            <div style={styles.emptyState}>
              <span style={styles.emptyIcon}>📭</span>
              <p>No articles found. Try a different search or category.</p>
            </div>
          ) : (
            <div style={styles.blogGrid}>
              {filtered.map((blog, i) => (
                <BlogCard key={blog._id} blog={blog} index={i} />
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

function SkeletonCard() {
  return (
    <div style={styles.skeleton}>
      <div style={styles.skelImg} />
      <div style={{ padding: '18px' }}>
        <div style={{ ...styles.skelLine, width: '100%', height: '18px' }} />
        <div style={{ ...styles.skelLine, width: '70%', height: '14px', marginTop: '10px' }} />
        <div style={{ ...styles.skelLine, width: '40%', height: '12px', marginTop: '14px' }} />
      </div>
    </div>
  );
}

const styles = {
  hero: { position:'relative', padding:'100px 0 80px', overflow:'hidden' },
  heroInner: { position:'relative', zIndex:1, display:'flex', flexDirection:'column', alignItems:'center', textAlign:'center', gap:'20px' },
  heroBadge: { marginBottom:'8px' },
  heroTitle: { fontFamily:"'Playfair Display',serif", fontSize:'clamp(42px,7vw,76px)', fontWeight:700, lineHeight:1.1, color:'#f1f5f9', display:'flex', flexWrap:'wrap', justifyContent:'center', gap:'0 12px' },
  heroWord: { display:'inline-block' },
  heroSub: { fontSize:'clamp(15px,2vw,18px)', color:'#64748b', maxWidth:'500px', lineHeight:1.7 },
  heroBg: { position:'absolute', inset:0, background:'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(99,102,241,0.18) 0%, transparent 70%)', pointerEvents:'none' },
  controls: { padding:'0 0 36px', borderBottom:'1px solid rgba(99,102,241,0.08)' },
  controlsInner: { display:'flex', flexDirection:'column', gap:'16px' },
  searchInput: { maxWidth:'460px' },
  categoryRow: { display:'flex', flexWrap:'wrap', gap:'8px' },
  catBtn: { padding:'6px 16px', borderRadius:'999px', border:'1px solid rgba(99,102,241,0.15)', background:'transparent', color:'#64748b', fontSize:'13px', fontWeight:500, cursor:'pointer', transition:'all 0.2s' },
  catBtnActive: { background:'rgba(99,102,241,0.15)', color:'#818cf8', borderColor:'rgba(99,102,241,0.4)' },
  grid: { padding:'48px 0 80px' },
  blogGrid: { display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(320px,1fr))', gap:'28px' },
  loadingState: { display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(320px,1fr))', gap:'28px' },
  emptyState: { textAlign:'center', padding:'80px 0', color:'#475569', display:'flex', flexDirection:'column', alignItems:'center', gap:'16px' },
  emptyIcon: { fontSize:'48px' },
  skeleton: { background:'#10101e', border:'1px solid rgba(99,102,241,0.08)', borderRadius:'16px', overflow:'hidden' },
  skelImg: { background:'linear-gradient(90deg,#10101e 25%,#1a1a2e 50%,#10101e 75%)', backgroundSize:'200% 100%', animation:'shimmer 1.5s infinite', height:'180px' },
  skelLine: { background:'#1a1a2e', borderRadius:'4px' },
};
