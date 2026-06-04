import { useEffect, useRef, useState } from "react";
import { C } from "../lib/tokens";
import { TMDB_W, TMDB_BG, TMDB_KEY, fetchTVDetails, fetchTVSeason } from "../lib/tmdb";
import { useIsMobile } from "../hooks/useIsMobile";
import { EpisodeRow } from "./EpisodeRow";

export function EpisodeModal({ item, onClose, initial = {}, onWatchStateChange }) {
  const isMobile = useIsMobile();
  const iframeRef = useRef(null);
  const [playing, setPlaying] = useState(initial.playing || false);
  const [season,  setSeason]  = useState(initial.season  || 1);
  const [episode, setEpisode] = useState(initial.episode || 1);
  const [showData, setShowData]     = useState(null);
  const [seasonData, setSeasonData] = useState(null);
  const [seasonLoading, setSeasonLoading] = useState(false);

  useEffect(() => {
    onWatchStateChange?.({ season, episode, playing });
  }, [season, episode, playing]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (item.type !== "tv" || !TMDB_KEY) return;
    fetchTVDetails(item.id).then(setShowData).catch(() => {});
  }, [item.id, item.type]);

  useEffect(() => {
    if (item.type !== "tv" || !TMDB_KEY) return;
    setSeasonLoading(true);
    fetchTVSeason(item.id, season)
      .then(d => { setSeasonData(d); setSeasonLoading(false); })
      .catch(() => setSeasonLoading(false));
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
    || (item.seasons
      ? Array.from({ length: item.seasons }, (_, i) => ({ season_number: i + 1, name: `Season ${i + 1}` }))
      : [{ season_number: 1, name: "Season 1" }]);
  const episodes = seasonData?.episodes || null;

  const vidSrc = item.type === "tv"
    ? `https://www.vidking.net/embed/tv/${item.id}/${season}/${episode}?color=729C65&autoPlay=true&nextEpisode=true`
    : `https://www.vidking.net/embed/movie/${item.id}?color=729C65&autoPlay=true`;

  const currentEp     = episodes?.find(e => e.episode_number === episode);
  const currentEpName = currentEp?.name;
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

  // ════════════ MOBILE PLAYER ═══════════════════════════════════════════════
  if (playing && isMobile) {
    return (
      <div style={{
        position: "fixed", inset: 0, zIndex: 9000,
        background: C.bgModal,
        display: "flex", flexDirection: "column",
      }}>
        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          padding: "10px 14px",
          background: C.bgModal,
          borderBottom: `1px solid ${C.border}`,
          flexShrink: 0,
        }}>
          {item.type === "tv" && (
            <button onClick={() => setPlaying(false)} style={{
              background: "transparent", border: "none",
              color: "rgba(255,255,255,0.65)", cursor: "pointer",
              padding: "4px 10px 4px 0",
              display: "flex", alignItems: "center", gap: 5, flexShrink: 0,
            }}>
              <span style={{ fontSize: 15 }}>←</span>
              <span style={{ fontSize: 11, letterSpacing: "0.06em", fontWeight: 500 }}>Episodes</span>
            </button>
          )}
          <div style={{ flex: 1, minWidth: 0, overflow: "hidden" }}>
            <div style={{
              fontFamily: "'Cinzel',serif", fontSize: 13, color: "#f0ead0",
              letterSpacing: "0.04em",
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>{item.title}</div>
            {item.type === "tv" && (
              <div style={{ fontSize: 10, color: C.accent, fontWeight: 600, letterSpacing: "0.08em", marginTop: 1 }}>
                S{season} · E{episode}
              </div>
            )}
          </div>
          <button onClick={onClose} style={{
            background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
            color: "rgba(255,255,255,0.7)", width: 28, height: 28, borderRadius: "50%",
            cursor: "pointer", fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}>✕</button>
        </div>

        {/* 16:9 video — always flush to top under header */}
        <div style={{
          position: "relative", width: "100%", paddingTop: "56.25%",
          flexShrink: 0, background: "#000",
        }}>
          <iframe
            ref={iframeRef}
            src={vidSrc}
            style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: "none" }}
            allowFullScreen
            allow="autoplay; fullscreen"
          />
        </div>

        {/* Info panel — fills remaining space so no dead black */}
        <div style={{ flex: 1, overflowY: "auto", background: C.bgModal }}>

          {/* Episode / movie meta */}
          <div style={{ padding: "14px 16px 12px" }}>
            {item.type === "tv" && currentEpName && (
              <div style={{
                fontFamily: "'Cinzel', serif",
                fontSize: 15, color: "#f0ead0",
                letterSpacing: "0.03em", marginBottom: 4,
              }}>{currentEpName}</div>
            )}
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              {item.type === "tv" && (
                <span style={{ fontSize: 10, color: C.accent, fontWeight: 700, letterSpacing: "0.12em" }}>
                  SEASON {season} · EP {episode}
                </span>
              )}
              {currentEp?.runtime && (
                <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", letterSpacing: "0.06em" }}>
                  {currentEp.runtime} min
                </span>
              )}
              {item.type === "movie" && (
                <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", letterSpacing: "0.06em" }}>{item.year}</span>
              )}
            </div>
            {/* Episode overview, or movie overview as fallback */}
            {(currentEp?.overview || item.overview) && (
              <p style={{
                fontSize: 12, color: "rgba(255,255,255,0.5)", lineHeight: 1.65,
                margin: "10px 0 0",
                display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}>{currentEp?.overview || item.overview}</p>
            )}
          </div>

          <div style={{ height: 1, background: C.border, margin: "0 16px" }} />

          {/* Subtitles / CC guidance */}
          <div style={{ padding: "12px 16px" }}>
            <div style={{
              background: `${C.accent}0d`,
              border: `1px solid ${C.border}`,
              borderRadius: 10, padding: "12px 14px",
              display: "flex", gap: 12, alignItems: "flex-start",
            }}>
              {/* CC badge */}
              <div style={{
                width: 34, height: 20, borderRadius: 4, flexShrink: 0, marginTop: 1,
                background: `${C.accent}1e`, border: `1px solid ${C.accent}55`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <span style={{ fontSize: 9, fontWeight: 800, color: C.accent, letterSpacing: "0.04em" }}>CC</span>
              </div>
              <div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.8)", fontWeight: 600, marginBottom: 4 }}>
                  Closed Captions
                </div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.42)", lineHeight: 1.6 }}>
                  Tap{" "}
                  <span style={{ color: C.accent, fontWeight: 600 }}>⛶ Full</span>
                  {" "}below for native iOS caption support. You can also tap the CC icon directly inside the player.
                </div>
              </div>
            </div>
          </div>

          <div style={{ height: 1, background: C.border, margin: "0 16px" }} />

          {/* Server tip */}
          <div style={{ padding: "10px 16px 16px" }}>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.2)", letterSpacing: "0.1em", lineHeight: 1.6 }}>
              If playback fails, tap the settings icon inside the player and try a different server.
            </div>
          </div>
        </div>

        {/* Bottom actions with iOS safe-area inset */}
        <div style={{
          display: "flex", gap: 8, justifyContent: "flex-end",
          padding: "10px 14px",
          paddingBottom: "calc(10px + env(safe-area-inset-bottom, 0px))",
          background: C.bgBar,
          borderTop: "1px solid rgba(255,255,255,0.05)",
          flexShrink: 0,
        }}>
          <button onClick={goPiP} style={{
            background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)",
            color: "rgba(255,255,255,0.65)",
            padding: "9px 18px", borderRadius: 7, cursor: "pointer",
            fontSize: 12, fontWeight: 600, letterSpacing: "0.04em",
          }}>⧉ PiP</button>
          <button onClick={goFullscreen} style={{
            background: `${C.accent}22`, border: `1px solid ${C.borderStrong}`,
            color: C.accent,
            padding: "9px 18px", borderRadius: 7, cursor: "pointer",
            fontSize: 12, fontWeight: 600, letterSpacing: "0.04em",
          }}>⛶ Full</button>
        </div>
      </div>
    );
  }

  // ════════════ DESKTOP PLAYER ══════════════════════════════════════════════
  if (playing) {
    return (
      <div onClick={onClose} style={{
        position: "fixed", inset: 0, zIndex: 9000,
        background: "rgba(0,0,0,0.95)", backdropFilter: "blur(8px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 16,
      }}>
        <div onClick={e => e.stopPropagation()} style={{
          width: "min(1280px, 96vw)",
          background: "#000",
          borderRadius: 12, overflow: "hidden",
          border: `1px solid ${C.border}`,
          boxShadow: "0 40px 100px rgba(0,0,0,0.9)",
          display: "flex", flexDirection: "column",
        }}>
          {/* Top bar */}
          <div style={{
            display: "flex", alignItems: "center", gap: 16,
            padding: "12px 18px",
            background: C.bgModal, borderBottom: `1px solid ${C.border}`,
            flexShrink: 0,
          }}>
            {item.type === "tv" && (
              <button onClick={() => setPlaying(false)} style={{
                background: "transparent", border: "none",
                color: "rgba(255,255,255,0.7)", cursor: "pointer",
                fontSize: 13, fontWeight: 500,
                padding: "6px 12px", borderRadius: 6, letterSpacing: "0.04em",
                display: "flex", alignItems: "center", gap: 6, flexShrink: 0,
              }}>← Episodes</button>
            )}
            <div style={{ flex: 1, minWidth: 0, display: "flex", alignItems: "baseline", gap: 8, overflow: "hidden" }}>
              <span style={{ fontFamily: "'Cinzel',serif", fontSize: 15, color: "#f0ead0", letterSpacing: "0.04em", whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}>{item.title}</span>
              {item.type === "tv" && (
                <span style={{ fontSize: 12, color: C.accent, fontWeight: 600, letterSpacing: "0.06em", whiteSpace: "nowrap" }}>
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
          <div style={{ position: "relative", height: "min(70vh, 720px)", background: "#000", flexShrink: 0 }}>
            <iframe
              ref={iframeRef}
              src={vidSrc}
              style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: "none", display: "block" }}
              allowFullScreen
              allow="autoplay; fullscreen"
            />
          </div>

          {/* Bottom action bar */}
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: "10px 18px",
            background: C.bgBar, borderTop: "1px solid rgba(255,255,255,0.05)",
            gap: 8, flexWrap: "wrap", flexShrink: 0,
          }}>
            <span style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", letterSpacing: "0.15em" }}>
              IF PLAYBACK FAILS, TRY "SHOW ALL SERVERS" INSIDE THE PLAYER
            </span>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={goPiP} style={{
                background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)",
                color: "rgba(255,255,255,0.7)",
                padding: "7px 16px", borderRadius: 6, cursor: "pointer",
                fontSize: 12, fontWeight: 600, letterSpacing: "0.04em",
              }}>⧉ Picture in Picture</button>
              <button onClick={goFullscreen} style={{
                background: `${C.accent}1a`, border: `1px solid ${C.borderStrong}`,
                color: C.accent,
                padding: "7px 16px", borderRadius: 6, cursor: "pointer",
                fontSize: 12, fontWeight: 600, letterSpacing: "0.04em",
              }}>⛶ Fullscreen</button>
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
        minHeight: isMobile ? "100dvh" : "auto",
        margin: isMobile ? 0 : "auto",
        paddingBottom: isMobile ? "env(safe-area-inset-bottom, 0px)" : 0,
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
