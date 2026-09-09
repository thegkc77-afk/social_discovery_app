// socket.ts stub - Mock Socket.io implementation

class MockSocket {
  private listeners: { [event: string]: Function[] } = {};

  emit(event: string, data: any) {
    console.log(`[MockSocket] Emit event "${event}" with data:`, data);
    
    // Simulate automated match triggers when joining the Talk Now pool
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

    // Simulate a reply after sending a message
    if (event === 'message_send') {
      setTimeout(() => {
        this.trigger('message_receive', {
          senderId: data.receiverId,
          receiverId: 'me',
          message: JSON.stringify({
            text: 'Hey! That sounds super cool. Tell me more! 🙌',
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
    console.log('[MockSocket] Disconnected from server');
  }
}

export const io = (url: string) => {
  console.log('[MockSocket] Initializing connection to:', url);
  return new MockSocket();
};
