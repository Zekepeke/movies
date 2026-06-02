// Query-param state persistence so reload restores what was being watched.
// Homepage:        /
// Movie:           /?watch=movie-11
// Show (browsing): /?watch=tv-1396
// Show (playing):  /?watch=tv-1396&s=1&e=2&play=1
export function readWatchFromURL() {
  if (typeof window === "undefined") return null;
  const p = new URLSearchParams(window.location.search);
  const watch = p.get("watch");
  if (!watch) return null;
  const dash = watch.indexOf("-");
  if (dash < 0) return null;
  const type = watch.slice(0, dash);
  const id = Number(watch.slice(dash + 1));
  if ((type !== "movie" && type !== "tv") || !id) return null;
  return {
    type, id,
    season:  Number(p.get("s")) || 1,
    episode: Number(p.get("e")) || 1,
    playing: p.get("play") === "1",
  };
}

export function writeWatchToURL(item, state = {}) {
  if (typeof window === "undefined") return;
  if (!item) {
    window.history.replaceState({}, "", window.location.pathname);
    return;
  }
  const p = new URLSearchParams();
  p.set("watch", `${item.type}-${item.id}`);
  if (item.type === "tv") {
    if (state.season)  p.set("s", state.season);
    if (state.episode) p.set("e", state.episode);
  }
  if (state.playing) p.set("play", "1");
  window.history.replaceState({}, "", `${window.location.pathname}?${p}`);
}
