import logger from "../../../shared/config/logger.js";
import AppError from "../../../shared/utils/AppError.js";
import {v4 as uuidv4} from "uuid";

export class ingestservice{
    constructor({eventProducer})
    {
        if(!eventProducer)
        {
            throw new Error("EventProducer is required")
        }
        this.eventProducer=eventProducer;
    }

    async ingestAPiHit(hitData)
    {
        try {
            this.validateHitData(hitData)

            const event={
                eventId:uuidv4(),
                timestamp:new Date(),
                serverName:hitData.serverName,
                endpoint:hitData.endpoint,
                method:hitData.method.toUpperCase(),
                statusCode:parseFloat(hitData.statusCode),
                latencyMs:parseFloat(hitData.latencyMs),
                clientId:hitData.clientId,
                apiKeyId:hitData.apiKeyId,
                ip:hitData.ip || 'unknown',
                userAgent:hitData.userAgent || '',
            }

            const published=await this.eventProducer.publishApihit(event);
            if(!published)            {
                logger.error("Failed to publish API hit event", {
                    eventId: event.eventId,
                    endpoint: event.endpoint,
                    method: event.method,
                    clientId: event.clientId,
                    apiKeyId: event.apiKeyId,
                });

                return {
                    eventId: event.eventId,
                    status:'rejected',
                    reson:'service_unavailable',
                    timestamp: new Date(),
                }
            }

            logger.info("API hit ingested",{
                eventId: event.eventId,
                endpoint: event.endpoint,
                method: event.method,
                statusCode: event.statusCode,
                clientId: event.clientId,
            })

            return {
                eventId: event.eventId,
                status: 'queued',
                timestamp: event.timestamp,
            };

            
        } catch (error) {
            logger.error("Error occurred while validating hit data", { error });
            throw new AppError("Invalid hit data", 400);
        }
    }

    validateHitData(hitData)
    {
        const requiredFields=[
            "serviceName",
            "endpoint",
            "method",
            "statusCode",
            "latencyMs",
            "clientId",
        ];

        const missiongFields=requiredFields.filter((field)=>!hitData[field]);

        if(missiongFields.length>0)
            {
                throw new AppError(`Missing required fields: ${missiongFields.join(", ")}`, 400);
            };

            const validMethods=["GET","POST","PUT","DELETE","PATCH","OPTIONS","HEAD"];

            if(!validMethods.includes(hitData.method.toUpperCase()))
            {
                throw new AppError(`Invalid HTTP method: ${hitData.method}. Must be one of ${validMethods.join(", ")}`, 400);
            }

            const statusCode=parseInt(hitData.statusCode,10);
            if(isNaN(statusCode) || statusCode<100 || statusCode>599)
            {
                throw new AppError(`Invalid status code: ${hitData.statusCode}. Must be a number between 100 and 599`, 400);
            }

            const latencyMs=parseFloat(hitData.latencyMs);
            if(isNaN(latencyMs) || latencyMs<0)
            {
                throw new AppError(`Invalid latency: ${hitData.latencyMs}. Must be a non-negative number`, 400);
            }

        
    }
}