import { WS_URL } from './api';

let socket = null;
// Map<channel, Set<callback>>
const subscribers = new Map();

function connect() {
  if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) return;

  socket = new WebSocket(WS_URL);

  socket.onopen = () => {
    // Re-subscribe all active channels after (re)connect
    for (const channel of subscribers.keys()) {
      socket.send(JSON.stringify({ type: 'subscribe', channel }));
    }
  };

  socket.onmessage = (e) => {
    try {
      const msg = JSON.parse(e.data);
      subscribers.get(msg.channel)?.forEach(cb => cb(msg.data));
    } catch { /* ignore malformed */ }
  };

  socket.onclose = () => setTimeout(connect, 5000);
  socket.onerror = () => socket?.close();
}

/**
 * Subscribe to a server-pushed channel.
 * Returns an unsubscribe function — call it in your useEffect cleanup.
 */
export function subscribe(channel, callback) {
  if (!subscribers.has(channel)) subscribers.set(channel, new Set());
  subscribers.get(channel).add(callback);

  if (!socket || socket.readyState === WebSocket.CLOSED || socket.readyState === WebSocket.CLOSING) {
    connect();
  } else if (socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify({ type: 'subscribe', channel }));
  }
  // If CONNECTING, onopen will subscribe once ready

  return () => {
    const set = subscribers.get(channel);
    if (!set) return;
    set.delete(callback);
    if (set.size === 0) {
      subscribers.delete(channel);
      if (socket?.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: 'unsubscribe', channel }));
      }
    }
  };
}
