import logger from "../../../shared/config/logger.js";

export class ProcessorService {
    constructor({apiRepository,metricsRepository})
    {
   if(!apiRepository) throw new Error('ProcessorService requires apiRepository');
   if(!metricsRepository) throw new Error('ProcessorService requires metricsRepository');
    this.apiRepository=apiRepository;
    this.metricsRepository=metricsRepository;
    }

    getTimeBucket(timestamp,interval='hour')
    {
        const date=new Date(timestamp);
        switch(interval)
        {
            case 'hour':
                date.setMinutes(0,0,0);
                break;
            case 'day':
                date.setHours(0,0,0,0);
                break;
            case 'minute':
                date.setSeconds(0,0);
                break;
            default:
                date.setMinutes(0,0,0);

        }
        return date;
    }

    async processEvent(eventData)
    { //this is mainly help for eventual consistency
        let rawEventSaved=true;
        try {
            logger.info("Processing event data:",{
                eventId:eventData.eventId,
                clientId:eventData.clientId,
                serviceName:eventData.serviceName,
                endpoint:eventData.endpoint,
                method:eventData.method,
            })
            //step 1:Save the data to MongoDB
            //yeh succeed hoga ya fir pura operation fail hoga

            await this.apiRepository.save(eventData);
            rawEventSaved=true;

            //step 2:Update the metrics in Postgres
            //Agar ye fail ho gaya to pure operatio ko fail karenge

            await this._updateMetricsWithFallback(eventData);

            logger.info("Event data processed successfully",{
                eventId:eventData.eventId
            });

        } catch (error) {
            if(!rawEventSaved)
            {
                logger.error("Critical:Failed to save raw event to Mongodb",{
                    error:error.message,
                    eventId:eventData.eventId
                })
                throw error;
            }

   logger.error('Non-critical: Raw event saved but metrics update failed:', {
                error: error.message,
                eventId: eventData.eventId,
            });        }

    }

    async _updateMetricsWithFallback(eventData)
    {
        try {
            //Calculate time bucket
        const timeBucket=this.getTimeBucket(eventData.timestamp,"hour")

         // data prep. karege
            const metricsData = {
                clientId: eventData.clientId.toString(),
                serviceName: eventData.serviceName,
                endpoint: eventData.endpoint,
                method: eventData.method,
                totalHits: 1,
                errorHits: eventData.statusCode >= 400 ? 1 : 0,
                avgLatency: eventData.latencyMs,
                minLatency: eventData.latencyMs,
                maxLatency: eventData.latencyMs,
                timeBucket,
            };

            await this.metricsRepository.upsertEndpointMetrics(metricsData);

            logger.info("Metrics updated successfully for event",{
                eventId:eventData.eventId});
        } catch (error) {
            throw error;
        }

    }

    async cleanOldEvents(daysToKeep=30)
    {
        try {
            const cutoffDate=new Date();
            cutoffDate.setDate(cutoffDate.getDate()-daysToKeep);

            const deletedCount=await this.apiHitRepository.deleteOldHits(cutoffDate);
            return deletedCount;
        } catch (error) {
            logger.error("Error during cleanup:",error);
            throw error;
        }
    }
}