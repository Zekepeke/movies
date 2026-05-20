import { useState, useEffect, useRef } from "react";

const TMDB_W = "https://image.tmdb.org/t/p/w500";
const TMDB_BG = "https://image.tmdb.org/t/p/w1280";

const CATALOG = [
  {
  id: 181808, type: "movie", title: "Star Wars: The Last Jedi", year: 2017, rating: 7.0,
  genres: ["Action", "Adventure", "Sci-Fi"],
  poster: "/kOVEVeg59E0wsnXmF9nrh6OmWII.jpg",
  backdrop: "/5Iw7zQTHVRBOi772Yi3wLkcvDGo.jpg",
  overview: "Rey develops her newly discovered abilities with the guidance of Luke Skywalker, who is unsettled by the strength of her powers.",
  },
  {
    id: 155, type: "movie", title: "The Dark Knight", year: 2008, rating: 9.0,
    genres: ["Action", "Crime", "Drama"],
    poster: "/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
    backdrop: "/hkBaDkMWbLaf8B1lsWsKX7Ew3Xq.jpg",
    overview: "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.",
  },
  {
    id: 27205, type: "movie", title: "Inception", year: 2010, rating: 8.8,
    genres: ["Action", "Sci-Fi", "Thriller"],
    poster: "/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg",
    backdrop: "/s3TBrRGB1iav7gFOCNx3H31MoES.jpg",
    overview: "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.",
  },
  {
    id: 157336, type: "movie", title: "Interstellar", year: 2014, rating: 8.7,
    genres: ["Sci-Fi", "Drama", "Adventure"],
    poster: "/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
    backdrop: "/xJHokMbljvjADYdit5fK5VQsXEG.jpg",
    overview: "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.",
  },
  {
    id: 278, type: "movie", title: "The Shawshank Redemption", year: 1994, rating: 9.3,
    genres: ["Drama", "Crime"],
    poster: "/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg",
    backdrop: "/avedvodAZUcwqevBfm8p4G2NziQ.jpg",
    overview: "Two imprisoned men bond over several years, finding solace and eventual redemption through acts of common decency.",
  },
  {
    id: 680, type: "movie", title: "Pulp Fiction", year: 1994, rating: 8.9,
    genres: ["Crime", "Drama", "Thriller"],
    poster: "/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg",
    backdrop: "/4cDFJr4HnXN5AdPw4AKrmLlPLAF.jpg",
    overview: "The lives of two mob hitmen, a boxer, a gangster and his wife, and a pair of diner bandits intertwine in four tales of violence and redemption.",
  },
  {
    id: 238, type: "movie", title: "The Godfather", year: 1972, rating: 9.2,
    genres: ["Crime", "Drama"],
    poster: "/3bhkrj58Vtu7enYsLegHnDcdh9.jpg",
    backdrop: "/tmU7GeKVybMWFButWEGl2M4GeiP.jpg",
    overview: "The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son.",
  },
  {
    id: 603, type: "movie", title: "The Matrix", year: 1999, rating: 8.7,
    genres: ["Action", "Sci-Fi"],
    poster: "/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg",
    backdrop: "/fNG7i7RqMErkcqhohV2a6cV1Ehy.jpg",
    overview: "A computer hacker learns about the true nature of his reality and his role in the war against its controllers.",
  },
  {
    id: 496243, type: "movie", title: "Parasite", year: 2019, rating: 8.5,
    genres: ["Drama", "Thriller", "Comedy"],
    poster: "/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg",
    backdrop: "/TU9NIjwzjoKPwQHoHshkFcQUCG.jpg",
    overview: "Greed and class discrimination threaten the newly formed symbiotic relationship between the wealthy Park family and the destitute Kim clan.",
  },
  {
    id: 299534, type: "movie", title: "Avengers: Endgame", year: 2019, rating: 8.4,
    genres: ["Action", "Adventure", "Sci-Fi"],
    poster: "/or06FN3Dka5tukK1e9sl16pB3iy.jpg",
    backdrop: "/orjiB3oUIsyz60hoEqkiGpy5CeO.jpg",
    overview: "After the devastating events of Infinity War, the Avengers assemble once more to reverse Thanos's actions and restore balance to the universe.",
  },
  {
    id: 475557, type: "movie", title: "Joker", year: 2019, rating: 8.2,
    genres: ["Crime", "Drama", "Thriller"],
    poster: "/udDclJoHjfjb8Ekgsd4FDteOkCU.jpg",
    backdrop: "/n6bUvigpRFqSwmPp1ZklAdZag4M.jpg",
    overview: "In Gotham City, mentally troubled comedian Arthur Fleck embarks on a downward spiral of revolution and bloody crime.",
  },
  {
    id: 361743, type: "movie", title: "Top Gun: Maverick", year: 2022, rating: 8.3,
    genres: ["Action", "Drama"],
    poster: "/62HCnUTziyWcpDaBO2i1DX17ljH.jpg",
    backdrop: "/AkB1pBYzOmN6kRkyXyZoqKEpIQ.jpg",
    overview: "After more than thirty years of service as a top naval aviator, Pete Mitchell is where he belongs, pushing the envelope as a courageous test pilot.",
  },
  {
    id: 634649, type: "movie", title: "Spider-Man: No Way Home", year: 2021, rating: 8.2,
    genres: ["Action", "Adventure", "Sci-Fi"],
    poster: "/1g0dhYtq4irTY1GPXvft6k4YLjm.jpg",
    backdrop: "/iQFcwSGbZXMkeyKrxbPnwnRo5fl.jpg",
    overview: "With Spider-Man's identity now revealed, Peter asks Doctor Strange for help. When a spell goes wrong, dangerous foes from other worlds start to appear.",
  },
  {
    id: 98, type: "movie", title: "Gladiator", year: 2000, rating: 8.5,
    genres: ["Action", "Adventure", "Drama"],
    poster: "/ty8TGRuvJLPUmAR1H1nRIsgwvim.jpg",
    backdrop: "/6WBIzCgmDCYrqh64yDREGeDk9d3.jpg",
    overview: "A former Roman general sets out to exact vengeance against the corrupt emperor who murdered his family and sent him into slavery.",
  },
  {
    id: 13, type: "movie", title: "Forrest Gump", year: 1994, rating: 8.8,
    genres: ["Drama", "Comedy", "Romance"],
    poster: "/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg",
    backdrop: "/qdIMHd4sEfJSckfVJfKQvisL02a.jpg",
    overview: "The presidencies of Kennedy and Johnson, Vietnam, Watergate and other history unfold through the perspective of an Alabama man with an IQ of 75.",
  },
  {
    id: 550, type: "movie", title: "Fight Club", year: 1999, rating: 8.8,
    genres: ["Drama", "Thriller"],
    poster: "/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg",
    backdrop: "/87hTDiay2N2qWyX4Ds7HRDmr1of.jpg",
    overview: "An insomniac office worker and a devil-may-care soapmaker form an underground fight club that evolves into something much, much more.",
  },
  // TV SHOWS
  {
    id: 1396, type: "tv", title: "Breaking Bad", year: 2008, rating: 9.5,
    genres: ["Crime", "Drama", "Thriller"],
    poster: "/ggFHVNu6YYI5L9pCfOacjizRGt.jpg",
    backdrop: "/tsRy63Mu5cu8etL1X7ZLyf7UP1M.jpg",
    overview: "A high school chemistry teacher diagnosed with inoperable lung cancer turns to manufacturing and selling methamphetamine with a former student.",
    seasons: 5, episodesPerSeason: [7, 13, 13, 13, 16],
  },
  {
    id: 1399, type: "tv", title: "Game of Thrones", year: 2011, rating: 9.3,
    genres: ["Action", "Drama", "Fantasy"],
    poster: "/u3bZgnGQ9T01sWNhyveQz0wH0Hl.jpg",
    backdrop: "/suopoADq0k8YZr4dQXcU6t0qLOD.jpg",
    overview: "Nine noble families fight for control over the mythical lands of Westeros, while an ancient enemy awakens after being dormant for millennia.",
    seasons: 8, episodesPerSeason: [10, 10, 10, 10, 10, 10, 7, 6],
  },
  {
    id: 66732, type: "tv", title: "Stranger Things", year: 2016, rating: 8.7,
    genres: ["Drama", "Sci-Fi", "Horror"],
    poster: "/49WJfeN0moxb9IPfGn8AIqMGskD.jpg",
    backdrop: "/56v2KjBlU4XaOv9rVYEQypROD7P.jpg",
    overview: "When a young boy disappears, his mother, a police chief and his friends must confront terrifying supernatural forces in order to get him back.",
    seasons: 4, episodesPerSeason: [8, 9, 8, 9],
  },
  {
    id: 119051, type: "tv", title: "Wednesday", year: 2022, rating: 8.2,
    genres: ["Comedy", "Drama", "Fantasy"],
    poster: "/9PFonBhy4cQy7hjrnPlavi2adXR.jpg",
    backdrop: "/iHSwvRVsRyxpX7FE7GbviaDvgGZ.jpg",
    overview: "Follows Wednesday Addams' years as a student at Nevermore Academy, where she attempts to master her emerging psychic ability.",
    seasons: 2, episodesPerSeason: [8, 8],
  },
  {
    id: 60574, type: "tv", title: "Peaky Blinders", year: 2013, rating: 8.8,
    genres: ["Crime", "Drama"],
    poster: "/vUUqzWa2LnHIVqkaKVn3nyfVJNh.jpg",
    backdrop: "/wiE9doxiLwq3WgBelow88Fpb6eA.jpg",
    overview: "A gangster family epic set in 1900s England, centering on a gang who sew razor blades in the peaks of their caps.",
    seasons: 6, episodesPerSeason: [6, 6, 6, 6, 6, 6],
  },
  {
    id: 65494, type: "tv", title: "The Crown", year: 2016, rating: 8.6,
    genres: ["Drama", "History"],
    poster: "/6jKDiVBFHAS77JkGX4lI6gR7VCR.jpg",
    backdrop: "/m1ggcLNouveFdZLPWXOlb6oGT2C.jpg",
    overview: "Follows the political rivalries and romance of Queen Elizabeth II's reign and the events that shaped the second half of the twentieth century.",
    seasons: 6, episodesPerSeason: [10, 10, 10, 10, 10, 10],
  },
];

