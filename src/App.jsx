import { useState, useEffect, useRef } from "react";

const TMDB_W = "https://image.tmdb.org/t/p/w500";
const TMDB_BG = "https://image.tmdb.org/t/p/w1280";
const TMDB_KEY = import.meta.env.VITE_TMDB_KEY;

// ── Color tokens (mirror of index.css vars, for inline styles) ───────────────
const C = {
  accent:       "#729C65",
  accentDark:   "#4E763B",
  accentMuted:  "#637462",
  accentDim:    "#6D835C",
  bg:           "#080f08",
  bgModal:      "#0b140b",
  bgCard:       "#121a12",
  bgBar:        "#080e08",
  border:       "rgba(114,156,101,0.18)",
  borderStrong: "rgba(114,156,101,0.35)",
};

const CATALOG = [
  // MOVIES
  {
    id: 11, type: "movie", title: "Star Wars: Episode IV - A New Hope", year: 1977, rating: 8.6,
    genres: ["Adventure", "Action", "Sci-Fi"],
    poster: "/6FfCtAuVAW8XJjZ7eWeLibRLWTw.jpg",
    backdrop: "/zqkmTXzjkAgXmEWLRsY4UpTWCeo.jpg",
    overview: "Princess Leia is captured and held hostage by the evil Imperial forces in their effort to take over the galactic Empire. Venturesome Luke Skywalker and dashing captain Han Solo team together with the loveable robot duo R2-D2 and C-3PO to rescue the beautiful princess and restore peace and justice in the Empire."
  },
  {
    id: 380, type: "movie", title: "Rain Man", year: 1988, rating: 8.0,
    genres: ["Drama"],
    poster: "/aWCSqmznoEWx4352pEDxWj586L4.jpg",
    backdrop: "/7GvSObYjVz0JmYq05p2Wf0G5Z1A.jpg",
    overview: "When car dealer Charlie Babbitt learns that his estranged father has died, he returns home to Cincinnati, where he discovers that he has an autistic older brother named Raymond and that his father's $3 million fortune is being left to the mental institution in which Raymond lives."
  },
  {
    id: 550, type: "movie", title: "Fight Club", year: 1999, rating: 8.8,
    genres: ["Drama", "Thriller"],
    poster: "/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg",
    backdrop: "/87hTDiay2N2qWyX4Ds7HRDmr1of.jpg",
    overview: "An insomniac office worker and a devil-may-care soapmaker form an underground fight club that evolves into something much, much more."
  },
  {
    id: 557, type: "movie", title: "Spider-Man", year: 2002, rating: 7.4,
    genres: ["Action", "Sci-Fi"],
    poster: "/gh4cZbhZxyTbgxQPxD0dOudNPTn.jpg",
    backdrop: "/sYn3X08Vd05qfW2v2Y1Q0B7Kj7p.jpg",
    overview: "After being bitten by a genetically altered spider, nerdy high school student Peter Parker is endowed with amazing powers to become the superhero known as Spider-Man."
  },
  // TV SHOWS
  {
    id: 60059, type: "tv", title: "Better Call Saul", year: 2015, rating: 8.9,
    genres: ["Crime", "Drama"],
    poster: "/fC2HDm5t0kHlAMOINqdpWcle0qG.jpg",
    backdrop: "/pXjpqrx65RlRAhvGuCvVRkZYTij.jpg",
    overview: "The trials and tribulations of criminal lawyer Jimmy McGill in the years leading up to his fateful run-in with Walter White and Jesse Pinkman.",
    seasons: 6, episodesPerSeason: [10, 10, 10, 10, 10, 13]
  },
  {
    id: 1396, type: "tv", title: "Breaking Bad", year: 2008, rating: 9.5,
    genres: ["Crime", "Drama", "Thriller"],
    poster: "/ggFHVNu6YYI5L9pCfOacjizRGt.jpg",
    backdrop: "/tsRy63Mu5cu8etL1X7ZLyf7UP1M.jpg",
    overview: "A high school chemistry teacher diagnosed with inoperable lung cancer turns to manufacturing and selling methamphetamine with a former student.",
    seasons: 5, episodesPerSeason: [7, 13, 13, 13, 16]
  },
  {
    id: 1416, type: "tv", title: "The Sopranos", year: 1999, rating: 9.2,
    genres: ["Crime", "Drama"],
    poster: "/8tq5lQdG00Rz0Qe23h6LntD2p3p.jpg",
    backdrop: "/uzq1RzB1Q8D1eA1gL01N4e4G7mO.jpg",
    overview: "New Jersey mob boss Tony Soprano deals with personal and professional issues in his home and business life that affect his mental state, leading him to seek professional psychiatric counseling.",
    seasons: 6, episodesPerSeason: [13, 13, 13, 13, 13, 21]
  }
];

