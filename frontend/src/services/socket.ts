// socket.ts - Socket client adapter supporting both real backend WebSockets & mock offline testing

class SocketClient {
  private listeners: { [event: string]: Function[] } = {};
  private ws: WebSocket | null = null;
  private url: string;
  private isConnected = false;

  constructor(url: string) {
    this.url = url;
    this.initWebSocket();
  }

  private initWebSocket() {
    try {
      // Attempt WebSocket connection to backend if available
      const wsUrl = this.url.replace(/^http/, 'ws');
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        this.isConnected = true;
        console.log('[SocketClient] Connected to backend WebSocket server at:', this.url);
        this.trigger('connect', {});
      };

      this.ws.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          if (parsed.event && parsed.data) {
            this.trigger(parsed.event, parsed.data);
          }
        } catch {
          // non-json raw message
        }
      };

      this.ws.onerror = (err) => {
        console.log('[SocketClient] Live socket connection not active, using local simulated handler');
        this.isConnected = false;
      };

      this.ws.onclose = () => {
        this.isConnected = false;
        this.trigger('disconnect', {});
      };
    } catch {
      this.isConnected = false;
    }
  }

  emit(event: string, data: any) {
    console.log(`[SocketClient] Emit event "${event}" with data:`, data);

    // If live WebSocket is connected, send message
    if (this.isConnected && this.ws && this.ws.readyState === WebSocket.OPEN) {
      try {
        this.ws.send(JSON.stringify({ event, data }));
      } catch (err) {
        console.warn('[SocketClient] Failed to send over websocket, using local simulator');
      }
    }

    // Local simulation fallbacks for smooth interactive testing
    if (event === 'talk_now_join') {
      setTimeout(() => {
        this.trigger('match_found', {
          matchId: 'priya',
          matchedUser: {
            id: 'priya',
            name: 'Priya',
            age: 24,
            avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=200&h=200&q=80',
            distance: '1.6 km away',
            online: true,
            vibes: ['Movies & Shows', 'Music'],
            bio: 'Exploring the city & good vibes ☕'
          }
        });
      }, 3000);
    }

    // Typing start/stop simulation
    if (event === 'typing:start' || event === 'typing_start') {
      this.trigger('typing_status', { chatId: data.chatId, userId: data.userId || 'them', isTyping: true });
    }
    if (event === 'typing:stop' || event === 'typing_stop') {
      this.trigger('typing_status', { chatId: data.chatId, userId: data.userId || 'them', isTyping: false });
    }

    // Read receipt simulation
    if (event === 'message:read' || event === 'message_read') {
      this.trigger('messages_read', { chatId: data.chatId, userId: data.userId || 'them', readAt: new Date().toISOString() });
    }

    // Simulate an automated reply when sending a message
    if (event === 'message_send' || event === 'message:send') {
      setTimeout(() => {
        const replyText = data.isInvite 
          ? 'Count me in! I will see you there 🎉'
          : 'Hey! That sounds super cool. Tell me more! 🙌';

        this.trigger('message_receive', {
          chatId: data.chatId,
          senderId: data.receiverId || 'aanya',
          receiverId: data.senderId || 'me',
          message: JSON.stringify({
            text: replyText,
            isInvite: false
          })
        });
      }, 2000);
    }
  }

  on(event: string, callback: Function) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  off(event: string, callback?: Function) {
    if (!callback) {
      delete this.listeners[event];
    } else if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    }
  }

  trigger(event: string, data: any) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(cb => cb(data));
    }
  }

  disconnect() {
    console.log('[SocketClient] Disconnected from server');
    if (this.ws) {
      try {
        this.ws.close();
      } catch {}
      this.ws = null;
    }
    this.isConnected = false;
  }
}

export const io = (url: string = 'http://localhost:3001') => {
  return new SocketClient(url);
};
