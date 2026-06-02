import { useState } from "react";
import { C } from "../lib/tokens";
import { TMDB_W } from "../lib/tmdb";

export function PosterCard({ item, onClick }) {
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
