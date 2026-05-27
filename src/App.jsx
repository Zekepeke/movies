import { useState, useEffect, useRef } from "react";

const TMDB_W     = "https://image.tmdb.org/t/p/w500";
const TMDB_BG    = "https://image.tmdb.org/t/p/w1280";
const TMDB_STILL = "https://image.tmdb.org/t/p/w300";
const TMDB_KEY   = import.meta.env.VITE_TMDB_KEY;

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

// ── Responsive hook ───────────────────────────────────────────────────────
function useIsMobile() {
  const [m, setM] = useState(typeof window !== "undefined" && window.innerWidth < 640);
  useEffect(() => {
    const onResize = () => setM(window.innerWidth < 640);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return m;
}

const CATALOG = [
  { id: 11, type: "movie", title: "Star Wars: Episode IV - A New Hope", year: 1977, rating: 8.6,
    genres: ["Adventure","Action","Sci-Fi"],
    poster: "/6FfCtAuVAW8XJjZ7eWeLibRLWTw.jpg",
    backdrop: "/zqkmTXzjkAgXmEWLRsY4UpTWCeo.jpg",
    overview: "Princess Leia is captured and held hostage by the evil Imperial forces in their effort to take over the galactic Empire. Venturesome Luke Skywalker and dashing captain Han Solo team together with the loveable robot duo R2-D2 and C-3PO to rescue the beautiful princess and restore peace and justice in the Empire." },
  { id: 380, type: "movie", title: "Rain Man", year: 1988, rating: 8.0,
    genres: ["Drama"],
    poster: "/aWCSqmznoEWx4352pEDxWj586L4.jpg",
    backdrop: "/7GvSObYjVz0JmYq05p2Wf0G5Z1A.jpg",
    overview: "When car dealer Charlie Babbitt learns that his estranged father has died, he returns home to Cincinnati, where he discovers that he has an autistic older brother named Raymond and that his father's $3 million fortune is being left to the mental institution in which Raymond lives." },
  { id: 550, type: "movie", title: "Fight Club", year: 1999, rating: 8.8,
    genres: ["Drama","Thriller"],
    poster: "/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg",
    backdrop: "/87hTDiay2N2qWyX4Ds7HRDmr1of.jpg",
    overview: "An insomniac office worker and a devil-may-care soapmaker form an underground fight club that evolves into something much, much more." },
  { id: 557, type: "movie", title: "Spider-Man", year: 2002, rating: 7.4,
    genres: ["Action","Sci-Fi"],
    poster: "/gh4cZbhZxyTbgxQPxD0dOudNPTn.jpg",
    backdrop: "/sYn3X08Vd05qfW2v2Y1Q0B7Kj7p.jpg",
    overview: "After being bitten by a genetically altered spider, nerdy high school student Peter Parker is endowed with amazing powers to become the superhero known as Spider-Man." },
  { id: 60059, type: "tv", title: "Better Call Saul", year: 2015, rating: 8.9,
    genres: ["Crime","Drama"],
    poster: "/fC2HDm5t0kHlAMOINqdpWcle0qG.jpg",
    backdrop: "/pXjpqrx65RlRAhvGuCvVRkZYTij.jpg",
    overview: "The trials and tribulations of criminal lawyer Jimmy McGill in the years leading up to his fateful run-in with Walter White and Jesse Pinkman.",
    seasons: 6, episodesPerSeason: [10,10,10,10,10,13] },
  { id: 1396, type: "tv", title: "Breaking Bad", year: 2008, rating: 9.5,
    genres: ["Crime","Drama","Thriller"],
    poster: "/ggFHVNu6YYI5L9pCfOacjizRGt.jpg",
    backdrop: "/tsRy63Mu5cu8etL1X7ZLyf7UP1M.jpg",
    overview: "A high school chemistry teacher diagnosed with inoperable lung cancer turns to manufacturing and selling methamphetamine with a former student.",
    seasons: 5, episodesPerSeason: [7,13,13,13,16] },
  { id: 1416, type: "tv", title: "The Sopranos", year: 1999, rating: 9.2,
    genres: ["Crime","Drama"],
    poster: "/8tq5lQdG00Rz0Qe23h6LntD2p3p.jpg",
    backdrop: "/uzq1RzB1Q8D1eA1gL01N4e4G7mO.jpg",
    overview: "New Jersey mob boss Tony Soprano deals with personal and professional issues in his home and business life that affect his mental state, leading him to seek professional psychiatric counseling.",
    seasons: 6, episodesPerSeason: [13,13,13,13,13,21] },
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
    <div onClick={() => onClick(item)}
      style={{ cursor: "pointer", transition: "transform 0.25s ease" }}
      onMouseEnter={e => e.currentTarget.style.transform = "scale(1.05) translateY(-4px)"}
      onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}>
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

// ─── Episode row — responsive still + content ─────────────────────────────
function EpisodeRow({ ep, isActive, onClick, isMobile }) {
  const [hover, setHover] = useState(false);
  return (
    <div onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: "flex", gap: isMobile ? 10 : 16, padding: isMobile ? 10 : 14, cursor: "pointer",
        background: isActive ? `${C.accent}1a` : (hover ? "rgba(255,255,255,0.03)" : "transparent"),
        borderRadius: 8, transition: "background 0.15s",
        alignItems: "flex-start",
        borderBottom: "1px solid rgba(255,255,255,0.04)",
      }}>
      <div style={{
        fontSize: isMobile ? 22 : 28, fontWeight: 300, color: isActive ? C.accent : "rgba(255,255,255,0.4)",
        minWidth: isMobile ? 22 : 32, textAlign: "center", lineHeight: 1, paddingTop: 4,
        fontFamily: "'Cinzel', serif",
      }}>{ep.episode_number}</div>

      <div style={{
        width: isMobile ? 110 : 168, height: isMobile ? 62 : 95, flexShrink: 0, borderRadius: 6, overflow: "hidden",
        background: C.bgCard, position: "relative",
      }}>
        {ep.still_path ? (
          <img src={`${TMDB_STILL}${ep.still_path}`} alt=""
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        ) : (
          <div style={{
            width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center",
            color: `${C.accent}44`, fontSize: 24,
          }}>▸</div>
        )}
        {hover && !isMobile && (
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: C.accent, display: "flex", alignItems: "center", justifyContent: "center", color: C.bg, fontSize: 14 }}>▶</div>
          </div>
        )}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8, marginBottom: 4 }}>
          <span style={{ fontSize: isMobile ? 13 : 15, fontWeight: 600, color: "#f0ead0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {ep.name || `Episode ${ep.episode_number}`}
          </span>
          {ep.runtime && <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", flexShrink: 0 }}>{ep.runtime}m</span>}
        </div>
        <p style={{
          fontSize: isMobile ? 11 : 12, color: "rgba(255,255,255,0.55)", lineHeight: 1.5, margin: 0,
          display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}>{ep.overview || "No description available."}</p>
      </div>
    </div>
  );
}

// ─── Modal — responsive: fullscreen on mobile, centered card on desktop ───
function EpisodeModal({ item, onClose }) {
  const isMobile = useIsMobile();
  const iframeRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [season, setSeason]   = useState(1);
  const [episode, setEpisode] = useState(1);
  const [showData, setShowData]     = useState(null);
  const [seasonData, setSeasonData] = useState(null);
  const [seasonLoading, setSeasonLoading] = useState(false);

  useEffect(() => {
    if (item.type !== "tv" || !TMDB_KEY) return;
    fetch(`https://api.themoviedb.org/3/tv/${item.id}?api_key=${TMDB_KEY}`)
      .then(r => r.json()).then(setShowData).catch(() => {});
  }, [item.id, item.type]);

  useEffect(() => {
    if (item.type !== "tv" || !TMDB_KEY) return;
    setSeasonLoading(true);
    fetch(`https://api.themoviedb.org/3/tv/${item.id}/season/${season}?api_key=${TMDB_KEY}`)
      .then(r => r.json()).then(d => { setSeasonData(d); setSeasonLoading(false); }).catch(() => setSeasonLoading(false));
  }, [item.id, item.type, season]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        if (playing && item.type === "tv") setPlaying(false);
        else onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [playing, item.type, onClose]);

  const seasons = showData?.seasons?.filter(s => s.season_number > 0)
    || (item.seasons ? Array.from({ length: item.seasons }, (_, i) => ({ season_number: i + 1, name: `Season ${i + 1}` })) : [{ season_number: 1, name: "Season 1" }]);
  const episodes = seasonData?.episodes || null;

  const vidSrc = item.type === "tv"
    ? `https://www.vidking.net/embed/tv/${item.id}/${season}/${episode}?color=729C65&autoPlay=true&nextEpisode=true`
    : `https://www.vidking.net/embed/movie/${item.id}?color=729C65&autoPlay=true`;

  const currentEpName = episodes?.find(e => e.episode_number === episode)?.name;
  const goFullscreen = () => iframeRef.current?.requestFullscreen();

  const goPiP = async () => {
    const subtitle = item.type === "tv"
      ? `${item.title} — S${season} · E${episode}${currentEpName ? ` · ${currentEpName}` : ""}`
      : item.title;
    if ("documentPictureInPicture" in window) {
      const pipWin = await window.documentPictureInPicture.requestWindow({ width: 720, height: 460 });
      pipWin.document.body.style.cssText = `margin:0;background:${C.bg};overflow:hidden;display:flex;flex-direction:column;height:100vh;font-family:system-ui,-apple-system,'DM Sans',sans-serif;color:#fff;`;
      const header = pipWin.document.createElement("div");
      header.style.cssText = `padding:10px 14px;background:${C.bgModal};border-bottom:1px solid ${C.border};flex-shrink:0;display:flex;align-items:center;gap:10px;`;
      header.innerHTML = `<span style="color:${C.accent};font-weight:700;letter-spacing:0.18em;font-size:10px;">▸ NOW PLAYING</span><span style="color:rgba(255,255,255,0.85);font-size:12px;font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${subtitle}</span>`;
      pipWin.document.body.appendChild(header);
      const f = pipWin.document.createElement("iframe");
      f.src = vidSrc;
      f.style.cssText = "flex:1;width:100%;border:none;display:block;background:#000;";
      f.allow = "autoplay; fullscreen";
      pipWin.document.body.appendChild(f);
    } else {
      window.open(vidSrc, "zekepeke-pip", "width=720,height=460,toolbar=no,menubar=no,resizable=yes");
    }
  };

  const selectEpisode = (n) => { setEpisode(n); setPlaying(true); };

  // ── PLAYER MODE ───────────────────────────────────────────────────────────
  if (playing) {
    return (
      <div onClick={onClose} style={{
        position: "fixed", inset: 0, zIndex: 9000,
        background: "rgba(0,0,0,0.95)", backdropFilter: "blur(8px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: isMobile ? 0 : 16,
      }}>
        <div onClick={e => e.stopPropagation()} style={{
          width: isMobile ? "100%" : "min(1280px, 96vw)",
          height: isMobile ? "100%" : "auto",
          background: "#000",
          borderRadius: isMobile ? 0 : 12, overflow: "hidden",
          border: isMobile ? "none" : `1px solid ${C.border}`,
          boxShadow: isMobile ? "none" : "0 40px 100px rgba(0,0,0,0.9)",
          display: "flex", flexDirection: "column",
        }}>
          {/* Top bar */}
          <div style={{
            display: "flex", alignItems: "center", gap: isMobile ? 8 : 16,
            padding: isMobile ? "10px 12px" : "12px 18px",
            background: C.bgModal,
            borderBottom: `1px solid ${C.border}`,
          }}>
            {item.type === "tv" && (
              <button onClick={() => setPlaying(false)}
                style={{
                  background: "transparent", border: "none",
                  color: "rgba(255,255,255,0.7)", cursor: "pointer",
                  fontSize: isMobile ? 12 : 13, fontWeight: 500,
                  padding: isMobile ? "4px 8px" : "6px 12px",
                  borderRadius: 6, letterSpacing: "0.04em",
                  display: "flex", alignItems: "center", gap: 6, flexShrink: 0,
                }}>← {isMobile ? "" : "Episodes"}</button>
            )}
            <div style={{ flex: 1, minWidth: 0, display: "flex", alignItems: "baseline", gap: 8, overflow: "hidden" }}>
              <span style={{ fontFamily: "'Cinzel',serif", fontSize: isMobile ? 13 : 15, color: "#f0ead0", letterSpacing: "0.04em", whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}>{item.title}</span>
              {item.type === "tv" && (
                <span style={{ fontSize: isMobile ? 11 : 12, color: C.accent, fontWeight: 600, letterSpacing: "0.06em", whiteSpace: "nowrap" }}>
                  S{season}·E{episode}
                </span>
              )}
            </div>
            <button onClick={onClose} style={{
              background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
              color: "rgba(255,255,255,0.7)", width: 30, height: 30, borderRadius: "50%",
              cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}>✕</button>
          </div>

          {/* Player */}
          <div style={{ background: "#000", flex: isMobile ? 1 : "none" }}>
            <iframe ref={iframeRef} src={vidSrc}
              style={{ width: "100%", height: isMobile ? "100%" : "min(70vh, 720px)", border: "none", display: "block" }}
              allowFullScreen allow="autoplay; fullscreen" />
          </div>

          {/* Bottom action bar */}
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: isMobile ? "8px 10px" : "10px 18px",
            background: C.bgBar, borderTop: "1px solid rgba(255,255,255,0.05)",
            gap: 8, flexWrap: "wrap",
          }}>
            {!isMobile && (
              <span style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", letterSpacing: "0.15em" }}>
                IF PLAYBACK FAILS, TRY "SHOW ALL SERVERS" INSIDE THE PLAYER
              </span>
            )}
            <div style={{ display: "flex", gap: 8, marginLeft: "auto" }}>
              <button onClick={goPiP} style={{
                background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)",
                color: "rgba(255,255,255,0.7)",
                padding: isMobile ? "6px 10px" : "7px 16px",
                borderRadius: 6, cursor: "pointer",
                fontSize: isMobile ? 11 : 12, fontWeight: 600, letterSpacing: "0.04em",
              }}>⧉ {isMobile ? "PiP" : "Picture in Picture"}</button>
              <button onClick={goFullscreen} style={{
                background: `${C.accent}1a`, border: `1px solid ${C.borderStrong}`,
                color: C.accent,
                padding: isMobile ? "6px 10px" : "7px 16px",
                borderRadius: 6, cursor: "pointer",
                fontSize: isMobile ? 11 : 12, fontWeight: 600, letterSpacing: "0.04em",
              }}>⛶ {isMobile ? "Full" : "Fullscreen"}</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── BROWSE MODE ───────────────────────────────────────────────────────────
  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, zIndex: 9000,
      background: "rgba(0,0,0,0.88)", backdropFilter: "blur(6px)",
      display: "flex", alignItems: isMobile ? "flex-start" : "center",
      justifyContent: "center",
      padding: isMobile ? 0 : 20,
      overflowY: "auto",
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        width: "100%", maxWidth: 940, background: C.bgModal,
        borderRadius: isMobile ? 0 : 14,
        overflow: "hidden",
        border: isMobile ? "none" : `1px solid ${C.border}`,
        boxShadow: isMobile ? "none" : "0 40px 80px rgba(0,0,0,0.8)",
        minHeight: isMobile ? "100vh" : "auto",
        margin: isMobile ? 0 : "auto",
      }}>

        {/* Hero with backdrop */}
        <div style={{
          position: "relative",
          padding: isMobile ? "20px 16px 16px" : "32px 28px 24px",
          overflow: "hidden",
        }}>
          {item.backdrop && (
            <>
              <div style={{
                position: "absolute", inset: 0,
                backgroundImage: `url(${TMDB_BG}${item.backdrop})`,
                backgroundSize: "cover", backgroundPosition: "center 20%",
                filter: "brightness(0.4) blur(1px)", opacity: 0.5,
              }} />
              <div style={{ position: "absolute", inset: 0, background: `linear-gradient(180deg, transparent 0%, ${C.bgModal} 95%)` }} />
            </>
          )}
          <div style={{
            position: "relative",
            display: "flex",
            gap: isMobile ? 14 : 22,
            alignItems: "flex-start",
            flexDirection: isMobile ? "column" : "row",
          }}>
            <div style={{ display: "flex", gap: 14, width: "100%" }}>
              {item.poster && (
                <img src={`${TMDB_W}${item.poster}`} alt={item.title}
                  onError={e => e.target.style.display = "none"}
                  style={{
                    width: isMobile ? 80 : 96,
                    height: isMobile ? 120 : 144,
                    objectFit: "cover", borderRadius: 8, flexShrink: 0,
                    boxShadow: "0 8px 20px rgba(0,0,0,0.5)",
                  }} />
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <h2 style={{
                  margin: "0 0 8px",
                  fontSize: isMobile ? 22 : 28,
                  fontFamily: "'Cinzel Display','Cinzel',serif",
                  color: "#f0ead0", letterSpacing: "0.03em",
                  lineHeight: 1.15,
                  wordBreak: "break-word",
                }}>{item.title}</h2>
                <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", marginBottom: 10 }}>
                  <span style={{ color: C.accent, fontSize: 13, fontWeight: 700 }}>★ {item.rating}</span>
                  <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 12 }}>{item.year}</span>
                </div>
                {item.genres.length > 0 && (
                  <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, marginBottom: 10 }}>
                    {item.genres.join(" · ")}
                  </div>
                )}
              </div>
              {/* Close button always reachable */}
              <button onClick={onClose} style={{
                background: "rgba(0,0,0,0.45)", border: "1px solid rgba(255,255,255,0.1)",
                color: "rgba(255,255,255,0.8)", width: 32, height: 32, borderRadius: "50%",
                cursor: "pointer", fontSize: 15, display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0, position: "relative", zIndex: 1, marginLeft: "auto",
              }}>✕</button>
            </div>

            <div style={{ width: "100%" }}>
              <p style={{
                color: "rgba(255,255,255,0.7)",
                fontSize: isMobile ? 12 : 13,
                margin: "0 0 16px", lineHeight: 1.6,
                maxWidth: 580,
              }}>{item.overview}</p>

              {item.type === "movie" && (
                <button onClick={() => setPlaying(true)} style={{
                  background: C.accent, color: C.bg, border: "none",
                  padding: isMobile ? "12px 24px" : "12px 28px",
                  borderRadius: 7,
                  fontSize: 14, fontWeight: 700, cursor: "pointer", letterSpacing: "0.08em",
                  boxShadow: `0 4px 16px ${C.accent}55`,
                  width: isMobile ? "100%" : "auto",
                }}>▶ Watch Movie</button>
              )}
            </div>
          </div>
        </div>

        {/* Episode browser */}
        {item.type === "tv" && (
          <div style={{ padding: isMobile ? "0 4px 8px" : "0 8px 8px" }}>
            <div style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: isMobile ? "16px 12px 12px" : "18px 20px 14px",
              gap: 12, flexWrap: "wrap",
            }}>
              <h3 style={{
                margin: 0, fontFamily: "'Cinzel',serif",
                fontSize: isMobile ? 13 : 14,
                color: C.accent, letterSpacing: "0.22em", textTransform: "uppercase",
              }}>Episodes</h3>
              <select value={season} onChange={e => { setSeason(Number(e.target.value)); setEpisode(1); }}
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: `1px solid ${C.border}`,
                  color: "#fff", padding: "8px 32px 8px 16px",
                  borderRadius: 6, fontSize: 13, fontWeight: 500,
                  cursor: "pointer", appearance: "none", outline: "none",
                  backgroundImage: `linear-gradient(45deg, transparent 50%, ${C.accent} 50%), linear-gradient(135deg, ${C.accent} 50%, transparent 50%)`,
                  backgroundPosition: `calc(100% - 18px) center, calc(100% - 13px) center`,
                  backgroundSize: `5px 5px, 5px 5px`,
                  backgroundRepeat: "no-repeat",
                }}>
                {seasons.map(s => (
                  <option key={s.season_number} value={s.season_number} style={{ background: C.bgCard }}>
                    {s.name || `Season ${s.season_number}`}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ maxHeight: isMobile ? "none" : 460, overflowY: isMobile ? "visible" : "auto", padding: isMobile ? "0 6px 16px" : "0 12px 12px" }}>
              {seasonLoading && (
                <div style={{ textAlign: "center", padding: "40px 0", color: "rgba(255,255,255,0.4)", fontSize: 13 }}>
                  Loading episodes…
                </div>
              )}
              {!seasonLoading && episodes?.length > 0 && episodes.map(ep => (
                <EpisodeRow key={ep.id} ep={ep} isMobile={isMobile}
                  isActive={ep.episode_number === episode}
                  onClick={() => selectEpisode(ep.episode_number)} />
              ))}
              {!seasonLoading && !episodes?.length && (
                <div style={{ padding: "16px" }}>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 14, letterSpacing: "0.06em" }}>
                    Pick an episode:
                  </div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {Array.from({ length: item.episodesPerSeason?.[season-1] || 20 }, (_, i) => i + 1).map(ep => (
                      <button key={ep} onClick={() => selectEpisode(ep)}
                        style={{
                          width: 44, height: 44, borderRadius: 6,
                          background: episode === ep ? C.accent : "rgba(255,255,255,0.05)",
                          border: `1px solid ${episode === ep ? C.accent : "rgba(255,255,255,0.1)"}`,
                          color: episode === ep ? C.bg : "rgba(255,255,255,0.7)",
                          cursor: "pointer", fontSize: 14, fontWeight: 600,
                        }}>{ep}</button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// App
// ════════════════════════════════════════════════════════════════════════════
export default function App() {
  const isMobile = useIsMobile();
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

  const featured        = CATALOG[featuredIdx];
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

  // Layout tokens that change for mobile
  const sidePad     = isMobile ? 16 : 52;
  const heroPad     = `${isMobile ? 20 : 28}px ${sidePad}px 0`;
  const navPad      = `${isMobile ? 18 : 28}px ${sidePad}px`;
  const sectionPad  = `${isMobile ? 28 : 36}px ${sidePad}px 0`;
  const lastSectionPad = `${isMobile ? 32 : 40}px ${sidePad}px ${isMobile ? 48 : 60}px`;
  const gridMin     = isMobile ? 108 : 148;

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

          {/* Watch Now + dots — stack vertically on mobile to avoid clipping */}
          <div style={{
            display: "flex",
            gap: isMobile ? 18 : 12,
            alignItems: isMobile ? "flex-start" : "center",
            flexDirection: isMobile ? "column" : "row",
          }}>
            <button onClick={() => setSelected(featured)}
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
            {movies.map(item => <PosterCard key={item.id} item={item} onClick={setSelected} />)}
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

      {selected && <EpisodeModal item={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
