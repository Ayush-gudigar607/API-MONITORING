class ResponceFormator
{
    static success(data,message="success",statusCode=200)
    {
        return {
            success:true,
            message,
            data,
            statusCode,
            timestamp:new Date.now().toISOString()
        }
    }
    
    static error(message="error",statusCode=500,error=null)
    {
        return {
            success:false,
            message,
            error,
            statusCode,
            timestamp:new Date.now().toISOString()
        }
    }

    static validationError(error=null)
    {
        return {
            success:false,
            message:"validation failed",
            error,
            statusCode:400,  
            timestamp:new Date.now().toISOString()          
        }
    }

    
    static paginated(data=null,page,limit,total)
    {
        return {
            success:true,
            data,
            pagination:{
                page,
                limit,
                total,
                totalPages:Math.ceil(total/limit)
            },
            timestamp:new Date.now().toISOString()         
        }
    }



}

export default ResponceFormator