import { useState } from "react";
import { C } from "../lib/tokens";
import { TMDB_STILL } from "../lib/tmdb";

export function EpisodeRow({ ep, isActive, onClick, isMobile }) {
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
