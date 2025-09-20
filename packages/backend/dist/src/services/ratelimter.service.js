export default class RateLimiterService {
    windowMs;
    maxAttempt;
    attemptsByUsers = new Map();
    constructor(windowMs, maxAttempt) {
        this.windowMs = windowMs;
        this.maxAttempt = maxAttempt;
    }
    checkRateLimit(identifier) {
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
