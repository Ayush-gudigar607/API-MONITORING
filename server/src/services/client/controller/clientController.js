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
            return res.status(201).json(ResponceFormatter.success("client created successfully"))

        } catch (error) {
            next(error)
        }
    }
}