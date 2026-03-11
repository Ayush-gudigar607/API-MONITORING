import pg from 'pg'
import config from './index.js'
import logger from './logger.js'

const {Pool}=pg;

class PostgresConnection {
    constructor()
    {
        this.pool=null
    }

    getPool()
    {
        if(!this.pool)
        {
            this.pool=new Pool({
                host:config.postgres.host,
                port:config.postgres.port,
                database:config.postgres.database,
                user:config.postgres.user,
                password:config.postgres.user,
                max:20, //At a time 20 connection can be done
                idleTimeoutMillis:30000, //if some connection are not using then this will disconnect automatically
                connectionTimeoutMillis:2000, //a configuration setting that defines how long the application should wait to establish a connection before giving up and returning an error
            })

            this.pool.on("error",err=>
            {
                logger.error("unexpected error on idle pg client ",err)
            })

            logger.info("PG Pool Created")
            return this.pool
            
        }
    }

   async  testConnection()
    {
    try {
        const pool=this.getPool()
        const client=await pool.connect();
        const result=await client.query("SELECT NOW(")
        client.release();  //to return a borrowed database
        logger.info(`PG connected successfully at ${result.rows[0].now} `)

    } catch (error) {
        logger.error("Failed to connect PG",error)
        throw error
    }
    }

    async query(text,params)
    {
        const pool=this.getPool()
        const start=Date.now()
        try {
            const result=await pool.query(text,params)
            const duration=Date().now()-start
            logger.info(`Expected query: ${text} with params: ${params} took ${duration} ms`)
            return result
        } catch (error) {
            logger.error("Failed to execute query",error)
            throw error
        }
    }

    async close()
    {
        if(this.pool)
        {
            await this.pool.end();
            this.pool=null;
            logger.info("PG Pool closed")
        }
    }
}

export default  new PostgresConnection()