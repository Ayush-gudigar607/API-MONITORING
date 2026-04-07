export const CircuitState = Object.freeze({
    CLOSED: "CLOSED",
    OPEN: "OPEN",
    HALF_OPEN: "HALF_OPEN"
});

export class CircuitBreaker {
    constructor(opts = {}) {
        this.failureThreshold     = opts.failureThreshold    || 5;
        this.cooldownMs           = opts.cooldownMs          || 30000;
        this.halfOpenMaxAttempts  = opts.halfOpenMaxAttempts || 2;
        this.logger               = opts.logger              || console;

        this._state               = CircuitState.CLOSED;
        this._failures            = 0;
        this._halfOpenAttempts    = 0;
        this._halfOpenSuccesses   = 0;
        this._lastFailureTime     = 0;  // ✅ consistent name with underscore
    }

    _cooldownElapsed() {
        return Date.now() - this._lastFailureTime > this.cooldownMs; // ✅ fixed name
    }

    _transitionTo(newState) {
        const prev = this._state;
        this._state = newState;

        if (newState === CircuitState.OPEN) {
            this._halfOpenAttempts  = 0;  // ✅ fixed property name
            this._halfOpenSuccesses = 0;
            this.logger.info(`[CircuitBreaker] ${prev} => OPEN`); // ✅ fixed log msg
        } else if (newState === CircuitState.HALF_OPEN) {
            this._halfOpenAttempts  = 0;
            this._halfOpenSuccesses = 0;
            this.logger.info(`[CircuitBreaker] ${prev} => HALF_OPEN`);
        }
    }

    _openCircuit() {
        this._lastFailureTime = Date.now(); // ✅ consistent name
        this._transitionTo(CircuitState.OPEN);
        this.logger.error(`[CircuitBreaker] OPEN`, {
            failures:    this._failures,
            cooldownMs:  this.cooldownMs
        });
    }

    _reset() {
        this._state             = CircuitState.CLOSED;
        this._failures          = 0;
        this._halfOpenAttempts  = 0;
        this._halfOpenSuccesses = 0;
    }

    get state() {
        if (this._state === CircuitState.OPEN && this._cooldownElapsed()) {
            this._transitionTo(CircuitState.HALF_OPEN);
        }
        return this._state;
    }

    allowRequest() {
        const currentState = this.state;

        if (currentState === CircuitState.CLOSED) return true;

        if (currentState === CircuitState.HALF_OPEN) {
            // ✅ Check-then-increment is still a race condition in async code,
            //    but this is the best you can do in single-threaded JS
            if (this._halfOpenAttempts < this.halfOpenMaxAttempts) {
                this._halfOpenAttempts++;
                return true;
            }
            return false;
        }

        return false;
    }

    onSuccess() {
        if (this._state === CircuitState.HALF_OPEN) {
            this._halfOpenSuccesses++; // ✅ fixed name
            if (this._halfOpenSuccesses >= this.halfOpenMaxAttempts) {
                this._reset();
                this.logger.info(`[CircuitBreaker] CLOSED after half-open successes`);
            }
            return;
        }

        if (this._failures > 0) {
            this._failures = 0;
            this.logger.info(`[CircuitBreaker] failure counter reset after success`);
        }
    }

    onFailure() {
        if (this._state === CircuitState.HALF_OPEN) {
            this.logger.warn(`[CircuitBreaker] failure in HALF_OPEN, reopening`);
            this._openCircuit();
            return;
        }

        this._failures++;
        this._lastFailureTime = Date.now(); // ✅ update on every failure

        if (this._failures >= this.failureThreshold) {
            this._openCircuit();
        }
    }

    snapshot() {
        return {
            state:              this._state,
            failures:           this._failures,
            lastFailureTime:    this._lastFailureTime, // ✅ fixed name
            halfOpenAttempts:   this._halfOpenAttempts,
            halfOpenSuccesses:  this._halfOpenSuccesses,
            cooldownMs:         this.cooldownMs,
            failureThreshold:   this.failureThreshold
        };
    }
}