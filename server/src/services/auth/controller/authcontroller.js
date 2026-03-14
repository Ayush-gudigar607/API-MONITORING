import { config } from "winston";
import { APPLICATION_ROLES } from "../../../shared/constants/role"
import ResponseFormatter from "../../../shared/utils/responceFormator";

export class AuthController{
    constructor(authService)
    {
   if (!authService)
   {
    throw new Error("userService is required")
   }

   this.authService=authService
    };

    async onboardSuperAdmin(req,res,next)   
    {
        try {
            const {username,email,password}=req.body

            const superAdminData={
                username,
                email,
                password,
                role: APPLICATION_ROLES.SUPER_ADMIN
            };

            const {token, user} = await this.authService.onboardSuperAdmin(superAdminData);
                 
            res.cookie("autToken", token,{
                httpOnly:config.cookie.httpOnly,
                secure:config.cookie.secure,
                maxAge:config.cookie.expireIn

            });

            res.status(201).json(ResponseFormatter.success(user,"super admin created successfully",201))
            

        } catch (error) {
            next(error)
        }
    } 
}