//Here Mongo Operation will be defined
import { BaseRepository } from './BaseRepository.js';

export class ApiHitRepository extends BaseRepository {

constructor({model,logger:l}={})
{
    super({logger:l});
    if (!model) throw new Error('ApiHitRepository requires a model');
    this.model = model;
}

async save(eventData)
{
    try {
        const data=new this.model(eventData)
        data.save();

        this.logger.info('API hit saved to database', {
            eventId: eventData.eventId,
        })

        return data;
    } catch (error) {
        if(error && error.code===11000){
            this.logger.warn('Duplicate API hit event detected, skipping save', {
                eventId: eventData.eventId,
            });
            return null; // Skip duplicate entry
        }

        this.logger.error("Error saving API Hits:",error);
        throw error;
    }
}

async find(filter={},options={})
{
    try {
        const {limit=100,skip=0,sort={timestamp:-1}}=options;

        const hits=await this.model.find(filter).sort(sort).skip(skip).limit(limit).lean();

        return hits;

    } catch (error) {
        this.logger.error("Error finding API Hits:",error);
        throw error;
    }
}

 async count(filters = {}) {
        try {
            const count = await this.model.countDocuments(filters);
            return count;
        } catch (error) {
            this.logger.error('Error counting API hits:', error);
            throw error;
        }
    }

      async deleteOldHits(beforeDate) {
        try {
            const result = await this.model.deleteMany({ timestamp: { $lt: beforeDate } });
            this.logger.info('Deleted old API hits', { count: result.deletedCount });
            return result.deletedCount;
        } catch (error) {
            this.logger.error('Error deleting old API hits:', error);
            throw error;
        }
    }
}