const ALL_GENRES = ["All", ...Array.from(new Set(CATALOG.flatMap(m => m.genres))).sort()];

function PosterCard({ item, onClick, featured }) {
  const [imgErr, setImgErr] = useState(false);
  return (
    <div
      onClick={() => onClick(item)}
      style={{
        cursor: "pointer",
        transition: "transform 0.25s ease",
        flex: featured ? "0 0 auto" : undefined,
        width: featured ? 140 : undefined,
      }}
      onMouseEnter={e => e.currentTarget.style.transform = "scale(1.05) translateY(-4px)"}
      onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
    >
      <div style={{
        aspectRatio: "2/3", borderRadius: 10, overflow: "hidden",
        background: "#1a1a2a", position: "relative",
        border: "1px solid rgba(255,255,255,0.06)",
      }}>
        {!imgErr ? (
          <img
            src={`${TMDB_W}${item.poster}`}
            alt={item.title}
            onError={() => setImgErr(true)}
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
        ) : (
          <div style={{
            width: "100%", height: "100%", display: "flex", alignItems: "center",
            justifyContent: "center", background: "linear-gradient(145deg,#1a1a2e,#0d0d1a)",
            fontSize: 40, color: "rgba(245,200,66,0.4)", fontFamily: "'Cinzel Display', serif",
          }}>
            {item.title[0]}
          </div>
        )}
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to top, rgba(8,8,16,0.9) 0%, transparent 55%)",
        }} />
        <div style={{
          position: "absolute", bottom: 10, left: 10,
          display: "flex", alignItems: "center", gap: 6,
        }}>
          <span style={{ color: "#f5c842", fontSize: 10, fontWeight: 700 }}>★ {item.rating}</span>
        </div>
        {item.type === "tv" && (
          <div style={{
            position: "absolute", top: 8, right: 8,
            background: "rgba(245,200,66,0.9)", color: "#0a0a10",
            fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 3, letterSpacing: "0.1em",
          }}>TV</div>
        )}
      </div>
      <div style={{ marginTop: 10 }}>
        <div style={{ fontSize: 12, fontWeight: 500, color: "#e8e8e8", lineHeight: 1.4, letterSpacing: "0.01em" }}>{item.title}</div>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 3 }}>{item.year}</div>
      </div>
    </div>
  );
}

