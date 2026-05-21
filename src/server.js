import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import config from './shared/config/index.js';
import logger from './shared/config/logger.js';
import mongodb from './shared/config/mongodb.js';
import postgres from './shared/config/postgres.js';
import rabbitmq from './shared/config/rabbitmq.js';
import errorhandler from './shared/middlewares/errorHandler.js';
import ResponseFormatter from './shared/utils/responceFormator.js';

const app=express();

//middlewares
app.use(helmet());
app.use(cors());
app.use(express.json()); 
app.use(express.urlencoded({extended:true}));

app.use((req, res, next) => {
    logger.info(`${req.method} ${req.path}`, {
        ip: req.ip,
        userAgent: req.headers['user-agent']
    });
    next();
});

//health-check endpoint
app.get('/health', (req, res) => {

    res.status(200).json(ResponseFormatter.success(
        {
            status:"Healthy",
            timestamp:new Date().toISOString(),
            uptime:process.uptime() 
        },
        "service is healthy"
    ))
});



app.get("/",( req,res)=>{
    res.status(200).json(ResponseFormatter.success(
        {
            service:"API Monitoring Service",   
            version:'1.0.0',
            endpoints:[
                {
                    health: "/health",
                    auth: "/api/auth",
                    ingest:"api/hit",
                    analytics:"api/analytics"
                }
            ],
            description: "API HIT MONITORING SERVICE"
        }
    ))
})

app.use((req,res)=>{
  res.status(404).json(ResponseFormatter.error("Endpoints Not Found",404))
})

app.use(errorhandler);


async function initializeConnections()
{
    try{
logger.info("Initializing  database connections...")

//connect to mongodb 
await mongodb.connect();
logger.info("Connected to MongoDB")

//connect to postgres   
await postgres.testConnection();
logger.info("Connected to Postgres")

//connect to rabbitmq
await rabbitmq.connect();
logger.info("Connected to RabbitMQ")

logger.info("All connections initialized successfully. Starting server...") 

    }
    catch(error)
    {
      logger.error("Failed to  initializing connections:",error)
     throw error;
    }
}

async function startServer()
{
    try{
      await initializeConnections();
      const server = app.listen(config.port, () => { 
        logger.info(`server started on port ${config.port}`)
        logger.info(`Environment:${config.node_env}`);
        logger.info(`API available at :http://localhost:${config.port}`)
      });

      const gracefulShutdown = async (signal) => {
        logger.info(`${signal} received. Shutting down gracefully...`);
        server.close(async () => {
            logger.info("HTTP SERVER CLOSED");
            try
            {
                await mongodb.disconnect();
                logger.info("MongoDB connection closed");
               
                await postgres.close();
                logger.info("Postgres connection closed");

                await rabbitmq.close();
                logger.info("RabbitMQ connection closed");

                logger.info("All connection closed ,exiting process")
                process.exit(0);
            }
            catch(error)
            {
                logger.error("Error During ShutDown:",error);
                process.exit(1)
            }

           
        });
         setTimeout(() => {
                logger.error("Forced  shutdown ")
                process.exit(1)
            }, 10000);

           
      };

       process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
            process.on("SIGINT", () => gracefulShutdown("SIGINT"));

            //HANDLE A UNCAUGHT EXCEPTION 
            process.on("uncaughtException", (error) => {    
                logger.error("Uncaught Exception:", error);
                gracefulShutdown("Uncaught Exception");
            });

            //HANDLE UNHANDLED REJECTION
            process.on("unhandledRejection", (reason, promise) => {
                logger.error("Unhandled Rejection at:", promise, "reason:", reason);
                gracefulShutdown("Unhandled Rejection");    
            });


      
    }
    catch(error)
    {
        logger.error("Failed to start server:",error)
        process.exit(1);
    }
}

startServer();
