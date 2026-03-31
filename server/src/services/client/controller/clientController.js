import ResponceFormatter from "../../../shared/utils/responceFormator.js"

export class clientController{
    constructor(clientService,authService)
    {
        if(!clientService)
        {
          throw new Error("ClientService is required")
        }
        if(!authService)
        {
             throw new Error("authservice is required")
        }

        this.clientService=clientService
        this.authService=authService
    }

    async createClient(req,res,next)
    {
        try {
            const isSuperAdmin=await this.authService.checkSuperAdminPermissions(req.user.userId)
            if(!isSuperAdmin)
            {
              return res.status(403).json(ResponceFormatter.error("Access denied",403))

            }

            const client=await this.clientService.createClient(req.body,req.user)
            return res.status(201).json(ResponceFormatter.success("client created successfully",client))

        } catch (error) {
            next(error)
        }
    }

    async createClientUser(req,res,next)
    {
        try {
            const {clientId}=req.params
            const user=await this.clientService.createClientUser(clientId,req.body,req.user)
            return res.status(201).json(ResponceFormatter.success("Client user created successfully",201,user))
        } catch (error) {
            next(error)
        }
    }

    async createApiKey(req,res,next)
    {
        try {
            const {clientId}=req.params
            const apiKey=await this.clientService.createApiKey(clientId,req.body,req.user)
            return res.status(201).json(ResponceFormatter.success("API key created successfully",201,apiKey))
        } catch (error) {
            next(error)
        }
    }

    async getApiKeys(req,res,next)
    {
        try {
            const {clientId}=req.params
            const apiKeys=await this.clientService.getApiKeys(clientId,req.user)
            return res.status(200).json(ResponceFormatter.success("API keys retrieved successfully",200,apiKeys))
        } catch (error) {
            next(error)
        }
    }
}