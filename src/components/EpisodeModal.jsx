import { useEffect, useRef, useState } from "react";
import { C } from "../lib/tokens";
import { TMDB_W, TMDB_BG, TMDB_KEY, fetchTVDetails, fetchTVSeason } from "../lib/tmdb";
import { useIsMobile } from "../hooks/useIsMobile";
import { EpisodeRow } from "./EpisodeRow";

// One-time caption hint shown on mobile (Vidking doesn't expose a default-subtitle param).
const CC_HINT_KEY = "zekepeke:cc-hint-seen";

export function EpisodeModal({ item, onClose, initial = {}, onWatchStateChange }) {
  const isMobile = useIsMobile();
  const iframeRef = useRef(null);
  const [playing, setPlaying] = useState(initial.playing || false);
  const [season,  setSeason]  = useState(initial.season  || 1);
  const [episode, setEpisode] = useState(initial.episode || 1);
  const [showData, setShowData]     = useState(null);
  const [seasonData, setSeasonData] = useState(null);
  const [seasonLoading, setSeasonLoading] = useState(false);
  const [ccHint, setCcHint] = useState(false);

  // Sync URL whenever the view changes
  useEffect(() => {
    onWatchStateChange?.({ season, episode, playing });
  }, [season, episode, playing]); // eslint-disable-line react-hooks/exhaustive-deps

  // Show caption hint once, only on mobile, only on first play
  useEffect(() => {
    if (!playing || !isMobile) return;
    if (typeof window === "undefined") return;
    if (window.localStorage.getItem(CC_HINT_KEY)) return;
    setCcHint(true);
    const t = setTimeout(() => {
      setCcHint(false);
      window.localStorage.setItem(CC_HINT_KEY, "1");
    }, 5500);
    return () => clearTimeout(t);
  }, [playing, isMobile]);

  // Fetch TV details for season list
  useEffect(() => {
    if (item.type !== "tv" || !TMDB_KEY) return;
    fetchTVDetails(item.id).then(setShowData).catch(() => {});
  }, [item.id, item.type]);

  // Fetch episodes whenever season changes
  useEffect(() => {
    if (item.type !== "tv" || !TMDB_KEY) return;
    setSeasonLoading(true);
    fetchTVSeason(item.id, season)
      .then(d => { setSeasonData(d); setSeasonLoading(false); })
      .catch(() => setSeasonLoading(false));
  }, [item.id, item.type, season]);

  // Esc: back to episodes (TV) or close
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
    || (item.seasons
      ? Array.from({ length: item.seasons }, (_, i) => ({ season_number: i + 1, name: `Season ${i + 1}` }))
      : [{ season_number: 1, name: "Season 1" }]);
  const episodes = seasonData?.episodes || null;

  const vidSrc = item.type === "tv"
    ? `https://www.vidking.net/embed/tv/${item.id}/${season}/${episode}?color=729C65&autoPlay=true&nextEpisode=true`
    : `https://www.vidking.net/embed/movie/${item.id}?color=729C65&autoPlay=true`;

  const currentEpName = episodes?.find(e => e.episode_number === episode)?.name;
  const goFullscreen  = () => iframeRef.current?.requestFullscreen();

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

  // ════════════ PLAYER MODE ═════════════════════════════════════════════════
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
            background: C.bgModal, borderBottom: `1px solid ${C.border}`,
            flexShrink: 0,
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

          {/* ── PLAYER (mobile fix is here) ────────────────────────────────
              Bug: on mobile we used height:100% + flex:1 → iframe became a
              portrait box. Vidking renders its UI relative to the iframe
              boundary, so controls spread far above/below the actual 16:9
              video and overlapped our outer chrome.
              Fix: lock the iframe to a 16:9 aspect ratio and let the rest
              of the column be empty space. The video and Vidking's overlay
              now render proportionally.                                    */}
          <div style={{
            background: "#000",
            flex: isMobile ? 1 : "none",
            display: "flex",
            alignItems: isMobile ? "flex-start" : "stretch",
            justifyContent: "center",
            position: "relative",
            overflow: "hidden",
          }}>
            <iframe
              ref={iframeRef}
              src={vidSrc}
              style={{
                width: "100%",
                aspectRatio: isMobile ? "16 / 9" : "auto",
                height: isMobile ? "auto" : "min(70vh, 720px)",
                maxHeight: "100%",
                border: "none",
                display: "block",
              }}
              allowFullScreen
              allow="autoplay; fullscreen"
            />

            {/* Caption hint — Vidking controls captions; we can only nudge */}
            {ccHint && (
              <div style={{
                position: "absolute", left: 12, right: 12, top: 12,
                background: `${C.bgModal}e6`, border: `1px solid ${C.borderStrong}`,
                color: "#f0ead0", padding: "10px 14px", borderRadius: 8,
                fontSize: 12, lineHeight: 1.5, backdropFilter: "blur(8px)",
                animation: "fadeIn 0.3s ease",
                pointerEvents: "none",
              }}>
                <strong style={{ color: C.accent, letterSpacing: "0.08em", fontSize: 10 }}>TIP</strong>
                <div style={{ marginTop: 4 }}>Tap the <span style={{ color: C.accent }}>CC</span> icon in the player to choose subtitles.</div>
              </div>
            )}
          </div>

          {/* Bottom action bar */}
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: isMobile ? "8px 10px" : "10px 18px",
            background: C.bgBar, borderTop: "1px solid rgba(255,255,255,0.05)",
            gap: 8, flexWrap: "wrap", flexShrink: 0,
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

  // ════════════ BROWSE MODE ═════════════════════════════════════════════════
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

            <div style={{
              maxHeight: isMobile ? "none" : 460,
              overflowY: isMobile ? "visible" : "auto",
              padding: isMobile ? "0 6px 16px" : "0 12px 12px",
            }}>
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
                <div style={{ padding: 16 }}>
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
