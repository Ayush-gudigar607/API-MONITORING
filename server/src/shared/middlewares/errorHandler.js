import logger from "../config/logger.js"
import ResponceFormatter from '../utils/responceFormator.js'

const errorhandler=(err,req,res,next)=>
{
 let statusCode=err.statusCode || req.statusCode ||  500;
 let message=err.message ||"Internal server Error"
 let errors=err.errors || null

 logger.error("Error occured:",
    {
        message:err.message,
        statusCode,
        stack:err.stack,
        path:req.path,
        method:req.method
    }
 );

 if(err instanceof SyntaxError && err.status === 400 && "body" in err)
 {
    statusCode=400;
    message="Invalid JSON body";
 }
 else if(err.name ==="ValidationError")
 {
    statusCode=400;
    message="Validation Error"
    errors=Object.values(err.errors).map((e) => e.message) || null  

 }

 else if(err.name ==="MongoServerError" && err.code === 11000)
    {
statusCode=409
message="Duplicate Key Error"   
    }
    else if(err.name ==="JsonWebTokenError")
    {
        statusCode=401  
        message="Invalid Token"
    }
    else if(err.name ==="TokenExpiredError")
    {
        statusCode=401  
        message="Token Expired"
    };

    res.status(statusCode).json(ResponceFormatter.error(message,statusCode,errors)
    )

 
}

export default errorhandler
