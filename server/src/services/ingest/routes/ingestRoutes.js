 import express from "express"
import ingestContainer from "../Dependencies/dependencies.js"
const {ingestController}=ingestContainer;
import validateApiKey from "../../../shared/middlewares/validateApiKey.js";
import rateLimit from "express-rate-limit";
import config from "../../../shared/config/index.js";

const router=express.Router();

//Rate limit for the ingest to prevent abuse and encure fair usage.The limiter is configured with a window of the time and maximun number of requests allowed with in the window .If the limit is eceeded ,a 429 Too many Requests response is sent back to the client with a message indicating that they have exceeded the allowed number of requests and should try again later.

const ingestLimitter=rateLimit({
    windowMs:config.rateLimit.windowMs,
    max:config.rateLimit.maxRequests,
    message:{
        success:false,
        message:"Too many requests,please try again later",
        statusCode:429
    },
    standardHeaders:true, //to provide transparent, machine-readable information to clients about quota policies
    legacyHeaders:false, //to disable the X-RateLimit-* headers
})

router.post("/", validateApiKey, ingestLimitter, (req, res, next) => ingestController.ingestHit(req, res, next))

export default router;
