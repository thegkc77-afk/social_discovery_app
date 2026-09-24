import { Platform } from 'react-native';

export type MobileScreenName =
  | 'ONBOARDING'
  | 'DISCOVERY'
  | 'PROFILE'
  | 'TALK_NOW'
  | 'CHAT'
  | 'SOCIAL_FEED'
  | 'STORY_VIEWER'
  | 'MEETUP'
  | 'SAFETY_CENTER';

class MobileAnalyticsService {
  private sessionId: string | null = null;
  private platform: string = 'WEB';

  constructor() {
    this.initPlatform();
    this.startSession();
  }

  private initPlatform() {
    try {
      if (Platform.OS === 'ios') {
        this.platform = 'IOS';
      } else if (Platform.OS === 'android') {
        this.platform = 'ANDROID';
      } else {
        this.platform = 'WEB';
      }
    } catch {
      this.platform = 'WEB';
    }
  }

  public getSessionId(): string {
    if (!this.sessionId) {
      this.sessionId = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    }
    return this.sessionId;
  }

  public startSession(): string {
    this.sessionId = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    return this.sessionId;
  }

  public endSession(): void {
    this.sessionId = null;
  }

  public async trackEvent(eventName: string, metadata?: Record<string, any>): Promise<void> {
    // Client-side analytics mock (no network request)
    console.log(`[Analytics] Event tracked: ${eventName}`, metadata || '');
  }

  public async trackScreen(screenName: MobileScreenName, metadata?: Record<string, any>): Promise<void> {
    return this.trackEvent(`SCREEN_VIEW_${screenName}`, {
      screenName,
      ...metadata,
    });
  }
}

export const analytics = new MobileAnalyticsService();