function EpisodeModal({ item, onClose }) {
  const maxSeason = item.seasons || 1;
  const [season, setSeason] = useState(1);
  const [episode, setEpisode] = useState(1);
  const [playing, setPlaying] = useState(false);
  const eps = item.episodesPerSeason?.[season - 1] || 10;

  const vidSrc = item.type === "tv"
    ? `https://www.vidking.net/embed/tv/${item.id}/${season}/${episode}?color=f5c842&autoPlay=true&nextEpisode=true&episodeSelector=true`
    : `https://www.vidking.net/embed/movie/${item.id}?color=f5c842&autoPlay=true`;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 9000,
        background: "rgba(0,0,0,0.88)", backdropFilter: "blur(4px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "20px",
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: "100%", maxWidth: 1000,
          background: "#0d0d1a",
          borderRadius: 14,
          overflow: "hidden",
          border: "1px solid rgba(245,200,66,0.18)",
          boxShadow: "0 40px 80px rgba(0,0,0,0.8)",
        }}
      >
        {/* Modal header */}
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "flex-start",
          padding: "20px 24px 16px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}>
          <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
            <img
              src={`${TMDB_W}${item.poster}`}
              alt={item.title}
              onError={e => e.target.style.display = "none"}
              style={{ width: 52, height: 78, objectFit: "cover", borderRadius: 6, flexShrink: 0 }}
            />
            <div>
              <h2 style={{
                margin: "0 0 4px", fontSize: 22,
                fontFamily: "'Cinzel Display', 'Cinzel', serif",
                color: "#f0ead0", letterSpacing: "0.04em",
              }}>{item.title}</h2>
              <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                <span style={{ color: "#f5c842", fontSize: 13, fontWeight: 600 }}>★ {item.rating}</span>
                <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 12 }}>{item.year}</span>
                <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 12 }}>{item.genres.join(" · ")}</span>
              </div>
              <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, margin: "8px 0 0", lineHeight: 1.6, maxWidth: 480 }}>
                {item.overview}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
              color: "rgba(255,255,255,0.7)", width: 34, height: 34, borderRadius: "50%",
              cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}
          >✕</button>
        </div>

        {/* TV episode selector */}
        {item.type === "tv" && !playing && (
          <div style={{ padding: "20px 24px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <label style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", letterSpacing: "0.12em", textTransform: "uppercase" }}>Season</label>
                <div style={{ display: "flex", gap: 6 }}>
                  {Array.from({ length: maxSeason }, (_, i) => i + 1).map(s => (
                    <button
                      key={s}
                      onClick={() => { setSeason(s); setEpisode(1); }}
                      style={{
                        width: 34, height: 34, borderRadius: 6,
                        background: season === s ? "#f5c842" : "rgba(255,255,255,0.06)",
                        border: "1px solid " + (season === s ? "#f5c842" : "rgba(255,255,255,0.1)"),
                        color: season === s ? "#0a0a10" : "rgba(255,255,255,0.6)",
                        cursor: "pointer", fontSize: 13, fontWeight: season === s ? 700 : 400,
                      }}
                    >{s}</button>
                  ))}
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <label style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", letterSpacing: "0.12em", textTransform: "uppercase" }}>Episode</label>
                <select
                  value={episode}
                  onChange={e => setEpisode(Number(e.target.value))}
                  style={{
                    background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)",
                    color: "#fff", padding: "8px 12px", borderRadius: 6, fontSize: 13, cursor: "pointer",
                    appearance: "none", minWidth: 140,
                  }}
                >
                  {Array.from({ length: eps }, (_, i) => i + 1).map(ep => (
                    <option key={ep} value={ep} style={{ background: "#1a1a2a" }}>Episode {ep}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={() => setPlaying(true)}
                style={{
                  background: "#f5c842", color: "#0a0a10",
                  border: "none", padding: "10px 24px", borderRadius: 6,
                  fontSize: 14, fontWeight: 700, cursor: "pointer", letterSpacing: "0.06em",
                }}
              >▶ Play</button>
            </div>
          </div>
        )}

        {/* Player */}
        {(item.type === "movie" || playing) && (
          <div style={{ background: "#000" }}>
            <iframe
              src={vidSrc}
              width="100%" height={500}
              frameBorder="0"
              allowFullScreen
              allow="autoplay; fullscreen"
              style={{ display: "block" }}
            />
          </div>
        )}

        {item.type === "movie" && (
          <div style={{ padding: "0" }} />
        )}
      </div>
    </div>
  );
}

