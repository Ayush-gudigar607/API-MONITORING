//here basically has global level of configaration will write here 

import 'dotenv/config'

const config={
    //server
    node_env:process.env.NODE_ENV || 'development',
    //PORT ALWAYS WILL BE INT (TO HANDLE THE ERROR CASE AND THIS WILL BE DECIMAL)
    port:parseInt(process.env.PORT || '5000' ,10),

    //MOGODB
    mongo:{
    uri:process.env.MONGO_URI || 'mongodb://localhost:27017/api_monitoring',
    dbName:process.env.MONGO_DB_NAME || 'api_monitoring'
    },

    //postgressql
    postgres:{
      host:process.env.PG_HOST || 'localhost',
      port:parseInt(process.env.PG_PORT || '5432',10),
      database:process.env.PG_DATABASE || 'api_monitoring',
      user:process.env.PG_USER || 'postgres',
      password:process.env.PG_PASSWORD || 'ayush',
    },

    //rabbitmq
    rabbitmq:{
        url:process.env.RABBITMQ_URL || 'amqp://localhost:5672',
        queue:process.env.RABBITMQ_QUEUE || 'api_hits',
        publisherConfirms:process.env.RABBITMQ_PUBLISHER_CONFIRMS =='true' || false, //MESSAGE_LOST
        retryAttempts:parseInt(process.env.RABBITMQ_RETRY_ATTEMPTS || '3',10),
        retryDelay:parseInt(process.env.RABBITMQ_RETRY_DELAY || '1000',10)
    },

   //jwt
   jwt:{
    secret:process.env.JWT_SECRET || 'SABKA_VALENTINE_WEEK_KAISE_CHAL_RAHA_HAI',
    expiresIn:process.env.JWT_EXPIRES_IN || '24h'
   },

   //rate-limit
   rateLimit:{
    windows:parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000',10), //15 MINUTES
    maxRequets:parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '1000',10) //1000 REQ/15 MIN PER IP 
   },

   cookie:{
    httpOnly:true,
    secure:process.env.NODE_ENV === 'production', //only send cookie over https in production
    expireIn:24 * 60 * 60 * 1000 //1 DAY IN MILLISECOND
   }
}

export default config