const ALL_GENRES = ["All", ...Array.from(new Set(CATALOG.flatMap(m => m.genres))).sort()];

function normalizeTMDB(r) {
  if (r.media_type === "person") return null;
  const type = r.media_type;
  const dateStr = type === "tv" ? r.first_air_date : r.release_date;
  return {
    id: r.id, type,
    title: type === "tv" ? r.name : r.title,
    year: parseInt(dateStr?.split("-")[0]) || 0,
    rating: Math.round(r.vote_average * 10) / 10,
    poster: r.poster_path || null,
    backdrop: r.backdrop_path || null,
    overview: r.overview || "",
    genres: [], seasons: undefined, episodesPerSeason: undefined,
  };
}

function PosterCard({ item, onClick }) {
  const [imgErr, setImgErr] = useState(false);
  return (
    <div
      onClick={() => onClick(item)}
      style={{ cursor: "pointer", transition: "transform 0.25s ease" }}
      onMouseEnter={e => e.currentTarget.style.transform = "scale(1.05) translateY(-4px)"}
      onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
    >
      <div style={{
        aspectRatio: "2/3", borderRadius: 10, overflow: "hidden",
        background: C.bgCard, position: "relative",
        border: "1px solid rgba(255,255,255,0.06)",
      }}>
        {!imgErr && item.poster ? (
          <img src={`${TMDB_W}${item.poster}`} alt={item.title} onError={() => setImgErr(true)}
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        ) : (
          <div style={{
            width: "100%", height: "100%", display: "flex", alignItems: "center",
            justifyContent: "center", background: `linear-gradient(145deg,${C.bgCard},${C.bgModal})`,
            fontSize: 40, color: `${C.accent}66`, fontFamily: "'Cinzel Display', serif",
          }}>{item.title[0]}</div>
        )}
        <div style={{ position: "absolute", inset: 0, background: `linear-gradient(to top, rgba(8,15,8,0.9) 0%, transparent 55%)` }} />
        <div style={{ position: "absolute", bottom: 10, left: 10 }}>
          <span style={{ color: C.accent, fontSize: 10, fontWeight: 700 }}>★ {item.rating}</span>
        </div>
        {item.type === "tv" && (
          <div style={{
            position: "absolute", top: 8, right: 8,
            background: `${C.accent}e6`, color: C.bg,
            fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 3, letterSpacing: "0.1em",
          }}>TV</div>
        )}
      </div>
      <div style={{ marginTop: 10 }}>
        <div style={{ fontSize: 12, fontWeight: 500, color: "#e8e8e8", lineHeight: 1.4 }}>{item.title}</div>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 3 }}>{item.year}</div>
      </div>
    </div>
  );
}