export default function App() {
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const [genre, setGenre] = useState("All");
  const [tab, setTab] = useState("all");
  const [featuredIdx, setFeaturedIdx] = useState(0);

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Cinzel+Display&family=Cinzel:wght@400;600&family=DM+Sans:wght@300;400;500&display=swap";
    document.head.appendChild(link);
    document.body.style.margin = "0";
    document.body.style.background = "#080810";
  }, []);

  const featured = CATALOG[featuredIdx];

  const filtered = CATALOG.filter(item => {
    const matchSearch = item.title.toLowerCase().includes(search.toLowerCase());
    const matchGenre = genre === "All" || item.genres.includes(genre);
    const matchTab = tab === "all" || item.type === tab;
    return matchSearch && matchGenre && matchTab;
  });

  const movies = filtered.filter(x => x.type === "movie");
  const shows = filtered.filter(x => x.type === "tv");
  const showMovies = tab === "all" || tab === "movie";
  const showTV = tab === "all" || tab === "tv";

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: "#080810", minHeight: "100vh", color: "#fff", overflowX: "hidden" }}>

      {/* HERO */}
      <div style={{ position: "relative", height: 560, overflow: "hidden" }}>
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: `url(${TMDB_BG}${featured.backdrop})`,
          backgroundSize: "cover", backgroundPosition: "center top",
          filter: "brightness(0.5)",
          transition: "background-image 0.8s ease",
        }} />
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(90deg, rgba(8,8,16,0.98) 0%, rgba(8,8,16,0.7) 50%, rgba(8,8,16,0.2) 100%)",
        }} />
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0, height: 160,
          background: "linear-gradient(to top, #080810, transparent)",
        }} />

        {/* NAV */}
        <nav style={{
          position: "relative", padding: "28px 52px",
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
            <span style={{
              fontFamily: "'Cinzel Display', serif", fontSize: 26, color: "#f5c842",
              letterSpacing: "0.22em", fontWeight: 400,
            }}>CINEMAX</span>
            <span style={{ fontSize: 10, color: "rgba(245,200,66,0.5)", letterSpacing: "0.3em" }}>STREAMING</span>
          </div>
          <div style={{ display: "flex", gap: 4, background: "rgba(255,255,255,0.06)", borderRadius: 8, padding: 4 }}>
            {[["all", "All"], ["movie", "Movies"], ["tv", "TV Shows"]].map(([val, label]) => (
              <button
                key={val}
                onClick={() => setTab(val)}
                style={{
                  background: tab === val ? "#f5c842" : "transparent",
                  border: "none",
                  color: tab === val ? "#0a0a10" : "rgba(255,255,255,0.55)",
                  padding: "8px 20px", borderRadius: 6,
                  cursor: "pointer", fontSize: 13, fontWeight: tab === val ? 600 : 400,
                  transition: "all 0.15s",
                }}
              >{label}</button>
            ))}
          </div>
        </nav>

        {/* HERO CONTENT */}
        <div style={{ position: "relative", padding: "20px 52px 0" }}>
          <div style={{
            fontSize: 10, letterSpacing: "0.35em", color: "#f5c842",
            textTransform: "uppercase", marginBottom: 14, fontWeight: 500,
          }}>✦ Featured Tonight</div>
          <h1 style={{
            fontFamily: "'Cinzel', serif", fontSize: 52,
            margin: "0 0 14px", lineHeight: 1.05, maxWidth: 520,
            color: "#f5f0e0", letterSpacing: "0.02em", fontWeight: 600,
          }}>{featured.title}</h1>
          <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 16 }}>
            <span style={{ color: "#f5c842", fontWeight: 700, fontSize: 14 }}>★ {featured.rating}</span>
            <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}>{featured.year}</span>
            <span style={{ color: "rgba(255,255,255,0.2)" }}>·</span>
            {featured.genres.map(g => (
              <span key={g} style={{
                fontSize: 11, color: "rgba(255,255,255,0.45)",
                background: "rgba(255,255,255,0.07)", padding: "3px 9px",
                borderRadius: 4, letterSpacing: "0.06em",
              }}>{g}</span>
            ))}
          </div>
          <p style={{
            color: "rgba(255,255,255,0.6)", maxWidth: 430, fontSize: 14,
            lineHeight: 1.7, marginBottom: 28,
          }}>{featured.overview}</p>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <button
              onClick={() => setSelected(featured)}
              style={{
                background: "#f5c842", color: "#080810",
                border: "none", padding: "13px 32px",
                borderRadius: 7, fontSize: 14, fontWeight: 700,
                cursor: "pointer", letterSpacing: "0.08em",
                transition: "transform 0.15s, box-shadow 0.15s",
                boxShadow: "0 4px 20px rgba(245,200,66,0.35)",
              }}
              onMouseEnter={e => { e.target.style.transform = "translateY(-1px)"; e.target.style.boxShadow = "0 8px 28px rgba(245,200,66,0.45)"; }}
              onMouseLeave={e => { e.target.style.transform = "translateY(0)"; e.target.style.boxShadow = "0 4px 20px rgba(245,200,66,0.35)"; }}
            >▶ Watch Now</button>
            <div style={{ display: "flex", gap: 6 }}>
              {[0, 1, 2, 3, 4].map(i => (
                <button
                  key={i}
                  onClick={() => setFeaturedIdx(i)}
                  style={{
                    width: i === featuredIdx ? 24 : 7, height: 7,
                    borderRadius: 4, border: "none",
                    background: i === featuredIdx ? "#f5c842" : "rgba(255,255,255,0.25)",
                    cursor: "pointer", padding: 0, transition: "all 0.3s",
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* SEARCH + FILTERS */}
      <div style={{ padding: "36px 52px 0" }}>
        <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap", marginBottom: 20 }}>
          <div style={{ position: "relative" }}>
            <span style={{
              position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)",
              fontSize: 14, color: "rgba(255,255,255,0.3)",
            }}>🔍</span>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search titles..."
              style={{
                background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
                color: "#fff", padding: "11px 16px 11px 38px", borderRadius: 8,
                fontSize: 14, width: 260, outline: "none",
              }}
              onFocus={e => e.target.style.borderColor = "rgba(245,200,66,0.5)"}
              onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
            />
          </div>
        </div>
        <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
          {ALL_GENRES.map(g => (
            <button
              key={g}
              onClick={() => setGenre(g)}
              style={{
                background: genre === g ? "#f5c842" : "rgba(255,255,255,0.05)",
                border: "1px solid " + (genre === g ? "#f5c842" : "rgba(255,255,255,0.1)"),
                color: genre === g ? "#0a0a10" : "rgba(255,255,255,0.55)",
                padding: "6px 15px", borderRadius: 20, cursor: "pointer",
                fontSize: 12, fontWeight: genre === g ? 600 : 400,
                transition: "all 0.15s",
              }}
            >{g}</button>
          ))}
        </div>
      </div>

      {/* MOVIES SECTION */}
      {showMovies && movies.length > 0 && (
        <section style={{ padding: "36px 52px 0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 22 }}>
            <h2 style={{
              fontFamily: "'Cinzel', serif", fontSize: 15, margin: 0,
              color: "#f5c842", letterSpacing: "0.18em", textTransform: "uppercase",
            }}>Movies</h2>
            <div style={{ flex: 1, height: 1, background: "rgba(245,200,66,0.15)" }} />
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.25)" }}>{movies.length} titles</span>
          </div>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(148px, 1fr))",
            gap: "24px 18px",
          }}>
            {movies.map(item => (
              <PosterCard key={item.id} item={item} onClick={setSelected} />
            ))}
          </div>
        </section>
      )}

      {/* TV SHOWS SECTION */}
      {showTV && shows.length > 0 && (
        <section style={{ padding: "40px 52px 60px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 22 }}>
            <h2 style={{
              fontFamily: "'Cinzel', serif", fontSize: 15, margin: 0,
              color: "#f5c842", letterSpacing: "0.18em", textTransform: "uppercase",
            }}>TV Series</h2>
            <div style={{ flex: 1, height: 1, background: "rgba(245,200,66,0.15)" }} />
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.25)" }}>{shows.length} titles</span>
          </div>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(148px, 1fr))",
            gap: "24px 18px",
          }}>
            {shows.map(item => (
              <PosterCard key={item.id} item={item} onClick={setSelected} />
            ))}
          </div>
        </section>
      )}

      {filtered.length === 0 && (
        <div style={{ textAlign: "center", padding: "80px 0", color: "rgba(255,255,255,0.25)" }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>🎬</div>
          <div style={{ fontFamily: "'Cinzel', serif", letterSpacing: "0.1em" }}>No titles found</div>
        </div>
      )}

      {/* FOOTER */}
      <div style={{
        borderTop: "1px solid rgba(255,255,255,0.06)", padding: "24px 52px",
        display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <span style={{ fontFamily: "'Cinzel Display', serif", color: "rgba(245,200,66,0.4)", fontSize: 14, letterSpacing: "0.2em" }}>CINEMAX</span>
        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", letterSpacing: "0.06em" }}>Powered by Vidking Player · Built for hackathon demo</span>
      </div>

      {/* MODAL */}
      {selected && <EpisodeModal item={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}