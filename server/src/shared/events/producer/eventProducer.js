import { EVENT_TYPES } from "../eventContracts.js";
import { isRetryable } from "./RetryStratergy.js";

export class EventProducer {
  constructor({
    channelManager,
    circuitBreaker,
    retryStrategy,
    logger,
    queueName,
  }) {
    if (!channelManager) throw new Error("Channel manager is required");
    if (!circuitBreaker) throw new Error("Circuit breaker is required");
    if (!retryStrategy) throw new Error("Retry strategy is required");
    if (!queueName) throw new Error("Queue name is required");

    this.channelManager = channelManager;
    this.circuitBreaker = circuitBreaker;
    this.retryStrategy = retryStrategy;
    this.logger = logger || console;
    this.queueName = queueName;


    //used for monitoring,debugging and dashboards
    this._metrics = {
      published: 0,
      failed: 0,
      retriesExhausted: 0,
    };

    this._shutDown = false;
  }


  //track system health
  _incrementMetric(metric) {
    this._metrics[metric] = (this._metrics[metric] || 0) + 1;
  }

  async publish(eventData, { correlationId, attempt }) {
    //get the channel
    const channel = await this.channelManager.getChannel();

    const message = {
      type: EVENT_TYPES.API_HIT,
      data: eventData,
      publishedAt: new Date().toISOString(),
      attempt: attempt + 1,
    };
//convert to buffer
    const buffer = Buffer.from(JSON.stringify(message));

    const publishOptions = {
      persistent: true,
      contentType: "application/json",
      messageId: eventData.eventId,
      correlationId: correlationId,
      timestamp: Math.floor(Date.now() / 1000),
    };

    return new Promise((resolve, reject) => {
      const written = channel.publish(
        "",
        this.queueName,
        buffer,
        publishOptions,
        (err) => {
          if (err) {
            return reject(
              new Error(`Published acknowledgement failed: ${err.message}`),
            );
          }
          resolve();
        },
      );
      //Now the queue is full now i have handle the backpressure
      if (!written) {
        this.logger.info(
          `[EventProducer] Backpressure detected, waiting for 'drain' event before publishing more messages.`,
          {
            eventId: eventData.eventId,
            queue: this.queueName,
          },
        );
      }

      const onDrain = () => {
        channel.removeListener("drain", onDrain);
        this.logger.info(
          `[EventProducer] 'drain' event received, resuming message publishing.`,
          {
            eventId: eventData.eventId,
            queue: this.queueName,
          },
        );
      };
      //this will ensure that we only listen for the 'drain' event when we have backpressure and we will remove the listener once we receive the 'drain' event to avoid memory leaks
      channel.once("drain", onDrain);
    });
  }

  async shutDown() {
    this._shutDown = true;
    this.logger.info(
      "EventProducer is shutting down gracefully. No new events will be accepted.",
    );
    await this.channelManager.close();
    this.logger.info(
      "EventProducer shutdown complete. All resources have been released.",
    );
  }

  async getStatus() {
    return {
      metrics: { ...this._metrics },
      circuitBreakerState: this.circuitBreaker.snapshot(),
    };
  }

  async publishApiHit(eventData, opts = {}) {
    if (this._shutDown) {
      const error = new Error(
        "EventProducer is shutting down. Cannot publish new events.",
      );
      
      error.code = "SHUTDOWN_IN_PROGRESS";
      this.logger.warn(`[EventProducer] publish rejected-shutting down`, {
        eventId: eventData.eventId,
        queue: this.queueName,
      });
      throw error;
    }

    if(!this.circuitBreaker.allowRequest())
    {
        this.logger.info(`[EventProducer] Circuit breaker is open. Rejecting publish request.`, {
            eventId: eventData.eventId,
            queue: this.queueName,
            circuitBreakerState:this.circuitBreaker.state
        });
        return false;
    }

    const correlationId=opts.correlationId || `event-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const startMs=Date.now();
    let attempt=0;

    while(true)
    {
        try {
            await this.publish(eventData,{correlationId,attempt});
            const latencyMs=Date.now()-startMs;
            this.circuitBreaker.onsuccess();
            this._incrementMetric('published');
            this.logger.info(`[EventProducer] Event published successfully.`, {
                eventId: eventData.eventId,
                queue: this.queueName,
                correlationId,
                attempt,
                latencyMs
            });
            return true;

        } catch (error) {
            this.logger.error(`[EventProducer] Failed to publish event.`, {
                eventId: eventData.eventId,
                queue: this.queueName,
                correlationId,
                attempt,
                errorMessage: error.message,
                errorStack: error.stack,
                errorCode: error.code,
            });

            const canRetry=isRetryable(error) && this.retryStrategy.shouldRetry(attempt);
            if(!canRetry)
            {
                this.circuitBreaker.onfailure();
                this._incrementMetric('failed');
                
                if(!this.retryStrategy.shouldRetry(attempt)){
                    this._incrementMetric('retriesExhausted');
                }

                throw error;

                this.logger.error(`[EventProducer] Event publish failed and will not be retried.`, {
                    eventId: eventData.eventId,
                    queue: this.queueName,
                    correlationId,
                    attempt,
                    errorMessage: error.message,
                    errorStack: error.stack,
                    errorCode: error.code,
                });
                return false;
            }

            await this.retryStrategy.wait(attempt);
            attempt++;
             this.logger.info(`[EventProducer] Retrying event publish.`, {
                eventId: eventData.eventId,
                queue: this.queueName,
                correlationId,
                attempt,
            });
            
        }
    }
  }
}
