/**
 * WebSocket layer — attached to the same HTTP server as Express (same port 5421).
 * Clients subscribe to named channels; server broadcasts on scoring and room events.
 *
 * Client sends: { type: 'subscribe' | 'unsubscribe', channel: 'global:leaderboard' | 'room:uuid' }
 * Server sends:  { channel: '...', data: <payload> }
 */

const { WebSocketServer } = require('ws');

let wss = null;
// Map<channel, Set<WebSocket>>
const channels = new Map();

function setup(httpServer) {
  wss = new WebSocketServer({ server: httpServer });

  wss.on('connection', (ws) => {
    ws._channels = new Set();

    ws.on('message', (raw) => {
      try {
        const msg = JSON.parse(raw);
        if (msg.type === 'subscribe' && msg.channel) {
          if (!channels.has(msg.channel)) channels.set(msg.channel, new Set());
          channels.get(msg.channel).add(ws);
          ws._channels.add(msg.channel);
        } else if (msg.type === 'unsubscribe' && msg.channel) {
          channels.get(msg.channel)?.delete(ws);
          ws._channels.delete(msg.channel);
        }
      } catch { /* ignore malformed messages */ }
    });

    ws.on('close', () => {
      for (const ch of ws._channels) {
        channels.get(ch)?.delete(ws);
        if (channels.get(ch)?.size === 0) channels.delete(ch);
      }
    });

    ws.on('error', () => ws.terminate());
  });

  console.log('[wc-game] WebSocket server attached');
}

function broadcast(channel, data) {
  if (!wss) return;
  const subs = channels.get(channel);
  if (!subs || subs.size === 0) return;
  const msg = JSON.stringify({ channel, data });
  for (const ws of subs) {
    if (ws.readyState === 1 /* OPEN */) {
      ws.send(msg, (err) => { if (err) ws.terminate(); });
    }
  }
}

module.exports = { setup, broadcast };
