import winston from "winston"
import config from './index.js'

/**
 * winston logger congiogaration
 * Provides logging
 */
const logger=winston.createLogger({
    level:config.node_env =="production" ? 'info':'debug',
    format:winston.format.combine(
        winston.format.timestamp({format:'YYYY-MM-DD HH:mm:ss'}),
        winston.format.errors({stack:true}),
        winston.format.splat(),
        winston.format.json()
    ),

    defaultMeta:{service:"api-monitoring"},
    transports:[
        new winston.transports.File({filename:'logs/err.log',level:"error"}), //error logs added here
        new winston.transports.File({filename:'logs/combine.log'}) //without error logs are added here 

    ]
})

if(config.node_env !== 'production')
{
    //if not production print in the console if it is error add in red color (colorize) and print it in simple formate like debug:log or error:log
    logger.add(new winston.transports.Console({
        format:winston.combine(
            winston.format.colorize(),
            winston.format.simple()
        )
    }))
}

export default logger