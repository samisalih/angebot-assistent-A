
import { IRateLimiter } from '@/domain/ChatDomain';

export class ClientRateLimiter implements IRateLimiter {
  private static readonly WINDOW_MS = 60000; // 1 minute
  private static readonly MAX_REQUESTS = 10;
  private static readonly STORAGE_KEY = 'chat_requests';

  checkLimit(): { allowed: boolean; error?: string } {
    const now = Date.now();
    const requests = JSON.parse(localStorage.getItem(ClientRateLimiter.STORAGE_KEY) || '[]');
    const recentRequests = requests.filter((timestamp: number) => 
      now - timestamp < ClientRateLimiter.WINDOW_MS
    );
    
    if (recentRequests.length >= ClientRateLimiter.MAX_REQUESTS) {
      return { 
        allowed: false, 
        error: 'Zu viele Anfragen. Bitte warten Sie einen Moment.' 
      };
    }

    // Store the current request
    recentRequests.push(now);
    localStorage.setItem(ClientRateLimiter.STORAGE_KEY, JSON.stringify(recentRequests));
    
    return { allowed: true };
  }
}
