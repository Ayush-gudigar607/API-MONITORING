//This is the backbone of the processor service where all the database operations will be defined. This will be used by the consumer to perform database operations.


export class BaseRepository {
    constructor({logger:l=console}={}) {
        this.logger = l;
    }

    //Implementations should override this method to perform database operations
    async save()
    {
        throw new Error('save method not implemented');
    }

    async find()
    {
        throw new Error('find method not implemented');
    }

    async count()
    {
        throw new Error('count method not implemented');
    }

    async deleteOldHits()
    {
        throw new Error('deleteOldHits method not implemented');
    }
}
