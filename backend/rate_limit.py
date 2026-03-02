import time
from collections import defaultdict


class RateLimiter:
    """Simple in-memory rate limiter using sliding window."""

    def __init__(self, max_attempts: int, window_seconds: int):
        self.max_attempts = max_attempts
        self.window_seconds = window_seconds
        self._attempts: dict[str, list[float]] = defaultdict(list)

    def is_limited(self, key: str) -> bool:
        now = time.monotonic()
        window_start = now - self.window_seconds

        # Clean expired entries
        self._attempts[key] = [t for t in self._attempts[key] if t > window_start]

        if len(self._attempts[key]) >= self.max_attempts:
            return True

        self._attempts[key].append(now)
        return False

    def remaining(self, key: str) -> int:
        now = time.monotonic()
        window_start = now - self.window_seconds
        recent = [t for t in self._attempts[key] if t > window_start]
        return max(0, self.max_attempts - len(recent))


# 5 attempts per 15 minutes for activation codes
activation_limiter = RateLimiter(max_attempts=5, window_seconds=900)
