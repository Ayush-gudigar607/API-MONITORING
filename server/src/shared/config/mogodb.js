import mongoose from "mongoose";
import config from './index.js'
import logger from "./logger.js";


/**
 * Mongodb connection simple
 */

class MongoConnection{
    constructor()
    {
        this.connection=null
    }

    /**
     * Connection to Mongodb
     * @returns {Promise<mongoose.connection}
     */
    async connect()
    {
        try {
            if(this.connection)
            {
                logger.info("Mongodb Already connected")
                //help to reduce the multiple connection setup
                return this.connection
            }
            await mongoose.connect(config.mongo.uri,{
                dbName:config.mongo.dbName
            })

            logger.info(`MongoDB is connected:${config.mongo.uri} `)

            this.connection.on("error",err=>
            {
                logger.error("MongoDB connection Error",err)
            })

            this.connection.on("disconnected",()=>
            {
                     logger.error("Mongodb Disconnected")
            })

            return this.connection
            
        } catch (error) {
            logger.error("failed to connect Mongodb",error)
            throw error
        }
    }

    /**
     * this help to disconnect the mongodb
     */
    async disconnect()
    {
        try {
            if(this.connection)
            {
                await mongoose.disconnect();
                this.connection=null;
                logger.info("Mongodb disconnected successfully")
            }
        } catch (error) {
            logger.error("Failed to disconnect to Mongodb",error)
            throw error
        }
    }

    /**
     * This returns the active connection
     * @returns 
     */
    getconnection()
    {
      return  this.connection;
    }
}

