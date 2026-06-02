import { useEffect, useState } from "react";
import { C } from "./lib/tokens";
import { TMDB_BG, TMDB_KEY, searchMulti, fetchItemById } from "./lib/tmdb";
import { readWatchFromURL, writeWatchToURL } from "./lib/url";
import { useIsMobile } from "./hooks/useIsMobile";
import { CATALOG, ALL_GENRES } from "./data/catalog";
import { PosterCard } from "./components/PosterCard";
import { EpisodeModal } from "./components/EpisodeModal";

export default function App() {
  const isMobile = useIsMobile();
  const [selected, setSelected]             = useState(null);
  const [initialWatch, setInitialWatch]     = useState(null);
  const [search, setSearch]                 = useState("");
  const [genre, setGenre]                   = useState("All");
  const [tab, setTab]                       = useState("all");
  const [featuredIdx, setFeaturedIdx]       = useState(0);
  const [searchResults, setSearchResults]   = useState([]);
  const [isSearching, setIsSearching]       = useState(false);
  const isLiveSearch = search.length >= 2;

  // ── Restore from URL on first load ────────────────────────────────────────
  useEffect(() => {
    const w = readWatchFromURL();
    if (!w) return;
    const inCatalog = CATALOG.find(x => x.type === w.type && x.id === w.id);
    if (inCatalog) {
      setInitialWatch(w);
      setSelected(inCatalog);
      return;
    }
    if (!TMDB_KEY) return;
    fetchItemById(w.type, w.id).then(item => {
      if (!item) return;
      setInitialWatch(w);
      setSelected(item);
    }).catch(() => {});
  }, []);

  // ── Open / close keep URL in step ─────────────────────────────────────────
  const openItem = (item) => {
    setInitialWatch(null);
    setSelected(item);
    writeWatchToURL(item, { season: 1, episode: 1, playing: false });
  };
  const closeModal = () => {
    setSelected(null);
    setInitialWatch(null);
    writeWatchToURL(null);
  };

  // ── TMDB live search ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!isLiveSearch) { setSearchResults([]); setIsSearching(false); return; }
    setIsSearching(true);
    const ctrl = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const results = await searchMulti(search, ctrl.signal);
        setSearchResults(results.filter(r => tab === "all" || r.type === tab));
      } catch { /* ignore */ }
      setIsSearching(false);
    }, 400);
    return () => { ctrl.abort(); clearTimeout(timer); };
  }, [search, tab]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Google Fonts (could move to index.html for a tiny perf win) ───────────
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Cinzel+Display&family=Cinzel:wght@400;600&family=DM+Sans:wght@300;400;500&display=swap";
    document.head.appendChild(link);
  }, []);

  const featured = CATALOG[featuredIdx];

  const catalogFiltered = CATALOG.filter(item => {
    const matchSearch = item.title.toLowerCase().includes(search.toLowerCase());
    const matchGenre  = genre === "All" || item.genres.includes(genre);
    const matchTab    = tab === "all" || item.type === tab;
    return matchSearch && matchGenre && matchTab;
  });

  const displayItems = isLiveSearch ? searchResults : catalogFiltered;
  const movies       = displayItems.filter(x => x.type === "movie");
  const shows        = displayItems.filter(x => x.type === "tv");
  const showMovies   = tab === "all" || tab === "movie";
  const showTV       = tab === "all" || tab === "tv";

  // ── Responsive layout tokens ──────────────────────────────────────────────
  const sidePad        = isMobile ? 16 : 52;
  const heroPad        = `${isMobile ? 20 : 28}px ${sidePad}px 0`;
  const navPad         = `${isMobile ? 18 : 28}px ${sidePad}px`;
  const sectionPad     = `${isMobile ? 28 : 36}px ${sidePad}px 0`;
  const lastSectionPad = `${isMobile ? 32 : 40}px ${sidePad}px ${isMobile ? 48 : 60}px`;
  const gridMin        = isMobile ? 108 : 148;

  const sectionHeader = (label, count) => (
    <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 22 }}>
      <h2 style={{ fontFamily: "'Cinzel',serif", fontSize: 15, margin: 0, color: C.accent, letterSpacing: "0.18em", textTransform: "uppercase" }}>{label}</h2>
      <div style={{ flex: 1, height: 1, background: `${C.accent}26` }} />
      <span style={{ fontSize: 12, color: "rgba(255,255,255,0.25)" }}>{count} titles</span>
    </div>
  );

  return (
    <div style={{ fontFamily: "'DM Sans',sans-serif", background: C.bg, minHeight: "100vh", color: "#fff", overflowX: "hidden" }}>

      {/* HERO */}
      <div style={{ position: "relative", minHeight: isMobile ? 580 : 560, overflow: "hidden" }}>
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: `url(${TMDB_BG}${featured.backdrop})`,
          backgroundSize: "cover",
          backgroundPosition: isMobile ? "right center" : "center top",
          filter: "brightness(0.45)",
        }} />
        <div style={{
          position: "absolute", inset: 0,
          background: isMobile
            ? `linear-gradient(180deg, rgba(8,15,8,0.55) 0%, rgba(8,15,8,0.92) 80%)`
            : `linear-gradient(90deg, rgba(8,15,8,0.97) 0%, rgba(8,15,8,0.65) 50%, rgba(8,15,8,0.15) 100%)`,
        }} />
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 160, background: `linear-gradient(to top, ${C.bg}, transparent)` }} />

        {/* NAV */}
        <nav style={{
          position: "relative", padding: navPad,
          display: "flex", justifyContent: "space-between", alignItems: "center",
          gap: 12, flexWrap: "wrap",
        }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
            <span style={{
              fontFamily: "'Cinzel Display',serif",
              fontSize: isMobile ? 20 : 26,
              color: C.accent, letterSpacing: "0.22em",
            }}>Zekepeke</span>
            {!isMobile && (
              <span style={{ fontSize: 10, color: `${C.accent}80`, letterSpacing: "0.3em" }}>(MOVIES & SHOWS)</span>
            )}
          </div>
          <div style={{
            display: "flex", gap: 4,
            background: "rgba(255,255,255,0.06)",
            borderRadius: 8, padding: 4,
          }}>
            {[["all","All"],["movie","Movies"],["tv","TV"]].map(([val,label]) => (
              <button key={val} onClick={() => setTab(val)} style={{
                background: tab === val ? C.accent : "transparent", border: "none",
                color: tab === val ? C.bg : "rgba(255,255,255,0.55)",
                padding: isMobile ? "6px 14px" : "8px 20px",
                borderRadius: 6, cursor: "pointer",
                fontSize: isMobile ? 12 : 13,
                fontWeight: tab === val ? 600 : 400, transition: "all 0.15s",
              }}>{label}</button>
            ))}
          </div>
        </nav>

        {/* HERO CONTENT */}
        <div style={{ position: "relative", padding: heroPad, paddingBottom: isMobile ? 32 : 0 }}>
          <div style={{
            fontSize: isMobile ? 9 : 10,
            letterSpacing: "0.35em", color: C.accent,
            textTransform: "uppercase",
            marginBottom: isMobile ? 10 : 14, fontWeight: 500,
          }}>My favorites</div>
          <h1 style={{
            fontFamily: "'Cinzel',serif",
            fontSize: `clamp(28px, 7vw, 52px)`,
            margin: "0 0 12px", lineHeight: 1.05,
            maxWidth: isMobile ? "100%" : 520,
            color: "#f5f0e0", letterSpacing: "0.02em", fontWeight: 600,
          }}>{featured.title}</h1>
          <div style={{
            display: "flex", gap: 12, alignItems: "center",
            marginBottom: 14, flexWrap: "wrap",
          }}>
            <span style={{ color: C.accent, fontWeight: 700, fontSize: 14 }}>★ {featured.rating}</span>
            <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}>{featured.year}</span>
            <span style={{ color: "rgba(255,255,255,0.2)" }}>·</span>
            {featured.genres.slice(0, isMobile ? 2 : 5).map(g => (
              <span key={g} style={{
                fontSize: 11, color: "rgba(255,255,255,0.45)",
                background: "rgba(255,255,255,0.07)",
                padding: "3px 9px", borderRadius: 4, letterSpacing: "0.06em",
              }}>{g}</span>
            ))}
          </div>
          <p style={{
            color: "rgba(255,255,255,0.65)",
            maxWidth: isMobile ? "100%" : 430,
            fontSize: isMobile ? 13 : 14,
            lineHeight: 1.65,
            marginBottom: isMobile ? 22 : 28,
            display: "-webkit-box",
            WebkitLineClamp: isMobile ? 4 : 6,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}>{featured.overview}</p>

          <div style={{
            display: "flex",
            gap: isMobile ? 18 : 12,
            alignItems: isMobile ? "flex-start" : "center",
            flexDirection: isMobile ? "column" : "row",
          }}>
            <button onClick={() => openItem(featured)}
              style={{
                background: C.accent, color: C.bg, border: "none",
                padding: isMobile ? "14px 32px" : "13px 32px",
                borderRadius: 7,
                fontSize: 14, fontWeight: 700, cursor: "pointer",
                letterSpacing: "0.08em",
                boxShadow: `0 4px 20px ${C.accent}55`,
                width: isMobile ? "100%" : "auto",
                maxWidth: isMobile ? 320 : "none",
              }}
              onMouseEnter={e => { e.target.style.background = C.accentDark; }}
              onMouseLeave={e => { e.target.style.background = C.accent; }}
            >▶ Watch Now</button>
            <div style={{ display: "flex", gap: 6 }}>
              {[0,1,2,3,4].map(i => (
                <button key={i} onClick={() => setFeaturedIdx(i)} style={{
                  width: i === featuredIdx ? 24 : 7, height: 7, borderRadius: 4, border: "none",
                  background: i === featuredIdx ? C.accent : "rgba(255,255,255,0.25)",
                  cursor: "pointer", padding: 0, transition: "all 0.3s",
                }} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* SEARCH + FILTERS */}
      <div style={{ padding: sectionPad }}>
        <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap", marginBottom: 20 }}>
          <div style={{ position: "relative", width: isMobile ? "100%" : "auto" }}>
            <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 14, color: "rgba(255,255,255,0.3)" }}>
              {isSearching ? "⏳" : "🔍"}
            </span>
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search any movie or TV show…"
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "#fff",
                padding: "11px 16px 11px 38px",
                borderRadius: 8, fontSize: 14,
                width: isMobile ? "100%" : 300,
                outline: "none",
              }}
              onFocus={e => e.target.style.borderColor = C.borderStrong}
              onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"} />
          </div>
          {isLiveSearch && (
            <span style={{ fontSize: 12, color: `${C.accent}b3`, letterSpacing: "0.08em" }}>
              {isSearching ? "Searching TMDB…" : `${displayItems.length} results for "${search}"`}
            </span>
          )}
        </div>
        {!isLiveSearch && (
          <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
            {ALL_GENRES.map(g => (
              <button key={g} onClick={() => setGenre(g)} style={{
                background: genre === g ? C.accent : "rgba(255,255,255,0.05)",
                border: `1px solid ${genre === g ? C.accent : "rgba(255,255,255,0.1)"}`,
                color: genre === g ? C.bg : "rgba(255,255,255,0.55)",
                padding: "6px 15px", borderRadius: 20, cursor: "pointer",
                fontSize: 12, fontWeight: genre === g ? 600 : 400, transition: "all 0.15s",
              }}>{g}</button>
            ))}
          </div>
        )}
      </div>

      {showMovies && movies.length > 0 && (
        <section style={{ padding: sectionPad }}>
          {sectionHeader("Movies", movies.length)}
          <div style={{
            display: "grid",
            gridTemplateColumns: `repeat(auto-fill, minmax(${gridMin}px, 1fr))`,
            gap: isMobile ? "20px 12px" : "24px 18px",
          }}>
            {movies.map(item => <PosterCard key={item.id} item={item} onClick={openItem} />)}
          </div>
        </section>
      )}

      {showTV && shows.length > 0 && (
        <section style={{ padding: lastSectionPad }}>
          {sectionHeader("TV Series", shows.length)}
          <div style={{
            display: "grid",
            gridTemplateColumns: `repeat(auto-fill, minmax(${gridMin}px, 1fr))`,
            gap: isMobile ? "20px 12px" : "24px 18px",
          }}>
            {shows.map(item => <PosterCard key={item.id} item={item} onClick={openItem} />)}
          </div>
        </section>
      )}

      {!isSearching && displayItems.length === 0 && (
        <div style={{ textAlign: "center", padding: "80px 0", color: "rgba(255,255,255,0.25)" }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>🎬</div>
          <div style={{ fontFamily: "'Cinzel',serif", letterSpacing: "0.1em" }}>
            {isLiveSearch ? `No results for "${search}"` : "No titles found"}
          </div>
        </div>
      )}

      <div style={{
        borderTop: `1px solid rgba(255,255,255,0.06)`,
        padding: `24px ${sidePad}px`,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 12, flexWrap: "wrap",
      }}>
        <span style={{ fontFamily: "'Cinzel Display',serif", color: `${C.accent}66`, fontSize: 14, letterSpacing: "0.2em" }}>Zekepeke</span>
        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", letterSpacing: "0.06em" }}>Watch movies for free</span>
      </div>

      {selected && (
        <EpisodeModal
          item={selected}
          initial={initialWatch || {}}
          onClose={closeModal}
          onWatchStateChange={(state) => writeWatchToURL(selected, state)}
        />
      )}
    </div>
  );
}
