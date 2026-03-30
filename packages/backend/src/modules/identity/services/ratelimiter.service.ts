import pino from "pino";

type AttemptType = {
  attemptCount: number;
  timeOut: NodeJS.Timeout;
};

export default class RateLimiterService {
  private attemptsByUsers: Map<string, AttemptType> = new Map();

  constructor(private windowMs: number, private maxAttempt: number) {}

  checkRateLimit(
    identifier: string,
    logger?: pino.Logger
  ): {
    allowed: boolean;
    remainingAttempts: number;
    resetTime: Date;
  } {
    const now = Date.now();

    let user = this.attemptsByUsers.get(identifier);

    if (!user) {
      const timeOut = setTimeout(() => {
        this.attemptsByUsers.delete(identifier);
        logger?.info({ identifier }, "Rate limit window expired, resetting");
      }, this.windowMs);

      user = { attemptCount: 0, timeOut };
      this.attemptsByUsers.set(identifier, user);

      logger?.info(
        { identifier, windowMs: this.windowMs, maxAttempt: this.maxAttempt },
        "Initialized rate limiter for new identifier"
      );
    }

    user.attemptCount++;
    logger?.debug(
      { identifier, attempt: user.attemptCount },
      "Attempt recorded"
    );

    if (user.attemptCount > this.maxAttempt) {
      logger?.warn(
        { identifier, attempt: user.attemptCount },
        "Rate limit exceeded"
      );

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
