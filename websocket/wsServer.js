
const activeWebSockets = new Map();
module.exports.activeWebSockets = activeWebSockets;


const WebSocket = require('ws');
const url = require('url');
const orderEvents = require('../events/orderEvents');

const orderSubscriptions = new Map();

function initWebSocketServer(server) {
  const wss = new WebSocket.Server({ server, path: '/ws' });

  console.log('✅ WebSocket server initialized on /ws');

  wss.on('connection', (ws, req) => {
    
    const parsed = url.parse(req.url, true);
    const { orderId } = parsed.query;

    if (!orderId) {
      ws.send(
        JSON.stringify({
          type: 'error',
          message: 'orderId query param is required, e.g. /ws?orderId=abc123'
        })
      );
      ws.close();
      return;
    }

    console.log(`🔗 WebSocket client connected for orderId=${orderId}`);

    
    activeWebSockets.set(orderId, true);

    
    if (!orderSubscriptions.has(orderId)) {
      orderSubscriptions.set(orderId, new Set());
    }
    const set = orderSubscriptions.get(orderId);
    set.add(ws);

    
    ws.send(
      JSON.stringify({
        type: 'info',
        message: `Subscribed to orderId=${orderId}`
      })
    );

    
    ws.on('close', () => {
      console.log(`WebSocket client disconnected for orderId=${orderId}`);

      
      activeWebSockets.delete(orderId);

      const subs = orderSubscriptions.get(orderId);
      if (subs) {
        subs.delete(ws);
        if (subs.size === 0) {
          orderSubscriptions.delete(orderId);
        }
      }
    });

    ws.on('message', (msg) => {
      console.log(`📨 Message from WS client [${orderId}]:`, msg.toString());
    });
  });

  
  orderEvents.on('status', ({ orderId, status, details }) => {
    console.log("📡 WS BROADCAST:", orderId, status);

    const subs = orderSubscriptions.get(orderId);
    if (!subs || subs.size === 0) return;

    const payload = JSON.stringify({
      type: 'status',
      orderId,
      status,
      details,
      timestamp: new Date().toISOString()
    });

    for (const ws of subs) {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(payload);
      }
    }
  });
}

module.exports = {
  initWebSocketServer,
  activeWebSockets
};
