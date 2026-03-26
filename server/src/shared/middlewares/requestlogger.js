import logger from "../config/logger.js";

/**
 * Request logger middleware-centralize request logging
 */

const requestlogger=(req,res,next)=>{
    const start=Date.now()
    res.on("finish",()=>
    {
        const duration=Date.now()-start
        logger.info('HTTP %s %s %s %dms',req.method,req.originalUrl || req.url,req.ip || req.socket.remoteAddress,duration,{
            method:req.method,
            path:req.originalUrl || req.url,
            status:res.statusCode,
            duration
        })
    });
    next()
};

export default requestlogger