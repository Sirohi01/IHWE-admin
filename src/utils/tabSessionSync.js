// The admin token lives in sessionStorage (unless "Remember me" is ticked), and browsers give every
// tab its own sessionStorage — so Ctrl+click / middle-click opened a new tab that asked to log in again.
// A tab with an empty session asks the other open tabs for theirs over a BroadcastChannel and copies it.
const CHANNEL = "ihwe-admin-session";
const WAIT_MS = 1000;

const hasSession = () => !!(sessionStorage.getItem("adminToken") || localStorage.getItem("adminToken"));

export const restoreSessionFromOtherTab = () => {
  if (typeof BroadcastChannel === "undefined") return Promise.resolve();
  let channel;
  try { channel = new BroadcastChannel(CHANNEL); } catch { return Promise.resolve(); }

  // Answer other tabs that are asking.
  channel.onmessage = (e) => {
    if (e.data?.type === "request" && sessionStorage.getItem("adminToken")) {
      const snapshot = {};
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        snapshot[key] = sessionStorage.getItem(key);
      }
      channel.postMessage({ type: "snapshot", to: e.data.id, snapshot });
    }
  };

  if (hasSession()) return Promise.resolve();

  const id = Math.random().toString(36).slice(2);
  return new Promise((resolve) => {
    const done = () => { clearTimeout(timer); resolve(); };
    const timer = setTimeout(resolve, WAIT_MS);
    const previous = channel.onmessage;
    channel.onmessage = (e) => {
      if (e.data?.type === "snapshot" && e.data.to === id) {
        try { Object.entries(e.data.snapshot).forEach(([k, v]) => sessionStorage.setItem(k, v)); } catch { /* storage blocked */ }
        channel.onmessage = previous;
        done();
      } else previous(e);
    };
    channel.postMessage({ type: "request", id });
  });
};
