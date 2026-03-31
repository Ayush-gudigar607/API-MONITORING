const RETRYABLE_PATTERNS = [
  "channel closed",
  "connection closed",
  "ECONNRESET",
  "ECONNREFUSED",
  "ETIMEDOUT",
  "buffer full",
  "heartbeat timeout",
  "not available",
  "server connection closed",
];

export function isRetryable(err) {
  if (!err) {
    return false;
  }

  const message=(err.message || '').toLowerCase();
  const code=(err.code || '').toUpperCase();

  if(code==="ENOTFOUND") return true;

  return RETRYABLE_PATTERNS.some(pattern => message.includes(pattern).toLowerCase() || code.includes(pattern).toUpperCase());
}

export class RetryStrategy {
    constructor(opts={})
    {
       this.maxRetries=opts.maxRetries || 3;
       this.baseDelay=opts.baseDelay || 200;
       this.maxDelay=opts.maxDelay || 5000;
       this.jitterFactor=opts.jitterFactor || 0.3;
    }

    shouldRetry(attempt)
    {
        return attempt< this.maxRetries;
    }

    delay(attempt)
    {
        const exponential=this.baseDelay * Math.pow(2,attempt); //exponential backoff formula
        const capped=Math.min(exponential,this.maxDelay);

        const jitterRange=capped * this.jitterFactor;
        const jitter=(Math.random() -0.5) *2*jitterRange; //random jitter between -jitterRange/2 and +jitterRange/2

        return Math.max(0, Math.round(capped+jitter));

    }

    wait(attempt)
    {
        const ms=this.delay(attempt);
        return new Promise(resolve=>setTimeout(resolve,ms))
    }
}
