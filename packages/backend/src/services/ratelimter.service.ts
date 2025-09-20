type AttemptType = {
  attemptCount: number;
  timeOut: NodeJS.Timeout;
};

export default class RateLimiterService {
  private attemptsByUsers: Map<string, AttemptType> = new Map();

  constructor(private windowMs: number, private maxAttempt: number) {}

  checkRateLimit(identifier: string): {
    allowed: boolean;
    remainingAttempts: number;
    resetTime: Date;
  } {
    const now = Date.now();

    let user = this.attemptsByUsers.get(identifier);

    if (!user) {
      const timeOut = setTimeout(() => {
        this.attemptsByUsers.delete(identifier);
      }, this.windowMs);

      user = { attemptCount: 0, timeOut };
      this.attemptsByUsers.set(identifier, user);
    }

    // increment attempts
    user.attemptCount++;

    if (user.attemptCount > this.maxAttempt) {
      return {
        allowed: false,
        remainingAttempts: 0,
        resetTime: new Date(now + this.windowMs),
      };
    }

    return {
      allowed: true,
      remainingAttempts: this.maxAttempt - user.attemptCount,
      resetTime: new Date(now + this.windowMs),
    };
  }
}