function EpisodeModal({ item, onClose }) {
  const iframeRef = useRef(null);
  const maxSeason = item.seasons || null;
  const [season, setSeason] = useState(1);
  const [episode, setEpisode] = useState(1);
  const [playing, setPlaying] = useState(false);
  const eps = item.episodesPerSeason?.[season - 1] || null;

  const vidSrc = item.type === "tv"
    ? `https://www.vidking.net/embed/tv/${item.id}/${season}/${episode}?color=729C65&autoPlay=true&nextEpisode=true&episodeSelector=true`
    : `https://www.vidking.net/embed/movie/${item.id}?color=729C65&autoPlay=true`;

  const goFullscreen = () => iframeRef.current?.requestFullscreen();

  const goPiP = async () => {
    if ("documentPictureInPicture" in window) {
      const pipWin = await window.documentPictureInPicture.requestWindow({ width: 640, height: 390 });
      pipWin.document.body.style.cssText = "margin:0;background:#000;overflow:hidden";
      const f = pipWin.document.createElement("iframe");
      f.src = vidSrc;
      f.style.cssText = "width:100%;height:100%;border:none;display:block";
      f.allow = "autoplay; fullscreen";
      pipWin.document.body.appendChild(f);
    } else {
      window.open(vidSrc, "cinemax-pip", "width=640,height=390,toolbar=no,menubar=no,resizable=yes");
    }
  };

  const inputStyle = {
    background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)",
    color: "#fff", padding: "8px 12px", borderRadius: 6, fontSize: 13,
    width: 80, outline: "none", textAlign: "center",
  };

  const btnAccent = {
    background: C.accent, color: C.bg,
    border: "none", padding: "10px 24px", borderRadius: 6,
    fontSize: 14, fontWeight: 700, cursor: "pointer", letterSpacing: "0.06em",
  };

  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, zIndex: 9000,
      background: "rgba(0,0,0,0.88)", backdropFilter: "blur(4px)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: "20px",
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        width: "100%", maxWidth: 1000, background: C.bgModal,
        borderRadius: 14, overflow: "hidden",
        border: `1px solid ${C.border}`,
        boxShadow: "0 40px 80px rgba(0,0,0,0.8)",
      }}>

        {/* ── Header ── */}
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "flex-start",
          padding: "20px 24px 16px", borderBottom: `1px solid rgba(255,255,255,0.06)`,
        }}>
          <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
            {item.poster && (
              <img src={`${TMDB_W}${item.poster}`} alt={item.title}
                onError={e => e.target.style.display = "none"}
                style={{ width: 52, height: 78, objectFit: "cover", borderRadius: 6, flexShrink: 0 }} />
            )}
            <div>
              <h2 style={{ margin: "0 0 4px", fontSize: 22, fontFamily: "'Cinzel Display','Cinzel',serif", color: "#f0ead0", letterSpacing: "0.04em" }}>{item.title}</h2>
              <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                <span style={{ color: C.accent, fontSize: 13, fontWeight: 600 }}>★ {item.rating}</span>
                <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 12 }}>{item.year}</span>
                {item.genres.length > 0 && <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 12 }}>{item.genres.join(" · ")}</span>}
              </div>
              <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, margin: "8px 0 0", lineHeight: 1.6, maxWidth: 480 }}>{item.overview}</p>
            </div>
          </div>
          <button onClick={onClose} style={{
            background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
            color: "rgba(255,255,255,0.7)", width: 34, height: 34, borderRadius: "50%",
            cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>✕</button>
        </div>

        {/* ── TV episode selector ── */}
        {item.type === "tv" && !playing && (
          <div style={{ padding: "20px 24px", borderBottom: `1px solid rgba(255,255,255,0.06)` }}>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "center" }}>
              {maxSeason ? (
                <>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <label style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", letterSpacing: "0.12em", textTransform: "uppercase" }}>Season</label>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {Array.from({ length: maxSeason }, (_, i) => i + 1).map(s => (
                        <button key={s} onClick={() => { setSeason(s); setEpisode(1); }} style={{
                          width: 34, height: 34, borderRadius: 6,
                          background: season === s ? C.accent : "rgba(255,255,255,0.06)",
                          border: `1px solid ${season === s ? C.accent : "rgba(255,255,255,0.1)"}`,
                          color: season === s ? C.bg : "rgba(255,255,255,0.6)",
                          cursor: "pointer", fontSize: 13, fontWeight: season === s ? 700 : 400,
                        }}>{s}</button>
                      ))}
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <label style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", letterSpacing: "0.12em", textTransform: "uppercase" }}>Episode</label>
                    <select value={episode} onChange={e => setEpisode(Number(e.target.value))} style={{
                      background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)",
                      color: "#fff", padding: "8px 12px", borderRadius: 6, fontSize: 13,
                      cursor: "pointer", appearance: "none", minWidth: 140,
                    }}>
                      {Array.from({ length: eps || 20 }, (_, i) => i + 1).map(ep => (
                        <option key={ep} value={ep} style={{ background: C.bgCard }}>Episode {ep}</option>
                      ))}
                    </select>
                  </div>
                </>
              ) : (
                <>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <label style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", letterSpacing: "0.12em", textTransform: "uppercase" }}>Season</label>
                    <input type="number" min="1" value={season} onChange={e => setSeason(Math.max(1, Number(e.target.value)))} style={inputStyle} />
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <label style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", letterSpacing: "0.12em", textTransform: "uppercase" }}>Episode</label>
                    <input type="number" min="1" value={episode} onChange={e => setEpisode(Math.max(1, Number(e.target.value)))} style={inputStyle} />
                  </div>
                  <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>(type any season / episode number)</span>
                </>
              )}
              <button onClick={() => setPlaying(true)} style={btnAccent}>▶ Play</button>
            </div>
          </div>
        )}

        {/* ── Player ── */}
        {(item.type === "movie" || playing) && (
          <div style={{ background: "#000" }}>
            {/* Hint — correctly placed above the iframe */}
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.22)", textAlign: "center", padding: "8px 0 4px", margin: 0 }}>
              If playback fails, try "Show All Servers" inside the player or come back later.
            </p>
            <iframe ref={iframeRef} src={vidSrc} width="100%" height={500}
              frameBorder="0" allowFullScreen allow="autoplay; fullscreen"
              style={{ display: "block" }} />
            <div style={{
              display: "flex", justifyContent: "flex-end", gap: 8,
              padding: "8px 12px", background: C.bgBar,
              borderTop: "1px solid rgba(255,255,255,0.05)",
            }}>
              <button onClick={goPiP} style={{
                background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)",
                color: "rgba(255,255,255,0.6)", padding: "6px 14px", borderRadius: 6,
                cursor: "pointer", fontSize: 12, fontWeight: 600, letterSpacing: "0.06em",
              }}>⧉ Picture in Picture</button>
              <button onClick={goFullscreen} style={{
                background: `${C.accent}1a`, border: `1px solid ${C.borderStrong}`,
                color: C.accent, padding: "6px 14px", borderRadius: 6,
                cursor: "pointer", fontSize: 12, fontWeight: 600, letterSpacing: "0.06em",
              }}>⛶ Fullscreen</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function App() {
  const [selected, setSelected] = useState(null);
  const [search, setSearch]     = useState("");
  const [genre, setGenre]       = useState("All");
  const [tab, setTab]           = useState("all");
  const [featuredIdx, setFeaturedIdx] = useState(0);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching]     = useState(false);
  const isLiveSearch = search.length >= 2;

  useEffect(() => {
    if (!isLiveSearch) { setSearchResults([]); setIsSearching(false); return; }
    setIsSearching(true);
    const timer = setTimeout(async () => {
      try {
        const res  = await fetch(`https://api.themoviedb.org/3/search/multi?api_key=${TMDB_KEY}&query=${encodeURIComponent(search)}&include_adult=false`);
        const data = await res.json();
        setSearchResults((data.results || []).map(normalizeTMDB).filter(Boolean).filter(r => tab === "all" || r.type === tab));
      } catch { setSearchResults([]); }
      setIsSearching(false);
    }, 400);
    return () => clearTimeout(timer);
  }, [search, tab]);

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Cinzel+Display&family=Cinzel:wght@400;600&family=DM+Sans:wght@300;400;500&display=swap";
    document.head.appendChild(link);
  }, []);

  const featured       = CATALOG[featuredIdx];
  const catalogFiltered = CATALOG.filter(item => {
    const matchSearch = item.title.toLowerCase().includes(search.toLowerCase());
    const matchGenre  = genre === "All" || item.genres.includes(genre);
    const matchTab    = tab === "all" || item.type === tab;
    return matchSearch && matchGenre && matchTab;
  });

  const displayItems = isLiveSearch ? searchResults : catalogFiltered;
  const movies    = displayItems.filter(x => x.type === "movie");
  const shows     = displayItems.filter(x => x.type === "tv");
  const showMovies = tab === "all" || tab === "movie";
  const showTV     = tab === "all" || tab === "tv";

  const sectionHeader = (label, count) => (
    <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 22 }}>
      <h2 style={{ fontFamily: "'Cinzel',serif", fontSize: 15, margin: 0, color: C.accent, letterSpacing: "0.18em", textTransform: "uppercase" }}>{label}</h2>
      <div style={{ flex: 1, height: 1, background: `${C.accent}26` }} />
      <span style={{ fontSize: 12, color: "rgba(255,255,255,0.25)" }}>{count} titles</span>
    </div>
  );

  return (
    <div style={{ fontFamily: "'DM Sans',sans-serif", background: C.bg, minHeight: "100vh", color: "#fff", overflowX: "hidden" }}>

      {/* ── HERO ── */}
      <div style={{ position: "relative", height: 560, overflow: "hidden" }}>
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: `url(${TMDB_BG}${featured.backdrop})`,
          backgroundSize: "cover", backgroundPosition: "center top", filter: "brightness(0.45)",
        }} />
        {/* left-to-right fade with green tint */}
        <div style={{ position: "absolute", inset: 0, background: `linear-gradient(90deg, rgba(8,15,8,0.97) 0%, rgba(8,15,8,0.65) 50%, rgba(8,15,8,0.15) 100%)` }} />
        {/* bottom fade */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 180, background: `linear-gradient(to top, ${C.bg}, transparent)` }} />

        {/* NAV */}
        <nav style={{ position: "relative", padding: "28px 52px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
            <span style={{ fontFamily: "'Cinzel Display',serif", fontSize: 26, color: C.accent, letterSpacing: "0.22em" }}>Zekepeke movies</span>
            <span style={{ fontSize: 10, color: `${C.accent}80`, letterSpacing: "0.3em" }}>(the best movies)</span>
          </div>
          <div style={{ display: "flex", gap: 4, background: "rgba(255,255,255,0.06)", borderRadius: 8, padding: 4 }}>
            {[["all","All"],["movie","Movies"],["tv","TV Shows"]].map(([val,label]) => (
              <button key={val} onClick={() => setTab(val)} style={{
                background: tab === val ? C.accent : "transparent", border: "none",
                color: tab === val ? C.bg : "rgba(255,255,255,0.55)",
                padding: "8px 20px", borderRadius: 6, cursor: "pointer",
                fontSize: 13, fontWeight: tab === val ? 600 : 400, transition: "all 0.15s",
              }}>{label}</button>
            ))}
          </div>
        </nav>

        {/* HERO CONTENT */}
        <div style={{ position: "relative", padding: "20px 52px 0" }}>
          <div style={{ fontSize: 10, letterSpacing: "0.35em", color: C.accent, textTransform: "uppercase", marginBottom: 14, fontWeight: 500 }}>My favorites</div>
          <h1 style={{ fontFamily: "'Cinzel',serif", fontSize: 52, margin: "0 0 14px", lineHeight: 1.05, maxWidth: 520, color: "#f5f0e0", letterSpacing: "0.02em", fontWeight: 600 }}>{featured.title}</h1>
          <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 16 }}>
            <span style={{ color: C.accent, fontWeight: 700, fontSize: 14 }}>★ {featured.rating}</span>
            <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}>{featured.year}</span>
            <span style={{ color: "rgba(255,255,255,0.2)" }}>·</span>
            {featured.genres.map(g => (
              <span key={g} style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", background: "rgba(255,255,255,0.07)", padding: "3px 9px", borderRadius: 4, letterSpacing: "0.06em" }}>{g}</span>
            ))}
          </div>
          <p style={{ color: "rgba(255,255,255,0.6)", maxWidth: 430, fontSize: 14, lineHeight: 1.7, marginBottom: 28 }}>{featured.overview}</p>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <button
              onClick={() => setSelected(featured)}
              style={{ background: C.accent, color: C.bg, border: "none", padding: "13px 32px", borderRadius: 7, fontSize: 14, fontWeight: 700, cursor: "pointer", letterSpacing: "0.08em", boxShadow: `0 4px 20px ${C.accent}55` }}
              onMouseEnter={e => { e.target.style.background = C.accentDark; e.target.style.boxShadow = `0 8px 28px ${C.accent}77`; }}
              onMouseLeave={e => { e.target.style.background = C.accent; e.target.style.boxShadow = `0 4px 20px ${C.accent}55`; }}
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

      {/* ── SEARCH + FILTERS ── */}
      <div style={{ padding: "36px 52px 0" }}>
        <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap", marginBottom: 20 }}>
          <div style={{ position: "relative" }}>
            <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 14, color: "rgba(255,255,255,0.3)" }}>
              {isSearching ? "⏳" : "🔍"}
            </span>
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search any movie or TV show…"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", padding: "11px 16px 11px 38px", borderRadius: 8, fontSize: 14, width: 300, outline: "none" }}
              onFocus={e => e.target.style.borderColor = C.borderStrong}
              onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
            />
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

      {/* ── MOVIES ── */}
      {showMovies && movies.length > 0 && (
        <section style={{ padding: "36px 52px 0" }}>
          {sectionHeader("Movies", movies.length)}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(148px, 1fr))", gap: "24px 18px" }}>
            {movies.map(item => <PosterCard key={item.id} item={item} onClick={setSelected} />)}
          </div>
        </section>
      )}

      {/* ── TV SHOWS ── */}
      {showTV && shows.length > 0 && (
        <section style={{ padding: "40px 52px 60px" }}>
          {sectionHeader("TV Series", shows.length)}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(148px, 1fr))", gap: "24px 18px" }}>
            {shows.map(item => <PosterCard key={item.id} item={item} onClick={setSelected} />)}
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

      {/* ── FOOTER ── */}
      <div style={{ borderTop: `1px solid rgba(255,255,255,0.06)`, padding: "24px 52px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontFamily: "'Cinzel Display',serif", color: `${C.accent}66`, fontSize: 14, letterSpacing: "0.2em" }}>Zekepeke movies</span>
        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", letterSpacing: "0.06em" }}>Watch movies for free</span>
      </div>

      {selected && <EpisodeModal item={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}