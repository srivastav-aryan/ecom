export default class RateLimiterService {
    windowMs;
    maxAttempt;
    attemptsByUsers = new Map();
    constructor(windowMs, maxAttempt) {
        this.windowMs = windowMs;
        this.maxAttempt = maxAttempt;
    }
    checkRateLimit(identifier, logger) {
        const now = Date.now();
        let user = this.attemptsByUsers.get(identifier);
        if (!user) {
            const timeOut = setTimeout(() => {
                this.attemptsByUsers.delete(identifier);
                logger?.info({ identifier }, "Rate limit window expired, resetting");
            }, this.windowMs);
            user = { attemptCount: 0, timeOut };
            this.attemptsByUsers.set(identifier, user);
            logger?.info({ identifier, windowMs: this.windowMs, maxAttempt: this.maxAttempt }, "Initialized rate limiter for new identifier");
        }
        user.attemptCount++;
        logger?.debug({ identifier, attempt: user.attemptCount }, "Attempt recorded");
        if (user.attemptCount > this.maxAttempt) {
            logger?.warn({ identifier, attempt: user.attemptCount }, "Rate limit exceeded");
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
