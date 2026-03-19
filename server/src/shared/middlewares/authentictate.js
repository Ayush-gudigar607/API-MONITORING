import ResponseFormatter from "../utils/responceFormator"
import jwt from "jsonwebtoken"

const authentiate=async (req,res,next)=>{
    try {
        let token=null
        if(req.cookies && req.cookies.token){
            token=req.cookies.token
        }

        if(!token)
        {
            return res.status(401).json(ResponseFormatter.error("Authentication token is required",401))
        }

        const decoded=jwt.verify(token,process.env.JWT_SECRET)
        const {userId,email,username,role,clientId}=decoded
        req.user= {userId,email,username,role,clientId}
        next()
    } catch (error) {
        logger.error("Authentication error:",{
            error: error.message,
            path:req.path,
        })

        if(error.name==="TokenExpiredError"){
            return res.status(401).json(ResponseFormatter.error("Authentication token has expired",401))
        }

        return res.status(401).json(ResponseFormatter.error("Invalid authentication token",401))
        
    }
}

export default authentiate