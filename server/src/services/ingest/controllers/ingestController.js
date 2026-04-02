import logger from "../../../shared/config/logger.js";
import ResponseFormatter from "../../../shared/utils/responceFormator.js";

export class ingestController{
    constructor({ingestservice})
    {
        if(!ingestservice)
        {
            throw new Error("IngestService is required")
        }
        this.ingestservice=ingestservice;
    }

    async ingestHit(req,res,next)
    {
        try {
            logger.info('Ingest:Client data received',{
                clientId:req.client._id,
                clientName:req.client.name,
                clientKeys:Object.keys(req.client)
            })

            const hitData={
                ...req.body,
                clientId:req.client._id,
                apiKeyId:req.apiKey._id,
                ip:req.ip || req.connection.remoteAddress || 'unknown',
                userAgent:req.get('User-Agent') || '',
            }
             logger.info('Ingest: Hit data prepared', {
                clientId: req.client._id,
                endpoint: hitData.endpoint,
                method: hitData.method
            });

            const result=await this.ingestservice.ingestAPiHit(hitData);

            if(result.status==='rejected')
            {
                return res.status(503).json(ResponseFormatter.error('Service temporarily unavailable',503,{
                    eventId:result.eventId,
                    reason:result.reason,
                    retryAfter:'30 seconds'
                }))
            }

            res.status(203).json(ResponseFormatter.success('API hit ingested successfully',201))
        } catch (error) {
            next(error)
        }
    }
}