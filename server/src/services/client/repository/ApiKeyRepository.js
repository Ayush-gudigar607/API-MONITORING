import BaseApikeysrepository from "./BaseApikeysRepository";
import ApiKey from "../../../shared/models/Apikey.js";
import logger from "../../../shared/config/logger.js";

class MongoApiRepository extends BaseApikeysrepository{
    constructor()
    {
        super(ApiKey)
    }

    /**
     * @params {object} apikeydata-Api key data
     * @returns {Promise<Object>}
     */

    async create(apikeyData)
    {
        try {
           const apikey=new this.model(apikeyData)
           await apikey.save()
           logger.info("API key created in database",{keyId:apikey.keyId})
           return apikey
        } catch (error) {
            logger.error("Error Creating API Key in database:",error);
            throw error
        }
    }

    /**
     * @param {string} keyvalue-APIKEy value
     * @params {boolean} includeInactive-Include Inactive keys
     * @returns {Promise<Object |null>}
     */

    async findByKeyValue(keyValue,includeInactive=false)
    {
        try {
            const filter={keyValue};
            if(!includeInactive)
            {
                filter.isActive=true
            }

            const apikey=await this.model.findOne(filter).populate('clientId');  //by refering populate clintId i will all details of client in  db
            return apikey
        } catch (error) {
            logger.error("Error finding API key by value:",error);
            throw error;
        }
    }

    /**
     * @params {string} clientid-clientId
     * @params {Object} filters-Additional filters
     * @returns {Promise<Array>}
     */

    async findByClientId(clientId,filters={})
    {
        try{
     const query={clientId,...filters};
//before populate
// {
//   "_id": "123...",
//   "keyName": "Production Key",
//   "createdBy": "60d5ecb..."  // Just an ID
// }

// after populate
// {
//   "_id": "123...",
//   "keyName": "Production Key",
//   "createdBy": {
//     "_id": "60d5ecb...",
//     "username": "jdoe",
//     "email": "jdoe@example.com"
//   }
// }


     const apiKeys=await this.model.find(query).populate("createdBy","username email").sort({createdAt:-1});
     return apiKeys
        }
        catch(err)
        {
logger.error("Error finding Api keys by client id :",err)
throw err
        }
    }

    /**
     * @params {string} clientId-Client ID
     * @params {Object} filters-additional filters
     * @returns {promise<number}
     * 
     */
  async countByClientId(clientId,filters={})
  {
    try {
        const query={clientId,...filters};
        const count=await this.model.countDocuments(query);
        return count
    } catch (error) {
        logger.error("Error counting API keys:",error)
        throw error
    }
  }


}

export default new MongoApiRepository