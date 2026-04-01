//this will be factory method

import config from "../../config/index.js";
import logger from "../../config/logger.js";
import rabbitmq from "../../config/rabbitmq.js";

import { CircuitBreaker } from "./circuitBracker.js";
import { ConformChannelManager } from "./ConformChannelManager.js";
import { EventProducer } from "./eventProducer.js";
import { RetryStrategy } from "./RetryStratergy.js";

export function createEventProducer(overrides={})
{
    const log=overrides.logger || logger;
    const rmq=overrides.rabbitmq || rabbitmq;
    const queueName= overrides.queueName || config.events.queueName;

    //validate critical dependencies
    if(!rmq) throw new Error ("RabbitMQ instance is required to create EventProducer");
    if(!queueName) throw new Error("Queue name is required to create EventProducer");

    if(!config.rabbitmq.retryAttempts || config.rabbitmq.retryAttempts<0)
    {
        throw new Error("Invalid retry attempts configuration for RabbitMQ");       

    }

    const channelManager=  overrides.channelManager  || new ConformChannelManager({rabbitmq:rmq,logger:log});
    
    const circuitBreaker= overrides.circuitBreaker || new CircuitBreaker({
        failureThreshold:config.events.circuitBreaker.failureThreshold || 5,
        cooldownMs:config.events.circuitBreaker.cooldownMs || 30000,
        halfOpenMaxAttempts:config.events.circuitBreaker.halfOpenMaxAttempts  || 2,
        logger:log
    });

    const retryStrategy=overrides.retryStrategy || new RetryStrategy({
        maxRetries:config.rabbitmq.retryAttempts || 3,
        baseDelay:config.rabbitmq.retryBaseDelay || 200,
        maxDelay:config.rabbitmq.retryMaxDelay || 5000,
        jitterFactor:config.rabbitmq.retryJitterFactor || 0.3
    });

    return new EventProducer({
        channelManager,
        circuitBreaker,
        retryStrategy,
        logger:log,
        queueName
    })




}