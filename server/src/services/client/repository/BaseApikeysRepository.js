export default class BaseApikeysrepository{
    constructor(model)
    {
        this.model=model
    };

    async create(apiKeyData)
    {
        throw new Error("Method not implemented")
    }

    async findByKeyValue(keyvalue,includeInactive)
    {
        throw new Error("method not implemented")
    }

    async findByClientId(clientId,filters)
    {
        throw new Error("Method not implemented")
    }

    async countByClientId(clientId,filters)
    {
        throw new Error("Method is not Implemented")
    }
}